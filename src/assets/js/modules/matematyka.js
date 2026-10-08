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
