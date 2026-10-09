// Jeden wiersz wykonywany przed arkuszem: oznacza dokument jako obsługiwany
// skryptem, żeby arkusz mógł od pierwszej klatki przyjąć układ z zakładkami
// zamiast awaryjnego. Musi być osobnym plikiem, nie wierszem w dokumencie:
// polityka bezpieczeństwa treści serwisu ma „script-src 'self'" i skrypt
// wpisany wprost w stronę jest blokowany — na serwerze, choć nie u siebie.
document.documentElement.classList.add("js");
