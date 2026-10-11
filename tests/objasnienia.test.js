// Objaśnienie kontra źródło — i dwa rodzaje odnośnika do źródła.
//
// Serwis stoi na jednym rozróżnieniu: co pochodzi z przekazu, a co dopowiadamy
// od siebie. Odnośnik do encyklopedii nie popiera niczego, tylko mówi, czym
// jest rzecz wspomniana w zdaniu — i jeśli wygląda tak samo jak odnośnik do
// skanu, rozróżnienie przestaje działać na poziomie, na którym czytelnik je
// widzi. Te testy pilnują, żeby trzy rodzaje odnośnika dało się odróżnić
// wzrokiem, zanim się w nie kliknie.
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const arkusz = readFileSync("src/assets/css/site.css", "utf8");
const zrodla = JSON.parse(readFileSync("src/_data/zrodla.json", "utf8"));
const zbudowane = existsSync("_site");

const STRONY = ["_site/pl/biografia/index.html", "_site/en/biography/index.html",
                "_site/pl/wahadlo/index.html", "_site/en/pendulum/index.html",
                "_site/pl/gnomon/index.html", "_site/en/gnomon/index.html"];

describe("rejestr źródeł nie wpuszcza encyklopedii", () => {
  it("żadne źródło nie prowadzi do Wikipedii ani podobnych", () => {
    for (const [id, z] of Object.entries(zrodla)) {
      if (!z.url) continue;
      for (const e of ["wikipedia.org", "wikidata.org", "britannica.com"])
        expect(z.url.includes(e), `${id} prowadzi do ${e}`).toBe(false);
    }
  });
});

describe("trzy rodzaje odnośnika wyglądają inaczej", () => {
  it("arkusz odróżnia skan, tekst u wydawcy i objaśnienie", () => {
    expect(arkusz, "skan nie ma własnego stylu").toMatch(/a\.zrodlo-skan\{/);
    expect(arkusz, "tekst u wydawcy bez znaku wyjścia").toMatch(/a\.zrodlo-obca::after\{[^}]*content/);
    expect(arkusz, "objaśnienie bez własnego stylu").toMatch(/a\.objasnienie\{/);
    // Objaśnienie nie dostaje znaku po słowie: pytajnik doklejony do
    // „Heweliuszem" czytał się jako wątpliwość co do Heweliusza.
    expect(arkusz, "objaśnienie znów nosi znak po słowie")
      .not.toMatch(/a\.objasnienie::after\{[^}]*content/);
    expect(arkusz, "objaśnienie nie odróżnia się krojem kreski")
      .toMatch(/a\.objasnienie\{[^}]*text-decoration-style:dashed/);
  });

  it("objaśnienie nie ma barwy źródła", () => {
    const o = arkusz.match(/a\.objasnienie\{[^}]*\}/)[0];
    expect(o, "objaśnienie w barwie źródła — nie da się ich odróżnić").not.toContain("var(--verd)");
  });
});

describe.skipIf(!zbudowane)("odnośniki na zbudowanych stronach", () => {
  for (const plik of STRONY) {
    const html = existsSync(plik) ? readFileSync(plik, "utf8") : "";

    it(`${plik}: każde objaśnienie wychodzi na zewnątrz, w nowej karcie`, () => {
      for (const m of html.matchAll(/<a class="objasnienie"[^>]*>/g)) {
        expect(m[0], "objaśnienie nie prowadzi poza serwis").toMatch(/href="https?:\/\//);
        expect(m[0], "objaśnienie nie otwiera się w nowej karcie").toContain('target="_blank"');
        expect(m[0], "objaśnienie bez rel=noopener").toContain('rel="noopener"');
        expect(m[0], "objaśnienie nie mówi, czego dotyczy").toMatch(/title="[^"]{10,}"/);
      }
    });

    it(`${plik}: żaden odnośnik nie jest naraz źródłem i objaśnieniem`, () => {
      for (const m of html.matchAll(/<a class="([^"]*)"/g)) {
        const k = m[1].split(/\s+/);
        expect(k.includes("objasnienie") && k.includes("zrodlo"),
          "odnośnik udaje dwie rzeczy naraz").toBe(false);
      }
    });

    it(`${plik}: odnośnik do źródła mówi w tytule, gdzie się otworzy`, () => {
      // Skan otwiera się w okienku nad stroną, tekst u wydawcy w nowej karcie.
      // Dotąd oba wyglądały tak samo i czytelnik dowiadywał się po kliknięciu.
      for (const m of html.matchAll(/<a class="zrodlo (zrodlo-skan|zrodlo-obca)"[^>]*title="([^"]*)"/g)) {
        const [, rodzaj, tytul] = m;
        expect(tytul, `${rodzaj} bez zapowiedzi w tytule`).toMatch(/ — .+$/);
        if (rodzaj === "zrodlo-skan")
          expect(tytul).toMatch(/(otwiera się tutaj|opens here)/);
        else
          expect(tytul).toMatch(/(u wydawcy|at the publisher)/);
      }
    });

    it(`${plik}: skan osadza się, a tekst u wydawcy nie`, () => {
      for (const m of html.matchAll(/<a class="zrodlo zrodlo-skan"[^>]*>/g))
        expect(m[0], "skan bez adresu osadzenia").toContain("data-osadzenie=");
      for (const m of html.matchAll(/<a class="zrodlo zrodlo-obca"[^>]*>/g)) {
        expect(m[0], "tekst u wydawcy z adresem osadzenia").not.toContain("data-osadzenie=");
        expect(m[0], "tekst u wydawcy nie otwiera się w nowej karcie").toContain('target="_blank"');
      }
    });
  }

  it("biografia niesie objaśnienia w obu wersjach językowych", () => {
    for (const plik of ["_site/pl/biografia/index.html", "_site/en/biography/index.html"]) {
      const n = [...readFileSync(plik, "utf8").matchAll(/<a class="objasnienie"/g)].length;
      expect(n, `${plik}: brak objaśnień`).toBeGreaterThanOrEqual(5);
    }
  });

  it("objaśnienie prowadzi do encyklopedii w języku strony — albo mówi, że nie", () => {
    // Zasada: czytelnik dostaje hasło w swoim języku. Wyjątek jest możliwy,
    // bo nie każde hasło istnieje w obu wersjach Wikipedii — Kaspar Schott ma
    // tylko angielskie. Wtedy odnośnik musi o tym uprzedzić w swoim tytule,
    // żeby nikt nie trafił niespodziewanie na obcy język.
    for (const [plik, jezyk, ostrzezenie] of [
      ["_site/pl/biografia/index.html", "pl", /po angielsku|polska Wikipedia go nie ma/],
      ["_site/en/biography/index.html", "en", /in Polish|English Wikipedia does not have/]
    ]) {
      const html = readFileSync(plik, "utf8");
      for (const m of html.matchAll(/<a class="objasnienie"[^>]*href="([^"]+)"[^>]*title="([^"]*)"/g)) {
        const [, url, tytul] = m;
        if (url.startsWith(`https://${jezyk}.`)) continue;
        expect(tytul, `${plik}: ${url} prowadzi do obcego języka bez uprzedzenia`)
          .toMatch(ostrzezenie);
      }
    }
  });

  it("zdanie o porażkach nazywa rzecz po imieniu", () => {
    expect(readFileSync("_site/pl/biografia/index.html", "utf8"))
      .toContain("apologią i ubrązawianiem postaci");
    expect(readFileSync("_site/en/biography/index.html", "utf8"))
      .toContain("would be hagiography");
  });
});

// Rejestr sprawdzonych adresów. Agent nie ma dostępu do sieci, więc nie jest
// w stanie potwierdzić, że adres objaśnienia w ogóle istnieje — i właśnie
// dlatego nie wolno mu wierzyć na słowo. W cyklu 57 wpisał osiem adresów
// z pamięci i dwa okazały się nieistniejące.
describe("rejestr sprawdzonych adresów", () => {
  const rejestr = JSON.parse(readFileSync("sprawdz/objasnienia-sprawdzone.json", "utf8"));

  it("każdy sprawdzony adres niesie datę sprawdzenia", () => {
    for (const [url, data] of Object.entries(rejestr.adresy))
      expect(data, `${url} bez daty sprawdzenia`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("adres nie może być naraz sprawdzony i oczekujący", () => {
    for (const u of Object.keys(rejestr.oczekuje || {}))
      expect(rejestr.adresy[u], `${u} stoi w obu wykazach`).toBeUndefined();
  });

  it("każdy oczekujący adres mówi, dlaczego czeka", () => {
    for (const [url, powod] of Object.entries(rejestr.oczekuje || {}))
      expect(powod.length, `${url} czeka bez podanego powodu`).toBeGreaterThan(10);
  });

  it.skipIf(!zbudowane)("żaden adres ze stron nie jest nieznany rejestrowi", () => {
    // Nieznany to taki, którego nie ma ani wśród sprawdzonych, ani wśród
    // oczekujących — czyli dopisany bez żadnej próby sprawdzenia.
    const znane = new Set([...Object.keys(rejestr.adresy), ...Object.keys(rejestr.oczekuje || {})]);
    for (const plik of STRONY) {
      if (!existsSync(plik)) continue;
      for (const m of readFileSync(plik, "utf8").matchAll(/<a class="objasnienie"[^>]*href="([^"]+)"/g))
        expect(znane.has(m[1]), `${plik}: adres ${m[1]} dopisany bez próby sprawdzenia`).toBe(true);
    }
  });
});

// A4: cel warsztatowy przeszedł z naszej interpretacji do przekazu źródłowego.
// Test pilnuje nie samego faktu zamknięcia pozycji — to należy do kontroli
// agendy — tylko tego, czy strona mówi to, co mówi druk, i czy nie wróciło
// zdanie, które druk prostuje.
describe.skipIf(!zbudowane)("cel konstrukcji cyklometrycznej", () => {
  for (const [plik, cytaty, zniesione] of [
    ["_site/pl/cyrkiel/index.html",
     ["ad facilitandam Praxin accommodat", "Praxibus mechanicis utilia",
      "GRAMM", "Ad Usus Mechanicos", "Mechanicorum Circino opportunissimam",
      "aciem oculorum effugere", "Demonstratur calculo Trigonometrico"],
     ["a nie do rachunku", "interpretacja celu"]],
    ["_site/en/compass/index.html",
     ["ad facilitandam Praxin accommodat", "Praxibus mechanicis utilia",
      "GRAMM", "Ad Usus Mechanicos", "Mechanicorum Circino opportunissimam",
      "aciem oculorum effugere", "Demonstratur calculo Trigonometrico"],
     ["rather than computed", "reading of intent"]]
  ]) {
    const html = existsSync(plik) ? readFileSync(plik, "utf8") : "";

    it(`${plik}: niesie słowa autora o celu, z numerami stron`, () => {
      for (const c of cytaty) expect(html, `brak cytatu: ${c}`).toContain(c);
      for (const s of ["394", "397", "398"])
        expect(html, `brak numeru strony ${s}`).toContain(s);
    });

    it(`${plik}: przeciwstawienie rysunku rachunkowi nie jest już twierdzeniem`, () => {
      // Fraza wolno, żeby padła w zdaniu, które ją prostuje — i właśnie tam
      // pada. Zakazana jest tam, gdzie była twierdzeniem: w oznaczeniu.
      const tagi = html.slice(html.indexOf('<p class="tagi">'), html.indexOf("</p>", html.indexOf('<p class="tagi">')));
      for (const s of zniesione)
        expect(tagi, `oznaczenie wciąż twierdzi: „${s}"`).not.toContain(s);
      // A samo sprostowanie musi stać na stronie, bo bez niego zniknięcie
      // tezy wyglądałoby na ciche wycofanie się z niej.
      expect(html, "brak sprostowania dawnego sformułowania")
        .toMatch(/(była nasza i nietrafna|was ours, and it was wrong)/);
    });

    it(`${plik}: oznaczenia nadal tworzą parę źródło + nasze`, () => {
      const tagi = [...html.matchAll(/<span class="tag (zrodlo|rekonstrukcja)"/g)].map((m) => m[1]);
      expect(tagi, "para oznaczeń rozpadła się").toEqual(["zrodlo", "rekonstrukcja"]);
    });
  }

  it("ligatury z druku mieszczą się w repertuarze kroju", () => {
    // Cytatu nie wolno przepisać inaczej, niż stoi w druku, więc repertuar
    // ustępuje źródłu, a nie odwrotnie.
    const repertuar = readFileSync("scripts/kroje-dane.mjs", "utf8");
    for (const znak of ["Æ", "æ"])
      expect(repertuar, `znak „${znak}" poza repertuarem`).toContain(znak);
  });
});
