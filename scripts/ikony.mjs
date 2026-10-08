// Rastrowe warianty znaku z jednego źródła SVG. Uruchamiane przy każdym budowaniu,
// więc znak i jego odbitki nie mogą się rozejść.
import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const ZRODLO = "src/assets/favicon.svg";
const KATALOG = "src/assets/ikony";
mkdirSync(KATALOG, { recursive: true });

// Rasteryzujemy w wariancie jasnym — pliki PNG nie reagują na motyw systemowy.
const svg = readFileSync(ZRODLO, "utf8").replace(/@media[^}]*\{[\s\S]*?\}\s*\}/, "");

const png = (rozmiar) => sharp(Buffer.from(svg), { density: 384 })
  .resize(rozmiar, rozmiar, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

const png32 = await png(32);
const png180 = await png(180);
writeFileSync(`${KATALOG}/favicon-32.png`, png32);
writeFileSync(`${KATALOG}/apple-touch-icon.png`, png180);

// ICO z osadzonym PNG: nagłówek 6 bajtów, jeden wpis katalogu 16 bajtów, dalej dane.
const naglowek = Buffer.alloc(6);
naglowek.writeUInt16LE(0, 0); naglowek.writeUInt16LE(1, 2); naglowek.writeUInt16LE(1, 4);
const wpis = Buffer.alloc(16);
wpis[0] = 32; wpis[1] = 32; wpis[2] = 0; wpis[3] = 0;
wpis.writeUInt16LE(1, 4); wpis.writeUInt16LE(32, 6);
wpis.writeUInt32LE(png32.length, 8); wpis.writeUInt32LE(22, 12);
writeFileSync(`${KATALOG}/favicon.ico`, Buffer.concat([naglowek, wpis, png32]));

console.log(`ikony: favicon-32.png ${png32.length} B, apple-touch-icon.png ${png180.length} B, favicon.ico ${22 + png32.length} B`);
