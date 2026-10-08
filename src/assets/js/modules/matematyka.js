export const KOCHANSKI = Math.sqrt(40 / 3 - 2 * Math.sqrt(3));

export function grawitacja(stopnie) {
  const p = (stopnie * Math.PI) / 180;
  return 9.780327 * (1 + 0.0053024 * Math.sin(p) ** 2 - 0.0000058 * Math.sin(2 * p) ** 2);
}

export const REJS = { latA: 46.16, latB: 4.94, dni: 64, tempA: 9.8, tempB: 27.8 };

export const szerokoscDnia = (d) => REJS.latA + (REJS.latB - REJS.latA) * (d / REJS.dni);
export const temperaturaDnia = (d) => REJS.tempA + (REJS.tempB - REJS.tempA) * (d / REJS.dni);

export function przebiegRejsu({ kolysanie = 5, kompensacja = false } = {}) {
  const th = ((3 + kolysanie) * Math.PI) / 180;
  const th0 = (3 * Math.PI) / 180;
  const kT = kompensacja ? 0.3 : 10.4;
  const g0 = grawitacja(REJS.latA);
  const t0 = temperaturaDnia(0);
  let cp = 0, cs = 0;
  const wynik = [];
  for (let d = 0; d <= REJS.dni; d++) {
    const la = szerokoscDnia(d), tp = temperaturaDnia(d);
    const f = 0.4638 * Math.cos((la * Math.PI) / 180);
    wynik.push({
      dzien: d, szerokosc: la, temperatura: tp,
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
