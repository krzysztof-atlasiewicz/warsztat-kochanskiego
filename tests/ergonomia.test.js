// Ergonomia tego, co da się policzyć z arkusza i z dokumentu: kontrast barw,
// oznaki przewijania, szerokość sterowników.
//
// Każda z tych rzeczy była w serwisie zepsuta przez miesiąc i żadna kontrola
// tego nie zauważyła, bo wszystkie pilnowały treści, nie formy. Te testy nie
// zastępują oka — sprawdzają tylko progi, które mają liczbę.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

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
  it("rośnie jeszcze bardziej tam, gdzie nie musi się równać z zegarkiem", () => {
    // Przy wąskim oknie kolumny pulpitu stoją jedna pod drugą, więc kartka
    // może być szersza — a szerokość kartki to wielkość grotów wyboru daty.
    expect(arkusz, "brak szerszej kartki na wąskim ekranie")
      .toMatch(/@media \(max-width:58rem\)\{ \.kartka\{width:200px\} \}/);
    expect(arkusz, "podstawowa szerokość kartki nie została powiększona")
      .toMatch(/\.kartka\{width:180px/);
  });

  it("kartka i zegarek kończą się na tej samej wysokości", () => {
    // Stoją w jednym rzędzie, więc muszą rosnąć w tej samej proporcji.
    // Kartka: viewBox 160 × 239. Zegarek: 200 × 224. Przy 180 i 240 punktach
    // szerokości oba mają 269 punktów wysokości — stąd te, a nie inne liczby.
    const szerKartki = Number(arkusz.match(/\.kartka\{width:(\d+)px/)[1]);
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
