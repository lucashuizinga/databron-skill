// De antwoordpagina: de vraag als kop, groot de antwoordzin, dan de bevindingen met hun grafiek, dan de herkomst.
// Alles wordt bij de build uit data/ gelezen en uitgerekend: de pagina is statisch.
import type { Metadata } from "next";
import Link from "next/link";
import { Bevinding, Jaarlijnen, Jaarstaven } from "@/components/beeld/index.ts";
import { leesMaat, leesRun, leesWaarnemingen } from "@/lib/data.ts";
import { antwoord, datum, datumKort, getal, herkomst, kopJaarlijnen, kopJaarstaven, maandTip, metTeken, temperatuur } from "@/lib/duid.ts";
import { leidAf } from "@/lib/reken.ts";
import { SITE } from "@/lib/site.ts";

async function laad() {
  const [w, maat, run] = await Promise.all([leesWaarnemingen("tg"), leesMaat("tg"), leesRun()]);
  return { a: leidAf(w.rijen), w, maat, run };
}

export async function generateMetadata(): Promise<Metadata> {
  const { a } = await laad();
  const ant = antwoord(a);
  return {
    title: { absolute: `${SITE.vraag} ${ant.kort}.` },
    description: `${ant.zin} ${ant.rang}`,
    openGraph: { title: SITE.vraag, description: ant.zin, type: "website", locale: "nl_NL" },
  };
}

export default async function Home() {
  const { a, w, maat, run } = await laad();
  const ant = antwoord(a);
  const l = a.lopend;
  const jl = kopJaarlijnen(a);
  const js = kopJaarstaven(a);
  const bron = herkomst(a);
  const vorigJaar = l.jaar - 1;
  const melding = run?.waakhond ?? (run?.bronnen["knmi-daggegevens"]?.status === "fout" ? run.bronnen["knmi-daggegevens"].melding : null);

  const staven = a.perJaar
    .filter((p) => p.afwijking !== null)
    .map((p) => ({
      label: String(p.jaar),
      waarde: p.afwijking!,
      tip: `${p.jaar}: gemiddeld ${temperatuur(p.gemiddelde!)}, ${p.afwijking! >= 0 ? "▲" : "▼"} ${getal(Math.abs(p.afwijking!))} graden tegenover normaal`,
    }));
  const eersteJaar = staven[0]?.label;

  return (
    <main>
      <div className="kolom">
        <h1 className="vraag">{SITE.vraag}</h1>
        <p className="antwoord">
          <strong>{ant.kort}:</strong> {ant.zin.slice(ant.kort.length + 2)}
        </p>
        <p className="toelichting">
          {ant.rang} Gemiddeld was het {temperatuur(l.gemiddelde)}, tegen {temperatuur(l.normaal)} normaal. {ant.voorlopig}
        </p>
        {melding ? (
          <p className="melding" role="status">
            {melding}
          </p>
        ) : null}
      </div>

      <Bevinding kop={jl.kop} onder={jl.onder} bron={bron} aanroep={{ href: "/methode#aanroep", tekst: "Bekijk de aanroep." }} id="jaarlijnen">
        <Jaarlijnen
          aria={`${jl.kop}. ${ant.zin}`}
          invoer={{
            lopend: a.jaarlijnen.lopend,
            vorig: a.jaarlijnen.vorig,
            band: { onder: a.jaarlijnen.band.p10, boven: a.jaarlijnen.band.p90, midden: a.jaarlijnen.band.gem },
            labels: { lopend: String(l.jaar), vorig: String(vorigJaar), midden: "normaal" },
          }}
          punt={{ titel: String(l.jaar), waarde: `${datumKort(l.tot)}: ${temperatuur(a.jaarlijnen.lopend.findLast((v) => v !== null) ?? l.gemiddelde)}` }}
          tips={a.maanden.map((m) => maandTip(a, m.maand))}
          as={(v) => `${getal(v, 0)}°`}
        />
      </Bevinding>

      <Bevinding kop={js.kop} onder={js.onder} bron={bron} aanroep={{ href: "/methode#aanroep", tekst: "Bekijk de aanroep." }} id="jaarstaven">
        <Jaarstaven
          aria={`${js.kop}. ${ant.zin}`}
          reeks={staven}
          as={(v) => (v === 0 ? "0" : metTeken(v, v % 1 === 0 ? 0 : 1))}
          waarde={(v) => `${v >= 0 ? "▲" : "▼"} ${getal(Math.abs(v))}`}
          xLabels={(label) => label === eersteJaar || ["1970", "1990", "2010"].includes(label)}
        />
      </Bevinding>

      <section className="sectie kolom" aria-labelledby="over">
        <h2 id="over">Over deze cijfers</h2>
        <dl className="feiten" style={{ marginTop: 16 }}>
          <dt>Bron</dt>
          <dd>
            <a href="https://www.knmi.nl/nederland-nu/klimatologie/daggegevens">KNMI daggegevens</a>, station 260 De Bilt. Licentie CC BY 4.0.
          </dd>
          <dt>Wat we meten</dt>
          <dd>{maat.definitie}</dd>
          <dt>Laatste meting</dt>
          <dd>
            {datum(a.laatste)}. {a.voorlopigVanaf ? `Vanaf ${datum(a.voorlopigVanaf)} voorlopig.` : null}
          </dd>
          <dt>Normaal</dt>
          <dd>
            Het gemiddelde van {a.basis.van}–{a.basis.tot} over dezelfde kalenderdagen, zoals het KNMI een normaal berekent.
          </dd>
          <dt>Opgehaald</dt>
          <dd>{run ? `${datum(run.klaar.slice(0, 10))}, versie van de data ${datum(w.versie.slice(0, 10))}.` : "Onbekend."}</dd>
          <dt>Zelf nagaan</dt>
          <dd>
            <Link href="/methode#aanroep">De exacte aanroep</Link>, <a href="/data/tg">alle {getal(w.rijen.length, 0)} dagen als JSON</a> en{" "}
            <Link href="/methode">hoe we rekenen</Link>.
          </dd>
        </dl>
      </section>
    </main>
  );
}
