import { describe, it, expect } from "vitest";
import { stanNieba } from "../src/assets/js/modules/gnomon.js";

describe("gnomon wilanowski", () => {
  it("w południe letnie Słońce stoi wysoko", () => {
    const s = stanNieba(2026, 172, 13);
    expect(s.wysokosc).toBeGreaterThan(55);
    expect(s.nadHoryzontem).toBe(true);
  });
  it("w południe zimowe stoi nisko", () => {
    const s = stanNieba(2026, 355, 12);
    expect(s.wysokosc).toBeLessThan(20);
  });
  it("nocą jest pod horyzontem", () => {
    expect(stanNieba(2026, 355, 4).nadHoryzontem).toBe(false);
  });
  it("czas słoneczny rozmija się z zegarowym o 10–45 minut", () => {
    for (const d of [15, 80, 172, 300, 355]) {
      const s = stanNieba(2026, d, 12);
      const roz = Math.abs((s.rowne - 12) * 60);
      expect(roz).toBeGreaterThan(9);
      expect(roz).toBeLessThan(46);
    }
  });
  it("godziny babilońskie rosną w ciągu dnia", () => {
    const a = stanNieba(2026, 172, 8).babilonskie;
    const b = stanNieba(2026, 172, 16).babilonskie;
    expect(b).toBeGreaterThan(a);
  });
  it("w równonoc dzień dzieli się po połowie", () => {
    const s = stanNieba(2026, 80, 12);
    expect(s.babilonskie).toBeGreaterThan(5.5);
    expect(s.babilonskie).toBeLessThan(7);
    expect(s.wloskie - s.babilonskie).toBeGreaterThan(11);
    expect(s.wloskie - s.babilonskie).toBeLessThan(13);
  });
  it("po zachodzie zegar włoski zaczyna liczyć od nowa", () => {
    const s = stanNieba(2026, 80, 18.5);
    expect(s.nadHoryzontem).toBe(false);
    expect(s.wloskie).toBeLessThan(1);
  });
  it("odtwarza długość dnia 21 czerwca w Warszawie: około 16 godzin 45 minut", () => {
    const s = stanNieba(2026, 172, 12);
    const wschodSloneczny = s.rowne - s.babilonskie;
    const zachodSloneczny = s.rowne - s.wloskie + 24;
    const dlugosc = zachodSloneczny - wschodSloneczny;
    expect(dlugosc).toBeGreaterThan(16.5);
    expect(dlugosc).toBeLessThan(17);
  });
});
