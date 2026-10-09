import { describe, it, expect } from "vitest";
import { stanNieba } from "../src/assets/js/modules/gnomon.js";
import {
  WILANOW, polozenieSlonca, cienNodusa, katZachodu, wschodSloneczny, zachodSloneczny,
  liniaGodzinRownych, liniaGodzinWloskich, liniaGodzinBabilonskich, krzywaDeklinacji
} from "../src/assets/js/modules/matematyka.js";

const fi = WILANOW.fi;
const G = 34;

const odleglosc = (p, linia) => {
  let naj = Infinity;
  for (let i = 1; i < linia.length; i++) {
    const a = linia[i - 1], b = linia[i];
    const dx = b.dx - a.dx, dy = b.dy - a.dy;
    const t = Math.max(0, Math.min(1, ((p.dx - a.dx) * dx + (p.dy - a.dy) * dy) / (dx * dx + dy * dy)));
    naj = Math.min(naj, Math.hypot(a.dx + t * dx - p.dx, a.dy + t * dy - p.dy));
  }
  return naj;
};
const prostosc = (linia) => {
  const a = linia[0], b = linia[linia.length - 1];
  const dx = b.dx - a.dx, dy = b.dy - a.dy;
  let naj = 0;
  for (const p of linia) {
    const t = ((p.dx - a.dx) * dx + (p.dy - a.dy) * dy) / (dx * dx + dy * dy);
    naj = Math.max(naj, Math.hypot(a.dx + t * dx - p.dx, a.dy + t * dy - p.dy));
  }
  return naj;
};

const PROBY = [[172, 12], [172, 10], [172, 15], [80, 12], [80, 9], [355, 12], [355, 14],
  [250, 11], [30, 13], [120, 16], [300, 10]];

describe("ściana zegarowa", () => {
  it("w południe letnie cień jest krótki, w zimowe najkrótszy", () => {
    const lato = cienNodusa(polozenieSlonca(fi, 23.44, 0), G);
    const zima = cienNodusa(polozenieSlonca(fi, -23.44, 0), G);
    expect(lato.dx).toBeCloseTo(0, 6);
    expect(lato.dy).toBeGreaterThan(zima.dy);
  });

  it("rano cień idzie w lewo, po południu w prawo", () => {
    expect(cienNodusa(polozenieSlonca(fi, 0, -45), G).dx).toBeLessThan(0);
    expect(cienNodusa(polozenieSlonca(fi, 0, 45), G).dx).toBeGreaterThan(0);
  });

  it("gdy Słońce mija linię wschód–zachód, ściana gaśnie", () => {
    expect(cienNodusa(polozenieSlonca(fi, 23.44, -110), G)).toBeNull();
    expect(cienNodusa(polozenieSlonca(fi, 23.44, 110), G)).toBeNull();
  });

  it("linie godzin równych są dokładnie proste", () => {
    for (const t of [8, 10, 12, 14, 16]) expect(prostosc(liniaGodzinRownych(fi, G, t))).toBeLessThan(0.001);
  });

  it("linia równonocy jest pozioma", () => {
    const k = krzywaDeklinacji(fi, G, 0);
    const dy = k.map((p) => p.dy);
    expect(Math.max(...dy) - Math.min(...dy)).toBeLessThan(0.01);
  });

  it("w równonoc dzień i noc trwają tyle samo", () => {
    expect(zachodSloneczny(fi, 0) - wschodSloneczny(fi, 0)).toBeGreaterThan(12);
    expect(zachodSloneczny(fi, 0) - wschodSloneczny(fi, 0)).toBeLessThan(12.2);
  });

  it("w przesilenie letnie dzień w Warszawie trwa około 16 godzin 45 minut", () => {
    const dl = zachodSloneczny(fi, 23.44) - wschodSloneczny(fi, 23.44);
    expect(dl).toBeGreaterThan(16.6);
    expect(dl).toBeLessThan(16.9);
  });

  it("kąt zachodu nie wykracza poza zakres także za kołem podbiegunowym", () => {
    expect(katZachodu(70, 23.44)).toBe(180);
    expect(katZachodu(70, -23.44)).toBe(0);
  });

  // Najważniejsza kontrola rysunku: cień musi leżeć na tej linii, której numer
  // podaje odczyt. Gdyby siatka i odczyty rozjechały się, przyrząd kłamałby.
  it("cień leży na linii, którą wskazuje odczyt", () => {
    let sprawdzonych = 0;
    for (const [doba, godzina] of PROBY) {
      const s = stanNieba(2026, doba, godzina);
      const c = cienNodusa({ wysokosc: s.wysokosc, azymut: s.azymutOdPoludnia }, G);
      if (!c) continue;
      sprawdzonych++;
      expect(odleglosc(c, liniaGodzinRownych(fi, G, s.rowne)), `równe, doba ${doba} godz ${godzina}`).toBeLessThan(1.2);
      expect(odleglosc(c, liniaGodzinWloskich(fi, G, s.wloskie)), `włoskie, doba ${doba} godz ${godzina}`).toBeLessThan(1.2);
      expect(odleglosc(c, liniaGodzinBabilonskich(fi, G, s.babilonskie)), `babilońskie, doba ${doba} godz ${godzina}`).toBeLessThan(1.2);
    }
    expect(sprawdzonych).toBeGreaterThan(8);
  });

  it("linie włoskie i babilońskie są niemal proste, ale nie idealnie", () => {
    // Prostota wynika z geometrii, odchyłka — z poprawki na refrakcję przy
    // wschodzie i zachodzie. Gdyby wyszła zero, znaczyłoby to, że poprawki nie ma.
    const w = prostosc(liniaGodzinWloskich(fi, G, 20));
    expect(w).toBeGreaterThan(0.05);
    expect(w).toBeLessThan(1);
  });
});
