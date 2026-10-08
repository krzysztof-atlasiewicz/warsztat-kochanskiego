import * as A from "../lib/astronomy.js";

const OBS = new A.Observer(52.165, 21.09, 110);
const G = 60, CX = 190, CY = 60;


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
    data, wysokosc: hor.altitude, azymutOdPoludnia: hor.azimuth - 180,
    rowne: teraz,
    babilonskie: wschod ? (teraz - czasSloneczny(wschod) + 24) % 24 : null,
    wloskie: zachod ? (teraz - czasSloneczny(zachod) + 24) % 24 : null,
    nadHoryzontem: hor.altitude > 0
  };
}

function cien(stan) {
  if (!stan.nadHoryzontem) return null;
  const A2 = (stan.azymutOdPoludnia * Math.PI) / 180;
  if (Math.cos(A2) <= 0.08) return null;
  const x = CX + G * Math.tan(A2), y = CY + (G * Math.tan((stan.wysokosc * Math.PI) / 180)) / Math.cos(A2);
  return x < 28 || x > 352 || y < 20 || y > 230 ? null : [x, y];
}

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const hhmm = (h) => { const m = Math.round(((h % 24) + 24) % 24 * 60); return `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, "0")}`; };
  const h1 = (x) => (x == null ? "—" : x.toFixed(1).replace(".", ","));
  const ROK = 2026;
  const MIES = JSON.parse(root.querySelector("[data-miesiace]").dataset.miesiace);

  function krzywa(dzien) {
    const p = [];
    for (let g = 3; g <= 21; g += 0.25) {
      const c = cien(stanNieba(ROK, dzien, g));
      if (c) p.push(`${c[0].toFixed(1)},${c[1].toFixed(1)}`);
    }
    return p.join(" ");
  }
  $("przesilenieL").setAttribute("points", krzywa(172));
  $("rownonoc").setAttribute("points", krzywa(80));
  $("przesilenieZ").setAttribute("points", krzywa(355));

  let analemma = false;
  function odswiez() {
    const dzien = Number($("data").value), godz = Number($("zegar").value);
    const d0 = new Date(Date.UTC(ROK, 0, dzien));
    $("dataO").textContent = `${d0.getUTCDate()} ${MIES[d0.getUTCMonth()]}`;
    $("zegarO").textContent = hhmm(godz);
    const stan = stanNieba(ROK, dzien, godz);
    $("rowne").textContent = stan.nadHoryzontem ? hhmm(stan.rowne) : "—";
    $("wloskie").textContent = stan.nadHoryzontem ? h1(stan.wloskie) : "—";
    $("babilonskie").textContent = stan.nadHoryzontem ? h1(stan.babilonskie) : "—";
    $("mech").textContent = hhmm(godz);
    $("slon").textContent = hhmm(stan.rowne);
    const roz = (stan.rowne - godz) * 60;
    $("roznica").innerHTML = `${Math.round(Math.abs(roz))} <small>min</small>`;
    const c = cien(stan), promien = $("promien2"), grot = $("grot");
    if (c) {
      promien.setAttribute("x2", c[0]); promien.setAttribute("y2", c[1]); promien.setAttribute("opacity", "1");
      grot.setAttribute("cx", c[0]); grot.setAttribute("cy", c[1]); grot.setAttribute("opacity", "1");
      $("brakSlonca").setAttribute("opacity", "0");
    } else {
      promien.setAttribute("opacity", "0"); grot.setAttribute("opacity", "0");
      $("brakSlonca").setAttribute("opacity", "1");
    }
    const pkt = [];
    if (analemma) for (let d = 1; d <= 365; d += 4) {
      const q = cien(stanNieba(ROK, d, godz));
      if (q) pkt.push(`${q[0].toFixed(1)},${q[1].toFixed(1)}`);
    }
    $("analemma").setAttribute("points", pkt.join(" "));
  }
  ["data", "zegar"].forEach((id) => $(id).addEventListener("input", odswiez));
  $("przelacz").addEventListener("click", (e) => {
    analemma = !analemma;
    e.currentTarget.textContent = analemma ? e.currentTarget.dataset.ukryj : e.currentTarget.dataset.pokaz;
    odswiez();
  });
  odswiez();
}
