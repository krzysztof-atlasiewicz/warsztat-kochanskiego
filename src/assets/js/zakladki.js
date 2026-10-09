// Zakładki strony przyrządu. Bez skryptu wszystkie karty są widoczne jedna pod
// drugą — dopiero tutaj zwijamy je do jednej i wiążemy z paskiem zakładek.
export default function init() {
  for (const pasek of document.querySelectorAll(".zakladki")) {
    const zakladki = [...pasek.querySelectorAll('[role="tab"]')];
    const karty = zakladki.map((z) => document.getElementById(z.getAttribute("aria-controls")));
    if (karty.some((k) => !k)) continue;

    const pokaz = (i, przenies) => {
      zakladki.forEach((z, j) => {
        z.setAttribute("aria-selected", String(i === j));
        z.tabIndex = i === j ? 0 : -1;
        karty[j].hidden = i !== j;
      });
      if (przenies) { zakladki[i].focus(); }
    };

    zakladki.forEach((z, i) => {
      z.addEventListener("click", () => pokaz(i, false));
      z.addEventListener("keydown", (e) => {
        const skok = { ArrowRight: 1, ArrowLeft: -1, Home: -zakladki.length, End: zakladki.length }[e.key];
        if (skok === undefined) return;
        e.preventDefault();
        pokaz(Math.min(Math.max(i + skok, 0), zakladki.length - 1), true);
      });
    });
    pokaz(0, false);
    pasek.classList.add("gotowe");
  }
}
