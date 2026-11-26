#!/bin/zsh
# Upload website Nuvapix ke hosting Netkl (cPanel) melalui FTP.
# Guna:  zsh upload-netkl.sh
# Kata laluan ditaip sendiri (tak dipaparkan, tak disimpan).

cd "$(dirname "$0")" || exit 1

FILES=(index.html styles.css config.js i18n.js upscaler.js zip.js app.js .htaccess realesr-general-x4v3.onnx)

read "FTP_HOST?Hos FTP (cth. ftp.domainanda.com): "
read "FTP_USER?Nama pengguna FTP/cPanel: "
read "FTP_DIR?Folder sasaran [public_html]: "
FTP_DIR=${FTP_DIR:-public_html}
read -s "FTP_PASS?Kata laluan: "
echo

# Simpan login dalam fail sementara (dipadam selepas siap) supaya kata laluan tak keluar dalam senarai proses
NETRC=$(mktemp)
chmod 600 "$NETRC"
print "machine $FTP_HOST login $FTP_USER password $FTP_PASS" > "$NETRC"
unset FTP_PASS
trap 'rm -f "$NETRC"' EXIT

ok=0; fail=0
for f in $FILES; do
  if curl -sS --netrc-file "$NETRC" --ssl-reqd --ftp-create-dirs \
       -T "$f" "ftp://$FTP_HOST/$FTP_DIR/$f"; then
    echo "✓ $f"; ((ok++))
  else
    echo "✗ $f"; ((fail++))
  fi
done

echo
echo "Siap: $ok berjaya, $fail gagal."
[[ $fail -gt 0 ]] && echo "Jika semua gagal dengan ralat SSL, cuba buang '--ssl-reqd' dalam skrip ini."
