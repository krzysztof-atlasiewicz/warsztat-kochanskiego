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
