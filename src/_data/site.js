export default {
  tytul: "Warsztat Kochańskiego",
  adres: process.env.ADRES || "https://warsztat.adamandy.pl",
  jezyki: [
    { kod: "pl", nazwa: "polski", prefix: "/pl" },
    { kod: "en", nazwa: "English", prefix: "/en" }
  ]
};
