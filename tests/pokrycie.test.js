// Czy twierdzenie o przeszłości ma na czym stać.
//
// Kontrola „pokrycieZrodlami” jest zgrubna z założenia: maszyna nie odróżni
// twierdzenia historycznego od zdania o układzie strony. Te testy pilnują nie
// tego, żeby trafiała zawsze, tylko tego, żeby jej czułość nie zmieniła się
// niepostrzeżenie — w którąkolwiek stronę.
import { describe, it, expect } from "vitest";
import { OSTRZEZENIA, ZNAMIONA, odciskAkapitu, znamionaAkapitu } from "../sprawdz/kontrole.mjs";

describe("pokrycie twierdzeń źródłami", () => {
  it("jest ostrzeżeniem, nie błędem", () => {
    // Kontrola, która nie umie rozstrzygnąć sprawy sama, nie ma prawa
    // zatrzymywać budowania. Ma za to prawo nie dać o sobie zapomnieć.
    expect(OSTRZEZENIA.has("pokrycieZrodlami"), "kontrola zatrzymuje cykl").toBe(true);
  });

  it("zgłasza akapit, który mówi o przeszłości bez przypisu", () => {
    const znaki = znamionaAkapitu("", "W 1659 roku Kochański proponuje zastąpienie wahadła sprężyną.");
    expect(znaki, "akapit z rokiem i nazwiskiem przeszedł niezauważony").toContain("rok");
    expect(znaki).toContain("nazwisko");
  });

  it("milczy, gdy akapit ma własny przypis", () => {
    const z = znamionaAkapitu("", 'Konstrukcja ogłoszona w {% zrodlo "acta-1685", "Acta" %} w 1685 roku.');
    expect(z, "akapit z przypisem został zgłoszony").toHaveLength(0);
  });

  it("milczy w bloku oznaczonym jako nasze dopowiedzenie", () => {
    // Zastrzeżenie o modelu mówi o sobie samo i nie udaje twierdzenia
    // o przeszłości — nie potrzebuje podstawy w źródle, bo jej nie obiecuje.
    const z = znamionaAkapitu("note uwaga", "Model zakłada ścianę dokładnie południową; Kochański tego nie podaje.");
    expect(z, "zastrzeżenie o naszym modelu zostało zgłoszone").toHaveLength(0);
  });

  it("łapie akapit, który był rzeczywistą usterką", () => {
    // To jest próg czułości, zapisany na jedynym znanym przypadku. Zdanie
    // o trzech rachubach zegara wilanowskiego stało na stronie od pierwszego
    // dnia bez żadnej podstawy i znaleziono je w cyklu 62 przypadkiem.
    // Gdyby ta kontrola istniała wcześniej, zgłosiłaby je po roczniku.
    const usterka = "Na elewacji ogrodowej pałacu w Wilanowie, na alkierzu południowo-wschodnim, " +
      "około 1684 roku stanął stiukowy zegar słoneczny. Nie jedna tarcza, lecz trzy niezależne: " +
      "godziny równe pośrodku, po lewej zegar włoski liczony od ostatniego zachodu Słońca.";
    expect(znamionaAkapitu("", usterka), "próg czułości opadł poniżej znanej usterki").toContain("rok");
  });

  it("odcisk zależy od treści, nie od znaczników ani od odstępów", () => {
    // Inaczej zmiana wytłuszczenia albo przełamanie wiersza kasowałyby
    // akceptację i rejestr zarósłby wpisami o tych samych zdaniach.
    const a = odciskAkapitu("Richer podaje liczbę w <em>Kajennie</em>.");
    const b = odciskAkapitu("Richer   podaje liczbę\n   w Kajennie.");
    expect(b, "odcisk zmienia się od samego formatowania").toBe(a);
  });

  it("odcisk zmienia się, gdy zmienia się twierdzenie", () => {
    // Ta własność jest całym sensem rejestru: przejrzano brzmienie, nie
    // miejsce w dokumencie. Zmienione zdanie wraca do przejrzenia.
    const przed = odciskAkapitu("Richer podaje liczbę.");
    const po = odciskAkapitu("Richer podaje dwie liczby.");
    expect(po, "zmiana treści nie unieważnia akceptacji").not.toBe(przed);
  });

  it("żadne znamię nie jest puste ani nienazwane", () => {
    for (const [wzorzec, nazwa] of ZNAMIONA) {
      expect(wzorzec, "znamię bez wzorca").toBeInstanceOf(RegExp);
      expect(nazwa, "znamię bez nazwy — komunikat kontroli byłby nieczytelny").toBeTruthy();
    }
  });
});
