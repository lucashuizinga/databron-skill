// Leest en beschrijft data/ (trede 1: bestanden in plaats van een database).
// De indeling is dezelfde als de tabellen maat, entiteit, waarneming en run in een Databron-database,
// zodat `databron-opslag` deze bestanden later met één script in Neon of D1 kan zetten.
// De site leest dit alleen bij de build (statisch); in een request wordt niets geoogst.

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type Maat = {
  id: string;
  naam: string;
  eenheid: string;
  soort: "telling" | "mediaan" | "gemiddelde" | "aandeel" | "score";
  hoger_is_beter: boolean | null;
  decimalen: number;
  bron: string;
  definitie: string;
  aanroep: string;
};

export type Entiteit = { code: string; soort: string; naam: string };

export type Rij = {
  entiteit: string;
  periode: string; // ISO: 2026, 2026-Q3, 2026-09, 2026-09-14
  waarde: number | null; // null = de bron noemt het, maar zonder getal
  status: "voorlopig" | "definitief";
};

export type Waarnemingen = { maat: string; versie: string; checksum: string; rijen: Rij[] };

export type BronRun = {
  status: "ok" | "fout" | "geweigerd";
  aanvragen: number;
  rijen: number;
  nieuw: number;
  gewijzigd: number;
  laatste: string | null;
  melding: string | null;
};

export type Run = {
  begon: string;
  klaar: string;
  volledig: boolean;
  bronnen: Record<string, BronRun>;
  waakhond: string | null; // in gewone taal: waarom verse data werd geweigerd, of null
};

export const DATA_MAP = join(process.cwd(), "data");

/** Checksum over de rijen in vaste volgorde. Dezelfde rijen geven altijd dezelfde checksum. */
export function checksum(rijen: Rij[]): string {
  return "sha256:" + createHash("sha256").update(JSON.stringify(rijen)).digest("hex");
}

/**
 * Schrijft waarnemingen met één rij per regel: dan laat `git diff` precies zien welke dagen de bron veranderde.
 */
export function serialiseer(w: Waarnemingen): string {
  const regels = w.rijen.map((r) => "    " + JSON.stringify(r));
  return [
    "{",
    `  "maat": ${JSON.stringify(w.maat)},`,
    `  "versie": ${JSON.stringify(w.versie)},`,
    `  "checksum": ${JSON.stringify(w.checksum)},`,
    `  "rijen": [`,
    regels.join(",\n"),
    "  ]",
    "}",
    "",
  ].join("\n");
}

/** Strikt lezen: een kapot bestand is een fout, geen lege lijst. */
async function leesJson<T>(pad: string): Promise<T> {
  const tekst = await readFile(pad, "utf8");
  return JSON.parse(tekst) as T;
}

export async function leesMaten(): Promise<Maat[]> {
  return leesJson<Maat[]>(join(DATA_MAP, "maten.json"));
}

export async function leesMaat(id: string): Promise<Maat> {
  const m = (await leesMaten()).find((x) => x.id === id);
  if (!m) throw new Error(`Onbekende maat: ${id}`);
  return m;
}

export async function leesEntiteiten(): Promise<Entiteit[]> {
  return leesJson<Entiteit[]>(join(DATA_MAP, "entiteiten.json"));
}

export async function leesWaarnemingen(maat: string): Promise<Waarnemingen> {
  if (!/^[a-z0-9-]+$/.test(maat)) throw new Error(`Ongeldige maat: ${maat}`);
  const w = await leesJson<Waarnemingen>(join(DATA_MAP, "waarnemingen", `${maat}.json`));
  if (checksum(w.rijen) !== w.checksum) throw new Error(`Checksum van ${maat} klopt niet: het bestand is met de hand gewijzigd of beschadigd`);
  return w;
}

export async function leesRun(): Promise<Run | null> {
  try {
    return await leesJson<Run>(join(DATA_MAP, "run.json"));
  } catch {
    return null;
  }
}
