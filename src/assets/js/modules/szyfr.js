import { ALFABET, KLUCZ, JAWNY, przesun } from "./matematyka.js";

const NS = "http://www.w3.org/2000/svg";
const SZYFROGRAM = przesun(JAWNY, KLUCZ);

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  $("szyfrogram").textContent = SZYFROGRAM;

  function tarcza(s) {
    const g = $("litery");
    g.replaceChildren();
    const litera = (x, y, ch, kolor) => {
      const t = document.createElementNS(NS, "text");
      t.setAttribute("class", "t");
      t.setAttribute("x", x.toFixed(1));
      t.setAttribute("y", (y + 3.5).toFixed(1));
      t.setAttribute("text-anchor", "middle");
      if (kolor) t.setAttribute("fill", kolor);
      t.append(document.createTextNode(ch));
      g.append(t);
    };
    for (let i = 0; i < 26; i++) {
      const a = ((-90 + i * 13.8462) * Math.PI) / 180;
      litera(190 + 86 * Math.cos(a), 108 + 86 * Math.sin(a), ALFABET[i], null);
    }
    for (let j = 0; j < 26; j++) {
      const b = ((-90 + ((j + s) % 26) * 13.8462) * Math.PI) / 180;
      litera(190 + 60 * Math.cos(b), 108 + 60 * Math.sin(b), ALFABET[j], "var(--verd)");
    }
  }
  function odswiez() {
    const s = Number($("obrot").value), trafione = s === KLUCZ;
    $("obrotO").textContent = s;
    $("srodek").textContent = s;
    tarcza(s);
    const el = $("odczyt");
    el.textContent = przesun(SZYFROGRAM, -s);
    el.classList.toggle("hit", trafione);
    $("pierscien").setAttribute("stroke", trafione ? "var(--verd)" : "var(--rule)");
    $("rozwiazane").classList.toggle("hide", !trafione);
  }
  $("obrot").addEventListener("input", odswiez);
  odswiez();
}
