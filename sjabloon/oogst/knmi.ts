// IO: de KNMI daggegevens ophalen. Paginering in stukken, time-out, retry met wachttijd en Retry-After,
// een eerlijke user-agent. Ruwe antwoorden gaan naar .ruw/ (niet in git), met de hash van de aanvraag.
// Het datacontract staat in bronnen/knmi-daggegevens.md.

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const BRON_ID = "knmi-daggegevens";
export const ENDPOINT = "https://www.daggegevens.knmi.nl/klimatologie/daggegevens";
export const USER_AGENT = "databron-sjabloon/0.1 (+https://www.opendataindex.nl)";

/** Het register voor deze bron: welke maten en entiteiten ze levert. draai.ts schrijft dit naar data/. */
export const MATEN = [
  {
    id: "tg",
    naam: "Etmaalgemiddelde temperatuur",
    eenheid: "°C",
    soort: "gemiddelde",
    hoger_is_beter: null,
    decimalen: 1,
    bron: BRON_ID,
    definitie:
      "Gemiddelde temperatuur over een etmaal (00 tot 24 uur UT), op 1,5 meter hoogte, gemeten door het KNMI. KNMI-variabele TG, in de bron in tienden van een graad.",
    aanroep: `curl -A "${USER_AGENT}" -d "stns=260&vars=TG&start=19510101&end=20261231&fmt=json" ${ENDPOINT}`,
  },
] as const;

export const ENTITEITEN = [{ code: "260", soort: "station", naam: "De Bilt" }] as const;

export type Aanvraag = { stns: string; vars: string; start: string; end: string };

export type Antwoord = { aanvraag: Aanvraag; json: unknown; hash: string; ruwPad: string | null };

const RUW_MAP = ".ruw";

/** Hash van de aanvraag: dezelfde vraag geeft hetzelfde bestand in de cache. */
export function hashAanvraag(a: Aanvraag): string {
  const sleutel = `${ENDPOINT}?stns=${a.stns}&vars=${a.vars}&start=${a.start}&end=${a.end}&fmt=json`;
  return createHash("sha256").update(sleutel).digest("hex").slice(0, 16);
}

/** Zoekt het nieuwste ruwe antwoord met deze hash in .ruw/<bron>/<datum>/. */
async function zoekInRuw(hash: string): Promise<string | null> {
  let dagen: string[];
  try {
    dagen = (await readdir(join(RUW_MAP, BRON_ID))).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
  } catch {
    return null;
  }
  for (const d of dagen) {
    const pad = join(RUW_MAP, BRON_ID, d, `${hash}.json`);
    try {
      await readFile(pad);
      return pad;
    } catch {
      /* niet in deze map */
    }
  }
  return null;
}

const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retry-After kan seconden of een HTTP-datum zijn. Geeft milliseconden, hooguit twee minuten. */
function retryAfterMs(kop: string | null): number | null {
  if (!kop) return null;
  const s = Number(kop);
  if (Number.isFinite(s)) return Math.min(s * 1000, 120_000);
  const t = Date.parse(kop);
  if (Number.isFinite(t)) return Math.min(Math.max(t - Date.now(), 0), 120_000);
  return null;
}

/**
 * Eén aanvraag, met tot `pogingen` pogingen bij netwerkfouten, 429 en 5xx.
 * Een 4xx (behalve 429) is een fout in onze vraag: meteen stoppen.
 * HTTP 200 zonder JSON is ook een fout (de bron meldt fouten soms met 200).
 */
export async function haalKnmi(
  a: Aanvraag,
  opties: { pogingen?: number; timeoutMs?: number; replay?: boolean } = {},
): Promise<Antwoord> {
  const { pogingen = 4, timeoutMs = 30_000, replay = false } = opties;
  const hash = hashAanvraag(a);
  // Ruw per dag van ophalen: .ruw/<bron>/<datum>/<hash>.json (zelfde indeling als later in Blob of R2).
  const dagMap = join(RUW_MAP, BRON_ID, new Date().toISOString().slice(0, 10));
  const ruwPad = join(dagMap, `${hash}.json`);

  if (replay) {
    // Opnieuw afspelen uit .ruw/: handig om parser en toets te testen zonder de bron te belasten.
    const pad = await zoekInRuw(hash);
    if (!pad) throw new Error(`KNMI: geen ruw antwoord voor ${a.start}–${a.end} in ${RUW_MAP}/ (eerst zonder --replay draaien)`);
    return { aanvraag: a, json: JSON.parse(await readFile(pad, "utf8")), hash, ruwPad: pad };
  }

  const body = new URLSearchParams({ ...a, fmt: "json" }).toString();
  let laatsteFout: unknown = null;

  for (let poging = 1; poging <= pogingen; poging++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          // Node fetch stuurt anders "Accept-Language: *"; sommige servers weigeren dat.
          "Accept-Language": "nl, en;q=0.8",
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status === 429 || res.status >= 500) {
        const ms = retryAfterMs(res.headers.get("retry-after")) ?? 2000 * 2 ** (poging - 1);
        laatsteFout = new Error(`KNMI: HTTP ${res.status}`);
        if (poging < pogingen) {
          await wacht(ms);
          continue;
        }
        throw laatsteFout;
      }
      if (!res.ok) throw Object.assign(new Error(`KNMI: HTTP ${res.status} voor ${a.start}–${a.end}`), { geenRetry: true });
      const tekst = await res.text();
      let json: unknown;
      try {
        json = JSON.parse(tekst);
      } catch {
        throw Object.assign(new Error(`KNMI: HTTP 200 maar geen JSON (${tekst.slice(0, 80)})`), { geenRetry: true });
      }
      await mkdir(dagMap, { recursive: true });
      await writeFile(ruwPad, tekst);
      return { aanvraag: a, json, hash, ruwPad };
    } catch (e) {
      laatsteFout = e;
      if ((e as { geenRetry?: boolean }).geenRetry) throw e;
      if (poging < pogingen) await wacht(2000 * 2 ** (poging - 1));
    }
  }
  throw laatsteFout instanceof Error ? laatsteFout : new Error(String(laatsteFout));
}

const compact = (d: string) => d.replaceAll("-", "");

/**
 * Vraagt een lange reeks op in stukken van `jaren` jaar, met een pauze ertussen.
 * `van` en `tot` zijn ISO-datums. De stukken volgen kalenderjaren, zodat de cache stabiel blijft.
 */
export async function haalInStukken(
  van: string,
  tot: string,
  opties: { jaren?: number; pauzeMs?: number; replay?: boolean; variabele?: string; station?: string; log?: (s: string) => void } = {},
): Promise<Antwoord[]> {
  const { jaren = 5, pauzeMs = 1000, replay = false, variabele = "TG", station = "260", log = () => {} } = opties;
  const beginJaar = Number(van.slice(0, 4));
  const eindJaar = Number(tot.slice(0, 4));
  const uit: Antwoord[] = [];
  for (let j = beginJaar; j <= eindJaar; j += jaren) {
    const start = j === beginJaar ? van : `${j}-01-01`;
    const eindeStuk = Math.min(j + jaren - 1, eindJaar);
    const end = eindeStuk === eindJaar ? tot : `${eindeStuk}-12-31`;
    const a: Aanvraag = { stns: station, vars: variabele, start: compact(start), end: compact(end) };
    log(`  KNMI ${start} tot en met ${end}`);
    uit.push(await haalKnmi(a, { replay }));
    if (!replay && j + jaren <= eindJaar) await wacht(pauzeMs);
  }
  return uit;
}
