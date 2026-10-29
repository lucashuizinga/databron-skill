// Puur: van het KNMI-antwoord naar waarnemingen. Geen netwerk, geen bestanden.
// Getest in tests/knmi-parse.test.ts.

/** Eén waarneming in de vaste indeling (zie data/waarnemingen/<maat>.json). */
export type Waarneming = {
  entiteit: string; // stationsnummer als tekst: "260"
  periode: string; // ISO-datum: "2026-10-16"
  waarde: number | null; // null = de bron noemt de dag, maar zonder getal. Nooit 0 maken.
  status: "voorlopig" | "definitief";
};

/**
 * Schaalfactor per KNMI-variabele. Temperatuur, neerslag en zon staan in tienden (TG 115 = 11,5 °C).
 * Een variabele die hier niet staat, laat de parser weigeren: liever een fout dan een stil verkeerd getal.
 * Let op bij RH (neerslag): -1 betekent "minder dan 0,05 mm"; dat vraagt een eigen regel voordat je RH toevoegt.
 */
export const SCHAAL: Record<string, number> = {
  TG: 0.1, // etmaalgemiddelde temperatuur
  TN: 0.1, // minimumtemperatuur
  TX: 0.1, // maximumtemperatuur
};

/** Maakt van een geheel getal in tienden een getal met precies één decimaal, zonder zwevendekommaruis. */
function tienden(v: number): number {
  return Math.round(v) / 10;
}

/**
 * Leest het JSON-antwoord van daggegevens.knmi.nl (fmt=json).
 * Vorm: [{ station_code: 260, date: "2026-10-16T00:00:00.000Z", TG: 147 }, …]
 * De datum is een kalenderdag; we nemen de eerste tien tekens en rekenen niet via een tijdzone.
 */
export function parseKnmi(json: unknown, variabele: string): Omit<Waarneming, "status">[] {
  const schaal = SCHAAL[variabele];
  if (schaal === undefined) throw new Error(`KNMI: geen schaal bekend voor variabele ${variabele}`);
  if (!Array.isArray(json)) {
    // De KNMI geeft bij een fout soms HTML of een object terug. Nooit als "geen data" lezen.
    throw new Error(`KNMI: antwoord is geen lijst maar ${json === null ? "null" : typeof json}`);
  }
  const uit: Omit<Waarneming, "status">[] = [];
  for (const [i, r] of json.entries()) {
    if (typeof r !== "object" || r === null) throw new Error(`KNMI: rij ${i} is geen object`);
    const rij = r as Record<string, unknown>;
    const station = rij.station_code;
    const datum = rij.date;
    if (typeof station !== "number" && typeof station !== "string") throw new Error(`KNMI: rij ${i} zonder station_code`);
    if (typeof datum !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(datum)) throw new Error(`KNMI: rij ${i} zonder geldige datum`);
    const ruw = rij[variabele];
    let waarde: number | null;
    if (ruw === null || ruw === undefined || ruw === "") {
      waarde = null; // ontbrekend blijft ontbrekend
    } else if (typeof ruw === "number" && Number.isFinite(ruw)) {
      waarde = schaal === 0.1 ? tienden(ruw) : ruw * schaal;
    } else if (typeof ruw === "string" && ruw.trim() !== "" && Number.isFinite(Number(ruw))) {
      const n = Number(ruw);
      waarde = schaal === 0.1 ? tienden(n) : n * schaal;
    } else {
      throw new Error(`KNMI: rij ${i} heeft een onleesbare waarde voor ${variabele}: ${JSON.stringify(ruw)}`);
    }
    uit.push({ entiteit: String(station), periode: datum.slice(0, 10), waarde });
  }
  return uit;
}

/** Telt hoeveel waarden in het ruwe antwoord leeg zijn. De toets vergelijkt dit met de opgeslagen data. */
export function telLegeWaarden(json: unknown, variabele: string): { periode: string; leeg: boolean }[] {
  if (!Array.isArray(json)) return [];
  return json.map((r) => {
    const rij = r as Record<string, unknown>;
    const v = rij[variabele];
    return { periode: String(rij.date).slice(0, 10), leeg: v === null || v === undefined || v === "" };
  });
}
