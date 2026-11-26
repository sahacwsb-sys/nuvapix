# Nuvapix — website statik (nuvapix.com, hosting Netkl cPanel)

Repo ini (`/Users/saharuddin/Documents/nuvapix`, GitHub `sahacwsb-sys/nuvapix`) ialah SATU-SATUNYA tempat kerja.
Folder lama `~/Documents/website upscale saha` tidak digunakan lagi — jangan edit di sana.

## Aliran automatik selepas setiap perubahan
Selepas siap SETIAP perubahan pada fail website, terus jalankan langkah ini tanpa perlu tanya:
1. `zsh nuvapix.com/stamp.sh` (kemas kini tag versi `?v=` CSS/JS dalam index.html).
2. `git add -A && git commit -m "<ringkasan perubahan>"` (di akar repo).
3. `git push` ke GitHub (`main`).
4. `zsh nuvapix.com/deploy.sh` supaya website live.
   - Skrip hanya upload fail yang berubah, kemudian semak website pulangkan HTTP 200.
   - Jika gagal, laporkan ralat kepada pengguna. Jangan cuba cara lain untuk upload.

Peraturan:
- Commit/push/deploy sekali sahaja di hujung kerja, bukan selepas setiap Edit kecil (elak versi separuh siap jadi live).
- Jika `git push` gagal (cth. tiada login), tetap deploy dan laporkan push yang gagal.
- Selepas deploy, semak https://nuvapix.com dalam browser (paparan + console tiada ralat) bila perubahan menyentuh paparan atau JS.
- Login FTP: `nuvapix.com/deploy.conf` (hos/pengguna, tidak di-commit) + macOS Keychain service `nuvapix-ftp` (kata laluan). Jangan baca, paparkan atau ubah kata laluan. Jika tiada, minta pengguna jalankan `zsh nuvapix.com/setup-deploy.sh`.
- Fail dalam `nuvapix.com/` yang tidak dihantar ke hosting disenaraikan dalam `EXCLUDE` dalam `deploy.sh`. Tambah fail dalaman baharu ke situ. Fail di akar repo (CLAUDE.md, .gitignore) memang tidak dideploy.

## Struktur
- `nuvapix.com/` = isi `public_html` di hosting.
  - `index.html` + `styles.css` + `config.js` + `i18n.js` + `upscaler.js` + `zip.js` + `app.js` — website sebenar.
  - `realesr-general-x4v3.onnx` — model AI dihoskan sendiri (`ai.modelUrl` dalam `config.js`).
  - `nuvapix.html` — versi satu fail untuk Claude Artifact; tidak dideploy.
  - `deploy.sh`, `stamp.sh`, `setup-deploy.sh`, `upload-netkl.sh`, `BACA-SAYA.md` — dalaman; tidak dideploy.
- Teks UI dalam dua bahasa: kemas kini kedua-dua EN dan BM dalam `i18n.js`.

## Akaun pengguna & admin
- `account.js` (klien) + `api/` (PHP + SQLite di hosting): `auth.php` (daftar/log masuk/keluar), `usage.php` (kiraan kuota), `admin.php` (admin sahaja).
- `admin.html` + `admin.js` — papan pemuka admin: tukar pakej Percuma/Asas/Pro, tarikh tamat, set semula kiraan, nyahaktif, tukar kata laluan, padam.
- Pangkalan data: `../nuvapix-data/nuvapix.sqlite` di luar public_html (sandaran: `api/data/`, disekat .htaccess).
- `api/local-config.php` — emel admin + hash bcrypt kata laluan. TIDAK di-commit (.gitignore) tetapi dideploy. Jangan paparkan isinya. Contoh: `api/local-config.example.php`.
- Had kuota di server (`api/lib.php`: FREE_QUOTA, BASIC_QUOTA) mesti sama dengan `config.js` → `plans`.
- Pembayaran belum ada: admin naik taraf pengguna secara manual melalui papan pemuka.
