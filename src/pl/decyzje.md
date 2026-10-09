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

## 2026-10-09 — Cykl 26: jeden pulpit zamiast dwóch plansz

**Zarzut:** „Który to dzień i która godzina" oraz „Ściana, pręt i cień" były dwiema osobnymi planszami, a obok kartki kalendarza i zegarka ziało puste pole, podczas gdy objaśnienia leżały pod spodem, oderwane od tego, co objaśniają.

**Zakładka „Przyrząd" to teraz jeden pulpit.** W górnym rzędzie trzy kolumny: kartka kalendarza z polami daty, zegarek kieszonkowy z odczytami, a w wolnym polu po prawej — objaśnienia, które dotąd stały pod spodem: jak nastawia się czas, jak czyta się cień i czym jest zegar mechaniczny w tym modelu. Pod rzędem ściana z trzema tarczami na pełnej szerokości, a pod nią stopka pulpitu: po lewej nazwy rachub z polem wyjaśnienia, po prawej przełącznik analemmy z własnym. Całość w jednej ramce na tle płyty, żeby czytało się jako jeden przyrząd, a nie trzy luźne kawałki.

**Akapit „Dlaczego Słońce nie zgadza się z zegarem" zszedł do zakładki „Skąd to wiemy".** To wyjaśnienie, nie przyrząd; zostawiony na końcu pulpitu rozbijał go na dwie części.

**Ściana przewija się w poziomie na wąskim ekranie.** Przy czterystu pikselach rysunek zmalałby do nieczytelnych cyfr; zachowuje więc minimalną szerokość sześciuset dwudziestu pikseli i przesuwa się palcem, zamiast kurczyć się do nieczytelności.

## 2026-10-09 — Cykl 27: Słońce jako uchwyt, opis tekstowy w narracji

**Słońce stało się uchwytem czasu.** Można je złapać i przesunąć po niebie — godzina idzie za nim, wskazówki zegarka obracają się, cienie wędrują po trzech tarczach. Działa to dlatego, że kierunek, z którego pada światło, jest monotoniczną funkcją godziny, więc da się go odwrócić: z położenia kursora odczytujemy kąt, a z kąta godzinę. Odwracanie jest osobną funkcją w warstwie obliczeniowej i ma dwa testy: jeden sprawdza, że z kierunku cienia odzyskuje się godzinę, z której ten cień powstał, drugi — że kierunek faktycznie maleje monotonicznie przez cały dzień, bo bez tego odwracanie byłoby wieloznaczne.

**Opis tekstowy przyrządu przestał być zwijaną sekcją.** Wszedł w narrację zakładki „Skąd to wiemy" jako zwykły akapit, zaraz po wprowadzeniu. Nie jest już ani dodatkiem na końcu strony, ani schowkiem — czyta się jak reszta tekstu, a nadal pełni funkcję równoważnika dla czytnika ekranu i dla przeglądarki bez skryptu. Dotyczy wszystkich czterech przyrządów w obu językach.

**Dymki zostały tylko przy tarczach.** Rząd trzech przycisków pod ścianą zniknął; wyjaśnienie rachuby zapala się od najechania na samą tarczę albo jej dotknięcia, a nazwy pod tarczami dostały kropkowane podkreślenie, żeby było widać, że coś się pod nimi kryje.

**Uwaga o latach przestępnych zeszła do dymka przy kalendarzu** — tam, gdzie wybiera się datę, a nie na końcu strony. Żeby nie zniknęła dla czytnika ekranu i dla dotyku, jej treść została równocześnie wpisana do opisu tekstowego przyrządu, który od tego cyklu jest widoczny w narracji.

## 2026-10-09 — Cykl 28: pulpit na stronie wahadła

**Zarzut:** strona wahadła była sześcioma planszami jedna pod drugą — kalendarz, okręt, karta, przyrządy, wykres, odczyty. Suwaki stały z dala od tego, czym sterują, galeon zajmował pustą szeroką wstęgę, a cztery odczyty lądowały na samym dole, oderwane od wszystkiego.

**Ten sam pulpit co w gnomonie.** W górnym rzędzie trzy kolumny: kartka kalendarza z suwakami dnia i tempa oraz przyciskiem odbicia, galeon ze stanem morza i kompensacją sprężyny, a w wolnym polu po prawej objaśnienia — co pokazuje okręt, co karta i co przyrządy pokładowe. Pod rzędem karta kursowa na pełnej szerokości, pod nią termometr z dwoma wskaźnikami i cztery odczyty, na końcu wykres narastania błędu z legendą i rachunkiem. Całość w jednej ramce, jak w gnomonie.

**Nagłówki sekcji zniknęły,** bo ich treść przeszła do objaśnień po prawej albo do podpisów. Zostało jedno śródtytułowanie przed wykresem, żeby oddzielić narastanie błędu od bieżącego stanu.

**Karta i wykres przewijają się w poziomie** na wąskim ekranie, tak samo jak ściana w gnomonie.

**Kolumny pulpitu dostały górne ograniczenie szerokości.** Przy trzech kolumnach ustawionych na zawartość dwie pierwsze zabierały całe miejsce, a trzecia wychodziła poza obszar tekstu. Teraz pierwsza ma najwyżej dziewiętnaście znaków szerokości, a dwie pozostałe dzielą resztę po równo.

## 2026-10-09 — Cykl 29: kroje pisma zamiast ostrzeżenia

**Ostrzeżenie wisiało od pierwszego cyklu:** serwis był zaprojektowany na EB Garamond i IBM Plex Mono, ale plików krojów nigdy nie było, więc chodził na krojach zastępczych, a kontrola `kroje` zgłaszała to za każdym razem. Ostrzeżenie, które nic nie zmienia, przestaje być czytane — więc albo kroje wchodzą, albo kontrola wylatuje.

**Weszły kroje.** Źródłem są pakiety `@fontsource/eb-garamond` i `@fontsource/ibm-plex-mono` — oba na licencji SIL OFL, instalowane przez `npm install`, więc nic nie trzeba pobierać ręcznie.

**Obcięte do repertuaru znaków serwisu.** Pełne pliki ważą razem ponad sto kilobajtów, czyli dwie trzecie budżetu strony; po obcięciu do polskiej i angielskiej łacinki z interpunkcją typograficzną zostaje pięćdziesiąt sześć. Repertuar jest zapisany w jednym miejscu i to on, a nie przypadek, decyduje, co w kroju jest.

**Budżet musiał nauczyć się liczyć kroje.** Kontrola wagi sumowała tylko zasoby wymienione w HTML, a kroje pobiera arkusz stylów — czyli pięćdziesiąt sześć kilobajtów przechodziło jej obok nosa. Teraz zagląda do arkuszy i dolicza to, po co sięgają. Najcięższa strona, gnomon, waży po tej zmianie 131 kB przy budżecie 150: zapasu zostało dziewiętnaście kilobajtów i trzeba o tym pamiętać przy kolejnych przyrządach.

**Nazwy plików niosą odcisk treści,** bo nagłówki każą trzymać kroje rok w pamięci podręcznej. Bez odcisku zmiana repertuaru znaków byłaby dla zwracających się przeglądarek niewidoczna przez rok. Kontrola pamięci podręcznej też się tego nauczyła: dotąd uznawała wyłącznie odcisk w adresie (`?v=`), teraz akceptuje również odcisk w nazwie i sprawdza, że każdy zasób pobierany z arkusza jakiś ma.

**Kontrola `kroje` przestała być ostrzeżeniem i zatrzymuje cykl.** Sprawdza trzy rzeczy: że arkusz deklaracji istnieje, że każdy plik, po który sięga, leży na miejscu i ma odcisk w nazwie, oraz — to najważniejsze — że na zbudowanych stronach nie pojawił się znak spoza repertuaru. Wszystkie trzy przypadki zostały wywołane celowo i każdy zawiódł tak, jak miał: obcy znak wstawiony na próbę do nagłówka został zgłoszony z podaniem strony i punktu kodowego. Samego znaku nie przytaczam, bo kontrola — słusznie — uznałaby ten wpis za usterkę.

**Świadome ustępstwo:** π, ≈ i strzałki nie mają glifów w zakresach łacińskich fontsource i renderują się krojem zastępczym. Lista takich znaków jest wypisana w kodzie, żeby nie wyglądała na przeoczenie.

## 2026-10-09 — Cykl 30: pulpit wahadła ściśnięty w pionie

**Przyrządy stanęły po bokach karty.** Termometr po lewej, oba wskaźniki jeden pod drugim po prawej — zamiast rzędu pod mapą, który dokładał dwieście pikseli wysokości i oddalał odczyty od tego, czego dotyczą.

**Wykres wszedł w puste pole** pod kalendarzem i okrętem, obok kolumny objaśnień. Górny rząd pulpitu był dotąd wysoki na tyle, ile liczy kolumna tekstu, a pod kalendarzem i statkiem ział pusty prostokąt. Teraz mieści się w nim narastanie błędu; strona skróciła się o kolejne kilkaset pikseli. Napisy na wykresie są odpowiednio większe, bo rysunek stoi w węższym polu.

**Pasek czterech odczytów zniknął.** Powtarzał to, co i tak pokazują przyrządy: temperaturę z termometru i błąd pozycji każdego z zegarów. Odczyty przeniosły się pod przyrządy, z których wynikają — kilometry pod wskaźnik tego zegara, który je generuje — a szerokość geograficzna pod kartę kursową, bo to karta ją pokazuje.

**Usterka układu przy okazji:** blok objaśnień z narzuconym wierszem siatki wskakiwał na pierwszą kolumnę i wypychał kalendarz na prawo. Rozmieszczenie wszystkich czterech bloków jest teraz podane wprost, zamiast liczyć na rozpływ.

Strona wahadła waży po tych zmianach 110 kB przy budżecie 150 — zapasu jest czterdzieści kilobajtów, dwa razy więcej niż na stronie gnomonu.

## 2026-10-09 — Cykl 31: instrukcje obsługi zeszły do dymków

**Dwa akapity instrukcji zniknęły z kolumny objaśnień.** „Jak nastawić czas" jest teraz dymkiem samego zegarka — tam, gdzie się go nastawia. „Jak czytać ścianę" trafiło do pola objaśnień jako jego treść domyślna: dopóki kursor nie stoi na żadnej tarczy, pole mówi, że Słońce jest uchwytem i jak wodzić wzrokiem po linii do cyfry; po najechaniu na tarczę ustępuje miejsca jej rachubie. Instrukcja obsługi przyrządu nie jest już osobnym tekstem do przeczytania, tylko odpowiedzią na to, gdzie akurat patrzysz.

**Pole objaśnień przeniosło się do górnego rzędu,** w wolne miejsce obok zegarka, razem z przełącznikiem analemmy. Dotąd stało pod ścianą i dokładało dwa osobne pasy. Pulpit ma przez to trzy kolumny zamiast trzech kolumn i stopki.

**Uwaga o czasie urzędowym** została zwykłym zdaniem pod rzędem nastawników — to nie instrukcja obsługi, tylko zastrzeżenie do modelu, więc nie powinna chować się w dymku.

**Powtórzenie usunięte:** podpis pod ścianą namawiał do najechania na tarczę, co teraz mówi samo pole objaśnień.

## 2026-10-09 — Cykl 32: jeden mechanizm dymków zamiast pól tekstowych

**Pola objaśnień zniknęły ze stron.** Opis, jak czytać ścianę, i opis analemmy nie są już akapitami zajmującymi miejsce w układzie — zapalają się jako dymki nad tym, czego dotyczą: nad ścianą i nad przełącznikiem. Tak samo opisy trzech rachub: znikły z pola pod ścianą i wracają jako dymek przy tarczy.

**Dymek jest własny, nie systemowy.** Znacznik `title` jest mały, pojawia się z opóźnieniem, nie działa na ekranie dotykowym i gaśnie przy najmniejszym ruchu. Nowy jest czytelnym polem tekstu szerokim na trzydzieści cztery znaki, zapalanym najechaniem, dotknięciem albo klawiaturą, gaszonym klawiszem Escape. Obsługa jest delegowana na cały dokument, więc wystarczy dodać atrybut `data-dymek` — korzystają z tego oba przebudowane przyrządy.

**Dymki się zagnieżdżają.** Ściana ma swój, każda tarcza na niej własny; dymek bierze się z najbliższego przodka, który go ma, więc zejście z tarczy wraca do objaśnienia ściany zamiast gasić wszystko. Przewinięcie strony przesuwa dymek za elementem i gasi go dopiero, gdy element wyjedzie poza okno.

**Pole chwytu tarczy obejmuje cały jej blok** — kartusz, podpis i odczyt — zamiast samych kresek. Dymek przestał być czuły na to, czy kursor trafił akurat w linię.

**Uwaga o dostępności:** dymek bywa jedyną drogą do tych objaśnień, więc każdy element z `data-dymek` jest osiągalny klawiaturą i niesie tę samą treść w atrybucie `aria-description`. Pełny opis przyrządu pozostaje w narracji zakładki „Skąd to wiemy", więc nic nie zależy wyłącznie od najechania myszą.

## 2026-10-09 — Cykl 33: pulpit gnomonu dociągnięty do ręki

**Legenda zegarka zeszła pod przełącznik analemmy.** Trzy odczyty — godzina mechaniczna, słoneczna i różnica między nimi — stały dotąd w podpisie pod zegarkiem i rozpychały środkową kolumnę w dół. Teraz tworzą jedną kolumnę z przełącznikiem, po prawej stronie pulpitu, gdzie i tak było puste miejsce. Zegarek odzyskał swoją wysokość, a trzy liczby stoją jedna pod drugą, czytelne jak legenda mapy.

**Dymek Słońca zapala się przy Słońcu.** Objaśnienie, że Słońce jest uchwytem do przesuwania czasu, wisiało dotąd na całej ścianie i pojawiało się gdzieś pod nią — daleko od rzeczy, której dotyczyło. Słońce ma teraz własny dymek i własne, niewidoczne pole chwytu o promieniu trzydziestu punktów, więc trafia się w nie bez celowania. Przy okazji dymki dużych obszarów — ściany, mapy — idą za kursorem zamiast czepiać się środka elementu: dla pola wyższego niż 240 punktów albo szerszego niż 420 punktów punktem zaczepienia jest kursor.

**Podpisy tarcz zeszły o osiem punktów niżej,** odczyty o tyle samo. „Godziny włoskie", „równe" i „babilońskie" dotykały dotąd ramki kartusza. Pole chwytu tarczy urosło razem z nimi, żeby dymek dalej obejmował podpis i odczyt.

**Kartka kalendarza jest dłuższa o trzydzieści punktów** i ma kreskę rozdzielającą datę od długości dnia i nocy. Przy dacie dwucyfrowej liczba nachodziła dotąd na wiersz „dzień / noc".

**Wybór dnia i miesiąca wrócił na kartkę.** Dwa pola stoją bezpośrednio pod nią, na wspólnej mosiężnej listwie przyklejonej do jej dolnej krawędzi, bez podpisów — nazwy pól niosą `aria-label` i dymek. Dotąd były osobnym rzędem pod kalendarzem i czytało się je jak formularz obok przyrządu, a nie jak jego część.

**Układ pulpitu ma od tego cyklu własne testy** (58 zamiast 52): legenda musi stać po przełączniku w tym samym bloku, oba pola daty muszą siedzieć na kartce i mieć nazwę dostępną wraz z dymkiem, a Słońce po złożeniu przyrządu musi nieść dymek i pole chwytu. Trzy rzeczy, które najłatwiej rozjechać następną poprawką arkusza stylów.

## 2026-10-09 — Cykl 34: kartka równa zegarkowi, pola wyboru na niej

**Kartka kalendarza była wciśnięta w kwadrat.** Reguła `flex:0 0 150px` w kolumnowym układzie zginanym ustawia nie szerokość, lecz wysokość — kartka dostawała sto pięćdziesiąt punktów wysokości zamiast szerokości, a rysunek chował się w tym kwadracie pomniejszony, z pustymi pasami po bokach. Po poprawce kartka ma szerokość stu pięćdziesięciu punktów i wysokość dwustu dwudziestu czterech, czyli dokładnie tyle co zegarek obok. Ten sam błąd dusił kartkę na stronie wahadła; tam też zniknął.

**Pola wyboru dnia i miesiąca leżą na kartce,** w polu odciętym kreską nad jej dartym dolnym brzegiem — nie pod nią, nie obok niej. Dotąd były listwą doklejoną do dolnej krawędzi i dalej czytały się jak osobny formularz. Teraz data jest jedną rzeczą: wielka liczba, długość dnia i nocy, a pod nimi dwa pola, którymi się ją zmienia.

**Zastrzeżenie o czasie urzędowym** zeszło spod rzędu nastawników do trzeciej kolumny, pod legendę zegarka, oddzielone od niej cienką kreską. To komentarz do tych właśnie trzech liczb — godziny mechanicznej, słonecznej i rozbieżności — a nie do całego pulpitu. Trzy kolumny kończą się teraz na tej samej wysokości, z dokładnością do sześciu punktów.

**Wysokości pilnuje test** (62 zamiast 58): czyta proporcje obu viewBoksów z gotowej strony i szerokości z arkusza stylów, przelicza je na punkty i wymaga, żeby kartka i zegarek różniły się o mniej niż punkt. Sprawdzono, że potrafi zawieść — przy starym viewBoksie zgłasza różnicę 23,4 punktu. Drugi nowy test pilnuje, że zastrzeżenie o czasie urzędowym stoi w kolumnie objaśnień, pod legendą.

## 2026-10-09 — Cykl 35: data na kartce jest polem wyboru

**Nazwa miesiąca i wielka liczba dnia to teraz same nastawniki.** Dotąd kartka pokazywała datę rysowanym tekstem, a zmieniało się ją dwoma polami doklejonymi niżej — to samo czytało się dwa razy, w dwóch miejscach. Oba znaczniki `text` zniknęły; w ich miejsce weszły dwa znaczniki `select` położone dokładnie tam, gdzie stał napis: miesiąc w nagłówkowym pasie nad mosiężną kreską, dzień w wielkim polu pod nią. Wielkość pisma bez zmian — jedenaście punktów szeryfowego grotesku w nagłówku, pięćdziesiąt w liczbie dnia.

**Nastawnik ma wyglądać jak kartka, nie jak formularz:** tło przezroczyste, bez obwódki, z drobnym rysowanym trójkątem przy prawej krawędzi i kropkowanym podkreśleniem pod liczbą dnia. Trójkąt ma stałe siedem punktów szerokości niezależnie od stopnia pisma, więc przy pięćdziesięciopunktowej liczbie nie puchnie razem z nią.

**Usterka specyficzności przy okazji:** reguła wspólna `.pola-daty select` (klasa plus typ) wygrywała z regułami szczegółowymi `.pole-miesiaca` i `.pole-dnia` (sama klasa), więc obwódka i tło nie dawały się nadpisać. Rozwiązane podniesieniem szczegółowych do `select.pole-…`, nie zaś przez `!important`.

**Sprawdzono działanie, nie tylko wygląd:** po przestawieniu na luty lista dni ma dwadzieścia dziewięć pozycji, 29 lutego daje się wybrać, długość dnia schodzi z 16 godz 46 min na 10 godz 51 min, a czas słoneczny prawdziwy z 11:22 na 12:12. Test pilnuje, że dzień i miesiąc są polami wyboru i że nie został po nich żaden osobny napis.

## 2026-10-09 — Cykl 36: data nastawiana bębenkiem, bez rozwijanej listy

**Rozwijana lista wypadła z kartki.** Pole `select` przy pięćdziesięciopunktowej liczbie rozwijało systemową listę trzydziestu jeden pozycji wysoką na cały ekran — obce ciało w przyrządzie i zasłonięcie całej planszy. Datę nastawia się teraz dwoma bębenkami: walec obraca się o jedną pozycję, przez okienko widać wartość bieżącą i po skrawku sąsiednich, a przy prawej krawędzi stoją dwa drobne groty. Krawędzie walca są radełkowane tym samym rysunkiem co koronka zegarka, więc oba nastawniki mówią jednym językiem.

**Bębenek chodzi na cztery sposoby:** przeciągnięciem w pionie (jedna pozycja na dziesięć punktów), kółkiem myszy, kliknięciem w górną albo dolną połowę okienka i z klawiatury — strzałki po jednej pozycji, Page Up / Page Down po pięć, Home i End na krańce. Dla czytnika ekranu jest to `spinbutton` z wartością bieżącą, zakresem i opisem.

**Pola `select` zostają w dokumencie,** schowane dopiero wtedy, gdy skrypt zbuduje bębenki. Bez skryptu kartka pokazuje dwa zwykłe pola wyboru pod spodem i data dalej daje się ustawić; bębenki są wzbogaceniem, nie warunkiem działania. Są też nośnikiem stanu — bębenek nie trzyma własnej liczby, tylko obraca `selectedIndex` i rozsyła zdarzenie `change`, więc reszta przyrządu nie wie o zmianie sposobu nastawiania.

**Sprawdzono ruch, nie tylko wygląd:** dwa naciśnięcia strzałki w dół przestawiają dzień z 21 na 23, strzałka w górę na bębenku miesiąca cofa z maja na kwiecień i skraca dzień z 16 godz 46 min na 16 godz 07 min, kółko myszy przesuwa o jedną pozycję. Test wymaga, żeby oba bębenki były `spinbutton`ami osiągalnymi klawiaturą, miały odczytaną wartość i pokazywały trzy wartości naraz — bieżącą i dwie sąsiednie.

## 2026-10-09 — Cykl 37: dziesięć poprawek czytelności na czterech stronach

**Gnomon — groty po lewej, bez dymka, bez obwódki.** Dwa daszki stoją teraz po lewej stronie każdego bębenka i są jego rodzeństwem w rysunku, nie dzieckiem. Niosą nowy atrybut `data-bez-dymka`, który zasłania dymki przodków: objaśnienie kartki nie wyskakuje już nad grotem i nie zasłania tego, w co się celuje. Mechanizm jest ogólny — każdy drobny element sterujący może się tak wypisać z dymka. Bębenek miesiąca stracił ramkę, tło i radełkowanie: w nagłówkowym pasie kartki wystarczy sam obracany napis, bo pas i tak jest odcięty mosiężną kreską.

**Szyfr — instrukcja obok nastawy.** Akapit o chwytaniu pierścienia stał pod tarczą i dokładał kolejny pas do przewijania. Teraz zajmuje wolne pole po prawej od tarczy, w tej samej planszy; poniżej 52 rem wraca pod spód.

**Wahadło — podpis ustępuje portowi.** W La Rochelle i w Kajennie podpis „tu jesteś" lądował na nazwie portu i czytało się z tego zdanie, którego nikt nie napisał. Podpis znika, gdy pozycja jest bliżej niż dwadzieścia sześć punktów od portu — nazwa portu mówi to samo i dokładniej.

**Wahadło — wykres wkreślony w kartę.** Osobny wykres narastania błędu zniknął z pulpitu. Te same dwa przebiegi są teraz dwoma śladami na karcie kursowej: dla każdej doby do bieżącej punkt, w którym okręt *myślałby*, że jest. Wykres błędu pozycji ma sens na mapie, a nie obok niej — odchylenie widać jako odległość, a nie jako wysokość słupka. Strona straciła przy tym cały jeden pas o wysokości ponad trzystu punktów.

**Wahadło — koło sterowe.** „Odbij od brzegu" nie jest już wierszem pod suwakami, tylko kołem sterowym stojącym między kalendarzem a okrętem, który ma ruszyć. Przy najechaniu obraca się o czterdzieści pięć stopni, o ile użytkownik nie prosił o ograniczenie ruchu.

**Wahadło — dymek termometru.** Termometr nie pokazuje pogody, tylko temperaturę wynikającą z szerokości geograficznej: 9,8 °C na wysokości La Rochelle, 27,8 °C u Kajenny, liniowo pomiędzy. Dotąd nigdzie tego nie było napisane, a to właśnie ta liczba napędza błąd obu zegarów.

**Cyrkiel — zakładka „Konstrukcja".** Cyrkiel nie jest przyrządem do nastawiania, tylko konstrukcją geometryczną, więc pierwsza zakładka nazywa się tak, jak to, co w niej stoi. Układ strony przyrządu przyjmuje teraz własną nazwę pierwszej zakładki z nagłówka strony.

**Cyrkiel — wyprowadzenie wzoru stoi otworem.** Pięciokrokowy rachunek był schowany w elemencie rozwijanym. Nie ma powodu go chować: to trzon zakładki „Skąd to wiemy", a nie dodatek. Zostaje zwykłą sekcją z nagłówkiem.

**Osiemnaście nowych testów** (80 zamiast 64) — po jednym na każdą z poprawek, w obu językach: groty stoją po lewej i nie przepuszczają dymka, kliknięcie grotu przestawia dzień, osobnego wykresu nie ma a ślady na karcie są dwa, podpis „tu jesteś" znika w porcie i wraca na pełnym morzu, koło sterowe stoi na drugim miejscu w rzędzie nastawników, termometr ma niepusty dymek, pierwsza zakładka cyrkla nazywa się „Konstrukcja" a wyprowadzenie nie jest rozwijane, instrukcja pierścienia siedzi w jednym polu z tarczą.

## 2026-10-09 — Cykl 38: oznaczenia tłumaczą się same, zakładki nie skaczą

**Każde oznaczenie ma teraz dymek mówiący, co dokładnie znaczy na tej stronie.** Chipy „źródło", „interpretacja", „model współczesny", „geometria uproszczona" i „rekonstrukcja" były enigmatyczne: widać było, że coś orzekają, ale nie było skąd wiedzieć co. Objaśnienia nie wnoszą nowych twierdzeń — powtarzają zastrzeżenie, które i tak stoi na stronie, i wskazują pozycję agendy, pod którą rzecz jest otwarta (A1 dla deklinacji ściany wilanowskiej, A2 dla zapisu szyfrowego, A4 dla uzasadnienia konstrukcji cyklometrycznej, A7 dla strony w relacji Richera).

**Zakładki przestały skakać.** Karty są różnej wysokości — „Pytania otwarte" mieszczą się w ćwiartce tego, co zajmuje przyrząd — więc przy przełączeniu strona nagle się kurczyła, widok podskakiwał i wyglądało to jak mignięcie. Teraz, póki karty stoją jeszcze jedna pod drugą, mierzymy wszystkie i zadajemy każdej wysokość najwyższej; miara wraca po zmianie szerokości okna i po załadowaniu wszystkich przyrządów. Wysokość dokumentu przy przełączaniu trzech zakładek: cyrkiel 1550 punktów przy każdej, wahadło 2020, szyfr 1714, gnomon 1706 — rozrzut zero. Kosztem jest puste pole pod krótszymi kartami; uznano je za mniejszą dolegliwość niż podskakujący widok.

## Do rozstrzygnięcia — oznaczenie „źródło" na każdej stronie

**Zarzut:** chip „źródło" stoi na wszystkich czterech stronach przyrządów, więc niczego nie odróżnia. Oznaczenie, które nigdy nie jest nieobecne, nie niesie informacji.

**Zarzut jest trafny co do formy,** ale usunięcie oznaczenia statusu wersji jest zmianą merytoryczną i agent go nie rusza. Trzy możliwości do wyboru przez kierownika projektu:

1. **Zostawić i nazwać źródło.** Zamiast „źródło" chip mówi, z czego: „Acta Eruditorum 1685", „Technica curiosa", „relacja Richera", „literatura wilanowska". Wtedy każda strona ma inny napis i chip znowu coś znaczy. Wymaga rozstrzygnięcia A2 i A7, bo dwa z czterech źródeł nie są jeszcze potwierdzone.
2. **Zostawić parę, przebudować drugi człon.** Chip „źródło" pozostaje jako stała część oznaczenia, a drugi mówi wprost, co jest nasze — na wzór pary „co ze źródła / co nasze". Zmiana wyłącznie redakcyjna, do wykonania od ręki.
3. **Usunąć chip „źródło",** zostawiając tylko oznaczenie tego, co dopowiedziane. Najprostsze i najkrótsze, ale strona przestaje wtedy twierdzić wprost, że cokolwiek opiera się na przekazie z epoki — a to jest twierdzenie, które chcemy wypowiadać.

**Rekomendacja agenta:** wariant 2 teraz, wariant 1 po zamknięciu A2 i A7. Wariant 3 odradzany: osłabia oznaczenie statusu, a zysk jest tylko wizualny.

## 2026-10-09 — Cykl 39: para oznaczeń czyta się jako zdanie

**Rozstrzygnięcie kierownika projektu: wariant 2** z pozycji „do rozstrzygnięcia" otwartej w cyklu 38. Chip „źródło" zostaje jako stały człon pary, drugi mówi wprost, co jest nasze.

**Pierwszy człon brzmi teraz „ze źródła"** zamiast „źródło" — ta sama treść, ale napis jest początkiem zdania, a nie etykietą pudełka. Na każdej stronie jest ten sam i taki ma być: mówi, że część tego, co widać, opiera się na przekazie z epoki, a nie że ta strona jest pod tym względem wyjątkowa.

**Drugi człon nazywa dopowiedzenie i na każdej stronie nazywa co innego:** „nasze: interpretacja celu" przy cyrklu, „nasze: uproszczona geometria" przy gnomonie, „nasze: dzisiejszy model błędu" przy wahadle, „nasze: rekonstrukcja metody" przy szyfrze. Dotąd stały tam słowa „interpretacja", „geometria uproszczona", „model współczesny" i „rekonstrukcja" — każde z nich orzekało coś o stronie, ale żadne nie mówiło, o czym mówi. Dymki z cyklu 38 zostają bez zmian i podają szczegóły wraz z pozycją agendy.

**Żadne oznaczenie nie zostało usunięte ani osłabione.** Typy `zrodlo` i `rekonstrukcja` są te same, zastrzeżenia w treści stron nietknięte, kontrola `oznaczenia` przechodzi. Zmiana jest redakcyjna: ta sama rzecz powiedziana tak, żeby dało się ją przeczytać.

**Test pilnuje kształtu pary** (89 testów bez zmian co do liczby, trzy nowe warunki w istniejącym): pierwszy chip musi być oznaczeniem źródła i brzmieć „ze źródła" albo „from the source", drugi musi zaczynać się od „nasze:" albo „ours:" i mieć dalszy ciąg. Sprawdzono też, że drugie człony są różne na wszystkich czterech stronach — bo gdyby były takie same, wróciłby dokładnie ten zarzut, od którego cała rzecz się zaczęła.

## 2026-10-09 — Cykl 40: przełącznik języka jak na stronie głównej fundacji

**Zamiast listy dwóch języków — jeden nastawnik.** Dotąd w szyldzie stały obok siebie „polski" i „English", z czego jedna pozycja zawsze oznaczała stronę, na której się właśnie jest. Teraz stoi tam jeden element: na stronie polskiej „ENGLISH", na angielskiej „POLSKI" — grotesk maszynowy, wersaliki, światło międzyliterowe 0,12 em, cienka obwódka, po najechaniu patyna. Dokładnie tak, jak na stronie głównej fundacji; oba serwisy mają od tego ten sam szyld.

**U nas jest to odnośnik, nie guzik.** Na stronie głównej fundacji przełączenie języka podmienia teksty w miejscu, więc musi być guzikiem. Warsztat ma dla każdej wersji osobne adresy, więc przełącznik jest zwykłym odnośnikiem z `hreflang` — działa bez skryptu, da się otworzyć w nowej karcie i wpisać do zakładek. Wygląda tak samo, zachowuje się jak odnośnik, bo nim jest.

**Cel odnośnika bez zmian:** nadal prowadzi na stronę główną drugiej wersji językowej, nie na odpowiednik bieżącej strony. Przejście z gnomonu po polsku na gnomon po angielsku wymaga jeszcze jednego kliknięcia — to osobna sprawa, do zrobienia przy okazji, bo każda strona ma już klucz `para` wiążący ją z odpowiednikiem.

**Cztery nowe testy** (93 zamiast 89): na stronie przyrządu i na stronie głównej, w obu wersjach, przełącznik ma być dokładnie jeden, nazywać język docelowy, prowadzić pod właściwy adres i nieść `hreflang`.

## 2026-10-10 — Cykl 41: strona nie podskakuje przy przejściu między przyrządami

**Przyczyna:** bez skryptu wszystkie trzy karty stoją jedna pod drugą — i tak ma być, to wersja awaryjna. Ale pasek zakładek chował się dotąd dopiero wtedy, gdy moduł dopisał mu klasę `gotowe`, a karty znikały dopiero wtedy, gdy ten sam moduł ustawił im `hidden`. Między pierwszym rysunkiem a startem modułu strona stała więc w pełnej, trzykrotnej wysokości, po czym kurczyła się do jednej karty. Przy cyrklu było to **1014 punktów** w dół, przy wahadle 125, przy gnomonie 126. Widz czytał to jako podskok treści do góry.

**Poprawka to jeden wiersz w nagłówku dokumentu:** skrypt nadający korzeniowi klasę `js`, wykonywany przed pobraniem arkusza. Arkusz wie od pierwszej klatki, że skrypt działa, więc sam chowa karty poza pierwszą i sam pokazuje pasek zakładek. Moduł zakładek nie zmienia już wysokości strony — tylko przejmuje sterowanie tym, co arkusz ustawił.

**Przy okazji zamieniono kolejność w module:** klasa `gotowe` dopisuje się przed pomiarem wysokości kart, nie po nim. Inaczej arkusz chowałby mierzone karty i wyrównanie z cyklu 38 mierzyłoby same zera.

**Skok wysokości dokumentu między pierwszym rysunkiem a stanem ustalonym** — przed poprawką i po niej: cyrkiel −1014 → +1, wahadło −125 → −69, szyfr −32 → +46, gnomon −126 → −46. Reszta to już same przyrządy dorysowujące się po starcie modułów; kilkadziesiąt punktów nie czyta się jako podskok.

**Trzy nowe testy** (96 zamiast 93): arkusz musi mieć obie reguły wiążące widok z obecnością skryptu, a wiersz nadający klasę `js` musi stać w nagłówku i przed arkuszem — bo postawiony po nim nie zdąży.

## 2026-10-10 — Cykl 42: naprawa po cyklu 41 — pasek zakładek nie może zależeć od wiersza w nagłówku

**Usterka zgłoszona natychmiast po wdrożeniu:** na wszystkich czterech stronach zniknął pasek zakładek i został sam nagłówek pierwszej karty — „Konstrukcja" przy cyrklu, „Przyrząd" przy pozostałych.

**Przyczyna leży w poprzednim cyklu.** Reguła `html:not(.js) .zakladki{display:none}` wiązała widoczność paska z wierszem nadającym korzeniowi klasę `js`, dopisanym w nagłówku dokumentu. Dokument i arkusz leżą jednak w pamięci podręcznej niezależnie od siebie: kto miał stronę sprzed wdrożenia, a arkusz pobrał nowy — bo arkusz niesie odcisk treści w adresie i zmiana wymusiła pobranie — dostawał nowy arkusz ze starym dokumentem. Stary dokument nie ma tego wiersza, więc reguła chowała pasek na zawsze. Moduł zakładek dopisywał `gotowe`, ale to już niczego nie odwracało.

**Lekcja ogólna:** reguła arkusza nie może wymagać, żeby dokument był tej samej wersji. Każdy warunek oparty o klasę `js` musi psuć się w stronę zachowania sprzed poprawki, nigdy w stronę pustej strony.

**Układ reguł po naprawie.** Widoczność paska zależy wyłącznie od tego, czy moduł wystartował — `.zakladki:not(.gotowe){display:none}`, dokładnie jak przed cyklem 41. Wiersz z klasą `js` daje już tylko przyspieszenie: `html.js .zakladki:not(.gotowe){display:flex;visibility:hidden}` sprawia, że pasek zajmuje swoje miejsce od pierwszej klatki, choć jeszcze go nie widać, a dwie dalsze reguły chowają w tym czasie karty poza pierwszą i ich nagłówki. Przy starym dokumencie żadna z nich nie działa i wracamy do zachowania sprzed poprawki: pasek pojawia się po starcie modułu.

**Sprawdzono trzy przypadki, nie jeden.** Nowy dokument z nowym arkuszem: trzy zakładki widoczne, jedna karta, skok wysokości 1 punkt przy cyrklu, 46 przy wahadle, 29 przy szyfrze, 48 przy gnomonie. Stary dokument (wiersz `js` wycięty z dziewiętnastu plików) z nowym arkuszem: trzy zakładki widoczne, jedna karta — usterka nie występuje. Całkiem bez skryptu: paska nie ma, trzy karty stoją jedna pod drugą, każda ze swoim nagłówkiem.

**Test pilnuje teraz tego, co zawiodło** (97 zamiast 96): arkusz nie może mieć żadnej reguły chowającej pasek przy braku klasy `js`, musi mieć regułę wiążącą pasek z gotowością modułu i musi chować nagłówki kart dopiero wtedy, gdy pasek je zastąpi.

## 2026-10-10 — Cykl 43: dwa źródła migania — pasek zakładek i pole wyników cyrkla

**Pasek zakładek mrugał na każdej stronie.** Po cyklu 42 zajmował swoje miejsce od pierwszej klatki, ale był niewidoczny (`visibility:hidden`) aż do startu modułu — więc zamiast podskoku widać było puste pole, które po chwili zapełniało się napisami. Pasek jest w dokumencie w całości, z pierwszą zakładką już zaznaczoną, więc nie ma powodu go chować: pokazuje się od razu, a moduł tylko przejmuje nad nim sterowanie. Przez kilkadziesiąt milisekund kliknięcie nie zadziała — to wymiana lepsza niż mrugnięcie przy każdym przejściu.

**Pole wyników cyrkla rosło o sto pięćdziesiąt punktów.** Suwak promienia i trzy odczyty odsłaniają się dopiero na piątym kroku konstrukcji, ale były dotąd chowane przez `display:none`, więc przejście z kroku czwartego na piąty wydłużało stronę. Teraz pole jest przygaszone, nie usunięte: trzyma swoje miejsce od pierwszej klatki i tylko staje się widoczne. Wysokość dokumentu na wszystkich pięciu krokach: 1648 punktów, bez wyjątku.

**Opis kroku rezerwuje dwa wiersze.** Przy czterech pierwszych krokach mieścił się w jednym, przy piątym łamał się na dwa — stąd jeszcze siedem punktów ruchu, teraz zero.

**Powtórny pomiar wysokości kart po załadowaniu przyrządów może już tylko dołożyć, nie odebrać.** Strona, którą widz ma przed oczami, nie kurczy się pod nim; zmniejszyć wolno dopiero przy zmianie szerokości okna, bo to i tak nowy układ. Kosztem bywa kilkadziesiąt punktów pustego pola na dole.

**Skok wysokości dokumentu między pierwszym rysunkiem a stanem ustalonym:** cyrkiel 1 punkt (było 149 po samej poprawce kroków), wahadło −46, szyfr 45, gnomon −22. Reszta to przyrządy dorysowujące własną treść poniżej pierwszego ekranu.

**Trzy nowe testy** (100 zamiast 97): moduł cyrkla nie może chować pola wyników przez `hide`, arkusz musi mieć regułę przygaszania i rezerwację miejsca od pierwszej klatki, a w dokumencie pole musi nadal nieść klasę `hide` — żeby bez skryptu pozostało schowane, a nie świeciło martwym suwakiem.

## 2026-10-10 — Cykl 44: miganie przy przechodzeniu między przyrządami to była podmiana kroju

**Zmierzono klatka po klatce, zamiast zgadywać.** Próbka co odrysowanie, przez dwie i pół sekundy od wejścia na stronę, z położeniem paska zakładek, karty, rysunku przyrządu i ścieżki na dole. Wynik był ten sam na każdej z czterech stron: około setnej milisekundy *wszystko* przesuwało się o punkt albo dwa naraz. To nie przyrządy — to chwila, w której przeglądarka zamienia pismo zapasowe na EB Garamond. Każdy wiersz na stronie drgał jednocześnie i właśnie to czytało się jako mignięcie.

**Dwie poprawki naraz.** Kroje są zamawiane z góry, w nagłówku dokumentu, zanim przeglądarka dojdzie do arkusza (`rel="preload"`, wszystkie sześć plików, z nazwami niosącymi odcisk treści branymi z nowego spisu `src/_data/kroje.json`, który wypisuje skrypt obcinający). Do tego `font-display` zmienione ze `swap` na `optional`: jeśli krój nie zdąży na pierwszy rysunek, strona zostaje przy piśmie zapasowym do końca tego wejścia, zamiast przerysowywać się w połowie. Pierwsze nie gwarantuje, drugie gwarantuje — razem dają zwykle właściwe pismo od razu, a nigdy dwóch pism po sobie.

**Pasek odwzorowania w szyfrze rezerwuje wysokość.** Moduł wypełnia go literami dopiero po starcie i strona rosła wtedy o czterdzieści trzy punkty; wiersz pary liter o kolejne trzy.

**Ruch układu po wejściu na stronę, przed poprawką i po niej** (największe przesunięcie dowolnego z czterech punktów pomiarowych): cyrkiel 21 punktów → 0, wahadło 70 → 0, szyfr 46 → 2, gnomon 22 → 0. Na gnomonie nie rusza się już nic.

**Trzy nowe testy** (103 zamiast 100): arkusz krojów nie może zawierać `font-display:swap` i musi mieć sześć deklaracji `optional`, każda strona musi zamawiać z góry sześć plików kroju z poprawnym `crossorigin`, a pasek szyfru i wiersz pary liter muszą rezerwować wysokość.

## 2026-10-10 — Cykl 45: resztki ruchu zmierzone przyrządem, nie okiem

**Zmieniono narzędzie pomiaru.** Dotąd porównywaliśmy wysokość dokumentu w dwóch chwilach, co pokazuje sumę, ale nie mówi, co się rusza. Teraz czyta się wprost wskaźnik niestabilności układu, który przeglądarka liczy sama i podaje wraz z elementami, które drgnęły, i o ile. Pomiar prowadzony przy zimnej pamięci podręcznej i dławionym łączu — tak, jak to wygląda w oknie prywatnym, a nie przy nagrzanym serwerze.

**Trzy znalezione źródła, wszystkie tej samej natury:** element, który przed startem modułu zajmuje inną wysokość niż po nim.

1. **Pola wyboru daty na gnomonie.** Przed złożeniem bębenków stały pod kartką w pełnej okazałości, a klasa chowająca je pojawiała się dopiero wtedy, gdy moduł skończył pracę. Kolumna kalendarza kurczyła się wówczas o dwadzieścia cztery punkty i cała ściana poniżej podskakiwała. Teraz ustępują bębenkom od pierwszej klatki.
2. **Odczyt stanu morza na wahadle.** „5° · lekka fala" łamie się w wąskiej kolumnie na trzy wiersze, a przed startem modułu stoi tam kreska w jednym. Rząd rósł o szesnaście punktów. Zarezerwowano trzy wiersze.
3. **Pasek przewijania.** Strona, która w pierwszej chwili mieści się w oknie, a po dorysowaniu przyrządu już nie, dostaje pasek w locie: szerokość treści maleje o kilkanaście punktów i cały tekst łamie się na nowo. Miejsce na pasek jest teraz rezerwowane zawsze, także w przewijanym w poziomie polu ściany.

**Wskaźnik niestabilności układu po poprawkach:** cyrkiel 0, wahadło 0, szyfr 0, gnomon 0,0005 bez wskazania konkretnego elementu. Próg uznawany za dobry to 0,1 — jesteśmy dwieście razy poniżej na najgorszej ze stron.

## 2026-10-10 — Cykl 46: strzały z łuku po bokach bębenków

**Daszki ustąpiły strzałom.** Dwa groty jeden pod drugim po lewej stronie okienka czytały się jak pasek przewijania. Teraz po bokach każdego bębenka stoi strzała: w lewo poprzednia wartość, w prawo następna — „← czerwca →" i „← 20 →". Rysunek jest strzałą z łuku: drzewce, grot i lotki, kreślone tym samym mosiądzem co koronka i radełka. Przyrząd ma mówić językiem warsztatu, nie paska przewijania.

**Obsługa bez zmian:** strzały niosą `data-bez-dymka`, więc objaśnienie kartki nie wyskakuje nad tym, w co się celuje, a pole chwytu obejmuje dwadzieścia cztery na dwadzieścia punktów wokół każdej. Przeciąganie, kółko i klawiatura działają jak dotąd.

**Test sprawdza, że strzała jest strzałą:** jedna po lewej stronie okienka, druga po prawej, a każda ma drzewce, grot i lotki. Dotąd warunek mówił tylko, że groty stoją po lewej — po zmianie układu przechodziłby dalej, nic nie znacząc.

## 2026-10-10 — Cykl 47: polityka bezpieczeństwa treści unieważniła poprawkę z cyklu 41

**Usterka tłumaczy pięć cykli chodzenia w kółko.** Od cyklu 41 w nagłówku każdej strony stał jeden wiersz skryptu nadający dokumentowi klasę `js`; na niej oparte były wszystkie reguły mające ustawić układ od pierwszej klatki — pasek zakładek, karty poza pierwszą, pole wyników cyrkla, pola wyboru daty na gnomonie. Polityka bezpieczeństwa treści serwisu ma jednak `script-src 'self'`, która blokuje skrypty wpisane wprost w stronę. Wiersz nie wykonywał się **na serwerze**, choć u nas, przy podglądzie bez tej polityki, wykonywał się bez zarzutu. Wszystkie pomiary wychodziły więc czysto, a na wdrożonym serwisie strona dalej skakała dokładnie tak jak przed poprawką.

**Rzecz wyszła przypadkiem:** przeglądarka odmówiła wykonania wklejki pomiarowej w konsoli, podając tę samą dyrektywę. Dopiero wtedy stało się jasne, że ten sam zakaz dotyczy naszego wiersza w nagłówku.

**Poprawka:** wiersz przeniesiony do osobnego pliku `/assets/js/wczesnie.js`, pobieranego w nagłówku. Czterysta bajtów, z tego samego serwisu, więc polityka go przepuszcza; nagłówki pamięci podręcznej dla `/assets/js/*` każą go sprawdzać przy każdym wejściu, więc nie zestarzeje się po cichu.

**Nowa kontrola automatyczna `polityka`** (czternasta): czyta politykę z `_site/_headers` i sprawdza, że zbudowane strony nie zawierają niczego, czego ta polityka nie przepuści — skryptu wpisanego wprost w stronę, atrybutu `style` w znaczniku, skryptu spoza serwisu — oraz że sama polityka nie zmiękła o `'unsafe-inline'`. Sprawdzono, że kontrola potrafi zawieść: po przywróceniu wiersza w nagłówku zgłasza wszystkie dziewiętnaście stron.

**Lekcja ogólna, trzecia tego rodzaju w ciągu jednego wieczoru:** podgląd lokalny nie jest serwisem. Różni je polityka bezpieczeństwa treści, nagłówki pamięci podręcznej i opóźnienia sieci — i każda z tych trzech rzeczy po kolei dała usterkę niewidoczną w próbach. Odtąd kontrola automatyczna czyta `_headers` i konfrontuje je z tym, co faktycznie stoi na stronach.

## 2026-10-10 — Cykl 48: strzały w obrębie kartki, wzór nie rozpycha wiersza

**Strzały wychodziły poza kartkę.** Przy odstępie siedemnastu punktów od okienka i długości dwudziestu sięgały poza krawędź papieru — wyglądało to, jakby ktoś je przykleił obok kalendarza, a nie na nim. Skrócone do czternastu punktów i przysunięte do jedenastu od okienka; oba bębenki mają teraz jednakową szerokość osiemdziesięciu czterech punktów, więc strzały stoją w jednej osi, szesnaście punktów od brzegu kartki z każdej strony. Test wymaga, żeby pole chwytu każdej strzały mieściło się w kartce z zapasem dziesięciu punktów.

**Obniżenie tekstu w piątym kroku cyrkla** miało przyczynę, której nie widać w wysokości akapitu: wiersz z pierwiastkiem jest naturalnie wyższy. Wzór na długość odcinka BD — pierwiastek z różnicy czterdziestu trzecich i dwóch pierwiastków z trzech, pomnożony przez promień — ma trzydzieści cztery punkty wysokości przy wierszu liczącym dwadzieścia siedem, więc wstawiony w zdanie rozpychał wiersz i tekst osiadał niżej niż w krokach bez wzoru. Akapit miał stałą wysokość — stąd kontrola geometrii nic nie pokazywała — ale pismo w nim wędrowało. Wzór zmniejszony do 0,82 wysokości pisma i opuszczony o 0,26 mieści się w wierszu: pierwszy wiersz zaczyna się w tym samym miejscu co przy kroku czwartym, co do punktu.

**Nauka z tego pomiaru:** wysokość bloku to za mało. Przy ruchu „delikatnym" trzeba mierzyć prostokąty wierszy wewnątrz bloku, nie sam blok.
