// Repertuar znaków serwisu i nazwy plików krojów. Osobny moduł bez zależności,
// bo korzysta z niego i generator krojów, i kontrola — a ta nie powinna
// wciągać biblioteki do obcinania fontów tylko po to, żeby policzyć pliki.

// Łacinka polska i angielska, cyfry, interpunkcja typograficzna oraz znaki
// działań używane w opisach. Kontrola „kroje" sprawdza, czy na zbudowanych
// stronach nie pojawił się znak spoza tej listy.
export const ZNAKI = [
  " !\"#$%&'()*+,-./0123456789:;<=>?@",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`",
  "abcdefghijklmnopqrstuvwxyz{|}~",
  "ĄĆĘŁŃÓŚŹŻąćęłńóśźż",
  "ÀÁÂÄÇÈÉÊËÎÏÔÖÙÛÜàáâäçèéêëîïôöùûü",
  "°±·×÷µ−≈≠≤≥",
  "–—‘’‚“”„†‡…§¶",
  "←→↑↓π"
].join("");

export const KATALOG = "src/assets/fonts";
export const RODZINY = ["EBGaramond", "EBGaramond-Italic", "IBMPlexMono"];
export const ZAKRESY = ["latin", "latin-ext"];
export const PLIK_CSS = "src/assets/css/fonty.css";
// Spis wygenerowanych plików trafia do danych serwisu, żeby układ mógł
// zamówić wstępne pobranie krojów po nazwie z odciskiem treści.
export const PLIK_SPIS = "src/_data/kroje.json";

// Znaki spoza zakresów łacińskich fontsource nie mają glifów w żadnym z dwóch
// plików i renderują się krojem zastępczym. To świadoma zgoda, nie przeoczenie:
// idzie o pojedyncze symbole we wzorach i strzałki w nawigacji.
export const POZA_KROJEM = "π≈←→↑↓≠≤≥×÷±";
