// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const STRONY = [
  { plik: "_site/pl/cyrkiel/index.html", modul: "cyrkiel", sprawdz: ["w1", "w2", "w3"] },
  { plik: "_site/en/compass/index.html", modul: "cyrkiel", sprawdz: ["w1", "w2", "w3"] },
  { plik: "_site/pl/wahadlo/index.html", modul: "rejs", sprawdz: ["kw", "ks", "szer"] },
  { plik: "_site/en/pendulum/index.html", modul: "rejs", sprawdz: ["kw", "ks", "szer"] },
  { plik: "_site/pl/szyfr/index.html", modul: "szyfr", sprawdz: ["szyfrogram"] },
  { plik: "_site/en/cipher/index.html", modul: "szyfr", sprawdz: ["szyfrogram"] },
  { plik: "_site/pl/gnomon/index.html", modul: "gnomon", sprawdz: ["rowne", "wloskie", "babilonskie"] },
  { plik: "_site/en/gnomon/index.html", modul: "gnomon", sprawdz: ["rowne", "wloskie", "babilonskie"] }
];

const zbudowane = existsSync("_site");

describe.skipIf(!zbudowane)("przyrządy na zbudowanych stronach", () => {
  beforeAll(() => { globalThis.document = document; });

  for (const s of STRONY) {
    it(`${s.plik} — moduł ${s.modul} wypełnia odczyty`, async () => {
      document.body.innerHTML = readFileSync(s.plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const root = document.querySelector("[data-modul]");
      expect(root, "brak elementu z data-modul").toBeTruthy();
      const m = await import(`../src/assets/js/modules/${s.modul}.js`);
      m.default(root);
      for (const id of s.sprawdz) {
        const el = root.querySelector(`#${id}`);
        expect(el, `brak elementu #${id}`).toBeTruthy();
        const tresc = ("value" in el && el.tagName !== "DIV" ? el.value : el.textContent).trim();
        expect(tresc, `#${id} pozostał pusty`).not.toBe("");
        expect(tresc, `#${id} nie został wypełniony`).not.toBe("—");
      }
    });
  }
});

// Układ pulpitu gnomonu był przedmiotem osobnych poprawek: legenda zegarka pod
// przełącznikiem analemmy, wybór dnia i miesiąca na kartce kalendarza, dymek
// przy samym Słońcu. Te trzy rzeczy łatwo rozjechać przy kolejnej zmianie CSS,
// więc pilnuje ich test, a nie tylko oko.
describe.skipIf(!zbudowane)("pulpit gnomonu", () => {
  for (const plik of ["_site/pl/gnomon/index.html", "_site/en/gnomon/index.html"]) {
    it(`${plik} — legenda zegarka stoi pod przełącznikiem analemmy`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const blok = document.querySelector(".blok-objasnien");
      expect(blok, "brak bloku objaśnień").toBeTruthy();
      const przelacznik = blok.querySelector('[role="switch"]');
      const odczyt = blok.querySelector(".odczyt-zegara");
      expect(przelacznik, "przełącznik analemmy nie jest w bloku objaśnień").toBeTruthy();
      expect(odczyt, "legenda zegarka nie jest w bloku objaśnień").toBeTruthy();
      expect(
        przelacznik.compareDocumentPosition(odczyt) & Node.DOCUMENT_POSITION_FOLLOWING,
        "legenda nie stoi po przełączniku"
      ).toBeTruthy();
    });

    it(`${plik} — wybór dnia i miesiąca siedzi na kartce kalendarza`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const kartka = document.querySelector("figure.blok-daty");
      expect(kartka, "brak kartki kalendarza").toBeTruthy();
      const pola = kartka.querySelectorAll(".pola-daty select");
      expect(pola.length, "oba pola daty mają być na kartce").toBe(2);
      // Data na kartce nie jest rysowanym tekstem obok nastawników.
      expect(kartka.querySelector("#kalDzien"), "został osobny napis z dniem").toBeFalsy();
      expect(kartka.querySelector("#kalMiesiac"), "został osobny napis z miesiącem").toBeFalsy();
      expect(kartka.querySelector("#bebenDnia"), "brak miejsca na bębenek dnia").toBeTruthy();
      expect(kartka.querySelector("#bebenMiesiaca"), "brak miejsca na bębenek miesiąca").toBeTruthy();
      for (const p of pola) {
        expect(p.getAttribute("aria-label"), "pole daty bez nazwy dostępnej").toBeTruthy();
        expect(p.dataset.dymek, "pole daty bez dymka").toBeTruthy();
      }
    });

    it(`${plik} — zastrzeżenie o czasie urzędowym stoi pod legendą zegarka`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const blok = document.querySelector(".blok-objasnien");
      const uwaga = blok.querySelector(".uwaga-urzedowa");
      const odczyt = blok.querySelector(".odczyt-zegara");
      expect(uwaga, "uwaga o czasie urzędowym nie jest w kolumnie objaśnień").toBeTruthy();
      expect(
        odczyt.compareDocumentPosition(uwaga) & Node.DOCUMENT_POSITION_FOLLOWING,
        "uwaga nie stoi pod legendą"
      ).toBeTruthy();
    });

    it(`${plik} — kartka kalendarza jest tej samej wysokości co zegarek`, () => {
      const html = readFileSync(plik, "utf8");
      const vb = (klasa) => {
        const m = new RegExp(`viewBox="0 0 (\\d+) (\\d+)"[^>]*class="${klasa}`).exec(html);
        expect(m, `brak viewBoksa dla .${klasa}`).toBeTruthy();
        return { w: Number(m[1]), h: Number(m[2]) };
      };
      const css = readFileSync("src/assets/css/site.css", "utf8");
      const szer = (regula) => Number(new RegExp(`${regula}\\{[^}]*?width:(\\d+)px`).exec(css)[1]);
      const kartka = vb("kartka"), zegar = vb("tarcza-mechaniczna");
      const wysKartki = (szer("\\.kartka") * kartka.h) / kartka.w;
      const wysZegara = (szer("\\.tarcza-mechaniczna") * zegar.h) / zegar.w;
      expect(Math.abs(wysKartki - wysZegara), `kartka ${wysKartki} px, zegarek ${wysZegara} px`).toBeLessThan(1);
    });

    it(`${plik} — datę nastawia bębenek, nie rozwijana lista`, async () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const root = document.querySelector("[data-modul]");
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      expect(root.classList.contains("z-bebnami"), "pola wyboru nie zostały zastąpione").toBe(true);
      for (const id of ["bebenDnia", "bebenMiesiaca"]) {
        const b = root.querySelector(`#${id}`);
        expect(b.getAttribute("role"), `#${id} nie jest nastawnikiem`).toBe("spinbutton");
        expect(b.getAttribute("aria-valuetext"), `#${id} bez odczytanej wartości`).toMatch(/\S/);
        expect(b.getAttribute("tabindex"), `#${id} nieosiągalny klawiaturą`).toBe("0");
        // Wartość bieżąca plus dwie sąsiednie widoczne przez okienko.
        expect(b.querySelectorAll("text").length, `#${id} nie pokazuje sąsiednich wartości`).toBe(3);
      }
    });

    it(`${plik} — Słońce samo niesie swój dymek i pole chwytu`, async () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const root = document.querySelector("[data-modul]");
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      const slonce = root.querySelector("#slonce");
      expect(slonce, "brak Słońca").toBeTruthy();
      expect(slonce.dataset.dymek, "Słońce bez dymka").toMatch(/\S/);
      expect(slonce.querySelector("circle.pole-chwytu"), "Słońce bez pola chwytu").toBeTruthy();
    });
  }
});

// Poprawki z cyklu 37 dotknęły czterech stron naraz. Każda z nich jest łatwa
// do cofnięcia przy następnej zmianie układu, więc każda ma tu swój warunek.
describe.skipIf(!zbudowane)("poprawki czytelności", () => {
  const wczytaj = (plik) => {
    document.body.innerHTML = readFileSync(plik, "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    return document.querySelector("[data-modul]");
  };

  for (const plik of ["_site/pl/gnomon/index.html", "_site/en/gnomon/index.html"]) {
    it(`${plik} — groty bębenka stoją po lewej i nie noszą dymka`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      const groty = root.querySelectorAll(".beben-groty");
      expect(groty.length, "brak grotów przy bębenkach").toBe(2);
      for (const g of groty) {
        expect(g.hasAttribute("data-bez-dymka"), "groty przepuszczają dymek kartki").toBe(true);
        expect(g.closest("[data-dymek]"), "groty siedzą w środku bębenka").not.toBe(
          g.previousElementSibling
        );
      }
      // Jedna strzała po lewej stronie okienka, druga po prawej.
      const beben = root.querySelector("#bebenDnia");
      const okno = beben.querySelector("rect");
      const x0 = Number(okno.getAttribute("x")), szer = Number(okno.getAttribute("width"));
      const strzaly = [...root.querySelectorAll("#bebenDnia + .beben-groty .beben-grot")]
        .map((s) => Number(s.querySelector("rect.pole-chwytu").getAttribute("x")));
      expect(strzaly.length, "bębenek dnia nie ma dwóch strzał").toBe(2);
      expect(Math.min(...strzaly), "brak strzały po lewej stronie okienka").toBeLessThan(x0);
      expect(Math.max(...strzaly), "brak strzały po prawej stronie okienka").toBeGreaterThan(x0 + szer);
      // Strzały mają mieścić się w kartce, a nie wystawać poza jej krawędź.
      const kartka = root.querySelector("svg.kartka");
      const [, , szerKartki] = kartka.getAttribute("viewBox").split(" ").map(Number);
      for (const s of root.querySelectorAll(".beben-groty .beben-grot")) {
        const r = s.querySelector("rect.pole-chwytu");
        const x = Number(r.getAttribute("x")), w = Number(r.getAttribute("width"));
        expect(x, "strzała wychodzi poza lewą krawędź kartki").toBeGreaterThan(10);
        expect(x + w, "strzała wychodzi poza prawą krawędź kartki").toBeLessThan(szerKartki - 10);
      }
      // Strzała ma być strzałą: drzewce, grot i lotki.
      for (const s of root.querySelectorAll("#bebenDnia + .beben-groty .beben-grot")) {
        expect(s.querySelector(".strzala-drzewce"), "strzała bez drzewca").toBeTruthy();
        expect(s.querySelector(".strzala-grot"), "strzała bez grotu").toBeTruthy();
        expect(s.querySelector(".strzala-lotki"), "strzała bez lotek").toBeTruthy();
      }
    });

    it(`${plik} — grot przestawia dzień`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      const przed = root.querySelector("#dzien").value;
      root.querySelectorAll("#bebenDnia + .beben-groty .beben-grot")[1]
        .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
      expect(root.querySelector("#dzien").value, "kliknięcie grotu nic nie zmieniło").not.toBe(przed);
    });
  }

  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — wykres błędu jest wkreślony w kartę, nie stoi obok niej`, async () => {
      const root = wczytaj(plik);
      expect(root.querySelector("#eWahadlo"), "osobny wykres błędu nie zniknął").toBeFalsy();
      const m = await import("../src/assets/js/modules/rejs.js");
      m.default(root);
      expect(root.querySelectorAll("svg.karta .slad-bledu").length,
        "na karcie brakuje śladów obu zegarów").toBe(2);
    });

    it(`${plik} — w porcie podpis „tu jesteś" ustępuje nazwie portu`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/rejs.js");
      m.default(root);
      const podpisy = () => [...root.querySelectorAll("#pozycje text")].map((t) => t.textContent);
      const tu = root.querySelector("[data-napisy]")
        ? JSON.parse(root.querySelector("[data-napisy]").dataset.napisy).tuJestes : "tu jesteś";
      expect(podpisy().some((t) => t === tu), "w porcie docelowym podpis został").toBe(false);
      const d = root.querySelector("#dzien");
      d.value = "40";
      d.dispatchEvent(new window.Event("input", { bubbles: true }));
      expect(podpisy().some((t) => t === tu), "na pełnym morzu podpisu zabrakło").toBe(true);
    });

    it(`${plik} — koło sterowe stoi między kalendarzem a okrętem`, () => {
      const root = wczytaj(plik);
      const kolo = root.querySelector("#rejsStart.kolo-sterowe");
      expect(kolo, "przycisk nie jest kołem sterowym").toBeTruthy();
      const bloki = [...root.querySelectorAll(".pulpit-sterowniki > *")];
      expect(bloki.indexOf(kolo.closest(".blok-kola")), "koło nie stoi na drugim miejscu").toBe(1);
      expect(bloki[0].classList.contains("blok-daty")).toBe(true);
      expect(bloki[2].classList.contains("blok-okretu")).toBe(true);
    });

    it(`${plik} — termometr tłumaczy się dymkiem`, () => {
      const root = wczytaj(plik);
      const term = root.querySelector(".rzad-mapy .przyrzad-boczny[data-dymek]");
      expect(term, "termometr bez dymka").toBeTruthy();
      expect(term.dataset.dymek.length, "dymek termometru jest pusty").toBeGreaterThan(40);
    });
  }

  for (const [plik, etykieta] of [["_site/pl/cyrkiel/index.html", "Konstrukcja"],
                                  ["_site/en/compass/index.html", "Construction"]]) {
    it(`${plik} — pierwsza zakładka to „${etykieta}", a wyprowadzenie stoi otworem`, () => {
      const root = wczytaj(plik);
      expect(root.querySelector("#z-przyrzad").textContent.trim(),
        "pierwsza zakładka dalej nazywa się jak przyrząd").toBe(etykieta);
      expect(root.querySelector("details.wyprowadzenie"), "wyprowadzenie dalej się rozwija").toBeFalsy();
      expect(root.querySelector("section.wyprowadzenie h3"), "wyprowadzenie bez nagłówka").toBeTruthy();
    });
  }

  for (const plik of ["_site/pl/szyfr/index.html", "_site/en/cipher/index.html"]) {
    it(`${plik} — instrukcja pierścienia stoi obok nastawy`, () => {
      const root = wczytaj(plik);
      const nastawa = root.querySelector(".szyfr-nastawa");
      expect(nastawa, "brak pola nastawy").toBeTruthy();
      expect(nastawa.querySelector(".szyfr-tarcza #tarcza"), "tarcza poza polem nastawy").toBeTruthy();
      expect(nastawa.querySelector(".tarcza-podpowiedz"), "instrukcja poza polem nastawy").toBeTruthy();
    });
  }
});

// Oznaczenia statusu wersji mają tłumaczyć się same, a przełączenie zakładki
// nie ma zmieniać geometrii strony. Pierwsze da się sprawdzić w dokumencie,
// drugie wymaga wysokości, więc pilnuje go wyrównanie kart.
describe.skipIf(!zbudowane)("oznaczenia i zakładki", () => {
  const STRONY = ["_site/pl/cyrkiel/index.html", "_site/pl/wahadlo/index.html",
                  "_site/pl/szyfr/index.html", "_site/pl/gnomon/index.html",
                  "_site/en/compass/index.html", "_site/en/pendulum/index.html",
                  "_site/en/cipher/index.html", "_site/en/gnomon/index.html"];

  for (const plik of STRONY) {
    it(`${plik} — każde oznaczenie tłumaczy się dymkiem`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const tagi = [...document.querySelectorAll(".tagi .tag")];
      expect(tagi.length, "strona bez oznaczeń statusu").toBe(2);
      for (const t of tagi) {
        expect(t.dataset.dymek, `oznaczenie „${t.textContent}" bez objaśnienia`).toBeTruthy();
        expect(t.dataset.dymek.length, `objaśnienie „${t.textContent}" jest zdawkowe`).toBeGreaterThan(60);
      }
      // Para czyta się jako zdanie: pierwszy człon stały, drugi nazywa to,
      // co dopowiadamy od siebie — i na każdej stronie nazywa co innego.
      expect(tagi[0].classList.contains("zrodlo"), "pierwsze oznaczenie nie jest źródłem").toBe(true);
      expect(tagi[0].textContent.trim(), "pierwszy człon pary zmienił brzmienie")
        .toMatch(/^(ze źródła|from the source)$/);
      expect(tagi[1].textContent.trim(), "drugi człon nie mówi, co jest nasze")
        .toMatch(/^(nasze|ours): \S/);
    });
  }

  it("zakładki wyrównują karty do najwyższej, żeby strona nie skakała", async () => {
    document.body.innerHTML = readFileSync(STRONY[0], "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    // jsdom nie liczy układu, więc wysokości podstawiamy sami
    const karty = [...document.querySelectorAll('[role="tabpanel"]')];
    expect(karty.length, "brak kart do wyrównania").toBe(3);
    karty.forEach((k, i) => Object.defineProperty(k, "offsetHeight", { get: () => [900, 400, 150][i] }));
    const m = await import("../src/assets/js/zakladki.js");
    m.default();
    for (const k of karty)
      expect(k.style.minHeight, "karta nie została wyrównana do najwyższej").toBe("900px");
  });
});

// Przełącznik języka ma być jednym nastawnikiem wskazującym język docelowy —
// tak jak na stronie głównej fundacji — a nie listą, w której jedna pozycja
// i tak jest bieżąca.
describe.skipIf(!zbudowane)("przełącznik języka", () => {
  for (const [plik, napis, cel] of [
    ["_site/pl/gnomon/index.html", "English", "/en/"],
    ["_site/en/gnomon/index.html", "polski", "/pl/"],
    ["_site/pl/index.html", "English", "/en/"],
    ["_site/en/index.html", "polski", "/pl/"]
  ]) {
    it(`${plik} — jeden nastawnik prowadzący na „${napis}"`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const odnosniki = [...document.querySelectorAll(".jez a")];
      expect(odnosniki.length, "przełącznik dalej wylicza oba języki").toBe(1);
      const a = odnosniki[0];
      expect(a.classList.contains("przelacz-jezyk"), "nastawnik bez swojej klasy").toBe(true);
      expect(a.textContent.trim(), "nastawnik nie nazywa języka docelowego").toBe(napis);
      expect(a.getAttribute("href"), "nastawnik prowadzi nie tam").toBe(cel);
      expect(a.getAttribute("hreflang"), "brak oznaczenia języka odnośnika").toBeTruthy();
    });
  }
});

// Strona przyrządu nie może najpierw narysować się ze wszystkimi kartami,
// a potem skurczyć — to był ten podskok przy przechodzeniu między przyrządami.
describe.skipIf(!zbudowane)("pierwszy rysunek strony", () => {
  const arkusz = readFileSync("src/assets/css/site.css", "utf8");

  it("arkusz chowa karty poza pierwszą, zanim moduł zdąży wystartować", () => {
    expect(arkusz, "brak reguły chowającej kolejne karty przed gotowością")
      .toMatch(/html\.js \.zakladki:not\(\.gotowe\) ~ \.karta-przyrzadu ~ \.karta-przyrzadu\{display:none\}/);
  });

  // HTML i arkusz leżą w pamięci podręcznej niezależnie, więc przeglądarka
  // potrafi mieć nowy arkusz i stary dokument bez wiersza nadającego „js".
  // Widoczność paska zakładek nie może od tego wiersza zależeć — raz już
  // zależała i pasek zniknął wszystkim, którzy mieli stronę w pamięci.
  it("widoczność paska zależy od modułu, nie od wiersza w nagłówku", () => {
    expect(arkusz, "pasek chowany przy braku klasy js — stary dokument straci zakładki")
      .not.toMatch(/html:not\(\.js\)[^{]*\.zakladki\{[^}]*display:none/);
    expect(arkusz, "brak reguły wiążącej pasek z gotowością modułu")
      .toMatch(/\.zakladki:not\(\.gotowe\)\{display:none\}/);
    // Nagłówki kart też znikają dopiero wtedy, gdy pasek je zastąpi.
    expect(arkusz, "nagłówki kart chowane bez względu na gotowość paska")
      .toMatch(/\.zakladki\.gotowe ~ \.karta-przyrzadu \.tytul-karty\{display:none\}/);
  });

  for (const plik of ["_site/pl/cyrkiel/index.html", "_site/en/compass/index.html"]) {
    it(`${plik} — klasa „js" nadawana przed arkuszem i z osobnego pliku`, () => {
      const h = readFileSync(plik, "utf8");
      const skrypt = h.indexOf('src="/assets/js/wczesnie.js"');
      const styl = h.indexOf('href="/assets/css/site.css');
      expect(skrypt, "brak skryptu nadającego klasę js").toBeGreaterThan(-1);
      expect(skrypt, "klasa js nadawana dopiero po arkuszu").toBeLessThan(styl);
      expect(h.slice(0, skrypt).includes("<body"), "skrypt stoi poza nagłówkiem").toBe(false);
      // Wpisany wprost w stronę zostałby na serwerze zablokowany przez politykę
      // bezpieczeństwa treści — i tak było przez pięć cykli, bez żadnego śladu.
      expect(h, "skrypt wpisany wprost w stronę zamiast osobnego pliku")
        .not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/);
    });
  }

  it("skrypt nadający klasę js robi dokładnie to i nic więcej", () => {
    const k = readFileSync("src/assets/js/wczesnie.js", "utf8");
    expect(k, "skrypt wczesny nie nadaje klasy").toMatch(/classList\.add\("js"\)/);
    expect(k.split("\n").filter((w) => w.trim() && !w.trim().startsWith("//")).length,
      "skrypt wczesny ma robić jedną rzecz — blokuje rysowanie strony").toBe(1);
  });
});

// Przejście między krokami konstrukcji nie może zmieniać wysokości strony:
// pole z suwakiem i odczytami odsłania się na ostatnim kroku, ale miejsce
// zajmuje od początku.
describe.skipIf(!zbudowane)("kroki konstrukcji cyrkla", () => {
  const arkusz = readFileSync("src/assets/css/site.css", "utf8");
  const modul = readFileSync("src/assets/js/modules/cyrkiel.js", "utf8");

  it("pole wyników jest przygaszane, nie usuwane z układu", () => {
    expect(modul, "moduł dalej chowa pole przez .hide")
      .not.toMatch(/classList\.toggle\("hide"/);
    expect(modul, "brak przygaszania pola wyników")
      .toMatch(/classList\.toggle\("przygaszony", krok !== 4\)/);
    expect(arkusz, "brak reguły trzymającej miejsce przygaszonego pola")
      .toMatch(/\.przygaszony\{visibility:hidden\}/);
    expect(arkusz, "pole wyników nie rezerwuje miejsca od pierwszej klatki")
      .toMatch(/html\.js #panel\.hide\{display:block;visibility:hidden\}/);
    expect(arkusz, "opis kroku nie rezerwuje dwóch wierszy")
      .toMatch(/#opis\{min-height:/);
  });

  for (const plik of ["_site/pl/cyrkiel/index.html", "_site/en/compass/index.html"]) {
    it(`${plik} — bez skryptu pole wyników pozostaje schowane`, () => {
      const h = readFileSync(plik, "utf8");
      expect(h, "pole wyników bez klasy hide byłoby widoczne bez skryptu")
        .toMatch(/<div id="panel" class="hide">/);
    });
  }
});

// Podmiana kroju pisma w locie przesuwała każdy wiersz o punkt — i to właśnie
// czytało się jako miganie przy przechodzeniu między przyrządami.
describe("kroje bez podmiany w locie", () => {
  it("arkusz krojów nie dopuszcza podmiany po pierwszym rysunku", () => {
    const f = readFileSync("src/assets/css/fonty.css", "utf8");
    expect(f, "kroje dalej podmieniają się w locie").not.toMatch(/font-display:\s*swap/);
    expect((f.match(/font-display:optional/g) || []).length, "nie wszystkie kroje są zamówione bezzwłocznie").toBe(6);
  });

  it.skipIf(!zbudowane)("każda strona zamawia kroje z góry", () => {
    for (const plik of ["_site/pl/cyrkiel/index.html", "_site/en/gnomon/index.html"]) {
      const h = readFileSync(plik, "utf8");
      const ile = (h.match(/<link rel="preload" as="font"/g) || []).length;
      expect(ile, `${plik}: kroje nie są zamawiane z góry`).toBe(6);
      expect(h, `${plik}: zamówienie kroju bez crossorigin nie zadziała`)
        .toMatch(/<link rel="preload" as="font" type="font\/woff2" crossorigin href="\/assets\/fonts\/[^"]+\.[0-9a-f]{8}\.woff2">/);
    }
  });

  it("pasek odwzorowania i wiersz pary liter rezerwują wysokość", () => {
    const a = readFileSync("src/assets/css/site.css", "utf8");
    expect(a, "pasek szyfru nie rezerwuje wysokości").toMatch(/\.pasek\{min-height:/);
    expect(a, "wiersz pary liter nie rezerwuje wysokości").toMatch(/#para\{min-height:/);
  });
});

// Akapit o przyrządach bocznych zniknął z kolumny objaśnień — ale zastrzeżenie
// o zagęszczonej podziałce nie ma prawa zginąć razem z nim.
describe.skipIf(!zbudowane)("przyrządy boczne wahadła", () => {
  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — każdy przyrząd boczny tłumaczy się sam`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const boczne = [...document.querySelectorAll(".rzad-mapy .przyrzad-boczny")];
      expect(boczne.length, "spodziewane trzy przyrządy boczne").toBe(3);
      for (const f of boczne) {
        expect(f.dataset.dymek, "przyrząd boczny bez dymka").toBeTruthy();
        expect(f.dataset.dymek.length, "dymek przyrządu bocznego jest zdawkowy").toBeGreaterThan(60);
      }
      const dymki = boczne.map((f) => f.dataset.dymek).join(" ");
      expect(dymki, "zgubiono zastrzeżenie o zagęszczonej podziałce")
        .toMatch(/zagęszczona przy zerze|compressed near zero/);
    });
  }
});

// Zgłoszenia Z1–Z5: przełącznik rejsu, kolory odczytów, pasek przyrządów
// i tytuł serwisu. Każde z nich łatwo cofnąć następną zmianą układu.
describe.skipIf(!zbudowane)("poprawki zgłoszone 10 października", () => {
  const wczytaj = (plik) => {
    document.body.innerHTML = readFileSync(plik, "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    return document.querySelector("[data-modul]") || document.body;
  };

  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — rejs przełącza się kołem i kotwicą, nie napisem`, async () => {
      const root = wczytaj(plik);
      const g = root.querySelector("#rejsStart");
      expect(g.querySelector(".ikona-kolo"), "brak koła sterowego").toBeTruthy();
      expect(g.querySelector(".ikona-kotwica"), "brak kotwicy").toBeTruthy();
      expect(g.getAttribute("aria-pressed"), "przycisk nie jest przełącznikiem").toBe("false");
      expect(g.querySelector("#rejsNapis"), "napis nie jest osobnym elementem").toBeTruthy();
      // Moduł nie może podmieniać całej zawartości guzika — tak zginął rysunek.
      const m = readFileSync("src/assets/js/modules/rejs.js", "utf8");
      expect(m, "moduł nadpisuje zawartość guzika").not.toMatch(/\$\("rejsStart"\)\.textContent/);
      const mod = await import("../src/assets/js/modules/rejs.js");
      mod.default(root);
      root.querySelector("#rejsStart").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
      expect(root.querySelector("#rejsStart").getAttribute("aria-pressed"), "kliknięcie nie przestawiło stanu").toBe("true");
      expect(root.querySelector(".ikona-kolo"), "koło zniknęło z dokumentu").toBeTruthy();
    });

    it(`${plik} — odczyty błędu w kolorach swoich śladów, bez legendy pod mapą`, () => {
      const root = wczytaj(plik);
      expect(root.querySelector(".rzad-mapy ~ .legenda, .legenda"), "legenda pod mapą została").toBeFalsy();
      const a = readFileSync("src/assets/css/site.css", "utf8");
      expect(a, "odczyt wahadła nie ma koloru swojego śladu").toMatch(/#kw\{color:var\(--sun\)\}/);
      expect(a, "odczyt sprężyny nie ma koloru swojego śladu").toMatch(/#ks\{color:var\(--verd\)\}/);
    });
  }

  for (const [plik, etykieta] of [["_site/pl/gnomon/index.html", "Biografia"],
                                  ["_site/en/gnomon/index.html", "Biography"]]) {
    it(`${plik} — biografia stoi w rzędzie przyrządów z latami życia`, () => {
      wczytaj(plik);
      const pozycje = [...document.querySelectorAll(".bench a")];
      expect(pozycje.length, "pasek ma mieć cztery przyrządy i biografię").toBe(5);
      const z = pozycje[4];
      expect(z.textContent.trim(), "ostatnia pozycja to nie biografia").toContain(etykieta);
      expect(z.querySelector(".y").textContent.trim(), "brak lat życia").toBe("1631–1700");
      expect(document.querySelector("footer a[href$='/biografia/']"), "odnośnik w stopce się dublował").toBeFalsy();
    });
  }

  it("szyld mówi w języku strony", () => {
    const szyld = (p) => {
      wczytaj(p);
      return document.querySelector(".marka").textContent.trim();
    };
    expect(szyld("_site/pl/index.html")).toBe("Warsztat Kochańskiego");
    expect(szyld("_site/en/index.html"), "angielski szyld nieprzetłumaczony").toBe("Kochański's Workshop");
  });
});

// Szyfr ma zaczynać od pustego pola wiadomości — przy pierścieniu na zerze
// „odszyfrowanie" przepisywało zapis znak w znak i obok siebie stały dwa te
// same ciągi. Rejs ma wznawiać bieg, nie wracać do La Rochelle.
describe.skipIf(!zbudowane)("stan początkowy i wznawianie", () => {
  const wczytaj = (plik) => {
    document.body.innerHTML = readFileSync(plik, "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    return document.querySelector("[data-modul]");
  };

  for (const plik of ["_site/pl/szyfr/index.html", "_site/en/cipher/index.html"]) {
    it(`${plik} — na wejściu wiadomość pusta, zapis gotowy do złamania`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/szyfr.js");
      m.default(root);
      expect(root.querySelector("#szyfrogram").value.trim().length,
        "brak zapisu do złamania").toBeGreaterThan(10);
      expect(root.querySelector("#jawny").value, "pole wiadomości nie jest puste").toBe("");
      expect(root.querySelector("#jawny").getAttribute("placeholder"),
        "puste pole nie podpowiada, co zrobić").toMatch(/\S/);
    });

    it(`${plik} — wpis w wiadomość szyfruje, wpis w zapis odszyfrowuje`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/szyfr.js");
      m.default(root);
      const jawny = root.querySelector("#jawny"), zapis = root.querySelector("#szyfrogram");
      jawny.value = "ALA";
      jawny.dispatchEvent(new window.Event("input", { bubbles: true }));
      const zaszyfrowane = zapis.value.trim();
      expect(zaszyfrowane, "wpis w wiadomość nic nie zaszyfrował").toMatch(/\S/);
      zapis.value = zaszyfrowane;
      zapis.dispatchEvent(new window.Event("input", { bubbles: true }));
      expect(jawny.value.trim().toUpperCase(), "wpis w zapis nie wrócił do wiadomości").toContain("ALA");
    });
  }

  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — kotwica zatrzymuje, koło podnosi ją i płynie dalej`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/rejs.js");
      m.default(root);
      const dzien = root.querySelector("#dzien"), guzik = root.querySelector("#rejsStart");
      dzien.value = "30";
      dzien.dispatchEvent(new window.Event("input", { bubbles: true }));
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));   // odbij
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));   // zatrzymaj
      expect(Number(dzien.value), "zatrzymanie cofnęło okręt do portu wyjścia").toBeGreaterThan(0);
      const gdzieStoi = Number(dzien.value);
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));   // dalej
      expect(Number(dzien.value), "wznowienie wróciło do La Rochelle").toBeGreaterThanOrEqual(gdzieStoi);
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });
  }

  it("legenda karty kursowej nazywa Wyspy Kanaryjskie pełną nazwą", () => {
    for (const [plik, fraza] of [["_site/pl/wahadlo/index.html", "Wyspy Kanaryjskie"],
                                 ["_site/en/pendulum/index.html", "Canary Islands"]]) {
      const h = readFileSync(plik, "utf8");
      expect(h, `${plik}: brak pełnej nazwy wysp`).toContain(fraza);
    }
    expect(readFileSync("_site/pl/wahadlo/index.html", "utf8"), "została skrócona nazwa")
      .not.toMatch(/Iberii, Kanary/);
  });
});

// Liczba Richera i odnośniki otwierane na właściwej stronie skanu.
describe.skipIf(!zbudowane)("kwerendy źródłowe", () => {
  for (const [plik, fraza] of [["_site/pl/wahadlo/index.html", "o jedną linię i ćwierć"],
                               ["_site/en/pendulum/index.html", "by one line and a quarter"]]) {
    it(`${plik} — wartość Richera z oryginałem i stroną`, () => {
      const h = readFileSync(plik, "utf8");
      expect(h, "brak wartości skrócenia").toContain(fraza);
      expect(h, "brak oryginalnego brzmienia").toContain("d’une ligne &amp; un quart");
      expect(h, "brak paryskiej długości odniesienia").toMatch(/3 (stóp|feet) 8½ (linii|lines)/);
      expect(h, "odnośnik nie otwiera się na stronie 320 skanu")
        .toContain("archive.org/details/richer-mmoiresdelacad-07pari/page/n89");
    });
  }

  it("skan Technica curiosa otwiera się na stronie z zapisem szyfrowym", () => {
    const z = JSON.parse(readFileSync("src/_data/zrodla.json", "utf8"));
    expect(z["technica-curiosa"].url, "odnośnik nie wskazuje karty 827 (druk 692)")
      .toContain("/page/n826");
    expect(z["technica-curiosa"].uwaga, "uwaga nie odnotowuje, że to anagram").toMatch(/anagram/i);
  });

  it("ustalenia obu kwerend zapisane w agendzie", () => {
    const a = JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
    const poz = a.pozycje || a;
    for (const id of ["A2", "A7"]) {
      const p = poz.find((x) => x.id === id);
      expect(p.ustalenia?.length, `${id}: brak ustaleń z kwerendy`).toBeGreaterThan(2);
    }
    expect(poz.find((x) => x.id === "A7").ustalenia.join(" "), "A7 bez numeru strony").toContain("320");
    expect(poz.find((x) => x.id === "A2").ustalenia.join(" "), "A2 bez numeru strony").toContain("692");
  });
});
