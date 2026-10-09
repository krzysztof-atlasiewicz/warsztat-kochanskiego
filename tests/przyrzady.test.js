// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const STRONY = [
  { plik: "_site/pl/cyrkiel/index.html", modul: "cyrkiel", sprawdz: ["w1", "w2", "w3"] },
  { plik: "_site/en/compass/index.html", modul: "cyrkiel", sprawdz: ["w1", "w2", "w3"] },
  { plik: "_site/pl/wahadlo/index.html", modul: "rejs", sprawdz: ["kw", "ks", "szer"] },
  { plik: "_site/en/pendulum/index.html", modul: "rejs", sprawdz: ["kw", "ks", "szer"] },
  { plik: "_site/pl/szyfr/index.html", modul: "szyfr", sprawdz: ["jawny", "szyfrogram"] },
  { plik: "_site/en/cipher/index.html", modul: "szyfr", sprawdz: ["jawny", "szyfrogram"] },
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
      const beben = root.querySelector("#bebenDnia");
      const [x] = [...groty].map((g) => Number(g.querySelector("rect").getAttribute("x")));
      expect(x, "groty stoją po prawej stronie okienka")
        .toBeLessThan(Number(beben.querySelector("rect").getAttribute("x")));
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
