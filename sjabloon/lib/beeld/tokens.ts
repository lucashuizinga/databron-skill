// Dezelfde kleuren als de tokens in app/globals.css, voor plekken zonder CSS (het deelbeeld via Satori).
// Wijzig je hier iets, wijzig het dan ook in globals.css (en omgekeerd).
//
// Het palet is getest op kleurenblindheid (deuteranopie, protanopie, tritanopie): blauw #2a64b8, oranje #d9662f,
// groen #1a9a6c en oker #c98b00 blijven onderling te onderscheiden, en het onderwerp (oranje) staat altijd naast grijs.

export const licht = {
  papier: "#fbfaf7",
  vlak: "#f3f1ec",
  inkt: "#0f2132",
  inkt2: "#4f5b67",
  inkt3: "#7b8590",
  lijn: "#e4e0d8",
  context: "#bdb8ae",
  band: "#e9e5dc",
  onderwerp: "#d9662f",
  goed: "#2a64b8",
  slecht: "#b8322a",
  geenData: "#dcd8d0",
  hoeveelheid: ["#dde6f3", "#aac3e5", "#6f96d0", "#3d6db5", "#1d4a8c"],
  categorie: ["#2a64b8", "#d9662f", "#1a9a6c", "#c98b00", "#7d5ba6"],
} as const;

export const donker = {
  papier: "#10151b",
  vlak: "#171d24",
  inkt: "#eef0f2",
  inkt2: "#aab3bd",
  inkt3: "#7f8994",
  lijn: "#262e37",
  context: "#56606b",
  band: "#1f262e",
  onderwerp: "#e8783f",
  goed: "#5b8fe0",
  slecht: "#e0645a",
  geenData: "#2c333b",
  hoeveelheid: ["#1d2a3b", "#24426b", "#33609c", "#5b8fe0", "#9fc0f2"],
  categorie: ["#5b8fe0", "#d9662f", "#22a477", "#c98500", "#a487cf"],
} as const;

export type Tokens = typeof licht | typeof donker;
