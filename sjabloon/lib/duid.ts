// Tekst uit cijfers. Elke zin op de site komt hier vandaan, en elk getal in een zin komt uit leidAf().
// De cijferregels (AGENTS.md): onderwerp vooraan, eenheid en peilperiode, nooit "nu" of "deze maand" maar de datum
// van de laatste meting, voorlopige cijfers benoemen. Getest in tests/duid.test.ts.

import type { Afleiding } from "./reken.ts";

// ---------- notatie (nl-NL) ----------

const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const MAANDEN_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

const formatters = new Map<number, Intl.NumberFormat>();

/** Nederlandse getalnotatie: 1.234,5. Een minteken is een echt minteken (−), geen streepje. */
export function getal(x: number, decimalen = 1): string {
  let f = formatters.get(decimalen);
  if (!f) {
    f = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen, useGrouping: true });
    formatters.set(decimalen, f);
  }
  // Afronden vóór het teken bepalen, anders wordt −0,04 "−0,0".
  const afgerond = Number(x.toFixed(decimalen));
  const tekst = f.format(Math.abs(afgerond));
  return afgerond < 0 ? `−${tekst}` : tekst;
}

/** Een getal met teken: +1,3 of −0,4. */
export function metTeken(x: number, decimalen = 1): string {
  const afgerond = Number(x.toFixed(decimalen));
  return afgerond > 0 ? `+${getal(afgerond, decimalen)}` : getal(afgerond, decimalen);
}

export function temperatuur(x: number): string {
  return `${getal(x, 1)}\u00a0°C`; // vaste spatie: getal en eenheid nooit over twee regels
}

/** "1,3 graden", "1 graad". Voor verschillen in temperatuur, niet voor een stand. */
export function graden(x: number): string {
  const a = Math.abs(Number(x.toFixed(1)));
  return `${getal(a, 1)}\u00a0${a === 1 ? "graad" : "graden"}`;
}

/** "16 oktober 2026" uit "2026-10-16". */
export function datum(iso: string, metJaar = true): string {
  const [j, m, d] = iso.split("-").map(Number);
  if (!j || !m || !d) throw new Error(`Geen datum: ${iso}`);
  return metJaar ? `${d} ${MAANDEN[m - 1]} ${j}` : `${d} ${MAANDEN[m - 1]}`;
}

/** "16 okt" uit "2026-10-16", voor labels in een grafiek. */
export function datumKort(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  if (!m || !d) throw new Error(`Geen datum: ${iso}`);
  return `${d} ${MAANDEN_KORT[m - 1]}`;
}

export function maandNaam(m: number, kort = false): string {
  return (kort ? MAANDEN_KORT : MAANDEN)[m - 1] ?? "";
}

/** Een opsomming: "2024", "2024 en 2023", "2024, 2023 en 2014". */
export function opsomming(xs: (string | number)[]): string {
  const s = xs.map(String);
  if (s.length <= 1) return s.join("");
  return `${s.slice(0, -1).join(", ")} en ${s.at(-1)}`;
}

// ---------- resolver en feiten ----------

/** Welke uitsnede leverde dit cijfer? Elke Feit wijst ernaar, zodat de herkomst bij het getal staat. */
export type Uitsnede = {
  maat: "tg";
  entiteit: "260";
  van: string;
  tot: string;
  basis: string;
  bewerking: string;
};

export type Feit = {
  id: string; // F1, F2 …: een model dat tekst schrijft, mag alleen naar deze nummers verwijzen
  toon: "warmer" | "kouder" | "gelijk" | "neutraal";
  getal: number;
  zin: string;
  uitsnede: Uitsnede;
};

export function uitsnede(a: Afleiding, bewerking: string): Uitsnede {
  return {
    maat: "tg",
    entiteit: "260",
    van: `${a.lopend.jaar}-01-01`,
    tot: a.lopend.tot,
    basis: `${a.basis.van}–${a.basis.tot}`,
    bewerking,
  };
}

function toonVan(afwijking: number): Feit["toon"] {
  const r = Number(afwijking.toFixed(1));
  return r > 0 ? "warmer" : r < 0 ? "kouder" : "gelijk";
}

export function feiten(a: Afleiding): Feit[] {
  const l = a.lopend;
  const periode = `1 januari tot en met ${datum(l.tot, false)}`;
  const sindsJaar = Number(a.eerste.slice(0, 4));
  return [
    {
      id: "F1",
      toon: "neutraal",
      getal: l.gemiddelde,
      zin: `In De Bilt was het van ${periode} ${l.jaar} gemiddeld ${temperatuur(l.gemiddelde)}.`,
      uitsnede: uitsnede(a, "gemiddelde van de daggemiddelden"),
    },
    {
      id: "F2",
      toon: "neutraal",
      getal: l.normaal,
      zin: `Over dezelfde dagen was het in ${a.basis.van}–${a.basis.tot} gemiddeld ${temperatuur(l.normaal)}.`,
      uitsnede: uitsnede(a, "gemiddelde over 30 jaar van het gemiddelde over dezelfde kalenderdagen"),
    },
    {
      id: "F3",
      toon: toonVan(l.afwijking),
      getal: l.afwijking,
      zin: afwijkingZin(a),
      uitsnede: uitsnede(a, "F1 min F2"),
    },
    {
      id: "F4",
      toon: "neutraal",
      getal: l.rang,
      zin: rangZin(a, sindsJaar),
      uitsnede: uitsnede(a, `rang onder ${l.aantalJaren} jaren sinds ${sindsJaar}, over dezelfde kalenderdagen`),
    },
  ];
}

function afwijkingZin(a: Afleiding): string {
  const l = a.lopend;
  const toon = toonVan(l.afwijking);
  const basis = `het gemiddelde van ${a.basis.van}–${a.basis.tot} over dezelfde dagen`;
  const tot = `tot en met ${datum(l.tot, false)}`; // het jaar staat al vooraan in de zin
  if (toon === "gelijk") return `${l.jaar} is ${tot} even warm als ${basis}.`;
  const iets = Math.abs(l.afwijking) < 0.5 ? "iets " : "";
  return `${l.jaar} is ${tot} ${graden(l.afwijking)} ${iets}${toon} dan ${basis}.`;
}

function rangZin(a: Afleiding, sinds: number): string {
  const l = a.lopend;
  if (l.rang === 1) return `Geen enkel jaar sinds ${sinds} was over dezelfde dagen zo warm.`;
  if (l.rang <= 4) {
    const jaren = l.warmer.map((w) => w.jaar);
    return `Sinds ${sinds} ${jaren.length === 1 ? "was" : "waren"} alleen ${opsomming(jaren)} over dezelfde dagen warmer.`;
  }
  return `Sinds ${sinds} waren ${l.rang - 1} van de ${l.aantalJaren - 1} andere jaren over dezelfde dagen warmer.`;
}

// ---------- de antwoordzin en de koppen ----------

export type Antwoord = { kort: "Ja" | "Nee"; zin: string; rang: string; voorlopig: string | null };

/** Het antwoord op de kernvraag in vraag.md: "Is het dit jaar warmer dan normaal in De Bilt?" */
export function antwoord(a: Afleiding): Antwoord {
  const f = feiten(a);
  const toon = f[2]!.toon;
  const kort = toon === "warmer" ? "Ja" : "Nee";
  return {
    kort,
    zin: `${kort}: ${f[2]!.zin}`,
    rang: f[3]!.zin,
    voorlopig: voorlopigZin(a),
  };
}

export function voorlopigZin(a: Afleiding): string | null {
  if (!a.voorlopigVanaf) return null;
  return `De cijfers vanaf ${datum(a.voorlopigVanaf)} zijn voorlopig: het KNMI kan ze na controle nog aanpassen.`;
}

/** Kop en onderregel van de jaarlijnen: de bevinding als zin. */
export function kopJaarlijnen(a: Afleiding): { kop: string; onder: string } {
  const l = a.lopend;
  const kouder = l.dagenVergeleken - l.dagenBoven;
  const kop =
    l.dagenBoven >= kouder
      ? `${l.jaar} was op ${l.dagenBoven} van de ${l.dagenVergeleken} dagen warmer dan normaal`
      : `${l.jaar} was op ${kouder} van de ${l.dagenVergeleken} dagen niet warmer dan normaal`;
  return {
    kop,
    onder: `Temperatuur in De Bilt per dag, als lopend gemiddelde over 7 dagen, in °C. De grijze vlakte is waar 8 van de 10 jaren uit ${a.basis.van}–${a.basis.tot} lagen.`,
  };
}

/** Kop en onderregel van de jaarstaven. */
export function kopJaarstaven(a: Afleiding): { kop: string; onder: string } {
  const l = a.lopend;
  const sinds = Number(a.eerste.slice(0, 4));
  const kop =
    l.rang === 1
      ? `Over dezelfde dagen was geen jaar sinds ${sinds} zo warm als ${l.jaar}`
      : `${l.jaar} staat op plek ${l.rang} van ${l.aantalJaren} jaren sinds ${sinds}`;
  return {
    kop,
    onder: `Afwijking van het gemiddelde van ${a.basis.van}–${a.basis.tot}, steeds over 1 januari tot en met ${datum(l.tot, false)}, in graden.`,
  };
}

/** Herkomst onder elk blok, in één zin. */
export function herkomst(a: Afleiding): string {
  return `KNMI daggegevens, station 260 De Bilt. Laatste meting ${datum(a.laatste)}.`;
}

/** Tooltip per maand in de jaarlijnen. */
export function maandTip(a: Afleiding, m: number): string | null {
  const mnd = a.maanden[m - 1];
  if (!mnd || mnd.lopend === null || mnd.normaal === null) return null;
  const periode = mnd.totDag ? `1 tot en met ${mnd.totDag} ${maandNaam(m)} ${a.lopend.jaar}` : `${maandNaam(m)} ${a.lopend.jaar}`;
  const verschil = mnd.lopend - mnd.normaal;
  const richting = Number(verschil.toFixed(1)) === 0 ? "gelijk aan het normaal" : `${graden(verschil)} ${verschil > 0 ? "warmer" : "kouder"} dan normaal`;
  return `${periode[0]!.toUpperCase()}${periode.slice(1)}: gemiddeld ${temperatuur(mnd.lopend)}, ${richting} (${temperatuur(mnd.normaal)}).`;
}
