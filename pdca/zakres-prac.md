# Zakres prac wykonywanych bez decyzji merytorycznej

Dokument określa, co w tym projekcie wolno wykonać samodzielnie, a co wymaga rozstrzygnięcia kierownika projektu. Granica przebiega między formą a treścią, nie między wykonawcami: obowiązuje tak samo przy pracy ręcznej, jak przy pracy zautomatyzowanej, bo chroni nie przed czyjąś niestarannością, tylko przed cichą zmianą twierdzenia o przeszłości.

## Wolno samodzielnie

- Uruchamiać cykl, testy, budowę i kontrole; naprawiać usterki, które one zgłaszają.
- Refaktoryzować kod bez zmiany zachowania, pod warunkiem że testy przechodzą przed i po.
- Dodawać testy, w szczególności testy odtwarzające wartości historyczne.
- Poprawiać dostępność: kolejność ogniskowania, etykiety, obszary `aria-live`, obsługę klawiaturą.
- Poprawiać wydajność w granicach budżetu.
- Usuwać martwe odsyłacze, literówki, niespójności formatowania.
- Redagować tekst pod kątem stylu, **nie zmieniając treści twierdzeń**.
- Przygotowywać propozycje zmian merytorycznych jako wpis do rejestru decyzji ze statusem „do rozstrzygnięcia".

## Nie wolno bez decyzji kierownika projektu

- Zmieniać, dodawać ani usuwać twierdzenia o faktach historycznych.
- Zmieniać oznaczenia z „rekonstrukcja" lub „interpretacja" na „źródło".
- Zamykać pozycji agendy badawczej.
- Usuwać ani osłabiać oznaczenia statusu wersji i zastrzeżeń.
- Odhaczać warunku bramki typu `ludzki`.
- Publikować, wdrażać na adres produkcyjny, wysyłać korespondencji do instytucji.
- Osadzać skanów ani innych materiałów bez potwierdzonej licencji.
- Dodawać nowego modułu poza zamkniętą listą sześciu przyrządów.
- Wpisywać adresu zewnętrznego bez potwierdzenia, że istnieje. Potwierdzenie
  zapisuje się w `sprawdz/objasnienia-sprawdzone.json`; środowisko robocze nie
  ma dostępu do sieci i nie wolno mu w tej sprawie wierzyć na słowo.

## Zasada nadrzędna

W razie wątpliwości, czy zmiana dotyczy formy czy treści — **traktować jako treść** i eskalować. Koszt niepotrzebnej eskalacji to kilka minut czyjejś uwagi. Koszt cichej zmiany twierdzenia historycznego to wiarygodność całego projektu, czyli jedyna rzecz, której ten projekt nie może odbudować.

## Kryterium zatrzymania

Pracę zatrzymuje się i eskaluje, gdy:

- ta sama usterka wraca w trzech kolejnych cyklach — oznacza to problem projektowy, nie wykonawczy;
- naprawa usterki wymagałaby zmiany twierdzenia merytorycznego;
- test odtwarzający wartość historyczną zaczyna nie przechodzić — to sygnał, że zmienił się model, a nie kod;
- liczba otwartych usterek rośnie przez dwa cykle z rzędu.

## O nazewnictwie w tym dokumencie

Dokument mówi o pracach, nie o wykonawcach, i jest to decyzja redakcyjna z 11 października 2026, opisana w rejestrze decyzji. Nie znaczy to, że prace w tym projekcie wykonuje wyłącznie człowiek — znaczy, że regulamin wiąże ze względu na rodzaj zmiany, a nie ze względu na to, kto ją wprowadza. Gdyby wiązał ze względu na wykonawcę, pierwsza zmiana wprowadzona inaczej niż dotąd wypadłaby spod niego.
