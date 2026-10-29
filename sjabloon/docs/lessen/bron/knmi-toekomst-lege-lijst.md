---
titel: Een periode in de toekomst geeft HTTP 200 met een lege lijst
bron: knmi-daggegevens
platform: rest
soort: fout-met-200
herkomst: gemeten
gemeten_op: 2026-10-18
aanroep: "curl -A 'databron-sjabloon/0.1 (+https://www.opendataindex.nl)' -d 'stns=260&vars=TG&start=20261020&end=20261025&fmt=json' https://www.daggegevens.knmi.nl/klimatologie/daggegevens"
status: geldig
---

## Wat we zagen
Een aanvraag voor 20 tot en met 25 oktober 2026, gedaan op 18 oktober, gaf HTTP 200 met `content-length: 2` en de
inhoud `[]`. Ook de nieuwste dag loopt achter: op 18 oktober (zondagavond) was 16 oktober de laatste.

## Wat niet werkte
Een lege lijst lezen als "niets veranderd" of als een geldige stand. Een oogst die per ongeluk een te late
begindatum vraagt, of een bron die tijdelijk niets teruggeeft, zou dan de data leegmaken.

## Wat werkt
De waakhond in `oogst/draai.ts` weigert een oogst zonder rijen, of met minder dagen of een oudere laatste dag dan de
vorige goede stand. De laatste goede stand blijft dan staan en `data/run.json` meldt waarom.

## Hoe je het voorkomt
- Vraag altijd tot en met vandaag; de bron kapt zelf af bij de laatste dag met data.
- Lees "geen rijen" nooit als "geen data": dat is de taak van de waakhond, niet van de parser.
- De versheidstoets (laatste dag hooguit 5 dagen oud) vangt een bron die dagenlang niets nieuws geeft.

## Bewijs
`DATABRON_STORING=leeg pnpm oogst` geeft "De bron gaf geen enkele rij terug" en laat `data/waarnemingen/tg.json`
ongewijzigd (getest 18 oktober 2026).
