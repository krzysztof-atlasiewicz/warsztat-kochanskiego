# Warsztat Kochańskiego

Serwis interaktywny o Adamie Adamandym Kochańskim (1631–1700) — matematyku, fizyku i zegarmistrzu na dworze Jana III Sobieskiego. Cztery przyrządy do samodzielnego uruchomienia: konstrukcja rektyfikacji okręgu, porównanie wahadła ze sprężyną na trasie rejsu, tarcza szyfrowa i zegar słoneczny z Wilanowa.

## Uruchomienie

Pod Windows z WSL: **[WSL.md](WSL.md)** — instrukcja krok po kroku, jedno polecenie na krok.

Pod Linuksem i macOS:

    bash bin/wsl-setup.sh   # instalacja, budowa, testy, pierwszy cykl
    make start              # http://localhost:8080/pl/
    make cykl               # kontrole i raport
    make podglad            # jednoplikowy podgląd do wysłania
    make lekarz             # diagnostyka środowiska

## Wdrożenie

Cloudflare Workers ze statycznymi zasobami (`wrangler.toml`). Cloudflare kieruje nowe projekty na Workers zamiast Pages — Pages pozostaje wspierane, ale rozwój idzie w Workers.

    npm run deploy

Output to czyste pliki statyczne, więc hosting jest decyzją odwracalną: `_site/` można wrzucić na dowolny serwer WWW.

## Architektura

- **Eleventy** jako generator. Wybrany dla trwałości: czysty JS, minimum zmian łamiących kompatybilność. Serwis ma przetrwać dekadę bez zespołu utrzymaniowego.
- **Bez frameworka po stronie przeglądarki.** Moduły to zwykłe moduły ES, ładowane leniwie przez `src/assets/js/bootstrap.js`. Awaria jednego nie dotyka pozostałych — przyrząd degraduje się do równoważnika tekstowego.
- **Warstwa obliczeniowa oddzielona od DOM** (`modules/matematyka.js`), dzięki czemu da się ją testować bez przeglądarki.
- **astronomy-engine** (MIT) do efemeryd słonecznych. Zastępuje wzory przybliżone: pozycja Słońca, wschody i zachody, przejścia czasu letniego w strefie Europe/Warsaw. Minifikowana przy budowaniu (`npm run libs`, esbuild) — 402 kB źródła schodzi do 107 kB, po kompresji 43 kB.
- **Budżet wagi liczony realnie.** Kontrola `budzet` sumuje HTML i wszystkie zasoby, które strona faktycznie zaciąga, po kompresji. Najcięższa strona (gnomon, z biblioteką efemeryd) mieści się w 50 kB.

## Dostępność

Każdy przyrząd ma pełny równoważnik tekstowy (`rownowaznik` we front matter), odczyty liczbowe w obszarach `aria-live`, obsługę wyłącznie klawiaturą i respektuje `prefers-reduced-motion`. CI uruchamia `pa11y-ci` na wszystkich stronach. Docelowo WCAG 2.1 AA z audytem manualnym.

## Kroje pisma

CSS zakłada EB Garamond i IBM Plex Mono. Plików nie ma w repozytorium — szczegóły i nazwy w `src/assets/fonts/README.md`. `npm run libs` generuje `@font-face` wyłącznie dla plików faktycznie obecnych, więc brak krojów nie powoduje żądań o nieistniejące zasoby. Kontrola `kroje` zgłasza to jako ostrzeżenie przy każdym cyklu.

## Czego tu jeszcze nie ma

- Facsimiliów źródłowych. Bez nich to demonstracja mechaniki, nie praca ze źródłem. Docelowo OpenSeadragon + manifesty IIIF instytucji przechowujących.
- Tłumaczenia angielskiego przyrządów (`src/en/` zawiera na razie sam szkielet struktury).
- Modułów mechanizmu (dziewięć typów zegarów z księgi IX) i republiki listów.

## Licencje

Kod: MIT. Treść: CC BY-SA 4.0. Zależność `astronomy-engine`: MIT.

## Zastrzeżenie merytoryczne

Żadne źródło pierwotne nie zostało dotąd sprawdzone z autopsji. Moduł szyfru jest rekonstrukcją metody, nie odczytem oryginału. Geometria zegara wilanowskiego zakłada ścianę dokładnie południową. Szczegóły w `/pl/zrodla/` oraz w osobnej notce historycznej.

## Prowadzenie projektu

Projekt działa w pętli PDCA z automatycznym krokiem kontrolnym:

    npm run cykl

Uruchamia testy, budowę i pięć kontroli treści, ocenia warunki bieżącej bramki i zapisuje raport do `pdca/cykle/`. Szczegóły w `pdca/README.md`, zakres uprawnień automatyzacji w `pdca/agent.md`.

Warunki bramek oznaczone jako ludzkie nigdy nie są odhaczane automatycznie. Pozycję agendy badawczej zamyka wyłącznie człowiek, wpisem do `src/pl/decyzje.md`.
