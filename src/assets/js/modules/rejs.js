import { przebiegRejsu, dataDnia, REJS, TRASA } from "./matematyka.js";

const NS = "http://www.w3.org/2000/svg";
const PROG = 56;                                    // pół stopnia długości geograficznej
const M = { x0: 40, x1: 720, y0: 40, y1: 370, lonA: -64, lonB: 6, latA: 52, latB: -4 };
const WSK_MAX = 400;                                // górna granica podziałki wskaźników

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const n = JSON.parse(root.querySelector("[data-napisy]")?.dataset.napisy || "{}");
  const jezyk = document.documentElement.lang || "pl";
  const pl = (x) => Math.round(x).toLocaleString(jezyk);
  const d1 = (x) => x.toFixed(1).replace(".", ",");
  const sgn = (x) => (Math.round(x) > 0 ? "+" : "") + Math.round(x);
  const podstaw = (w, d) => String(w || "").replace(/\{(\w+)\}/g, (_, k) => d[k] ?? "");
  const el = (nazwa, atr, tekst) => {
    const e = document.createElementNS(NS, nazwa);
    for (const [k, v] of Object.entries(atr)) e.setAttribute(k, v);
    if (tekst !== undefined) e.append(document.createTextNode(tekst));
    return e;
  };

  // ── karta kursowa: siatka, róża wiatrów, porty ───────────────────────────
  const mx = (lon) => M.x0 + ((M.x1 - M.x0) * (lon - M.lonA)) / (M.lonB - M.lonA);
  const my = (lat) => M.y0 + ((M.y1 - M.y0) * (M.latA - lat)) / (M.latA - M.latB);

  (function kartaStala() {
    const g = $("siatka");
    for (let lon = -60; lon <= 0; lon += 10) {
      g.append(el("line", { x1: mx(lon), y1: M.y0, x2: mx(lon), y2: M.y1, stroke: "var(--rule-soft)", "stroke-width": "0.6" }));
      g.append(el("text", { class: "t napis-karty", x: mx(lon), y: M.y1 + 16, "text-anchor": "middle" }, `${Math.abs(lon)}°${lon < 0 ? "W" : ""}`));
    }
    for (let lat = 0; lat <= 50; lat += 10) {
      g.append(el("line", { x1: M.x0, y1: my(lat), x2: M.x1, y2: my(lat), stroke: "var(--rule-soft)", "stroke-width": "0.6" }));
      g.append(el("text", { class: "t napis-karty", x: M.x0 - 8, y: my(lat) + 4, "text-anchor": "end" }, `${lat}°N`));
    }
    const r = $("roza"), cx = mx(-18), cy = my(28);
    for (let i = 0; i < 16; i++) {
      const a = (i * 22.5 * Math.PI) / 180;
      r.append(el("line", {
        x1: cx, y1: cy, x2: cx + 300 * Math.sin(a), y2: cy - 300 * Math.cos(a),
        stroke: "var(--mosiadz-ciemny)", "stroke-width": "0.4", opacity: "0.22"
      }));
    }
    r.append(el("circle", { cx, cy, r: 26, fill: "none", stroke: "var(--mosiadz-ciemny)", "stroke-width": "0.8", opacity: "0.6" }));
    const sk = $("podzialkaMil");
    const dlugoscStopnia = mx(0) - mx(-1);          // szerokość jednego stopnia w pikselach
    const mile = 600;                                // mila morska to minuta łuku południka
    const szer = (mile / 60) * dlugoscStopnia;
    const y = M.y1 - 26, x = M.x0 + 190;
    sk.append(el("line", { x1: x, y1: y, x2: x + szer, y2: y, stroke: "var(--mosiadz-ciemny)", "stroke-width": "1.4" }));
    for (let i = 0; i <= 5; i++) {
      const xi = x + (szer * i) / 5;
      sk.append(el("line", { x1: xi, y1: y - 4, x2: xi, y2: y + 4, stroke: "var(--mosiadz-ciemny)", "stroke-width": "1.1" }));
    }
    for (let i = 0; i < 5; i += 2)
      sk.append(el("rect", { x: x + (szer * i) / 5, y: y - 3, width: szer / 5, height: 6, fill: "var(--mosiadz-ciemny)", opacity: "0.65" }));
    sk.append(el("text", { class: "t napis-karty", x: x + szer / 2, y: y + 20, "text-anchor": "middle" }, n.skalaMil || ""));

    r.append(el("path", { d: `M ${cx} ${cy - 34} L ${cx + 6} ${cy} L ${cx} ${cy + 10} L ${cx - 6} ${cy} Z`, fill: "var(--mosiadz-ciemny)", opacity: "0.75" }));

    $("trasa").setAttribute("points", TRASA.map(([lo, la]) => `${mx(lo).toFixed(1)},${my(la).toFixed(1)}`).join(" "));

    const p = $("porty");
    for (const [lon, lat, nazwa, kot] of [[REJS.lonA, REJS.latA, n.laRochelle, "start"], [REJS.lonB, REJS.latB, n.kajenna, "end"]]) {
      p.append(el("circle", { cx: mx(lon), cy: my(lat), r: 3.5, fill: "var(--ink)" }));
      p.append(el("text", {
        class: "t napis-karty port", x: mx(lon) + (kot === "start" ? -8 : 8), y: my(lat) - 8,
        "text-anchor": kot === "start" ? "end" : "start"
      }, nazwa || ""));
    }
  })();

  // ── podziałki wskaźników i termometru ────────────────────────────────────
  const katWsk = (v) => -120 + 240 * Math.sqrt(Math.min(Math.max(v, 0), WSK_MAX) / WSK_MAX);
  (function podzialki() {
    for (const id of ["skalaW", "skalaS"]) {
      const g = $(id);
      for (const v of [0, 25, 50, 100, 200, 300, 400]) {
        const a = (katWsk(v) * Math.PI) / 180;
        const sx = 100 + 74 * Math.sin(a), sy = 100 - 74 * Math.cos(a);
        const ex = 100 + 64 * Math.sin(a), ey = 100 - 64 * Math.cos(a);
        g.append(el("line", { x1: sx, y1: sy, x2: ex, y2: ey, stroke: "var(--ink)", "stroke-width": "1.4" }));
        g.append(el("text", {
          class: "t", x: 100 + 52 * Math.sin(a), y: 100 - 52 * Math.cos(a) + 4, "text-anchor": "middle"
        }, String(v)));
      }
      for (let v = 0; v <= WSK_MAX; v += 10) {
        const a = (katWsk(v) * Math.PI) / 180;
        g.append(el("line", {
          x1: 100 + 74 * Math.sin(a), y1: 100 - 74 * Math.cos(a),
          x2: 100 + 70 * Math.sin(a), y2: 100 - 70 * Math.cos(a),
          stroke: "var(--rule)", "stroke-width": "0.7"
        }));
      }
    }
    const g = $("skalaTerm");
    for (let c = 0; c <= 35; c += 5) {
      const y = 180 - (c / 35) * 150;
      g.append(el("line", { x1: 60, y1: y, x2: 70, y2: y, stroke: "var(--ink-soft)", "stroke-width": "1" }));
      g.append(el("text", { class: "t", x: 74, y: y + 4 }, String(c)));
    }
  })();

  function igla(id, wartosc) {
    const g = $(id);
    g.replaceChildren();
    const a = (katWsk(wartosc) * Math.PI) / 180;
    g.append(el("line", {
      x1: 100 - 14 * Math.sin(a), y1: 100 + 14 * Math.cos(a),
      x2: 100 + 70 * Math.sin(a), y2: 100 - 70 * Math.cos(a),
      stroke: "var(--sun)", "stroke-width": "2.4", "stroke-linecap": "round"
    }));
  }

  function fale(stan) {
    const g = $("fale");
    g.replaceChildren();
    const amp = 3 + stan * 1.6;
    for (let i = 0; i < 3; i++) {
      const y = 252 + i * 14, a = amp * (1 - i * 0.22);
      let d = `M -10 ${y}`;
      for (let x = 20; x <= 540; x += 40) d += ` Q ${x - 20} ${(y - a).toFixed(1)} ${x} ${y}`;
      g.append(el("path", { d, fill: "none", stroke: i === 0 ? "var(--ink-soft)" : "var(--rule)", "stroke-width": i === 0 ? "1.3" : "0.9" }));
    }
  }

  const MIESIACE = {
    pl: ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"],
    en: ["January","February","March","April","May","June","July","August","September","October","November","December"]
  };

  function rysuj() {
    const kolysanie = Number($("kolysanie").value);
    const kompensacja = $("kompensacja").checked;
    const dzien = Number($("dzien").value);
    const bieg = przebiegRejsu({ kolysanie, kompensacja });
    const p = bieg[dzien];

    // kalendarz
    const data = dataDnia(dzien);
    const mies = (MIESIACE[jezyk] || MIESIACE.pl)[data.getUTCMonth()];
    $("kalMiesiac").textContent = mies;
    $("kalDzien").textContent = data.getUTCDate();
    $("kalRok").textContent = data.getUTCFullYear();
    $("kalDoba").textContent = podstaw(n.dobaRejsu, { d: dzien });
    $("dzienO").textContent = dzien;

    // okręt i fale
    $("kolysanieO").textContent = `${kolysanie}° · ${(n.stanyMorza || [])[Math.min(Math.floor(kolysanie / 3.5), 3)] || ""}`;
    fale(kolysanie);
    root.querySelector(".okret")?.style.setProperty("--rk", String(Math.max(0.5, kolysanie)));
    root.querySelector(".wahadlo")?.style.setProperty("--sw", String(3 + kolysanie));
    $("stop").classList.toggle("hide", kolysanie < 11);

    // przyrządy
    $("slupek").setAttribute("y", (180 - (p.temperatura / 35) * 150).toFixed(1));
    $("slupek").setAttribute("height", ((p.temperatura / 35) * 150 + 16).toFixed(1));
    $("termOdczyt").textContent = `${d1(p.temperatura)} °C`;
    igla("igla1", p.dryfWahadlo);
    igla("igla2", p.dryfSprezyna);
    $("dw").textContent = `${sgn(p.dryfWahadlo)} s`;
    $("ds").textContent = `${sgn(p.dryfSprezyna)} s`;

    // karta kursowa: pozycja prawdziwa i dwie policzone z zegarów
    const g = $("pozycje");
    g.replaceChildren();
    const kmNaStopien = 111.32 * Math.cos((p.szerokosc * Math.PI) / 180);
    const znacznik = (km, kolor, podpis, dy) => {
      const lon = Math.min(p.dlugosc + km / kmNaStopien, M.lonB - 0.5);
      g.append(el("line", { x1: mx(p.dlugosc), y1: my(p.szerokosc), x2: mx(lon), y2: my(p.szerokosc),
        stroke: kolor, "stroke-width": "1", "stroke-dasharray": "3 3" }));
      g.append(el("circle", { cx: mx(lon), cy: my(p.szerokosc), r: 5, fill: "none", stroke: kolor, "stroke-width": "2" }));
      const px = mx(lon);
      const przyKrawedzi = px > M.x1 - 150;
      g.append(el("text", {
        class: "t napis-karty", x: przyKrawedzi ? px - 10 : px + 10, y: my(p.szerokosc) + dy,
        "text-anchor": przyKrawedzi ? "end" : "start", fill: kolor
      }, podpis));
    };
    // Ślad narastania błędu: dla każdej doby do bieżącej punkt, w którym okręt
    // *myślałby*, że jest. To ten sam przebieg, co dawny wykres obok mapy —
    // tyle że wykreślony tam, gdzie ma sens, czyli na karcie kursowej.
    const slad = (pole) => bieg.slice(0, dzien + 1).map((q) => {
      const kmSt = 111.32 * Math.cos((q.szerokosc * Math.PI) / 180);
      const lon = Math.min(q.dlugosc + q[pole] / kmSt, M.lonB - 0.5);
      return `${mx(lon).toFixed(1)},${my(q.szerokosc).toFixed(1)}`;
    }).join(" ");
    for (const [pole, kolor] of [["kmWahadlo", "var(--sun)"], ["kmSprezyna", "var(--verd)"]])
      g.append(el("polyline", { points: slad(pole), fill: "none", stroke: kolor,
        "stroke-width": "1.4", opacity: "0.85", class: "slad-bledu" }));

    znacznik(p.kmWahadlo, "var(--sun)", `${n.wahadlo}: ${pl(p.kmWahadlo)} km`, -8);
    znacznik(p.kmSprezyna, "var(--verd)", `${n.sprezyna}: ${pl(p.kmSprezyna)} km`, 16);
    g.append(el("circle", { cx: mx(p.dlugosc), cy: my(p.szerokosc), r: 5, fill: "var(--ink)" }));
    // Podpis „tu jesteś" ustępuje nazwie portu: w La Rochelle i w Kajennie
    // obie etykiety lądowały na sobie i czytało się z tego zdanie, którego
    // nikt nie napisał.
    const wPorcie = [[REJS.lonA, REJS.latA], [REJS.lonB, REJS.latB]]
      .some(([lo, la]) => Math.hypot(mx(p.dlugosc) - mx(lo), my(p.szerokosc) - my(la)) < 26);
    if (!wPorcie)
      g.append(el("text", { class: "t napis-karty", x: mx(p.dlugosc) - 8, y: my(p.szerokosc) + 4, "text-anchor": "end" }, n.tuJestes || ""));

    // Odczyty stoją przy przyrządach, które je dają: szerokość pod kartą,
    // błąd pozycji pod wskaźnikiem tego zegara, z którego wynika.
    $("szer").innerHTML = `${d1(p.szerokosc)} <small>°N</small>`;
    $("kw").innerHTML = `${pl(p.kmWahadlo)} <small>km</small>`;
    $("ks").innerHTML = `${pl(p.kmSprezyna)} <small>km</small>`;

    rachunek(bieg, dzien, kmNaStopien);
  }

  function rachunek(bieg, dzien, kmNaStopien) {
    const lista = $("rachunekLista");
    lista.replaceChildren();
    const dodaj = (tekst) => lista.append(Object.assign(document.createElement("li"), { textContent: tekst }));
    if (dzien === 0) { dodaj(n.rachunek0 || ""); return; }
    let suma = 0;
    for (let i = 0; i < dzien; i++) suma += bieg[i].dryfWahadlo;
    const stopnie = (Math.abs(suma) / 86400) * 360;
    dodaj(podstaw(n.rachunek1, { d: dzien, s: pl(Math.abs(suma)) }));
    dodaj(n.rachunek2 || "");
    dodaj(podstaw(n.rachunek3, { st: stopnie.toFixed(2).replace(".", ",") }));
    dodaj(podstaw(n.rachunek4, { lat: d1(bieg[dzien].szerokosc), km: Math.round(kmNaStopien) }));
    dodaj(podstaw(n.rachunek5, { km: pl(bieg[dzien].kmWahadlo), prog: PROG }));
  }

  ["dzien", "kolysanie"].forEach((id) => $(id).addEventListener("input", rysuj));
  $("kompensacja").addEventListener("change", rysuj);
  $("tempo").addEventListener("input", () => {
    $("tempoO").textContent = czasRejsu();
  });
  function czasRejsu() {
    const sek = Math.round((REJS.dni * msNaDzien()) / 1000);
    return sek >= 60
      ? podstaw(n.tempoMin, { m: Math.floor(sek / 60), s: String(sek % 60).padStart(2, "0") })
      : podstaw(n.tempoSek, { s: sek });
  }
  const msNaDzien = () => Math.round(2600 * Math.pow(0.74, Number($("tempo").value) - 1));

  let bieg = null;
  // Przełącznik ma dwa stany i jeden kształt: koło sterowe przy postoju,
  // kotwica w drodze. Podmieniamy sam napis i „aria-pressed", nigdy całą
  // zawartość guzika — tak zginął kiedyś rysunek koła, zastąpiony tekstem.
  const stanRejsu = (plynie) => {
    const g = $("rejsStart");
    g.setAttribute("aria-pressed", String(plynie));
    $("rejsNapis").textContent = (plynie ? n.zatrzymaj : n.odbij) || "";
  };
  $("rejsStart").addEventListener("click", () => {
    if (bieg) { clearInterval(bieg); bieg = null; stanRejsu(false); return; }
    // Zatrzymanie rzuca kotwicę tam, gdzie okręt stoi; koło sterowe podnosi ją
    // i rejs idzie dalej od tego miejsca. Od początku zaczynamy tylko wtedy,
    // gdy okręt dobił już do Kajenny — wtedy nie ma dokąd płynąć dalej.
    if (Number($("dzien").value) >= REJS.dni) { $("dzien").value = 0; rysuj(); }
    stanRejsu(true);
    const krok = () => {
      const d = Number($("dzien").value) + 1;
      $("dzien").value = Math.min(d, REJS.dni);
      rysuj();
      if (d >= REJS.dni) { clearInterval(bieg); bieg = null; stanRejsu(false); }
    };
    bieg = setInterval(krok, msNaDzien());
  });

  $("tempoO").textContent = czasRejsu();
  rysuj();
}
