#!/bin/zsh
# Kemas kini tag versi (?v=<hash>) pada fail CSS/JS dalam index.html,
# supaya browser pelawat terus ambil versi baharu selepas deploy.
# Hash diambil dari isi fail, jadi tag hanya berubah bila fail itu berubah.
#   zsh stamp.sh
# Dijalankan automatik oleh deploy.sh. Jalankan juga sebelum commit.

cd "$(dirname "$0")" || exit 1

for f in styles.css config.js i18n.js upscaler.js zip.js app.js; do
  [[ -f "$f" ]] || { echo "Tiada $f"; exit 1; }
  h=$(shasum -a 256 "$f" | cut -c1-8)
  # Padankan src="f" / href="f" dengan atau tanpa ?v=... sedia ada
  sed -i '' -E "s#(src|href)=\"${f//./\\.}(\\?v=[0-9a-f]+)?\"#\\1=\"$f?v=$h\"#" index.html
done
