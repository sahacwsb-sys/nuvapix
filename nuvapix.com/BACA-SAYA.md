# Nuvapix — website AI upscale gambar

## Cara buka
- Paling mudah: double-click `index.html` (Chrome disyorkan).
- Untuk online: seret seluruh folder ke Netlify Drop / Cloudflare Pages / Vercel (percuma).
  Ciri AI paling stabil bila dibuka melalui `https://`.

## Fail
- `index.html` — struktur halaman
- `styles.css` — reka bentuk tema "makmal foto" (cerah & gelap ikut tetapan peranti)
- `config.js` — **tetapan**: nama jenama, had percuma, had pukal, harga, tetapan AI
- `upscaler.js` — enjin upscale: AI Real-ESRGAN + mod Pantas
- `zip.js` — penulis fail ZIP untuk muat turun semua gambar sekaligus
- `i18n.js` — semua teks dalam English dan Bahasa Melayu
- `app.js` — muat naik satu/pukal, helaian kontak, perbandingan, muat turun, pakej, paywall
- `nuvapix.html` — semua fail di atas digabung dalam satu fail (dijana semula selepas ubah kod)

## Bahasa
- Lalai English (`defaultLang` dalam `config.js`). Pengguna tukar dengan butang EN / BM di bar atas;
  pilihan diingat dalam browser. Paksa bahasa melalui link: `?lang=ms` atau `?lang=en`.

## Pakej
| Pakej | Bulanan | Tahunan | Gambar |
|---|---|---|---|
| Percuma (akan datang) | RM0 | — | 3 gambar |
| Asas | RM9.90 | — (bulanan sahaja) | 500 sebulan, upload pukal sehingga 500 |
| Pro | RM29 | RM290 (≈RM24.17/bulan) | Tanpa had, upload pukal tanpa had |

- Pilihan tahunan hanya untuk Pro (= 10 bulan, percuma 2 bulan). Tukar dalam `config.js` → `plans`.
- Demo tanpa ubah kod: `?plan=basic` atau `?plan=pro`. Kuota Asas diset semula setiap bulan.

## Upload pukal
- Percuma: sehingga `maxBatch` gambar (lalai 30) sekali. Asas: sehingga baki kuota bulan itu. Pro: tanpa had.
- Gambar diproses satu demi satu. Bila had percuma diaktifkan, setiap gambar dikira 1 penggunaan.
- Muat turun satu persatu (butang ↓) atau semua dalam satu fail ZIP.

## Link ujian (Claude Artifact)
- https://claude.ai/artifact/6Z95AeP8RgTCnd62fYMs8D (peribadi, perlu log masuk claude.ai)
- Dalam link ini AI berjalan pada CPU sahaja, jadi lebih perlahan. Versi yang dihoskan sendiri guna GPU.

## Enjin AI
- Model: Real-ESRGAN `realesr-general-x4v3` (ONNX, ~4.9MB), dijalankan dalam browser
  pengguna guna ONNX Runtime Web — WebGPU (GPU) jika ada, jika tidak WASM (CPU).
- Model dimuat turun sekali dan disimpan dalam cache browser.
- Kos server: RM0 — semua pemprosesan di peranti pengguna.
- URL model kini dari mirror pihak ketiga di Hugging Face. **Sebelum lancar**, muat naik fail
  `.onnx` ke hosting sendiri dan tukar `ai.modelUrl` dalam `config.js`.
- Jika AI gagal pada peranti tertentu, website automatik guna mod Pantas.

## Tukar ke mod "3 gambar percuma"
Dalam `config.js`, tukar `freeLimit: null` kepada `freeLimit: 3`.
Demo tanpa ubah kod: `index.html?limit=3` (reset kiraan: `?reset=1`).

## Sebelum mula caj bayaran (perlu dibuat)
1. Akaun pengguna + simpan kiraan di server (kiraan dalam browser mudah dipadam).
2. Gerbang pembayaran (cth. ToyyibPay, Billplz, Stripe).
3. Pilihan: Real-ESRGAN versi penuh (x4plus) di server GPU untuk pelan berbayar.
