import { KOCHANSKI } from "./matematyka.js";

const KROKI = [
  ["k1", "k1b", "ptA", "ptB"], ["k2"], ["k3", "k3a", "k3l", "ptC", "lC"],
  ["k4", "k4a", "k4b", "ptD", "lD", "l3r"], ["k5", "l5"]
];


export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const OPISY = JSON.parse($("opis").dataset.kroki);
  let krok = 0;
  const n3 = (x) => x.toFixed(3).replace(".", ",");

  function pokaz() {
    KROKI.forEach((grupa, i) =>
      grupa.forEach((id) => $(id)?.setAttribute("opacity", i <= krok ? "1" : "0")));
    $("opis").innerHTML = OPISY[krok];
    $("cofnij").disabled = krok === 0;
    $("dalej").disabled = krok === OPISY.length - 1;
    // Pole z suwakiem i odczytami pojawia się dopiero na ostatnim kroku, ale
    // miejsce zajmuje od początku: inaczej przejście z kroku 4 na 5 wydłużało
    // stronę o sto pięćdziesiąt punktów i widok podskakiwał.
    $("panel").classList.remove("hide");
    $("panel").classList.toggle("przygaszony", krok !== 4);
  }
  function licz() {
    const r = Number($("promien").value);
    const a = KOCHANSKI * r, b = Math.PI * r, d = (b - a) * 1000;
    $("promienO").textContent = `${r} mm`;
    $("w1").innerHTML = `${n3(a)} <small>mm</small>`;
    $("w2").innerHTML = `${n3(b)} <small>mm</small>`;
    $("w3").innerHTML = d < 1000
      ? `${d.toFixed(1).replace(".", ",")} <small>µm</small>`
      : `${(d / 1000).toFixed(2).replace(".", ",")} <small>mm</small>`;
  }
  $("dalej").addEventListener("click", () => { if (krok < 4) { krok++; pokaz(); } });
  $("cofnij").addEventListener("click", () => { if (krok > 0) { krok--; pokaz(); } });
  $("promien").addEventListener("input", licz);
  pokaz(); licz();
}
