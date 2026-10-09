// Kroje pisma obcinane do znaków, których serwis faktycznie używa.
// Pełne pliki EB Garamond i IBM Plex Mono ważą razem ponad sto kilobajtów,
// czyli dwie trzecie budżetu strony. Po obcięciu zostaje z nich połowa.
//
// Pliki wynikowe są danymi pochodnymi — nie wchodzą do repozytorium, powstają
// przy każdym budowaniu, tak samo jak linia brzegowa i warianty znaku graficznego.
// Nazwa niesie odcisk treści, więc wolno im leżeć w pamięci podręcznej rok:
// po zmianie repertuaru znaków zmienia się nazwa, a nie zawartość pod starą.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import subsetFont from "subset-font";
import { ZNAKI, KATALOG, RODZINY, ZAKRESY, PLIK_CSS } from "./kroje-dane.mjs";

const ZRODLA = {
  EBGaramond: { wzor: "@fontsource/eb-garamond/files/eb-garamond-{z}-400-normal.woff2", rodzina: "EB Garamond", styl: "normal", waga: "400 700" },
  "EBGaramond-Italic": { wzor: "@fontsource/eb-garamond/files/eb-garamond-{z}-400-italic.woff2", rodzina: "EB Garamond", styl: "italic", waga: "400 700" },
  IBMPlexMono: { wzor: "@fontsource/ibm-plex-mono/files/ibm-plex-mono-{z}-400-normal.woff2", rodzina: "IBM Plex Mono", styl: "normal", waga: "400 500" }
};

// Zakresy Unicode w podziale fontsource. Polskie znaki diakrytyczne leżą
// w „latin-ext", reszta w „latin"; obcinamy oba i spinamy regułami unicode-range,
// więc przeglądarka pobiera drugi plik tylko tam, gdzie te znaki wystąpią.
const ZAKRES_UNICODE = {
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
};

async function obetnij(wzor, zakres) {
  const sciezka = join("node_modules", wzor.replace("{z}", zakres));
  if (!existsSync(sciezka)) throw new Error(`brak pliku źródłowego ${sciezka} — uruchom npm install`);
  return subsetFont(readFileSync(sciezka), ZNAKI, { targetFormat: "woff2" });
}

mkdirSync(KATALOG, { recursive: true });
for (const f of readdirSync(KATALOG)) if (f.endsWith(".woff2")) unlinkSync(join(KATALOG, f));

const reguly = [];
let suma = 0;
for (const rodzina of RODZINY) {
  const k = ZRODLA[rodzina];
  for (const zakres of ZAKRESY) {
    const dane = await obetnij(k.wzor, zakres);
    const odcisk = createHash("sha1").update(dane).digest("hex").slice(0, 8);
    const nazwa = `${rodzina}-${zakres}.${odcisk}.woff2`;
    writeFileSync(join(KATALOG, nazwa), dane);
    suma += dane.length;
    reguly.push(`@font-face{
  font-family:"${k.rodzina}";
  src:url("/assets/fonts/${nazwa}") format("woff2");
  font-weight:${k.waga};
  font-style:${k.styl};
  font-display:swap;
  unicode-range:${ZAKRES_UNICODE[zakres]};
}`);
    console.log(`kroje: ${nazwa} — ${(dane.length / 1024).toFixed(1)} kB`);
  }
}
writeFileSync(PLIK_CSS, reguly.join("\n") + "\n");
console.log(`kroje: razem ${(suma / 1024).toFixed(1)} kB w ${reguly.length} deklaracjach @font-face`);
