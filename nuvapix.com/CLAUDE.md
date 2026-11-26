# Nuvapix — website statik (nuvapix.com, hosting Netkl cPanel)

## Deploy automatik
- Selepas siap SETIAP perubahan pada fail website, terus jalankan `zsh deploy.sh` supaya website live, tanpa perlu tanya.
  - Skrip hanya upload fail yang berubah, kemudian semak website pulangkan HTTP 200.
  - Jika gagal, laporkan ralat kepada pengguna. Jangan cuba cara lain untuk upload.
- Deploy sekali sahaja di hujung kerja, bukan selepas setiap Edit kecil (elak versi separuh siap jadi live).
- Selepas deploy, semak https://nuvapix.com dalam browser (paparan + console tiada ralat) bila perubahan menyentuh paparan atau JS.
- Login FTP: `deploy.conf` (hos/pengguna) + macOS Keychain service `nuvapix-ftp` (kata laluan). Jangan baca, paparkan atau ubah kata laluan. Jika tiada, minta pengguna jalankan `zsh setup-deploy.sh`.
- Fail yang tidak dihantar ke hosting disenaraikan dalam `EXCLUDE` dalam `deploy.sh`. Tambah fail dalaman baharu ke situ.

## Struktur
- `index.html` + `styles.css` + `config.js` + `i18n.js` + `upscaler.js` + `zip.js` + `app.js` — website sebenar.
- `realesr-general-x4v3.onnx` — model AI dihoskan sendiri (`ai.modelUrl` dalam `config.js`).
- `nuvapix.html` — versi satu fail untuk Claude Artifact; tidak dideploy.
- Teks UI dalam dua bahasa: kemas kini kedua-dua EN dan BM dalam `i18n.js`.
