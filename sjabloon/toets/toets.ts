// De poort vóór publicatie. Controleert de data en het verhaal, schrijft toets/rapport.md en eindigt met
// exit 1 bij een fout: dan wordt er niets gecommit of gepubliceerd.
//
//   pnpm toets
//   TOETS_VANDAAG=2026-10-18 pnpm toets   (de datum voor de versheidstoets vastzetten)
//   TOETS_VERSHEID=waarschuwing pnpm toets (in ci.yml: een codewijziging mag niet falen op oude data;
//                                           de oogst-workflow houdt de versheid wel streng)

import { execFileSync } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { leesEntiteiten, leesMaten, leesRun, leesWaarnemingen, type Rij, type Waarnemingen } from "../lib/data.ts";
import { antwoord, datum, kopJaarlijnen, kopJaarstaven } from "../lib/duid.ts";
import { BASIS, dagErbij, leidAf } from "../lib/reken.ts";
import { telLegeWaarden } from "../oogst/knmi-parse.ts";

type Uitkomst = { naam: string; status: "ok" | "waarschuwing" | "fout" | "overgeslagen"; uitleg: string };
const uitkomsten: Uitkomst[] = [];
const meld = (naam: string, status: Uitkomst["status"], uitleg: string) => uitkomsten.push({ naam, status, uitleg });

const GRENS = { min: -30, max: 40 }; // °C; buiten deze waarden is een etmaalgemiddelde in De Bilt onmogelijk
const VERS_DAGEN = 5; // de laatste dag mag hooguit zo oud zijn (KNMI publiceert de dag erna, weekend kan uitlopen)
const DRIFT = { waarschuwing: 0.25, fout: 0.6 };

const vandaag = process.env.TOETS_VANDAAG ?? new Date().toISOString().slice(0, 10);
const dagenTussen = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const sleutel = (r: Rij) => `${r.entiteit}|${r.periode}`;

/** De vorige versie: uit git (HEAD), anders de lokale kopie die de oogst bewaarde. */
async function vorigeVersie(): Promise<{ w: Waarnemingen; waar: string } | null> {
  try {
    const tekst = execFileSync("git", ["show", "HEAD:data/waarnemingen/tg.json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
    return { w: JSON.parse(tekst) as Waarnemingen, waar: "git HEAD" };
  } catch {
    /* geen git of nog geen commit */
  }
  try {
    return { w: JSON.parse(await readFile(".ruw/vorige/tg.json", "utf8")) as Waarnemingen, waar: ".ruw/vorige" };
  } catch {
    return null;
  }
}

async function main() {
  let w: Waarnemingen;
  try {
    w = await leesWaarnemingen("tg");
    meld("lezen", "ok", `data/waarnemingen/tg.json gelezen, checksum klopt (${w.rijen.length} rijen).`);
  } catch (e) {
    meld("lezen", "fout", `De data zijn niet te lezen: ${(e as Error).message}`);
    return;
  }
  const rijen = w.rijen;

  // Register: elke rij hoort bij een bekende maat en entiteit.
  const [maten, entiteiten] = await Promise.all([leesMaten(), leesEntiteiten()]);
  const codes = new Set(entiteiten.map((e) => e.code));
  const vreemd = rijen.filter((r) => !codes.has(r.entiteit)).length;
  if (!maten.some((m) => m.id === w.maat)) meld("register", "fout", `Maat ${w.maat} staat niet in data/maten.json.`);
  else if (vreemd) meld("register", "fout", `${vreemd} rijen hebben een entiteit die niet in data/entiteiten.json staat.`);
  else meld("register", "ok", "Elke rij hoort bij een bekende maat en entiteit.");

  // Dekking: geen ontbrekende dagen tussen de eerste en de laatste, en weinig lege waarden.
  const per = new Map(rijen.map((r) => [r.periode, r]));
  const eerste = rijen[0]!.periode;
  const laatste = rijen.at(-1)!.periode;
  let ontbreekt = 0;
  for (let d = eerste; d <= laatste; d = dagErbij(d, 1)) if (!per.has(d)) ontbreekt++;
  const leeg = rijen.filter((r) => r.waarde === null);
  const leegInBasis = leeg.filter((r) => Number(r.periode.slice(0, 4)) >= BASIS.van && Number(r.periode.slice(0, 4)) <= BASIS.tot).length;
  if (ontbreekt) meld("dekking", "fout", `${ontbreekt} dagen tussen ${eerste} en ${laatste} hebben geen rij.`);
  else if (leegInBasis > 30) meld("dekking", "fout", `${leegInBasis} lege dagen in de basisperiode ${BASIS.van}–${BASIS.tot}: het normaal is dan onbetrouwbaar.`);
  else if (leeg.length) meld("dekking", "waarschuwing", `${leeg.length} dagen zonder waarde (blijven leeg, worden niet ingevuld).`);
  else meld("dekking", "ok", `Elke dag van ${eerste} tot en met ${laatste} heeft een waarde.`);

  // Grenzen.
  const buiten = rijen.filter((r) => r.waarde !== null && (r.waarde < GRENS.min || r.waarde > GRENS.max));
  if (buiten.length) meld("grenzen", "fout", `${buiten.length} waarden buiten ${GRENS.min} tot ${GRENS.max} °C, bijvoorbeeld ${buiten[0]!.periode}: ${buiten[0]!.waarde}.`);
  else meld("grenzen", "ok", `Alle waarden liggen tussen ${GRENS.min} en ${GRENS.max} °C.`);

  // Versheid.
  const oud = dagenTussen(laatste, vandaag);
  if (oud > VERS_DAGEN) meld("versheid", process.env.TOETS_VERSHEID === "waarschuwing" ? "waarschuwing" : "fout", `De laatste dag is ${laatste}, ${oud} dagen voor ${vandaag}. Toegestaan: ${VERS_DAGEN}. Kijk in data/run.json waarom de oogst niets nieuws gaf.`);
  else meld("versheid", "ok", `De laatste dag is ${laatste} (${oud} dagen oud).`);

  // Drift tegenover de vorige versie, en nooit inkorten.
  const vorige = await vorigeVersie();
  if (!vorige) meld("drift", "overgeslagen", "Geen vorige versie gevonden (eerste run).");
  else {
    const oudPer = new Map(vorige.w.rijen.map((r) => [sleutel(r), r]));
    let gedeeld = 0;
    let anders = 0;
    for (const r of rijen) {
      const o = oudPer.get(sleutel(r));
      if (!o) continue;
      gedeeld++;
      if (o.waarde !== r.waarde) anders++;
    }
    const weg = vorige.w.rijen.filter((r) => !per.has(r.periode)).length;
    const deel = gedeeld ? anders / gedeeld : 0;
    const tekst = `${anders} van ${gedeeld} rijen gewijzigd tegenover ${vorige.waar} (${(deel * 100).toFixed(1).replace(".", ",")}%).`;
    if (weg) meld("drift", "fout", `${weg} rijen uit de vorige versie zijn verdwenen. De regel is: nooit inkorten.`);
    else if (deel > DRIFT.fout) meld("drift", "fout", tekst);
    else if (deel > DRIFT.waarschuwing) meld("drift", "waarschuwing", tekst);
    else meld("drift", "ok", tekst);
  }

  // Null-toets: waar de bron leeg was, is de data leeg; waar de bron 0 gaf, is de data 0. Nooit stil omzetten.
  const ruwMap = join(".ruw", "knmi-daggegevens");
  let dagen: string[] = [];
  try {
    dagen = (await readdir(ruwMap)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  } catch {
    /* geen ruwe antwoorden */
  }
  const ruwDag = dagen.at(-1);
  if (!ruwDag) meld("null", "overgeslagen", "Geen ruwe antwoorden in .ruw/ (draai eerst pnpm oogst).");
  else {
    let gecontroleerd = 0;
    let fout = 0;
    for (const f of await readdir(join(ruwMap, ruwDag))) {
      const json = JSON.parse(await readFile(join(ruwMap, ruwDag, f), "utf8"));
      const tg = new Map((Array.isArray(json) ? json : []).map((r: Record<string, unknown>) => [String(r.date).slice(0, 10), r.TG]));
      for (const { periode, leeg: isLeeg } of telLegeWaarden(json, "TG")) {
        const r = per.get(periode);
        if (!r) continue;
        gecontroleerd++;
        if (isLeeg && r.waarde !== null) fout++;
        if (!isLeeg && r.waarde === null) fout++;
        if (tg.get(periode) === 0 && r.waarde !== 0) fout++;
      }
    }
    if (fout) meld("null", "fout", `${fout} van ${gecontroleerd} dagen wijken af van het ruwe antwoord (leeg werd een getal, of omgekeerd).`);
    else meld("null", "ok", `${gecontroleerd} dagen vergeleken met de ruwe antwoorden van ${ruwDag}: leeg blijft leeg.`);
  }

  // Verhaaltest: de zinnen zijn in te vullen en kloppen met de cijfers.
  try {
    const a = leidAf(rijen);
    const ant = antwoord(a);
    const zinnen = [ant.zin, ant.rang, ant.voorlopig ?? "", kopJaarlijnen(a).kop, kopJaarlijnen(a).onder, kopJaarstaven(a).kop, kopJaarstaven(a).onder];
    const tekst = zinnen.join(" ");
    const problemen: string[] = [];
    if (/NaN|undefined|null|Infinity|\{|\}/.test(tekst)) problemen.push("een zin bevat NaN, undefined of een lege plek");
    if (/\b(nu|deze maand|vandaag|dit jaar|gisteren)\b/i.test(ant.zin)) problemen.push('de antwoordzin zegt "nu" of "dit jaar" in plaats van een datum');
    if (!ant.zin.includes(datum(a.laatste, false))) problemen.push("de antwoordzin noemt de datum van de laatste meting niet");
    const r = Number(a.lopend.afwijking.toFixed(1));
    if (r > 0 && !ant.zin.includes("warmer")) problemen.push("de afwijking is positief maar de zin zegt niet warmer");
    if (r < 0 && !ant.zin.includes("kouder")) problemen.push("de afwijking is negatief maar de zin zegt niet kouder");
    if ((r > 0) !== (ant.kort === "Ja")) problemen.push("Ja of Nee past niet bij de afwijking");
    // Plausibel: het jaargemiddelde van De Bilt over 1991–2020 ligt rond 10,5 °C. Valt het daarbuiten, dan is er
    // iets mis met de eenheid (tienden) of met de basisperiode, niet met het klimaat.
    const basisJaren = a.jaargemiddelden.filter((j) => j.jaar >= BASIS.van && j.jaar <= BASIS.tot);
    const jaarNormaal = basisJaren.reduce((s, j) => s + j.gemiddelde, 0) / basisJaren.length;
    if (jaarNormaal < 10 || jaarNormaal > 11) problemen.push(`het jaarnormaal ${jaarNormaal.toFixed(2)} °C ligt buiten 10 tot 11 °C: klopt de eenheid?`);
    if (problemen.length) meld("verhaal", "fout", problemen.join("; ") + ".");
    else meld("verhaal", "ok", `${ant.zin} (jaarnormaal ${jaarNormaal.toFixed(2).replace(".", ",")} °C, verwacht 10 tot 11 °C)`);
  } catch (e) {
    meld("verhaal", "fout", `De afleiding faalde: ${(e as Error).message}`);
  }

  // De laatste oogst.
  const run = await leesRun();
  if (!run) meld("oogst", "waarschuwing", "Geen data/run.json.");
  else if (run.waakhond) meld("oogst", "waarschuwing", run.waakhond);
  else {
    const fouten = Object.entries(run.bronnen).filter(([, b]) => b.status !== "ok");
    if (fouten.length) meld("oogst", "waarschuwing", fouten.map(([k, b]) => `${k}: ${b.melding}`).join("; "));
    else meld("oogst", "ok", `Laatste oogst ${run.klaar.slice(0, 16).replace("T", " ")} UTC, alle bronnen in orde.`);
  }
}

await main();

const teken = { ok: "ok", waarschuwing: "let op", fout: "FOUT", overgeslagen: "overgeslagen" } as const;
const fouten = uitkomsten.filter((u) => u.status === "fout").length;
const rapport = [
  "# Toetsrapport",
  "",
  `Gedraaid op ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC, versheid gemeten tegen ${vandaag}.`,
  "",
  fouten ? `**${fouten} ${fouten === 1 ? "fout" : "fouten"}: deze stand wordt niet gepubliceerd.**` : "**Alle controles geslaagd: deze stand mag online.**",
  "",
  "| Controle | Uitkomst | Toelichting |",
  "|---|---|---|",
  ...uitkomsten.map((u) => `| ${u.naam} | ${teken[u.status]} | ${u.uitleg.replaceAll("|", "\\|")} |`),
  "",
].join("\n");
await writeFile(join("toets", "rapport.md"), rapport);
for (const u of uitkomsten) console.log(`${teken[u.status].padEnd(12)} ${u.naam.padEnd(9)} ${u.uitleg}`);
if (fouten) {
  console.error(`\n${fouten} fout(en). Zie toets/rapport.md.`);
  process.exit(1);
}
