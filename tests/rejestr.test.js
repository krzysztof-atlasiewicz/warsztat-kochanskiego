// Rejestr pytań otwartych kontra strony, które z niego czerpią.
//
// Test pilnuje jednej rzeczy: żeby na stronie nie stało twierdzenie, które
// rejestr już odwołał. Serwis ostrzega czytelnika przed fałszem w opisie
// przeszłości, więc nie może sam głosić, że pytanie jest otwarte, kiedy
// kierownik projektu je zamknął. Rozminięcie rejestru ze stroną zdarzyło się
// raz i nie zostało wychwycone przez żadną kontrolę — stąd ten plik.
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const agenda = JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
const ZAMKNIETE = new Set(["zamknięta", "nierozstrzygalna"]);
const OTWARTE = agenda.pozycje.filter((p) => !ZAMKNIETE.has(p.status));
const DOMKNIETE = agenda.pozycje.filter((p) => ZAMKNIETE.has(p.status));

const STRONY = [
  { plik: "_site/pl/cyrkiel/index.html", miejsce: "cyrkiel" },
  { plik: "_site/en/compass/index.html", miejsce: "cyrkiel" },
  { plik: "_site/pl/wahadlo/index.html", miejsce: "rejs" },
  { plik: "_site/en/pendulum/index.html", miejsce: "rejs" },
  { plik: "_site/pl/szyfr/index.html", miejsce: "szyfr" },
  { plik: "_site/en/cipher/index.html", miejsce: "szyfr" },
  { plik: "_site/pl/gnomon/index.html", miejsce: "gnomon" },
  { plik: "_site/en/gnomon/index.html", miejsce: "gnomon" }
];

const zbudowane = existsSync("_site");

describe("słownik statusów", () => {
  it("każda pozycja ma status z zamkniętego słownika", () => {
    const dozwolone = new Set(["otwarta", "w toku", "zamknięta", "nierozstrzygalna"]);
    for (const p of agenda.pozycje) {
      expect(dozwolone.has(p.status), `${p.id}: „${p.status}”`).toBe(true);
    }
  });

  it("pozycja zamknięta ma ustalenia, bo bez nich zamknięcie jest gołe", () => {
    for (const p of DOMKNIETE) {
      expect((p.ustalenia || []).length, p.id).toBeGreaterThan(0);
    }
  });

  it("pozycja zamknięta mówi o skutku w czasie przeszłym", () => {
    // „Co się zmieni” pozycji rozstrzygniętej jest obietnicą, która już się
    // spełniła albo upadła. Jeśli pole nadal brzmi przyszłościowo, znaczy że
    // nikt go nie dotknął przy zamykaniu.
    const przyszly = /\b(zmieni|przejdzie|trzeba będzie|zyska|otworzy się|będzie trzeba|czeka)\b/;
    for (const p of DOMKNIETE) {
      expect(przyszly.test(p.zmieni), `${p.id}: ${p.zmieni}`).toBe(false);
    }
  });

  it("pozycja zamknięta nazywa w ustaleniach datę i podstawę rozstrzygnięcia", () => {
    for (const p of DOMKNIETE) {
      const ostatnie = p.ustalenia[p.ustalenia.length - 1];
      expect(ostatnie, p.id).toMatch(/Rozstrzygnięt/);
    }
  });
});

describe.skipIf(!zbudowane)("zakładka „Pytania otwarte” kontra status w rejestrze", () => {
  for (const { plik, miejsce } of STRONY) {
    const html = zbudowane && existsSync(plik) ? readFileSync(plik, "utf8") : "";

    it(`${plik}: żadna karta pytania nie dotyczy pozycji zamkniętej`, () => {
      for (const p of DOMKNIETE) {
        if (!p.miejsca?.includes(miejsce)) continue;
        expect(html.includes(`class="pytanie" id="pytanie-${p.id}"`), p.id).toBe(false);
      }
    });

    it(`${plik}: licznik zakładki zgadza się z liczbą pozycji otwartych`, () => {
      const oczekiwane = OTWARTE.filter((p) => p.miejsca?.includes(miejsce)).length;
      const m = html.match(/id="z-pytania"[^>]*>[^<]*<span class="licznik">(\d+)</);
      expect(m, "nie znaleziono licznika zakładki").not.toBeNull();
      expect(Number(m[1])).toBe(oczekiwane);
    });

    it(`${plik}: pozycja zamknięta zostawia ślad z odnośnikiem do rejestru`, () => {
      // Odfiltrowanie nie może znaczyć wymazania: kto czytał stronę wcześniej,
      // musi móc sprawdzić, co się z pytaniem stało.
      for (const p of DOMKNIETE) {
        if (!p.miejsca?.includes(miejsce)) continue;
        expect(html, p.id).toMatch(new RegExp(`agenda/#${p.id}">${p.id}</a>`));
      }
    });

    it(`${plik}: każda pozycja otwarta tego miejsca ma kartę`, () => {
      for (const p of OTWARTE) {
        if (!p.miejsca?.includes(miejsce)) continue;
        expect(html.includes(`id="pytanie-${p.id}"`), p.id).toBe(true);
      }
    });
  }
});

describe.skipIf(!zbudowane)("strona rejestru", () => {
  for (const plik of ["_site/pl/agenda/index.html", "_site/en/agenda/index.html"]) {
    const html = zbudowane && existsSync(plik) ? readFileSync(plik, "utf8") : "";

    it(`${plik}: wymienia wszystkie pozycje, także zamknięte`, () => {
      for (const p of agenda.pozycje) {
        expect(html.includes(`id="${p.id}"`), p.id).toBe(true);
      }
    });

    it(`${plik}: dzieli listę na dwie sekcje i podaje liczności`, () => {
      const liczniki = [...html.matchAll(/<h2>[^<]*<span class="licznik">(\d+)<\/span>/g)].map((m) => Number(m[1]));
      expect(liczniki).toEqual([OTWARTE.length, DOMKNIETE.length]);
    });

    it(`${plik}: wstęp nie twierdzi, że wszystkie wymienione pytania są otwarte`, () => {
      const wstep = html.split("<h2>")[0];
      expect(wstep).not.toMatch(/pozostają otwarte|remain open/);
    });

    it(`${plik}: pozycja zamknięta jest oznaczona klasą, nie tylko słowem`, () => {
      for (const p of DOMKNIETE) {
        expect(html, p.id).toMatch(new RegExp(`class="agenda-poz rozstrzygnieta" id="${p.id}"`));
      }
    });
  }
});
