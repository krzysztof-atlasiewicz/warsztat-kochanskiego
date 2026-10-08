# Pętla PDCA — instrukcja prowadzenia projektu

System, który sam sprawdza swój stan i sam wskazuje następny krok, ale **nie sam decyduje o merytoryce**. Podział jest celowy i wynika z natury projektu: kod można weryfikować automatycznie, twierdzeń o przeszłości nie można.

## Obrót cyklu

Jeden cykl to tydzień.

**Planuj** — otwarcie cyklu. Wybór zadań z usterek poprzedniego raportu i z agendy badawczej. Usterki mają pierwszeństwo przed nową funkcjonalnością; to reguła, nie preferencja.

**Wykonaj** — praca. Agent autonomiczny może wykonywać zadania z listy dozwolonej (patrz `agent.md`), człowiek resztę.

**Sprawdź** — `npm run cykl`. Uruchamia testy, budowę i pięć kontroli treści, ocenia warunki bieżącej bramki i zapisuje raport do `pdca/cykle/`. Krok w pełni automatyczny.

**Popraw** — raport kończy się listą następnych działań. Usterki automatyczne wracają do „Planuj" następnego cyklu. Warunki oznaczone jako ludzkie są eskalowane, nigdy odhaczane przez automat.

## Co sprawdza automat

| Kontrola | Co weryfikuje |
|---|---|
| `oznaczenia` | Każda strona przyrządu ma oznaczenia źródło/rekonstrukcja/interpretacja i równoważnik tekstowy; każda rekonstrukcja ma wyróżnione zastrzeżenie w treści, a nie tylko w stopce |
| `agenda` | Spójność agendy z modułami w obie strony: pozycja nie wskazuje nieistniejącego modułu, moduł nie pomija dotyczącej go pozycji |
| `status` | Oznaczenie wersji demonstracyjnej obecne na każdej zbudowanej stronie |
| `budzet` | Waga strony poniżej 150 kB |
| `linki` | Brak martwych odsyłaczy wewnętrznych |

Plus testy jednostkowe warstwy obliczeniowej i powodzenie budowy.

Kontrola `agenda` jest tu najważniejsza. To ona pilnuje, żeby deklarowana uczciwość nie rozjechała się z treścią: gdy ktoś doda moduł, którego dotyczy otwarte pytanie, i nie połączy ich, cykl zgłosi błąd.

## Czego automat nie sprawdzi i nie należy udawać, że sprawdza

- Czy twierdzenie jest prawdziwe.
- Czy sformułowanie nie przechyla się w stronę przechwałki.
- Czy rekonstrukcja jest uczciwa wobec stanu wiedzy.
- Czy moduł jest zrozumiały dla osoby korzystającej z czytnika ekranu.

Te cztery rzeczy są warunkami ludzkimi bramek. System je pokazuje jako otwarte tak długo, aż człowiek ich nie zamknie — i to jest właściwe zachowanie, nie niedoróbka.

## Bramki

Stan bramki żyje w `pdca/stan.json`. Warunki typu `automat` są przeliczane w każdym cyklu. Warunki typu `ludzki` zmienia wyłącznie człowiek, wpisując równocześnie uzasadnienie do `src/pl/decyzje.md`. Przejście fazy jest decyzją, nie skutkiem przejścia testów.

## Agenda badawcza

`pdca/agenda.json` jest jednocześnie źródłem danych dla strony `/pl/agenda/`. Jedna zmiana w pliku aktualizuje kontrolę spójności, raport cyklu i treść publiczną. Pozycję zamyka wyłącznie człowiek, z podaniem źródła w rejestrze decyzji.

## Rejestr decyzji

`src/pl/decyzje.md` — każda decyzja merytoryczna z datą, uzasadnieniem i skutkiem. Publikowany razem z serwisem. To jest dowód metody, a nie dokumentacja wewnętrzna.
