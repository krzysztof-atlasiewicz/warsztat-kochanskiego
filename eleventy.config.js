import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const odciski = new Map();
const agenda = JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
const zrodla = JSON.parse(readFileSync("src/_data/zrodla.json", "utf8"));
const ETYKIETY = {
  pl: { naglowek: "Pytanie otwarte", dotyczy: "dotyczy", zmieni: "Co się zmieni", gdzie: "Gdzie szukać", rejestr: "cała pozycja w rejestrze", url: "/pl/agenda/",
        rozstrzygniete: "Rozstrzygnięte tutaj", brakPytan: "Do tego przyrządu nie ma już pytań otwartych.",
        naglowekZ: "Pytanie rozstrzygnięte", zmienilo: "Co się zmieniło" },
  en: { naglowek: "Open question", dotyczy: "concerns", zmieni: "What will change", gdzie: "Where to look", rejestr: "full entry in the register", url: "/en/agenda/",
        rozstrzygniete: "Settled here", brakPytan: "No open questions remain for this instrument.",
        naglowekZ: "Settled question", zmienilo: "What changed" }
};

export default function (eleventyConfig) {
  eleventyConfig.addFilter("odcisk", (sciezka) => {
    if (odciski.has(sciezka)) return odciski.get(sciezka);
    const plik = "src" + sciezka;
    const h = existsSync(plik)
      ? createHash("sha1").update(readFileSync(plik)).digest("hex").slice(0, 8)
      : "0";
    odciski.set(sciezka, h);
    return h;
  });

  eleventyConfig.ignores.add("src/assets/**");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/.assetsignore": ".assetsignore" });

  // Odnośnik do źródła z rejestru. Bez ustalonego skanu zwraca sam tekst,
  // żeby nigdy nie powstał odnośnik prowadzący donikąd.
  eleventyConfig.addShortcode("zrodlo", (id, tekst = null) => {
    const z = zrodla[id];
    if (!z) throw new Error(`Nieznane źródło: ${id}`);
    const napis = tekst || z.w || z.tytul;
    if (!z.url) return napis;
    const opis = [z.autor, z.tytul, z.w, z.rok, z.strony ? `s. ${z.strony}` : null]
      .filter(Boolean).join(", ");
    // Skan z ustalonym osadzeniem otwiera się w okienku nad stroną; źródło bez
    // osadzenia — w osobnej karcie, żeby czytelnik nie tracił miejsca w przyrządzie.
    const osadz = z.osadzenie
      ? ` data-osadzenie="${z.osadzenie}" data-opis="${opis}"`
      : ` target="_blank"`;
    return `<a class="zrodlo" href="${z.url}" rel="noopener" title="${opis}"${osadz}>${napis}</a>`;
  });

  // Automatyczne podlinkowanie wzmianek w tekście pochodzącym z danych.
  eleventyConfig.addFilter("podlinkuj", (tekst) => {
    if (!tekst) return tekst;
    let out = String(tekst);
    for (const z of Object.values(zrodla)) {
      if (!z.url || !z.frazy?.length) continue;
      for (const fraza of z.frazy) {
        if (!out.includes(fraza)) continue;
        const opis = [z.autor, z.tytul, z.w, z.rok].filter(Boolean).join(", ");
        out = out.replace(fraza, `<a class="zrodlo" href="${z.url}" rel="noopener" title="${opis}">${fraza}</a>`);
      }
    }
    return out;
  });

  // Zakładka strony przyrządu. Bez skryptu wszystkie trzy zostają widoczne
  // jedna pod drugą, więc treść nigdy nie znika z dokumentu.
  eleventyConfig.addPairedShortcode("karta", (tresc, nazwa, tytul) =>
    `<section class="karta-przyrzadu" id="k-${nazwa}" role="tabpanel" aria-labelledby="z-${nazwa}" tabindex="-1">`
    + `<h2 class="tytul-karty">${tytul}</h2>${tresc}</section>`);

  const ZAMKNIETE = new Set(["zamknięta", "nierozstrzygalna"]);
  const kartaPytania = (p, jezyk) => {
    const e = ETYKIETY[jezyk] || ETYKIETY.pl;
    // Nagłówek i czas gramatyczny idą za statusem pozycji. Karta pozycji
    // rozstrzygniętej, która nadal głosi „pytanie otwarte” i „co się zmieni”,
    // jest fałszem na stronie — a to ten sam błąd, przed którym serwis ostrzega.
    const zamkn = ZAMKNIETE.has(p.status);
    const nag = zamkn ? e.naglowekZ : e.naglowek;
    return `<aside class="pytanie${zamkn ? " rozstrzygnieta" : ""}" id="pytanie-${p.id}" aria-label="${nag} ${p.id}">
  <p class="pytanie-nag"><span class="znak" aria-hidden="true">${zamkn ? "!" : "?"}</span> ${nag} ${p.id} — <span class="dotyczy">${e.dotyczy}: ${p.dotyczy}</span></p>
  <p class="pytanie-tresc">${p.pytanie}</p>
  <p><strong>${zamkn ? e.zmienilo : e.zmieni}:</strong> ${p.zmieni}</p>
  <p class="pytanie-stopka"><span class="status">${p.status}</span> <a href="${e.url}#${p.id}">${e.rejestr}</a></p>
</aside>`;
  };

  // Pozycje agendy przypisane do danego miejsca. Jedno źródło prawdy: rejestr,
  // nie ręczna lista w nagłówku strony, która potrafi się z nim rozminąć.
  // Zakładka nazywa się „Pytania otwarte", więc pozycje zamknięte do niej nie
  // należą — ale nie mogą też zniknąć bez śladu, bo ślad jest tu treścią.
  // Stąd dwa zbiory: otwarte wchodzą na zakładkę jako karty, zamknięte
  // jednym wierszem z odesłaniem do rejestru.
  const wszystkieMiejsca = (miejsce) => agenda.pozycje.filter((p) => p.miejsca?.includes(miejsce));
  const pytaniaMiejsca = (miejsce) => wszystkieMiejsca(miejsce).filter((p) => !ZAMKNIETE.has(p.status));
  const pytaniaZamkniete = (miejsce) => wszystkieMiejsca(miejsce).filter((p) => ZAMKNIETE.has(p.status));
  eleventyConfig.addFilter("pytaniaMiejsca", pytaniaMiejsca);
  eleventyConfig.addFilter("pytaniaZamkniete", pytaniaZamkniete);
  eleventyConfig.addFilter("agendaOtwarte", (poz) => poz.filter((p) => !ZAMKNIETE.has(p.status)));
  eleventyConfig.addFilter("agendaZamkniete", (poz) => poz.filter((p) => ZAMKNIETE.has(p.status)));

  eleventyConfig.addShortcode("pytanie", (id, jezyk = "pl") => {
    const p = agenda.pozycje.find((x) => x.id === id);
    if (!p) throw new Error(`Nieznana pozycja agendy: ${id}`);
    return kartaPytania(p, jezyk);
  });

  eleventyConfig.addShortcode("pytaniaTu", (miejsce, jezyk = "pl") => {
    const e = ETYKIETY[jezyk] || ETYKIETY.pl;
    const karty = pytaniaMiejsca(miejsce).map((p) => kartaPytania(p, jezyk));
    // Zakładka bez ani jednej karty nie może zostać pusta: milczenie czyta się
    // jako brak pytań albo jako awarię, a to dwie różne rzeczy.
    if (!karty.length) karty.push(`<p class="rozstrzygniete-tu">${e.brakPytan}</p>`);
    const z = pytaniaZamkniete(miejsce);
    if (z.length) {
      const lista = z.map((p) => `<a href="${e.url}#${p.id}">${p.id}</a>`).join(", ");
      karty.push(`<p class="rozstrzygniete-tu">${e.rozstrzygniete}: ${lista}.</p>`);
    }
    return karty.join("\n");
  });

  eleventyConfig.addCollection("przyrzady", (api) =>
    api.getFilteredByGlob("src/*/*.njk")
      .filter((p) => p.data.przyrzad)
      .sort((a, b) => a.data.kolejnosc - b.data.kolejnosc)
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
