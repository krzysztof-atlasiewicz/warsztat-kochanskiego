# Kroje pisma

Serwis jest zaprojektowany na **EB Garamond** (tekst, prosta i kursywa) oraz **IBM Plex Mono** (odczyty liczbowe). Oba na licencji SIL OFL, więc wolno je rozpowszechniać razem z serwisem.

Plików nie ma w repozytorium — trzeba je pobrać i umieścić tutaj pod nazwami:

- `EBGaramond.woff2`
- `EBGaramond-Italic.woff2`
- `IBMPlexMono.woff2`

`npm run libs` generuje deklaracje `@font-face` wyłącznie dla plików, które faktycznie tu leżą. Bez nich serwis nie zgłasza błędu i nie wysyła żądań o nieistniejące zasoby — korzysta z krojów zastępczych, ale wygląda inaczej, niż został zaprojektowany. Kontrola `kroje` zgłasza to jako brak.
