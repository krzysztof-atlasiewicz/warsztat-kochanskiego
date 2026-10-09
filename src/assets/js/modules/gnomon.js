import * as A from "../lib/astronomy.js";
import {
  WILANOW, polozenieSlonca, cienNodusa, wschodSloneczny, zachodSloneczny,
  liniaGodzinRownych, liniaGodzinWloskich, liniaGodzinBabilonskich, krzywaDeklinacji
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
const RZYMSKIE = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const NS = "http://www.w3.org/2000/svg";

const zrob = (nazwa, atrybuty, tresc) => {
  const e = document.createElementNS(NS, nazwa);
  for (const k in atrybuty) e.setAttribute(k, atrybuty[k]);
  if (tresc != null) e.textContent = tresc;
  return e;
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

export function stanNieba(rok, dzienRoku, godzinaZegarowa) {
  const d0 = new Date(Date.UTC(rok, 0, dzienRoku));
  const data = zCzasuLokalnego(rok, d0.getUTCMonth(), d0.getUTCDate(), godzinaZegarowa);
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
    x: Math.min(Math.max(x, r.x0 + 9), r.x1 - 9),
    y: Math.min(Math.max(y + 4, r.y0 + 13), r.y1 - 4)
  };
}

function rysujTarcze(g, tarcza, rodzaj, linie, napisy) {
  const r = tarcza;
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
  g.append(zrob("text", { x: (r.x0 + r.x1) / 2, y: r.y1 + 22, "text-anchor": "middle", class: "napis-tarczy" },
    napisy[rodzaj]));
}

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const N = JSON.parse(root.querySelector("[data-napisy]").dataset.napisy);
  const ROK = 2026;
  const fi = WILANOW.fi;
  const hhmm = (h) => { const m = Math.round((((h % 24) + 24) % 24) * 60); return `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, "0")}`; };
  const godzMin = (h) => `${Math.floor(h)} ${N.godz} ${String(Math.round((h % 1) * 60)).padStart(2, "0")} ${N.min}`;
  const h1 = (x) => (x == null ? "—" : x.toFixed(1).replace(".", ","));

  // ── tarcza zegara mechanicznego ────────────────────────────────────────
  const pierscien = $("pierscienGodzin");
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    pierscien.append(zrob("text", {
      x: (100 + 67 * Math.cos(a)).toFixed(1), y: (100 + 67 * Math.sin(a) + 5).toFixed(1),
      "text-anchor": "middle", class: "cyfra-zegara"
    }, RZYMSKIE[i]));
  }
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180, dl = i % 5 === 0 ? 7 : 3;
    pierscien.append(zrob("line", {
      x1: (100 + 86 * Math.cos(a)).toFixed(1), y1: (100 + 86 * Math.sin(a)).toFixed(1),
      x2: (100 + (86 - dl) * Math.cos(a)).toFixed(1), y2: (100 + (86 - dl) * Math.sin(a)).toFixed(1),
      class: i % 5 === 0 ? "kreska-godzin" : "kreska-minut"
    }));
  }

  // ── stałe linie na ścianie ─────────────────────────────────────────────
  const tarcze = $("tarcze");
  const zbierz = (zakres, buduj, podpis) => zakres
    .map((k) => ({ etykieta: podpis(k), punkty: buduj(k) }))
    .filter((l) => l.punkty.length > 1);

  rysujTarcze(tarcze, TARCZE.wloskie, "wloskie",
    zbierz([...Array(24).keys()].map((i) => i + 1), (k) => liniaGodzinWloskich(fi, G, k), String), N.tarcze);
  rysujTarcze(tarcze, TARCZE.rowne, "rowne",
    zbierz([...Array(15).keys()].map((i) => i + 5), (k) => liniaGodzinRownych(fi, G, k), (k) => RZYMSKIE[k % 12]), N.tarcze);
  rysujTarcze(tarcze, TARCZE.babilonskie, "babilonskie",
    zbierz([...Array(17).keys()], (k) => liniaGodzinBabilonskich(fi, G, k), String), N.tarcze);

  // krzywe deklinacyjne rysujemy tylko na tarczy środkowej, żeby nie zamazać reszty
  const r = TARCZE.rowne;
  for (const dekl of [23.44, 0, -23.44]) {
    const kawalki = przytnij(naPkt(r, krzywaDeklinacji(fi, G, dekl)), r);
    for (const k of kawalki)
      tarcze.append(zrob("polyline", { points: zapis(k), class: `krzywa krzywa-${dekl > 0 ? "lato" : dekl < 0 ? "zima" : "rownonoc"}` }));
  }

  // ── warstwa ruchoma ────────────────────────────────────────────────────
  let analemma = false;

  function odswiez() {
    const dzien = Number($("data").value), godz = Number($("zegar").value);
    const d0 = new Date(Date.UTC(ROK, 0, dzien));
    const stan = stanNieba(ROK, dzien, godz);

    // kartka kalendarza
    $("dataO").textContent = `${d0.getUTCDate()} ${N.miesiace[d0.getUTCMonth()]}`;
    $("kalMiesiac").textContent = N.miesiaceDop[d0.getUTCMonth()];
    $("kalDzien").textContent = String(d0.getUTCDate());
    const wsch = wschodSloneczny(fi, stan.deklinacja), zach = zachodSloneczny(fi, stan.deklinacja);
    $("kalPora").textContent = `${N.dzienTrwa} ${godzMin(zach - wsch)}`;
    $("kalDzien2").textContent = `${N.nocTrwa} ${godzMin(24 - (zach - wsch))}`;

    // zegar mechaniczny
    $("zegarO").textContent = hhmm(godz);
    $("wskGodzin").setAttribute("transform", `rotate(${(godz % 12) * 30} 100 100)`);
    $("wskMinut").setAttribute("transform", `rotate(${(godz % 1) * 360} 100 100)`);

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

      const tarcza = zrob("circle", { cx: sx.toFixed(1), cy: sy.toFixed(1), r: 15, class: "slonce-tarcza" });
      slonce.append(tarcza);
      for (let i = 0; i < 12; i++) {
        const a = (i * 30) * Math.PI / 180;
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
      for (let d = 1; d <= 365; d += 3) {
        const q = przesuniecieCienia(stanNieba(ROK, d, godz));
        if (q) pkt.push({ x: r.nx + q.dx, y: r.ny + q.dy });
      }
      for (const k of przytnij(pkt, r)) cienie.append(zrob("polyline", { points: zapis(k), class: "analemma" }));
    }

    // odczyty
    // Odczyty podajemy tylko wtedy, gdy cień naprawdę pada na ścianę —
    // inaczej liczba stałaby przy tarczy, na której nic nie widać.
    const niema = `— <small>${stan.nadHoryzontem ? N.scianaWCieniu : N.poZachodzieSlonca}</small>`;
    $("rowne").innerHTML = c ? hhmm(stan.rowne) : niema;
    $("wloskie").innerHTML = c ? `${h1(stan.wloskie)} <small>${N.odZachodu}</small>` : niema;
    $("babilonskie").innerHTML = c ? `${h1(stan.babilonskie)} <small>${N.odWschodu}</small>` : niema;
    $("mech").textContent = hhmm(godz);
    $("slon").textContent = hhmm(stan.rowne);
    const roz = (stan.rowne - godz) * 60;
    $("roznica").innerHTML = `${Math.round(Math.abs(roz))} <small>${N.min}</small>`;
  }

  ["data", "zegar"].forEach((id) => $(id).addEventListener("input", odswiez));
  $("przelacz").addEventListener("click", (e) => {
    analemma = !analemma;
    e.currentTarget.textContent = analemma ? e.currentTarget.dataset.ukryj : e.currentTarget.dataset.pokaz;
    e.currentTarget.setAttribute("aria-pressed", String(analemma));
    odswiez();
  });
  odswiez();
}
