// Methode: hoe de antwoordzin tot stand komt, met de exacte aanroep en de rekenregels. Getallen komen uit leidAf().
import type { Metadata } from "next";
import { ENDPOINT, USER_AGENT } from "@/oogst/knmi.ts";
import { leesMaat, leesRun, leesWaarnemingen } from "@/lib/data.ts";
import { antwoord, datum, getal, metTeken, temperatuur } from "@/lib/duid.ts";
import { BASIS, MIN_DEKKING, VENSTER, leidAf } from "@/lib/reken.ts";

export const metadata: Metadata = {
  title: "Hoe we rekenen",
  description: "Bron, aanroep en rekenregels achter het antwoord op de vraag of het dit jaar warmer is dan normaal in De Bilt.",
  alternates: { canonical: "/methode" },
};

export default async function Methode() {
  const [w, maat, run] = await Promise.all([leesWaarnemingen("tg"), leesMaat("tg"), leesRun()]);
  const a = leidAf(w.rijen);
  const l = a.lopend;
  const ant = antwoord(a);
  const compact = (iso: string) => iso.replaceAll("-", "");
  const aanroepJaar = `curl -A "${USER_AGENT}" \\\n  -d "stns=260&vars=TG&start=${l.jaar}0101&end=${compact(l.tot)}&fmt=json" \\\n  ${ENDPOINT}`;
  const aanroepAlles = `curl -A "${USER_AGENT}" \\\n  -d "stns=260&vars=TG&start=19510101&end=19551231&fmt=json" \\\n  ${ENDPOINT}`;
  const voorbeeld = w.rijen.slice(-2).map((r) => `{"station_code":260,"date":"${r.periode}T00:00:00.000Z","TG":${Math.round((r.waarde ?? 0) * 10)}}`);
  const top = [...a.perJaar].filter((p) => p.gemiddelde !== null).sort((x, y) => y.gemiddelde! - x.gemiddelde!).slice(0, 10);

  return (
    <main>
      <div className="kolom">
        <h1 className="vraag">Hoe we rekenen</h1>
        <p className="antwoord" style={{ fontSize: "clamp(20px, 3vw, 24px)" }}>
          {ant.zin} Zo komt die zin tot stand, en zo reken je hem zelf na.
        </p>

        <section className="sectie">
          <h2>De bron</h2>
          <p>
            Het KNMI publiceert per weerstation de daggegevens: temperatuur, neerslag, zon en wind. Wij gebruiken alleen de
            etmaalgemiddelde temperatuur (variabele TG) van station 260, De Bilt, vanaf 1951. De data staan onder CC BY 4.0:
            je mag ze hergebruiken als je het KNMI noemt.
          </p>
          <p>
            Het KNMI controleert de gegevens op werkdagen en vult soms ontbrekende waarden aan. Daarom noemen we de laatste
            30 dagen voorlopig; dat is onze eigen afspraak, de bron zelf zet geen vlag in de data. Op{" "}
            {datum("2026-10-18")} stond in robots.txt van daggegevens.knmi.nl geen enkele regel: ophalen mag. We sturen een
            eerlijke user-agent mee en halen de reeks in stukken van vijf jaar op, met een pauze ertussen.
          </p>
        </section>

        <section className="sectie" id="aanroep">
          <h2>De aanroep</h2>
          <p>Eén POST-verzoek per periode, zonder sleutel. Dit is de aanroep voor de cijfers van {l.jaar}:</p>
          <pre>
            <code>{aanroepJaar}</code>
          </pre>
          <p>Het antwoord is een lijst met één regel per dag. TG staat in tienden van een graad: {Math.round((w.rijen.at(-1)?.waarde ?? 0) * 10)} is {temperatuur(w.rijen.at(-1)?.waarde ?? 0)}.</p>
          <pre>
            <code>{`[\n  ${voorbeeld.join(",\n  ")}\n]`}</code>
          </pre>
          <p>De lange reeks halen we in stukken op, bijvoorbeeld 1951 tot en met 1955:</p>
          <pre>
            <code>{aanroepAlles}</code>
          </pre>
          <p>
            Alle {getal(w.rijen.length, 0)} dagen die we gebruiken staan als <a href="/data/tg">JSON</a>, met per dag de status
            (voorlopig of definitief). {maat.definitie}
          </p>
        </section>

        <section className="sectie">
          <h2>De rekenregels</h2>
          <ol style={{ paddingLeft: "1.2em", margin: "12px 0 0", display: "grid", gap: 8 }}>
            <li>
              We nemen het gemiddelde van alle daggemiddelden van 1 januari tot en met de laatste meting ({datum(l.tot)}):{" "}
              {temperatuur(l.gemiddelde)} over {l.dagen} dagen.
            </li>
            <li>
              Voor elk jaar van {BASIS.van} tot en met {BASIS.tot} doen we hetzelfde over dezelfde kalenderdagen. Het gemiddelde
              van die 30 jaren is het normaal: {temperatuur(l.normaal)}. Dat is ook de basisperiode die het KNMI gebruikt.
            </li>
            <li>
              Het verschil, {`${metTeken(l.afwijking)}\u00a0graden`}, is het antwoord. We ronden af op één decimaal en zeggen &quot;iets
              warmer&quot; bij minder dan een halve graad.
            </li>
            <li>
              Een jaar telt alleen mee als minstens {Math.round(MIN_DEKKING * 100)}% van de dagen een waarde heeft. Ontbrekende
              dagen blijven leeg; we vullen ze nooit met 0.
            </li>
            <li>
              De lijnen in de grafiek zijn een lopend gemiddelde over {VENSTER} dagen, tot en met de dag zelf. De grijze vlakte
              loopt van het 10e tot het 90e percentiel van die lijnen in {BASIS.van}–{BASIS.tot}. 29 februari valt in de
              grafiek weg; in de gemiddelden telt hij gewoon mee.
            </li>
          </ol>
        </section>

        <section className="sectie">
          <h2>De warmste jaren over dezelfde dagen</h2>
          <p>Gemiddelde temperatuur van 1 januari tot en met {datum(l.tot, false)}, sinds {a.eerste.slice(0, 4)}.</p>
          <div className="tabelvak" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Jaar</th>
                  <th className="getal">Gemiddeld</th>
                  <th className="getal">Tegenover normaal</th>
                </tr>
              </thead>
              <tbody>
                {top.map((p) => (
                  <tr key={p.jaar} style={p.jaar === l.jaar ? { fontWeight: 700 } : undefined}>
                    <td>{p.jaar}</td>
                    <td className="getal">{temperatuur(p.gemiddelde!)}</td>
                    <td className="getal">
                      {p.afwijking! >= 0 ? "▲" : "▼"} {getal(Math.abs(p.afwijking!))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sectie">
          <h2>Wat we niet zeggen</h2>
          <ul style={{ paddingLeft: "1.2em", margin: "12px 0 0", display: "grid", gap: 8 }}>
            <li>
              Dat dit voor heel Nederland geldt. De Bilt is één station; aan de kust is het in de zomer koeler en in de winter
              zachter.
            </li>
            <li>
              Hoe warm {l.jaar} als heel jaar wordt. We vergelijken alleen de dagen die al voorbij zijn; een koud najaar kan het
              beeld nog veranderen.
            </li>
            <li>
              Waarom het warmer is. Deze site meet; de oorzaak staat in de klimaatrapporten van het KNMI.
            </li>
          </ul>
        </section>

        <section className="sectie">
          <h2>Verversen</h2>
          <p>
            Elke ochtend haalt een GitHub Action de laatste twee jaar opnieuw op, zodat correcties van het KNMI meekomen. Op de
            eerste van de maand halen we alles opnieuw. Een waakhond weigert verse data die korter, ouder of leger is dan de
            vorige goede stand; dan blijft die vorige stand staan. Daarna controleert de toets dekking, grenzen, versheid en
            hoeveel er veranderde. Pas als alles klopt, gaat de nieuwe stand online.
          </p>
          {run ? (
            <p className="stil">
              Laatste oogst: {datum(run.klaar.slice(0, 10))}, {run.bronnen["knmi-daggegevens"]?.aanvragen ?? 0} aanvragen,{" "}
              {run.bronnen["knmi-daggegevens"]?.status === "ok" ? "in orde" : "niet gelukt"}.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
