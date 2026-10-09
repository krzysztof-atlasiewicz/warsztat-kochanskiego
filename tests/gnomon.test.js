import { describe, it, expect } from "vitest";
import { stanNieba, przestepny, dniMiesiaca, dniRoku } from "../src/assets/js/modules/gnomon.js";

// Rok modelowy przyrządu — przestępny, żeby 29 lutego dało się wybrać.
const ROK = 2028;

describe("gnomon wilanowski", () => {
  it("w południe letnie Słońce stoi wysoko", () => {
    const s = stanNieba(ROK, 5, 21, 13);
    expect(s.wysokosc).toBeGreaterThan(55);
    expect(s.nadHoryzontem).toBe(true);
  });
  it("w południe zimowe stoi nisko", () => {
    const s = stanNieba(ROK, 11, 21, 12);
    expect(s.wysokosc).toBeLessThan(20);
  });
  it("nocą jest pod horyzontem", () => {
    expect(stanNieba(ROK, 11, 21, 4).nadHoryzontem).toBe(false);
  });
  it("czas słoneczny rozmija się z zegarowym o 10–45 minut", () => {
    for (const [m, d] of [[0, 15], [2, 21], [5, 21], [9, 27], [11, 21]]) {
      const s = stanNieba(ROK, m, d, 12);
      const roz = Math.abs((s.rowne - 12) * 60);
      expect(roz).toBeGreaterThan(9);
      expect(roz).toBeLessThan(46);
    }
  });
  it("godziny babilońskie rosną w ciągu dnia", () => {
    const a = stanNieba(ROK, 5, 21, 8).babilonskie;
    const b = stanNieba(ROK, 5, 21, 16).babilonskie;
    expect(b).toBeGreaterThan(a);
  });
  it("w równonoc dzień dzieli się po połowie", () => {
    const s = stanNieba(ROK, 2, 21, 12);
    expect(s.babilonskie).toBeGreaterThan(5.5);
    expect(s.babilonskie).toBeLessThan(7);
    expect(s.wloskie - s.babilonskie).toBeGreaterThan(11);
    expect(s.wloskie - s.babilonskie).toBeLessThan(13);
  });
  it("po zachodzie zegar włoski zaczyna liczyć od nowa", () => {
    const s = stanNieba(ROK, 2, 21, 18.5);
    expect(s.nadHoryzontem).toBe(false);
    expect(s.wloskie).toBeLessThan(1);
  });
  it("odtwarza długość dnia 21 czerwca w Warszawie: około 16 godzin 45 minut", () => {
    const s = stanNieba(ROK, 5, 21, 12);
    const wschodSloneczny = s.rowne - s.babilonskie;
    const zachodSloneczny = s.rowne - s.wloskie + 24;
    const dlugosc = zachodSloneczny - wschodSloneczny;
    expect(dlugosc).toBeGreaterThan(16.5);
    expect(dlugosc).toBeLessThan(17);
  });

  it("rok modelowy jest przestępny i luty ma w nim 29 dni", () => {
    expect(przestepny(ROK)).toBe(true);
    expect(dniMiesiaca(ROK, 1)).toBe(29);
    expect(dniRoku(ROK)).toBe(366);
    expect(przestepny(1900)).toBe(false);
    expect(przestepny(2000)).toBe(true);
    expect(dniMiesiaca(2026, 1)).toBe(28);
  });

  it("29 lutego jest policzalne i wypada między 28 lutego a 1 marca", () => {
    const w = (m, d) => stanNieba(ROK, m, d, 12).wysokosc;
    expect(w(1, 29)).toBeGreaterThan(w(1, 28));
    expect(w(1, 29)).toBeLessThan(w(2, 1));
  });

  it("21 czerwca Słońce stoi wyżej niż miesiąc wcześniej i miesiąc później", () => {
    const poludnie = (m, d) => stanNieba(ROK, m, d, 13).wysokosc;
    expect(poludnie(5, 21)).toBeGreaterThan(poludnie(4, 21));
    expect(poludnie(5, 21)).toBeGreaterThan(poludnie(6, 21));
  });

  // Pominięcie lat przestępnych w modelu było zarzutem merytorycznym. Odpowiedź
  // brzmi: model liczy dla jednego, przestępnego roku, a rozrzut tej samej daty
  // w cyklu czteroletnim jest mierzalny i mały. Ten test pilnuje liczby,
  // na którą powołuje się uwaga pod przyrządem.
  it("ta sama data w cyklu czteroletnim mieści się w ćwierci stopnia deklinacji", () => {
    for (const [m, d] of [[2, 21], [5, 21], [8, 23], [11, 21]]) {
      const dekl = [2024, 2025, 2026, 2027].map((r) => stanNieba(r, m, d, 12).deklinacja);
      const rozrzut = Math.max(...dekl) - Math.min(...dekl);
      expect(rozrzut, `rozrzut deklinacji dla ${d}.${m + 1}`).toBeLessThan(0.3);
    }
  });
});
