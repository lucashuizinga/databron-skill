# Lessen

Eén les per bestand, in `docs/lessen/<categorie>/<slug>.md`. Lees de lessen vóór je aan een bron, de oogst of een
grafiek werkt; schrijf er een bij als je iets tegenkomt wat de volgende moet weten. `databron-leer` doet dat met je,
en meldt lessen over een bron ook aan Open Data Index (`meld_les`).

Categorieën: `bron`, `oogst`, `rekenen`, `tekst`, `grafiek`, `smaak`, `hosting`, `github`.

## Formaat

```markdown
---
titel: Een periode in de toekomst geeft HTTP 200 met een lege lijst
bron: knmi-daggegevens          # id in Open Data Index, of leeg
platform: knmi-daggegevens      # odata-v3, ckan, arcgis-rest, wfs, …
soort: fout-met-200             # robots | limiet | schemawijziging | codering | trendbreuk | fout-met-200
                                # | stil-filter | revisie | licentie | rekenen | tekst | grafiek | smaak | hosting | github
herkomst: gemeten               # gemeten | beschrijving | platform | redactie
gemeten_op: 2026-10-18
aanroep: "curl -d 'stns=260&vars=TG&start=20261020&end=20261025&fmt=json' https://www.daggegevens.knmi.nl/klimatologie/daggegevens"
status: geldig                  # geldig | verouderd
---

## Wat we zagen
## Wat niet werkte
## Wat werkt
## Hoe je het voorkomt
## Bewijs
```

- **herkomst**: `gemeten` = we hebben het zelf aangeroepen of getest; `beschrijving` = het staat in wat de bron
  publiceert; `platform` = algemene documentatie van het platform; `redactie` = een keuze of waarneming van ons.
- **Grounding**: een les met `herkomst: gemeten` en een `aanroep` voer je opnieuw uit voordat je hem opslaat. Lukt dat
  niet meer, dan wordt de herkomst `redactie`, met de oorspronkelijke datum.
- Niets wordt stil gewist: een les die niet meer klopt, krijgt `status: verouderd` en een regel waarom.

## De lessen in dit sjabloon

| Les | Soort |
|---|---|
| [Een periode in de toekomst geeft HTTP 200 met een lege lijst](bron/knmi-toekomst-lege-lijst.md) | fout-met-200 |
| [Labels uit elkaar duwen kan botsingen laten staan](grafiek/labels-botsen-na-duwen.md) | grafiek |
| [Tekst in een meeschalende SVG wordt op mobiel onleesbaar](grafiek/svg-tekst-schaalt-mee.md) | grafiek |
| [Satori zet losse spans op een eigen regel](grafiek/satori-spans-breken.md) | grafiek |
| [Een spatie na een expressie verdwijnt als de tekst over meer regels loopt](tekst/jsx-spatie-na-expressie.md) | tekst |
| [tsc kent de globale routetypen pas na next typegen](hosting/typegen-voor-tsc.md) | hosting |
