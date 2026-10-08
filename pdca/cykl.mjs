#!/usr/bin/env node
// Jeden obrót pętli PDCA. Planuj → Wykonaj są pracą człowieka lub agenta;
// ten skrypt realizuje Sprawdź i przygotowuje Popraw, zapisując ślad.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { uruchom } from "../sprawdz/kontrole.mjs";

const stan = JSON.parse(readFileSync("pdca/stan.json", "utf8"));
const agenda = JSON.parse(readFileSync("pdca/agenda.json", "utf8"));
const cykl = stan.cykl + 1;
const data = new Date().toISOString().slice(0, 10);

const krok = (nazwa, cmd) => {
  try { execSync(cmd, { stdio: "pipe" }); return { nazwa, ok: true }; }
  catch (e) { return { nazwa, ok: false, wyjscie: String(e.stdout || e.message).slice(-600) }; }
};

const budowa = [krok("budowa", "npx eleventy"), krok("testy", "npx vitest run")];
const kontrole = budowa.every((k) => k.ok) ? uruchom() : [];

const bramka = stan.bramka.warunki.map((w) => {
  if (w.typ === "ludzki") return { ...w, wynik: w.spelniony ? "spełniony" : "czeka na człowieka" };
  if (w.kontrola === "budowa") return { ...w, wynik: budowa.every((k) => k.ok) ? "spełniony" : "niespełniony" };
  const k = kontrole.find((x) => x.kontrola === w.kontrola);
  if (!k) return { ...w, wynik: "nie uruchomiono" };
  if (!k.bledy.length) return { ...w, wynik: "spełniony" };
  return { ...w, wynik: k.ostrzezenie ? "ostrzeżenie" : "niespełniony" };
});

const otwarte = agenda.pozycje.filter((p) => p.status === "otwarta");
const usterki = [
  ...budowa.filter((k) => !k.ok).map((k) => `${k.nazwa}: niepowodzenie`),
  ...kontrole.filter((k) => !k.ostrzezenie).flatMap((k) => k.bledy.map((b) => `${k.kontrola}: ${b}`))
];
const ostrzezenia = kontrole.filter((k) => k.ostrzezenie).flatMap((k) => k.bledy.map((b) => `${k.kontrola}: ${b}`));

const blokady = bramka.filter((w) => w.wynik !== "spełniony" && w.wynik !== "ostrzeżenie");
const raport = `# Cykl ${cykl} — ${data}

Faza ${stan.faza}, wersja ${stan.wersja}, bramka ${stan.bramka.id}.

## Sprawdź

${bramka.map((w) => `- ${w.wynik === "spełniony" ? "✓" : w.wynik === "ostrzeżenie" ? "!" : "✗"} **${w.id}** ${w.opis} — ${w.wynik}`).join("\n")}

## Ostrzeżenia

${ostrzezenia.length ? ostrzezenia.map((o) => `- ${o}`).join("\n") : "Brak."}

## Usterki do naprawy w tym cyklu

${usterki.length ? usterki.map((u) => `- ${u}`).join("\n") : "Brak. Wszystkie kontrole automatyczne przechodzą."}

## Popraw — co robimy dalej

${usterki.length
  ? "1. Naprawić usterki powyżej przed dodawaniem nowej treści. Kontrole automatyczne mają priorytet nad rozwojem funkcji."
  : blokady.length
    ? `1. Kontrole automatyczne czyste. Bramka ${stan.bramka.id} czeka na: ${blokady.map((b) => b.id).join(", ")}. To decyzje ludzkie — eskalacja do kierownika projektu.`
    : `1. Bramka ${stan.bramka.id} spełniona w całości. Przejście do kolejnej fazy wymaga formalnej decyzji, nie automatu.`}
2. Agenda badawcza: ${otwarte.length} pozycji otwartych (${otwarte.map((p) => p.id).join(", ") || "brak"}).
${otwarte.length ? "3. Żadna pozycja agendy nie może zostać zamknięta przez agenta. Zamyka ją człowiek, wpisem do rejestru decyzji." : ""}

## Ślad

Raport wygenerowany automatycznie przez \`npm run cykl\`. Nie edytować ręcznie — komentarze dopisywać w \`src/pl/decyzje.md\`.
`;

mkdirSync("pdca/cykle", { recursive: true });
writeFileSync(`pdca/cykle/cykl-${String(cykl).padStart(3, "0")}.md`, raport);
stan.cykl = cykl;
stan.ostatniCykl = data;
stan.bramka.warunki = stan.bramka.warunki.map((w, i) => ({ ...w, ostatniWynik: bramka[i].wynik }));
writeFileSync("pdca/stan.json", JSON.stringify(stan, null, 2) + "\n");

console.log(raport);
process.exit(usterki.length ? 1 : 0);
