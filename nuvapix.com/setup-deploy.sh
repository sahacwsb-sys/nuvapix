#!/bin/zsh
# Sekali sahaja: simpan maklumat FTP Netkl.
#  - Hos, nama pengguna & folder  -> fail deploy.conf (bukan rahsia)
#  - Kata laluan                  -> macOS Keychain (selamat, tak disimpan dalam folder projek)
# Guna:  zsh setup-deploy.sh

cd "$(dirname "$0")" || exit 1

read "FTP_HOST?Hos FTP (cth. ftp.nuvapix.com): "
read "FTP_USER?Nama pengguna FTP/cPanel: "
read "FTP_DIR?Folder sasaran [public_html]: "
FTP_DIR=${FTP_DIR:-public_html}

cat > deploy.conf <<EOF
FTP_HOST="$FTP_HOST"
FTP_USER="$FTP_USER"
FTP_DIR="$FTP_DIR"
SITE_URL="https://nuvapix.com"
# Tukar kepada 0 jika server tak sokong FTP over TLS
FTP_TLS=1
EOF

echo "Taip kata laluan FTP (akan disimpan dalam Keychain):"
security add-generic-password -U -s nuvapix-ftp -a "$FTP_USER" -w || { echo "Gagal simpan dalam Keychain"; exit 1; }

echo "✓ Siap. Uji dengan:  zsh deploy.sh --all"
