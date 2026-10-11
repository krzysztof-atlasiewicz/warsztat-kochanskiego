export default {
  // Nazwa własna serwisu, osobno dla każdej wersji — szyld na /en/ mówił
  // dotąd po polsku. Brzmienie angielskie zgodne z nagłówkiem strony głównej.
  tytul: "Warsztat Kochańskiego",
  tytuly: { pl: "Warsztat Kochańskiego", en: "Kochański's Workshop" },
  adres: process.env.ADRES || "https://warsztat.adamandy.pl",
  // Adres do korespondencji, osobno dla każdej wersji językowej. Stoi tutaj,
  // a nie w szablonach, bo regulamin i polityka prywatności będą go
  // potrzebowały i dwa wpisane ręcznie adresy rozjechałyby się po pierwszej
  // zmianie. Zmiana w jednym miejscu, test pilnuje obu stron.
  poczta: { pl: "kontakt@adamandy.pl", en: "office@adamandy.pl" },
  jezyki: [
    { kod: "pl", nazwa: "polski", prefix: "/pl" },
    { kod: "en", nazwa: "English", prefix: "/en" }
  ]
};
