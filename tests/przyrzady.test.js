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
