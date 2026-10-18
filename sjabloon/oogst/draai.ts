// Orkestratie van de oogst: elke bron in veilig(), een waakhond tegen slechte verse data, en dan data/ schrijven.
//
//   pnpm oogst              dagelijks: de laatste twee jaar opnieuw (vangt revisies), de rest blijft staan
//   pnpm oogst --volledig   alles vanaf 1951 opnieuw (ook vanzelf op de eerste van de maand)
//   pnpm oogst --replay     afspelen uit .ruw/ zonder de bron aan te roepen
//
// Proef voor de waakhond: DATABRON_STORING=leeg|kort|gaten|fout pnpm oogst
// laat een storing na en moet de laatste goede stand laten staan.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { checksum, serialiseer, type BronRun, type Rij, type Run, type Waarnemingen } from "../lib/data.ts";
import { parseKnmi } from "./knmi-parse.ts";
import { BRON_ID, ENTITEITEN, MATEN, haalInStukken } from "./knmi.ts";

const DATA = join(process.cwd(), "data");
const BEGIN = "1951-01-01"; // begin van de reeks op de site (zie vraag.md)
const VOORLOPIG_DAGEN = 30; // redactieregel: de laatste 30 dagen heten voorlopig (zie bronnen/knmi-daggegevens.md)

const sleutel = (r: { entiteit: string; periode: string }) => `${r.entiteit}|${r.periode}`;

/** Voert een stap uit; een fout wordt genoteerd en stopt de andere bronnen niet. */
export async function veilig<T>(label: string, fouten: Record<string, string>, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    fouten[label] = e instanceof Error ? e.message : String(e);
    console.error(`✗ ${label}: ${fouten[label]}`);
    return null;
  }
}

function dagenTerug(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Zet de status: de laatste VOORLOPIG_DAGEN dagen tot de nieuwste meting zijn voorlopig. */
export function zetStatus(rijen: Omit<Rij, "status">[]): Rij[] {
  const laatste = rijen.reduce((m, r) => (r.periode > m ? r.periode : m), "");
  const grens = laatste ? dagenTerug(laatste, VOORLOPIG_DAGEN) : "";
  return rijen.map((r) => ({ ...r, status: r.periode > grens ? "voorlopig" : "definitief" }));
}

/**
 * De waakhond: verse data die korter, ouder of leger is dan de vorige goede stand, wordt geweigerd.
 * `vers` is wat de bron nu gaf voor het venster [van, tot]; `vorige` is de vorige goede stand (alles).
 * Geeft de redenen in gewone taal; een lege lijst betekent: in orde.
 */
export function waakhond(vorige: Rij[], vers: Omit<Rij, "status">[], van: string): string[] {
  const redenen: string[] = [];
  if (vers.length === 0) return ["De bron gaf geen enkele rij terug."];
  const vorigInVenster = vorige.filter((r) => r.periode >= van);
  const laatsteVorig = vorige.reduce((m, r) => (r.periode > m ? r.periode : m), "");
  const laatsteVers = vers.reduce((m, r) => (r.periode > m ? r.periode : m), "");

  if (laatsteVorig && laatsteVers < laatsteVorig) {
    redenen.push(`Ouder: de nieuwste dag is ${laatsteVers}, de vorige stand had al ${laatsteVorig}.`);
  }
  if (vers.length < vorigInVenster.length) {
    redenen.push(`Korter: ${vers.length} dagen vanaf ${van}, de vorige stand had er ${vorigInVenster.length}.`);
  }
  const versPer = new Map(vers.map((r) => [sleutel(r), r]));
  const leeggemaakt = vorigInVenster.filter((r) => r.waarde !== null && versPer.get(sleutel(r))?.waarde === null).length;
  if (leeggemaakt > 3) {
    redenen.push(`Leger: ${leeggemaakt} dagen hadden een waarde en zijn nu leeg.`);
  }
  return redenen;
}

/** Voegt verse rijen samen met de vorige stand. Niets wordt weggegooid; een revisie overschrijft de oude waarde. */
export function voegSamen(vorige: Rij[], vers: Omit<Rij, "status">[]): { rijen: Rij[]; nieuw: number; gewijzigd: number } {
  const per = new Map<string, Omit<Rij, "status">>(vorige.map((r) => [sleutel(r), { entiteit: r.entiteit, periode: r.periode, waarde: r.waarde }]));
  let nieuw = 0;
  let gewijzigd = 0;
  for (const r of vers) {
    const oud = per.get(sleutel(r));
    if (!oud) nieuw++;
    else if (oud.waarde !== r.waarde) gewijzigd++;
    per.set(sleutel(r), r);
  }
  const rijen = zetStatus([...per.values()].sort((a, b) => (a.entiteit + a.periode < b.entiteit + b.periode ? -1 : 1)));
  return { rijen, nieuw, gewijzigd };
}

/** Bootst een storing na, om te bewijzen dat de waakhond werkt. */
function storing(vers: Omit<Rij, "status">[]): Omit<Rij, "status">[] {
  const soort = process.env.DATABRON_STORING;
  if (!soort) return vers;
  console.log(`! Storing nagebootst: ${soort}`);
  if (soort === "leeg") return [];
  if (soort === "kort") return vers.slice(0, -10);
  if (soort === "gaten") return vers.map((r, i) => (i % 20 === 0 ? { ...r, waarde: null } : r));
  if (soort === "fout") throw new Error("Nagebootste storing: de bron antwoordt niet");
  return vers;
}

async function leesVorige(maat: string): Promise<Waarnemingen | null> {
  let tekst: string;
  try {
    tekst = await readFile(join(DATA, "waarnemingen", `${maat}.json`), "utf8");
  } catch {
    return null; // eerste run
  }
  // Strikt: een bestand dat er is maar niet te lezen valt, is een fout. Nooit stil opnieuw beginnen.
  const w = JSON.parse(tekst) as Waarnemingen;
  if (checksum(w.rijen) !== w.checksum) throw new Error(`De checksum van data/waarnemingen/${maat}.json klopt niet; eerst uitzoeken, niet overschrijven.`);
  return w;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const begon = new Date();
  const vandaag = begon.toISOString().slice(0, 10);
  const replay = args.has("--replay");
  const fouten: Record<string, string> = {};
  const bronnen: Record<string, BronRun> = {};
  let waakhondMelding: string | null = null;

  await mkdir(join(DATA, "waarnemingen"), { recursive: true });
  await mkdir(join(process.cwd(), ".ruw", "vorige"), { recursive: true });

  const vorige = await leesVorige("tg");
  const volledig = args.has("--volledig") || !vorige || vandaag.endsWith("-01");
  // Dagelijks: vanaf 1 januari van vorig jaar. Zo komen revisies van recente maanden mee.
  const van = volledig ? BEGIN : `${Number(vandaag.slice(0, 4)) - 1}-01-01`;
  console.log(`Oogst ${volledig ? "volledig" : "bijwerken"}: ${van} tot en met ${vandaag}`);

  const antwoorden = await veilig(BRON_ID, fouten, () =>
    haalInStukken(van, vandaag, { replay, jaren: 5, pauzeMs: 1000, log: console.log }),
  );

  if (antwoorden) {
    const resultaat = await veilig(`${BRON_ID}: verwerken`, fouten, async () => {
      const vers = storing(antwoorden.flatMap((a) => parseKnmi(a.json, "TG")).filter((r) => r.periode >= BEGIN));
      const redenen = waakhond(vorige?.rijen ?? [], vers, van);
      if (redenen.length) return { geweigerd: true as const, redenen, vers };
      return { geweigerd: false as const, ...voegSamen(vorige?.rijen ?? [], vers), vers };
    });

    if (resultaat?.geweigerd) {
      waakhondMelding = `Verse data van het KNMI geweigerd; de laatste goede stand blijft staan. ${resultaat.redenen.join(" ")}`;
      console.warn(`! ${waakhondMelding}`);
      if (process.env.GITHUB_ACTIONS) console.log(`::warning::${waakhondMelding}`);
      bronnen[BRON_ID] = {
        status: "geweigerd",
        aanvragen: antwoorden.length,
        rijen: resultaat.vers.length,
        nieuw: 0,
        gewijzigd: 0,
        laatste: vorige?.rijen.at(-1)?.periode ?? null,
        melding: waakhondMelding,
      };
    } else if (resultaat) {
      const som = checksum(resultaat.rijen);
      const veranderd = som !== vorige?.checksum;
      if (vorige) {
        // Bewaar de vorige stand lokaal, zodat de toets ook zonder git de drift kan meten.
        await writeFile(join(process.cwd(), ".ruw", "vorige", "tg.json"), serialiseer(vorige));
      }
      if (veranderd) {
        const w: Waarnemingen = { maat: "tg", versie: begon.toISOString(), checksum: som, rijen: resultaat.rijen };
        await writeFile(join(DATA, "waarnemingen", "tg.json"), serialiseer(w));
      }
      bronnen[BRON_ID] = {
        status: "ok",
        aanvragen: antwoorden.length,
        rijen: resultaat.rijen.length,
        nieuw: resultaat.nieuw,
        gewijzigd: resultaat.gewijzigd,
        laatste: resultaat.rijen.at(-1)?.periode ?? null,
        melding: veranderd ? null : "Geen verandering tegenover de vorige stand.",
      };
      console.log(`✓ ${BRON_ID}: ${resultaat.rijen.length} dagen, ${resultaat.nieuw} nieuw, ${resultaat.gewijzigd} gewijzigd, laatste ${bronnen[BRON_ID].laatste}`);
    }
  }

  if (!bronnen[BRON_ID]) {
    const melding = Object.entries(fouten).map(([k, v]) => `${k}: ${v}`).join("; ");
    bronnen[BRON_ID] = { status: "fout", aanvragen: 0, rijen: 0, nieuw: 0, gewijzigd: 0, laatste: vorige?.rijen.at(-1)?.periode ?? null, melding };
    if (process.env.GITHUB_ACTIONS) console.log(`::warning::Oogst ${BRON_ID} mislukt: ${melding}`);
  }

  // Het register schrijven we elke run: het staat in de code (oogst/knmi.ts) en is zo altijd gelijk aan data/.
  await writeFile(join(DATA, "maten.json"), JSON.stringify(MATEN, null, 2) + "\n");
  await writeFile(join(DATA, "entiteiten.json"), JSON.stringify(ENTITEITEN, null, 2) + "\n");

  const run: Run = { begon: begon.toISOString(), klaar: new Date().toISOString(), volledig, bronnen, waakhond: waakhondMelding };
  await writeFile(join(DATA, "run.json"), JSON.stringify(run, null, 2) + "\n");
  // Een mislukte of geweigerde oogst laat de oude data staan en is geen crash: de toets op versheid
  // slaat alarm als dat te lang duurt. Zo blijft de site altijd op de laatste goede stand.
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
