import { ALFABET, KLUCZ, JAWNY, CZESTOSCI, przesun, uprosc, szyfruj, odszyfruj,
  ocenyPrzesuniec, najlepszePrzesuniecie } from "./matematyka.js";

const NS = "http://www.w3.org/2000/svg";
const SZYFROGRAM_1664 = przesun(JAWNY, KLUCZ);

export default function init(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const n = JSON.parse(root.querySelector("[data-napisy]")?.dataset.napisy || "{}");
  let zrodlo = "szyfr";      // które pole było ostatnio zmieniane
  let nietkniete = true;     // nikt jeszcze nie ruszył przyrządu
  let wybrana = null;        // litera podświetlona na tarczy i pasku
  let obrot = 0;             // o ile pozycji przekręcony jest pierścień

  const SR = 160, KROK = 360 / 26;
  // Przekręcenie pierścienia to już ruch: od tej chwili pole wiadomości
  // pokazuje, co z zapisu wychodzi przy tym nastawieniu.
  const ustawObrot = (v) => {
    nietkniete = false;
    obrot = ((Math.round(v) % 26) + 26) % 26;
    odswiezWszystko();
  };

  const podstaw = (wzor, dane) =>
    String(wzor || "").replace(/\{(\w+)\}/g, (_, k) => dane[k] ?? "");

  // ── tarcza ────────────────────────────────────────────────────────────────
  const naObwodzie = (promien, pozycja) => {
    const a = ((-90 + pozycja * KROK) * Math.PI) / 180;
    return [SR + promien * Math.cos(a), SR + promien * Math.sin(a)];
  };
  const el = (nazwa, atrybuty) => {
    const e = document.createElementNS(NS, nazwa);
    for (const [k, v] of Object.entries(atrybuty)) e.setAttribute(k, v);
    return e;
  };

  // Radełkowana krawędź i ząbki podziałki rysujemy raz — nie zależą od obrotu.
  (function oprawa() {
    const r = $("radelko");
    for (let i = 0; i < 78; i++) {
      const a = (i * 360 / 78 * Math.PI) / 180;
      r.append(el("line", {
        x1: (SR + 145 * Math.cos(a)).toFixed(1), y1: (SR + 145 * Math.sin(a)).toFixed(1),
        x2: (SR + 152 * Math.cos(a)).toFixed(1), y2: (SR + 152 * Math.sin(a)).toFixed(1),
        stroke: "var(--mosiadz-ciemny)", "stroke-width": "1.6", opacity: "0.55"
      }));
    }
    const z = $("zabki");
    for (let i = 0; i < 26; i++) {
      const [x1, y1] = naObwodzie(137, i + 0.5);
      const [x2, y2] = naObwodzie(128, i + 0.5);
      z.append(el("line", { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1),
        stroke: "var(--rule)", "stroke-width": "0.8" }));
      const [x3, y3] = naObwodzie(112, i + 0.5);
      const [x4, y4] = naObwodzie(104, i + 0.5);
      z.append(el("line", { x1: x3.toFixed(1), y1: y3.toFixed(1), x2: x4.toFixed(1), y2: y4.toFixed(1),
        stroke: "var(--mosiadz-ciemny)", "stroke-width": "0.7", opacity: "0.6" }));
    }
  })();

  function tarcza(s) {
    const g = $("litery");
    g.replaceChildren();
    const litera = (promien, pozycja, ch, wewnetrzny, podswietl) => {
      const [x, y] = naObwodzie(promien, pozycja);
      const t = el("text", {
        class: "litera" + (wewnetrzny ? " wewnetrzna" : " zewnetrzna") + (podswietl ? " wyrozniona" : ""),
        x: x.toFixed(1), y: (y + 4.5).toFixed(1), "text-anchor": "middle"
      });
      t.dataset.litera = ch;
      t.append(document.createTextNode(ch));
      t.addEventListener("click", (e) => {
        e.stopPropagation();
        wybrana = wewnetrzny ? ch : przesun(ch, -s);
        odswiezPasek();
      });
      g.append(t);
    };
    for (let i = 0; i < 26; i++)
      litera(122, i, ALFABET[i], false, wybrana !== null && przesun(wybrana, s) === ALFABET[i]);
    for (let j = 0; j < 26; j++)
      litera(89, (j + s) % 26, ALFABET[j], true, wybrana === ALFABET[j]);

    // Znacznik na ruchomym pierścieniu — po nim widać, że pierścień się obrócił.
    const w = $("wskaznikWew");
    w.replaceChildren();
    w.append(el("line", {
      x1: naObwodzie(72, s)[0].toFixed(1), y1: naObwodzie(72, s)[1].toFixed(1),
      x2: naObwodzie(102, s)[0].toFixed(1), y2: naObwodzie(102, s)[1].toFixed(1),
      stroke: "var(--sun)", "stroke-width": "2", "stroke-linecap": "round"
    }));
    w.append(el("circle", {
      cx: naObwodzie(102, s)[0].toFixed(1), cy: naObwodzie(102, s)[1].toFixed(1),
      r: "3", fill: "var(--sun)"
    }));
  }

  // ── pasek odwzorowania: ta sama tarcza rozwinięta w linię ─────────────────
  function odswiezPasek() {
    const s = obrot;
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
    const s = obrot;
    $("srodek").textContent = s;
    $("tarcza").setAttribute("aria-valuenow", s);
    $("tarcza").setAttribute("aria-valuetext", podstaw(n.wartoscTarczy, { n: s }));
    // Przy pierwszym wejsciu pole wiadomosci zostaje puste: pierscien stoi na
    // zerze, wiec „odszyfrowanie" przepisywaloby zapis znak w znak i obok
    // siebie stalyby dwa te same ciagi. Podpowiedz w pustym polu mowi, co
    // z tym zrobic. Od pierwszego ruchu — pokretla albo klawiatury — pola
    // pracuja normalnie: wpis w wiadomosc szyfruje, wpis w zapis odszyfrowuje.
    if (zrodlo === "jawny") $("szyfrogram").value = szyfruj($("jawny").value, s);
    else if (!nietkniete) $("jawny").value = odszyfruj($("szyfrogram").value, s);

    const trafione = uprosc($("jawny").value).trim() === JAWNY;
    $("pierscien").setAttribute("stroke", trafione ? "var(--verd)" : "var(--rule)");
    $("pierscien").setAttribute("stroke-width", trafione ? "2" : "0.8");
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

  $("jawny").addEventListener("input", () => { nietkniete = false; zrodlo = "jawny"; odswiezWszystko(); });
  $("szyfrogram").addEventListener("input", () => { nietkniete = false; zrodlo = "szyfr"; odswiezWszystko(); });
  // ── obracanie tarczy: wskaźnikiem, kółkiem myszy i klawiaturą ─────────────
  const tarczaEl = $("tarcza");
  const pozycjaZeZdarzenia = (e) => {
    const r = tarczaEl.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 320 - SR;
    const y = ((e.clientY - r.top) / r.height) * 320 - SR;
    if (Math.hypot(x, y) < 34) return null;           // piasta w środku nie obraca
    const kat = (Math.atan2(y, x) * 180) / Math.PI + 90;
    return (((kat / KROK) % 26) + 26) % 26;
  };
  let ciagnie = false, chwytPozycja = 0, chwytObrot = 0;

  tarczaEl.addEventListener("pointerdown", (e) => {
    const p = pozycjaZeZdarzenia(e);
    if (p === null) return;
    ciagnie = true; chwytPozycja = p; chwytObrot = obrot;
    try { tarczaEl.setPointerCapture?.(e.pointerId); } catch { /* bez przechwycenia */ }
    tarczaEl.classList.add("ciagniety");
  });
  tarczaEl.addEventListener("pointermove", (e) => {
    if (!ciagnie) return;
    const p = pozycjaZeZdarzenia(e);
    if (p === null) return;
    ustawObrot(chwytObrot + (p - chwytPozycja));
  });
  const koniecCiagniecia = (e) => {
    if (!ciagnie) return;
    ciagnie = false;
    tarczaEl.classList.remove("ciagniety");
    try { tarczaEl.releasePointerCapture?.(e.pointerId); } catch { /* bez przechwycenia */ }
  };
  tarczaEl.addEventListener("pointerup", koniecCiagniecia);
  tarczaEl.addEventListener("pointercancel", koniecCiagniecia);

  tarczaEl.addEventListener("wheel", (e) => {
    e.preventDefault();
    ustawObrot(obrot + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  tarczaEl.addEventListener("keydown", (e) => {
    const ruch = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (ruch !== undefined) { e.preventDefault(); ustawObrot(obrot + ruch); return; }
    if (e.key === "Home") { e.preventDefault(); ustawObrot(0); }
    if (e.key === "End") { e.preventDefault(); ustawObrot(25); }
  });
  $("jezykAnalizy").addEventListener("change", odswiezKroki);

  $("lam").addEventListener("click", () => {
    const zapis = $("szyfrogram").value;
    if (!/[A-Z]/.test(uprosc(zapis))) { powiedz(n.pusto || ""); return; }
    const { przesuniecie } = najlepszePrzesuniecie(zapis, $("jezykAnalizy").value);
    zrodlo = "szyfr";
    ustawObrot(przesuniecie);
    $("kroki").open = true;
    powiedz(podstaw(n.zlamane, { n: przesuniecie }));
  });

  $("kopiuj").addEventListener("click", () => doSchowka($("szyfrogram").value, n.skopiowano || ""));
  $("odnosnik").addEventListener("click", () =>
    doSchowka(location.href.split("#")[0] + "#z=" + encodeURIComponent($("szyfrogram").value), n.odnosnikGotowy || ""));
  $("historyczny").addEventListener("click", () => {
    $("szyfrogram").value = SZYFROGRAM_1664;
    zrodlo = "szyfr";
    ustawObrot(0);
    // Przywrócenie zapisu z 1664 roku to powrót do stanu wyjściowego, więc
    // pole wiadomości znów stoi puste — jest co łamać.
    nietkniete = true;
    $("jawny").value = "";
    odswiezWszystko();
    powiedz(n.wczytano || "");
  });

  // Zapis podany w adresie ma pierwszeństwo przed zapisem z 1664 roku.
  const zHasza = new URLSearchParams(location.hash.slice(1)).get("z");
  $("szyfrogram").value = zHasza || SZYFROGRAM_1664;
  if (zHasza) powiedz(n.zOdnosnika || "");
  odswiezWszystko();
}
