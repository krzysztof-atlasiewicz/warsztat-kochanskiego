// Ergonomia tego, co da się policzyć z arkusza i z dokumentu: kontrast barw,
// oznaki przewijania, szerokość sterowników.
//
// Każda z tych rzeczy była w serwisie zepsuta przez miesiąc i żadna kontrola
// tego nie zauważyła, bo wszystkie pilnowały treści, nie formy. Te testy nie
// zastępują oka — sprawdzają tylko progi, które mają liczbę.
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const arkusz = readFileSync("src/assets/css/site.css", "utf8");

// ── kontrast według wzoru z WCAG 2.1 ──────────────────────────────────────
const kanal = (c) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const jasnosc = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
};
const kontrast = (a, b) => {
  const [x, y] = [jasnosc(a), jasnosc(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// Barwy czytamy z arkusza, nie przepisujemy: test ma upaść po zmianie
// arkusza, a nie po zapomnieniu o aktualizacji testu.
const barwa = (nazwa, ciemny = false) => {
  const blok = ciemny
    ? arkusz.slice(arkusz.indexOf("@media (prefers-color-scheme:dark)"))
    : arkusz.slice(0, arkusz.indexOf("@media (prefers-color-scheme:dark)"));
  const m = blok.match(new RegExp(`--${nazwa}\\s*:\\s*(#[0-9A-Fa-f]{6})`));
  expect(m, `nie znalazłem barwy --${nazwa} w trybie ${ciemny ? "ciemnym" : "jasnym"}`).not.toBeNull();
  return m[1];
};

describe("kontrast barw", () => {
  for (const tryb of [false, true]) {
    const nazwa = tryb ? "ciemny" : "jasny";
    const paper = () => barwa("paper", tryb);
    const plate = () => barwa("plate", tryb);

    // Próg 4,5 dotyczy zwykłego tekstu. „--sun” nie jest ozdobą: to barwa cyfr
    // godzin włoskich na ścianie (12,5 pkt), oznaczenia „nasze” (11,6 pkt)
    // i nagłówka pytania otwartego (12,2 pkt) — najmniejszy tekst w serwisie.
    for (const [tlo, jak] of [["paper", paper], ["plate", plate]]) {
      it(`tryb ${nazwa}: --sun na --${tlo} nadaje się pod drobny tekst`, () => {
        expect(kontrast(barwa("sun", tryb), jak())).toBeGreaterThanOrEqual(4.5);
      });
      it(`tryb ${nazwa}: --verd na --${tlo} nadaje się pod drobny tekst`, () => {
        expect(kontrast(barwa("verd", tryb), jak())).toBeGreaterThanOrEqual(4.5);
      });
      it(`tryb ${nazwa}: --ink-soft na --${tlo} nadaje się pod drobny tekst`, () => {
        expect(kontrast(barwa("ink-soft", tryb), jak())).toBeGreaterThanOrEqual(4.5);
      });
      // Próg 3,0 dotyczy granic elementów sterujących: bez widocznej krawędzi
      // guzik wygląda jak tekst, a pole tekstowe jak tło.
      it(`tryb ${nazwa}: --rule-ster na --${tlo} widać jako krawędź sterownika`, () => {
        expect(kontrast(barwa("rule-ster", tryb), jak())).toBeGreaterThanOrEqual(3);
      });
    }
  }

  it("sterowniki używają barwy sterownika, nie barwy linijki", () => {
    // Linijka na papierze ma być cicha i taka zostaje; sterownik musi mieć
    // krawędź widoczną. Te cztery to wszystkie miejsca, w których użytkownik
    // czegoś dotyka albo coś wpisuje.
    for (const [opis, wzor] of [
      ["guzik", /\bbutton\{[^}]*border:1px solid var\(--rule-ster\)/],
      ["pole tekstowe szyfru", /\.szyfr-pola textarea\{[^}]*border:1px solid var\(--rule-ster\)/],
      ["lista wyboru", /\.wybor select\{[^}]*border:1px solid var\(--rule-ster\)/],
      ["przełącznik języka", /\.przelacz-jezyk\{[^}]*border:1px solid var\(--rule-ster\)/]
    ]) {
      expect(arkusz, `${opis} ma obwódkę w barwie linijki`).toMatch(wzor);
    }
  });
});

describe("pole przewijane w poziomie", () => {
  const modul = readFileSync("src/assets/js/przewijalne.js", "utf8");

  it("arkusz gasi tę krawędź, po której jeszcze coś jest", () => {
    expect(arkusz, "brak cieniowania prawej krawędzi").toMatch(/\.przewijalna\.ma-prawo\{[^}]*mask-image/);
    expect(arkusz, "brak cieniowania lewej krawędzi").toMatch(/\.przewijalna\.ma-lewo\{[^}]*mask-image/);
    expect(arkusz, "brak cieniowania obu krawędzi naraz")
      .toMatch(/\.przewijalna\.ma-lewo\.ma-prawo\{/);
  });

  it("nie rezerwuje miejsca na pasek, którego tam nie będzie", () => {
    // Przy samym „overflow-x:auto" druga oś liczy się jak „auto", więc razem
    // ze „scrollbar-gutter:stable" pole traciło 15 z 295 punktów szerokości na
    // pionowy pasek, który nigdy się nie pojawia. Gorzej: zapas liczony jako
    // scrollWidth − clientWidth wychodził o te 15 punktów większy od tego, co
    // da się przewinąć, więc prawa krawędź cieniowała się nawet na końcu.
    const regula = arkusz.match(/\.przewijalna\{[^}]*\}/)[0];
    expect(regula, "druga oś nie jest wyłączona wprost").toContain("overflow-y:hidden");
    expect(regula, "pole wciąż rezerwuje miejsce na pasek").not.toContain("scrollbar-gutter");
  });

  it("moduł nadaje klasy po pomiarze zapasu, a nie na sztywno", () => {
    expect(modul).toMatch(/scrollWidth - pole\.clientWidth/);
    expect(modul).toMatch(/classList\.toggle\("ma-lewo"/);
    expect(modul).toMatch(/classList\.toggle\("ma-prawo"/);
  });

  it("widok startuje na środku, bo na brzegu stoi samo niebo", () => {
    expect(modul, "brak ustawienia widoku na środku").toMatch(/scrollLeft = Math\.round\(z \/ 2\)/);
  });

  it("nie przesuwa widoku, gdy widz już sam przewinął", () => {
    expect(modul, "brak zabezpieczenia przed przesunięciem pod ręką").toMatch(/!ruszone/);
    for (const z of ["pointerdown", "wheel", "keydown", "touchstart"])
      expect(modul, `moduł nie uznaje „${z}” za ruch widza`).toContain(z);
  });

  it("jest wpięty w rozruch, więc działa na każdej stronie z takim polem", () => {
    const rozruch = readFileSync("src/assets/js/bootstrap.js", "utf8");
    expect(rozruch).toMatch(/import\("\.\/przewijalne\.js"\)/);
  });
});

describe("kartka kalendarza", () => {
  // Szerokość kartki stoi w jednym miejscu — w zmiennej — bo używa jej i sam
  // rysunek, i blok, w którym rysunek stoi. Rozjechane dawały rysunek szerszy
  // od swojego pola, dosunięty do krawędzi.
  const szerKartki = (reguly) => Number(reguly.match(/--kartka:(\d+)px/)[1]);

  // Testy liczą własność, nie liczbę: inaczej każda zmiana rozmiaru każe
  // przepisywać test, a przepisywany test przestaje czegokolwiek pilnować.
  it("rośnie jeszcze bardziej tam, gdzie nie musi się równać z zegarkiem", () => {
    const szeroko = szerKartki(arkusz.slice(0, arkusz.indexOf("@media (max-width:58rem)")));
    const wasko = szerKartki(arkusz.slice(arkusz.indexOf("@media (max-width:58rem){ :root{--kartka")));
    expect(wasko, "kartka na wąskim ekranie nie jest szersza").toBeGreaterThan(szeroko);
  });

  it("papier kartki ma margines, a nie dotyka krawędzi rysunku", () => {
    // Papier zaczynał się dziesięć jednostek od brzegu viewBoksa, czyli
    // jedenaście punktów na ekranie — kartka wyglądała na dosuniętą do
    // krawędzi. Zawartość jest teraz zmniejszona wokół środka, a kartka
    // o tyle samo szersza, więc sam papier ma tę samą wielkość co przedtem.
    const njk = readFileSync("src/_includes/przyrzady/gnomon.njk", "utf8");
    const skala = Number(njk.match(/class="arkusz" transform="[^"]*scale\(([\d.]+)\)/)[1]);
    const [, , vbSzer] = njk.match(/viewBox="0 0 (\d+) (\d+)"[^>]*class="kartka/).slice(0, 3).map(Number);
    const papierOd = Number(njk.match(/<path d="M (\d+) 18 L/)[1]);
    const srodek = vbSzer / 2;
    const poSkali = srodek - (srodek - papierOd) * skala;
    const px = poSkali * szerKartki(arkusz) / vbSzer;
    expect(px, `margines papieru to ${px.toFixed(1)} punktu`).toBeGreaterThan(20);
  });

  it("rysunek kartki i jej blok biorą szerokość z tej samej liczby", () => {
    expect(arkusz, "rysunek ma własną szerokość").toMatch(/\.kartka\{width:var\(--kartka\)/);
    const bloki = [...arkusz.matchAll(/\.blok-daty\{flex:0 0 ([^;}]+)/g)].map((m) => m[1]);
    expect(bloki.length, "nie znalazłem reguł bloku daty").toBeGreaterThan(0);
    for (const b of bloki)
      expect(b, "blok daty ma szerokość wpisaną z ręki").toBe("var(--kartka)");
  });

  it("kartka i zegarek kończą się na tej samej wysokości", () => {
    // Stoją w jednym rzędzie, więc muszą rosnąć w tej samej proporcji.
    // Kartka: viewBox 160 × 239. Zegarek: 200 × 224. Przy 180 i 240 punktach
    // szerokości oba mają 269 punktów wysokości — stąd te, a nie inne liczby.
    const szerKartki = Number(arkusz.match(/--kartka:(\d+)px/)[1]);
    const szerZegarka = Number(arkusz.match(/\.tarcza-mechaniczna\{max-width:(\d+)px/)[1]);
    const wysKartki = szerKartki * 239 / 160;
    const wysZegarka = szerZegarka * 224 / 200;
    expect(Math.abs(wysKartki - wysZegarka), "kartka i zegarek rozjechały się wysokością")
      .toBeLessThan(2);
  });

  it("wiersze dnia i nocy nie dochodzą do ramki kartki", () => {
    // „dzień: 14 godz 21 min" to 21 znaków pisma o stałej szerokości, którego
    // znak ma około 0,6 firetu. Wnętrze kartki ma 140 jednostek, więc przy
    // 11 punktach tekst zajmował 139 z nich i dotykał obu krawędzi.
    const m = arkusz.match(/\.kartka-pora\{font-size:(\d+(?:\.\d+)?)px\}/);
    expect(m, "wiersze dnia i nocy nie mają własnego kroju").not.toBeNull();
    const szerokoscTekstu = 21 * Number(m[1]) * 0.6;
    expect(140 - szerokoscTekstu, "za mało luzu między tekstem a ramką").toBeGreaterThan(10);
  });
});

describe("odczyty wahadła", () => {
  it("liczba nie rozstaje się z jednostką przy łamaniu wiersza", () => {
    const i18n = readFileSync("src/_data/i18n.js", "utf8");
    for (const wzor of [/tempoSek: "\{s\}\\u00a0s"/, /tempoMin: "\{m\}\\u00a0min \{s\}\\u00a0s"/])
      expect(i18n, "jednostka może zostać sama na końcu wiersza").toMatch(wzor);
  });

  it("stan morza stoi w dwóch wierszach, bez separatora w środku", () => {
    const modul = readFileSync("src/assets/js/modules/rejs.js", "utf8");
    expect(modul, "separator wrócił do odczytu stanu morza").not.toMatch(/\$\{kolysanie\}° ·/);
    expect(arkusz, "brak układu dwuwierszowego").toMatch(/\.odczyt-stopnie,\.odczyt-nazwa\{display:block\}/);
  });

  it("zastrzeżenie o zgubionym impulsie trzyma miejsce, zanim się pojawi", () => {
    // Bez tego jego pojawienie się spychało kartę kursową i resztę strony
    // w dół pod ręką widza, który właśnie przesuwał suwak stanu morza.
    expect(arkusz, "zastrzeżenie wciąż rozpycha stronę")
      .toMatch(/html\.js #stop\.hide\{display:block;visibility:hidden\}/);
  });

  it("skala wzburzenia jest nazwana i przypisana nam, nie epoce", () => {
    const i18n = readFileSync("src/_data/i18n.js", "utf8");
    expect(i18n, "polski opis nie mówi, czyja jest skala").toMatch(/Skala jest nasza, nie historyczna/);
    expect(i18n, "angielski opis nie mówi, czyja jest skala").toMatch(/scale is ours, not historical/);
    expect(i18n, "opis nie podaje progu sztormu").toMatch(/10,5|10\.5/);
  });
});

describe("morze się rusza", () => {
  it("fale przesuwają się o własny okres, więc przeskok jest niewidoczny", () => {
    const modul = readFileSync("src/assets/js/modules/rejs.js", "utf8");
    const okres = Number(modul.match(/OKRES_FALI = (\d+)/)[1]);
    // Blok klatek ma zagnieżdżone nawiasy, więc czytamy go od nazwy do końca
    // ostatniej klatki, a nie do pierwszego zamknięcia.
    const blok = arkusz.slice(arkusz.indexOf("@keyframes przeplyw"));
    const przesuniecie = Number(blok.match(/translateX\(-(\d+)px\)/)[1]);
    expect(przesuniecie, "przesunięcie nie równa się okresowi fali — przeskok będzie widać")
      .toBe(okres);
  });

  it("fale są rysowane z zapasem większym niż przesunięcie", () => {
    // Inaczej po przesunięciu z prawej strony odsłoniłaby się pusta woda.
    const modul = readFileSync("src/assets/js/modules/rejs.js", "utf8");
    const od = Number(modul.match(/FALE_OD = (-?\d+)/)[1]);
    const okres = Number(modul.match(/OKRES_FALI = (\d+)/)[1]);
    expect(Math.abs(od), "za mały zapas z lewej").toBeGreaterThan(okres);
  });

  it("tempo fal idzie za stanem morza, a ruch pyta o zgodę", () => {
    const modul = readFileSync("src/assets/js/modules/rejs.js", "utf8");
    expect(modul, "tempo fal nie zależy od stanu morza").toMatch(/--fala.*stan/s);
    const ruch = arkusz.slice(arkusz.indexOf("@media (prefers-reduced-motion:no-preference)"));
    expect(ruch.slice(0, 600), "ruch fal poza osłoną zgody na animację").toContain("#fale{animation");
  });
});

describe("projekt nie opisuje narzędzi, którymi go zrobiono", () => {
  // Reguła sięga repozytorium, nie tylko stron, bo repozytorium jest publiczne.
  // Sięga tekstów — dokumentacji, regulaminu prac, raportów cyklu — a nie kodu,
  // gdzie nazwy są identyfikatorami, a nie wypowiedzią projektu.
  it("regulamin prac nie nazywa wykonawcy ani w treści, ani w nazwie pliku", () => {
    expect(existsSync("pdca/agent.md"), "plik o nazwie nazywającej wykonawcę wrócił").toBe(false);
    expect(existsSync("pdca/zakres-prac.md"), "brak regulaminu prac").toBe(true);
    const regulamin = readFileSync("pdca/zakres-prac.md", "utf8");
    expect(regulamin, "regulamin znów nazywa wykonawcę")
      .not.toMatch(/(?<![-\w])agent(a|owi|em|ach|ów|y)?\b/i);
    // Reguły muszą przeżyć zmianę nazewnictwa co do jednej.
    for (const regula of [/Zamykać pozycji agendy/, /traktować jako treść/,
                          /bez potwierdzonej licencji/, /poza zamkniętą listą sześciu/])
      expect(regulamin, `z regulaminu wypadła reguła: ${regula}`).toMatch(regula);
    // I nie wolno udawać, że automatyzacji nie ma — to byłoby przemilczenie,
    // nie decyzja redakcyjna.
    expect(regulamin, "regulamin przemilcza, że prace bywają zautomatyzowane")
      .toMatch(/zautomatyzowan/);
  });

  it("żaden tekst w repozytorium nie nazywa narzędzi", () => {
    const POMIJANE = new Set(["node_modules", "_site", "_podglad", ".git"]);
    const proza = (katalog, zebrane = []) => {
      for (const w of readdirSync(katalog, { withFileTypes: true })) {
        if (POMIJANE.has(w.name)) continue;
        const sciezka = `${katalog}/${w.name}`;
        if (w.isDirectory()) proza(sciezka, zebrane);
        else if (/\.(md|njk|txt)$/.test(w.name)) zebrane.push(sciezka);
      }
      return zebrane;
    };
    for (const plik of proza(".")) {
      const tekst = readFileSync(plik, "utf8");
      for (const slowo of [/(?<![-\w])agent(a|owi|em|ach|ów|y)?\b/i, /\bClaude\b/i,
                           /sztuczn\w* inteligencj/i, /\bLLM\b/]) {
        if (plik.endsWith("robots.njk") && /agent/i.test(String(slowo))) continue;
        expect(tekst, `${plik}: wzmianka o narzędziu`).not.toMatch(slowo);
      }
    }
  });
});

describe("rejestr decyzji nie opisuje narzędzi", () => {
  it("rejestr decyzji mówi bezosobowo o tym, czego nie rozstrzyga się bez decyzji", () => {
    const rejestr = readFileSync("src/pl/decyzje.md", "utf8");
    // Jak w kontroli: łącznik nie jest tu granicą słowa, bo rejestr ma prawo
    // mówić o polu „User-agent" w robots.txt.
    for (const slowo of [/(?<![-\w])agent(a|owi|em|ach|ów|y)?\b/i, /sztuczn\w* inteligencj/i, /\bClaude\b/i])
      expect(rejestr, `w rejestrze wróciła wzmianka o narzędziu: ${slowo}`).not.toMatch(slowo);
    // Reguła nie znika razem ze słowem: zakaz zamykania pozycji bez decyzji
    // kierownika projektu musi dalej stać w tekście, tylko bezosobowo.
    expect(rejestr, "zniknęła sama reguła, nie tylko jej podmiot")
      .toMatch(/nie rozstrzyga się bez decyzji|zamknięcie należy do kierownika projektu/);
  });
});

describe("pulpit rejsu czyta się jak pulpit", () => {
  const szablon = readFileSync("src/_includes/przyrzady/rejs.njk", "utf8");

  it("wszystkie nastawniki stoją w jednej listwie, nie pod swoimi rysunkami", () => {
    // Kartka ma 248 punktów wysokości, okręt 138. Dopóki suwaki wisiały pod
    // rysunkami, stały na dwóch różnych poziomach i pulpit rozpadał się na
    // trzy niezależne widżety.
    const listwa = szablon.match(/<div class="listwa-nastawnikow">[\s\S]*?\n  <\/div>/);
    expect(listwa, "brak listwy nastawników").not.toBeNull();
    for (const id of ["dzien", "tempo", "kolysanie"])
      expect(listwa[0], `nastawnik „${id}" stoi poza listwą`).toContain(`id="${id}"`);
    const rzadRysunkow = szablon.match(/<div class="pulpit-sterowniki">[\s\S]*?\n  <\/div>/)[0];
    for (const id of ["dzien", "tempo", "kolysanie"])
      expect(rzadRysunkow, `nastawnik „${id}" wrócił pod rysunek`).not.toContain(`id="${id}"`);
  });

  it("nazwa i wartość stoją nad suwakiem, nie obok ani pod nim", () => {
    const r = arkusz.match(/\.listwa-nastawnikow \.ctl\{[^}]*\}/)[0];
    expect(r, "nastawnik nie jest siatką dwuwierszową").toContain("grid-template-columns:1fr auto");
    const etykieta = arkusz.match(/\.listwa-nastawnikow \.ctl label\{[^}]*\}/)[0];
    const odczyt = arkusz.match(/\.listwa-nastawnikow \.ctl output\{[^}]*\}/)[0];
    const suwak = arkusz.match(/\.listwa-nastawnikow \.ctl input\[type=range\]\{[^}]*\}/)[0];
    expect(etykieta, "nazwa poza pierwszym wierszem").toContain("grid-area:1 / 1");
    expect(odczyt, "wartość poza pierwszym wierszem").toContain("grid-area:1 / 2");
    expect(suwak, "suwak nie zajmuje całej szerokości drugiego wiersza")
      .toContain("grid-area:2 / 1 / 3 / 3");
  });

  it("listwa ma tyle kolumn, ile nastawników, i zwęża się na telefonie", () => {
    // „auto-fit" na szerokim ekranie mieścił czwartą kolumnę i zostawiał puste
    // miejsce obok ostatniego suwaka; trzy sztywne kolumny nie mieściły się
    // z kolei na telefonie i dawały przewijanie w poziomie.
    // Reguły z zapytań o szerokość są w arkuszu wcięte, zwykłe stoją od lewej
    // krawędzi — po tym je tu rozróżniamy, bo zapytań o 58 rem jest kilka
    // i cięcie arkusza na pierwszym z nich trafiało nie tam, gdzie trzeba.
    const zwykla = arkusz.match(/^\.listwa-nastawnikow\{[^}]*\}/m);
    expect(zwykla, "brak zwykłej reguły listwy").not.toBeNull();
    expect(zwykla[0], "listwa nie ma trzech kolumn").toContain("repeat(3,1fr)");
    const wcieta = arkusz.match(/^ +\.listwa-nastawnikow\{[^}]*\}/m);
    expect(wcieta, "listwa nie zwęża się na telefonie").not.toBeNull();
    expect(wcieta[0], "zwężenie nie jest płynne").toContain("auto-fit");
  });
});

describe("serwis mówi, czyj jest", () => {
  // Rozróżnienie „ze źródła / nasze" nie znaczy nic, dopóki czytelnik nie wie,
  // kto jest tym „my". Instytucja uwiarygodnia się szyldem; prywatny projekt
  // musi to powiedzieć wprost i podać, co ma zamiast recenzenta.
  const STRONY = [
    ["_site/pl/index.html", "prywatny projekt badawczy", "Atłasiewicza"],
    ["_site/en/index.html", "a private research project", "Atłasiewicz"]
  ];

  for (const [plik, fraza, nazwisko] of STRONY) {
    it.skipIf(!existsSync(plik))(`${plik}: nazywa autora i charakter projektu`, () => {
      const html = readFileSync(plik, "utf8").toLowerCase();
      expect(html, "brak informacji o charakterze projektu").toContain(fraza.toLowerCase());
      expect(html, "brak nazwiska autora").toContain(nazwisko.toLowerCase());
    });
  }

  it("informacja o autorze stoi też w stopce, czyli na każdej stronie", () => {
    const i18n = readFileSync("src/_data/i18n.js", "utf8");
    expect(i18n, "polska stopka nie nazywa autora").toMatch(/stopka: "Prywatny projekt badawczy dr/);
    expect(i18n, "angielska stopka nie nazywa autora").toMatch(/stopka: "A private research project by dr/);
  });

  it.skipIf(!existsSync("_site/pl/index.html"))("nie przypisuje projektu instytucji, której nie ma", () => {
    // Fundacja jest w planach, nie w rejestrze. Dopóki jej nie ma, serwis się
    // nią nie zasłania — to ten sam zakaz, co przy twierdzeniach o przeszłości.
    for (const plik of ["_site/pl/index.html", "_site/en/index.html"]) {
      const html = readFileSync(plik, "utf8");
      expect(html, "serwis powołuje się na fundację").not.toMatch(/[Ff]undacj|[Ff]oundation/);
    }
  });
});

describe("adres do korespondencji", () => {
  // Sekcja „Kto za tym stoi" kończy się zaproszeniem do sprostowań. Zaproszenie
  // bez adresu jest gestem, nie zaproszeniem: czytelnik, który znajdzie błąd,
  // nie ma gdzie go zgłosić, a serwis, który obiecuje ślad każdej poprawki,
  // nie może zamknąć do siebie drogi. Dlatego jedno nie może tu stać bez
  // drugiego — i to pilnuje trzeci test, nie dwa pierwsze.
  const STRONY = [
    ["_site/pl/index.html", "kontakt@adamandy.pl"],
    ["_site/en/index.html", "office@adamandy.pl"]
  ];

  for (const [plik, adres] of STRONY) {
    it.skipIf(!existsSync(plik))(`${plik}: podaje adres ${adres}`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "brak odnośnika pocztowego").toContain(`href="mailto:${adres}"`);
      expect(html, "adres nie jest widoczny w treści, tylko w atrybucie")
        .toContain(`>${adres}</a>`);
    });
  }

  const strony = (katalog, zebrane = []) => {
    for (const w of readdirSync(katalog, { withFileTypes: true })) {
      const sciezka = `${katalog}/${w.name}`;
      if (w.isDirectory()) strony(sciezka, zebrane);
      else if (w.name.endsWith(".html")) zebrane.push(sciezka);
    }
    return zebrane;
  };

  it.skipIf(!existsSync("_site"))("nie publikuje adresu poza domeną serwisu", () => {
    // Zakaz, nie wymóg. Adres prywatny albo firmowy wklejony tu przez pomyłkę
    // zostaje w sieci na zawsze i nie da się go odwołać wdrożeniem poprawki.
    // Szukamy kształtu adresu i w odnośnikach, i w samej treści: adres
    // wklejony w akapit bez odnośnika jest równie publiczny. Znaczniki trzeba
    // wpierw usunąć, bo „`mailto:`" w kodzie rejestru decyzji daje po
    // złożeniu „mailto:</code" i wcześniejsza wersja tego testu brała to za
    // adres.
    const DOZWOLONE = /@adamandy\.pl$/;
    const KSZTALT = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
    for (const plik of strony("_site")) {
      const html = readFileSync(plik, "utf8");
      const widziane = new Set();
      for (const m of html.matchAll(/href="mailto:([^"?]+)"/g)) widziane.add(m[1]);
      for (const m of html.replace(/<[^>]*>/g, " ").matchAll(KSZTALT)) widziane.add(m[0]);
      for (const a of widziane)
        expect(a, `${plik}: adres poza domeną serwisu (${a})`).toMatch(DOZWOLONE);
    }
  });

  it("adres stoi w jednym miejscu, nie w szablonach", () => {
    // Regulamin i polityka prywatności będą tego adresu potrzebowały. Dwa
    // wpisane ręcznie rozjechałyby się po pierwszej zmianie i nikt by tego nie
    // zauważył, bo każda ze stron z osobna wyglądałaby poprawnie.
    const dane = readFileSync("src/_data/site.js", "utf8");
    expect(dane, "brak adresów w danych serwisu").toMatch(/poczta:\s*\{[^}]*@adamandy\.pl/);
    for (const szablon of ["src/pl/index.njk", "src/en/index.njk"]) {
      expect(readFileSync(szablon, "utf8"), `${szablon}: adres wpisany wprost w szablon`)
        .not.toMatch(/mailto:[a-z]/);
    }
  });

  it.skipIf(!existsSync("_site"))("nie zaprasza do sprostowań tam, gdzie nie ma adresu", () => {
    const ZAPROSZENIA = [/Sprostowania i uwagi są mile widziane/, /Corrections are welcome/];
    for (const plik of strony("_site")) {
      const html = readFileSync(plik, "utf8");
      if (!ZAPROSZENIA.some((z) => z.test(html))) continue;
      expect(html, `${plik}: zaproszenie do sprostowań bez adresu, pod który można je wysłać`)
        .toMatch(/href="mailto:/);
    }
  });
});

describe("strony prawne", () => {
  // Serwis publiczny z adresem do korespondencji musi powiedzieć, kto go
  // prowadzi, czyje są skany i co się dzieje z nadesłaną uwagą. Te testy
  // pilnują rzeczy, których nie wolno zgubić przy redakcji — zwłaszcza
  // obietnicy, że nadawca poprawki nie trafia do publicznego rejestru
  // z nazwiska.
  const STRONY = [
    ["_site/pl/prywatnosc/index.html", "_site/pl/regulamin/index.html", "/pl/"],
    ["_site/en/privacy/index.html", "_site/en/terms/index.html", "/en/"]
  ];

  for (const [prywatnosc, regulamin, prefiks] of STRONY) {
    it.skipIf(!existsSync(prywatnosc))(`${prywatnosc}: mówi, czego serwis nie zbiera`, () => {
      const html = readFileSync(prywatnosc, "utf8");
      expect(html, "brak zdania o ciasteczkach").toMatch(/ciastecz|cookies/i);
      expect(html, "brak zdania o pamięci przeglądarki").toMatch(/localStorage/);
      expect(html, "brak wzmianki o połączeniu z archiwum przy otwarciu skanu")
        .toMatch(/archive\.org/);
    });

    it.skipIf(!existsSync(prywatnosc))(`${prywatnosc}: obiecuje, że nadawca nie trafia do rejestru`, () => {
      // To jest rozstrzygnięcie kierownika projektu z 13 października:
      // nazwisko zgłaszającego nigdy bez jego zgody.
      const html = readFileSync(prywatnosc, "utf8");
      expect(html, "zniknęła obietnica nieujawniania nadawcy")
        .toMatch(/nie zostaniesz tam wymieniony|will not be named there/i);
    });

    it.skipIf(!existsSync(regulamin))(`${regulamin}: mówi, czyje są skany i czego serwis nie obiecuje`, () => {
      const html = readFileSync(regulamin, "utf8");
      expect(html, "brak zdania o tym, że skany należą do instytucji")
        .toMatch(/nie należą do serwisu|do not belong to the site/i);
      expect(html, "brak zastrzeżenia o błędach")
        .toMatch(/nie obiecuje, że jest wolny od błędów|does not promise to be free of error/i);
    });

    it.skipIf(!existsSync(`_site${prefiks}index.html`))(`${prefiks}: obie strony prawne wpięte w stopkę`, () => {
      const html = readFileSync(`_site${prefiks}index.html`, "utf8");
      const cele = prefiks === "/pl/" ? ["/pl/regulamin/", "/pl/prywatnosc/"] : ["/en/terms/", "/en/privacy/"];
      for (const cel of cele)
        expect(html, `stopka nie prowadzi do ${cel}`).toContain(`href="${cel}"`);
    });
  }
});
