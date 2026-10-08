#!/usr/bin/env bash
# Diagnostyka środowiska. Nic nie zmienia — tylko sprawdza i mówi, co poprawić.
set -uo pipefail

ok()   { printf '\033[32m  OK   \033[0m%s\n' "$*"; }
uwaga(){ printf '\033[33m UWAGA \033[0m%s\n' "$*"; }
zle()  { printf '\033[31m BŁĄD  \033[0m%s\n' "$*"; USTEREK=$((USTEREK+1)); }
USTEREK=0

KATALOG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$KATALOG"

echo "Diagnostyka środowiska — Warsztat Kochańskiego"
echo

if grep -qi microsoft /proc/version 2>/dev/null; then
  ok "działa pod WSL: $(grep -oi 'WSL[0-9]*' /proc/version | head -1 || echo WSL)"
else
  uwaga "to nie wygląda na WSL — reszta sprawdzeń nadal obowiązuje"
fi

case "$KATALOG" in
  /mnt/[a-z]/*) zle "projekt na dysku Windows ($KATALOG) — przenieś do ~/ , inaczej npm będzie bardzo wolny" ;;
  *)            ok  "projekt w systemie plików Linuksa" ;;
esac

if command -v node >/dev/null 2>&1; then
  WER=$(node -p 'process.versions.node.split(".")[0]')
  if [ "$WER" -ge "$(cat .nvmrc)" ]; then ok "Node $(node -v)"; else zle "Node $(node -v) — wymagany $(cat .nvmrc) lub nowszy"; fi
else
  zle "brak Node — uruchom: make setup"
fi

if [ -d node_modules ]; then ok "zależności zainstalowane"; else zle "brak node_modules — uruchom: make setup"; fi

if node -e 'process.exit(new Intl.DateTimeFormat("pl-PL",{timeZone:"Europe/Warsaw"}).format(new Date()).length?0:1)' 2>/dev/null; then
  ok "obsługa strefy Europe/Warsaw i lokalizacji pl-PL"
else
  zle "Node bez pełnych danych ICU — moduł gnomonu policzy złe godziny"
fi

if [ -n "$(find bin -name '*.sh' -exec grep -l $'\r' {} + 2>/dev/null)" ]; then
  zle "skrypty w bin/ mają końce linii CRLF — wykonaj: sed -i 's/\r$//' bin/*.sh oraz git config core.autocrlf false"
else
  ok "końce linii w skryptach"
fi

BRAK=0
for f in EBGaramond.woff2 EBGaramond-Italic.woff2 IBMPlexMono.woff2; do
  [ -f "src/assets/fonts/$f" ] || BRAK=$((BRAK+1))
done
if [ "$BRAK" -eq 0 ]; then ok "kroje pisma osadzone"; else uwaga "brak $BRAK plików krojów — serwis działa na krojach zastępczych (szczegóły w src/assets/fonts/README.md)"; fi

if command -v wrangler >/dev/null 2>&1 || [ -x node_modules/.bin/wrangler ]; then
  ok "wrangler dostępny"
else
  uwaga "brak wrangler — potrzebny dopiero do wdrożenia: npm i -D wrangler"
fi

echo
if [ "$USTEREK" -eq 0 ]; then
  printf '\033[32mŚrodowisko gotowe.\033[0m\n'
else
  printf '\033[31mUsterek do naprawy: %s\033[0m\n' "$USTEREK"
  exit 1
fi
