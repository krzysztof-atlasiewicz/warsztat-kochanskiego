import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const STRONY = [
  { modul: "cyrkiel", rok: 1685, nazwa: "Cyrkiel", plik: "_site/pl/cyrkiel/index.html" },
  { modul: "rejs", rok: 1659, nazwa: "Wahadło", plik: "_site/pl/wahadlo/index.html" },
  { modul: "szyfr", rok: 1664, nazwa: "Szyfr", plik: "_site/pl/szyfr/index.html" },
  { modul: "gnomon", rok: 1684, nazwa: "Gnomon", plik: "_site/pl/gnomon/index.html" }
];

const css = readFileSync("_site/assets/css/site.css", "utf8");
const { build } = await import("esbuild");
await build({ entryPoints: ["src/assets/js/bootstrap.js"], outfile: ".tmp/pakiet.js",
              bundle: true, format: "iife", target: "es2020", logLevel: "error" });
const js = readFileSync(".tmp/pakiet.js", "utf8");

const sekcje = STRONY.map((s, i) => {
  const t = readFileSync(s.plik, "utf8");
  const art = t.match(/<article class="przyrzad"[\s\S]*?<\/article>/)[0]
    .replace(/<nav class="sciezka"[\s\S]*?<\/nav>/, "")
    .replace(/href="\/pl\/agenda\/"/g, 'href="#agenda"');
  return `<section class="panel${i === 0 ? " on" : ""}" id="p-${s.modul}">${art}</section>`;
}).join("\n");

const zakladki = STRONY.map((s, i) =>
  `<button role="tab" aria-selected="${i === 0}" data-cel="p-${s.modul}"><span class="y">${s.rok}</span>${s.nazwa}</button>`
).join("\n");

const agenda = JSON.parse(readFileSync("pdca/agenda.json", "utf8")).pozycje.map((p) => `
<div class="agenda-poz">
  <h3>${p.id}. ${p.pytanie}</h3>
  <p><span class="status">${p.status}</span></p>
  <p>${p.dlaczego}</p>
  <p><strong>Co się zmieni:</strong> ${p.zmieni}</p>
  <p><strong>Gdzie szukać:</strong> ${p.zrodlo}</p>
</div>`).join("");

mkdirSync("_podglad", { recursive: true });
writeFileSync("_podglad/podglad-warsztatu.html", `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Warsztat Kochańskiego — podgląd</title>
<style>
${css}
.panel{display:none}
.panel.on{display:block}
.bench button{flex:1 0 auto;min-width:8.5rem;background:none;border:0;border-right:1px solid var(--rule-soft);padding:.85rem;text-align:left;cursor:pointer;color:var(--ink-soft);font-family:inherit;font-size:.95rem}
.bench button[aria-selected="true"]{background:var(--plate);color:var(--ink);box-shadow:inset 0 -3px 0 var(--verd)}
.podglad-nota{border:1px dashed var(--rule);padding:.8rem .9rem;margin:1.5rem 0 0;font-size:.88rem;color:var(--ink-soft)}
</style>
</head>
<body>
<div class="wrap">
<header class="szyld"><span class="marka">Warsztat Kochańskiego</span></header>
<p class="wersja-status">Wersja demonstracyjna 0.9 — model roboczy. Części oznaczone jako rekonstrukcja czekają na uszczegółowienie po kwerendzie źródłowej. <a href="#agenda">Zobacz, czego jeszcze nie wiemy</a>.</p>
<nav class="bench" role="tablist" aria-label="Przyrządy">
${zakladki}
</nav>
<main>
${sekcje}
</main>
<section id="agenda">
<h2>Czego jeszcze nie wiemy</h2>
<p>Poniższe pytania pozostają otwarte, a odpowiedź na każde z nich zmieni coś konkretnego na konkretnej stronie.</p>
${agenda}
</section>
<p class="podglad-nota">To jest podgląd zszyty z czterech osobnych stron serwisu do jednego pliku, żeby dało się go otworzyć bez serwera. W wersji docelowej każdy przyrząd ma własny adres, wersję angielską i wersję osadzalną. Kroje pisma zastępcze — właściwe nie są jeszcze osadzone w repozytorium.</p>
</div>
<script>
${js}
</script>
<script>
document.querySelectorAll(".bench button").forEach(function(b){
  b.addEventListener("click", function(){
    document.querySelectorAll(".bench button").forEach(function(x){ x.setAttribute("aria-selected", String(x === b)); });
    document.querySelectorAll(".panel").forEach(function(p){ p.classList.toggle("on", p.id === b.dataset.cel); });
  });
});
</script>
</body>
</html>
`);
console.log("podgląd zapisany: _podglad/podglad-warsztatu.html");
