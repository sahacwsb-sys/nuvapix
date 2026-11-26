#!/bin/zsh
# Deploy website ke hosting Netkl melalui FTP.
# Hanya fail yang berubah sejak deploy lepas akan dimuat naik.
#   zsh deploy.sh          -> upload fail yang berubah
#   zsh deploy.sh --all    -> upload semua fail
#   zsh deploy.sh --dry    -> senarai sahaja, tak upload
# Login dibaca dari deploy.conf + macOS Keychain (jalankan setup-deploy.sh dulu).

cd "$(dirname "$0")" || exit 1
[[ -f deploy.conf ]] || { echo "Tiada deploy.conf. Jalankan: zsh setup-deploy.sh"; exit 1; }
source ./deploy.conf

MODE=${1:-}
STATE=.deploy-state

# Fail yang TIDAK dihantar ke hosting
EXCLUDE=(
  ./.DS_Store ./BACA-SAYA.md ./CLAUDE.md ./nuvapix.html ./nuvapix-upload.zip
  ./deploy.sh ./deploy.conf ./setup-deploy.sh ./upload-netkl.sh ./.deploy-state ./.deploy-state.new
)

FTP_PASS=$(security find-generic-password -s nuvapix-ftp -a "$FTP_USER" -w 2>/dev/null) \
  || { echo "Kata laluan tiada dalam Keychain. Jalankan: zsh setup-deploy.sh"; exit 1; }
NETRC=$(mktemp); chmod 600 "$NETRC"
print "machine $FTP_HOST login $FTP_USER password $FTP_PASS" > "$NETRC"
unset FTP_PASS
trap 'rm -f "$NETRC" "$STATE.new"' EXIT

TLS=(); [[ "$FTP_TLS" == 1 ]] && TLS=(--ssl-reqd)

# Senarai fail semasa + hash
: > "$STATE.new"
find . -type f -not -path './.git/*' -not -path './.claude/*' -not -name '.DS_Store' | sort | while read -r f; do
  (( ${EXCLUDE[(Ie)$f]} )) && continue
  print "$(shasum -a 256 "$f" | cut -d' ' -f1) $f" >> "$STATE.new"
done

typeset -a todo
while read -r h f; do
  if [[ "$MODE" == --all ]] || ! grep -qxF "$h $f" "$STATE" 2>/dev/null; then todo+=("$f"); fi
done < "$STATE.new"

if (( ${#todo} == 0 )); then echo "Tiada perubahan untuk deploy."; exit 0; fi

echo "Fail untuk upload (${#todo}):"; printf '  %s\n' "${todo[@]#./}"
[[ "$MODE" == --dry ]] && exit 0

fail=0
for f in "${todo[@]}"; do
  rel=${f#./}
  if curl -sS --netrc-file "$NETRC" $TLS --ftp-create-dirs -T "$f" "ftp://$FTP_HOST/$FTP_DIR/$rel"; then
    echo "✓ $rel"
  else
    echo "✗ $rel"; fail=1
  fi
done

if (( fail )); then
  echo "Ada fail gagal. Status deploy tidak dikemas kini — jalankan semula."
  exit 1
fi
mv "$STATE.new" "$STATE"

# Semak website live
code=$(curl -sS -o /dev/null -w "%{http_code}" -m 15 -A "Mozilla/5.0 (Macintosh) Chrome/131" "$SITE_URL/")
echo "Website $SITE_URL -> HTTP $code"
[[ "$code" == 200 ]] || exit 1
echo "✓ Live."
