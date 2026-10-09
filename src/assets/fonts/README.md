# Kroje pisma

Serwis jest złożony **EB Garamond** (tekst, prosta i kursywa) oraz **IBM Plex Mono** (odczyty liczbowe). Oba na licencji SIL OFL, więc wolno je rozpowszechniać razem z serwisem.

Plików nie ma w repozytorium — są danymi pochodnymi. Powstają przy każdym budowaniu, w `scripts/kroje.mjs`:

1. źródłem są pakiety `@fontsource/eb-garamond` i `@fontsource/ibm-plex-mono`, instalowane przez `npm install`;
2. każdy krój jest obcinany do repertuaru znaków zapisanego w `scripts/kroje-dane.mjs` — pełne pliki ważą razem ponad sto kilobajtów, czyli dwie trzecie budżetu strony, po obcięciu zostaje z nich połowa;
3. fontsource dzieli krój na zakresy Unicode, więc dla każdej rodziny powstają dwa pliki: `latin` i `latin-ext` z polskimi znakami diakrytycznymi, spięte regułami `unicode-range`;
4. nazwa pliku niesie odcisk treści, dlatego nagłówki mogą kazać trzymać kroje rok w pamięci podręcznej — po zmianie repertuaru zmienia się nazwa, a nie zawartość pod starą;
5. deklaracje `@font-face` lądują w `src/assets/css/fonty.css`, też generowanym.

Pojedyncze znaki spoza zakresów łacińskich — π, ≈, strzałki — nie mają glifów w żadnym z plików i renderują się krojem zastępczym. To świadoma zgoda; lista jest w `POZA_KROJEM`.

Kontrola `kroje` sprawdza, że arkusz deklaracji istnieje, że każdy plik, po który sięga, leży na miejscu i ma odcisk w nazwie, oraz że na zbudowanych stronach nie pojawił się znak spoza repertuaru. Ostatnie jest najważniejsze: gdyby ktoś wpisał do tekstu znak, którego w obciętym kroju nie ma, kontrola to zgłosi, zamiast zostawić dziurę w składzie.
