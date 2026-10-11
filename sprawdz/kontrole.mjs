import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { ZNAKI, POZA_KROJEM, KATALOG, PLIK_CSS } from "../scripts/kroje-dane.mjs";

const czytaj = (p) => readFileSync(p, "utf8");
const agenda = JSON.parse(czytaj("pdca/agenda.json"));
const zrodla = JSON.parse(czytaj("src/_data/zrodla.json"));
const sprawdzone = JSON.parse(czytaj("sprawdz/objasnienia-sprawdzone.json"));
const STATUSY = ["otwarta", "w toku", "zamknięta", "nierozstrzygalna"];
const ZAMKNIETE = ["zamknięta", "nierozstrzygalna"];
// Kontrole, których niespełnienie jest zgłaszane, ale nie zatrzymuje cyklu.
// Kontrola, której wynik jest ostrzeżeniem, nie błędem: nie potrafi
// rozstrzygnąć sprawy sama, bo kontener roboczy nie ma dostępu do sieci.
export const OSTRZEZENIA = new Set(["odnosnikiSprawdzone"]);
const stronyZ = (kat) => readdirSync(kat).filter((f) => /\.(njk|md)$/.test(f)).map((f) => join(kat, f));
const stronyZrodlowe = stronyZ("src/pl").map((p) => p.replace("src/pl/", ""));
const zbudowane = () => {
  try { statSync("_site"); } catch { return []; }
  const out = [];
  const chodz = (d) => readdirSync(d).forEach((f) => {
    const p = join(d, f);
    statSync(p).isDirectory() ? chodz(p) : p.endsWith(".html") && out.push(p);
  });
  chodz("_site");
  return out;
};

const KONTROLE = {
  oznaczenia() {
    const bledy = [];
    for (const f of stronyZrodlowe) {
      const t = czytaj(join("src/pl", f));
      if (!t.includes("modul:")) continue;
      if (!t.includes("tagi:")) bledy.push(`${f}: brak oznaczeń źródło/rekonstrukcja/interpretacja`);
      if (!t.includes("rownowaznik:")) bledy.push(`${f}: brak równoważnika tekstowego`);
      if (/rekonstrukcj/i.test(t) && !/note uwaga/.test(t))
        bledy.push(`${f}: rekonstrukcja bez wyróżnionego zastrzeżenia w treści`);
    }
    return bledy;
  },

  agenda() {
    const bledy = [];
    const strony = zbudowane()
      .map((p) => ({ plik: p, tresc: czytaj(p) }))
      .filter((s) => !s.plik.includes("osadzenie"))
      .map((s) => ({ ...s, para: s.tresc.match(/<meta name="para" content="([^"]*)"/)?.[1] }))
      .filter((s) => s.para);

    for (const p of agenda.pozycje) {
      for (const pole of ["pytanie", "dlaczego", "zmieni", "zrodlo", "status", "dotyczy", "miejsca"])
        if (!p[pole] || (Array.isArray(p[pole]) && !p[pole].length))
          bledy.push(`${p.id}: brak pola ${pole}`);
      if (!STATUSY.includes(p.status))
        bledy.push(`${p.id}: status „${p.status}" spoza słownika (${STATUSY.join(", ")})`);
      if (!p.miejsca) continue;

      for (const m of p.miejsca) {
        const cele = strony.filter((s) => s.para === m);
        if (!cele.length) {
          bledy.push(`${p.id}: wskazuje miejsce „${m}", któremu nie odpowiada żadna strona`);
          continue;
        }
        // Pozycja otwarta musi stać na stronie jako karta. Pozycja zamknięta
        // nie może udawać otwartej, ale nie wolno jej też wymazać: zostaje
        // ślad z odnośnikiem do rejestru. Jedno albo drugie, nigdy nic.
        const domknieta = ZAMKNIETE.includes(p.status);
        for (const c of cele) {
          const karta = c.tresc.includes(`id="pytanie-${p.id}"`);
          if (!domknieta && !karta)
            bledy.push(`${p.id}: nie jest osadzone w miejscu, którego dotyczy — ${c.plik}`);
          if (domknieta && karta)
            bledy.push(`${p.id}: pozycja zamknięta nadal stoi jako pytanie otwarte — ${c.plik}`);
          if (domknieta && !c.tresc.includes(`agenda/#${p.id}">${p.id}</a>`))
            bledy.push(`${p.id}: zamknięta i bez śladu z odnośnikiem do rejestru — ${c.plik}`);
        }
      }
    }

    // w drugą stronę: żadne osadzone pytanie nie może być sierotą
    for (const s of strony)
      for (const m of s.tresc.matchAll(/id="pytanie-([A-Z]\d+)"/g))
        if (!agenda.pozycje.some((p) => p.id === m[1]))
          bledy.push(`${s.plik}: osadzone pytanie ${m[1]} nie istnieje w rejestrze`);

    return bledy;
  },

  status() {
    const bledy = [];
    for (const p of zbudowane()) {
      const t = czytaj(p);
      if (t.includes("http-equiv=\"refresh\"")) continue;
      if (p.endsWith("_site/404.html")) continue; // strona błędu nie jest treścią serwisu
      if (!/wersja-status/.test(t)) bledy.push(`${p}: brak widocznego oznaczenia statusu wersji`);
    }
    return bledy;
  },

  // Waga realna: HTML plus wszystkie zasoby, które strona faktycznie zaciąga,
  // liczona po kompresji — tak, jak trafia do przeglądarki.
  budzet() {
    const LIMIT = 150 * 1024;
    const spakuj = (p) => gzipSync(readFileSync(p)).length;
    const bledy = [];
    for (const p of zbudowane()) {
      const t = czytaj(p);
      if (t.includes("http-equiv=\"refresh\"")) continue;
      let suma = spakuj(p);
      const zasoby = new Set();
      for (const m of t.matchAll(/(?:href|src)="(\/assets\/[^"?]+)/g)) zasoby.add(m[1]);
      const modul = t.match(/data-modul="([^"]+)"/)?.[1];
      if (modul) {
        zasoby.add(`/assets/js/modules/${modul}.js`);
        zasoby.add("/assets/js/modules/matematyka.js");
        if (modul === "gnomon") zasoby.add("/assets/js/lib/astronomy.js");
      }
      // Arkusz stylów sam pobiera kroje pisma — bez tego budżet nie obejmowałby
      // kilkudziesięciu kilobajtów, które realnie lecą do przeglądarki.
      for (const z of [...zasoby].filter((x) => x.endsWith(".css"))) {
        try {
          const css = czytaj(join("_site", z));
          for (const m of css.matchAll(/url\(["']?(\/assets\/[^"')]+)/g)) zasoby.add(m[1]);
        } catch { /* brak arkusza zgłosi pętla poniżej */ }
      }
      for (const z of zasoby) {
        const plik = join("_site", z);
        try { suma += spakuj(plik); } catch { bledy.push(`${p}: brak zasobu ${z}`); }
      }
      if (suma > LIMIT)
        bledy.push(`${p}: ${Math.round(suma / 1024)} kB po kompresji przekracza budżet ${LIMIT / 1024} kB`);
    }
    return bledy;
  },

  zrodla() {
    const bledy = [];
    for (const [id, z] of Object.entries(zrodla)) {
      for (const pole of ["autor", "tytul", "rok", "frazy", "uwaga"])
        if (z[pole] === undefined) bledy.push(`${id}: brak pola ${pole}`);
      if (z.url && !z.licencja) bledy.push(`${id}: odnośnik bez podanej licencji`);
    }
    // Każda wzmianka o dziele, które ma ustalony skan, musi na tej stronie prowadzić
    // do niego. Porównujemy adres samego skanu, bez wskazania strony: odnośnik
    // otwierany na stronie 692 i odnośnik do całego tomu prowadzą do tego samego
    // egzemplarza, a starsze wpisy w rejestrze decyzji mają prawo wskazywać tom.
    const bezStrony = (u) => u.split("/page/")[0];
    for (const p of zbudowane()) {
      if (p.includes("/zrodla/") || p.includes("/sources/")) continue;
      const t = czytaj(p);
      const tekst = t.replace(/<[^>]+>/g, " ");
      for (const [id, z] of Object.entries(zrodla)) {
        if (!z.url || !z.frazy?.length) continue;
        for (const fraza of z.frazy)
          if (tekst.includes(fraza) && !t.includes(bezStrony(z.url)))
            bledy.push(`${p}: wzmianka „${fraza}" bez odnośnika do źródła ${id}`);
      }
    }
    return bledy;
  },

  wdrozenie() {
    const bledy = [];
    let konf;
    try { konf = czytaj("wrangler.toml"); } catch { return ["brak pliku wrangler.toml"]; }

    // Klucz podany po nagłówku tabeli trafia do tej tabeli, nie na poziom główny.
    const naPoziomieGlownym = (klucz) => {
      const i = konf.indexOf(`${klucz} =`);
      if (i < 0) return false;
      return !/\n\[/.test(konf.slice(0, i));
    };
    for (const k of ["workers_dev", "preview_urls"]) {
      if (!konf.includes(`${k} =`)) bledy.push(`wrangler.toml: brak ${k} — wdrożenie zależy od wartości domyślnej`);
      else if (!naPoziomieGlownym(k)) bledy.push(`wrangler.toml: ${k} stoi po nagłówku tabeli, więc trafia do niej zamiast na poziom główny`);
      else if (!new RegExp(`${k}\\s*=\\s*false`).test(konf)) bledy.push(`wrangler.toml: ${k} nie jest wyłączone`);
    }

    const domena = konf.match(/pattern\s*=\s*"([^"]+)"/)?.[1];
    if (!domena) bledy.push("wrangler.toml: brak zadeklarowanej domeny własnej");
    if (!/custom_domain\s*=\s*true/.test(konf)) bledy.push("wrangler.toml: domena nie jest oznaczona jako custom_domain");

    // Adres w danych serwisu musi zgadzać się z domeną wdrożenia — inaczej
    // mapa witryny i robots.txt wskażą gdzie indziej niż serwis stoi.
    const adres = czytaj("src/_data/site.js").match(/adres:[^"]*"([^"]+)"/)?.[1];
    if (!adres) bledy.push("src/_data/site.js: nie udało się odczytać adresu serwisu");
    else if (/example/.test(adres)) bledy.push(`src/_data/site.js: adres zastępczy ${adres}`);
    else if (domena && !adres.includes(domena)) bledy.push(`adres serwisu ${adres} nie zgadza się z domeną wdrożenia ${domena}`);

    return bledy;
  },

  wzory() {
    const bledy = [];
    for (const p of zbudowane()) {
      const t = czytaj(p);
      if (t.includes("http-equiv=\"refresh\"")) continue;
      // Pierwiastek zapisany znakiem łamie się w składzie i nie jest odczytywany
      // przez czytniki ekranu jako działanie — wzory mają być w MathML.
      if (/\u221a/.test(t.replace(/<math[\s\S]*?<\/math>/g, "")))
        bledy.push(`${p}: wzór zapisany znakiem √ zamiast w MathML`);
    }
    return bledy;
  },

  // Długa pamięć podręczna wolno tylko dla plików, które strony pobierają
  // z odciskiem treści w adresie. Reszta musi być sprawdzana przy wejściu.
  pamiec() {
    const bledy = [];
    let naglowki;
    try { naglowki = czytaj("_site/_headers"); } catch { return ["brak pliku _site/_headers"]; }

    const strony = zbudowane().map((p) => czytaj(p)).join("\n");
    const zOdciskiem = new Set();
    for (const m of strony.matchAll(/(?:href|src)="(\/assets\/[^"?]+)\?v=/g)) zOdciskiem.add(m[1]);
    // Zasoby, po które sięga arkusz stylów, nie mają w adresie „?v=" — odcisk
    // treści niosą w samej nazwie. Oba sposoby są równoważne dla pamięci
    // podręcznej, więc kontrola musi uznawać jeden i drugi.
    const zCss = new Set();
    for (const m of strony.matchAll(/(?:href)="(\/assets\/[^"?]+\.css)/g)) {
      try {
        for (const u of czytaj(join("_site", m[1])).matchAll(/url\(["']?(\/assets\/[^"')]+)/g)) {
          zCss.add(u[1]);
          if (/\.[0-9a-f]{8}\.[a-z0-9]+$/.test(u[1])) zOdciskiem.add(u[1]);
          else bledy.push(`${u[1]}: pobierany z arkusza stylów bez odcisku treści w nazwie`);
        }
      } catch { /* brak arkusza wyłapie kontrola budżetu */ }
    }

    let sciezka = null;
    for (const linia of naglowki.split("\n")) {
      const l = linia.trim();
      if (l.startsWith("/")) { sciezka = l; continue; }
      if (!/immutable/.test(l) || !sciezka) continue;
      if (sciezka.endsWith("*")) {
        const przedrostek = sciezka.slice(0, -1);
        const objete = [...zOdciskiem].filter((x) => x.startsWith(przedrostek));
        const wszystkie = [...[...strony.matchAll(/(?:href|src)="(\/assets\/[^"?]+)/g)].map((m) => m[1]), ...zCss]
          .filter((x) => x.startsWith(przedrostek));
        for (const x of new Set(wszystkie))
          if (!objete.includes(x)) bledy.push(`_headers: ${sciezka} jest „immutable", a ${x} jest pobierany bez odcisku ?v=`);
      } else if (!zOdciskiem.has(sciezka)) {
        bledy.push(`_headers: ${sciezka} jest „immutable", a strony pobierają go bez odcisku ?v=`);
      }
    }

    // Przy kilku pasujących wzorcach Cloudflare skleja nagłówki zamiast nadpisywać,
    // więc plik dostaje dwie sprzeczne dyrektywy i wygrywa ta ostrzejsza.
    const reguly = [];
    let biezaca = null;
    for (const linia of naglowki.split("\n")) {
      const l = linia.trim();
      if (l.startsWith("#") || !l) continue;
      if (l.startsWith("/")) { biezaca = l; continue; }
      if (/^Cache-Control:/i.test(l) && biezaca) reguly.push(biezaca);
    }
    const pasuje = (wzorzec, sciezka) =>
      wzorzec.endsWith("*") ? sciezka.startsWith(wzorzec.slice(0, -1)) : wzorzec === sciezka;
    for (const a of reguly)
      for (const b of reguly)
        if (a !== b && pasuje(a, b.replace(/\*$/, "")))
          bledy.push(`_headers: reguły ${a} i ${b} zachodzą na siebie — nagłówki zostaną sklejone`);

    // Moduły są importowane z kodu, nie z HTML, więc nigdy nie mają odcisku.
    if (!/\/assets\/js\/\*\s*\n\s*Cache-Control:[^\n]*no-cache/.test(naglowki))
      bledy.push("_headers: moduły pod /assets/js/* muszą mieć no-cache — nie da się im nadać odcisku");

    return bledy;
  },

  ikony() {
    const bledy = [];
    const pliki = ["favicon.svg", "ikony/favicon-32.png", "ikony/favicon.ico", "ikony/apple-touch-icon.png"];
    for (const f of pliki) {
      try { statSync(join("_site/assets", f)); }
      catch { bledy.push(`brak pliku znaku _site/assets/${f} — uruchom npm run libs`); }
    }
    for (const p of zbudowane()) {
      const t = czytaj(p);
      if (t.includes("http-equiv=\"refresh\"") || p.endsWith("_site/404.html")) continue;
      if (!/rel="icon"[^>]*favicon\.svg/.test(t)) bledy.push(`${p}: strona nie podpina znaku`);
    }
    return bledy;
  },

  // Kroje pisma powstają przy budowaniu: obcinane do repertuaru znaków serwisu
  // i nazywane odciskiem treści. Kontrola pilnuje trzech rzeczy — że arkusz
  // deklaracji istnieje, że każdy plik, po który sięga, leży na miejscu, oraz
  // że na stronach nie pojawił się znak, którego w obciętym kroju nie ma.
  kroje() {
    const bledy = [];
    let css;
    try { css = czytaj(PLIK_CSS); }
    catch { return [`brak ${PLIK_CSS} — uruchom npm run libs`]; }

    const deklaracje = [...css.matchAll(/@font-face/g)].length;
    if (deklaracje !== 6) bledy.push(`${PLIK_CSS}: ${deklaracje} deklaracji @font-face zamiast sześciu`);

    for (const m of css.matchAll(/url\("(\/assets\/fonts\/[^"]+)"/g)) {
      const nazwa = m[1].replace("/assets/fonts/", "");
      if (!/\.[0-9a-f]{8}\.woff2$/.test(nazwa))
        bledy.push(`${nazwa}: nazwa bez odcisku treści, a nagłówki każą trzymać kroje rok w pamięci podręcznej`);
      try { statSync(join(KATALOG, nazwa)); }
      catch { bledy.push(`brak pliku kroju ${KATALOG}/${nazwa} — uruchom npm run libs`); }
    }

    const dozwolone = new Set([...ZNAKI, ...POZA_KROJEM, "\n", "\r", "\t", "\u00a0"]);
    const brakujace = new Map();
    for (const p of zbudowane()) {
      const t = czytaj(p);
      if (t.includes("http-equiv=\"refresh\"")) continue;
      const tekst = t.replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
      for (const ch of tekst) if (!dozwolone.has(ch)) brakujace.set(ch, p);
    }
    for (const [ch, p] of brakujace)
      bledy.push(`znak „${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}) nie mieści się w obciętym kroju — ${p}; rozszerz ZNAKI w scripts/kroje-dane.mjs`);

    return bledy;
  },

  jezyki() {
    const bledy = [];
    const zbierz = (kat) => stronyZ(kat).map((p) => {
      const t = czytaj(p);
      return { plik: p, para: t.match(/^para:\s*(\S+)/m)?.[1], tylko: /^tylkoJeden:\s*true/m.test(t) };
    });
    const pl = zbierz("src/pl"), en = zbierz("src/en");
    for (const a of [...pl, ...en])
      if (!a.para && !a.tylko) bledy.push(`${a.plik}: brak klucza para ani deklaracji tylkoJeden`);
    for (const a of pl.filter((x) => x.para && !x.tylko))
      if (!en.some((b) => b.para === a.para))
        bledy.push(`${a.plik}: brak odpowiednika angielskiego (para: ${a.para})`);
    for (const b of en.filter((x) => x.para && !x.tylko))
      if (!pl.some((a) => a.para === b.para))
        bledy.push(`${b.plik}: brak odpowiednika polskiego (para: ${b.para})`);
    return bledy;
  },

  osadzenia() {
    const bledy = [];
    for (const p of zbudowane()) {
      if (!/class="przyrzad"/.test(czytaj(p))) continue;
      const cel = p.replace(/index\.html$/, "osadzenie/index.html");
      try { statSync(cel); } catch { bledy.push(`${p}: brak wersji osadzalnej`); }
    }
    return bledy;
  },

  linki() {
    const bledy = [];
    for (const p of zbudowane()) {
      for (const m of czytaj(p).matchAll(/href="(\/[^"#?]*)"/g)) {
        const cel = m[1];
        if (cel.startsWith("/assets")) continue;
        const kandydaci = [join("_site", cel), join("_site", cel, "index.html"), join("_site", cel.replace(/\/$/, "") + ".html")];
        if (!kandydaci.some((k) => { try { return statSync(k).isFile(); } catch { return false; } }))
          bledy.push(`${p}: martwy odsyłacz ${cel}`);
      }
    }
    return bledy;
  },

  // Polityka bezpieczenstwa tresci serwisu ma „script-src 'self'" i „style-src
  // 'self'": skrypt albo styl wpisany wprost w strone jest na serwerze
  // blokowany, choc u siebie, bez tej polityki, dziala bez zarzutu. Taki wiersz
  // potrafi wiec przejsc wszystkie proby i umrzec dopiero po wdrozeniu, cicho.
  // Ta kontrola pilnuje, zeby zbudowane strony nie zawieraly niczego, czego
  // polityka nie przepusci — i zeby sama polityka nie zmiekla niepostrzezenie.
  polityka() {
    const bledy = [];
    const naglowki = czytaj("_site/_headers");
    const csp = /Content-Security-Policy:([^\n]*)/.exec(naglowki)?.[1] || "";
    if (!csp) return [`_site/_headers: brak polityki bezpieczeństwa treści`];
    for (const dyrektywa of ["script-src 'self'", "style-src 'self'"])
      if (!csp.includes(dyrektywa)) bledy.push(`_site/_headers: polityka nie zawiera „${dyrektywa}"`);
    const scislyKod = csp.includes("script-src 'self'") && !csp.includes("'unsafe-inline'");
    for (const p of zbudowane()) {
      const t = czytaj(p);
      if (scislyKod && /<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/.test(t))
        bledy.push(`${p}: skrypt wpisany wprost w stronę — polityka go zablokuje`);
      if (csp.includes("style-src 'self'") && !csp.includes("'unsafe-inline'") && / style="/.test(t))
        bledy.push(`${p}: atrybut style w znaczniku — polityka go zablokuje`);
      for (const m of t.matchAll(/<script[^>]*\ssrc="([^"]+)"/g))
        if (!m[1].startsWith("/")) bledy.push(`${p}: skrypt spoza serwisu ${m[1]}`);
    }
    return bledy;
  },

  // Granica między objaśnieniem a źródłem. Objaśnienie mówi, CZYM jest rzecz
  // wspomniana w zdaniu; źródło mówi, CZYM to zdanie jest poparte. Serwis stoi
  // na rozróżnieniu „co ze źródła, co nasze", więc encyklopedia nie może wejść
  // do rejestru źródeł ani podszyć się pod odnośnik do skanu — a odnośnik do
  // skanu nie może udawać objaśnienia.
  objasnienia() {
    const bledy = [];
    const ENCYKLOPEDIE = ["wikipedia.org", "wikidata.org", "britannica.com"];
    for (const [id, z] of Object.entries(zrodla)) {
      if (!z.url) continue;
      for (const e of ENCYKLOPEDIE)
        if (z.url.includes(e))
          bledy.push(`${id}: encyklopedia „${e}" w rejestrze źródeł — to objaśnienie, nie źródło`);
    }
    for (const p of zbudowane()) {
      const t = czytaj(p);
      for (const m of t.matchAll(/<a class="objasnienie"[^>]*href="([^"]+)"[^>]*>/g)) {
        if (!/^https?:\/\//.test(m[1]))
          bledy.push(`${p}: objaśnienie prowadzi w głąb serwisu (${m[1]}) — to nie objaśnienie`);
        if (!/target="_blank"/.test(m[0]))
          bledy.push(`${p}: objaśnienie nie otwiera się w nowej karcie (${m[1]})`);
        if (!/rel="noopener"/.test(m[0]))
          bledy.push(`${p}: objaśnienie bez rel="noopener" (${m[1]})`);
        if (!/title="[^"]{10,}"/.test(m[0]))
          bledy.push(`${p}: objaśnienie bez objaśnienia w tytule (${m[1]})`);
      }
      // Dwie klasy nie mogą się zejść na jednym odnośniku: czytelnik rozpoznaje
      // rodzaj odnośnika po wyglądzie i ten wygląd musi znaczyć jedno.
      for (const m of t.matchAll(/<a class="([^"]*)"/g)) {
        const k = m[1].split(/\s+/);
        if (k.includes("objasnienie") && k.includes("zrodlo"))
          bledy.push(`${p}: odnośnik jest naraz źródłem i objaśnieniem`);
      }
    }
    return bledy;
  },

  // Czy ktoś sprawdził, że te adresy w ogóle istnieją.
  //
  // W cyklu 57 osiem adresów encyklopedii wpisano z pamięci i dwa z nich
  // okazały się nieistniejące. Kontener roboczy nie ma dostępu do sieci, więc
  // nie da się tego sprawdzić na miejscu — i właśnie dlatego nie wolno
  // przyjmować takiego adresu na słowo. Sprawdzenie wykonuje człowiek, a jego wynik zapisuje
  // się w „sprawdz/objasnienia-sprawdzone.json". Adres nieobecny w rejestrze
  // jest tu zgłaszany jako nieprzejrzany.
  //
  // To ostrzeżenie, nie błąd: kontrola nie umie rozstrzygnąć sprawy sama,
  // więc nie ma prawa zatrzymywać budowania. Ma za to prawo nie dać o sobie
  // zapomnieć — wdrażać z nieprzejrzanym adresem nie wolno.
  odnosnikiSprawdzone() {
    const bledy = [];
    const znane = new Set(Object.keys(sprawdzone.adresy || {}));
    const czeka = sprawdzone.oczekuje || {};
    const widziane = new Set();
    for (const p of zbudowane()) {
      for (const m of czytaj(p).matchAll(/<a class="objasnienie"[^>]*href="([^"]+)"/g))
        widziane.add(m[1]);
    }
    for (const u of [...widziane].sort()) {
      if (znane.has(u)) continue;
      bledy.push(czeka[u]
        ? `nieprzejrzany adres: ${u} — ${czeka[u]}`
        : `nieprzejrzany adres: ${u} — nikt nie potwierdził, że istnieje`);
    }
    // Rejestr nie ma puchnąć o adresy, których już nie używamy.
    for (const u of znane)
      if (!widziane.has(u)) bledy.push(`w rejestrze został adres, którego nikt już nie używa: ${u}`);
    return bledy;
  },

  // Decyzja redakcyjna kierownika projektu z 11 października: strony serwisu
  // nie opisują narzędzi, którymi je zrobiono. Rejestr decyzji mówi, co i
  // dlaczego zmieniono, a nie czyją ręką — zdania wskazujące wykonawcę
  // zamieniono na bezosobowe. Reguła nie dotyczy repozytorium, tylko
  // tego, co trafia do czytelnika, więc kontrola patrzy na zbudowane strony.
  redakcja() {
    const bledy = [];
    const SLOWA = [/(?<![-\w])agent(a|owi|em|ach|ów|y)?\b/i, /\bsztuczn\w* inteligencj\w*/i,
                   /\bmodel\w* językow\w*/i, /\bLLM\b/, /\bChatGPT\b/i, /\bClaude\b/i,
                   /\bCopilot\b/i, /\bagent\.md\b/i];

    const zbadaj = (sciezka, tekst) => {
      for (const w of SLOWA) {
        const dop = tekst.match(w);
        if (dop) bledy.push(`${sciezka}: wzmianka o narzędziu — „${dop[0]}"`);
      }
    };

    // Strony: to, co czyta odbiorca serwisu. „User-agent" w robots.txt jest
    // nazwą pola protokołu, nie wzmianką o narzędziu.
    for (const p of zbudowane()) {
      if (p.endsWith("robots.txt")) continue;
      zbadaj(p, czytaj(p).replace(/<[^>]+>/g, " "));
    }

    // Repozytorium jest publiczne, więc reguła sięga także tekstów, które w nim
    // leżą: dokumentacji, regulaminu prac, raportów cyklu. Nie sięga kodu —
    // tam nazwy są identyfikatorami, a nie wypowiedzią projektu — i nie sięga
    // tego pliku, który z natury rzeczy musi te słowa wymienić, żeby ich
    // pilnować. Obie granice są świadome i obie są tu zapisane.
    const POMIJANE = new Set(["node_modules", "_site", "_podglad", ".git"]);
    const proza = (katalog, zebrane = []) => {
      for (const w of readdirSync(katalog, { withFileTypes: true })) {
        if (POMIJANE.has(w.name)) continue;
        const sciezka = join(katalog, w.name);
        if (w.isDirectory()) proza(sciezka, zebrane);
        else if (/\.(md|njk|txt)$/.test(w.name)) zebrane.push(sciezka);
      }
      return zebrane;
    };
    for (const p of proza(".")) {
      zbadaj(p, czytaj(p));
      // Nazwa pliku też jest wypowiedzią: „agent.md" mówi swoje, zanim ktoś
      // go otworzy.
      zbadaj(p, p.split("/").pop().replace(/\.[^.]+$/, ""));
    }
    return bledy;
  }
};

export function uruchom(nazwy = Object.keys(KONTROLE)) {
  return nazwy.map((n) => ({ kontrola: n, bledy: KONTROLE[n](), ostrzezenie: OSTRZEZENIA.has(n) }));
}

if (process.argv[1]?.endsWith("kontrole.mjs")) {
  const wyniki = uruchom();
  let zle = 0;
  for (const w of wyniki) {
    const ok = w.bledy.length === 0;
    if (!ok && !w.ostrzezenie) zle++;
    console.log(`${ok ? "OK  " : w.ostrzezenie ? "UWAGA" : "BŁĄD"} ${w.kontrola}`);
    w.bledy.forEach((b) => console.log(`       ${b}`));
  }
  process.exit(zle ? 1 : 0);
}
