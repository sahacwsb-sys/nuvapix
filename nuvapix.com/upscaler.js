// =====================================================
//  ENJIN UPSCALE
//  1) AI  — Real-ESRGAN (realesr-general-x4v3) melalui ONNX Runtime Web.
//           Berjalan dalam browser pengguna (WebGPU jika ada, jika tidak WASM).
//  2) Pantas — pembesaran berperingkat + unsharp mask (tanpa AI, serta-merta).
// =====================================================
(function () {
  const MAX_PIXELS = 40_000_000;
  const BAND = 96;
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const L = (k, v) => (window.I18N ? window.I18N.t(k, v) : k);

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }
  function toCanvas(img) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const c = makeCanvas(w, h);
    c.getContext("2d").drawImage(img, 0, 0);
    return c;
  }
  // Kecilkan/besarkan dengan kualiti tinggi (separuh demi separuh bila mengecil)
  function resize(src, w, h) {
    let cur = src;
    while (cur.width / 2 >= w && cur.height / 2 >= h) {
      const n = makeCanvas(Math.round(cur.width / 2), Math.round(cur.height / 2));
      const c = n.getContext("2d"); c.imageSmoothingQuality = "high"; c.drawImage(cur, 0, 0, n.width, n.height);
      cur = n;
    }
    const out = makeCanvas(w, h);
    const c = out.getContext("2d"); c.imageSmoothingQuality = "high"; c.drawImage(cur, 0, 0, w, h);
    return out;
  }

  function targetSize(w, h, scale, maxSide) {
    let s = scale;
    if (w * s > maxSide || h * s > maxSide) s = Math.min(maxSide / w, maxSide / h);
    if (w * s * h * s > MAX_PIXELS) s = Math.sqrt(MAX_PIXELS / (w * h));
    s = Math.max(1, s);
    return { w: Math.round(w * s), h: Math.round(h * s), scale: s };
  }

  // =================== ENJIN PANTAS ===================
  async function sharpen(src, amount, threshold, onBand) {
    const w = src.width, h = src.height;
    const sctx = src.getContext("2d", { willReadFrequently: true });
    const dst = makeCanvas(w, h);
    const dctx = dst.getContext("2d");
    for (let y0 = 0; y0 < h; y0 += BAND) {
      const rows = Math.min(BAND, h - y0);
      const top = Math.max(0, y0 - 1), bot = Math.min(h, y0 + rows + 1);
      const inp = sctx.getImageData(0, top, w, bot - top).data;
      const out = dctx.createImageData(w, rows);
      const o = out.data, stride = w * 4;
      for (let y = 0; y < rows; y++) {
        const gy = y0 + y, ry = gy - top;
        const up = (gy > 0 ? ry - 1 : ry) * stride, mid = ry * stride, dn = (gy < h - 1 ? ry + 1 : ry) * stride;
        const orow = y * stride;
        for (let x = 0; x < w; x++) {
          const xl = (x > 0 ? x - 1 : x) * 4, xc = x * 4, xr = (x < w - 1 ? x + 1 : x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = inp[mid + xc + c];
            const blur = (inp[up + xl + c] + 2 * inp[up + xc + c] + inp[up + xr + c] +
              2 * inp[mid + xl + c] + 4 * center + 2 * inp[mid + xr + c] +
              inp[dn + xl + c] + 2 * inp[dn + xc + c] + inp[dn + xr + c]) / 16;
            const diff = center - blur;
            o[orow + xc + c] = Math.abs(diff) < threshold ? center - diff * 0.35 : center + diff * amount;
          }
          o[orow + xc + 3] = inp[mid + xc + 3];
        }
      }
      dctx.putImageData(out, 0, y0);
      onBand && onBand((y0 + rows) / h);
      await tick();
    }
    return dst;
  }

  async function upscaleClassic(img, { scale, strength = 55, maxSide, onProgress = () => {} }) {
    const src = toCanvas(img);
    const t = targetSize(src.width, src.height, scale, maxSide);
    const steps = [];
    let cw = src.width, ch = src.height;
    while (cw < t.w || ch < t.h) {
      const nw = Math.min(t.w, cw * 2), nh = Math.min(t.h, ch * 2);
      steps.push([nw, nh]); cw = nw; ch = nh;
    }
    if (!steps.length) steps.push([cw, ch]);
    const perStep = (0.25 + (strength / 100) * 1.35) / steps.length;
    const threshold = 3 + (strength / 100) * 2;
    let cur = src;
    for (let i = 0; i < steps.length; i++) {
      const [nw, nh] = steps[i], base = i / steps.length, span = 1 / steps.length;
      onProgress(base, L("up.enlarge", { i: i + 1, n: steps.length }));
      await tick();
      const next = makeCanvas(nw, nh);
      const ctx = next.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(cur, 0, 0, nw, nh);
      cur = await sharpen(next, perStep, threshold, (p) => onProgress(base + span * (0.1 + 0.9 * p), L("up.sharpen")));
    }
    onProgress(1, L("up.done"));
    return cur;
  }

  // =================== ENJIN AI (Real-ESRGAN) ===================
  const AI = { session: null, loading: null, backend: null, scale: 4 };

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (window.ort) return res();
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      s.onload = res; s.onerror = () => rej(new Error("Gagal memuat ONNX Runtime"));
      document.head.appendChild(s);
    });
  }

  // Muat turun model dengan peratus kemajuan + simpan dalam cache browser
  async function fetchModel(url, onProgress, sizeHint = 4_900_000) {
    let cache = null;
    try { cache = await caches.open("upscale-ai-models-v1"); const hit = await cache.match(url); if (hit) { onProgress(1); return new Uint8Array(await hit.arrayBuffer()); } } catch { cache = null; }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal muat turun model AI");
    const total = Number(res.headers.get("content-length")) || sizeHint;
    const reader = res.body.getReader();
    const chunks = []; let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); got += value.length;
      onProgress(Math.min(1, got / total));
    }
    let buf = new Uint8Array(got); let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.length; }
    // Fail ".b64.txt" = model yang disimpan sebagai teks base64 (untuk hos yang hanya terima fail teks)
    if (/\.b64\.txt(\?|$)/.test(url)) {
      const bin = atob(new TextDecoder().decode(buf).replace(/\s+/g, ""));
      buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    }
    try { cache && (await cache.put(url, new Response(buf.slice(), { headers: { "content-type": "application/octet-stream" } }))); } catch {}
    return buf;
  }

  // Cuba GPU (WebGPU) dahulu, jika gagal guna CPU (WASM).
  // Nota: WebGPU perlu susun atur NCHW untuk model ini (layout NHWC gagal pada nod Clip).
  async function createSession(order) {
    const ort = window.ort;
    let lastErr;
    for (const name of order) {
      try {
        const ep = name === "webgpu" ? { name: "webgpu", preferredLayout: "NCHW" } : "wasm";
        AI.session = await ort.InferenceSession.create(AI.model, { executionProviders: [ep], graphOptimizationLevel: "all" });
        AI.backend = name;
        return;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("Model AI gagal dimulakan");
  }

  async function loadAI(cfg, onProgress = () => {}) {
    if (AI.session) return AI.session;
    if (AI.loading) return AI.loading;
    AI.loading = (async () => {
      onProgress(0, L("up.loadEngine"));
      await loadScript(cfg.ortUrl);
      const ort = window.ort;
      ort.env.wasm.wasmPaths = cfg.ortWasmPath;
      ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
      // Pilihan: muat fail .wasm sendiri (untuk persekitaran yang sekat fetch ke CDN)
      if (cfg.wasmBinaryUrl) {
        const wasm = await fetchModel(cfg.wasmBinaryUrl, (p) => onProgress(p * 0.5, L("up.engineProg", { p: Math.round(p * 100) })), 11_300_000);
        ort.env.wasm.wasmBinary = wasm.buffer;
      }
      const model = await fetchModel(cfg.modelUrl, (p) => onProgress(p, L("up.download", { p: Math.round(p * 100) })));
      onProgress(1, L("up.prepModel"));
      AI.model = model;
      await createSession(navigator.gpu ? ["webgpu", "wasm"] : ["wasm"]);
      return AI.session;
    })();
    try { return await AI.loading; } finally { AI.loading = null; }
  }

  async function runAI(srcCanvas, cfg, onProgress) {
    const ort = window.ort;
    const W = srcCanvas.width, H = srcCanvas.height, S = AI.scale;
    const src = srcCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, W, H).data;
    const OW = W * S, OH = H * S;
    const out = new Uint8ClampedArray(OW * OH * 4);
    const T = AI.backend === "webgpu" ? cfg.tileSizeGPU : cfg.tileSizeCPU;
    const PAD = 8;
    const tiles = [];
    for (let y = 0; y < H; y += T) for (let x = 0; x < W; x += T) tiles.push([x, y, Math.min(T, W - x), Math.min(T, H - y)]);
    const t0 = performance.now();

    for (let i = 0; i < tiles.length; i++) {
      const [x, y, tw, th] = tiles[i];
      const px = Math.max(0, x - PAD), py = Math.max(0, y - PAD);
      const iw = Math.min(W, x + tw + PAD) - px, ih = Math.min(H, y + th + PAD) - py;
      const plane = iw * ih, data = new Float32Array(3 * plane);
      for (let yy = 0; yy < ih; yy++) {
        for (let xx = 0; xx < iw; xx++) {
          const si = ((py + yy) * W + px + xx) * 4, di = yy * iw + xx;
          data[di] = src[si] / 255; data[plane + di] = src[si + 1] / 255; data[2 * plane + di] = src[si + 2] / 255;
        }
      }
      const feed = () => ({ [AI.session.inputNames[0]]: new ort.Tensor("float32", data, [1, 3, ih, iw]) });
      let result;
      try { result = await AI.session.run(feed()); }
      catch (e) {
        if (AI.backend !== "webgpu") throw e;
        console.warn("WebGPU gagal, tukar ke CPU:", e);
        onProgress(i / tiles.length, L("up.toCpu"));
        await createSession(["wasm"]);
        return runAI(srcCanvas, cfg, onProgress);
      }
      const o = result[AI.session.outputNames[0]], od = o.data, ow = o.dims[3], oplane = o.dims[2] * ow;
      // Salin hanya bahagian tengah (tanpa padding) ke imej output
      const ox0 = (x - px) * S, oy0 = (y - py) * S;
      for (let yy = 0; yy < th * S; yy++) {
        const dy = y * S + yy, srow = (oy0 + yy) * ow;
        for (let xx = 0; xx < tw * S; xx++) {
          const si = srow + ox0 + xx, di = (dy * OW + x * S + xx) * 4;
          out[di] = od[si] * 255; out[di + 1] = od[oplane + si] * 255; out[di + 2] = od[2 * oplane + si] * 255; out[di + 3] = 255;
        }
      }
      o.dispose?.();
      const done = (i + 1) / tiles.length;
      const eta = ((performance.now() - t0) / (i + 1)) * (tiles.length - i - 1) / 1000;
      onProgress(done, L("up.processing", { p: Math.round(done * 100) }) + (i > 0 && eta > 3 ? L("up.eta", { s: Math.ceil(eta) }) : ""));
      await tick();
    }

    const canvas = makeCanvas(OW, OH);
    const ctx = canvas.getContext("2d");
    const img = new ImageData(out, OW, OH);
    // Kekalkan lutsinar (alpha) jika gambar asal ada
    let hasAlpha = false;
    for (let i = 3; i < src.length; i += 4) if (src[i] < 255) { hasAlpha = true; break; }
    if (hasAlpha) {
      const a = resize(srcCanvas, OW, OH).getContext("2d").getImageData(0, 0, OW, OH).data;
      for (let i = 3; i < out.length; i += 4) out[i] = a[i];
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  }

  async function upscaleAI(img, { scale, maxSide, ai, onProgress = () => {} }) {
    let src = toCanvas(img);
    // Gambar terlalu besar → kecilkan dahulu supaya tidak terlalu lambat
    const longSide = Math.max(src.width, src.height);
    if (longSide > ai.maxInputSide) {
      const k = ai.maxInputSide / longSide;
      src = resize(src, Math.round(src.width * k), Math.round(src.height * k));
    }
    const t = targetSize(img.naturalWidth || img.width, img.naturalHeight || img.height, scale, maxSide);

    await loadAI(ai, (p, label) => onProgress(p * 0.15, label));
    onProgress(0.15, L("up.processing", { p: 0 }));
    const up = await runAI(src, ai, (p, label) => onProgress(0.15 + p * 0.8, label));
    onProgress(0.97, L("up.finishing"));
    await tick();
    const final = up.width === t.w && up.height === t.h ? up : resize(up, t.w, t.h);
    onProgress(1, L("up.done"));
    return final;
  }

  window.Upscaler = {
    targetSize,
    upscaleClassic,
    upscaleAI,
    aiInfo: () => ({ ready: !!AI.session, backend: AI.backend }),
  };
})();
