import { przebiegRejsu, REJS } from "./matematyka.js";

const X0 = 70, X1 = 670, Y0 = 30, Y1 = 190, PROG = 56;

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const pl = (x) => Math.round(x).toLocaleString(document.documentElement.lang || "pl");
  const d1 = (x) => x.toFixed(1).replace(".", ",");
  const sgn = (x) => (Math.round(x) > 0 ? "+" : "") + Math.round(x);

  function rysuj() {
    const kolysanie = Number($("kolysanie").value);
    const kompensacja = $("kompensacja").checked;
    const dzien = Number($("dzien").value);
    const bieg = przebiegRejsu({ kolysanie, kompensacja });
    const max = Math.max(PROG, bieg[REJS.dni].kmWahadlo, bieg[REJS.dni].kmSprezyna) * 1.08;
    const px = (i) => X0 + ((X1 - X0) * i) / REJS.dni;
    const py = (y) => Y1 - ((Y1 - Y0) * Math.min(y, max)) / max;
    const linia = (pole) => bieg.map((p, i) => `${px(i).toFixed(1)},${py(p[pole]).toFixed(1)}`).join(" ");

    $("eWahadlo").setAttribute("points", linia("kmWahadlo"));
    $("eSprezyna").setAttribute("points", linia("kmSprezyna"));
    const ty = py(PROG).toFixed(1);
    $("prog").setAttribute("y1", ty); $("prog").setAttribute("y2", ty);
    $("progL").setAttribute("y", (Number(ty) + 4).toFixed(1));
    $("yMax").textContent = `${pl(max)} km`;
    $("profil").setAttribute("points", bieg.map((p, i) =>
      `${px(i).toFixed(1)},${(228 + 47 * (1 - (p.szerokosc - REJS.latB) / (REJS.latA - REJS.latB))).toFixed(1)}`).join(" "));
    const mx = px(dzien).toFixed(1);
    $("znacznik").setAttribute("x1", mx); $("znacznik").setAttribute("x2", mx);

    const p = bieg[dzien];
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
  }
  ["dzien", "kolysanie"].forEach((id) => $(id).addEventListener("input", rysuj));
  $("kompensacja").addEventListener("change", rysuj);
  rysuj();
}
