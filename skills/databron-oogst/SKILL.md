---
name: databron-oogst
description: Bouw het ophalen van een bron in een Databron-project - een fetcher voor de IO en een pure parser met tests, retry en time-outs, ruwe antwoorden met herkomst, en een waakhond die bij een storing de laatste goede stand laat staan. Gebruik dit nadat databron-verken een datacontract heeft opgeleverd, of als een oogst onbetrouwbaar is.
argument-hint: "[bron-id]"
---

# Databron: ophalen

Doel: herhaalbaar en veilig ophalen, zodat een storing bij de bron nooit de site breekt.
Het sjabloon (`oogst/knmi.ts`, `oogst/knmi-parse.ts`, `oogst/draai.ts`) is het voorbeeld; kopieer de vorm.

## De opbouw (per bron twee bestanden)

- **`oogst/<bron>.ts`**: alleen IO. Vaste koppen (User-Agent met contact, Accept, `Accept-Language: nl, en;q=0.8`),
  time-out per aanroep (AbortSignal), hooguit 4 pogingen met oplopende wachttijd en `Retry-After`, paginering of
  stukken (lange reeksen in brokken van een paar jaar), een korte pauze tussen aanroepen. Geeft ruwe antwoorden terug.
- **`oogst/<bron>-parse.ts`**: puur, zonder netwerk of bestanden. Van ruw naar waarnemingen in de vaste vorm
  `{ maat, entiteit, periode, dims?, waarde, status }` (zie `databron-opslag`). Eenheden omrekenen, codes trimmen,
  periodes in ISO (`2025`, `2025-Q3`, `2025-09`, `2025-09-14`). **Een lege waarde blijft `null`, nooit 0.** Gooit een
  fout als de vorm niet klopt (verwacht veld weg, HTML in plaats van JSON): fouten met HTTP 200 bestaan.
- **`tests/<bron>-parse.test.ts`**: met een klein echt voorbeeldantwoord (uit het datacontract) als vaste invoer.
  Test eenheden, null, codes, periodes, en de domeinregels uit de valkuilen.

## De orkestratie (`oogst/draai.ts`)

- `veilig(label, fouten, fn)`: elke bron in zijn eigen try; één kapotte bron stopt de rest niet.
- **De waakhond**: vergelijk de verse stand met de vorige goede. Weiger als hij korter is (minder rijen of periodes),
  ouder (laatste periode vroeger dan de vorige), of leger (meer dan 30% minder waarden). Dan blijft de vorige stand
  staan en komt er een melding in `data/run.json` die de site toont.
- **Gezondheid per bron** in `data/run.json`: laatst gelukt, laatst mislukt, aantallen, duur.
- **Ruwe antwoorden** niet in git (trede 1) maar in een cachemap of objectopslag (trede 2:
  `ruw/<bron>/<datum>/<hash>.json.gz`), met de hash van de aanvraag als naam, zodat een run na te spelen is.
- **Revisievenster**: als de bron voorlopige cijfers bijstelt, haal elke run het venster opnieuw op (bijvoorbeeld de
  laatste 10 dagen of de laatste 3 maanden) en markeer die periodes als `voorlopig`.

## Sjablonen per platform

Lees `references/platformen.md` voor de aanpak per platform (OData, JSON-stat, SDMX, ArcGIS REST, WFS/OGC API, CKAN,
Socrata, STAC) en vraag `geef_lessen(platform: <platform>)` voor de bekende valkuilen. `geef_bron(<id>)` geeft per bron
geteste voorbeeldcode (curl, Python, JavaScript) en de exacte aanroepen achter de voorbeeldgrafieken: begin daarmee.

## Poort

- `pnpm oogst` twee keer achter elkaar geeft hetzelfde resultaat (de tweede keer: niets veranderd).
- De parsertests slagen.
- Een gesimuleerde storing (zet de URL tijdelijk fout, of geef de parser een lege lijst) laat `data/` op de vorige
  stand en zet een melding in `data/run.json`. Draai die proef echt en zet de uitkomst in `STAND.md`.
