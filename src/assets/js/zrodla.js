// Źródło otwiera się w okienku nad stroną. Odnośnik pozostaje zwykłym odnośnikiem:
// bez skryptu, w nowej karcie lub po kliknięciu środkowym przyciskiem działa jak dotąd.
const NAPISY = {
  pl: { zamknij: "Zamknij", nowa: "Otwórz w nowej karcie", ladowanie: "Wczytywanie skanu…" },
  en: { zamknij: "Close", nowa: "Open in a new tab", ladowanie: "Loading the scan…" }
};

export default function init() {
  const odnosniki = document.querySelectorAll("a.zrodlo[data-osadzenie]");
  if (!odnosniki.length || !window.HTMLDialogElement) return;
  const n = NAPISY[document.documentElement.lang] || NAPISY.pl;

  const okno = document.createElement("dialog");
  okno.className = "okno-zrodla";
  okno.innerHTML = `<div class="okno-pasek">
      <span class="okno-opis"></span>
      <a class="okno-nowa" target="_blank" rel="noopener">${n.nowa}</a>
      <button class="okno-zamknij" aria-label="${n.zamknij}">×</button>
    </div>
    <div class="okno-tresc"><p class="okno-ladowanie">${n.ladowanie}</p></div>`;
  document.body.append(okno);

  const tresc = okno.querySelector(".okno-tresc");
  okno.querySelector(".okno-zamknij").addEventListener("click", () => okno.close());
  okno.addEventListener("close", () => { tresc.innerHTML = `<p class="okno-ladowanie">${n.ladowanie}</p>`; });
  okno.addEventListener("click", (e) => { if (e.target === okno) okno.close(); });

  for (const a of odnosniki) {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      okno.querySelector(".okno-opis").textContent = a.dataset.opis || "";
      okno.querySelector(".okno-nowa").href = a.href;
      const ramka = document.createElement("iframe");
      ramka.src = a.dataset.osadzenie;
      ramka.title = a.dataset.opis || a.textContent;
      ramka.loading = "lazy";
      tresc.replaceChildren(ramka);
      okno.showModal();
    });
  }
}
