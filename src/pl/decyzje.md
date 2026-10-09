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

## 2026-10-08 — Cykl 18: moduł rejsu przestaje być zagadką

**Zarzut:** z modułu w ogóle nie wynikało, o co chodzi. Słusznie — brakowało w nim przesłanki, bez której reszta jest zbiorem wykresów bez tematu.

**Dodana przesłanka.** Wstęp stawia teraz problem wprost: szerokość geograficzną wyznaczysz z wysokości Słońca, długości nie wyznaczysz z niczego na niebie. Potrzebny jest zegar pokazujący godzinę portu wyjścia, a skoro Ziemia obraca się o 360 stopni na dobę, każda sekunda błędu zegara to ćwierć minuty łuku. Bez tego zdania wykres błędu w kilometrach nie znaczył nic.

**Osie przestały być anonimowe.** Pionowa mówi „o ile kilometrów pomylisz pozycję", pozioma ma podziałkę dni z nazwami portów, pasek szerokości geograficznej dostał własny opis i własną skalę, a próg nagrody ma podpis przy linii. Nad wykresem legenda z próbkami kolorów zamiast dwóch słów wrzuconych w róg.

**Linijka pozycji.** Nowy pasek pokazuje rzecz, która dotąd była wyłącznie liczbą w tabelce: gdzie naprawdę jest okręt, gdzie stawia go każdy z zegarów i jak wąskie jest pole dokładności, za które wyznaczono nagrodę. Przy wyłączonej kompensacji to pole jest ledwie widoczną kreską przy zerze — i to jest właściwa puenta, nie wada rysunku.

**Rachunek krok po kroku**, na bieżących liczbach: sekundy rozbieżności, przeliczenie na stopnie, długość stopnia na aktualnej szerokości, kilometry, porównanie z progiem. Ta sama konwencja co w module szyfru.

**Rejs się odbywa.** Przycisk przewija 64 dni, a suwak startuje na końcu trasy, nie na dniu zerowym — dotąd użytkownik widział na wejściu same zera i nie miał powodu niczego dotykać.

**Dymki** przy każdej nastawie i każdym odczycie.

## 2026-10-09 — Cykl 19: moduł rejsu jako zestaw przyrządów

**Zmiana podejścia.** Dane liczbowe zastąpiono przyrządami, z których każdy ma własny nagłówek i zdanie wyjaśniające, co pokazuje i dlaczego to istotne. Moduł przestaje być tabelą z wykresem, a staje się pokładem okrętu.

**Rejs osadzony w rzeczywistych datach.** Richer wyszedł z La Rochelle 8 lutego 1672 i dobił do Kajenny 22 kwietnia — siedemdziesiąt cztery doby, nie sześćdziesiąt cztery, jak zakładał dotychczasowy model. Kartka kalendarza pokazuje faktyczną datę każdej doby.

**Karta kursowa zamiast liczby kilometrów.** Czarny punkt to rzeczywiste położenie okrętu, kółka to pozycje wyliczone z każdego z zegarów. Przesunięcie następuje wyłącznie wzdłuż równoleżnika i to jest sedno: szerokość geograficzną wyznacza się ze Słońca, więc błąd zegara nie rusza jej wcale. Kierunek przesunięcia też nie jest dowolny — zegar spóźniony każe nawigatorowi sądzić, że jest bliżej Europy, niż jest naprawdę.

**Przyrządy.** Termometr słupkowy, dwa wskaźniki tarczowe dobowej odchyłki w konwencji mosiężnej oprawy, z podziałką zagęszczoną przy zerze, żeby małe wartości pozostały czytelne. Galeon z zegarem wahadłowym w nadbudówce rufowej, pokazanym w przekroju; wysokość fali i przechył pokładu reagują na nastawę stanu morza, który dostał też nazwy stanów zamiast samych stopni.

**Tempo przewijania jako nastawa**, nie stała w kodzie. Poprzednia wartość była zgadywanką.

**Usterka znaleziona przy okazji:** oś obrotu okrętu i wahadła wskazywała punkt ze starego rysunku, przez co okręt kołysał się wokół miejsca poza własnym kadłubem i wyglądał, jakby się przewracał. Poprawione razem z przebudową.

## 2026-10-09 — Cykl 20: trasa, źródło Richera i obsługa

**Znalezione źródło pierwotne.** Jean Richer opisał wyprawę sam: *Observations astronomiques et physiques faites en l'isle de Caïenne*, wydane w pamiętnikach Akademii Królewskiej Nauk. Skan jest w Internet Archive, w domenie publicznej. To stąd pochodzi obserwacja, od której zaczyna się moduł — wahadło sekundowe musiało być w Kajennie krótsze niż w Paryżu. Moduł powołuje się teraz na relację bezpośrednio, tak samo jak cyrkiel na „Acta Eruditorum", a szyfr na *Technica curiosa*.

**Nowa pozycja agendy A7:** skan nie ma rozpoznanego tekstu, więc nie da się go przeszukać i nie wiemy, na której stronie jest ta obserwacja ani jaką dokładnie wartość skrócenia podał Richer. Do przejrzenia wzrokowo, jak księga IX.

**Trasa przestała być odcinkiem.** Rejs biegnie teraz łamaną przez wody iberyjskie, Wyspy Kanaryjskie i Wyspy Zielonego Przylądka, a stamtąd pasatem na zachód — tak jak żeglowano w tym kierunku w XVII wieku. Pozycja w danej dobie wynika z przebytej drogi, nie z różnicy szerokości, a temperatura z szerokości, nie z numeru doby. Skutek jest merytoryczny, nie tylko graficzny: przez pierwsze trzy tygodnie okręt schodzi na południe powoli, więc i błąd narasta wolniej, a potem przyspiesza.

**Zastrzeżenie bez zmian:** trasa jest odtworzona z praktyki żeglarskiej epoki, nie z dziennika pokładowego, i tak jest podpisana pod kartą.

**Kontury wybrzeży** wykreślone z kilkunastu punktów — Zatoka Biskajska, Iberia, wybrzeże Afryki Zachodniej z wybrzuszeniem gwinejskim, Gujany i ujście Amazonki, plus Kanary i Wyspy Zielonego Przylądka. Orientacyjne i tak podpisane.

**Tempo przewijania** przeszło na skalę wykładniczą: od trzech minut dwunastu sekund do trzynastu sekund na cały rejs, domyślnie minuta czterdzieści pięć. Poprzednia skala była i za szybka, i za ciasna.

**Suwaki i pola wyboru** dostały mosiężną prowadnicę i radełkowany guzik, w tej samej konwencji co tarcza szyfrowa i wskaźniki. Pozostały natywnymi polami formularza, więc obsługa klawiaturą i czytnikiem ekranu jest nietknięta.

## 2026-10-09 — Cykl 21: karta kursowa na rzeczywistej linii brzegowej

**Zarzut był słuszny:** kontury kreślone z kilkunastu punktów z pamięci wyglądały karykaturalnie i w serwisie, który przy każdym twierdzeniu podaje źródło, były obcym ciałem.

**Rozwiązanie:** linia brzegowa pochodzi z danych Natural Earth, w domenie publicznej, pobieranych jako zależność i przetwarzanych przy budowaniu. Skrypt przycina je do okna karty, rzutuje tą samą odwzorowaniem co reszta mapy, odrzuca kontury ledwie muskające ramkę i przerzedza punkty bliższe niż dwa piksele. Z jedenastu tysięcy punktów zostaje trzydzieści cztery kontury i trzydzieści dziewięć kilobajtów ścieżki, czyli dwanaście po kompresji — mieści się w budżecie wagi strony z dużym zapasem.

**Dane pochodne nie wchodzą do repozytorium.** Plik z konturami powstaje przy każdym budowaniu, tak samo jak zminifikowana biblioteka efemeryd i warianty znaku graficznego.

**Stylizacja kartograficzna:** morze w odcieniu papieru, ląd w ochrze z grawerowaną kreską brzegu i miękkim cieniem wzdłuż niej, nazwy portów i podziałki w szeryfowej kursywie zamiast w kroju maszynowym, podziałka sześciuset mil morskich w pustym polu oceanu, róża wiatrów z rumbami. Reszta — trasa, pozycja rzeczywista i dwie wyliczone z zegarów — bez zmian.

## 2026-10-09 — Cykl 22: ściana zegarowa zamiast wykresu cienia

**Zarzut był słuszny:** moduł gnomonu pokazywał pusty prostokąt z trzema krzywymi i podawał obok trzy liczby. Nie było widać ani Słońca, ani pręta, ani tego, dlaczego z jednego cienia wychodzą trzy różne godziny. Nazwy „zegar włoski" i „zegar babiloński" padały bez wyjaśnienia, czym są.

**Zamiast jednej tarczy — trzy.** Zachowany zegar wilanowski to kompozycja trzech niezależnych tarcz i tak jest teraz narysowany: po lewej godziny włoskie, pośrodku równe, po prawej babilońskie, każda z własną siatką linii, własnym prętem i własnym wieńcem cyfr. Ten sam cień pada na trzy siatki i daje trzy odczyty. Wcześniejszy rysunek odwzorowywał tylko jedną rachubę, co notka historyczna wytykała od początku jako błąd prototypu.

**Linie godzinne liczone, nie rysowane.** Dla każdej godziny — równej, włoskiej i babilońskiej — ślad cienia wyznaczany jest przy zmiennej deklinacji Słońca, od przesilenia do przesilenia. Linie godzin równych wychodzą dokładnie proste, co zgadza się z geometrią; włoskie i babilońskie odchylają się od prostej o ułamek piksela, bo wschód i zachód liczymy z poprawką na refrakcję i promień tarczy słonecznej. Test sprawdza jedno i drugie.

**Najważniejsza kontrola:** cień musi leżeć na tej linii, której numer podaje odczyt. Rysunek i liczby pochodzą z dwóch różnych rachunków — siatka z modelu analitycznego, położenie Słońca z biblioteki efemeryd — więc mogłyby się rozjechać bez żadnego widocznego objawu. Test mierzy odległość punktu cienia od linii o numerze równym odczytowi dla jedenastu par data–godzina; największa odchyłka wynosi 0,74 piksela na tarczy szerokiej stu sześćdziesięciu.

**Słońce i promień.** Nad ścianą stoi Słońce, od niego biegnie kropkowany promień przez pręt tarczy środkowej aż do końca cienia — trzy punkty leżą na jednej prostej, bo Słońce rysowane jest na tym samym promieniu, na którym leży cień. Odległość jest umowna i tak podpisana; kierunek jest prawdziwy. Boczne tarcze dostają równoległe odcinki promienia, bo promienie słoneczne są równoległe.

**Odczyty milkną, gdy ściana jest w cieniu.** Wcześniej liczby stały przy tarczy, na której nic nie było widać: rano w czerwcu Słońce jest już wysoko, ale na północ od linii wschód–zachód, więc ściana południowa pozostaje nieoświetlona. Teraz trzy odczyty tarczowe pokazują wtedy kreskę z adnotacją, a czas słoneczny i rozbieżność z zegarem mechanicznym — które nie zależą od cienia — liczą się dalej.

**Data i godzina dostały przyrządy:** kartka kalendarza z datą oraz długością dnia i nocy, bo właśnie długość dnia jest tym, co godziny włoskie i babilońskie mierzą; obok mosiężna tarcza zegara mechanicznego z cyframi rzymskimi i dwiema wskazówkami.

**„Co to?" doczekało się odpowiedzi.** Każdy z trzech odczytów ma teraz akapit mówiący, od czego liczy się ta rachuba i komu była do czego potrzebna, a osobna nota tłumaczy, po co jednej ścianie trzy naraz. Wyjaśnienie rozbieżności z zegarem mechanicznym zostało poprawione: wymieniało równanie czasu i poprawkę na długość geograficzną, ale pomijało godzinę czasu letniego, przez co podana liczba nie zgadzała się z odczytem przez pół roku.

**Dwa nowe źródła w rejestrze:** artykuł muzealny Hanny Widackiej z fotografią zachowanego zegara oraz artykuł Wojciecha Fijałkowskiego w „Studia Wilanowskie" XI (1989) — jedyne znane nam opracowanie naukowe poświęcone wprost pracy Kochańskiego w Wilanowie. Fotografia nie jest na wolnej licencji, więc zostaje odnośnik bez osadzenia.

**Pozycja A6 przeszła w stan „w toku".** Opis muzealny mówi o złotym kłosie zboża, nie o kosie, co przemawia za jednym z dwóch wariantów — ale opiera się na jednym ujęciu fotograficznym i nie nazywa postaci Chronosem. Pytanie zostaje otwarte, ustalenia dopisane.

**Nowa pozycja agendy A8:** co właściwie zawiera artykuł Fijałkowskiego. Muzeum udostępnia skan, ale bez rozpoznanego tekstu — trzeci już przypadek w tym projekcie, po księdze IX i relacji Richera, gdy źródło jest w zasięgu ręki, a mimo to wymaga ludzkich oczu.

## 2026-10-09 — Cykl 23: artykuł Fijałkowskiego przeczytany, zegar nastawiany koronką

**Skan doczytany wzrokowo.** Artykuł Wojciecha Fijałkowskiego ze „Studia Wilanowskie" XI nie ma rozpoznanego tekstu, więc strony przekonwertowano na obraz i odczytano. To dwie strony tekstu (40–41) i dwie tablice. O zegarze słonecznym nie mówi ani słowa i ani razu nie wymienia Heweliusza — atrybucji zegara nie rozstrzyga.

**Rozstrzyga natomiast rzecz dla tego modułu ważniejszą:** Kochański „was in charge of compasses and clocks for the palace" — zawiadywał pałacowymi kompasami i zegarami — a także był, według Fijałkowskiego, głównym autorem programu ideowego dekoracji elewacji i wnętrz. Fijałkowski przytacza to za monografią Juliusza Starzyńskiego. Pierwsze zdanie weszło na stronę z odnośnikiem; drugie wiąże się z pozycją A6, bo przemawia za tym, że warstwa ikonograficzna zegara jest pomysłem Kochańskiego, nie samego sztukatora.

**Dwie pozycje agendy ruszyły z miejsca.** A8 przeszła w stan „w toku" z sześcioma ustaleniami i jednym nowym tropem: monografia Starzyńskiego. A5 również — artykuł podaje rok przybycia na dwór 1677, czyli czwartą datę, której nie było w żadnym ze sprawdzonych dotąd opracowań. Pytanie zostało odpowiednio przeredagowane.

**Odnośniki bez osadzenia otwierają się w osobnej karcie.** Dotąd skan z ustalonym osadzeniem otwierał się w okienku nad stroną, a źródło bez osadzenia — w tym samym oknie, co wyrzucało czytelnika z przyrządu. Teraz skrót szablonowy dokłada takim odnośnikom `target="_blank"`.

**Data: osobno dzień, osobno miesiąc.** Suwak od 1 do 365 zastąpiły dwa pola wyboru, jak w zwykłym formularzu. Po zmianie miesiąca lista dni skraca się do jego długości, a wybrany dzień jest przycinany — 31 stycznia po przejściu na luty staje się 28 lutego. Rok modelowy jest nieprzestępny i tak jest policzony.

**Zegar nastawia się koronką.** Zamiast suwaka stoi zegarek kieszonkowy z uchem, kabłąkiem i radełkowaną koronką. Czas zmienia się przez pokręcenie koronką albo obrót samej tarczy — pełny obrót to godzina, więc tym samym ruchem dostaje się nastawienie zgrubne i dokładne. Koronka jest polem typu „slider" z obsługą strzałek, Page Up i Page Down oraz Home i End, i melduje czytnikowi ekranu bieżącą godzinę.

**Rozbieżność przeniesiona na tarczę.** Zegar mechaniczny, czas słoneczny prawdziwy i różnica między nimi nie stoją już w osobnej tabelce obok. Tarcza nosi dwie pary wskazówek — ciemne dla zegara, kreskowane mosiężne dla Słońca — zielony łuk między wskazówkami godzinowymi i okienko z liczbą minut. Podpis pod ilustracją powtarza te trzy wartości tekstem, z próbkami kresek, żeby odczyt nie zależał wyłącznie od koloru.

**Przycisk analemmy dostał wyjaśnienie,** czym analemma w ogóle jest — osobnym akapitem pod przyciskiem, powiązanym z nim przez `aria-describedby`, a nie tylko dymkiem opisującym, co przycisk robi.

**Usterka wyłapana przy okazji:** pola wyboru powstawały w kodzie przez `createElementNS` w przestrzeni nazw SVG, więc przeglądarka tworzyła elementy, które wyglądały jak `option`, ale nie były opcjami listy. Listy były puste, a przyrząd cicho pokazywał 0 stycznia. Stąd nowy test składania numeru dnia z miesiąca i dnia miesiąca.

## 2026-10-09 — Cykl 24: odczyty pod tarczami, lata przestępne w modelu

**Zarzut merytoryczny był trafny.** Model liczył położenie Słońca z numeru dnia w roku, przyjmując rok nieprzestępny. Wychodziły z tego dwie rzeczy: 29 lutego nie dało się w ogóle wybrać, a data kalendarzowa nie była datą, tylko numerem porządkowym. Przyrząd liczy teraz z rzeczywistej daty — rok, miesiąc, dzień — bez pośrednictwa numeru dnia, a rokiem modelowym jest przestępny 2028.

**Zarzut rozbrojony liczbą, nie zapewnieniem.** Ta sama data kalendarzowa wypada w cyklu czteroletnim nieco inaczej względem przesileń. Zmierzyliśmy ile: w okolicach równonocy deklinacja Słońca różni się o około 0,14 stopnia w każdą stronę, wschód i zachód o niecałą minutę, a cień przesuwa się o mniej niż grubość wykreślonej linii; w przesileniach rozrzut jest praktycznie zerowy. Liczby weszły do uwagi pod przyrządem, a test pilnuje, żeby rozrzut deklinacji nie przekroczył ćwierci stopnia — gdyby model kiedyś zaczął liczyć inaczej, kontrola zawiedzie, zamiast cicho rozminąć się z opisem.

**Odczyty zeszły pod tarcze.** Osobna sekcja z trzema kartami zniknęła. Każda tarcza na ścianie ma teraz pod sobą dwie linijki: nazwę rachuby wraz z punktem, od którego liczy — „godziny włoskie — od zachodu”, „godziny równe — od północy”, „godziny babilońskie — od wschodu” — i bieżący odczyt w barwie tej tarczy. Nazewnictwo jest przez to jednolite; wcześniej ta sama rachuba nazywała się raz „zegarem włoskim”, raz „godzinami włoskimi”.

**Wyjaśnienia zostały dymkami.** Trzy akapity o tym, czym jest każda rachuba, siedzą w znaczniku `title` całej tarczy, więc pojawiają się po najechaniu i nie zajmują miejsca w układzie strony. Odczyt, który nie ma pokrycia w cieniu, pokazuje zamiast liczby powód — „ściana w cieniu” albo „po zachodzie Słońca” — kursywą, mniejszym stopniem.

**Przełącznik analemmy stoi przy ścianie,** bo to na ścianie analemma się rysuje. Jest mosiężną dźwignią w konwencji pozostałych przyrządów, zadeklarowaną jako `role="switch"` ze stanem `aria-checked`, z dymkiem opisującym działanie i akapitem wyjaśniającym, czym analemma jest.

**Pozycja A8 przeredagowana.** Pierwotne pytanie — co zawiera artykuł Fijałkowskiego — jest już odpowiedziane. Zostaje to, co nadal otwarte: skąd pochodzi przypisanie zegara Heweliuszowi i czy monografia Starzyńskiego mówi o nim więcej.

## 2026-10-09 — Cykl 25: zakładki zamiast długiej strony

**Zarzut był słuszny:** żeby dojść do przyrządu, trzeba było przewinąć wstęp, przypisy, dwie uwagi i trzy ramki z pytaniami. Interesująca część leżała w środku, a nie na wierzchu.

**Strona przyrządu ma teraz trzy zakładki:** Przyrząd, Skąd to wiemy, Pytania otwarte. Przyrząd otwiera się jako pierwszy i stoi tuż pod tytułem. Proza, źródła, zastrzeżenia modelu i opis tekstowy zeszły do drugiej zakładki, pytania agendy do trzeciej, z licznikiem przy nazwie. Dotyczy to wszystkich czterech przyrządów w obu językach, nie samego gnomonu.

**Bez skryptu nic nie znika.** Karty są zwykłymi sekcjami dokumentu; skrypt dopiero je zwija i dopiero wtedy odsłania pasek zakładek, żeby nie zostawić martwych przycisków. Przy wyłączonym skrypcie każda karta ma własny nagłówek i wszystkie trzy są widoczne jedna pod drugą — treść nigdy nie wypada z dokumentu, więc wyszukiwarka i czytnik ekranu widzą całość. Pasek obsługuje strzałki, Home i End.

**Pytania przestały być przepisywane ręcznie.** Dotąd strona wymieniała je po identyfikatorach w nagłówku i jeszcze raz w treści, przez co strona wahadła deklarowała jedno pytanie, a osadzała dwa. Teraz lista bierze się wprost z rejestru po polu „miejsca", a licznik przy zakładce liczy to samo. Jedno źródło prawdy zamiast trzech.

**Rejestr pytań ma osobny odnośnik** na początku trzeciej zakładki — do pełnej agendy wszystkich przyrządów.

**Opis tekstowy przyrządu zwinięty** do rozwijanej sekcji w zakładce „Skąd to wiemy". Nie może być samym dymkiem: to równoważnik tekstowy dla czytnika ekranu i dla przeglądarki bez skryptu, więc musi zostać w dokumencie jako tekst.

**Dymki rachub działają na dotyku.** Znacznik `title` w SVG nie pojawia się na ekranie dotykowym i bywa przeoczony myszą, więc wyjaśnienie trafiło do stałego pola pod ścianą, zapalanego najechaniem na tarczę, najechaniem na jej nazwę, dotknięciem albo klawiaturą. Trzy nazwy rachub stoją pod ścianą jako zwykłe przyciski, w barwach swoich tarcz.

**Podpisy pod tarczami skrócone** do samej nazwy, bo wersja z dopiskiem „— od zachodu" nachodziła na sąsiednie tarcze. Punkt, od którego liczy się rachuba, przeniósł się do dymka i do nazwy w przycisku. Z paska przełącznika analemmy zniknął dopisek, który sklejał się z jego nazwą.
