// Vormen: elke vorm uit de engine één keer, met de echte cijfers van dit project.
// Bedoeld voor wie bouwt: zo ziet elke vorm eruit en zo roep je hem aan. Niet in de sitemap.
import type { Metadata } from "next";
import { Aandeel, BandMetDoel, Bevinding, Rangorde, Reeks, Stippenrij } from "@/components/beeld/index.ts";
import { leesWaarnemingen } from "@/lib/data.ts";
import { datum, datumKort, getal, herkomst, maandNaam, metTeken, temperatuur } from "@/lib/duid.ts";
import { jaarTotDatum, leidAf, voortschrijdend } from "@/lib/reken.ts";

export const metadata: Metadata = {
  title: "Vormen",
  description: "De grafische vormen van deze site, elk met echte cijfers.",
  robots: { index: false },
};

export default async function Vormen() {
  const w = await leesWaarnemingen("tg");
  const a = leidAf(w.rijen);
  const l = a.lopend;
  const bron = herkomst(a);
  const jaren = a.jaargemiddelden;
  const tienjaars = voortschrijdend(
    jaren.map((j) => j.gemiddelde),
    10,
  );
  const ytd = jaarTotDatum(w.rijen, l.jaar);
  const iStand = ytd.lopend.findLastIndex((v) => v !== null);
  const stand = ytd.lopend[iStand] ?? l.gemiddelde;
  const p90 = ytd.p90[iStand] ?? null;
  const p10 = ytd.p10[iStand] ?? null;
  // De kop zegt alleen wat de cijfers laten zien: boven, binnen of onder de band.
  const tegenBand = p90 !== null && stand > p90 ? "boven de band" : p10 !== null && stand < p10 ? "onder de band" : "binnen de band";
  const vergelijkbaar = a.perJaar.filter((p) => p.afwijking !== null);
  const laatsteJaar = jaren.at(-1)!;
  const eerste30 = jaren.slice(0, 30);
  const laatste30 = jaren.slice(-30);
  const gem = (xs: { gemiddelde: number }[]) => xs.reduce((s, x) => s + x.gemiddelde, 0) / xs.length;

  return (
    <main>
      <div className="kolom">
        <h1 className="vraag">Vormen</h1>
        <p className="toelichting">
          Elke vorm uit de grafische engine, met de cijfers van deze site. Jaarlijnen en Jaarstaven staan op de{" "}
          <a href="/">voorpagina</a>. Elke kop is een bevinding en komt uit de cijfers; pas dat ook zo toe als je een vorm
          hergebruikt.
        </p>
      </div>

      <Bevinding
        niveau={2}
        kop={`De laatste 30 jaar waren gemiddeld ${getal(gem(laatste30) - gem(eerste30))} graden warmer dan de eerste 30`}
        onder={`Reeks: jaargemiddelde temperatuur in De Bilt, ${jaren[0]!.jaar}–${laatsteJaar.jaar}, in °C. De stippellijn is het gemiddelde over de 10 jaar ervoor.`}
        bron={bron}
      >
        <Reeks
          aria={`Jaargemiddelde temperatuur in De Bilt van ${jaren[0]!.jaar} tot en met ${laatsteJaar.jaar}. ${laatsteJaar.jaar}: ${temperatuur(laatsteJaar.gemiddelde)}.`}
          punten={jaren.map((j, i) => ({ periode: String(j.jaar), waarde: j.gemiddelde, vergelijk: tienjaars[i] ?? null }))}
          labels={{ lijn: String(laatsteJaar.jaar), vergelijk: "10 jaar" }}
          as={(v) => `${getal(v, 0)}°`}
          xLabel={(p) => (["1951", "1970", "1990", "2010"].includes(p) ? p : null)}
        />
      </Bevinding>

      <Bevinding
        kop={`Het gemiddelde sinds 1 januari staat op ${temperatuur(stand)}, ${tegenBand} van ${a.basis.van}–${a.basis.tot}`}
        onder={`BandMetDoel: gemiddelde temperatuur vanaf 1 januari tot elke dag, in °C. De vlakte is waar 8 van de 10 jaren uit ${a.basis.van}–${a.basis.tot} lagen; de open stip is het normaal voor een heel jaar.`}
        bron={bron}
      >
        <BandMetDoel
          aria={`Gemiddelde temperatuur sinds 1 januari ${l.jaar}: ${temperatuur(stand)} op ${datum(l.tot)}.`}
          punten={ytd.dagen.map((d, i) => ({ periode: d, waarde: ytd.lopend[i] ?? null, onder: ytd.p10[i] ?? null, boven: ytd.p90[i] ?? null }))}
          punt={{ titel: String(l.jaar), waarde: (v) => `${datumKort(l.tot)}: ${temperatuur(v)}` }}
          doel={ytd.jaarNormaal !== null ? { index: 364, waarde: ytd.jaarNormaal, label: `normaal jaar ${temperatuur(ytd.jaarNormaal)}` } : undefined}
          as={(v) => `${getal(v, 0)}°`}
          xLabel={(p) => (p.endsWith("-01") ? maandNaam(Number(p.slice(0, 2)), true) : null)}
        />
      </Bevinding>

      <Bevinding
        kop={
          l.rang === 1
            ? `${l.jaar} staat bovenaan de warmste jaren over 1 januari tot en met ${datum(l.tot, false)}`
            : `${l.jaar} staat op plek ${l.rang} van de warmste jaren over 1 januari tot en met ${datum(l.tot, false)}`
        }
        onder="Rangorde: gemiddelde temperatuur over dezelfde dagen, de tien warmste jaren, in °C."
        bron={bron}
      >
        <Rangorde
          aria={`De tien warmste jaren over dezelfde dagen. ${l.jaar}: ${temperatuur(l.gemiddelde)}.`}
          rijen={vergelijkbaar.map((p) => ({ id: String(p.jaar), naam: String(p.jaar), waarde: p.gemiddelde! }))}
          eigen={String(l.jaar)}
          waarde={(v) => temperatuur(v)}
          max={10}
        />
      </Bevinding>

      <Bevinding
        kop={`${vergelijkbaar.filter((p) => p.afwijking! > 0).length} van de ${vergelijkbaar.length} jaren waren over dezelfde dagen warmer dan normaal`}
        onder={`Stippenrij: elk jaar sinds ${a.eerste.slice(0, 4)} als stip, naar de afwijking van het gemiddelde van ${a.basis.van}–${a.basis.tot} over 1 januari tot en met ${datum(l.tot, false)}, in graden.`}
        bron={bron}
      >
        <div style={{ paddingTop: 24 }}>
          <Stippenrij
            aria={`Afwijking per jaar over dezelfde dagen. ${l.jaar}: ${metTeken(l.afwijking)} graden.`}
            punten={vergelijkbaar.map((p) => ({ id: String(p.jaar), naam: String(p.jaar), waarde: p.afwijking! }))}
            eigen={String(l.jaar)}
            referentie={{ waarde: 0, label: "normaal" }}
            waarde={(v) => `${metTeken(v)} graden`}
            as={(v) => (v === 0 ? "0" : metTeken(v, 0))}
          />
        </div>
      </Bevinding>

      <Bevinding
        kop={`${l.jaar} was op ${l.dagenBoven} van de ${l.dagenVergeleken} dagen warmer dan normaal`}
        onder={`Aandeel: dagen van 1 januari tot en met ${datum(l.tot, false)} ${l.jaar}, tegenover het gemiddelde van die kalenderdag in ${a.basis.van}–${a.basis.tot}.`}
        bron={bron}
      >
        <Aandeel
          aria={`${l.dagenBoven} van de ${l.dagenVergeleken} dagen warmer dan normaal.`}
          delen={[
            { id: "warmer", naam: "warmer dan normaal", waarde: l.dagenBoven, kleur: "var(--onderwerp)" },
            { id: "niet", naam: "niet warmer", waarde: l.dagenVergeleken - l.dagenBoven, kleur: "var(--context)" },
          ]}
          waarde={(d) => `${d} dagen`}
        />
      </Bevinding>
    </main>
  );
}
