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

describe("kartka kalendarza na wąskim ekranie", () => {
  it("rośnie tam, gdzie nie musi się już równać z zegarkiem", () => {
    // Przy wąskim oknie kolumny pulpitu stoją jedna pod drugą, więc kartka
    // może być szersza — a szerokość kartki to wielkość grotów wyboru daty.
    expect(arkusz, "brak szerszej kartki na wąskim ekranie")
      .toMatch(/@media \(max-width:58rem\)\{ \.kartka\{width:190px\} \}/);
    expect(arkusz, "podstawowa szerokość kartki zmieniona bez potrzeby")
      .toMatch(/\.kartka\{width:150px/);
  });
});
