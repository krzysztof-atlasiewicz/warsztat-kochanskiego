# Uruchomienie pod WSL — krok po kroku

Instrukcja dla Windows z WSL 2. Każdy krok to jedno polecenie do wklejenia. Nie przechodź dalej, dopóki poprzedni krok nie zakończy się bez błędu.

---

## Krok 1 — WSL i Ubuntu (PowerShell jako administrator)

```powershell
wsl --install -d Ubuntu
```

Jeśli WSL jest już zainstalowany, upewnij się, że to wersja 2:

```powershell
wsl --set-default-version 2
```

Po instalacji uruchom Ubuntu z menu Start i załóż konto użytkownika.

---

## Krok 2 — narzędzia systemowe (Ubuntu)

```bash
sudo apt update && sudo apt install -y curl git build-essential unzip
```

---

## Krok 3 — miejsce na projekt

**To jest najważniejszy krok w całej instrukcji.** Projekt musi leżeć w systemie plików Linuksa, nie na dysku Windows pod `/mnt/c`. Różnica w szybkości operacji na plikach jest kilkunastokrotna — `npm install` na `/mnt/c` potrafi trwać kilka minut zamiast kilkunastu sekund, a serwer roboczy gubi zmiany w plikach.

```bash
mkdir -p ~/projekty && cd ~/projekty
```

---

## Krok 4 — rozpakowanie projektu

Jeśli masz archiwum na dysku Windows, w katalogu Pobrane:

```bash
unzip /mnt/c/Users/$(cmd.exe /c echo %USERNAME% 2>/dev/null | tr -d '\r')/Downloads/warsztat-kochanskiego.zip -d ~/projekty && cd ~/projekty/warsztat
```

Gdyby ścieżka się nie zgadzała, podaj ją ręcznie:

```bash
cd ~/projekty && unzip /mnt/c/pełna/ścieżka/warsztat-kochanskiego.zip && cd warsztat
```

---

## Krok 5 — instalacja

```bash
bash bin/wsl-setup.sh
```

Skrypt sprawdzi położenie projektu, w razie potrzeby zainstaluje Node przez nvm, pobierze zależności, zbuduje serwis, uruchomi testy i wykona pierwszy obrót pętli PDCA. Można go uruchamiać wielokrotnie.

Jeśli skrypt zainstalował Node, otwórz nową powłokę albo wykonaj `. ~/.nvm/nvm.sh` i powtórz krok.

---

## Krok 6 — serwer roboczy

```bash
make start
```

Otwórz w przeglądarce Windows: **http://localhost:8080/pl/**

WSL 2 przekierowuje port automatycznie, nic nie trzeba konfigurować. Zatrzymanie: Ctrl+C.

---

## Codzienna praca

| Polecenie | Co robi |
|---|---|
| `make start` | serwer roboczy z przeładowaniem po zmianie pliku |
| `make cykl` | budowa, testy, kontrole, raport do `pdca/cykle/` |
| `make podglad` | jeden plik HTML do wysłania komuś — `_podglad/podglad-warsztatu.html` |
| `make test` | same testy |
| `make lekarz` | diagnostyka, gdy coś przestało działać |
| `make czysc` | usunięcie katalogów wytworzonych przy budowaniu |

Podgląd skopiujesz na pulpit Windows tak:

```bash
cp _podglad/podglad-warsztatu.html /mnt/c/Users/$(cmd.exe /c echo %USERNAME% 2>/dev/null | tr -d '\r')/Desktop/
```

---

## Cotygodniowy obrót pętli

Pętla PDCA ma rytm tygodniowy. Żeby nie polegać na pamięci, dodaj zadanie w Harmonogramie zadań Windows — polecenie do uruchomienia:

```
wsl.exe -d Ubuntu -- bash -lc "cd ~/projekty/warsztat && npm run cykl"
```

Raport wyląduje w `pdca/cykle/`. Cron wewnątrz WSL też zadziała, ale tylko gdy dystrybucja jest uruchomiona — Harmonogram Windows jest pewniejszy.

---

## Wdrożenie

```bash
npm i -D wrangler
npx wrangler login
make wdroz
```

`wrangler login` otworzy przeglądarkę Windows. Gdyby nie otworzył, skopiuj wypisany adres ręcznie.

---

## Kiedy coś nie działa

**`bin/wsl-setup.sh: /bin/bash^M: bad interpreter`** — pliki mają końce linii Windows. Naprawa:

```bash
sed -i 's/\r$//' bin/*.sh && git config core.autocrlf false
```

**`npm install` trwa bardzo długo** — projekt leży na `/mnt/c`. Przenieś go do `~/projekty` i powtórz krok 5.

**Serwer nie widzi zmian w plikach** — ta sama przyczyna co wyżej.

**Moduł gnomonu pokazuje dziwne godziny** — Node bez pełnych danych ICU. Sprawdzi to `make lekarz`.

**`localhost:8080` nie odpowiada z Windows** — restart podsystemu z PowerShell:

```powershell
wsl --shutdown
```

Następnie uruchom Ubuntu ponownie i powtórz `make start`.
