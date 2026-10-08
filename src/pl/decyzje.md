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

**Zasada:** pozycja bez ustalonego skanu renderuje się jako zwykły tekst, nie jako odnośnik. [*Technica curiosa*](https://archive.org/details/gri_pgasparissch00scho) nie ma jeszcze zlokalizowanego skanu i pozostaje tekstem — pozycja A2 agendy.

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

## 2026-10-08 — Cykl 11: wzory w opisie tekstowym

**Decyzja:** opis tekstowy przyrządu, czyli równoważnik dla osób niekorzystających z rysunku, też przechodzi na MathML.

**Uzasadnienie:** zapis znakiem pierwiastka łamał się w składzie, a czytnik ekranu odczytywał go jako pojedynczy znak, nie jako działanie. Równoważnik tekstowy, który jest gorzej czytelny niż to, co zastępuje, mija się z celem.

**Skutek:** kontrola `wzory` zgłasza każdy znak pierwiastka pozostały w gotowej stronie poza elementami MathML. Ma test negatywny: celowo wstawiony znak zostaje wykryty, również w wersji osadzalnej. Warunek bramki GA14.

## 2026-10-08 — Cykl 12: szyfr jako narzędzie dwukierunkowe

**Decyzja:** moduł szyfru przestaje być pokazem jednego zapisu, a staje się działającym narzędziem — szyfruje i odszyfrowuje dowolny tekst, łamie zapis bez znajomości klucza i pozwala przesłać komuś sam szyfrogram odnośnikiem.

**Uzasadnienie:** dotychczasowa wersja pozwalała wyłącznie obrócić pierścień i odsłonić jedno przygotowane zdanie. Użytkownik oglądał metodę, zamiast jej użyć — a cała koncepcja serwisu opiera się na tym, że najpierw się próbuje, potem czyta.

**Co doszło merytorycznie:** łamanie przez analizę częstości liter, z profilami dla polskiego, angielskiego i łaciny w pisowni klasycznej. To nie jest gadżet, tylko puenta modułu: szyfr przesuwający daje się złamać bez zgadywania, więc nie służył trwałemu ukryciu wynalazku, lecz zabezpieczeniu pierwszeństwa do chwili ujawnienia. Odnośnik przenosi zapis, ale nie klucz — ta asymetria jest sednem całej praktyki.

**Granica rekonstrukcji bez zmian:** nadal nie wiemy, jakiego rodzaju zapisu Kochański faktycznie użył. Pozycja A2 agendy pozostaje otwarta, a jej opis uściślono: narzędzie zostanie, zmieni się tylko zapis, który wczytuje.

**Testy:** osiem nowych, w tym złamanie zapisu łacińskiego z 1664 roku oraz tekstów polskiego i angielskiego. Łącznie 36.

## 2026-10-08 — Cykl 13: pamięć podręczna modułów

**Zdarzenie:** po wdrożeniu nowego narzędzia szyfrującego tarcza pozostawała pusta, a pola nie reagowały na pisanie. Nic się nie uruchamiało i nie pojawiał się żaden komunikat.

**Przyczyna:** moduły ładowane leniwie nie mają odcisku treści w adresie, bo importuje je kod, nie znacznik w HTML. Dostawały jednak godzinną pamięć podręczną. Przeglądarka pobierała świeży dokument i świeży moduł przyrządu, ale stary moduł obliczeniowy — bez funkcji, których nowy przyrząd od niego wymaga. Import nie przechodzi wtedy na etapie wiązania, więc moduł nie wykonuje ani jednej instrukcji i zabezpieczenie w loaderze, które miało wyświetlić komunikat, też nie zdąża zadziałać.

**Rozstrzygnięcie:** długa pamięć podręczna przysługuje wyłącznie plikom pobieranym z odciskiem treści w adresie — arkuszom stylów, krojom i modułowi startowemu. Reszta kodu jest sprawdzana przy każdym wejściu.

**Skutek:** kontrola `pamiec` porównuje reguły z pliku nagłówków z tym, jak strony faktycznie pobierają zasoby, i zgłasza każdy plik oznaczony jako niezmienny, a pobierany bez odcisku. Ma test negatywny. Warunek bramki GA15.

## 2026-10-08 — Cykl 14: zachodzące reguły nagłówków

**Zdarzenie:** po poprawce moduł startowy otrzymywał nagłówek `public, no-cache, public, max-age=31536000, immutable` — dwie sprzeczne dyrektywy naraz.

**Przyczyna:** przy kilku pasujących wzorcach Cloudflare skleja nagłówki, zamiast pozwolić bardziej szczegółowej regule nadpisać ogólniejszą. Reguła dla `/assets/js/*` i osobna dla `/assets/js/bootstrap.js` zachodziły na siebie.

**Rozstrzygnięcie:** żadne dwie reguły nie mogą obejmować tego samego pliku. Moduł startowy traci długą pamięć podręczną — waży poniżej kilobajta, więc sprawdzanie go przy wejściu nic nie kosztuje, a brak wyjątku usuwa całą klasę takich pomyłek.

**Skutek:** kontrola `pamiec` wykrywa teraz również zachodzące wzorce, nie tylko brak odcisku treści. Test negatywny: przywrócenie usuniętej reguły zostaje zgłoszone.

## 2026-10-08 — Cykl 15: skan Technica curiosa i czytelność szyfru

**Odnalezione źródło:** pełny skan tomu *Technica curiosa* z 1664 roku, egzemplarz Getty Research Institute w Internet Archive, domena publiczna. Wzmianki o dziele są teraz podlinkowane tak samo jak „Acta Eruditorum", a skan otwiera się w okienku nad stroną.

**Poprawka faktograficzna:** dotąd podawaliśmy miejsce wydania jako Würzburg. Schott tam pracował, ale druk ukazał się w Norymberdze. Poprawione na obu stronach modułu.

**Uściślenie pozycji A2:** pytanie przestaje brzmieć „gdzie znaleźć skan", a zaczyna „na której stronie tego skanu zaczyna się księga IX i jaką postać ma w niej zapis szyfrowy". Kwerenda zrobiła się węższa i wykonalna.

**Czytelność mechanizmu — trzy zmiany:**

Pasek odwzorowania pod tarczą pokazuje tę samą tarczę rozwiniętą w linię: górny wiersz to litery wiadomości, dolny litery zapisu. Kolumny liter faktycznie występujących w wiadomości są wyróżnione, a kliknięcie kolumny podświetla tę parę również na tarczy i wypisuje ją słownie. Dotąd związek między obracanym pierścieniem a tekstem w polach nie był widoczny wcale.

Przyciski dostały opisy w dymkach — co dokładnie robią i, w przypadku odnośnika, czego nie przenoszą.

Dodano rozwijany wykład „jak to odszyfrować bez klucza", liczony na bieżąco z wpisanego zapisu, nie na przykładzie: liczba liter, najczęstsza litera zapisu, najczęstsza litera języka, wynikający z nich pierwszy kandydat, ranking trzech najlepszych obrotów z ocenami i odczyt.

**Rzecz, której nie ukrywamy:** przy zapisie z 1664 roku pierwszy kandydat wskazuje obrót 25, a prawidłowy jest 12. Pojedyncza litera myli przy krótkim tekście, ocena całego odczytu już nie. Wykład dopisuje to zdanie sam, kiedy kandydat przegrywa — metoda pokazana wraz z jej zawodnością uczy więcej niż metoda pokazana wyłącznie na przykładzie, w którym akurat działa.

## 2026-10-08 — Cykl 16: tarcza obracana wprost

**Decyzja:** suwak pod tarczą znika. Pierścień obraca się przez chwycenie go wskaźnikiem, przewinięcie kółkiem myszy albo strzałkami po ustawieniu na nim kursora klawiaturą.

**Uzasadnienie:** suwak był obcym elementem w przyrządzie, który z definicji jest kołem. Obracanie poziomego paska, żeby obrócić tarczę, wymagało od użytkownika przekładu, którego tu nie powinno być.

**Dostępność:** tarcza ma rolę suwaka, wartość i opis słowny aktualizowany przy każdym ruchu, więc czytnik ekranu zapowiada „przekręcony o dwanaście pozycji" zamiast odczytywać liczbę bez kontekstu. Obsługa strzałkami, PageUp i PageDown, Home i End. Ani jedna funkcja nie wymaga myszy.

**Forma:** tarcza przeszła na konwencję przyrządu warsztatowego — mosiężna oprawa z radełkowaną krawędzią, grawerowana płyta z czterema wkrętami, podziałka między literami, gilosz pod piastą, wskazówka na ruchomym pierścieniu pokazująca, o ile jest przekręcony. Litery zapisu w kroju szeryfowym, litery wiadomości kursywą — różnica pierścieni jest teraz widoczna bez czytania opisu. Paleta reaguje na ciemny motyw.

**Rzecz do zapamiętania przy renderowaniu podglądów:** rasteryzator nie rozwiązuje zmiennych CSS w atrybutach, więc obrazek wychodzi czarny, dopóki nie podstawi się wartości wprost. Nie jest to usterka serwisu, tylko pułapka narzędzia.

## 2026-10-08 — Cykl 17: kwerenda w skanie Technica curiosa (pozycja A2)

**Co ustalono.** Księga IX „Mirabilia Chronometrica" zaczyna się na stronie drukowanej 620 i sięga mniej więcej strony 720; w skanie odpowiada temu strona około 748. Odnośnik na stronie modułu otwiera się teraz dokładnie w tym miejscu. Znany jest też pełny spis jedenastu rozdziałów księgi, od rodzajów mechanizmów i wahadeł po horometry wieczne.

**Czego nie udało się potwierdzić, i to jest ważniejsze.** Przeszukanie pełnego tekstu tego egzemplarza nie znalazło w księdze IX ani zapisu szyfrowego, ani konstrukcji wahacza magnetycznego. Spis rozdziałów księgi IX nie zawiera niczego o kryptografii — jedyny taki rozdział w całym dziele to księga VII, rozdział VI, „De Cryptographia, seu occulta scriptione", strona 542. Jedyna wzmianka o magnesie w księdze chronometrycznej dotyczy ukrytego magnesu przesuwającego wskaźnik po podziałce, nie wahacza regulującego bieg zegara. Nazwisko Kochańskiego nie pada w rozpoznanym tekście ani razu.

**Waga tego ustalenia.** Twierdzenie ze strony modułu — że Kochański podał w księdze IX konstrukcję wahaczy magnetycznych w postaci zaszyfrowanej — nie znajduje potwierdzenia w źródle, do którego sami odsyłamy. Nie jest obalone: rozpoznanie tekstu siedemnastowiecznego druku jest mocno zniekształcone, więc brak trafień nie dowodzi nieobecności. Ale od tej chwili jest to twierdzenie zawieszone, nie oparte.

**Co z tym robimy.** Pozycja A2 przechodzi w stan „w toku" i zostaje rozdzielona: pierwsza część pytania jest rozstrzygnięta, druga przeformułowana na „czy zapis w ogóle jest w księdze IX". Ustalenia są publikowane w agendzie, żeby czytelnik widział stan wiedzy, a nie tylko pytanie. Treść modułu pozostaje bez zmian do decyzji redaktora merytorycznego — poprawianie twierdzenia historycznego nie jest czynnością, którą wolno wykonać przy okazji kwerendy.

**Następny krok:** przejrzenie wzrokowe stron 620–720 skanu. Tego nie da się zrobić wyszukiwaniem pełnotekstowym.
