# Agent autonomiczny — zakres uprawnień

Dokument określa, co system zautomatyzowany może robić samodzielnie w tym projekcie. Obowiązuje niezależnie od tego, czy zadanie wykonuje człowiek z narzędziem, czy agent pracujący bez nadzoru.

## Wolno samodzielnie

- Uruchamiać cykl, testy, budowę i kontrole; naprawiać usterki, które one zgłaszają.
- Refaktoryzować kod bez zmiany zachowania, pod warunkiem że testy przechodzą przed i po.
- Dodawać testy, w szczególności testy odtwarzające wartości historyczne.
- Poprawiać dostępność: kolejność ogniskowania, etykiety, obszary `aria-live`, obsługę klawiaturą.
- Poprawiać wydajność w granicach budżetu.
- Usuwać martwe odsyłacze, literówki, niespójności formatowania.
- Redagować tekst pod kątem stylu, **nie zmieniając treści twierdzeń**.
- Przygotowywać propozycje zmian merytorycznych jako wpis do rejestru decyzji ze statusem „do rozstrzygnięcia".

## Nie wolno bez decyzji człowieka

- Zmieniać, dodawać ani usuwać twierdzenia o faktach historycznych.
- Zmieniać oznaczenia z „rekonstrukcja" lub „interpretacja" na „źródło".
- Zamykać pozycji agendy badawczej.
- Usuwać ani osłabiać oznaczenia statusu wersji i zastrzeżeń.
- Odhaczać warunku bramki typu `ludzki`.
- Publikować, wdrażać na adres produkcyjny, wysyłać korespondencji do instytucji.
- Osadzać skanów ani innych materiałów bez potwierdzonej licencji.
- Dodawać nowego modułu poza zamkniętą listą sześciu przyrządów.

## Zasada nadrzędna

W razie wątpliwości, czy zmiana dotyczy formy czy treści — **traktować jako treść** i eskalować. Koszt niepotrzebnej eskalacji to kilka minut czyjejś uwagi. Koszt cichej zmiany twierdzenia historycznego to wiarygodność całego projektu, czyli jedyna rzecz, której ten projekt nie może odbudować.

## Kryterium zatrzymania

Agent zatrzymuje pracę i eskaluje, gdy:

- ta sama usterka wraca w trzech kolejnych cyklach — oznacza to problem projektowy, nie wykonawczy;
- naprawa usterki wymagałaby zmiany twierdzenia merytorycznego;
- test odtwarzający wartość historyczną zaczyna nie przechodzić — to sygnał, że zmienił się model, a nie kod;
- liczba otwartych usterek rośnie przez dwa cykle z rzędu.
