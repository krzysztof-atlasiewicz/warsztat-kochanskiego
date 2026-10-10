export default {
  // Nazwa własna serwisu, osobno dla każdej wersji — szyld na /en/ mówił
  // dotąd po polsku. Brzmienie angielskie zgodne z nagłówkiem strony głównej.
  tytul: "Warsztat Kochańskiego",
  tytuly: { pl: "Warsztat Kochańskiego", en: "Kochański's Workshop" },
  adres: process.env.ADRES || "https://warsztat.adamandy.pl",
  jezyki: [
    { kod: "pl", nazwa: "polski", prefix: "/pl" },
    { kod: "en", nazwa: "English", prefix: "/en" }
  ]
};
