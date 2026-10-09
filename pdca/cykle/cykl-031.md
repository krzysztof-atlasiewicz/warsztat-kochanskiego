# Cykl 31 — 2026-10-09

Faza A, wersja 0.9-dev, bramka GA.

## Sprawdź

- ✗ **GA1** Redaktor merytoryczny zaakceptował całość tekstu — czeka na człowieka
- ✗ **GA2** Żadne twierdzenie o pierwszeństwie bez zastrzeżenia — czeka na człowieka
- ✓ **GA3** Każdy element rekonstruowany oznaczony w miejscu wystąpienia — spełniony
- ✓ **GA4** Agenda badawcza kompletna i powiązana z modułami — spełniony
- ✓ **GA5** Status wersji widoczny na każdej stronie — spełniony
- ✓ **GA6** Testy i budowa przechodzą — spełniony
- ✓ **GA7** Budżet wagi strony dotrzymany — spełniony
- ✓ **GA8** Każdy przyrząd ma wersję w obu językach — spełniony
- ✓ **GA9** Każdy przyrząd ma wersję osadzalną — spełniony
- ✗ **GA10** Kroje pisma osadzone w repozytorium — niespełniony
- ✓ **GA11** Wzmianki o źródłach z ustalonym skanem są podlinkowane — spełniony
- ✓ **GA12** Konfiguracja wdrożenia zgadza się z adresem serwisu — spełniony
- ✓ **GA13** Znak graficzny obecny i podpięty na każdej stronie — spełniony
- ✗ **GA14** Wzory zapisane w MathML, nie znakiem pierwiastka — niespełniony
- ✓ **GA15** Długa pamięć podręczna tylko dla plików z odciskiem treści — spełniony

## Ostrzeżenia

Brak.

## Usterki do naprawy w tym cyklu

- wzory: _site/pl/decyzje/index.html: wzór zapisany znakiem √ zamiast w MathML
- kroje: znak „√" (U+221A) nie mieści się w obciętym kroju — _site/pl/decyzje/index.html; rozszerz ZNAKI w scripts/kroje-dane.mjs

## Popraw — co robimy dalej

1. Naprawić usterki powyżej przed dodawaniem nowej treści. Kontrole automatyczne mają priorytet nad rozwojem funkcji.
2. Agenda badawcza: 4 pozycji otwartych (A1, A3, A4, A7).
3. Żadna pozycja agendy nie może zostać zamknięta przez agenta. Zamyka ją człowiek, wpisem do rejestru decyzji.

## Ślad

Raport wygenerowany automatycznie przez `npm run cykl`. Nie edytować ręcznie — komentarze dopisywać w `src/pl/decyzje.md`.
