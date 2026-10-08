import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const odciski = new Map();
const agenda = JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
const zrodla = JSON.parse(readFileSync("src/_data/zrodla.json", "utf8"));
const ETYKIETY = {
  pl: { naglowek: "Pytanie otwarte", dotyczy: "dotyczy", zmieni: "Co się zmieni", gdzie: "Gdzie szukać", rejestr: "cała pozycja w rejestrze", url: "/pl/agenda/" },
  en: { naglowek: "Open question", dotyczy: "concerns", zmieni: "What will change", gdzie: "Where to look", rejestr: "full entry in the register", url: "/en/agenda/" }
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
    return `<a class="zrodlo" href="${z.url}" rel="noopener" title="${opis}">${napis}</a>`;
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

  eleventyConfig.addShortcode("pytanie", (id, jezyk = "pl") => {
    const p = agenda.pozycje.find((x) => x.id === id);
    if (!p) throw new Error(`Nieznana pozycja agendy: ${id}`);
    const e = ETYKIETY[jezyk] || ETYKIETY.pl;
    return `<aside class="pytanie" id="pytanie-${p.id}" aria-label="${e.naglowek} ${p.id}">
  <p class="pytanie-nag"><span class="znak" aria-hidden="true">?</span> ${e.naglowek} ${p.id} — <span class="dotyczy">${e.dotyczy}: ${p.dotyczy}</span></p>
  <p class="pytanie-tresc">${p.pytanie}</p>
  <p><strong>${e.zmieni}:</strong> ${p.zmieni}</p>
  <p class="pytanie-stopka"><span class="status">${p.status}</span> <a href="${e.url}#${p.id}">${e.rejestr}</a></p>
</aside>`;
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
