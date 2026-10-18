# Het formaat van een les

`docs/lessen/<soort>/<slug>.md`. Geen datum in de bestandsnaam; de datum staat in de frontmatter.

```markdown
---
titel: Feed-endpoint past alleen het eerste $filter-predicaat toe
bron: politie-overlast          # id in Open Data Index, of weglaten
platform: odata                 # alle | odata | sdmx | jsonstat | arcgis | ogc | stac | ckan | socrata | sparql | oai-pmh | rest | bestanden
soort: stil-filter              # robots | limiet | schemawijziging | codering | trendbreuk | fout-met-200 | stil-filter
                                # | revisie | licentie | rekenen | tekst | grafiek | smaak | hosting | github
herkomst: gemeten               # gemeten (eigen aanroep) | beschrijving (staat in de docs) | platform | leerpunt (ervaring)
gemeten_op: 2026-10-16
aanroep: "https://dataderden.cbs.nl/ODataFeed/OData/47024NED/TypedDataSet?$filter=…"
status: geldig                  # geldig | verouderd
gemeld: 12                      # id van meld_les, als hij naar de Index ging
---

## Wat we zagen
Met getallen: status, aantal rijen, grootte, tijd.

## Wat niet werkte
Wat we probeerden. Dit is vaak het duurste deel van de les.

## Wat werkt
De oplossing, zo concreet dat je hem kunt overnemen.

## Hoe je het voorkomt
Een test, een controle in de toets, een regel in de parser.

## Bewijs
De aanroep, het commando, of het bestand en de regel.
```

Bij `meld_les` hoort dezelfde inhoud: `titel`, `bron` of `platform`, `soort`, `zagen`, `niet_werkte`, `werkt`,
`voorkomen`, `aanroep`, `gemeten_op`, en optioneel `project`. Nooit sleutels of persoonsgegevens.
