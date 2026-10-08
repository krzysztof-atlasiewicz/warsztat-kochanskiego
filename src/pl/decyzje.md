---
tytul: Rejestr decyzji
layout: layouts/base.njk
jezyk: pl
para: decyzje
tylkoJeden: true
permalink: /pl/decyzje/
---
# Rejestr decyzji

Każda decyzja merytoryczna: data, treść, uzasadnienie, skutek. Dokument publiczny.

---

## 2026-09-14 — Odwrócenie kolejności faz

**Decyzja:** publikujemy wersję demonstracyjną 0.9 przed przeprowadzeniem kwerend źródłowych.

**Uzasadnienie:** działający serwis jest mocniejszym argumentem w rozmowie z instytucją niż opis zamiaru, a kwerenda prowadzona po zbudowaniu modelu ma konkretną listę parametrów zamiast pytania o wszystko.

**Skutek:** wprowadzenie widocznego oznaczenia statusu wersji, agendy badawczej jako pełnoprawnej sekcji serwisu oraz publicznego rejestru zmian od pierwszego dnia. Przyjęcie trzech nowych ryzyk wizerunkowych, opisanych w planie projektu.

---

## 2026-09-14 — Teza o charakterze warsztatowym konstrukcji cyklometrycznej

**Decyzja:** pozostaje oznaczona jako interpretacja, nie jako ustalenie.

**Uzasadnienie:** Kochański nigdzie nie uzasadnia tak konstrukcji wprost. Teza jest nasza.

**Skutek:** pozycja A4 agendy badawczej; zastrzeżenie widoczne w module cyrkla.

---

## 2026-09-14 — Zakres wykonany w cyklu 2

**Decyzja:** wykonano pełen zakres fazy A możliwy bez udziału człowieka, zgodnie z `pdca/agent.md`.

**Zrobione:** wydzielenie przyrządów do wspólnych partiali i oddzielenie warstwy tekstowej od znaczników; pełna wersja angielska czterech przyrządów i agendy; biografia z jawnie zaznaczonymi rozbieżnościami dat; publiczny rejestr zmian założony przed pierwszą zmianą; wersje osadzalne wszystkich przyrządów w obu językach; ścieżka prowadzona między przyrządami; dwie nowe kontrole automatyczne (parzystość językowa, obecność wersji osadzalnych) i odpowiadające im warunki bramki GA8 i GA9; testy dymne uruchamiające realne moduły na zbudowanych stronach.

**Nie zrobione i nie do zrobienia bez człowieka:** GA1 i GA2. Tłumaczenie angielskie jest roboczym przekładem wymagającym redakcji przez tłumacza znającego terminologię chronometrii; pozycje agendy w wersji angielskiej pozostają po polsku.

**Skutek:** bramka GA ma spełnione wszystkie siedem warunków automatycznych i dwa otwarte warunki ludzkie. Publikacja pozostaje zablokowana.

## 2026-09-14 — Cykl 3: naprawa jedenastu braków technicznych

**Decyzja:** przed przekazaniem serwisu redaktorowi merytorycznemu usunięto braki wykryte w audycie własnym.

**Najważniejsze ustalenie:** kontrola budżetu wydajności mierzyła wyłącznie wagę pliku HTML i przechodziła, podczas gdy strona gnomonu zaciągała w rzeczywistości 418 kB. Kontrola węższa niż jej deklaracja jest gorsza niż jej brak. Kontrola mierzy teraz wszystkie zasoby faktycznie ładowane przez stronę, po kompresji; biblioteka efemeryd jest minifikowana przy budowaniu (402 → 107 kB, po kompresji 43 kB), a najcięższa strona zamyka się w 50 kB.

**Pozostałe naprawy:** strona 404 i mapa witryny (deklarowane w konfiguracji, nieistniejące); skrypt audytu dostępności odwołujący się do nieistniejącej mapy; kontrola parzystości językowej rozszerzona z samych przyrządów na wszystkie strony, z wymogiem jawnego deklarowania wyjątków; usunięcie strony sierocej dublującej agendę; `hreflang` między wersjami; odciski treści i nagłówki cache; słownik dopuszczalnych statusów agendy; poziom ostrzeżeń dla kontroli nieblokujących.

**Przeniesienie:** rejestr decyzji z `pdca/` do `src/pl/decyzje.md` i publikacja pod `/pl/decyzje/`. Nazywaliśmy go publicznym, a nie był publikowany.

**Nienaprawione świadomie:** pliki krojów EB Garamond i IBM Plex Mono nie są osadzone w repozytorium. Kontrola `kroje` zgłasza to jako ostrzeżenie przy każdym cyklu i nie pozwala o tym zapomnieć.

## 2026-09-14 — Cykl 4: lokalizacja rejestru pytań

**Decyzja:** pytania otwarte przestają być osobną listą ogólną, a stają się blokami osadzonymi dokładnie tam, gdzie dotyczą.

**Uzasadnienie:** rejestr trzymany wyłącznie na osobnej stronie wymagał od czytelnika, żeby sam skojarzył ogólne pytanie z konkretnym twierdzeniem. Deklaracja uczciwości działa tylko wtedy, gdy zastrzeżenie stoi przy rzeczy, której dotyczy.

**Skutek:** każda pozycja zyskała pole `dotyczy` — dokładne wskazanie elementu, którego kwestionuje — oraz listę miejsc zamiast listy modułów, dzięki czemu pytanie o rozbieżność dat trafiło na oś czasu w biografii, a nie do przyrządów. Powiązanie jest dwustronne: rejestr odsyła do miejsca, miejsce do rejestru. Kontrola `agenda` wymaga teraz, by pozycja była faktycznie osadzona w każdym zadeklarowanym miejscu i w każdej wersji językowej, oraz wyłapuje osadzone pytania nieistniejące w rejestrze.

## 2026-09-14 — Cykl 5: środowisko robocze pod WSL

**Decyzja:** projekt dostaje własną procedurę uruchomieniową dla Windows z WSL 2, z diagnostyką środowiska i poleceniami skróconymi do jednego słowa.

**Uzasadnienie:** pętla PDCA ma rytm tygodniowy i musi być tania w uruchomieniu. Jeśli obrót cyklu wymaga przypominania sobie sekwencji poleceń, przestanie się odbywać.

**Rozstrzygnięcie techniczne:** projekt ma leżeć w systemie plików Linuksa, nie na `/mnt/c`. Różnica szybkości jest kilkunastokrotna, a serwer roboczy na dysku Windows gubi zmiany w plikach. Skrypt instalacyjny odmawia działania z `/mnt/`, zamiast pozwolić na cichy, wolny tryb pracy.

**Skutek:** `bin/wsl-setup.sh` (idempotentny instalator), `bin/lekarz.sh` (diagnostyka, która nic nie zmienia), `Makefile`, `.gitattributes` wymuszające LF, `WSL.md`. Podgląd stał się poleceniem repozytorium zamiast doraźnego skryptu.

## 2026-09-14 — Cykl 6: próba zimnego startu

**Decyzja:** procedura uruchomieniowa została przejrzana na czystej kopii archiwum, tak jak zrobi to osoba otrzymująca projekt po raz pierwszy.

**Przebieg:** rozpakowanie, `bin/wsl-setup.sh`, `make lekarz`, `make test`, `make podglad`, `make start`, `make czysc` — wszystko bez błędu. Serwer odpowiada na wszystkich sprawdzanych adresach, łącznie z wersją osadzalną, mapą witryny i stroną 404.

**Znaleziony brak:** archiwum nie zawierało `package-lock.json`, więc pierwsza instalacja pobierała wersje zależności z bieżącego stanu rejestru zamiast z zapisanego. Instalacja nieodtwarzalna to w projekcie o dziesięcioletnim horyzoncie poważniejsza wada niż brak funkcji. Plik został dołączony do repozytorium, dzięki czemu `bin/wsl-setup.sh` używa ścieżki `npm ci`.

## 2026-10-08 — Cykl 7: rejestr źródeł i automatyczne odnośniki

**Decyzja:** wzmianki o drukach źródłowych są podlinkowane automatycznie, z jednego rejestru, a kontrola wymusza, by żadna wzmianka nie została bez odnośnika.

**Ustalone źródło:** [*Acta Eruditorum*](https://archive.org/details/s1id13206510/page/394/mode/2up) 1685 — skan egzemplarza Wellcome Library w Internet Archive, Public Domain Mark 1.0, odnośnik otwiera się na stronie 394. Rozprawa Kochańskiego zajmuje strony 394–398 tomu 4. Egzemplarz ma odnotowany błąd paginacji w dalszej części tomu, więc otwarcie trzeba jeszcze sprawdzić wzrokowo.

**Znalezione przy okazji:** Henryk Fukś, równoległy tekst łaciński z przekładem angielskim i przypisami (*Antiquitates Mathematicae* 9:31–65, 2015, preprint na arXiv). To gotowa warstwa transkrypcji, której w projekcie brakowało. Wpisana do rejestru ze statusem licencji „do ustalenia" — nie wykorzystujemy jej, dopóki warunki nie będą znane.

**Zasada:** pozycja bez ustalonego skanu renderuje się jako zwykły tekst, nie jako odnośnik. *Technica curiosa* nie ma jeszcze zlokalizowanego skanu i pozostaje tekstem — pozycja A2 agendy.

## 2026-10-08 — Cykl 8: konfiguracja wdrożenia pod kontrolą

**Zdarzenie:** nadpisanie katalogu projektu nowym archiwum skasowało ustawienia, które istniały wyłącznie na maszynie roboczej — deklarację domeny własnej, datę zgodności i adres serwisu. Wdrożenie przeszło, ale pod adresem roboczym `workers.dev`, a mapa witryny wskazywała adres zastępczy.

**Drugi błąd, w poprawce:** klucze `workers_dev` i `preview_urls` dopisane na koniec pliku trafiły do tabeli `[assets]`, bo w TOML klucz po nagłówku tabeli należy do niej. Wrangler zgłosił to jako nieznane pola, a wyłączenie adresu roboczego zadziałało tylko dlatego, że taka jest wartość domyślna — konfiguracja nie deklarowała niczego.

**Wniosek:** ustawienia wdrożenia nie mogą istnieć wyłącznie na jednej maszynie. Wszystkie trafiły do repozytorium.

**Skutek:** kontrola `wdrozenie` sprawdza, czy `workers_dev` i `preview_urls` są wyłączone i stoją na poziomie głównym pliku, czy zadeklarowana jest domena własna, oraz czy adres w danych serwisu zgadza się z domeną wdrożenia. Ta ostatnia zgodność jest sednem — to jej brak sprawił, że mapa witryny wskazywała gdzie indziej, niż serwis stoi. Kontrola ma test negatywny: klucz umieszczony w złej tabeli zostaje wykryty.

## 2026-10-08 — Cykl 9: poprawki modułu cyrkla

**Uwagi z przeglądu wdrożonej strony i ich rozstrzygnięcia:**

Odnośnik do skanu wyprowadzał czytelnika z serwisu. Skan otwiera się teraz w okienku nad stroną, z paskiem opisu bibliograficznego i odsyłaczem do pełnej wersji w nowej karcie. Odnośnik pozostał zwykłym odnośnikiem — bez skryptu, przy otwarciu w nowej karcie i przy kliknięciu środkowym przyciskiem działa jak dotąd. Zasady bezpieczeństwa treści rozszerzono o ramkę z archive.org i o nic więcej.

Rysunek konstrukcji zajmował ułamek dostępnego pola. Układ współrzędnych powiększono dwukrotnie, a następnie skadrowano do samej zawartości: ramka 595 na 378 obejmuje rysunek z marginesem od dziewięciu do dwudziestu jednostek, czyli wypełnienie 94 procent w obu osiach. Powiększenie bez kadrowania nie wystarczyło — zostawało puste pole nad rysunkiem, bo pierwotna ramka była wyższa niż cokolwiek, co się w niej znajdowało.

Przycisk „Dalej" na ostatnim kroku sugerował ciąg dalszy. Oba przyciski są teraz wygaszane na krańcach.

Wzory zapisane znakiem pierwiastka łamały się w składzie. Przeszły na MathML, obsługiwany natywnie przez przeglądarki, bez zewnętrznej biblioteki.

**Uzupełnienie treści:** brakowało wyprowadzenia wzoru z konstrukcji. Dodano pięciokrokowe wyprowadzenie w obu językach, zwijane, z jawnym zastrzeżeniem, że rachunek jest nasz — Kochański podał konstrukcję i wynik, nie tę algebrę.

## 2026-10-08 — Cykl 10: znak graficzny

**Decyzja:** znakiem serwisu jest sama konstrukcja Kochańskiego sprowadzona do trzech elementów — okrąg styczny do prostej i odcinek biegnący od szczytu okręgu do punktu na tej prostej.

**Uzasadnienie:** znak ma działać przy szesnastu pikselach, więc nie może przedstawiać cyrkla, zegara ani portretu. Okrąg, prosta i odcinek to dokładnie to, o czym jest cały serwis: zamiana krzywej na długość, którą da się odmierzyć. Czytelne w rozmiarze zakładki, a dla kogoś, kto widział moduł cyrkla, rozpoznawalne jako jego streszczenie.

**Wykonanie:** jedno źródło w SVG, z wariantem dla ciemnego motywu. Warianty rastrowe — PNG 32 i 180 oraz ICO z osadzonym PNG — powstają przy każdym budowaniu ze źródła, więc znak i jego odbitki nie mogą się rozejść. Pliki rastrowe nie wchodzą do repozytorium, bo są wytwarzane.

**Skutek:** kontrola `ikony` sprawdza obecność czterech plików i podpięcie znaku na każdej zbudowanej stronie, łącznie z wersjami osadzalnymi. Warunek bramki GA13.
