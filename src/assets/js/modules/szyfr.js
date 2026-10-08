import { ALFABET, KLUCZ, JAWNY, przesun, uprosc, szyfruj, odszyfruj, najlepszePrzesuniecie }
  from "./matematyka.js";

const NS = "http://www.w3.org/2000/svg";
const SZYFROGRAM_1664 = przesun(JAWNY, KLUCZ);

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const n = JSON.parse(root.querySelector("[data-napisy]")?.dataset.napisy || "{}");
  let zrodlo = "szyfr"; // które pole było ostatnio zmieniane

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

  function przelicz() {
    const s = Number($("obrot").value);
    $("obrotO").textContent = s;
    $("srodek").textContent = s;
    tarcza(s);
    if (zrodlo === "jawny") $("szyfrogram").value = szyfruj($("jawny").value, s);
    else $("jawny").value = odszyfruj($("szyfrogram").value, s);

    const trafione = uprosc($("jawny").value).trim() === JAWNY;
    $("pierscien").setAttribute("stroke", trafione ? "var(--verd)" : "var(--rule)");
    $("rozwiazane").classList.toggle("hide", !trafione);
    $("jawny").classList.toggle("hit", trafione);
  }

  function powiedz(tekst) { $("komunikat").textContent = tekst; }

  async function doSchowka(tekst, potwierdzenie) {
    try {
      await navigator.clipboard.writeText(tekst);
      powiedz(potwierdzenie);
    } catch {
      powiedz(n.schowekNie || "");
    }
  }

  $("jawny").addEventListener("input", () => { zrodlo = "jawny"; przelicz(); });
  $("szyfrogram").addEventListener("input", () => { zrodlo = "szyfr"; przelicz(); });
  $("obrot").addEventListener("input", przelicz);

  $("lam").addEventListener("click", () => {
    const zapis = $("szyfrogram").value;
    if (!/[A-Za-z]/.test(uprosc(zapis))) { powiedz(n.pusto || ""); return; }
    const { przesuniecie } = najlepszePrzesuniecie(zapis, $("jezykAnalizy").value);
    $("obrot").value = przesuniecie;
    zrodlo = "szyfr";
    przelicz();
    powiedz((n.zlamane || "").replace("{n}", przesuniecie));
  });

  $("kopiuj").addEventListener("click", () => doSchowka($("szyfrogram").value, n.skopiowano || ""));

  $("odnosnik").addEventListener("click", () => {
    const adres = location.href.split("#")[0] + "#z=" + encodeURIComponent($("szyfrogram").value);
    doSchowka(adres, n.odnosnikGotowy || "");
  });

  $("historyczny").addEventListener("click", () => {
    $("szyfrogram").value = SZYFROGRAM_1664;
    $("obrot").value = 0;
    zrodlo = "szyfr";
    przelicz();
    powiedz(n.wczytano || "");
  });

  // Zapis podany w adresie ma pierwszeństwo przed zapisem z 1664 roku.
  const zHasza = new URLSearchParams(location.hash.slice(1)).get("z");
  $("szyfrogram").value = zHasza || SZYFROGRAM_1664;
  if (zHasza) powiedz(n.zOdnosnika || "");
  przelicz();
}
