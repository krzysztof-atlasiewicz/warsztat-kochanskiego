// Pola przewijane w poziomie: ściana zegarowa i karta kursowa. Na telefonie
// treść jest szersza niż ekran — ściany widać 280 punktów z 620 — a sam fakt,
// że da się przewinąć, nie jest nijak widoczny: pasek przewijania bywa
// schowany, a ucięta krawędź wygląda jak krawędź rysunku, nie jak zapowiedź
// dalszej części.
//
// Stąd dwie rzeczy. Cieniowanie tej krawędzi, po której jeszcze coś jest, bo
// to jedyna oznaka, jaką widz dostaje przed pierwszym przewinięciem. I widok
// ustawiony na środku, nie na lewym brzegu, bo w środku stoi rzecz
// najważniejsza: tarcza godzin równych na ścianie, kurs okrętu na karcie.
// Lewy brzeg ściany to samo niebo.
export default function init() {
  for (const pole of document.querySelectorAll(".przewijalna")) {
    let ruszone = false;
    for (const zdarzenie of ["pointerdown", "wheel", "keydown", "touchstart"])
      pole.addEventListener(zdarzenie, () => { ruszone = true; }, { passive: true });

    const zapas = () => pole.scrollWidth - pole.clientWidth;

    const oznacz = () => {
      const z = zapas();
      pole.classList.toggle("ma-lewo", z > 2 && pole.scrollLeft > 2);
      pole.classList.toggle("ma-prawo", z > 2 && pole.scrollLeft < z - 2);
    };

    // Na środek tylko dopóki widz sam niczego nie ruszył: przesunięcie widoku
    // pod ręką byłoby gorsze niż zły widok początkowy.
    const naSrodek = () => {
      const z = zapas();
      if (!ruszone && z > 2 && pole.scrollLeft === 0) pole.scrollLeft = Math.round(z / 2);
      oznacz();
    };

    pole.addEventListener("scroll", oznacz, { passive: true });
    window.addEventListener("resize", oznacz);
    naSrodek();
    // Przyrządy dorysowują się po starcie modułów, więc szerokość treści bywa
    // znana dopiero po załadowaniu wszystkiego.
    window.addEventListener("load", naSrodek);
  }
}
