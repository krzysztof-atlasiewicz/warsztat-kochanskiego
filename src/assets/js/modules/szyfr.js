import { ALFABET, KLUCZ, JAWNY, CZESTOSCI, przesun, uprosc, szyfruj, odszyfruj,
  ocenyPrzesuniec, najlepszePrzesuniecie } from "./matematyka.js";

const NS = "http://www.w3.org/2000/svg";
const SZYFROGRAM_1664 = przesun(JAWNY, KLUCZ);

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const n = JSON.parse(root.querySelector("[data-napisy]")?.dataset.napisy || "{}");
  let zrodlo = "szyfr";      // które pole było ostatnio zmieniane
  let wybrana = null;        // litera podświetlona na tarczy i pasku

  const podstaw = (wzor, dane) =>
    String(wzor || "").replace(/\{(\w+)\}/g, (_, k) => dane[k] ?? "");

  // ── tarcza ────────────────────────────────────────────────────────────────
  function tarcza(s) {
    const g = $("litery");
    g.replaceChildren();
    const litera = (x, y, ch, pierscienWew, podswietl) => {
      const t = document.createElementNS(NS, "text");
      t.setAttribute("class", "t litera" + (podswietl ? " wyrozniona" : ""));
      t.setAttribute("x", x.toFixed(1));
      t.setAttribute("y", (y + 3.5).toFixed(1));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", podswietl ? "var(--sun)" : pierscienWew ? "var(--verd)" : "currentColor");
      t.dataset.litera = ch;
      t.append(document.createTextNode(ch));
      t.addEventListener("click", () => { wybrana = pierscienWew ? ch : przesun(ch, -s); odswiezPasek(); });
      g.append(t);
    };
    for (let i = 0; i < 26; i++) {
      const a = ((-90 + i * 13.8462) * Math.PI) / 180;
      const zapis = ALFABET[i];
      litera(190 + 86 * Math.cos(a), 108 + 86 * Math.sin(a), zapis,
        false, wybrana !== null && przesun(wybrana, s) === zapis);
    }
    for (let j = 0; j < 26; j++) {
      const b = ((-90 + ((j + s) % 26) * 13.8462) * Math.PI) / 180;
      litera(190 + 60 * Math.cos(b), 108 + 60 * Math.sin(b), ALFABET[j],
        true, wybrana === ALFABET[j]);
    }
  }

  // ── pasek odwzorowania: ta sama tarcza rozwinięta w linię ─────────────────
  function odswiezPasek() {
    const s = Number($("obrot").value);
    const uzyte = new Set(uprosc($("jawny").value).replace(/[^A-Z]/g, ""));
    const pasek = $("pasek");
    pasek.replaceChildren();
    for (let i = 0; i < 26; i++) {
      const jawna = ALFABET[i], zapis = przesun(jawna, s);
      const kol = document.createElement("button");
      kol.type = "button";
      kol.className = "para-kol"
        + (uzyte.has(jawna) ? " uzyta" : "")
        + (wybrana === jawna ? " wyrozniona" : "");
      kol.innerHTML = `<span class="g">${jawna}</span><span class="d">${zapis}</span>`;
      kol.title = podstaw(n.paraOpis, { a: jawna, b: zapis });
      kol.addEventListener("click", () => { wybrana = wybrana === jawna ? null : jawna; odswiezWszystko(); });
      pasek.append(kol);
    }
    $("para").textContent = wybrana
      ? podstaw(n.para, { a: wybrana, b: przesun(wybrana, s), n: s })
      : (n.paraBrak || "");
    tarcza(s);
  }

  // ── kroki łamania: liczby z bieżącego zapisu, nie z przykładu ─────────────
  function odswiezKroki() {
    const jezyk = $("jezykAnalizy").value;
    const zapis = uprosc($("szyfrogram").value).replace(/[^A-Z]/g, "");
    const lista = $("krokiLista");
    lista.replaceChildren();
    const dodaj = (tekst) => {
      const li = document.createElement("li");
      li.textContent = tekst;
      lista.append(li);
    };
    if (zapis.length < 4) { dodaj(n.krokiPuste || ""); return; }

    const licznik = new Array(26).fill(0);
    for (const ch of zapis) licznik[ALFABET.indexOf(ch)]++;
    const najwZapisie = licznik.indexOf(Math.max(...licznik));
    const w = CZESTOSCI[jezyk];
    const najwJezyku = w.indexOf(Math.max(...w));
    const kandydat = (najwZapisie - najwJezyku + 26) % 26;

    const oceny = ocenyPrzesuniec(zapis, jezyk);
    const ranking = oceny.map((v, s) => ({ s, v })).sort((a, b) => b.v - a.v).slice(0, 3);
    const naj = ranking[0].s;

    dodaj(podstaw(n.krok1, {
      liter: zapis.length,
      c: ALFABET[najwZapisie],
      n: licznik[najwZapisie]
    }));
    dodaj(podstaw(n.krok2, { jezyk: $("jezykAnalizy").selectedOptions[0].textContent, d: ALFABET[najwJezyku] }));
    dodaj(podstaw(n.krok3, { c: ALFABET[najwZapisie], d: ALFABET[najwJezyku], k: kandydat }));
    dodaj(podstaw(n.krok4, {
      lista: ranking.map((r) => `${r.s} (${r.v.toFixed(2)})`).join(", ")
    }));
    if (kandydat !== naj) dodaj(podstaw(n.krok4Inny, { k: kandydat }));
    dodaj(podstaw(n.krok5, { naj, odczyt: odszyfruj($("szyfrogram").value, naj).slice(0, 48) }));
  }

  function odswiezWszystko() {
    const s = Number($("obrot").value);
    $("obrotO").textContent = s;
    $("srodek").textContent = s;
    if (zrodlo === "jawny") $("szyfrogram").value = szyfruj($("jawny").value, s);
    else $("jawny").value = odszyfruj($("szyfrogram").value, s);

    const trafione = uprosc($("jawny").value).trim() === JAWNY;
    $("pierscien").setAttribute("stroke", trafione ? "var(--verd)" : "var(--rule)");
    $("rozwiazane").classList.toggle("hide", !trafione);
    $("jawny").classList.toggle("hit", trafione);

    odswiezPasek();
    odswiezKroki();
  }

  const powiedz = (tekst) => { $("komunikat").textContent = tekst; };

  async function doSchowka(tekst, potwierdzenie) {
    try { await navigator.clipboard.writeText(tekst); powiedz(potwierdzenie); }
    catch { powiedz(n.schowekNie || ""); }
  }

  $("jawny").addEventListener("input", () => { zrodlo = "jawny"; odswiezWszystko(); });
  $("szyfrogram").addEventListener("input", () => { zrodlo = "szyfr"; odswiezWszystko(); });
  $("obrot").addEventListener("input", odswiezWszystko);
  $("jezykAnalizy").addEventListener("change", odswiezKroki);

  $("lam").addEventListener("click", () => {
    const zapis = $("szyfrogram").value;
    if (!/[A-Z]/.test(uprosc(zapis))) { powiedz(n.pusto || ""); return; }
    const { przesuniecie } = najlepszePrzesuniecie(zapis, $("jezykAnalizy").value);
    $("obrot").value = przesuniecie;
    zrodlo = "szyfr";
    odswiezWszystko();
    $("kroki").open = true;
    powiedz(podstaw(n.zlamane, { n: przesuniecie }));
  });

  $("kopiuj").addEventListener("click", () => doSchowka($("szyfrogram").value, n.skopiowano || ""));
  $("odnosnik").addEventListener("click", () =>
    doSchowka(location.href.split("#")[0] + "#z=" + encodeURIComponent($("szyfrogram").value), n.odnosnikGotowy || ""));
  $("historyczny").addEventListener("click", () => {
    $("szyfrogram").value = SZYFROGRAM_1664;
    $("obrot").value = 0;
    zrodlo = "szyfr";
    odswiezWszystko();
    powiedz(n.wczytano || "");
  });

  // Zapis podany w adresie ma pierwszeństwo przed zapisem z 1664 roku.
  const zHasza = new URLSearchParams(location.hash.slice(1)).get("z");
  $("szyfrogram").value = zHasza || SZYFROGRAM_1664;
  if (zHasza) powiedz(n.zOdnosnika || "");
  odswiezWszystko();
}
