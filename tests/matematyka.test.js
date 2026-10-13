import { describe, it, expect } from "vitest";
import { KOCHANSKI, grawitacja, przebiegRejsu, przesun, JAWNY, KLUCZ, REJS,
  uprosc, szyfruj, odszyfruj, najlepszePrzesuniecie, ocenyPrzesuniec }
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

describe("narzędzie szyfrujące", () => {
  it("szyfruje i odszyfrowuje w obie strony", () => {
    const w = "Zegar sloneczny w Wilanowie";
    expect(odszyfruj(szyfruj(w, 7), 7)).toBe(uprosc(w));
  });
  it("sprowadza polskie znaki do liter podstawowych", () => {
    expect(uprosc("Żółw ćma")).toBe("ZOLW CMA");
  });
  it("zachowuje spacje i znaki przestankowe", () => {
    expect(szyfruj("AB, CD!", 1)).toBe("BC, DE!");
  });
  it("przesunięcie 0 i 26 nie zmieniają tekstu", () => {
    expect(szyfruj("WARSZTAT", 0)).toBe("WARSZTAT");
    expect(szyfruj("WARSZTAT", 26)).toBe("WARSZTAT");
  });
  it("łamie zapis łaciński, wskazując klucz 12", () => {
    expect(najlepszePrzesuniecie(przesun(JAWNY, KLUCZ), "la").przesuniecie).toBe(KLUCZ);
  });
  it("łamie tekst polskiej długości jednego zdania", () => {
    const w = uprosc("Konstrukcja ogloszona w Acta Eruditorum w roku tysiac szescset osiemdziesiatym piatym");
    expect(najlepszePrzesuniecie(szyfruj(w, 19), "pl").przesuniecie).toBe(19);
  });
  it("łamie tekst angielski", () => {
    const w = uprosc("The sundial on the garden front shows three different hours at once");
    expect(najlepszePrzesuniecie(szyfruj(w, 5), "en").przesuniecie).toBe(5);
  });
  it("zwraca dwadzieścia sześć ocen", () => {
    expect(ocenyPrzesuniec("ABC", "pl")).toHaveLength(26);
  });
});

describe("klucz anagramu z „Technica curiosa”", () => {
  // Kochański podał klucz do własnego zapisu dopiero dwadzieścia jeden lat po
  // druku Schotta, w liście ogłoszonym w „Acta Eruditorum” 1685 (s. 428):
  // „si dispositis 21 punctis, tertio cuique, inchoata a primo numeratione,
  // characteres, ut jacent, adscribantur” — rozmieściwszy 21 punktów, co
  // trzeciemu, licząc od pierwszego, przypisuje się znaki tak, jak leżą.
  //
  // Ten test odtwarza tę instrukcję i sprawdza ją na literach wydrukowanych
  // u Schotta na stronie 692. Jest testem wartości historycznej: gdy zacznie
  // nie przechodzić, znaczy to, że zmieniono odczyt druku albo rozumienie
  // klucza — a nie że popsuł się kod.
  const LITERY = "RGTTCOMMERIPNAEINSATE";   // RGT. TCO. MME. RIp. NAE. INS. ATE-
  const ODCZYT = "PERMAGNETISTRACTIONEM";   // per magnetis tractionem

  const rozmiesc = (ciag) => {
    const wolne = [...Array(21).keys()];
    const miejsca = [];
    let poz = 2;                            // pierwszy skok: co trzecie, od pierwszego
    for (let i = 0; i < 21; i += 1) {
      if (i > 0) poz = (poz + 3) % wolne.length;
      miejsca.push(wolne.splice(poz, 1)[0]);
      poz -= 1;
      if (wolne.length) poz = ((poz % wolne.length) + wolne.length) % wolne.length;
    }
    const wynik = Array(21);
    [...ciag].forEach((znak, i) => { wynik[miejsca[i]] = znak; });
    return { miejsca, tekst: wynik.join("") };
  };

  it("ciąg z druku ma dokładnie dwadzieścia jeden liter", () => {
    expect(LITERY).toHaveLength(21);
  });

  it("instrukcja z 1685 roku daje „per magnetis tractionem”", () => {
    expect(rozmiesc(LITERY).tekst).toBe(ODCZYT);
  });

  it("kolejność miejsc jest tą, którą opisuje instrukcja", () => {
    // Numeracja od jedynki, bo tak liczy druk.
    expect(rozmiesc(LITERY).miejsca.map((m) => m + 1))
      .toEqual([3, 6, 9, 12, 15, 18, 21, 4, 8, 13, 17, 1, 7, 14, 20, 10, 19, 11, 5, 16, 2]);
  });

  it("odczyt mówi o magnetyzmie, a nie o samym wahadle", () => {
    // Strona szyfru twierdziła przez rok, że zapis magnetyzmu nie dotyczy.
    // Ten test jest tamtą pomyłką, zamienioną w zaporę.
    expect(rozmiesc(LITERY).tekst).toContain("MAGNETIS");
  });
});
