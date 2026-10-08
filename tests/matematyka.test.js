import { describe, it, expect } from "vitest";
import { KOCHANSKI, grawitacja, przebiegRejsu, przesun, JAWNY, KLUCZ, REJS }
  from "../src/assets/js/modules/matematyka.js";

describe("przybliżenie Kochańskiego", () => {
  it("zgadza się z wartością historyczną do sześciu miejsc", () => {
    expect(KOCHANSKI).toBeCloseTo(3.141533, 6);
  });
  it("jest mniejsze od pi", () => {
    expect(Math.PI - KOCHANSKI).toBeGreaterThan(0);
    expect(Math.PI - KOCHANSKI).toBeLessThan(1e-4);
  });
  it("daje błąd poniżej 10 µm dla tarczy zegara", () => {
    expect((Math.PI - KOCHANSKI) * 150 * 1000).toBeLessThan(10);
  });
});

describe("grawitacja", () => {
  it("rośnie wraz z szerokością geograficzną", () => {
    expect(grawitacja(0)).toBeLessThan(grawitacja(52));
    expect(grawitacja(52)).toBeLessThan(grawitacja(90));
  });
  it("odtwarza obserwację Richera: około 2,5 minuty na dobę", () => {
    const strata = 86400 * (Math.sqrt(grawitacja(46.16) / grawitacja(4.94)) - 1);
    expect(strata).toBeGreaterThan(100);
    expect(strata).toBeLessThan(170);
  });
});

describe("rejs", () => {
  it("zaczyna od zerowego błędu", () => {
    const b = przebiegRejsu();
    expect(b[0].kmWahadlo).toBe(0);
    expect(b[0].kmSprezyna).toBe(0);
  });
  it("kończy się przekroczeniem progu nagrody bez kompensacji", () => {
    const b = przebiegRejsu({ kolysanie: 5 });
    expect(b[REJS.dni].kmWahadlo).toBeGreaterThan(56);
    expect(b[REJS.dni].kmSprezyna).toBeGreaterThan(56);
  });
  it("kompensacja temperatury radykalnie zmniejsza błąd sprężyny", () => {
    const bez = przebiegRejsu({ kompensacja: false })[REJS.dni].kmSprezyna;
    const z = przebiegRejsu({ kompensacja: true })[REJS.dni].kmSprezyna;
    expect(z).toBeLessThan(bez / 20);
  });
  it("silniejsze kołysanie pogarsza tylko wahadło", () => {
    const a = przebiegRejsu({ kolysanie: 0 })[REJS.dni];
    const b = przebiegRejsu({ kolysanie: 14 })[REJS.dni];
    expect(b.kmWahadlo).toBeGreaterThan(a.kmWahadlo);
    expect(b.kmSprezyna).toBeCloseTo(a.kmSprezyna, 6);
  });
});

describe("szyfr", () => {
  it("odszyfrowuje się kluczem dwanaście", () => {
    expect(przesun(przesun(JAWNY, KLUCZ), -KLUCZ)).toBe(JAWNY);
  });
  it("zachowuje spacje", () => {
    expect(przesun(JAWNY, KLUCZ).split(" ").length).toBe(JAWNY.split(" ").length);
  });
  it("nie zdradza tekstu przy błędnym kluczu", () => {
    expect(przesun(przesun(JAWNY, KLUCZ), -11)).not.toBe(JAWNY);
  });
});
