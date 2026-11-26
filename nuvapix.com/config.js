// =====================================================
//  TETAPAN WEBSITE — ubah di sini sahaja
// =====================================================
window.APP_CONFIG = {
  // Nama jenama yang dipaparkan
  brandName: "Nuvapix",

  // Had upscale percuma bagi setiap pengguna.
  //   null  = tanpa had (percuma sepenuhnya)
  //   3     = 3 gambar percuma, lepas tu kena bayar (fasa sekarang)
  freeLimit: 3,

  // Saiz output maksimum (lebar atau tinggi, piksel) supaya browser tak crash
  maxOutputSide: 8000,

  // Saiz fail input maksimum (MB)
  maxFileMB: 25,

  // Bilangan gambar maksimum dalam satu kumpulan (upload pukal)
  maxBatch: 30,

  // ---- Enjin AI (Real-ESRGAN, berjalan dalam browser pengguna) ----
  ai: {
    // Model Real-ESRGAN "realesr-general-x4v3" format ONNX (~4.9MB).
    // Fail .onnx dihoskan sendiri (folder sama dengan index.html).
    modelUrl: "realesr-general-x4v3.onnx",
    // ONNX Runtime Web (pustaka untuk jalankan model AI dalam browser)
    ortUrl: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.webgpu.min.js",
    ortWasmPath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
    // Kosongkan biasanya. Hanya diisi bila fail .wasm perlu dihoskan sendiri.
    wasmBinaryUrl: "",
    // Sisi terpanjang gambar input untuk mod AI (lebih besar = lebih lambat)
    maxInputSide: 1200,
    // Saiz kepingan (tile) yang diproses setiap kali: GPU / CPU
    tileSizeGPU: 256,
    tileSizeCPU: 128,
    // Mod "Natural" (lalai): kekalkan muka/gambar asal, AI hanya menajamkan sedikit.
    //   mix   = berapa banyak hasil AI dicampur (0 = asal sahaja, 1 = AI penuh)
    //   limit = had perubahan setiap piksel (0–255). Kecil = lebih setia pada asal.
    natural: { mix: 0.45, limit: 18 },
  },

  // Bahasa lalai: "en" (English) atau "ms" (Bahasa Melayu)
  defaultLang: "en",

  // Pakej langganan. Teks nama & ciri ada dalam i18n.js (dua bahasa).
  //   quota = bilangan gambar sebulan (null = tanpa had)
  //   Pilihan tahunan hanya untuk Pro (= 10 bulan, percuma 2 bulan). Asas bulanan sahaja.
  // Untuk demo pakej tanpa ubah kod: index.html?plan=basic atau ?plan=pro
  plans: {
    free:  { quota: 3 },
    basic: { quota: 500,  monthly: "RM9.90" },
    pro:   { quota: null, monthly: "RM29",   yearly: "RM290", yearlyPerMonth: "RM24.17", highlight: true },
  },
};
