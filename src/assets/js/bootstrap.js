const rejestr = {
  cyrkiel: () => import("./modules/cyrkiel.js"),
  rejs: () => import("./modules/rejs.js"),
  szyfr: () => import("./modules/szyfr.js"),
  gnomon: () => import("./modules/gnomon.js")
};

for (const el of document.querySelectorAll("[data-modul]")) {
  const nazwa = el.dataset.modul;
  const wczytaj = rejestr[nazwa];
  if (!wczytaj) continue;
  wczytaj()
    .then((m) => m.default(el))
    .catch((e) => degraduj(el, nazwa, e));
}

function degraduj(el, nazwa, e) {
  el.classList.add("bez-js");
  const p = document.createElement("p");
  p.className = "note uwaga";
  p.textContent = `Przyrząd „${nazwa}" nie uruchomił się w tej przeglądarce. Opis tekstowy poniżej pozostaje pełny.`;
  el.append(p);
  console.error(nazwa, e);
}
