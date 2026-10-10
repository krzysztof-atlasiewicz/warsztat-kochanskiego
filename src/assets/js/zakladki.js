// Zakładki strony przyrządu. Bez skryptu wszystkie karty są widoczne jedna pod
// drugą — dopiero tutaj zwijamy je do jednej i wiążemy z paskiem zakładek.
export default function init() {
  for (const pasek of document.querySelectorAll(".zakladki")) {
    const zakladki = [...pasek.querySelectorAll('[role="tab"]')];
    const karty = zakladki.map((z) => document.getElementById(z.getAttribute("aria-controls")));
    if (karty.some((k) => !k)) continue;

    // Dlaczego widok podskakiwał przy przełączeniu zakładki.
    //
    // Pasek stoi w dokumencie nad kartami, więc podmiana karty nie rusza go
    // z miejsca. Ruch miał jedno źródło: karta krótsza od poprzedniej skracała
    // dokument poniżej bieżącego przewinięcia, a przeglądarka dociągała
    // przewinięcie do nowego dna — i wszystko, na co widz patrzył, zjeżdżało.
    //
    // Dawniej dokładaliśmy każdej karcie wysokość najwyższej. Skok gasło, ale
    // ceną była pustka: na telefonie dwa zdania w „Pytaniach otwartych"
    // dostawały 2224 punkty papieru przy 118 punktach treści, a na stronie
    // szyfru dopełnienie brał też sam przyrząd, bo najwyższa była trzecia
    // karta. Wyrównywaliśmy wysokość dokumentu, choć problemem było
    // przewinięcie.
    //
    // Teraz dopełniamy wyłącznie niedobór — tyle, ile brakuje, żeby bieżące
    // przewinięcie zostało w mocy. Przy widoku od góry, czyli w zdecydowanie
    // najczęstszym przypadku, nie dokładamy ani jednego punktu.
    let dopelnienie = 0;
    let dopelniona = null;

    // Nie „scrollHeight": ta miara nigdy nie podaje mniej niż wysokość okna,
    // więc przy krótkiej karcie zgłaszała dokument wyższy, niż jest naprawdę,
    // i niedobór wychodził za mały — na szerokim ekranie zostawało 64 punkty
    // skoku. Prostokąt treści mówi prawdę także wtedy, gdy treść jest niższa
    // od okna.
    const dnoTresci = () => document.body.getBoundingClientRect().bottom + window.scrollY;

    const zabezpiecz = (karta, y) => {
      for (const k of karty) k.style.minHeight = "";
      dopelnienie = 0;
      dopelniona = null;
      const brak = y + window.innerHeight - dnoTresci();
      if (brak > 0) {
        dopelnienie = Math.ceil(brak);
        dopelniona = karta;
        karta.style.minHeight = `${karta.offsetHeight + dopelnienie}px`;
      }
      // Jeśli przeglądarka zdążyła dociągnąć przewinięcie, zanim dopełniliśmy
      // dokument, wracamy tam, gdzie widz był.
      if (window.scrollY !== y) window.scrollTo(0, y);
    };

    // Dopełnienie jest potrzebne tylko tak długo, jak długo widz jest nisko.
    // Oddajemy je, gdy skrócenie dokumentu nie może już niczego dociągnąć,
    // czyli gdy bieżące przewinięcie mieści się w tym, co dokument wytrzyma
    // bez dopełnienia. Przy widoku od góry mieści się zawsze — także wtedy,
    // gdy treść jest niższa od okna i przewijać nie ma czego.
    const zwolnij = () => {
      if (!dopelnienie || !dopelniona) return;
      const bezDopelnienia = dnoTresci() - dopelnienie;
      if (window.scrollY <= Math.max(0, bezDopelnienia - window.innerHeight)) {
        dopelniona.style.minHeight = "";
        dopelnienie = 0;
        dopelniona = null;
      }
    };

    const pokaz = (i, przenies, zachowajWidok = true) => {
      const y = window.scrollY;
      zakladki.forEach((z, j) => {
        z.setAttribute("aria-selected", String(i === j));
        z.tabIndex = i === j ? 0 : -1;
        karty[j].hidden = i !== j;
      });
      if (zachowajWidok) zabezpiecz(karty[i], y);
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
    // Pierwsze wywołanie niczego nie zachowuje: nie ma jeszcze widoku, który
    // mógłby uciec, a dopełnienie przy pustym jeszcze dokumencie byłoby
    // zarezerwowaniem miejsca na nic.
    pokaz(0, false, false);
    pasek.classList.add("gotowe");

    window.addEventListener("scroll", zwolnij, { passive: true });
    // Zmiana szerokości okna to nowy układ i nowe łamanie wierszy. Stare
    // dopełnienie opisuje dokument, którego już nie ma.
    window.addEventListener("resize", () => {
      if (!dopelniona) return;
      dopelniona.style.minHeight = "";
      dopelnienie = 0;
      dopelniona = null;
    });
  }
}
