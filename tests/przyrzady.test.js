// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const STRONY = [
  { plik: "_site/pl/cyrkiel/index.html", modul: "cyrkiel", sprawdz: ["w1", "w2", "w3"] },
  { plik: "_site/en/compass/index.html", modul: "cyrkiel", sprawdz: ["w1", "w2", "w3"] },
  { plik: "_site/pl/wahadlo/index.html", modul: "rejs", sprawdz: ["kw", "ks", "szer"] },
  { plik: "_site/en/pendulum/index.html", modul: "rejs", sprawdz: ["kw", "ks", "szer"] },
  { plik: "_site/pl/szyfr/index.html", modul: "szyfr", sprawdz: ["szyfrogram"] },
  { plik: "_site/en/cipher/index.html", modul: "szyfr", sprawdz: ["szyfrogram"] },
  { plik: "_site/pl/gnomon/index.html", modul: "gnomon", sprawdz: ["rowne", "wloskie", "babilonskie"] },
  { plik: "_site/en/gnomon/index.html", modul: "gnomon", sprawdz: ["rowne", "wloskie", "babilonskie"] }
];

const zbudowane = existsSync("_site");

describe.skipIf(!zbudowane)("przyrządy na zbudowanych stronach", () => {
  beforeAll(() => { globalThis.document = document; });

  for (const s of STRONY) {
    it(`${s.plik} — moduł ${s.modul} wypełnia odczyty`, async () => {
      document.body.innerHTML = readFileSync(s.plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const root = document.querySelector("[data-modul]");
      expect(root, "brak elementu z data-modul").toBeTruthy();
      const m = await import(`../src/assets/js/modules/${s.modul}.js`);
      m.default(root);
      for (const id of s.sprawdz) {
        const el = root.querySelector(`#${id}`);
        expect(el, `brak elementu #${id}`).toBeTruthy();
        const tresc = ("value" in el && el.tagName !== "DIV" ? el.value : el.textContent).trim();
        expect(tresc, `#${id} pozostał pusty`).not.toBe("");
        expect(tresc, `#${id} nie został wypełniony`).not.toBe("—");
      }
    });
  }
});

// Układ pulpitu gnomonu był przedmiotem osobnych poprawek: legenda zegarka pod
// przełącznikiem analemmy, wybór dnia i miesiąca na kartce kalendarza, dymek
// przy samym Słońcu. Te trzy rzeczy łatwo rozjechać przy kolejnej zmianie CSS,
// więc pilnuje ich test, a nie tylko oko.
describe.skipIf(!zbudowane)("pulpit gnomonu", () => {
  for (const plik of ["_site/pl/gnomon/index.html", "_site/en/gnomon/index.html"]) {
    it(`${plik} — legenda zegarka stoi pod przełącznikiem analemmy`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const blok = document.querySelector(".blok-objasnien");
      expect(blok, "brak bloku objaśnień").toBeTruthy();
      const przelacznik = blok.querySelector('[role="switch"]');
      const odczyt = blok.querySelector(".odczyt-zegara");
      expect(przelacznik, "przełącznik analemmy nie jest w bloku objaśnień").toBeTruthy();
      expect(odczyt, "legenda zegarka nie jest w bloku objaśnień").toBeTruthy();
      expect(
        przelacznik.compareDocumentPosition(odczyt) & Node.DOCUMENT_POSITION_FOLLOWING,
        "legenda nie stoi po przełączniku"
      ).toBeTruthy();
    });

    it(`${plik} — wybór dnia i miesiąca siedzi na kartce kalendarza`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const kartka = document.querySelector("figure.blok-daty");
      expect(kartka, "brak kartki kalendarza").toBeTruthy();
      const pola = kartka.querySelectorAll(".pola-daty select");
      expect(pola.length, "oba pola daty mają być na kartce").toBe(2);
      // Data na kartce nie jest rysowanym tekstem obok nastawników.
      expect(kartka.querySelector("#kalDzien"), "został osobny napis z dniem").toBeFalsy();
      expect(kartka.querySelector("#kalMiesiac"), "został osobny napis z miesiącem").toBeFalsy();
      expect(kartka.querySelector("#bebenDnia"), "brak miejsca na bębenek dnia").toBeTruthy();
      expect(kartka.querySelector("#bebenMiesiaca"), "brak miejsca na bębenek miesiąca").toBeTruthy();
      for (const p of pola) {
        expect(p.getAttribute("aria-label"), "pole daty bez nazwy dostępnej").toBeTruthy();
        expect(p.dataset.dymek, "pole daty bez dymka").toBeTruthy();
      }
    });

    it(`${plik} — zastrzeżenie o czasie urzędowym stoi pod legendą zegarka`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const blok = document.querySelector(".blok-objasnien");
      const uwaga = blok.querySelector(".uwaga-urzedowa");
      const odczyt = blok.querySelector(".odczyt-zegara");
      expect(uwaga, "uwaga o czasie urzędowym nie jest w kolumnie objaśnień").toBeTruthy();
      expect(
        odczyt.compareDocumentPosition(uwaga) & Node.DOCUMENT_POSITION_FOLLOWING,
        "uwaga nie stoi pod legendą"
      ).toBeTruthy();
    });

    it(`${plik} — kartka kalendarza jest tej samej wysokości co zegarek`, () => {
      const html = readFileSync(plik, "utf8");
      const vb = (klasa) => {
        const m = new RegExp(`viewBox="0 0 (\\d+) (\\d+)"[^>]*class="${klasa}`).exec(html);
        expect(m, `brak viewBoksa dla .${klasa}`).toBeTruthy();
        return { w: Number(m[1]), h: Number(m[2]) };
      };
      const css = readFileSync("src/assets/css/site.css", "utf8");
      const szer = (regula) => Number(new RegExp(`${regula}\\{[^}]*?width:(\\d+)px`).exec(css)[1]);
      // Szerokość kartki stoi w zmiennej, bo biorą ją z niej dwie reguły naraz.
      const szerKartki = Number(/--kartka:(\d+)px/.exec(css)[1]);
      const kartka = vb("kartka"), zegar = vb("tarcza-mechaniczna");
      const wysKartki = (szerKartki * kartka.h) / kartka.w;
      const wysZegara = (szer("\\.tarcza-mechaniczna") * zegar.h) / zegar.w;
      expect(Math.abs(wysKartki - wysZegara), `kartka ${wysKartki} px, zegarek ${wysZegara} px`).toBeLessThan(1);
    });

    it(`${plik} — datę nastawia bębenek, nie rozwijana lista`, async () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const root = document.querySelector("[data-modul]");
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      expect(root.classList.contains("z-bebnami"), "pola wyboru nie zostały zastąpione").toBe(true);
      for (const id of ["bebenDnia", "bebenMiesiaca"]) {
        const b = root.querySelector(`#${id}`);
        expect(b.getAttribute("role"), `#${id} nie jest nastawnikiem`).toBe("spinbutton");
        expect(b.getAttribute("aria-valuetext"), `#${id} bez odczytanej wartości`).toMatch(/\S/);
        expect(b.getAttribute("tabindex"), `#${id} nieosiągalny klawiaturą`).toBe("0");
        // Wartość bieżąca plus dwie sąsiednie widoczne przez okienko.
        expect(b.querySelectorAll("text").length, `#${id} nie pokazuje sąsiednich wartości`).toBe(3);
      }
    });

    it(`${plik} — Słońce samo niesie swój dymek i pole chwytu`, async () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const root = document.querySelector("[data-modul]");
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      const slonce = root.querySelector("#slonce");
      expect(slonce, "brak Słońca").toBeTruthy();
      expect(slonce.dataset.dymek, "Słońce bez dymka").toMatch(/\S/);
      expect(slonce.querySelector("circle.pole-chwytu"), "Słońce bez pola chwytu").toBeTruthy();
    });
  }
});

// Poprawki z cyklu 37 dotknęły czterech stron naraz. Każda z nich jest łatwa
// do cofnięcia przy następnej zmianie układu, więc każda ma tu swój warunek.
describe.skipIf(!zbudowane)("poprawki czytelności", () => {
  const wczytaj = (plik) => {
    document.body.innerHTML = readFileSync(plik, "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    return document.querySelector("[data-modul]");
  };

  for (const plik of ["_site/pl/gnomon/index.html", "_site/en/gnomon/index.html"]) {
    it(`${plik} — groty bębenka stoją po lewej i nie noszą dymka`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      const groty = root.querySelectorAll(".beben-groty");
      expect(groty.length, "brak grotów przy bębenkach").toBe(2);
      for (const g of groty) {
        expect(g.hasAttribute("data-bez-dymka"), "groty przepuszczają dymek kartki").toBe(true);
        expect(g.closest("[data-dymek]"), "groty siedzą w środku bębenka").not.toBe(
          g.previousElementSibling
        );
      }
      // Rysunek strzały i jej pole chwytu to dwie różne rzeczy i mierzy się je
      // osobno: strzała ma stać tam, gdzie się jej szuka, a pole chwytu ma być
      // na tyle duże, żeby palec w nie trafił. Dawniej jeden test pilnował
      // obojga przez położenie prostokąta — i przez to nie pozwalał go
      // powiększyć, bo każde powiększenie wyglądało jak przesunięcie strzały.
      const beben = root.querySelector("#bebenDnia");
      const okno = beben.querySelector("rect");
      const x0 = Number(okno.getAttribute("x")), szer = Number(okno.getAttribute("width"));
      const kartka = root.querySelector("svg.kartka");
      const [, , szerKartki] = kartka.getAttribute("viewBox").split(" ").map(Number);

      // Jedna strzała narysowana po lewej stronie okienka, druga po prawej.
      const srodkiStrzal = [...root.querySelectorAll("#bebenDnia + .beben-groty .beben-grot")]
        .map((s) => {
          const l = s.querySelector(".strzala-drzewce");
          return (Number(l.getAttribute("x1")) + Number(l.getAttribute("x2"))) / 2;
        });
      expect(srodkiStrzal.length, "bębenek dnia nie ma dwóch strzał").toBe(2);
      expect(Math.min(...srodkiStrzal), "strzała nie stoi po lewej stronie okienka").toBeLessThan(x0);
      expect(Math.max(...srodkiStrzal), "strzała nie stoi po prawej stronie okienka")
        .toBeGreaterThan(x0 + szer);

      // Pole chwytu: dość duże, nie zachodzące na bębenek, w granicach kartki.
      // Kartka ma 160 jednostek szerokości i rysuje się na 150 punktach przy
      // szerokim oknie oraz na 190 przy wąskim, więc jednostka to 0,94 albo
      // 1,19 punktu. Progi 32 × 40 jednostek dają najmniej 30 × 38 punktów —
      // powyżej wymaganych 24 w obu wymiarach, a na telefonie 43 × 52.
      for (const s of root.querySelectorAll(".beben-groty .beben-grot")) {
        const r = s.querySelector("rect.pole-chwytu");
        const x = Number(r.getAttribute("x")), w = Number(r.getAttribute("width"));
        const y = Number(r.getAttribute("y")), h = Number(r.getAttribute("height"));
        expect(w, "pole chwytu strzały za wąskie na palec").toBeGreaterThanOrEqual(32);
        expect(h, "pole chwytu strzały za niskie na palec").toBeGreaterThanOrEqual(40);
        expect(x, "pole chwytu wychodzi poza lewą krawędź kartki").toBeGreaterThanOrEqual(0);
        expect(x + w, "pole chwytu wychodzi poza prawą krawędź kartki")
          .toBeLessThanOrEqual(szerKartki);
        // Zachodząc na okienko, pole chwytu zabierałoby bębenkowi ciągnięcie.
        const nachodzi = x < x0 + szer && x + w > x0;
        expect(nachodzi, "pole chwytu zachodzi na okienko bębenka").toBe(false);
        expect(y, "pole chwytu wychodzi ponad kartkę").toBeGreaterThanOrEqual(0);
        expect(h, "pole chwytu nie jest wyższe niż rysunek strzały").toBeGreaterThan(14);
      }
      // Pola chwytu obu bębenków nie mogą na siebie nachodzić — inaczej
      // strzałka miesiąca zabierałaby kliknięcia strzałce dnia.
      const pola = [...root.querySelectorAll(".beben-groty .beben-grot rect.pole-chwytu")]
        .map((r) => ({ y: Number(r.getAttribute("y")), h: Number(r.getAttribute("height")),
                       x: Number(r.getAttribute("x")) }));
      for (const a of pola) for (const b of pola) {
        if (a === b || a.x !== b.x) continue;
        const nachodzi = a.y < b.y + b.h && a.y + a.h > b.y;
        if (a.y !== b.y) expect(nachodzi, "pola chwytu obu bębenków nachodzą na siebie").toBe(false);
      }
      // Strzała ma być strzałą: drzewce, grot i lotki.
      for (const s of root.querySelectorAll("#bebenDnia + .beben-groty .beben-grot")) {
        expect(s.querySelector(".strzala-drzewce"), "strzała bez drzewca").toBeTruthy();
        expect(s.querySelector(".strzala-grot"), "strzała bez grotu").toBeTruthy();
        expect(s.querySelector(".strzala-lotki"), "strzała bez lotek").toBeTruthy();
      }
    });

    it(`${plik} — grot przestawia dzień`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/gnomon.js");
      m.default(root);
      const przed = root.querySelector("#dzien").value;
      root.querySelectorAll("#bebenDnia + .beben-groty .beben-grot")[1]
        .dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
      expect(root.querySelector("#dzien").value, "kliknięcie grotu nic nie zmieniło").not.toBe(przed);
    });
  }

  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — wykres błędu jest wkreślony w kartę, nie stoi obok niej`, async () => {
      const root = wczytaj(plik);
      expect(root.querySelector("#eWahadlo"), "osobny wykres błędu nie zniknął").toBeFalsy();
      const m = await import("../src/assets/js/modules/rejs.js");
      m.default(root);
      expect(root.querySelectorAll("svg.karta .slad-bledu").length,
        "na karcie brakuje śladów obu zegarów").toBe(2);
    });

    it(`${plik} — w porcie podpis „tu jesteś" ustępuje nazwie portu`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/rejs.js");
      m.default(root);
      const podpisy = () => [...root.querySelectorAll("#pozycje text")].map((t) => t.textContent);
      const tu = root.querySelector("[data-napisy]")
        ? JSON.parse(root.querySelector("[data-napisy]").dataset.napisy).tuJestes : "tu jesteś";
      expect(podpisy().some((t) => t === tu), "w porcie docelowym podpis został").toBe(false);
      const d = root.querySelector("#dzien");
      d.value = "40";
      d.dispatchEvent(new window.Event("input", { bubbles: true }));
      expect(podpisy().some((t) => t === tu), "na pełnym morzu podpisu zabrakło").toBe(true);
    });

    it(`${plik} — koło sterowe stoi między kalendarzem a okrętem`, () => {
      const root = wczytaj(plik);
      const kolo = root.querySelector("#rejsStart.kolo-sterowe");
      expect(kolo, "przycisk nie jest kołem sterowym").toBeTruthy();
      const bloki = [...root.querySelectorAll(".pulpit-sterowniki > *")];
      expect(bloki.indexOf(kolo.closest(".blok-kola")), "koło nie stoi na drugim miejscu").toBe(1);
      expect(bloki[0].classList.contains("blok-daty")).toBe(true);
      expect(bloki[2].classList.contains("blok-okretu")).toBe(true);
    });

    it(`${plik} — termometr tłumaczy się dymkiem`, () => {
      const root = wczytaj(plik);
      const term = root.querySelector(".rzad-mapy .przyrzad-boczny[data-dymek]");
      expect(term, "termometr bez dymka").toBeTruthy();
      expect(term.dataset.dymek.length, "dymek termometru jest pusty").toBeGreaterThan(40);
    });
  }

  for (const [plik, etykieta] of [["_site/pl/cyrkiel/index.html", "Konstrukcja"],
                                  ["_site/en/compass/index.html", "Construction"]]) {
    it(`${plik} — pierwsza zakładka to „${etykieta}", a wyprowadzenie stoi otworem`, () => {
      const root = wczytaj(plik);
      expect(root.querySelector("#z-przyrzad").textContent.trim(),
        "pierwsza zakładka dalej nazywa się jak przyrząd").toBe(etykieta);
      expect(root.querySelector("details.wyprowadzenie"), "wyprowadzenie dalej się rozwija").toBeFalsy();
      expect(root.querySelector("section.wyprowadzenie h3"), "wyprowadzenie bez nagłówka").toBeTruthy();
    });
  }

  for (const plik of ["_site/pl/szyfr/index.html", "_site/en/cipher/index.html"]) {
    it(`${plik} — instrukcja pierścienia stoi obok nastawy`, () => {
      const root = wczytaj(plik);
      const nastawa = root.querySelector(".szyfr-nastawa");
      expect(nastawa, "brak pola nastawy").toBeTruthy();
      expect(nastawa.querySelector(".szyfr-tarcza #tarcza"), "tarcza poza polem nastawy").toBeTruthy();
      expect(nastawa.querySelector(".tarcza-podpowiedz"), "instrukcja poza polem nastawy").toBeTruthy();
    });
  }
});

// Oznaczenia statusu wersji mają tłumaczyć się same, a przełączenie zakładki
// nie ma ruszać widoku — ale też nie ma za to płacić pustym papierem.
// Pierwsze da się sprawdzić w dokumencie, drugie trzeba policzyć: ile
// dokładamy i kiedy to oddajemy.
describe.skipIf(!zbudowane)("oznaczenia i zakładki", () => {
  const STRONY = ["_site/pl/cyrkiel/index.html", "_site/pl/wahadlo/index.html",
                  "_site/pl/szyfr/index.html", "_site/pl/gnomon/index.html",
                  "_site/en/compass/index.html", "_site/en/pendulum/index.html",
                  "_site/en/cipher/index.html", "_site/en/gnomon/index.html"];

  for (const plik of STRONY) {
    it(`${plik} — każde oznaczenie tłumaczy się dymkiem`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const tagi = [...document.querySelectorAll(".tagi .tag")];
      expect(tagi.length, "strona bez oznaczeń statusu").toBe(2);
      for (const t of tagi) {
        expect(t.dataset.dymek, `oznaczenie „${t.textContent}" bez objaśnienia`).toBeTruthy();
        expect(t.dataset.dymek.length, `objaśnienie „${t.textContent}" jest zdawkowe`).toBeGreaterThan(60);
      }
      // Para czyta się jako zdanie: pierwszy człon stały, drugi nazywa to,
      // co dopowiadamy od siebie — i na każdej stronie nazywa co innego.
      expect(tagi[0].classList.contains("zrodlo"), "pierwsze oznaczenie nie jest źródłem").toBe(true);
      expect(tagi[0].textContent.trim(), "pierwszy człon pary zmienił brzmienie")
        .toMatch(/^(ze źródła|from the source)$/);
      expect(tagi[1].textContent.trim(), "drugi człon nie mówi, co jest nasze")
        .toMatch(/^(nasze|ours): \S/);
    });
  }

  // Przełączenie zakładki nie może ruszać widoku — i nie może za to płacić
  // pustym papierem. Dawniej każda karta dostawała wysokość najwyższej, więc
  // dwa zdania w „Pytaniach otwartych" rozpychały się na dwa tysiące punktów.
  // Teraz dopełniamy wyłącznie niedobór potrzebny, by bieżące przewinięcie
  // zostało w mocy — a przy widoku od góry nie dopełniamy wcale.
  const scenaZakladek = async (ustaw) => {
    document.body.innerHTML = readFileSync(STRONY[0], "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    // jsdom nie liczy układu, więc wymiary podstawiamy sami
    const karty = [...document.querySelectorAll('[role="tabpanel"]')];
    expect(karty.length, "brak kart na stronie przyrządu").toBe(3);
    karty.forEach((k, i) => Object.defineProperty(k, "offsetHeight", { get: () => [900, 400, 150][i] }));
    ustaw();
    const m = await import("../src/assets/js/zakladki.js");
    m.default();
    return { karty, zakladki: [...document.querySelectorAll('[role="tab"]')] };
  };

  // „wysokoscDokumentu" to dno treści liczone od początku dokumentu. Moduł
  // bierze je z prostokąta treści, nie ze „scrollHeight", bo ta druga miara
  // nigdy nie podaje mniej niż wysokość okna i przy krótkiej karcie kłamie.
  const udajOkno = ({ y, wysokoscOkna, wysokoscDokumentu }) => {
    Object.defineProperty(window, "scrollY", { get: () => y, configurable: true });
    Object.defineProperty(window, "innerHeight", { get: () => wysokoscOkna, configurable: true });
    document.body.getBoundingClientRect = () => ({ bottom: wysokoscDokumentu - y });
    window.scrollTo = () => {};
  };

  it("przy widoku od góry nie dopełnia kart ani o punkt", async () => {
    const { karty, zakladki } = await scenaZakladek(() =>
      udajOkno({ y: 0, wysokoscOkna: 768, wysokoscDokumentu: 2000 }));
    zakladki[2].click();
    for (const k of karty)
      expect(k.style.minHeight, "karta dostała pustą wysokość bez potrzeby").toBe("");
  });

  it("dopełnia tylko tyle, ile brakuje pod bieżącym przewinięciem", async () => {
    // Widz jest nisko: dno widoku na 2268, a krótsza karta kończy dokument
    // na 1800. Brakuje 468 — i dokładnie tyle wolno dołożyć, do wysokości
    // karty, która właśnie się pokazała (150).
    const { karty, zakladki } = await scenaZakladek(() =>
      udajOkno({ y: 1500, wysokoscOkna: 768, wysokoscDokumentu: 1800 }));
    zakladki[2].click();
    expect(karty[2].style.minHeight, "dopełnienie nie odpowiada niedoborowi").toBe("618px");
    expect(karty[0].style.minHeight, "karta nieaktywna nie powinna być dopełniana").toBe("");
    expect(karty[1].style.minHeight, "karta nieaktywna nie powinna być dopełniana").toBe("");
  });

  it("oddaje dopełnienie, gdy widz wróci na górę", async () => {
    const { karty, zakladki } = await scenaZakladek(() =>
      udajOkno({ y: 1500, wysokoscOkna: 768, wysokoscDokumentu: 1800 }));
    zakladki[2].click();
    expect(karty[2].style.minHeight, "brak dopełnienia do oddania").toBe("618px");
    // Po przewinięciu w górę treść i bez dopełnienia sięga dna widoku,
    // więc oddanie go nie może już niczego dociągnąć.
    udajOkno({ y: 100, wysokoscOkna: 768, wysokoscDokumentu: 2268 });
    window.dispatchEvent(new Event("scroll"));
    expect(karty[2].style.minHeight, "dopełnienie zostało na stałe").toBe("");
  });

  it("oddaje dopełnienie na górze także wtedy, gdy treść jest niższa od okna", async () => {
    // Tak wygląda strona szyfru na szerokim ekranie: karta „Pytania otwarte"
    // nie wypełnia nawet jednego widoku. Warunek oddania liczony przez dno
    // widoku nigdy by tu nie zaskoczył i dopełnienie zostawało na stałe.
    const { karty, zakladki } = await scenaZakladek(() =>
      udajOkno({ y: 782, wysokoscOkna: 900, wysokoscDokumentu: 772 }));
    zakladki[2].click();
    expect(karty[2].style.minHeight, "brak dopełnienia do oddania").not.toBe("");
    udajOkno({ y: 0, wysokoscOkna: 900, wysokoscDokumentu: 1682 });
    window.dispatchEvent(new Event("scroll"));
    expect(karty[2].style.minHeight, "dopełnienie zostało, choć nie ma czego przewijać").toBe("");
  });

  it("nie daje się zmylić dolnej granicy „scrollHeight”", async () => {
    // Przeglądarka nigdy nie podaje w „scrollHeight” mniej niż wysokość okna.
    // Moduł liczący niedobór z tej miary zgłaszał dokument wyższy, niż jest,
    // i zostawiał 64 punkty skoku na szerokim ekranie. Tu dno treści (772)
    // jest niższe od okna (900), a „scrollHeight” kłamie, że to 900 — pomiar
    // musi wziąć pierwsze, nie drugie.
    const { karty, zakladki } = await scenaZakladek(() => {
      udajOkno({ y: 782, wysokoscOkna: 900, wysokoscDokumentu: 772 });
      Object.defineProperty(document.documentElement, "scrollHeight",
        { get: () => 900, configurable: true });
    });
    zakladki[2].click();
    // niedobór = 782 + 900 − 772 = 910, karta ma 150 → 1060
    expect(karty[2].style.minHeight, "niedobór policzony ze zmyłkowej miary").toBe("1060px");
  });

  it("pierwsze wywołanie nie rezerwuje miejsca na nic", async () => {
    const { karty } = await scenaZakladek(() =>
      udajOkno({ y: 400, wysokoscOkna: 768, wysokoscDokumentu: 0 }));
    for (const k of karty)
      expect(k.style.minHeight, "karta dopełniona już przy starcie").toBe("");
  });
});

// Przełącznik języka ma być jednym nastawnikiem wskazującym język docelowy —
// tak jak na stronie głównej fundacji — a nie listą, w której jedna pozycja
// i tak jest bieżąca.
describe.skipIf(!zbudowane)("przełącznik języka", () => {
  for (const [plik, napis, cel] of [
    ["_site/pl/gnomon/index.html", "English", "/en/"],
    ["_site/en/gnomon/index.html", "polski", "/pl/"],
    ["_site/pl/index.html", "English", "/en/"],
    ["_site/en/index.html", "polski", "/pl/"]
  ]) {
    it(`${plik} — jeden nastawnik prowadzący na „${napis}"`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const odnosniki = [...document.querySelectorAll(".jez a")];
      expect(odnosniki.length, "przełącznik dalej wylicza oba języki").toBe(1);
      const a = odnosniki[0];
      expect(a.classList.contains("przelacz-jezyk"), "nastawnik bez swojej klasy").toBe(true);
      expect(a.textContent.trim(), "nastawnik nie nazywa języka docelowego").toBe(napis);
      expect(a.getAttribute("href"), "nastawnik prowadzi nie tam").toBe(cel);
      expect(a.getAttribute("hreflang"), "brak oznaczenia języka odnośnika").toBeTruthy();
    });
  }
});

// Strona przyrządu nie może najpierw narysować się ze wszystkimi kartami,
// a potem skurczyć — to był ten podskok przy przechodzeniu między przyrządami.
describe.skipIf(!zbudowane)("pierwszy rysunek strony", () => {
  const arkusz = readFileSync("src/assets/css/site.css", "utf8");

  it("arkusz chowa karty poza pierwszą, zanim moduł zdąży wystartować", () => {
    expect(arkusz, "brak reguły chowającej kolejne karty przed gotowością")
      .toMatch(/html\.js \.zakladki:not\(\.gotowe\) ~ \.karta-przyrzadu ~ \.karta-przyrzadu\{display:none\}/);
  });

  // HTML i arkusz leżą w pamięci podręcznej niezależnie, więc przeglądarka
  // potrafi mieć nowy arkusz i stary dokument bez wiersza nadającego „js".
  // Widoczność paska zakładek nie może od tego wiersza zależeć — raz już
  // zależała i pasek zniknął wszystkim, którzy mieli stronę w pamięci.
  it("widoczność paska zależy od modułu, nie od wiersza w nagłówku", () => {
    expect(arkusz, "pasek chowany przy braku klasy js — stary dokument straci zakładki")
      .not.toMatch(/html:not\(\.js\)[^{]*\.zakladki\{[^}]*display:none/);
    expect(arkusz, "brak reguły wiążącej pasek z gotowością modułu")
      .toMatch(/\.zakladki:not\(\.gotowe\)\{display:none\}/);
    // Nagłówki kart też znikają dopiero wtedy, gdy pasek je zastąpi.
    expect(arkusz, "nagłówki kart chowane bez względu na gotowość paska")
      .toMatch(/\.zakladki\.gotowe ~ \.karta-przyrzadu \.tytul-karty\{display:none\}/);
  });

  for (const plik of ["_site/pl/cyrkiel/index.html", "_site/en/compass/index.html"]) {
    it(`${plik} — klasa „js" nadawana przed arkuszem i z osobnego pliku`, () => {
      const h = readFileSync(plik, "utf8");
      const skrypt = h.indexOf('src="/assets/js/wczesnie.js"');
      const styl = h.indexOf('href="/assets/css/site.css');
      expect(skrypt, "brak skryptu nadającego klasę js").toBeGreaterThan(-1);
      expect(skrypt, "klasa js nadawana dopiero po arkuszu").toBeLessThan(styl);
      expect(h.slice(0, skrypt).includes("<body"), "skrypt stoi poza nagłówkiem").toBe(false);
      // Wpisany wprost w stronę zostałby na serwerze zablokowany przez politykę
      // bezpieczeństwa treści — i tak było przez pięć cykli, bez żadnego śladu.
      expect(h, "skrypt wpisany wprost w stronę zamiast osobnego pliku")
        .not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/);
    });
  }

  it("skrypt nadający klasę js robi dokładnie to i nic więcej", () => {
    const k = readFileSync("src/assets/js/wczesnie.js", "utf8");
    expect(k, "skrypt wczesny nie nadaje klasy").toMatch(/classList\.add\("js"\)/);
    expect(k.split("\n").filter((w) => w.trim() && !w.trim().startsWith("//")).length,
      "skrypt wczesny ma robić jedną rzecz — blokuje rysowanie strony").toBe(1);
  });
});

// Przejście między krokami konstrukcji nie może zmieniać wysokości strony:
// pole z suwakiem i odczytami odsłania się na ostatnim kroku, ale miejsce
// zajmuje od początku.
describe.skipIf(!zbudowane)("kroki konstrukcji cyrkla", () => {
  const arkusz = readFileSync("src/assets/css/site.css", "utf8");
  const modul = readFileSync("src/assets/js/modules/cyrkiel.js", "utf8");

  it("pole wyników jest przygaszane, nie usuwane z układu", () => {
    expect(modul, "moduł dalej chowa pole przez .hide")
      .not.toMatch(/classList\.toggle\("hide"/);
    expect(modul, "brak przygaszania pola wyników")
      .toMatch(/classList\.toggle\("przygaszony", krok !== 4\)/);
    expect(arkusz, "brak reguły trzymającej miejsce przygaszonego pola")
      .toMatch(/\.przygaszony\{visibility:hidden\}/);
    expect(arkusz, "pole wyników nie rezerwuje miejsca od pierwszej klatki")
      .toMatch(/html\.js #panel\.hide\{display:block;visibility:hidden\}/);
    expect(arkusz, "opis kroku nie rezerwuje dwóch wierszy")
      .toMatch(/#opis\{min-height:/);
  });

  for (const plik of ["_site/pl/cyrkiel/index.html", "_site/en/compass/index.html"]) {
    it(`${plik} — bez skryptu pole wyników pozostaje schowane`, () => {
      const h = readFileSync(plik, "utf8");
      expect(h, "pole wyników bez klasy hide byłoby widoczne bez skryptu")
        .toMatch(/<div id="panel" class="hide">/);
    });
  }
});

// Podmiana kroju pisma w locie przesuwała każdy wiersz o punkt — i to właśnie
// czytało się jako miganie przy przechodzeniu między przyrządami.
describe("kroje bez podmiany w locie", () => {
  it("arkusz krojów nie dopuszcza podmiany po pierwszym rysunku", () => {
    const f = readFileSync("src/assets/css/fonty.css", "utf8");
    expect(f, "kroje dalej podmieniają się w locie").not.toMatch(/font-display:\s*swap/);
    expect((f.match(/font-display:optional/g) || []).length, "nie wszystkie kroje są zamówione bezzwłocznie").toBe(6);
  });

  it.skipIf(!zbudowane)("każda strona zamawia kroje z góry", () => {
    for (const plik of ["_site/pl/cyrkiel/index.html", "_site/en/gnomon/index.html"]) {
      const h = readFileSync(plik, "utf8");
      const ile = (h.match(/<link rel="preload" as="font"/g) || []).length;
      expect(ile, `${plik}: kroje nie są zamawiane z góry`).toBe(6);
      expect(h, `${plik}: zamówienie kroju bez crossorigin nie zadziała`)
        .toMatch(/<link rel="preload" as="font" type="font\/woff2" crossorigin href="\/assets\/fonts\/[^"]+\.[0-9a-f]{8}\.woff2">/);
    }
  });

  it("pasek odwzorowania i wiersz pary liter rezerwują wysokość", () => {
    const a = readFileSync("src/assets/css/site.css", "utf8");
    expect(a, "pasek szyfru nie rezerwuje wysokości").toMatch(/\.pasek\{min-height:/);
    expect(a, "wiersz pary liter nie rezerwuje wysokości").toMatch(/#para\{min-height:/);
  });
});

// Akapit o przyrządach bocznych zniknął z kolumny objaśnień — ale zastrzeżenie
// o zagęszczonej podziałce nie ma prawa zginąć razem z nim.
describe.skipIf(!zbudowane)("przyrządy boczne wahadła", () => {
  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — każdy przyrząd boczny tłumaczy się sam`, () => {
      document.body.innerHTML = readFileSync(plik, "utf8")
        .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
      const boczne = [...document.querySelectorAll(".rzad-mapy .przyrzad-boczny")];
      expect(boczne.length, "spodziewane trzy przyrządy boczne").toBe(3);
      for (const f of boczne) {
        expect(f.dataset.dymek, "przyrząd boczny bez dymka").toBeTruthy();
        expect(f.dataset.dymek.length, "dymek przyrządu bocznego jest zdawkowy").toBeGreaterThan(60);
      }
      const dymki = boczne.map((f) => f.dataset.dymek).join(" ");
      expect(dymki, "zgubiono zastrzeżenie o zagęszczonej podziałce")
        .toMatch(/zagęszczona przy zerze|compressed near zero/);
    });
  }
});

// Zgłoszenia Z1–Z5: przełącznik rejsu, kolory odczytów, pasek przyrządów
// i tytuł serwisu. Każde z nich łatwo cofnąć następną zmianą układu.
describe.skipIf(!zbudowane)("poprawki zgłoszone 10 października", () => {
  const wczytaj = (plik) => {
    document.body.innerHTML = readFileSync(plik, "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    return document.querySelector("[data-modul]") || document.body;
  };

  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — rejs przełącza się kołem i kotwicą, nie napisem`, async () => {
      const root = wczytaj(plik);
      const g = root.querySelector("#rejsStart");
      expect(g.querySelector(".ikona-kolo"), "brak koła sterowego").toBeTruthy();
      expect(g.querySelector(".ikona-kotwica"), "brak kotwicy").toBeTruthy();
      expect(g.getAttribute("aria-pressed"), "przycisk nie jest przełącznikiem").toBe("false");
      expect(g.querySelector("#rejsNapis"), "napis nie jest osobnym elementem").toBeTruthy();
      // Moduł nie może podmieniać całej zawartości guzika — tak zginął rysunek.
      const m = readFileSync("src/assets/js/modules/rejs.js", "utf8");
      expect(m, "moduł nadpisuje zawartość guzika").not.toMatch(/\$\("rejsStart"\)\.textContent/);
      const mod = await import("../src/assets/js/modules/rejs.js");
      mod.default(root);
      root.querySelector("#rejsStart").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
      expect(root.querySelector("#rejsStart").getAttribute("aria-pressed"), "kliknięcie nie przestawiło stanu").toBe("true");
      expect(root.querySelector(".ikona-kolo"), "koło zniknęło z dokumentu").toBeTruthy();
    });

    it(`${plik} — odczyty błędu w kolorach swoich śladów, bez legendy pod mapą`, () => {
      const root = wczytaj(plik);
      expect(root.querySelector(".rzad-mapy ~ .legenda, .legenda"), "legenda pod mapą została").toBeFalsy();
      const a = readFileSync("src/assets/css/site.css", "utf8");
      expect(a, "odczyt wahadła nie ma koloru swojego śladu").toMatch(/#kw\{color:var\(--sun\)\}/);
      expect(a, "odczyt sprężyny nie ma koloru swojego śladu").toMatch(/#ks\{color:var\(--verd\)\}/);
    });
  }

  for (const [plik, etykieta] of [["_site/pl/gnomon/index.html", "Biografia"],
                                  ["_site/en/gnomon/index.html", "Biography"]]) {
    it(`${plik} — biografia stoi w rzędzie przyrządów z latami życia`, () => {
      wczytaj(plik);
      const pozycje = [...document.querySelectorAll(".bench a")];
      expect(pozycje.length, "pasek ma mieć cztery przyrządy i biografię").toBe(5);
      const z = pozycje[4];
      expect(z.textContent.trim(), "ostatnia pozycja to nie biografia").toContain(etykieta);
      expect(z.querySelector(".y").textContent.trim(), "brak lat życia").toBe("1631–1700");
      expect(document.querySelector("footer a[href$='/biografia/']"), "odnośnik w stopce się dublował").toBeFalsy();
    });
  }

  it("szyld mówi w języku strony", () => {
    const szyld = (p) => {
      wczytaj(p);
      return document.querySelector(".marka").textContent.trim();
    };
    expect(szyld("_site/pl/index.html")).toBe("Warsztat Kochańskiego");
    expect(szyld("_site/en/index.html"), "angielski szyld nieprzetłumaczony").toBe("Kochański's Workshop");
  });
});

// Szyfr ma zaczynać od pustego pola wiadomości — przy pierścieniu na zerze
// „odszyfrowanie" przepisywało zapis znak w znak i obok siebie stały dwa te
// same ciągi. Rejs ma wznawiać bieg, nie wracać do La Rochelle.
describe.skipIf(!zbudowane)("stan początkowy i wznawianie", () => {
  const wczytaj = (plik) => {
    document.body.innerHTML = readFileSync(plik, "utf8")
      .replace(/[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*/, "");
    return document.querySelector("[data-modul]");
  };

  for (const plik of ["_site/pl/szyfr/index.html", "_site/en/cipher/index.html"]) {
    it(`${plik} — na wejściu wiadomość pusta, zapis gotowy do złamania`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/szyfr.js");
      m.default(root);
      expect(root.querySelector("#szyfrogram").value.trim().length,
        "brak zapisu do złamania").toBeGreaterThan(10);
      expect(root.querySelector("#jawny").value, "pole wiadomości nie jest puste").toBe("");
      expect(root.querySelector("#jawny").getAttribute("placeholder"),
        "puste pole nie podpowiada, co zrobić").toMatch(/\S/);
    });

    it(`${plik} — wpis w wiadomość szyfruje, wpis w zapis odszyfrowuje`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/szyfr.js");
      m.default(root);
      const jawny = root.querySelector("#jawny"), zapis = root.querySelector("#szyfrogram");
      jawny.value = "ALA";
      jawny.dispatchEvent(new window.Event("input", { bubbles: true }));
      const zaszyfrowane = zapis.value.trim();
      expect(zaszyfrowane, "wpis w wiadomość nic nie zaszyfrował").toMatch(/\S/);
      zapis.value = zaszyfrowane;
      zapis.dispatchEvent(new window.Event("input", { bubbles: true }));
      expect(jawny.value.trim().toUpperCase(), "wpis w zapis nie wrócił do wiadomości").toContain("ALA");
    });
  }

  for (const plik of ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"]) {
    it(`${plik} — kotwica zatrzymuje, koło podnosi ją i płynie dalej`, async () => {
      const root = wczytaj(plik);
      const m = await import("../src/assets/js/modules/rejs.js");
      m.default(root);
      const dzien = root.querySelector("#dzien"), guzik = root.querySelector("#rejsStart");
      dzien.value = "30";
      dzien.dispatchEvent(new window.Event("input", { bubbles: true }));
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));   // odbij
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));   // zatrzymaj
      expect(Number(dzien.value), "zatrzymanie cofnęło okręt do portu wyjścia").toBeGreaterThan(0);
      const gdzieStoi = Number(dzien.value);
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));   // dalej
      expect(Number(dzien.value), "wznowienie wróciło do La Rochelle").toBeGreaterThanOrEqual(gdzieStoi);
      guzik.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });
  }

  it("legenda karty kursowej nazywa Wyspy Kanaryjskie pełną nazwą", () => {
    for (const [plik, fraza] of [["_site/pl/wahadlo/index.html", "Wyspy Kanaryjskie"],
                                 ["_site/en/pendulum/index.html", "Canary Islands"]]) {
      const h = readFileSync(plik, "utf8");
      expect(h, `${plik}: brak pełnej nazwy wysp`).toContain(fraza);
    }
    expect(readFileSync("_site/pl/wahadlo/index.html", "utf8"), "została skrócona nazwa")
      .not.toMatch(/Iberii, Kanary/);
  });
});

// Liczba Richera i odnośniki otwierane na właściwej stronie skanu.
describe.skipIf(!zbudowane)("kwerendy źródłowe", () => {
  for (const [plik, fraza] of [["_site/pl/wahadlo/index.html", "o jedną linię i ćwierć"],
                               ["_site/en/pendulum/index.html", "by one line and a quarter"]]) {
    it(`${plik} — wartość Richera z oryginałem i stroną`, () => {
      const h = readFileSync(plik, "utf8");
      expect(h, "brak wartości skrócenia").toContain(fraza);
      expect(h, "brak oryginalnego brzmienia").toContain("d’une ligne &amp; un quart");
      expect(h, "brak paryskiej długości odniesienia").toMatch(/3 (stóp|feet) 8½ (linii|lines)/);
      expect(h, "odnośnik nie otwiera się na stronie 320 skanu")
        .toContain("archive.org/details/richer-mmoiresdelacad-07pari/page/n89");
    });
  }

  it("skan Technica curiosa otwiera się na stronie z zapisem szyfrowym", () => {
    const z = JSON.parse(readFileSync("src/_data/zrodla.json", "utf8"));
    expect(z["technica-curiosa"].url, "odnośnik nie wskazuje karty 827 (druk 692)")
      .toContain("/page/n826");
    expect(z["technica-curiosa"].uwaga, "uwaga nie odnotowuje, że to anagram").toMatch(/anagram/i);
  });

  it("ustalenia obu kwerend zapisane w agendzie", () => {
    const a = JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
    const poz = a.pozycje || a;
    for (const id of ["A2", "A7"]) {
      const p = poz.find((x) => x.id === id);
      expect(p.ustalenia?.length, `${id}: brak ustaleń z kwerendy`).toBeGreaterThan(2);
    }
    expect(poz.find((x) => x.id === "A7").ustalenia.join(" "), "A7 bez numeru strony").toContain("320");
    expect(poz.find((x) => x.id === "A2").ustalenia.join(" "), "A2 bez numeru strony").toContain("692");
  });
});

// Cztery punkty kwerendy mają stać na stronie szyfru, wypisane, a nie zniknąć
// przy następnym porządkowaniu tekstu. Dwa z nich rozstrzygnął list autora
// z 1685 roku — przeciwko wcześniejszemu wnioskowi serwisu — i naprawa ma być
// widoczna razem z pomyłką, nie zamiast niej.
describe.skipIf(!zbudowane)("cztery punkty w module szyfru", () => {
  for (const [plik, naglowek, slowa] of [
    ["_site/pl/szyfr/index.html", "Cztery punkty, dwa rozstrzygnięte przez autora",
     ["692", "Anagramma", "Amicus", "587", "dignitas"]],
    ["_site/en/cipher/index.html", "Four points, two settled by the author",
     ["692", "Anagramma", "Amicus", "587", "dignitas"]]
  ]) {
    it(`${plik} — cztery punkty wypisane wraz z drugim zapisem`, () => {
      const h = readFileSync(plik, "utf8");
      expect(h, "brak wykazu rozbieżności").toContain(naglowek);
      for (const s of slowa) expect(h, `brak „${s}" w wykazie`).toContain(s);
      // Przekaz z opracowań nie może już stać jako własne twierdzenie serwisu.
      expect(h, "twierdzenie o Kochańskim bez wskazania, że to przekaz opracowań")
        .toMatch(/Opracowania podają|The scholarship holds/);
      // Zastrzeżenie mówi wprost, czego moduł nie odtwarza.
      expect(h, "zastrzeżenie nie nazywa tego, czego moduł nie odtwarza")
        .toMatch(/nie tę, która stoi|not the one that stands/);
    });
  }

  it("obie kwerendy odnotowane jako zamknięte", () => {
    const a = JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
    const poz = a.pozycje || a;
    for (const id of ["A2", "A7"]) {
      const p = poz.find((x) => x.id === id);
      expect(p.status, `${id} nie został zamknięty`).toBe("zamknięta");
      expect(p.ustalenia.join(" "), `${id} bez wskazania, czyja była decyzja`)
        .toMatch(/decyzją kierownika projektu/);
    }
  });
});

describe("strona szyfru po liście z 1685 roku", () => {
  // Przez rok strona twierdziła dwie rzeczy, które list Kochańskiego do
  // redakcji „Acta Eruditorum” obalił: że zapis szyfrowy nie dotyczy
  // magnetyzmu i że utożsamienie bezimiennego Amicusa z Kochańskim pochodzi
  // wyłącznie z opracowań. Te testy są tamtymi zdaniami zamienionymi w zapory.
  const STRONY_SZYFRU = ["_site/pl/szyfr/index.html", "_site/en/cipher/index.html"];

  for (const plik of STRONY_SZYFRU) {
    it.skipIf(!existsSync(plik))(`${plik}: powołuje się na list z 1685 roku`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "brak odwołania do relacji z 1685").toContain("qui totus a me");
      expect(html, "brak rozwiązania anagramu").toMatch(/per magnetis tractionem/i);
    });

    it.skipIf(!existsSync(plik))(`${plik}: nie twierdzi już, że zapis magnetyzmu nie dotyczy`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "wróciło zdanie obalone przez źródło")
        .not.toMatch(/Nie dotyczy wahaczy magnetycznych|It is not about magnetic balances/);
    });

    it.skipIf(!existsSync(plik))(`${plik}: nie odsyła utożsamienia Amicusa do samych opracowań`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "wróciło zdanie o opracowaniach jako jedynej podstawie")
        .not.toMatch(/pochodzi z opracowań, nie z druku|comes from the scholarship, not from the print/);
    });
  }
});

describe("rok 1659 po odczytaniu relacji z 1685", () => {
  // Przez rok oś czasu i strona rejsu przypisywały Kochańskiemu propozycję
  // sprężyny regulującej w 1659 roku i pierwszeństwo szesnastu lat przed
  // Huygensem. Relacja autora z 1685 roku mówi co innego: rok 1659 dotyczy
  // wahadła magnetycznego, sprężyna jest datowana osobno na około 1672,
  // a sam Kochański zasługi się wyrzeka. Te testy są tamtym błędem zamienionym
  // w zaporę — razem z twierdzeniem o pierwszeństwie, którego bramka GA2
  // zakazuje bez zastrzeżenia.
  const OSIE = ["_site/pl/biografia/index.html", "_site/en/biography/index.html"];
  const REJSY = ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"];

  for (const plik of OSIE) {
    it.skipIf(!existsSync(plik))(`${plik}: wiersz 1659 mówi o wahadle magnetycznym, nie o sprężynie`, () => {
      const html = readFileSync(plik, "utf8");
      const wiersz = html.split(/<li[^>]*>/).find((w) => /<strong>1659<\/strong>/.test(w));
      expect(wiersz, "brak wiersza 1659 na osi").toBeTruthy();
      expect(wiersz, "wiersz 1659 nie nazywa wahadła magnetycznego")
        .toMatch(/magnetyczn|magnetic/);
      expect(wiersz, "sprężyna wróciła do wiersza 1659")
        .not.toMatch(/sprężyn|regulating spring|hairspring/i);
    });
  }

  for (const plik of REJSY) {
    it.skipIf(!existsSync(plik))(`${plik}: przytacza wyrzeczenie się zasługi`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "brak cytatu, w którym autor odmawia sobie zasługi")
        .toContain("laudem in me transferre velim");
    });
  }

  for (const plik of [...OSIE, ...REJSY]) {
    it.skipIf(!existsSync(plik))(`${plik}: nie wraca twierdzenie o pierwszeństwie`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "wróciło niepoparte twierdzenie o pierwszeństwie wobec Huygensa")
        .not.toMatch(/szesnaście lat przed|sixteen years before/i);
    });
  }
});

describe("dwa twierdzenia bez podstawy, zamienione na uczciwsze", () => {
  // Teza serwisu i domysł o intencji szyfru stały na stronach jako fakty.
  // Pierwsza mówi teraz, czyje to odczytanie; drugi zastąpiono czynnością
  // z datą i źródłem. Te testy pilnują, żeby żadne nie wróciło.
  const GLOWNE = ["_site/pl/index.html", "_site/en/index.html"];
  const SZYFRY = ["_site/pl/szyfr/index.html", "_site/en/cipher/index.html"];

  for (const plik of GLOWNE) {
    it.skipIf(!existsSync(plik))(`${plik}: teza nazwana jako nasze odczytanie`, () => {
      const html = readFileSync(plik, "utf8");
      const lede = html.match(/<p class="lede">([\s\S]*?)<\/p>/)?.[1] || "";
      expect(lede, "brak akapitu wprowadzającego").toBeTruthy();
      expect(lede, "teza znów podana jako fakt biograficzny")
        .toMatch(/Ten serwis czyta|This site reads/);
    });
  }

  for (const plik of SZYFRY) {
    it.skipIf(!existsSync(plik))(`${plik}: intencja zastąpiona czynnością z datą`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "wrócił domysł o tym, po co był szyfr")
        .not.toMatch(/miał nie ukryć wynalazku|was never meant to hide the invention/);
      expect(html, "brak faktu, który zastąpił domysł")
        .toMatch(/dwadzieścia jeden lat po druku|twenty-one years after Schott/);
    });
  }
});

describe("ostatnie dwa twierdzenia bez podstawy", () => {
  // Akapit „Czego ta oś nie mówi” oceniał zamiast opisywać: zegarek był
  // „ślepą uliczką”, zegar morski „nigdy nie powstał”. Pierwsze zastąpiono
  // tym, co autor napisał o wadach sam; drugie przeniesiono z faktu do stanu
  // naszej wiedzy. Na stronie rejsu wycięto Harrisona, bo liczba lat nie
  // miała oparcia w żadnym źródle serwisu.
  const OSIE = ["_site/pl/biografia/index.html", "_site/en/biography/index.html"];
  const REJSY = ["_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html"];

  for (const plik of OSIE) {
    it.skipIf(!existsSync(plik))(`${plik}: wady wyliczone za autorem, nie ocenione za niego`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "brak cytatu o Ziemi jako wielkim magnesie")
        .toContain("telluris, tanquam grandis magnetis");
      expect(html, "wróciła ocena zamiast opisu")
        .not.toMatch(/ślepą uliczką|a dead end/i);
    });

    it.skipIf(!existsSync(plik))(`${plik}: zegar morski jako stan wiedzy, nie fakt`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "wróciło twierdzenie przeczące podane jako fakt")
        .not.toMatch(/nigdy nie powstał|was never built/i);
      expect(html, "brak sformułowania o granicy naszej wiedzy")
        .toMatch(/nie znamy|is known to us/);
    });
  }

  for (const plik of REJSY) {
    it.skipIf(!existsSync(plik))(`${plik}: bez Harrisona i bez liczby lat bez oparcia`, () => {
      const html = readFileSync(plik, "utf8");
      expect(html, "wrócił Harrison wraz z nieopartą liczbą lat")
        .not.toMatch(/Harrison/);
    });
  }
});
