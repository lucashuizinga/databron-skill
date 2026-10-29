// Eén afleidfunctie: leidAf(). De pagina, het deelbeeld, llms.txt en de toets gebruiken allemaal deze uitkomst.
// Puur: geen bestanden, geen netwerk, geen klok. Getest in tests/reken.test.ts.

import type { Rij } from "./data.ts";

/** Basisperiode voor "normaal": de klimaatnormaal van het KNMI en de WMO. */
export const BASIS = { van: 1991, tot: 2020 } as const;
/** Een jaar telt alleen mee als minstens dit deel van de dagen een waarde heeft. */
export const MIN_DEKKING = 0.98;
/** Venster voor het lopende gemiddelde in de jaarlijnen. */
export const VENSTER = 7;

export type JaarStand = {
  jaar: number;
  gemiddelde: number | null; // over 1 januari tot en met de dag van de laatste meting
  afwijking: number | null; // tegenover het normaal van dezelfde dagen
  dagen: number;
  volledig: boolean;
};

export type Afleiding = {
  eerste: string;
  laatste: string;
  voorlopigVanaf: string | null;
  basis: { van: number; tot: number };
  lopend: {
    jaar: number;
    tot: string; // ISO-datum van de laatste meting
    dagen: number;
    voorlopigeDagen: number;
    gemiddelde: number;
    normaal: number;
    afwijking: number;
    rang: number; // 1 = warmste van alle jaren met genoeg dagen, over dezelfde dagen
    aantalJaren: number;
    warmer: JaarStand[]; // jaren die over dezelfde dagen warmer waren
    basisMin: JaarStand; // koudste en warmste jaar in de basisperiode, over dezelfde dagen
    basisMax: JaarStand;
    dagenBoven: number; // dagen die warmer waren dan het gemiddelde van die kalenderdag in de basisperiode
    dagenVergeleken: number;
    tienJaarWarmer: number; // van de laatste tien volledige jaren: hoeveel waren over dezelfde dagen warmer dan normaal
  };
  perJaar: JaarStand[];
  jaargemiddelden: { jaar: number; gemiddelde: number }[]; // alleen volledige kalenderjaren
  jaarlijnen: {
    dagen: string[]; // 365 keer "MM-DD" (29 februari valt weg)
    lopend: (number | null)[];
    vorig: (number | null)[];
    band: { p10: (number | null)[]; p90: (number | null)[]; gem: (number | null)[] };
  };
  maanden: { maand: number; lopend: number | null; normaal: number | null; totDag: number | null }[];
};

// ---------- kleine hulpfuncties ----------

export function gemiddelde(xs: (number | null)[]): number | null {
  let s = 0;
  let n = 0;
  for (const x of xs) {
    if (x === null || !Number.isFinite(x)) continue;
    s += x;
    n++;
  }
  return n ? s / n : null;
}

/** Percentiel met lineaire interpolatie (zoals Excel PERCENTILE.INC en R type 7). */
export function percentiel(xs: number[], p: number): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const h = (s.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return s[lo]! + (s[hi]! - s[lo]!) * (h - lo);
}

export function dagErbij(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** De 365 dagen van een gewoon jaar als "MM-DD". */
export function kalender(): string[] {
  const uit: string[] = [];
  for (let i = 0; i < 365; i++) uit.push(dagErbij("2025-01-01", i).slice(5));
  return uit;
}

/** Lopend gemiddelde over `venster` dagen tot en met de dag zelf. Leeg als minder dan 5 van de 7 dagen een waarde hebben. */
export function lopendGemiddelde(waarden: Map<string, number | null>, iso: string, venster = VENSTER): number | null {
  const xs: number[] = [];
  for (let i = 0; i < venster; i++) {
    const v = waarden.get(dagErbij(iso, -i));
    if (v !== null && v !== undefined) xs.push(v);
  }
  return xs.length >= Math.ceil(venster * 0.7) ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

// ---------- de afleiding ----------

/**
 * Leidt alles af wat de site toont uit de daggegevens van één station.
 * `rijen` moeten van één entiteit en één maat zijn, met `periode` als ISO-datum.
 */
export function leidAf(rijen: Rij[], basis: { van: number; tot: number } = BASIS): Afleiding {
  if (!rijen.length) throw new Error("leidAf: geen rijen");
  const gesorteerd = [...rijen].sort((a, b) => (a.periode < b.periode ? -1 : 1));
  const eerste = gesorteerd[0]!.periode;
  const laatsteRij = [...gesorteerd].reverse().find((r) => r.waarde !== null);
  if (!laatsteRij) throw new Error("leidAf: geen enkele waarde");
  const laatste = laatsteRij.periode;
  const voorlopigVanaf = gesorteerd.find((r) => r.status === "voorlopig")?.periode ?? null;
  const waarden = new Map(gesorteerd.map((r) => [r.periode, r.waarde]));

  const lopendJaar = Number(laatste.slice(0, 4));
  const totMmdd = laatste.slice(5);
  const eersteJaar = Number(eerste.slice(0, 4));

  // Per jaar: gemiddelde over 1 januari tot en met dezelfde kalenderdag als de laatste meting.
  const perJaar: JaarStand[] = [];
  for (let j = eersteJaar; j <= lopendJaar; j++) {
    const xs: (number | null)[] = [];
    let verwacht = 0;
    for (let d = `${j}-01-01`; d <= `${j}-${totMmdd}`; d = dagErbij(d, 1)) {
      verwacht++;
      xs.push(waarden.get(d) ?? null);
    }
    const met = xs.filter((x) => x !== null).length;
    const volledig = verwacht > 0 && met / verwacht >= MIN_DEKKING;
    perJaar.push({ jaar: j, gemiddelde: volledig ? gemiddelde(xs) : null, afwijking: null, dagen: met, volledig });
  }

  const basisJaren = perJaar.filter((p) => p.jaar >= basis.van && p.jaar <= basis.tot && p.gemiddelde !== null);
  if (basisJaren.length < (basis.tot - basis.van + 1) * 0.9) throw new Error("leidAf: te weinig jaren in de basisperiode");
  const normaal = gemiddelde(basisJaren.map((p) => p.gemiddelde))!;
  for (const p of perJaar) p.afwijking = p.gemiddelde === null ? null : p.gemiddelde - normaal;

  const nu = perJaar.find((p) => p.jaar === lopendJaar)!;
  if (nu.gemiddelde === null) throw new Error("leidAf: het lopende jaar heeft te weinig dagen");
  const vergelijkbaar = perJaar.filter((p) => p.gemiddelde !== null);
  const warmer = vergelijkbaar.filter((p) => p.jaar !== lopendJaar && p.gemiddelde! > nu.gemiddelde!).sort((a, b) => b.gemiddelde! - a.gemiddelde!);
  const basisGesorteerd = [...basisJaren].sort((a, b) => a.gemiddelde! - b.gemiddelde!);

  const dagenNu = perJaar.find((p) => p.jaar === lopendJaar)!.dagen;
  const voorlopigeDagen = gesorteerd.filter((r) => r.periode.startsWith(String(lopendJaar)) && r.status === "voorlopig" && r.waarde !== null).length;

  // Volledige kalenderjaren.
  const jaargemiddelden: { jaar: number; gemiddelde: number }[] = [];
  for (let j = eersteJaar; j < lopendJaar; j++) {
    const xs: (number | null)[] = [];
    for (let d = `${j}-01-01`; d <= `${j}-12-31`; d = dagErbij(d, 1)) xs.push(waarden.get(d) ?? null);
    const met = xs.filter((x) => x !== null).length;
    if (met / xs.length >= MIN_DEKKING) jaargemiddelden.push({ jaar: j, gemiddelde: gemiddelde(xs)! });
  }

  // Jaarlijnen: lopend 7-daags gemiddelde per kalenderdag.
  const dagen = kalender();
  const lijn = (j: number) =>
    dagen.map((md) => {
      const iso = `${j}-${md}`;
      if (iso > laatste || iso < eerste) return null;
      return lopendGemiddelde(waarden, iso);
    });
  const basisLijnen: (number | null)[][] = [];
  for (let j = basis.van; j <= basis.tot; j++) basisLijnen.push(lijn(j));
  const band = { p10: [] as (number | null)[], p90: [] as (number | null)[], gem: [] as (number | null)[] };
  dagen.forEach((_, i) => {
    const xs = basisLijnen.map((l) => l[i]).filter((x): x is number => x !== null && x !== undefined);
    band.p10.push(percentiel(xs, 0.1));
    band.p90.push(percentiel(xs, 0.9));
    band.gem.push(gemiddelde(xs));
  });

  const lopendeLijn = lijn(lopendJaar);
  // Dagen boven normaal: de dagwaarde tegenover het gemiddelde van die kalenderdag in de basisperiode (niet afgevlakt).
  let dagenBoven = 0;
  let dagenVergeleken = 0;
  for (const md of dagen) {
    const v = waarden.get(`${lopendJaar}-${md}`);
    if (v === null || v === undefined) continue;
    const xs: (number | null)[] = [];
    for (let j = basis.van; j <= basis.tot; j++) xs.push(waarden.get(`${j}-${md}`) ?? null);
    const normaalDag = gemiddelde(xs);
    if (normaalDag === null) continue;
    dagenVergeleken++;
    if (v > normaalDag) dagenBoven++;
  }
  const tienJaarWarmer = perJaar.filter((p) => p.jaar >= lopendJaar - 10 && p.jaar < lopendJaar && (p.afwijking ?? 0) > 0).length;

  // Maanden van het lopende jaar tegenover het normaal van die maand (voor de tooltips).
  // De maand van de laatste meting is nog niet af: vergelijk die alleen over dezelfde dagen.
  const laatsteMaand = Number(laatste.slice(5, 7));
  const laatsteDag = laatste.slice(8);
  const perMaand = new Map<string, (number | null)[]>();
  for (const r of gesorteerd) {
    if (Number(r.periode.slice(5, 7)) === laatsteMaand && r.periode.slice(8) > laatsteDag) continue;
    const k = r.periode.slice(0, 7);
    let lijst = perMaand.get(k);
    if (!lijst) perMaand.set(k, (lijst = []));
    lijst.push(r.waarde);
  }
  const maanden: Afleiding["maanden"] = [];
  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, "0");
    const normaalPerJaar: (number | null)[] = [];
    for (let j = basis.van; j <= basis.tot; j++) normaalPerJaar.push(gemiddelde(perMaand.get(`${j}-${mm}`) ?? []));
    maanden.push({
      maand: m,
      lopend: gemiddelde(perMaand.get(`${lopendJaar}-${mm}`) ?? []),
      normaal: gemiddelde(normaalPerJaar),
      totDag: m === laatsteMaand ? Number(laatsteDag) : null,
    });
  }

  return {
    eerste,
    laatste,
    voorlopigVanaf,
    basis: { van: basis.van, tot: basis.tot },
    lopend: {
      jaar: lopendJaar,
      tot: laatste,
      dagen: dagenNu,
      voorlopigeDagen,
      gemiddelde: nu.gemiddelde,
      normaal,
      afwijking: nu.gemiddelde - normaal,
      rang: warmer.length + 1,
      aantalJaren: vergelijkbaar.length,
      warmer,
      basisMin: basisGesorteerd[0]!,
      basisMax: basisGesorteerd.at(-1)!,
      dagenBoven,
      dagenVergeleken,
      tienJaarWarmer,
    },
    perJaar,
    jaargemiddelden,
    jaarlijnen: { dagen, lopend: lopendeLijn, vorig: lijn(lopendJaar - 1), band },
    maanden,
  };
}

// ---------- extra afleidingen voor de vormenpagina ----------

/** Voortschrijdend gemiddelde over de laatste `n` waarden (leeg tot er `n` zijn). */
export function voortschrijdend(xs: (number | null)[], n: number): (number | null)[] {
  return xs.map((_, i) => (i + 1 < n ? null : gemiddelde(xs.slice(i + 1 - n, i + 1))));
}

/**
 * Gemiddelde sinds 1 januari, per kalenderdag: voor het lopende jaar, plus de band (p10 tot p90) en het
 * gemiddelde daarvan over de basisperiode. Dit is de "stand" in de vorm BandMetDoel.
 */
export function jaarTotDatum(rijen: Rij[], jaar: number, basis: { van: number; tot: number } = BASIS) {
  const waarden = new Map(rijen.map((r) => [r.periode, r.waarde]));
  const dagen = kalender();
  const reeks = (j: number) => {
    let s = 0;
    let n = 0;
    return dagen.map((md) => {
      const v = waarden.get(`${j}-${md}`);
      if (v === undefined) return null;
      if (v !== null) {
        s += v;
        n++;
      }
      return n ? s / n : null;
    });
  };
  const basisReeksen: (number | null)[][] = [];
  for (let j = basis.van; j <= basis.tot; j++) basisReeksen.push(reeks(j));
  const per = (p: number) =>
    dagen.map((_, i) => percentiel(basisReeksen.map((r) => r[i]).filter((x): x is number => x !== null && x !== undefined), p));
  const jaarNormaal = gemiddelde(basisReeksen.map((r) => r.at(-1) ?? null));
  return { dagen, lopend: reeks(jaar), p10: per(0.1), p90: per(0.9), jaarNormaal };
}
