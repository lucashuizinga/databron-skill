// Korte Markdown voor AI-assistenten: de vraag, het antwoord, de bron en waar de data staan.
import { leesMaat, leesWaarnemingen } from "@/lib/data.ts";
import { antwoord, datum } from "@/lib/duid.ts";
import { leidAf } from "@/lib/reken.ts";
import { SITE, siteUrl } from "@/lib/site.ts";

export const dynamic = "force-static";

export async function GET() {
  const [w, maat] = await Promise.all([leesWaarnemingen("tg"), leesMaat("tg")]);
  const a = leidAf(w.rijen);
  const ant = antwoord(a);
  const basis = siteUrl();
  const tekst = `# ${SITE.naam}

> ${SITE.vraag} ${ant.zin} ${ant.rang}

${ant.voorlopig ?? ""}

## Bron

- KNMI daggegevens, station 260 De Bilt, variabele TG (etmaalgemiddelde temperatuur), vanaf ${a.eerste.slice(0, 4)}. Licentie CC BY 4.0.
- Laatste meting: ${datum(a.laatste)}. Normaal: gemiddelde van ${a.basis.van}–${a.basis.tot} over dezelfde kalenderdagen.
- Aanroep: \`${maat.aanroep}\`

## Data

- [Alle dagen als JSON](${basis}/data/tg): ${w.rijen.length} rijen met entiteit, periode, waarde (°C) en status (voorlopig of definitief). Checksum ${w.checksum}.
- [Hoe we rekenen](${basis}/methode): de rekenregels en de exacte aanroep.
`;
  return new Response(tekst, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
