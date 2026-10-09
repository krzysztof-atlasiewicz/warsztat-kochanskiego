// Dymki objaśniające. Znacznik title jest mały, pojawia się z opóźnieniem,
// nie działa na ekranie dotykowym i znika przy najmniejszym ruchu. Ten tu jest
// czytelnym polem tekstu, zapalanym najechaniem, dotknięciem albo klawiaturą.
//
// Obsługa jest delegowana na cały dokument, więc dymek bierze się z najbliższego
// przodka z atrybutem data-dymek. Dzięki temu dymki mogą się zagnieżdżać:
// ściana ma swój, każda tarcza na niej swój własny, a wyjście z tarczy wraca
// do ściany zamiast gasić wszystko.
const MARGINES = 10;
// Przy dużych obszarach — ścianie, karcie — dymek pod całym blokiem lądowałby
// daleko od tego, na co patrzysz, więc idzie za kursorem.
const DUZY = { szer: 420, wys: 240 };

export default function init() {
  if (!document.querySelector("[data-dymek]")) return;

  const pole = document.createElement("div");
  pole.className = "dymek-plywajacy";
  pole.setAttribute("role", "tooltip");
  pole.hidden = true;
  document.body.append(pole);

  let biezacy = null;
  let kursor = { x: 0, y: 0 };

  const ustaw = (el, wymus = false) => {
    if (el === biezacy && !wymus) return;
    biezacy = el;
    if (!el) { pole.hidden = true; return; }
    pole.textContent = el.dataset.dymek;
    pole.hidden = false;
    const rr = el.getBoundingClientRect();
    const duzy = rr.width > DUZY.szer || rr.height > DUZY.wys;
    const r = duzy
      ? { left: kursor.x, right: kursor.x, top: kursor.y, bottom: kursor.y, width: 0, height: 0 }
      : rr;
    const p = pole.getBoundingClientRect();
    // Pod elementem, a gdy brakuje miejsca — nad nim. Poziomo wyśrodkowany,
    // ale nigdy poza oknem.
    let gora = r.bottom + MARGINES;
    if (gora + p.height > window.innerHeight - MARGINES) {
      gora = Math.max(MARGINES, r.top - p.height - MARGINES);
    }
    const lewo = Math.min(
      Math.max(MARGINES, r.left + r.width / 2 - p.width / 2),
      window.innerWidth - p.width - MARGINES
    );
    pole.style.transform = `translate(${Math.round(lewo)}px, ${Math.round(gora)}px)`;
  };

  const zNajblizszego = (cel) =>
    cel instanceof Element ? cel.closest("[data-dymek]") : null;

  document.addEventListener("pointerover", (e) => {
    kursor = { x: e.clientX, y: e.clientY };
    ustaw(zNajblizszego(e.target));
  });
  document.addEventListener("focusin", (e) => ustaw(zNajblizszego(e.target)));
  document.addEventListener("focusout", () => ustaw(null));
  document.addEventListener("click", (e) => ustaw(zNajblizszego(e.target)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") ustaw(null); });
  // Przewinięcie strony nie gasi dymka — przesuwa go za elementem. Gaśnie
  // dopiero, gdy element wyjedzie poza okno.
  const przesun = () => {
    if (!biezacy) return;
    const r = biezacy.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) { ustaw(null); return; }
    ustaw(biezacy, true);
  };
  window.addEventListener("scroll", przesun, { passive: true });
  window.addEventListener("resize", przesun);

  // Elementy z dymkiem muszą dać się osiągnąć klawiaturą, inaczej objaśnienie
  // istnieje tylko dla myszy. Te, które już są sterownikami, mają to z siebie.
  for (const el of document.querySelectorAll("[data-dymek]")) {
    el.setAttribute("aria-description", el.dataset.dymek);
    if (el.matches("button, a, input, select, textarea, [tabindex]")) continue;
    if (el.querySelector("button, a, input, select, textarea")) continue;
    el.setAttribute("tabindex", "0");
  }
}
