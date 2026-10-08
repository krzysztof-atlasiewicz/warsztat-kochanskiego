import { przebiegRejsu, REJS } from "./matematyka.js";

const X0 = 70 + 20, X1 = 700, Y0 = 46, Y1 = 240;   // pole wykresu błędu
const S0 = 300, S1 = 366;                           // pasek szerokości geograficznej
const L0 = 60, L1 = 720;                            // linijka błędu pozycji
const PROG = 56;                                    // pół stopnia długości geograficznej

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const n = JSON.parse(root.querySelector("[data-napisy]")?.dataset.napisy || "{}");
  const pl = (x) => Math.round(x).toLocaleString(document.documentElement.lang || "pl");
  const d1 = (x) => x.toFixed(1).replace(".", ",");
  const sgn = (x) => (Math.round(x) > 0 ? "+" : "") + Math.round(x);
  const podstaw = (wzor, dane) => String(wzor || "").replace(/\{(\w+)\}/g, (_, k) => dane[k] ?? "");
  const NS = "http://www.w3.org/2000/svg";

  function pinezka(grupa, x, kolor, podpis, nad) {
    const g = $(grupa);
    g.replaceChildren();
    const y = nad ? 52 : 72;
    const linia = document.createElementNS(NS, "line");
    Object.entries({ x1: x, y1: 62, x2: x, y2: nad ? 34 : 90, stroke: kolor, "stroke-width": "1.5" })
      .forEach(([k, v]) => linia.setAttribute(k, v));
    const kropka = document.createElementNS(NS, "circle");
    Object.entries({ cx: x, cy: 62, r: "4", fill: kolor }).forEach(([k, v]) => kropka.setAttribute(k, v));
    const tekst = document.createElementNS(NS, "text");
    tekst.setAttribute("class", "t");
    tekst.setAttribute("x", Math.min(Math.max(x, 40), L1 - 10));
    tekst.setAttribute("y", nad ? 28 : 104);
    tekst.setAttribute("text-anchor", "middle");
    tekst.setAttribute("fill", kolor);
    tekst.append(document.createTextNode(podpis));
    g.append(linia, kropka, tekst);
    void y;
  }

  // Podziałka dni — rysowana raz, nie zależy od nastaw.
  (function podzialkaDni() {
    const g = $("dniPodzialka");
    for (const d of [0, 16, 32, 48, 64]) {
      const x = X0 + ((X1 - X0) * d) / REJS.dni;
      const kreska = document.createElementNS(NS, "line");
      Object.entries({ x1: x.toFixed(1), y1: "366", x2: x.toFixed(1), y2: "372", stroke: "var(--rule)", "stroke-width": "1" })
        .forEach(([k, v]) => kreska.setAttribute(k, v));
      const napis = document.createElementNS(NS, "text");
      napis.setAttribute("class", "t");
      napis.setAttribute("x", x.toFixed(1));
      napis.setAttribute("y", "384");
      napis.setAttribute("text-anchor", d === 0 ? "start" : d === REJS.dni ? "end" : "middle");
      napis.append(document.createTextNode(String(d)));
      g.append(kreska, napis);
    }
  })();

  function rysuj() {
    const kolysanie = Number($("kolysanie").value);
    const kompensacja = $("kompensacja").checked;
    const dzien = Number($("dzien").value);
    const bieg = przebiegRejsu({ kolysanie, kompensacja });
    const koniec = bieg[REJS.dni];
    const max = Math.max(PROG * 1.6, koniec.kmWahadlo, koniec.kmSprezyna) * 1.08;
    const px = (i) => X0 + ((X1 - X0) * i) / REJS.dni;
    const py = (y) => Y1 - ((Y1 - Y0) * Math.min(y, max)) / max;
    const linia = (pole) => bieg.map((p, i) => `${px(i).toFixed(1)},${py(p[pole]).toFixed(1)}`).join(" ");

    $("eWahadlo").setAttribute("points", linia("kmWahadlo"));
    $("eSprezyna").setAttribute("points", linia("kmSprezyna"));
    const ty = py(PROG).toFixed(1);
    $("prog").setAttribute("y1", ty); $("prog").setAttribute("y2", ty);
    $("progL").setAttribute("y", (Number(ty) + 4).toFixed(1));
    $("yMax").textContent = `${pl(max)} km`;
    $("ySrodek").textContent = `${pl(max / 2)} km`;

    $("profil").setAttribute("points", bieg.map((p, i) =>
      `${px(i).toFixed(1)},${(S0 + (S1 - S0) * (1 - (p.szerokosc - REJS.latB) / (REJS.latA - REJS.latB))).toFixed(1)}`
    ).join(" "));

    const p = bieg[dzien];
    const mx = px(dzien);
    $("znacznik").setAttribute("x1", mx.toFixed(1)); $("znacznik").setAttribute("x2", mx.toFixed(1));
    $("punktW").setAttribute("cx", mx.toFixed(1)); $("punktW").setAttribute("cy", py(p.kmWahadlo).toFixed(1));
    $("punktS").setAttribute("cx", mx.toFixed(1)); $("punktS").setAttribute("cy", py(p.kmSprezyna).toFixed(1));

    // Linijka: jak daleko od prawdziwej pozycji wypada każdy z zegarów.
    const skala = Math.max(PROG * 2, p.kmWahadlo, p.kmSprezyna) * 1.1;
    const lx = (km) => L0 + ((L1 - L0) * Math.min(km, skala)) / skala;
    $("strefa").setAttribute("width", (lx(PROG) - L0).toFixed(1));
    $("strefaL").setAttribute("x", lx(PROG).toFixed(1));
    pinezka("pinW", lx(p.kmWahadlo).toFixed(1), "var(--sun)", `${pl(p.kmWahadlo)} km`, true);
    pinezka("pinS", lx(p.kmSprezyna).toFixed(1), "var(--verd)", `${pl(p.kmSprezyna)} km`, false);
    $("linijkaMax").textContent = podstaw(n.skala, { km: pl(skala) });

    $("dzienO").textContent = dzien;
    $("kolysanieO").textContent = `${kolysanie}°`;
    $("szer").innerHTML = `${d1(p.szerokosc)} <small>°N</small>`;
    $("temp").innerHTML = `${d1(p.temperatura)} <small>°C</small>`;
    $("dw").innerHTML = `${sgn(p.dryfWahadlo)} <small>s/dobę</small>`;
    $("ds").innerHTML = `${sgn(p.dryfSprezyna)} <small>s/dobę</small>`;
    $("kw").innerHTML = `${pl(p.kmWahadlo)} <small>km</small>`;
    $("ks").innerHTML = `${pl(p.kmSprezyna)} <small>km</small>`;
    $("stop").classList.toggle("hide", kolysanie < 11);

    const okret = root.querySelector(".okret"), wah = root.querySelector(".wahadlo");
    okret?.style.setProperty("--rk", String(Math.max(0.5, kolysanie)));
    wah?.style.setProperty("--sw", String(3 + kolysanie));

    rachunek(bieg, dzien);
  }

  // Jak sekundy zamieniają się w kilometry — na bieżących liczbach, nie na przykładzie.
  function rachunek(bieg, dzien) {
    const lista = $("rachunekLista");
    lista.replaceChildren();
    const dodaj = (tekst) => { const li = document.createElement("li"); li.textContent = tekst; lista.append(li); };
    if (dzien === 0) { dodaj(n.rachunek0 || ""); return; }
    let sumaW = 0;
    for (let i = 0; i < dzien; i++) sumaW += bieg[i].dryfWahadlo;
    const lat = bieg[dzien].szerokosc;
    const kmNaStopien = 111.32 * Math.cos((lat * Math.PI) / 180);
    const stopnie = (Math.abs(sumaW) / 86400) * 360;
    dodaj(podstaw(n.rachunek1, { d: dzien, s: pl(Math.abs(sumaW)) }));
    dodaj(n.rachunek2 || "");
    dodaj(podstaw(n.rachunek3, { st: stopnie.toFixed(2).replace(".", ",") }));
    dodaj(podstaw(n.rachunek4, { lat: d1(lat), km: Math.round(kmNaStopien) }));
    dodaj(podstaw(n.rachunek5, { km: pl(bieg[dzien].kmWahadlo), prog: PROG }));
  }

  ["dzien", "kolysanie"].forEach((id) => $(id).addEventListener("input", rysuj));
  $("kompensacja").addEventListener("change", rysuj);

  let bieg = null;
  $("rejsStart").addEventListener("click", () => {
    if (bieg) { clearInterval(bieg); bieg = null; $("rejsStart").textContent = n.odbij || ""; return; }
    $("dzien").value = 0; rysuj();
    $("rejsStart").textContent = n.zatrzymaj || "";
    bieg = setInterval(() => {
      const d = Number($("dzien").value) + 1;
      $("dzien").value = Math.min(d, REJS.dni);
      rysuj();
      if (d >= REJS.dni) { clearInterval(bieg); bieg = null; $("rejsStart").textContent = n.odbij || ""; }
    }, 90);
  });

  rysuj();
}
