import { mkdirSync, copyFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { dirname } from "node:path";
import { build } from "esbuild";

// 1. Biblioteka efemeryd — minifikowana przy każdym budowaniu.
mkdirSync("src/assets/js/lib", { recursive: true });
await build({
  entryPoints: ["node_modules/astronomy-engine/esm/astronomy.js"],
  outfile: "src/assets/js/lib/astronomy.js",
  bundle: true, minify: true, format: "esm", target: "es2020", legalComments: "inline"
});
console.log("zminifikowano astronomy-engine");

// 2. Deklaracje @font-face tylko dla krojów, które faktycznie leżą w repozytorium.
const KROJE = [
  { rodzina: "EB Garamond", plik: "EBGaramond.woff2", waga: "400 700", styl: "normal" },
  { rodzina: "EB Garamond", plik: "EBGaramond-Italic.woff2", waga: "400 700", styl: "italic" },
  { rodzina: "IBM Plex Mono", plik: "IBMPlexMono.woff2", waga: "400 500", styl: "normal" }
];
const katalog = "src/assets/fonts";
mkdirSync(katalog, { recursive: true });
const obecne = new Set(readdirSync(katalog));
const reguly = KROJE.filter((k) => obecne.has(k.plik)).map((k) => `@font-face{
  font-family:"${k.rodzina}";
  src:url("/assets/fonts/${k.plik}") format("woff2");
  font-weight:${k.waga};
  font-style:${k.styl};
  font-display:swap;
}`);
writeFileSync("src/assets/css/fonty.css",
  reguly.length ? reguly.join("\n") + "\n"
                : "/* Brak plików krojów w src/assets/fonts — serwis korzysta z zastępczych krojów systemowych. */\n");
console.log(reguly.length ? `wygenerowano ${reguly.length} deklaracji @font-face` : "brak plików krojów — deklaracje pominięte");
