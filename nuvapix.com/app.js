(function () {
  const CFG = window.APP_CONFIG;
  const $ = (id) => document.getElementById(id);
  const t = (k, v) => I18N.t(k, v);
  const params = new URLSearchParams(location.search);

  // =================== PAKEJ & KUOTA ===================
  // Fasa sekarang: CFG.freeLimit = 3 → 3 gambar percuma, kemudian paywall.
  // Demo tanpa ubah kod:  ?limit=3 (mod 3 percuma) · ?plan=basic · ?plan=pro · ?reset=1
  // Pengguna log masuk: pakej & kiraan disimpan di server (Account.status, lihat account.js).
  // Tetamu: kiraan dalam localStorage.
  const DEMO_PLAN = ["basic", "pro"].includes(params.get("plan")) ? params.get("plan") : "free";
  let PLAN = DEMO_PLAN;
  const acct = () => Account.status;
  const syncPlan = () => { PLAN = acct() ? acct().plan : DEMO_PLAN; };
  const LIMIT = params.has("limit") ? Number(params.get("limit")) : CFG.freeLimit;
  const hasFreeLimit = () => LIMIT !== null && LIMIT !== undefined && !Number.isNaN(LIMIT);
  const usageKey = () => {
    if (PLAN !== "basic") return "upscale_used_count";
    const d = new Date();
    return `nuvapix_used_${d.getFullYear()}_${d.getMonth() + 1}`; // kuota Asas diset semula setiap bulan
  };
  const store = {
    get() { try { return Number(localStorage.getItem(usageKey())) || 0; } catch { return 0; } },
    set(v) { try { localStorage.setItem(usageKey(), String(v)); } catch {} },
  };
  if (params.has("reset")) store.set(0);
  const quota = () => {
    if (acct()) return acct().quota;
    return PLAN === "pro" ? null : PLAN === "basic" ? CFG.plans.basic.quota : hasFreeLimit() ? LIMIT : null;
  };
  const remaining = () => {
    if (acct()) return acct().remaining === null ? Infinity : acct().remaining;
    const q = quota(); return q === null ? Infinity : Math.max(0, q - store.get());
  };
  // Had gambar dalam satu kumpulan upload
  const batchCap = () => (PLAN === "pro" ? Infinity : PLAN === "basic" ? CFG.plans.basic.quota : CFG.maxBatch);

  function renderUsage() {
    const pill = $("usagePill"), q = quota(), r = remaining();
    pill.classList.remove("warn");
    if (PLAN === "pro") pill.textContent = t("quota.pro");
    else if (PLAN === "basic") { pill.textContent = t("quota.basic", { n: r, total: q }); pill.classList.toggle("warn", r <= 20); }
    else if (q === null) pill.textContent = t("quota.unlimited");
    else { pill.textContent = r > 0 ? t("quota.left", { n: r, total: q }) : t("quota.none"); pill.classList.toggle("warn", r <= 1); }
  }

  // =================== TEKS STATIK & HARGA ===================
  document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = CFG.brandName));
  $("year").textContent = new Date().getFullYear();

  function renderStaticVars() {
    const cap = batchCap();
    $("dropSub").innerHTML = cap === Infinity ? t("drop.subUnlimited") : t("drop.subBatch", { n: cap });
    $("faq2a").textContent = t("faq.2a", { n: CFG.maxBatch });
  }

  let billing = "monthly";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function planHTML(id) {
    const p = CFG.plans[id];
    let price = "RM0", per = "", equiv = "", feats;
    if (id === "free") feats = [t("plan.free.f1", { n: p.quota }), t("plan.free.f2"), t("plan.free.f3")];
    else {
      const yearly = billing === "yearly" && p.yearly; // pakej tanpa harga tahunan kekal bulanan
      price = yearly ? p.yearly : p.monthly;
      per = t(yearly ? "per.year" : "per.month");
      equiv = yearly ? t("price.equiv", { p: p.yearlyPerMonth }) : billing === "yearly" ? t("price.monthlyOnly") : "";
      feats = [1, 2, 3, 4].map((i) => t(`plan.${id}.f${i}`, { n: p.quota }));
    }
    return `<div class="plan ${p.highlight ? "hl" : ""}" data-badge="${esc(t("plan.best"))}">
      <h3>${esc(t(`plan.${id}.name`))}</h3>
      <div class="price">${esc(price)} <small>${esc(per)}</small></div>
      <p class="equiv">${esc(equiv)}</p>
      <ul>${feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <button class="btn ${p.highlight ? "btn-ink" : "btn-line"}" data-plan="${id}" type="button" ${acct() && PLAN === id ? "disabled" : ""}>${esc(acct() && PLAN === id ? t("plan.current") : t(`plan.${id}.cta`))}</button>
    </div>`;
  }
  function renderPlans() {
    $("plans").innerHTML = ["free", "basic", "pro"].map(planHTML).join("");
    $("plansModal").innerHTML = (PLAN === "basic" ? ["pro"] : ["basic", "pro"]).map(planHTML).join("");
    document.querySelectorAll("[data-bill]").forEach((b) => b.classList.toggle("on", b.dataset.bill === billing));
  }
  document.querySelectorAll(".billing").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("[data-bill]"); if (!b) return;
    billing = b.dataset.bill; renderPlans();
  }));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-plan]");
    if (!b) return;
    if (b.dataset.plan === "free") { paywall.hidden = true; window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (!acct()) { paywall.hidden = true; openAuth("register", t("auth.toBuy")); return; }
    toast(t("pay.soonAcct"), 5000);
  });
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => I18N.set(b.dataset.lang)));

  // =================== TOAST, MODAL, SIMPAN FAIL ===================
  let toastT;
  function toast(msg, ms = 3400) {
    const el = $("toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), ms);
  }
  const paywall = $("paywall");
  let paywallDone = 0;
  function openPaywall(done) {
    paywallDone = done;
    renderPaywallText();
    paywall.hidden = false;
  }
  function renderPaywallText() {
    const r = remaining();
    $("pwTitle").textContent = PLAN !== "basic" ? t("pw.titleFree")
      : r > 0 ? t("pw.titleBasicLow", { n: r }) : t("pw.titleBasic", { n: CFG.plans.basic.quota });
    $("pwText").textContent = paywallDone ? t("pw.textDone", { n: paywallDone }) : t("pw.text");
    $("pwAuth").hidden = !!acct();
  }
  paywall.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) paywall.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".modal").forEach((m) => (m.hidden = true)); });

  // =================== AKAUN: DAFTAR / LOG MASUK ===================
  const authModal = $("authModal"), acctModal = $("acctModal"), authForm = $("authForm");
  let authTab = "login", authNote = "";
  [authModal, acctModal].forEach((m) => m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) m.hidden = true; }));
  function renderAuth() {
    const reg = authTab === "register";
    authModal.querySelectorAll("[data-auth-tab]").forEach((b) => b.classList.toggle("on", b.dataset.authTab === authTab));
    $("authTitle").textContent = t(reg ? "auth.regTitle" : "auth.loginTitle");
    $("authSub").textContent = authNote || t(reg ? "auth.regSub" : "auth.loginSub", { n: CFG.plans.free.quota });
    $("nameField").hidden = !reg;
    $("pwHint").hidden = !reg;
    authForm.password.autocomplete = reg ? "new-password" : "current-password";
    $("authSubmit").textContent = t(reg ? "auth.register" : "auth.login");
  }
  function openAuth(tab = "login", note = "") {
    authTab = tab; authNote = note; $("authErr").hidden = true;
    renderAuth(); authModal.hidden = false;
    setTimeout(() => (reg() ? authForm.name : authForm.email).focus(), 30);
  }
  const reg = () => authTab === "register";
  authModal.querySelector(".auth-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-auth-tab]"); if (!b) return;
    authTab = b.dataset.authTab; $("authErr").hidden = true; renderAuth();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-auth-open]"); if (!b) return;
    paywall.hidden = true; openAuth(b.dataset.authOpen);
  });
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = authForm.name.value.trim(), email = authForm.email.value.trim(), pw = authForm.password.value;
    const err = (k) => { $("authErr").textContent = t(k); $("authErr").hidden = false; };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("err.email");
    if (pw.length < 8 && reg()) return err("err.password");
    if (!pw) return err("err.invalid");
    $("authSubmit").disabled = true;
    try {
      if (reg()) await Account.register(name, email, pw); else await Account.login(email, pw);
      authForm.reset(); authModal.hidden = true;
      toast(t(reg() ? "auth.welcomeNew" : "auth.welcome", { name: Account.user.name || Account.user.email }));
    } catch (ex) {
      err(`err.${["email", "password", "exists", "invalid", "disabled", "throttle", "network"].includes(ex.code) ? ex.code : "server"}`);
    } finally { $("authSubmit").disabled = false; }
  });

  function renderAcct() {
    const u = Account.user, b = $("acctBtn");
    b.textContent = u ? (u.name || u.email.split("@")[0]) : t("auth.login");
    b.classList.toggle("in", !!u);
    b.title = u ? u.email : "";
    if (!u) { acctModal.hidden = true; return; }
    const s = acct(), dl = $("acctInfo");
    const rows = [
      ["acct.email", u.email],
      ["acct.plan", t(`plan.${s.plan}.name`) + (u.role === "admin" ? " · Admin" : "")],
    ];
    if (s.plan !== "free" && u.planExpires && u.role !== "admin") rows.push(["acct.expires", u.planExpires]);
    rows.push(["acct.usage", s.quota === null ? t("acct.usageUnlimited", { n: s.used }) : t(s.plan === "free" ? "acct.usageFree" : "acct.usageMonth", { n: s.used, total: s.quota })]);
    dl.innerHTML = rows.map(([k, v]) => `<dt>${esc(t(k))}</dt><dd>${esc(v)}</dd>`).join("");
    $("acctAdmin").hidden = !Account.isAdmin;
    $("acctUpgrade").hidden = s.plan === "pro";
  }
  $("acctBtn").addEventListener("click", () => { if (Account.user) { renderAcct(); acctModal.hidden = false; } else openAuth("login"); });
  $("acctLogout").addEventListener("click", async () => { await Account.logout(); toast(t("acct.loggedOut")); });
  $("acctUpgrade").addEventListener("click", () => { acctModal.hidden = true; $("harga").scrollIntoView({ behavior: "smooth" }); });
  if (location.hash === "#login") openAuth("login");
  if (location.hash === "#daftar" || location.hash === "#signup") openAuth("register");

  // Dalam Claude Artifact, muat turun mesti melalui keupayaan "downloads".
  let dlCap = null;
  try { window.claude?.use?.("downloads")?.then((d) => (dlCap = d)).catch(() => {}); } catch {}
  async function saveFile(filename, blob) {
    if (dlCap) {
      try { await dlCap.save({ filename, data: blob }); return true; }
      catch (e) { if (e?.code !== "declined") toast(t("save.fail")); return false; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return true;
  }

  // =================== GAMBAR HERO ===================
  const heroImg = new Image();
  heroImg.src = "hero-apples.webp";
  function drawHero(c, w, h) {
    const iw = heroImg.naturalWidth, ih = heroImg.naturalHeight, k = Math.max(w / iw, h / ih);
    const sw = w / k, sh = h / k;
    c.imageSmoothingQuality = "high";
    c.drawImage(heroImg, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, w, h);
  }
  function makeCanvas(fn, w, h) { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; fn(cv.getContext("2d"), w, h); return cv; }

  // =================== KANTA PEMBESAR (HERO) ===================
  const lc = $("loupe"), lctx = lc.getContext("2d");
  let lo, hi, pointer = null, lastMove = 0;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function setupLoupe() {
    const r = lc.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    lc.width = Math.max(2, Math.round(r.width * dpr)); lc.height = Math.max(2, Math.round(r.height * dpr));
    lo = makeCanvas(drawHero, 120, 90);
    hi = makeCanvas(drawHero, lc.width, lc.height);
  }
  function drawLoupe(x, y) {
    const w = lc.width, h = lc.height, R = Math.min(w, h) * .23, css = getComputedStyle(document.documentElement);
    lctx.imageSmoothingEnabled = false; lctx.drawImage(lo, 0, 0, w, h);
    lctx.save(); lctx.beginPath(); lctx.arc(x, y, R, 0, Math.PI * 2); lctx.clip(); lctx.drawImage(hi, 0, 0); lctx.restore();
    lctx.lineWidth = Math.max(3, R * .04); lctx.strokeStyle = css.getPropertyValue("--cyan").trim() || "#0094d4";
    lctx.beginPath(); lctx.arc(x, y, R, 0, Math.PI * 2); lctx.stroke();
    // pemegang kanta
    const a = Math.PI * .25;
    lctx.lineWidth = R * .14; lctx.lineCap = "round"; lctx.strokeStyle = "#111a2b";
    lctx.beginPath(); lctx.moveTo(x + Math.cos(a) * R * 1.04, y + Math.sin(a) * R * 1.04); lctx.lineTo(x + Math.cos(a) * R * 1.55, y + Math.sin(a) * R * 1.55); lctx.stroke();
    // label
    const fs = Math.max(11, R * .16);
    lctx.font = `600 ${fs}px "JetBrains Mono", monospace`; lctx.textBaseline = "middle";
    const label = "4× AI", tw = lctx.measureText(label).width + fs;
    lctx.fillStyle = lctx.strokeStyle = css.getPropertyValue("--cyan").trim() || "#0094d4";
    const ly = y - R - fs * 1.9 < 0 ? y + R + fs * 0.4 : y - R - fs * 1.9; // ke bawah kanta jika terlalu atas
    lctx.fillRect(x - tw / 2, ly, tw, fs * 1.5);
    lctx.fillStyle = "#fff"; lctx.fillText(label, x - tw / 2 + fs / 2, ly + fs * 0.75);
  }
  function loupeFrame(t) {
    if (!lo) return;
    let x, y;
    if (pointer && (reduce || t - lastMove < 2500)) ({ x, y } = pointer);
    else if (reduce) { x = lc.width * .6; y = lc.height * .45; }
    else { x = lc.width * (.5 + .3 * Math.sin(t / 2100)); y = lc.height * (.48 + .2 * Math.sin(t / 1300)); }
    drawLoupe(x, y);
    if (!reduce) requestAnimationFrame(loupeFrame);
  }
  lc.addEventListener("pointermove", (e) => {
    const r = lc.getBoundingClientRect();
    pointer = { x: (e.clientX - r.left) * (lc.width / r.width), y: (e.clientY - r.top) * (lc.height / r.height) };
    lastMove = performance.now();
    if (reduce) drawLoupe(pointer.x, pointer.y);
  });
  lc.addEventListener("pointerleave", () => (lastMove = 0));
  Promise.all([document.fonts?.ready, heroImg.decode()]).then(() => { setupLoupe(); requestAnimationFrame(loupeFrame); }).catch(() => {});
  let rzT; addEventListener("resize", () => { clearTimeout(rzT); rzT = setTimeout(() => { setupLoupe(); if (reduce) loupeFrame(0); }, 200); });


  // =================== MASUKKAN GAMBAR ===================
  const drop = $("dropZone"), input = $("fileInput");
  $("pickBtn").addEventListener("click", (e) => { e.stopPropagation(); input.click(); });
  $("addBtn").addEventListener("click", () => input.click());
  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", () => { addFiles([...input.files]); input.value = ""; });
  let depth = 0;
  document.addEventListener("dragenter", (e) => { e.preventDefault(); depth++; drop.classList.add("over"); });
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("dragleave", () => { if (--depth <= 0) { depth = 0; drop.classList.remove("over"); } });
  document.addEventListener("drop", (e) => { e.preventDefault(); depth = 0; drop.classList.remove("over"); addFiles([...(e.dataTransfer?.files || [])]); });
  document.addEventListener("paste", (e) => {
    const files = [...(e.clipboardData?.items || [])].filter((i) => i.type.startsWith("image/")).map((i) => i.getAsFile()).filter(Boolean);
    if (files.length) addFiles(files);
  });


  // =================== KEADAAN ===================
  const S = { items: [], sel: null, mode: "ai", look: "natural", scale: 4, fmt: "png", busy: false, seq: 0 };
  const loadImg = (url) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });

  async function addFiles(files) {
    if (!files.length) return;
    const ok = [], skipped = [];
    for (const f of files) {
      if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) skipped.push(t("skip.format", { name: f.name }));
      else if (f.size > CFG.maxFileMB * 1048576) skipped.push(t("skip.size", { name: f.name, mb: CFG.maxFileMB }));
      else ok.push(f);
    }
    // Had ikut pakej: Percuma = maxBatch sekali, Asas = baki kuota bulan ini, Pro = tanpa had
    const pendingNew = S.items.filter((i) => !i.counted).length;
    const cap = PLAN === "free" ? CFG.maxBatch - S.items.length : PLAN === "basic" ? remaining() - pendingNew : Infinity;
    const max = PLAN === "basic" ? remaining() : CFG.maxBatch;
    let overQuota = false;
    if (ok.length > cap) {
      const over = ok.length - Math.max(0, cap);
      skipped.push(t(over === 1 ? "skip.batch1" : "skip.batch", { n: over, max }));
      ok.length = Math.max(0, cap);
      overQuota = PLAN === "basic";
    }
    for (const f of ok) {
      const url = URL.createObjectURL(f);
      try {
        const img = await loadImg(url);
        S.items.push({ id: ++S.seq, name: f.name.replace(/\.[^.]+$/, "") || "image", url, img, w: img.naturalWidth, h: img.naturalHeight, status: "queued", progress: 0, counted: false, out: null });
      } catch { URL.revokeObjectURL(url); skipped.push(t("skip.read", { name: f.name })); }
    }
    if (skipped.length) toast(skipped.length === 1 ? skipped[0] : t("skip.many", { n: skipped.length, first: skipped[0] }), 5000);
    if (overQuota) openPaywall(0);
    if (!S.items.length) return;
    if (!S.sel || !S.items.find((i) => i.id === S.sel)) S.sel = S.items[0].id;
    const firstOpen = $("bench").hidden;
    $("bench").hidden = false;
    renderAll();
    if (firstOpen) requestAnimationFrame(() => $("bench").scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  // =================== PAPARAN ===================
  const st = (s) => t(`st.${s}`);
  const outSize = (it) => Upscaler.targetSize(it.w, it.h, it.out ? it.out.scale : S.scale, CFG.maxOutputSide);

  function renderFrames() {
    const ol = $("frames");
    ol.innerHTML = "";
    S.items.forEach((it, idx) => {
      const li = document.createElement("li");
      li.className = "frame" + (it.id === S.sel ? " sel" : "");
      li.dataset.id = it.id;
      const o = outSize(it);
      const label = it.status === "processing" ? `${st("processing")} ${Math.round(it.progress * 100)}%` : st(it.status);
      li.innerHTML = `
        <span class="f-no">${String(idx + 1).padStart(2, "0")}A</span>
        <img class="f-thumb" alt="" />
        <div class="f-info">
          <div class="f-name"></div>
          <div class="f-meta">${it.w}×${it.h} → ${o.w}×${o.h}</div>
          <span class="f-status st-${it.status}"></span>
        </div>
        <div class="f-acts">
          <button type="button" data-act="dl" ${it.status === "done" ? "" : "disabled"}>↓</button>
          <button type="button" data-act="redo" ${it.status === "processing" ? "disabled" : ""}>↻</button>
          <button type="button" data-act="rm" ${it.status === "processing" ? "disabled" : ""}>×</button>
        </div>`;
      li.querySelector(".f-thumb").src = it.url;
      li.querySelector(".f-name").textContent = it.name;
      li.querySelector(".f-status").textContent = label;
      [["dl", "frame.dl"], ["redo", "frame.redo"], ["rm", "frame.rm"]].forEach(([a, k]) => {
        const b = li.querySelector(`[data-act="${a}"]`); b.title = t(k); b.setAttribute("aria-label", t(k));
      });
      ol.appendChild(li);
    });
  }

  function renderStatus() {
    const n = S.items.length, done = S.items.filter((i) => i.status === "done").length;
    const err = S.items.filter((i) => i.status === "error").length;
    const pending = S.items.filter((i) => i.status === "queued" || i.status === "error").length;
    const cur = S.items.find((i) => i.status === "processing");
    $("bsMain").textContent = t("bs.done", { d: done, n });
    $("bsSub").textContent = cur ? t("bs.cur", { name: cur.name }) : err ? t("bs.err", { n: err }) : pending ? t("bs.wait", { n: pending }) : n ? t("bs.all") : "";
    $("bsFill").style.width = n ? `${((done + (cur ? cur.progress : 0)) / n) * 100}%` : "0%";
    $("runBtn").textContent = S.busy ? t("run.busy") : pending === 1 ? t("run.one") : pending ? t("run.n", { n: pending }) : t("run.all");
    $("runBtn").disabled = S.busy || !pending;
    $("zipBtn").disabled = S.busy || done === 0;
    $("zipBtn").textContent = done > 1 ? t("zip.n", { n: done }) : done === 1 ? t("dl.one") : t("zip.label");
    $("clearBtn").disabled = S.busy;
    const big = S.items.some((i) => Math.max(i.w, i.h) > CFG.ai.maxInputSide);
    const info = Upscaler.aiInfo();
    $("lookGroup").hidden = S.mode !== "ai";
    $("aiNote").textContent = S.mode !== "ai" ? t("note.fast")
      : t(S.look === "natural" ? "note.natural" : "note.enhanced") + " "
      + (info.ready ? t("note.ready", { dev: info.backend === "webgpu" ? "GPU" : "CPU" }) : t("note.first"))
        + (big ? t("note.big", { px: CFG.ai.maxInputSide }) : "");
  }

  const compare = $("compare");
  let shownSel = null, shownOut = null;
  function renderViewer() {
    const it = S.items.find((i) => i.id === S.sel);
    if (!it) { compare.classList.add("no-result"); $("viewerMeta").textContent = "—"; return; }
    if (shownSel !== it.id) {
      $("imgBefore").src = it.url;
      compare.style.aspectRatio = `${it.w} / ${it.h}`;
      setZoom(1); setPos(50);
      shownSel = it.id; shownOut = null;
    }
    const outUrl = it.out?.url || null;
    if (outUrl !== shownOut) {
      if (outUrl) $("imgAfter").src = outUrl; else $("imgAfter").removeAttribute("src");
      shownOut = outUrl;
    }
    compare.classList.toggle("no-result", !outUrl);
    $("working").hidden = it.status !== "processing";
    const o = outSize(it);
    $("viewerMeta").textContent = it.out
      ? `${it.name} · ${it.w}×${it.h} → ${it.out.w}×${it.out.h} · ${t(it.out.mode === "ai" ? "meta.ai" : "meta.fast")} · ${it.out.secs}s`
      : `${it.name} · ${it.w}×${it.h} → ${o.w}×${o.h} · ${st(it.status)}`;
  }
  function renderAll() { renderFrames(); renderStatus(); renderViewer(); renderUsage(); }

  $("frames").addEventListener("click", (e) => {
    const li = e.target.closest(".frame"); if (!li) return;
    const it = S.items.find((i) => i.id === Number(li.dataset.id)); if (!it) return;
    const act = e.target.closest("button")?.dataset.act;
    if (act === "dl") return downloadOne(it);
    if (act === "rm") return removeItem(it);
    if (act === "redo") { it.status = "queued"; it.progress = 0; S.sel = it.id; renderAll(); runQueue(); return; }
    S.sel = it.id; renderFrames(); renderViewer();
  });

  function freeItem(it) { URL.revokeObjectURL(it.url); if (it.out) URL.revokeObjectURL(it.out.url); }
  function removeItem(it) {
    if (it.status === "processing") return;
    freeItem(it);
    S.items = S.items.filter((i) => i !== it);
    if (S.sel === it.id) S.sel = S.items[0]?.id ?? null;
    if (!S.items.length) { $("bench").hidden = true; shownSel = null; return; }
    renderAll();
  }
  $("clearBtn").addEventListener("click", () => {
    if (S.busy) return;
    S.items.forEach(freeItem); S.items = []; S.sel = null; shownSel = null;
    $("bench").hidden = true; window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // =================== TETAPAN ===================
  function toggle(id, key, cb) {
    $(id).addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $(id).querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      cb(b.dataset[key]); renderAll();
    });
  }
  toggle("modeSeg", "mode", (v) => (S.mode = v));
  toggle("lookSeg", "look", (v) => (S.look = v));
  toggle("scaleSeg", "scale", (v) => (S.scale = Number(v)));
  toggle("fmtSeg", "fmt", (v) => (S.fmt = v));

  // =================== PROSES BARISAN ===================
  async function runQueue() {
    if (S.busy) return;
    const todo = S.items.filter((i) => i.status === "queued" || i.status === "error");
    if (!todo.length) return;
    S.busy = true;
    const mode = S.mode, scale = S.scale, look = S.look;
    let aiFailed = false, hitLimit = false;
    renderAll();
    for (const it of todo) {
      if (!S.items.includes(it) || (it.status !== "queued" && it.status !== "error")) continue;
      if (!it.counted && remaining() <= 0) { hitLimit = true; break; }
      it.status = "processing"; it.progress = 0; S.sel = it.id;
      renderAll();
      const onProgress = (p, label) => {
        it.progress = p;
        $("barFill").style.width = `${Math.round(p * 100)}%`;
        if (label) $("procText").textContent = label;
        const el = document.querySelector(`.frame[data-id="${it.id}"] .f-status`);
        if (el) el.textContent = `${st("processing")} ${Math.round(p * 100)}%`;
        $("bsFill").style.width = `${((S.items.filter((i) => i.status === "done").length + p) / S.items.length) * 100}%`;
      };
      onProgress(0, t("proc.prep"));
      const t0 = performance.now();
      const opts = { scale, maxSide: CFG.maxOutputSide, strength: 55, look, ai: CFG.ai, onProgress };
      try {
        let canvas, used = mode;
        if (mode === "ai" && !aiFailed) {
          try { canvas = await Upscaler.upscaleAI(it.img, opts); }
          catch (err) {
            console.error("AI failed:", err);
            aiFailed = true; used = "classic";
            toast(t("ai.fail"), 5000);
            canvas = await Upscaler.upscaleClassic(it.img, opts);
          }
        } else {
          used = "classic";
          canvas = await Upscaler.upscaleClassic(it.img, opts);
        }
        const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
        if (it.out) URL.revokeObjectURL(it.out.url);
        it.out = { blob, url: URL.createObjectURL(blob), w: canvas.width, h: canvas.height, scale, mode: used, secs: ((performance.now() - t0) / 1000).toFixed(1) };
        canvas.width = canvas.height = 0; // lepaskan memori
        it.status = "done";
        if (!it.counted) {
          it.counted = true;
          if (acct()) await Account.consume(1).catch((e) => console.warn("usage:", e.code));
          else store.set(store.get() + 1);
        }
      } catch (err) {
        console.error(err);
        it.status = "error";
      }
      renderAll();
    }
    S.busy = false;
    renderAll();
    const done = S.items.filter((i) => i.status === "done").length, err = S.items.filter((i) => i.status === "error").length;
    if (hitLimit) openPaywall(done);
    else if (err) toast(t("run.err", { n: err }), 5000);
    else toast(done > 1 ? t("run.doneMany", { n: done }) : t("run.doneOne"));
  }
  $("runBtn").addEventListener("click", runQueue);

  // =================== MUAT TURUN ===================
  async function encoded(it) {
    if (S.fmt !== "jpeg") return { blob: it.out.blob, ext: "png" };
    const bmp = await createImageBitmap(it.out.blob);
    const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height;
    const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0);
    bmp.close?.();
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.93));
    c.width = c.height = 0;
    return { blob, ext: "jpg" };
  }
  const fileName = (it, ext) => `${it.name}-${it.out.scale}x.${ext}`;
  async function downloadOne(it) {
    if (it.status !== "done") return;
    const { blob, ext } = await encoded(it);
    saveFile(fileName(it, ext), blob);
  }
  $("zipBtn").addEventListener("click", async () => {
    const done = S.items.filter((i) => i.status === "done");
    if (!done.length) return;
    if (done.length === 1) return downloadOne(done[0]);
    $("zipBtn").disabled = true; $("zipBtn").textContent = t("zip.prep");
    try {
      const used = new Set(), files = [];
      for (const it of done) {
        const { blob, ext } = await encoded(it);
        let name = fileName(it, ext), k = 2;
        while (used.has(name)) name = `${it.name}-${it.out.scale}x-${k++}.${ext}`;
        used.add(name);
        files.push({ name, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      await saveFile(t("zip.name", { n: files.length }), makeZip(files));
    } finally { renderStatus(); }
  });

  // =================== PERBANDINGAN & ZUM ===================
  function setPos(p) { compare.style.setProperty("--pos", `${p}%`); }
  function setZoom(z) { compare.style.setProperty("--z", z); $("zoom").value = z; $("zoomVal").textContent = `${z}×`; }
  $("zoom").addEventListener("input", (e) => setZoom(Number(e.target.value)));
  let dragging = false;
  const pos = (e) => { const r = compare.getBoundingClientRect(); return { x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) }; };
  compare.addEventListener("pointerdown", (e) => { if (compare.classList.contains("no-result")) return; dragging = true; compare.setPointerCapture(e.pointerId); setPos(pos(e).x); });
  compare.addEventListener("pointermove", (e) => { const p = pos(e); if (dragging) setPos(p.x); else { compare.style.setProperty("--ox", `${p.x}%`); compare.style.setProperty("--oy", `${p.y}%`); } });
  ["pointerup", "pointercancel"].forEach((ev) => compare.addEventListener(ev, () => (dragging = false)));

  // =================== BAHASA ===================
  function renderLang() {
    renderStaticVars(); renderPlans(); renderUsage(); renderAcct();
    if (!paywall.hidden) renderPaywallText();
    if (!authModal.hidden) renderAuth();
    if (S.items.length) { renderFrames(); renderStatus(); renderViewer(); }
  }
  I18N.onChange(renderLang);
  Account.onChange(() => { syncPlan(); renderLang(); });
  I18N.apply();
  Account.refresh();
})();
