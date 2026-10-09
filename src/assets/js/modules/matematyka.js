export const KOCHANSKI = Math.sqrt(40 / 3 - 2 * Math.sqrt(3));

export function grawitacja(stopnie) {
  const p = (stopnie * Math.PI) / 180;
  return 9.780327 * (1 + 0.0053024 * Math.sin(p) ** 2 - 0.0000058 * Math.sin(2 * p) ** 2);
}

// Rejs Jeana Richera: wyjście z La Rochelle 8 lutego 1672, przybycie do Kajenny
// 22 kwietnia 1672 — siedemdziesiąt cztery dni.
export const REJS = {
  latA: 46.16, lonA: -1.15, latB: 4.94, lonB: -52.33,
  dni: 74, tempA: 9.8, tempB: 27.8,
  wyplyniecie: "1672-02-08"
};

// Trasa odtworzona z żeglarskiej praktyki epoki: zejście wzdłuż Półwyspu
// Iberyjskiego, Wyspy Kanaryjskie, Wyspy Zielonego Przylądka i dopiero stamtąd
// przejście na zachód pasatem. Nie jest to zapis z dziennika pokładowego.
export const TRASA = [
  [-1.15, 46.16], [-9.5, 43.2], [-14.0, 36.5], [-16.5, 28.5],
  [-23.5, 15.5], [-32.0, 10.5], [-42.0, 7.0], [-52.33, 4.94]
];

const odcinek = (a, b) => {
  const sr = ((a[1] + b[1]) / 2) * Math.PI / 180;
  return Math.hypot((b[0] - a[0]) * Math.cos(sr), b[1] - a[1]);
};
const NARASTAJACO = TRASA.reduce((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + odcinek(TRASA[i - 1], p));
  return acc;
}, []);
export const DLUGOSC_TRASY = NARASTAJACO[NARASTAJACO.length - 1];

// Położenie okrętu w danej dobie: punkt na trasie odłożony proporcjonalnie
// do przebytej drogi, nie do różnicy szerokości.
export function pozycjaDnia(d) {
  const cel = (Math.min(Math.max(d, 0), REJS.dni) / REJS.dni) * DLUGOSC_TRASY;
  for (let i = 1; i < TRASA.length; i++) {
    if (cel <= NARASTAJACO[i] || i === TRASA.length - 1) {
      const f = (cel - NARASTAJACO[i - 1]) / (NARASTAJACO[i] - NARASTAJACO[i - 1]);
      const g = Math.min(Math.max(f, 0), 1);
      return {
        dlugosc: TRASA[i - 1][0] + (TRASA[i][0] - TRASA[i - 1][0]) * g,
        szerokosc: TRASA[i - 1][1] + (TRASA[i][1] - TRASA[i - 1][1]) * g
      };
    }
  }
  return { dlugosc: REJS.lonB, szerokosc: REJS.latB };
}

export const szerokoscDnia = (d) => pozycjaDnia(d).szerokosc;
export const dlugoscDnia = (d) => pozycjaDnia(d).dlugosc;
// Temperatura wynika z szerokości, nie z numeru doby.
export const temperaturaSzerokosci = (lat) =>
  REJS.tempA + (REJS.tempB - REJS.tempA) * (REJS.latA - lat) / (REJS.latA - REJS.latB);
export const temperaturaDnia = (d) => temperaturaSzerokosci(szerokoscDnia(d));

export function dataDnia(d) {
  const t = new Date(Date.UTC(1672, 1, 8));
  t.setUTCDate(t.getUTCDate() + d);
  return t;
}

export function przebiegRejsu({ kolysanie = 5, kompensacja = false } = {}) {
  const th = ((3 + kolysanie) * Math.PI) / 180;
  const th0 = (3 * Math.PI) / 180;
  const kT = kompensacja ? 0.3 : 10.4;
  const g0 = grawitacja(REJS.latA);
  const t0 = temperaturaDnia(0);
  let cp = 0, cs = 0;
  const wynik = [];
  for (let d = 0; d <= REJS.dni; d++) {
    const poz = pozycjaDnia(d), la = poz.szerokosc, tp = temperaturaSzerokosci(la);
    const f = 0.4638 * Math.cos((la * Math.PI) / 180);
    wynik.push({
      dzien: d, szerokosc: la, dlugosc: poz.dlugosc, temperatura: tp,
      kmWahadlo: Math.abs(cp) * f, kmSprezyna: Math.abs(cs) * f,
      dryfWahadlo: 86400 * ((Math.sqrt(g0 / grawitacja(la)) - 1) + (th * th - th0 * th0) / 16) + 0.5 * (tp - t0),
      dryfSprezyna: kT * (tp - t0)
    });
    cp += wynik[d].dryfWahadlo;
    cs += wynik[d].dryfSprezyna;
  }
  return wynik;
}

export const ALFABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const KLUCZ = 12;
export const JAWNY = "VIRTVS MAGNETICA LIBRAMEN HOROLOGII MODERATVR";
export function przesun(tekst, n) {
  let out = "";
  for (const ch of tekst) {
    const c = ch.charCodeAt(0);
    out += c >= 65 && c <= 90 ? ALFABET[(c - 65 + n + 26) % 26] : ch;
  }
  return out;
}

// ── szyfr przesuwający jako narzędzie dwukierunkowe ─────────────────────────

const DIAKRYTYKI = {
  "Ą":"A","Ć":"C","Ę":"E","Ł":"L","Ń":"N","Ó":"O","Ś":"S","Ź":"Z","Ż":"Z",
  "À":"A","Á":"A","Â":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E",
  "Ì":"I","Í":"I","Î":"I","Ï":"I","Ñ":"N","Ò":"O","Ô":"O","Ö":"O","Ø":"O","Œ":"OE",
  "Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Š":"S","Ž":"Z","Č":"C","Ě":"E","Ř":"R","Ů":"U","ß":"SS"
};

// Tarcza ma dwadzieścia sześć pozycji, więc znaki spoza alfabetu łacińskiego
// sprowadzamy do liter podstawowych. Odwzorowanie jest stratne i taka też była
// praktyka XVII wieku — zapis szyfrowy nie znał polskich znaków.
export function uprosc(tekst) {
  let out = "";
  for (const ch of String(tekst).toUpperCase()) out += DIAKRYTYKI[ch] ?? ch;
  return out;
}

export const szyfruj = (tekst, przesuniecie) => przesun(uprosc(tekst), przesuniecie);
export const odszyfruj = (tekst, przesuniecie) => przesun(uprosc(tekst), -przesuniecie);

// Częstości liter w procentach, w kolejności alfabetu, po sprowadzeniu znaków
// diakrytycznych do liter podstawowych. Łacina w pisowni klasycznej, z V w roli U.
export const CZESTOSCI = {
  pl: [9.90,1.47,4.36,3.25,8.77,0.30,1.42,1.08,8.21,2.28,3.51,3.92,2.80,5.72,8.60,3.13,0.14,4.69,4.98,3.98,2.50,0.04,4.65,0.02,3.76,6.53],
  en: [8.17,1.49,2.78,4.25,12.70,2.23,2.02,6.09,6.97,0.15,0.77,4.03,2.41,6.75,7.51,1.93,0.10,5.99,6.33,9.06,2.76,0.98,2.36,0.15,1.97,0.07],
  la: [7.60,1.30,3.50,2.60,11.00,0.90,1.10,0.70,11.00,0.00,0.00,2.10,5.50,6.30,5.80,2.90,1.40,6.40,7.40,8.00,0.30,8.30,0.00,0.60,0.10,0.00]
};

// Dopasowanie liczymy jako średnią oczekiwaną częstość liter odczytu. Im tekst
// bliższy naturalnemu, tym wyższa wartość — to cała słabość szyfru przesuwającego.
export function ocenyPrzesuniec(szyfrogram, jezyk = "pl") {
  const w = CZESTOSCI[jezyk] || CZESTOSCI.pl;
  const oceny = [];
  for (let s = 0; s < 26; s++) {
    const tekst = przesun(uprosc(szyfrogram), -s);
    let suma = 0, liter = 0;
    for (const ch of tekst) {
      const i = ALFABET.indexOf(ch);
      if (i >= 0) { suma += w[i]; liter++; }
    }
    oceny.push(liter ? suma / liter : 0);
  }
  return oceny;
}

export function najlepszePrzesuniecie(szyfrogram, jezyk = "pl") {
  const oceny = ocenyPrzesuniec(szyfrogram, jezyk);
  let naj = 0;
  for (let s = 1; s < 26; s++) if (oceny[s] > oceny[naj]) naj = s;
  return { przesuniecie: naj, oceny };
}

// ── ściana zegarowa: geometria cienia ──────────────────────────────────────
// Model: ściana dokładnie południowa, pręt (nodus) prostopadły do niej.
// Oś x biegnie w prawo dla patrzącego na ścianę, oś y w dół.

const STOP = Math.PI / 180;
export const WILANOW = { fi: 52.165, lambda: 21.09 };
export const NACHYLENIE_OSI = 23.44;

// Położenie Słońca z szerokości, deklinacji i kąta godzinnego.
// Azymut liczony od południa, dodatni ku zachodowi.
export function polozenieSlonca(fi, dekl, kat) {
  const f = fi * STOP, d = dekl * STOP, h = kat * STOP;
  const wysokosc = Math.asin(Math.sin(f) * Math.sin(d) + Math.cos(f) * Math.cos(d) * Math.cos(h)) / STOP;
  const azymut = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(f) - Math.tan(d) * Math.cos(f)) / STOP;
  return { wysokosc, azymut };
}

// Przesunięcie cienia końca pręta względem jego osadzenia w ścianie.
// Zwraca null, gdy Słońce jest pod horyzontem albo nie oświetla już ściany.
export function cienNodusa({ wysokosc, azymut }, wysiegPreta) {
  if (wysokosc <= 0) return null;
  const a = azymut * STOP;
  if (Math.cos(a) <= 0.09) return null;
  return { dx: wysiegPreta * Math.tan(a), dy: (wysiegPreta * Math.tan(wysokosc * STOP)) / Math.cos(a) };
}

// Kąt godzinny zachodu Słońca w stopniach. Domyślne −0,833° to położenie
// środka tarczy w chwili, gdy górny brzeg dotyka horyzontu — ta sama umowa,
// na której oparte są odczyty godzin włoskich i babilońskich.
export function katZachodu(fi, dekl, horyzont = -0.833) {
  const c = (Math.sin(horyzont * STOP) - Math.sin(fi * STOP) * Math.sin(dekl * STOP)) /
            (Math.cos(fi * STOP) * Math.cos(dekl * STOP));
  if (c >= 1) return 0;
  if (c <= -1) return 180;
  return Math.acos(c) / STOP;
}

export const zachodSloneczny = (fi, dekl) => 12 + katZachodu(fi, dekl) / 15;
export const wschodSloneczny = (fi, dekl) => 12 - katZachodu(fi, dekl) / 15;

// Linia na ścianie: ślad cienia przy zmiennej deklinacji Słońca i godzinie
// wyznaczanej dla każdej deklinacji osobno. Tak powstają zarówno linie godzin
// równych (godzina stała), jak i włoskich i babilońskich (godzina liczona od
// zachodu albo od wschodu).
export function liniaNaScianie(fi, wysiegPreta, godzina, krokow = 34) {
  const pkt = [];
  for (let i = 0; i <= krokow; i++) {
    const d = -NACHYLENIE_OSI + (2 * NACHYLENIE_OSI * i) / krokow;
    const t = godzina(d);
    if (t == null || !Number.isFinite(t)) continue;
    const c = cienNodusa(polozenieSlonca(fi, d, (t - 12) * 15), wysiegPreta);
    if (c) pkt.push({ dekl: d, ...c });
  }
  return pkt;
}

// Krzywa deklinacyjna: ślad cienia w ciągu jednej doby przy stałej deklinacji.
export function krzywaDeklinacji(fi, wysiegPreta, dekl, krok = 0.1) {
  const pkt = [];
  for (let t = 3; t <= 21 + 1e-9; t += krok) {
    const c = cienNodusa(polozenieSlonca(fi, dekl, (t - 12) * 15), wysiegPreta);
    if (c) pkt.push({ godzina: t, ...c });
  }
  return pkt;
}

export const liniaGodzinRownych = (fi, w, t) => liniaNaScianie(fi, w, () => t);
export const liniaGodzinWloskich = (fi, w, k) =>
  liniaNaScianie(fi, w, (d) => k + zachodSloneczny(fi, d) - 24);
export const liniaGodzinBabilonskich = (fi, w, k) =>
  liniaNaScianie(fi, w, (d) => wschodSloneczny(fi, d) + k);
