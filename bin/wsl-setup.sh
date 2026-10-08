#!/usr/bin/env bash
# Instalacja środowiska pod WSL. Skrypt jest idempotentny — można go uruchamiać wielokrotnie.
set -euo pipefail

niebieski() { printf '\033[36m%s\033[0m\n' "$*"; }
zolty()     { printf '\033[33m%s\033[0m\n' "$*"; }
czerwony()  { printf '\033[31m%s\033[0m\n' "$*"; }

KATALOG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$KATALOG"

niebieski "1/5 Sprawdzam położenie projektu"
case "$KATALOG" in
  /mnt/[a-z]/*)
    czerwony "Projekt leży na dysku Windows ($KATALOG)."
    czerwony "Pod WSL oznacza to wielokrotnie wolniejsze operacje na plikach — npm install potrafi trwać minutami zamiast sekund."
    zolty    "Przenieś projekt do systemu plików Linuksa, na przykład do ~/projekty/warsztat, i uruchom skrypt stamtąd."
    exit 1
    ;;
  *) echo "   w porządku: $KATALOG" ;;
esac

niebieski "2/5 Sprawdzam Node.js"
WYMAGANY=$(cat .nvmrc)
if command -v node >/dev/null 2>&1 && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge "$WYMAGANY" ]; then
  echo "   jest $(node -v)"
else
  zolty "   brak Node $WYMAGANY lub nowszego — instaluję przez nvm"
  if [ ! -d "$HOME/.nvm" ]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh"
  nvm install "$WYMAGANY"
  nvm use "$WYMAGANY"
  echo "   zainstalowano $(node -v)"
  zolty "   po zakończeniu otwórz nową powłokę albo wykonaj: . ~/.nvm/nvm.sh"
fi

niebieski "3/5 Instaluję zależności"
if [ -f package-lock.json ]; then npm ci; else npm install; fi

niebieski "4/5 Buduję i uruchamiam testy"
npm run build
npm test

niebieski "5/5 Pierwszy obrót pętli PDCA"
npm run cykl || true

echo
niebieski "Gotowe."
echo "   make start    — serwer roboczy, otwórz http://localhost:8080/pl/ w przeglądarce Windows"
echo "   make cykl     — kontrole i raport"
echo "   make lekarz   — diagnostyka, gdy coś nie działa"
