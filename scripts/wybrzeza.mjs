// Wybrzeża z Natural Earth (world-atlas, domena publiczna) przycięte do okna
// karty kursowej i rzutowane tak samo jak reszta mapy. Uruchamiane przy budowaniu,
// żeby w repozytorium nie leżały dane pochodne.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const OKNO = { lonA: -64, lonB: 6, latA: 52, latB: -4 };   // zgodnie z modułem rejsu
const PLOT = { x0: 40, x1: 720, y0: 40, y1: 370 };
const MARGINES = 6;                                        // stopnie zapasu poza ramką

const mx = (lon) => PLOT.x0 + ((PLOT.x1 - PLOT.x0) * (lon - OKNO.lonA)) / (OKNO.lonB - OKNO.lonA);
const my = (lat) => PLOT.y0 + ((PLOT.y1 - PLOT.y0) * (OKNO.latA - lat)) / (OKNO.latA - OKNO.latB);

const atlas = JSON.parse(readFileSync("node_modules/world-atlas/land-50m.json", "utf8"));
const lad = feature(atlas, atlas.objects.land).features[0];
const wieloboki = lad.geometry.type === "MultiPolygon" ? lad.geometry.coordinates : [lad.geometry.coordinates];

const wOknie = ([lon, lat]) =>
  lon >= OKNO.lonA - MARGINES && lon <= OKNO.lonB + MARGINES &&
  lat >= OKNO.latB - MARGINES && lat <= OKNO.latA + MARGINES;

// Punkty daleko poza oknem spłaszczamy do jego brzegu — kształt wewnątrz ramki
// zostaje nietknięty, a ścieżka nie rozrasta się o całą Eurazję.
const przytnij = ([lon, lat]) => [
  Math.min(Math.max(lon, OKNO.lonA - MARGINES), OKNO.lonB + MARGINES),
  Math.min(Math.max(lat, OKNO.latB - MARGINES), OKNO.latA + MARGINES)
];

let sciezki = [];
for (const wielobok of wieloboki) {
  for (const pierscien of wielobok) {
    // Pomijamy kontury, które ledwie muskają okno — same drobne wysepki
    // zaciemniają kartę i podwajają jej wagę.
    if (pierscien.filter(wOknie).length < 6) continue;
    const punkty = [];
    let poprzedni = null;
    for (const p of pierscien) {
      const [x, y] = przytnij(p).map((v, i) => (i === 0 ? mx(v) : my(v)));
      if (poprzedni && Math.hypot(x - poprzedni[0], y - poprzedni[1]) < 2.2) continue;
      punkty.push([x, y]);
      poprzedni = [x, y];
    }
    if (punkty.length < 4) continue;
    sciezki.push("M " + punkty.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ") + " Z");
  }
}

const d = sciezki.join(" ");
writeFileSync("src/_data/wybrzeza.js",
  `// Plik wytwarzany przez scripts/wybrzeza.mjs — nie edytować ręcznie.\n` +
  `// Źródło: Natural Earth przez pakiet world-atlas, domena publiczna.\n` +
  `export default ${JSON.stringify({ d, okno: OKNO, plot: PLOT })};\n`);
console.log(`wybrzeża: ${sciezki.length} konturów, ${(d.length / 1024).toFixed(1)} kB ścieżki`);
