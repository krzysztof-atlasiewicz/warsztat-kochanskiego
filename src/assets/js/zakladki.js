// Zakładki strony przyrządu. Bez skryptu wszystkie karty są widoczne jedna pod
// drugą — dopiero tutaj zwijamy je do jednej i wiążemy z paskiem zakładek.
export default function init() {
  for (const pasek of document.querySelectorAll(".zakladki")) {
    const zakladki = [...pasek.querySelectorAll('[role="tab"]')];
    const karty = zakladki.map((z) => document.getElementById(z.getAttribute("aria-controls")));
    if (karty.some((k) => !k)) continue;

    // Karty są różnej wysokości: „Pytania otwarte" mieszczą się w ćwiartce
    // tego, co zajmuje przyrząd. Przy przełączeniu strona nagle się kurczyła
    // i widok podskakiwał — stąd wrażenie migania. Zamiast tego mierzymy
    // wszystkie karty, dopóki jeszcze stoją jedna pod drugą, i zadajemy
    // każdej wysokość najwyższej. Układ strony przestaje wtedy zależeć od
    // tego, która zakładka jest wybrana.
    const wyrownaj = () => {
      for (const k of karty) k.style.minHeight = "";
      const ukryte = karty.map((k) => k.hidden);
      for (const k of karty) k.hidden = false;
      const najwyzsza = Math.max(...karty.map((k) => k.offsetHeight));
      karty.forEach((k, j) => { k.hidden = ukryte[j]; });
      if (najwyzsza > 0) for (const k of karty) k.style.minHeight = `${Math.ceil(najwyzsza)}px`;
    };

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
    // „gotowe" najpierw, dopiero potem pomiar: dopóki tej klasy nie ma, arkusz
    // chowa karty poza pierwszą i zmierzylibyśmy same zera.
    pasek.classList.add("gotowe");
    wyrownaj();

    // Po zmianie szerokości okna tekst łamie się inaczej, więc miarę trzeba
    // wziąć na nowo. Przyrządy dorysowują się po starcie modułów, stąd jeszcze
    // jeden pomiar po załadowaniu wszystkiego.
    let oczekuje = 0;
    const przemierz = () => {
      clearTimeout(oczekuje);
      oczekuje = setTimeout(wyrownaj, 160);
    };
    window.addEventListener("resize", przemierz);
    window.addEventListener("load", przemierz);
  }
}
