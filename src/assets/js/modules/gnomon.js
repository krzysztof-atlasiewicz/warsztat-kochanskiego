import * as A from "../lib/astronomy.js";
import {
  WILANOW, polozenieSlonca, cienNodusa, wschodSloneczny, zachodSloneczny,
  liniaGodzinRownych, liniaGodzinWloskich, liniaGodzinBabilonskich, krzywaDeklinacji,
  godzinaZKierunku
} from "./matematyka.js";

const OBS = new A.Observer(WILANOW.fi, WILANOW.lambda, 110);

// Wysięg pręta i rozmieszczenie trzech tarcz na ścianie. Wszystkie trzy mają
// ten sam pręt, więc przesunięcie cienia jest dla nich identyczne — różni je
// tylko siatka linii, na którą ten sam cień pada.
const G = 34;
const TARCZE = {
  wloskie: { x0: 136, y0: 195, x1: 296, y1: 302, nx: 216, ny: 207 },
  rowne: { x0: 324, y0: 182, x1: 496, y1: 302, nx: 410, ny: 196 },
  babilonskie: { x0: 524, y0: 195, x1: 684, y1: 302, nx: 604, ny: 207 }
};
// Tarcza zegara kieszonkowego: środek, promienie podziałki i koronka.
const ZEG = { cx: 100, cy: 128, w: 200, h: 224, rCyfry: 61, rZnacznik: 78, rLuk: 73, kx: 100, ky: 34 };
// Rok modelowy jest przestępny, żeby 29 lutego dało się w ogóle wybrać.
// Model liczy dla konkretnego roku — ta sama data kalendarzowa wypada w cyklu
// czteroletnim nieco inaczej względem przesileń, co opisuje uwaga pod przyrządem.
const ROK = 2028;
export const przestepny = (rok) => (rok % 4 === 0 && rok % 100 !== 0) || rok % 400 === 0;
export const dniMiesiaca = (rok, miesiac) =>
  [31, przestepny(rok) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][miesiac];
export const dniRoku = (rok) => (przestepny(rok) ? 366 : 365);
const zDniaRoku = (rok, n) => {
  const d = new Date(Date.UTC(rok, 0, n));
  return [d.getUTCMonth(), d.getUTCDate()];
};
const RZYMSKIE = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const NS = "http://www.w3.org/2000/svg";

const zrob = (nazwa, atrybuty, tresc) => {
  const e = document.createElementNS(NS, nazwa);
  for (const k in atrybuty) e.setAttribute(k, atrybuty[k]);
  if (tresc != null) e.textContent = tresc;
  return e;
};
const ogranicz = (x, a, b) => Math.min(Math.max(x, a), b);
// Pola wyboru są zwykłym HTML-em, nie SVG — muszą powstać bez przestrzeni nazw.
const opcja = (wartosc, napis) => {
  const o = document.createElement("option");
  o.value = String(wartosc);
  o.textContent = napis;
  return o;
};

function offsetWarszawa(ms) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Warsaw", hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - ms) / 60000;
}
function zCzasuLokalnego(rok, mies, dzien, godziny) {
  const baza = Date.UTC(rok, mies, dzien, 0, 0, 0) + godziny * 3600000;
  let ms = baza;
  for (let i = 0; i < 3; i++) ms = baza - offsetWarszawa(ms) * 60000;
  return new Date(ms);
}
const czasSloneczny = (t) => (A.HourAngle(A.Body.Sun, t, OBS) + 12) % 24;

// Stan nieba dla rzeczywistej daty kalendarzowej — bez przeliczania na numer
// dnia w roku, bo takie przeliczenie gubiłoby 29 lutego.
export function stanNieba(rok, miesiac, dzien, godzinaZegarowa) {
  const data = zCzasuLokalnego(rok, miesiac, dzien, godzinaZegarowa);
  const t = A.MakeTime(data);
  const eq = A.Equator(A.Body.Sun, t, OBS, true, true);
  const hor = A.Horizon(t, OBS, eq.ra, eq.dec, "normal");
  const ostatnie = (kierunek) => {
    let z = A.SearchRiseSet(A.Body.Sun, OBS, kierunek, A.MakeTime(new Date(data.getTime() - 25 * 3600e3)), 3);
    if (z && z.date > data) {
      z = A.SearchRiseSet(A.Body.Sun, OBS, kierunek, A.MakeTime(new Date(data.getTime() - 49 * 3600e3)), 3);
    }
    return z;
  };
  const wschod = ostatnie(+1);
  const zachod = ostatnie(-1);
  const teraz = czasSloneczny(t);
  return {
    data, wysokosc: hor.altitude, azymutOdPoludnia: hor.azimuth - 180, deklinacja: eq.dec,
    rowne: teraz,
    babilonskie: wschod ? (teraz - czasSloneczny(wschod) + 24) % 24 : null,
    wloskie: zachod ? (teraz - czasSloneczny(zachod) + 24) % 24 : null,
    nadHoryzontem: hor.altitude > 0
  };
}

// Przesunięcie cienia końca pręta dla bieżącego stanu nieba.
const przesuniecieCienia = (stan) =>
  cienNodusa({ wysokosc: stan.wysokosc, azymut: stan.azymutOdPoludnia }, G);

// Przycięcie łamanej do prostokąta tarczy (Liang–Barsky na każdym odcinku).
function przytnij(pkt, r) {
  const kawalki = [];
  for (let i = 1; i < pkt.length; i++) {
    const a = pkt[i - 1], b = pkt[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    const p = [-dx, dx, -dy, dy];
    const q = [a.x - r.x0, r.x1 - a.x, a.y - r.y0, r.y1 - a.y];
    let t0 = 0, t1 = 1, widoczny = true;
    for (let k = 0; k < 4; k++) {
      if (p[k] === 0) { if (q[k] < 0) { widoczny = false; break; } continue; }
      const t = q[k] / p[k];
      if (p[k] < 0) { if (t > t1) { widoczny = false; break; } if (t > t0) t0 = t; }
      else { if (t < t0) { widoczny = false; break; } if (t < t1) t1 = t; }
    }
    if (!widoczny) continue;
    const A1 = { x: a.x + t0 * dx, y: a.y + t0 * dy };
    const B1 = { x: a.x + t1 * dx, y: a.y + t1 * dy };
    const ost = kawalki[kawalki.length - 1];
    if (ost && Math.hypot(ost[ost.length - 1].x - A1.x, ost[ost.length - 1].y - A1.y) < 0.02) ost.push(B1);
    else kawalki.push([A1, B1]);
  }
  return kawalki.filter((k) => k.length > 1);
}

const naPkt = (tarcza, lista) => lista.map((c) => ({ x: tarcza.nx + c.dx, y: tarcza.ny + c.dy }));
const zapis = (k) => k.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

// Numer godziny stawiamy na dalszym końcu linii — tam, gdzie na prawdziwej
// tarczy biegnie wieniec cyfr — odsunięty jeszcze o krok wzdłuż linii.
function miejsceNapisu(kawalki, r) {
  let naj = null;
  for (const k of kawalki)
    for (const [kon, drugi] of [[k[0], k[k.length - 1]], [k[k.length - 1], k[0]]]) {
      const d = Math.hypot(kon.x - r.nx, kon.y - r.ny);
      if (!naj || d > naj.d) naj = { d, kon, drugi };
    }
  if (!naj) return null;
  const dl = Math.hypot(naj.kon.x - naj.drugi.x, naj.kon.y - naj.drugi.y) || 1;
  const x = naj.kon.x + ((naj.kon.x - naj.drugi.x) / dl) * 13;
  const y = naj.kon.y + ((naj.kon.y - naj.drugi.y) / dl) * 13;
  return {
    x: ogranicz(x, r.x0 + 9, r.x1 - 9),
    y: ogranicz(y + 4, r.y0 + 13, r.y1 - 4)
  };
}

function rysujTarcze(rodzic, tarcza, rodzaj, linie, napisy, opisy) {
  const r = tarcza;
  const g = zrob("g", { class: `tarcza-sciany tarcza-${rodzaj}` });
  rodzic.append(g);
  // Wyjaśnienie rachuby jako dymek nad całą tarczą — bez rozbudowanego opisu obok.
  g.dataset.dymek = `${napisy.pelne[rodzaj]} ${opisy[rodzaj]}`;
  g.append(zrob("rect", { x: r.x0 - 13, y: r.y0 - 13, width: r.x1 - r.x0 + 26, height: r.y1 - r.y0 + 26,
    class: "kartusz" }));
  g.append(zrob("rect", { x: r.x0 - 6, y: r.y0 - 6, width: r.x1 - r.x0 + 12, height: r.y1 - r.y0 + 12,
    class: `obwodka obwodka-${rodzaj}` }));
  g.append(zrob("rect", { x: r.x0, y: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0, class: `pole pole-${rodzaj}` }));

  const napisyTarczy = [];
  for (const { etykieta, punkty } of linie) {
    const kawalki = przytnij(naPkt(r, punkty), r);
    if (!kawalki.length) continue;
    for (const k of kawalki) g.append(zrob("polyline", { points: zapis(k), class: `linia linia-${rodzaj}` }));
    const m = miejsceNapisu(kawalki, r);
    if (m && !napisyTarczy.some((p) => Math.hypot(p.x - m.x, p.y - m.y) < 16)) {
      napisyTarczy.push(m);
      g.append(zrob("text", { x: m.x.toFixed(1), y: m.y.toFixed(1), "text-anchor": "middle",
        class: `cyfra cyfra-${rodzaj}` }, etykieta));
    }
  }

  const n = zrob("g", { class: "nodus" });
  n.append(zrob("circle", { cx: r.nx, cy: r.ny, r: 5.5, class: "nodus-tuleja" }));
  n.append(zrob("circle", { cx: r.nx, cy: r.ny, r: 2, class: "nodus-pret" }));
  g.append(n);
  const sx = (r.x0 + r.x1) / 2;
  g.append(zrob("text", { x: sx, y: r.y1 + 31, "text-anchor": "middle", class: "napis-tarczy" }, napisy.krotkie[rodzaj]));
  g.append(zrob("text", { id: rodzaj, x: sx, y: r.y1 + 56, "text-anchor": "middle",
    class: `odczyt-sciany odczyt-${rodzaj}` }, "—"));
  // Pole chwytu: dymek ma się zapalać nad całym blokiem tarczy razem z podpisem
  // i odczytem, a nie tylko tam, gdzie akurat leży kreska.
  g.append(zrob("rect", { x: r.x0 - 16, y: r.y0 - 16, width: r.x1 - r.x0 + 32,
    height: r.y1 - r.y0 + 82, class: "pole-chwytu" }));
}

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const N = JSON.parse(root.querySelector("[data-napisy]").dataset.napisy);
  const fi = WILANOW.fi;
  const hhmm = (h) => { const m = Math.round((((h % 24) + 24) % 24) * 60); return `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, "0")}`; };
  const godzMin = (h) => `${Math.floor(h)} ${N.godz} ${String(Math.round((h % 1) * 60)).padStart(2, "0")} ${N.min}`;
  const h1 = (x) => (x == null ? "—" : x.toFixed(1).replace(".", ","));
  const naTarczy = (a, r) => [
    ZEG.cx + r * Math.sin((a * Math.PI) / 180),
    ZEG.cy - r * Math.cos((a * Math.PI) / 180)
  ];

  // ── pola daty ──────────────────────────────────────────────────────────
  const polaM = $("miesiac"), polaD = $("dzien");
  N.miesiaceDop.forEach((m, i) => polaM.append(opcja(i, m)));
  polaM.value = "5";
  function wypelnijDni() {
    const ile = dniMiesiaca(ROK, Number(polaM.value));
    const byl = Number(polaD.value) || 21;
    polaD.replaceChildren();
    for (let d = 1; d <= ile; d++) polaD.append(opcja(d, String(d)));
    polaD.value = String(Math.min(byl, ile));
  }
  wypelnijDni();
  polaD.value = "21";

  // ── zegar: tarcza, podziałka, koronka ──────────────────────────────────
  let godzina = 12;
  const svgZeg = root.querySelector(".tarcza-mechaniczna");
  const koronka = $("koronka");
  const pierscien = $("pierscienGodzin");
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    const [x, y] = naTarczy(a, ZEG.rCyfry);
    pierscien.append(zrob("text", { x: x.toFixed(1), y: (y + 5).toFixed(1), "text-anchor": "middle",
      class: "cyfra-zegara" }, RZYMSKIE[i]));
  }
  for (let i = 0; i < 60; i++) {
    const a = i * 6, dl = i % 5 === 0 ? 7 : 3;
    const [x1, y1] = naTarczy(a, ZEG.rZnacznik);
    const [x2, y2] = naTarczy(a, ZEG.rZnacznik - dl);
    pierscien.append(zrob("line", { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1),
      class: i % 5 === 0 ? "kreska-godzin" : "kreska-minut" }));
  }
  const radelko = $("radelko");
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5 * Math.PI) / 180;
    radelko.append(zrob("line", {
      x1: (ZEG.kx + 9 * Math.cos(a)).toFixed(1), y1: (ZEG.ky + 9 * Math.sin(a)).toFixed(1),
      x2: (ZEG.kx + 13 * Math.cos(a)).toFixed(1), y2: (ZEG.ky + 13 * Math.sin(a)).toFixed(1),
      class: "radelko-zab"
    }));
  }

  // Nastawianie: obrót tarczy albo pokręcenie koronką. Pełny obrót to godzina,
  // tak jak przy nastawianiu zegarka — stąd i zgrubne, i dokładne nastawienie.
  let ciagniecie = null;
  const katWskaznika = (e, sx, sy) => {
    const r = svgZeg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * ZEG.w;
    const y = ((e.clientY - r.top) / r.height) * ZEG.h;
    return (Math.atan2(x - sx, -(y - sy)) * 180) / Math.PI;
  };
  const ustawGodzine = (g) => { godzina = ogranicz(g, 4, 21); odswiez(); };

  for (const [el, sx, sy] of [[$("tarczaZegara"), ZEG.cx, ZEG.cy], [koronka, ZEG.kx, ZEG.ky]]) {
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      svgZeg.setPointerCapture(e.pointerId);
      ciagniecie = { sx, sy, poprzedni: katWskaznika(e, sx, sy), start: godzina, suma: 0 };
      svgZeg.classList.add("nastawiany");
    });
  }
  svgZeg.addEventListener("pointermove", (e) => {
    if (!ciagniecie) return;
    const a = katWskaznika(e, ciagniecie.sx, ciagniecie.sy);
    let d = a - ciagniecie.poprzedni;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    ciagniecie.suma += d;
    ciagniecie.poprzedni = a;
    ustawGodzine(ciagniecie.start + ciagniecie.suma / 360);
  });
  const koniec = () => { ciagniecie = null; svgZeg.classList.remove("nastawiany"); };
  svgZeg.addEventListener("pointerup", koniec);
  svgZeg.addEventListener("pointercancel", koniec);
  svgZeg.addEventListener("wheel", (e) => {
    e.preventDefault();
    ustawGodzine(godzina + (e.deltaY > 0 ? -1 : 1) / 12);
  }, { passive: false });
  koronka.addEventListener("keydown", (e) => {
    const krok = { ArrowUp: 1 / 12, ArrowRight: 1 / 12, ArrowDown: -1 / 12, ArrowLeft: -1 / 12,
      PageUp: 1, PageDown: -1 }[e.key];
    if (krok !== undefined) { e.preventDefault(); ustawGodzine(godzina + krok); return; }
    if (e.key === "Home") { e.preventDefault(); ustawGodzine(4); }
    if (e.key === "End") { e.preventDefault(); ustawGodzine(21); }
  });

  // ── stałe linie na ścianie ─────────────────────────────────────────────
  const tarcze = $("tarcze");
  const svgSciana = root.querySelector("svg.sciana");
  const zbierz = (zakres, buduj, podpis) => zakres
    .map((k) => ({ etykieta: podpis(k), punkty: buduj(k) }))
    .filter((l) => l.punkty.length > 1);

  rysujTarcze(tarcze, TARCZE.wloskie, "wloskie",
    zbierz([...Array(24).keys()].map((i) => i + 1), (k) => liniaGodzinWloskich(fi, G, k), String), N.tarcze, N.dymki);
  rysujTarcze(tarcze, TARCZE.rowne, "rowne",
    zbierz([...Array(15).keys()].map((i) => i + 5), (k) => liniaGodzinRownych(fi, G, k), (k) => RZYMSKIE[k % 12]), N.tarcze, N.dymki);
  rysujTarcze(tarcze, TARCZE.babilonskie, "babilonskie",
    zbierz([...Array(17).keys()], (k) => liniaGodzinBabilonskich(fi, G, k), String), N.tarcze, N.dymki);

  // krzywe deklinacyjne rysujemy tylko na tarczy środkowej, żeby nie zamazać reszty
  const r = TARCZE.rowne;
  for (const dekl of [23.44, 0, -23.44]) {
    const kawalki = przytnij(naPkt(r, krzywaDeklinacji(fi, G, dekl)), r);
    for (const k of kawalki)
      tarcze.append(zrob("polyline", { points: zapis(k), class: `krzywa krzywa-${dekl > 0 ? "lato" : dekl < 0 ? "zima" : "rownonoc"}` }));
  }

  // ── Słońce jako uchwyt czasu ───────────────────────────────────────────
  // Kierunek, z którego pada światło, jest monotoniczną funkcją godziny, więc
  // da się go odwrócić: z położenia kursora odczytujemy kąt, a z kąta godzinę.
  let ciagnieteSlonce = null;
  const slonceEl = $("slonce");
  slonceEl.addEventListener("pointerdown", (e) => {
    const stan = stanNieba(ROK, Number(polaM.value), Number(polaD.value), godzina);
    e.preventDefault();
    e.stopPropagation();
    svgSciana.setPointerCapture(e.pointerId);
    ciagnieteSlonce = { dekl: stan.deklinacja, przesuniecie: stan.rowne - godzina };
    svgSciana.classList.add("ciagniete");
  });
  svgSciana.addEventListener("pointermove", (e) => {
    if (!ciagnieteSlonce) return;
    const pr = svgSciana.getBoundingClientRect();
    const x = ((e.clientX - pr.left) / pr.width) * 820;
    const y = ((e.clientY - pr.top) / pr.height) * 390;
    const kat = (Math.atan2(x - r.nx, r.ny - y) * 180) / Math.PI;
    const sloneczna = godzinaZKierunku(fi, G, ciagnieteSlonce.dekl, kat);
    if (sloneczna == null) return;
    const t = ogranicz(sloneczna - ciagnieteSlonce.przesuniecie, 4, 21);
    if (Math.abs(t - godzina) < 0.0005) return;
    godzina = t;
    odswiez();
  });
  const koniecSlonca = () => { ciagnieteSlonce = null; svgSciana.classList.remove("ciagniete"); };
  svgSciana.addEventListener("pointerup", koniecSlonca);
  svgSciana.addEventListener("pointercancel", koniecSlonca);

  // ── warstwa ruchoma ────────────────────────────────────────────────────
  let analemma = false;

  function odswiez() {
    const mies = Number(polaM.value), dm = Number(polaD.value);
    const stan = stanNieba(ROK, mies, dm, godzina);

    // kartka kalendarza — miesiąc i dzień czyta się wprost z pól wyboru,
    // bo to one są datą na kartce; dopisujemy tylko długość dnia i nocy
    const wsch = wschodSloneczny(fi, stan.deklinacja), zach = zachodSloneczny(fi, stan.deklinacja);
    $("kalPora").textContent = `${N.dzienTrwa} ${godzMin(zach - wsch)}`;
    $("kalDzien2").textContent = `${N.nocTrwa} ${godzMin(24 - (zach - wsch))}`;

    // zegar: dwie pary wskazówek i łuk rozbieżności między nimi
    const katG = (h) => ((h % 12) / 12) * 360;
    $("wskGodzin").setAttribute("transform", `rotate(${katG(godzina)} ${ZEG.cx} ${ZEG.cy})`);
    $("wskMinut").setAttribute("transform", `rotate(${(godzina % 1) * 360} ${ZEG.cx} ${ZEG.cy})`);
    $("wskGodzinSlon").setAttribute("transform", `rotate(${katG(stan.rowne)} ${ZEG.cx} ${ZEG.cy})`);
    $("wskMinutSlon").setAttribute("transform", `rotate(${(stan.rowne % 1) * 360} ${ZEG.cx} ${ZEG.cy})`);

    const a1 = katG(godzina);
    let d = katG(stan.rowne) - a1;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    const [x1, y1] = naTarczy(a1, ZEG.rLuk), [x2, y2] = naTarczy(a1 + d, ZEG.rLuk);
    $("lukRoznicy").setAttribute("d",
      `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${ZEG.rLuk} ${ZEG.rLuk} 0 0 ${d > 0 ? 1 : 0} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    const roz = Math.round(Math.abs(stan.rowne - godzina) * 60);
    $("napisRoznicy").textContent = `${roz} ${N.min}`;

    koronka.setAttribute("aria-valuenow", godzina.toFixed(2));
    koronka.setAttribute("aria-valuetext", hhmm(godzina));

    $("mech").textContent = hhmm(godzina);
    $("slon").textContent = hhmm(stan.rowne);
    $("roznica").textContent = `${roz} ${N.min}`;

    // słońce, promienie i cienie
    const c = przesuniecieCienia(stan);
    const slonce = $("slonce"), promienie = $("promienie"), cienie = $("cienie");
    slonce.replaceChildren(); promienie.replaceChildren(); cienie.replaceChildren();
    $("brakSlonca").setAttribute("opacity", c ? "0" : "1");

    if (c) {
      // Słońce stawiamy na tym samym promieniu, na którym leży cień — kierunek
      // jest prawdziwy, odległość umowna, bo Słońce jest nieskończenie daleko.
      const dl = Math.hypot(c.dx, c.dy);
      let lam = 180 / dl;
      if (r.nx - lam * c.dx < 52) lam = (r.nx - 52) / c.dx;
      if (r.nx - lam * c.dx > 768) lam = (r.nx - 768) / c.dx;
      if (r.ny - lam * c.dy < 40) lam = (r.ny - 40) / c.dy;
      const sx = r.nx - lam * c.dx, sy = r.ny - lam * c.dy;

      slonce.dataset.dymek = N.slonceUchwyt;
      slonce.append(zrob("circle", { cx: sx.toFixed(1), cy: sy.toFixed(1), r: 15, class: "slonce-tarcza" }));
      // Pole chwytu Słońca: trafienie w samą tarczę na dotyku bywa trudne.
      slonce.append(zrob("circle", { cx: sx.toFixed(1), cy: sy.toFixed(1), r: 30, class: "pole-chwytu" }));
      for (let i = 0; i < 12; i++) {
        const a = (i * 30 * Math.PI) / 180;
        slonce.append(zrob("line", {
          x1: (sx + 18 * Math.cos(a)).toFixed(1), y1: (sy + 18 * Math.sin(a)).toFixed(1),
          x2: (sx + 24 * Math.cos(a)).toFixed(1), y2: (sy + 24 * Math.sin(a)).toFixed(1), class: "slonce-promyk"
        }));
      }

      const jed = { x: c.dx / dl, y: c.dy / dl };
      promienie.append(zrob("line", {
        x1: (sx + jed.x * 26).toFixed(1), y1: (sy + jed.y * 26).toFixed(1),
        x2: r.nx, y2: r.ny, class: "promien"
      }));
      for (const t of [TARCZE.wloskie, TARCZE.babilonskie])
        promienie.append(zrob("line", {
          x1: (t.nx - jed.x * 46).toFixed(1), y1: (t.ny - jed.y * 46).toFixed(1),
          x2: t.nx, y2: t.ny, class: "promien"
        }));

      for (const t of Object.values(TARCZE)) {
        const kx = t.nx + c.dx, ky = t.ny + c.dy;
        if (kx < t.x0 || kx > t.x1 || ky < t.y0 || ky > t.y1) continue;
        cienie.append(zrob("line", { x1: t.nx, y1: t.ny, x2: kx.toFixed(1), y2: ky.toFixed(1), class: "cien-preta" }));
        cienie.append(zrob("circle", { cx: kx.toFixed(1), cy: ky.toFixed(1), r: 4, class: "cien-grot" }));
      }
    }

    // analemma na tarczy środkowej
    if (analemma) {
      const pkt = [];
      for (let d2 = 1; d2 <= dniRoku(ROK); d2 += 3) {
        const [m2, dm2] = zDniaRoku(ROK, d2);
        const q = przesuniecieCienia(stanNieba(ROK, m2, dm2, godzina));
        if (q) pkt.push({ x: r.nx + q.dx, y: r.ny + q.dy });
      }
      for (const k of przytnij(pkt, r)) cienie.append(zrob("polyline", { points: zapis(k), class: "analemma" }));
    }

    // Odczyty stoją pod swoimi tarczami i milkną, gdy cień nie pada na ścianę —
    // inaczej liczba wisiałaby przy tarczy, na której nic nie widać.
    const powod = stan.nadHoryzontem ? N.scianaWCieniu : N.poZachodzieSlonca;
    const ustawOdczyt = (id, tekst) => {
      const e = $(id);
      e.textContent = tekst;
      e.classList.toggle("odczyt-pusty", !c);
    };
    ustawOdczyt("rowne", c ? hhmm(stan.rowne) : powod);
    ustawOdczyt("wloskie", c ? h1(stan.wloskie) : powod);
    ustawOdczyt("babilonskie", c ? h1(stan.babilonskie) : powod);
  }

  polaM.addEventListener("change", () => { wypelnijDni(); odswiez(); });
  polaD.addEventListener("change", odswiez);
  $("przelacz").addEventListener("click", (e) => {
    analemma = !analemma;
    e.currentTarget.setAttribute("aria-checked", String(analemma));
    odswiez();
  });
  odswiez();
}
