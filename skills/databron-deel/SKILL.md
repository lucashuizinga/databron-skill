---
name: databron-deel
description: Zorg dat een Databron-project gevonden, geciteerd en gebruikt wordt - door zoekmachines, AI-assistenten, journalisten en de mensen over wie het gaat. Citeerbaar voor AI (antwoordzin, herkomst, versheid), pagina's per entiteit zonder dunne inhoud, een lancering waarvan de pitch de antwoordzin is, meten zonder cookies, en een bericht als de data echt veranderen. Gebruik dit na de eerste live-versie, en bij "lanceren", "delen", "pers", "SEO", "hoe krijg ik bezoekers".
argument-hint: "[vindbaar | lancering | meten | bericht]"
---

# Databron: delen

Een dataset die niemand vindt, beantwoordt niets. Deze stap komt na de eerste live-versie (stap 9 en 10 groen).
Sjablonen voor de pitch, de lijst met plekken, het meetplan en het bericht staan in `references/deel.md`.

## 1. Citeerbaar voor assistenten en zoekmachines

Een assistent citeert een zin die zegt wat het is, waar het vandaan komt en hoe vers het is. Geen grafiek.

- **De antwoordzin vooraan**: in `<title>`, de beschrijving, de eerste alinea en het deelbeeld. Dezelfde zin overal,
  uit `lib/duid.ts`, zodat hij na elke oogst overal tegelijk verandert.
- **Herkomst en peildatum in de tekst**, niet alleen in een voetnoot: "KNMI, tot en met 16 oktober 2026".
- **JSON-LD `Dataset`** met `temporalCoverage`, `spatialCoverage`, `distribution` (de JSON-download met `contentUrl`),
  `license`, `creator` en `dateModified` = de datum van de laatste meting, niet die van de build.
- **`llms.txt` en Markdown per pagina** met vraag, antwoord, bronnen en data-adressen; de data zelf als JSON of CSV.
- **In Open Data Index**: vraag de gebruiker of het project als voorbeeld of bouwproject in de Index mag. Dan vinden
  assistenten het via de MCP-server bij de bron waar het op gebouwd is.

## 2. Pagina's per entiteit zonder dunne inhoud (atlas, audit)

Honderden gemeentepagina's helpen alleen als elke pagina iets eigens zegt.

- **Elke pagina een eigen bevinding** uit de cijfers (rang, verschil met het land, verandering sinds vorig jaar),
  niet hetzelfde sjabloon met een andere naam erin.
- **Geen data, geen pagina**: maak hem niet, of zet `noindex`. Nooit honderd keer "geen gegevens".
- **Links als een web**: per entiteit de buren, vergelijkbare entiteiten, de laag erboven (buurt, gemeente,
  provincie) en een A-Z-index. Geen pagina zonder inkomende link.
- **Eén adres per entiteit**, met canonical. Slug op naam plus code als namen dubbel voorkomen (twee keer Bergen).

## 3. De lancering

- **De pitch is de antwoordzin.** Schrijf drie haakjes: *nieuws* (wat is er veranderd of opvallend), *dichtbij* (wat
  betekent het voor jouw gemeente of groep), *methode* (hoe we het weten en waarom het klopt).
- **Eerst de bron en de mensen over wie het gaat.** Stuur de uitgever en een paar betrokkenen de uitkomst met de vraag
  of ze iets zien dat niet klopt. Dat vangt fouten en levert vaak de eerste link op.
- **Dan de lijst met plekken** (sjabloon): journalisten van het onderwerp en de regio, vakgroepen, gemeenschappen,
  Open Data Index. Per plek: wie, waarom zij, welk haakje, wat je stuurt.
- **Een deelbeeld per bevinding**, niet alleen voor de homepage. Per platform een eigen tekst; niet één bericht overal.
- **De week erna staat in het plan**: correcties binnen een dag verwerken (met een zichtbare correctieregel), een
  tweede bevinding klaar hebben, vragen beantwoorden.
- **Nooit**: beloven wat de data niet dragen, een uitgever als partner noemen zonder toestemming, "live" bij
  dagelijkse data, of iets versturen namens de gebruiker zonder diens akkoord.

## 4. Meten

- **Begin met de vraag**: komen mensen bij de antwoordzin, delen ze hem, gebruiken ze de data? Meet alleen dat.
- **Zonder cookies als standaard**: Vercel Web Analytics of Cloudflare Web Analytics. GA4 zet cookies en vraagt dan om
  toestemming (AVG, Telecommunicatiewet) en een banner.
- **Meet ook wat machines doen**: downloads van `/data/*`, opvragingen van `llms.txt`, verwijzingen vanaf assistenten
  (referrer `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`).
- Zeg in de voettekst of op `/privacy` wat je meet en wat niet.

## 5. Een bericht als de data veranderen

Een monitor wordt gebruikt als mensen weten dat er iets nieuws is.

- **Een feed** (`/feed.xml`, Atom) met per item de nieuwe antwoordzin en de datum van de laatste meting. Goedkoop, en
  lezers en assistenten pakken hem op.
- **Alleen bij een echte verandering**: een drempel, een record, een nieuwe maand of jaargang. Niet bij elke run.
- **Mail alleen met dubbele bevestiging** en afmelden in één klik. Versturen gebeurt nooit vanzelf: de toets is groen
  én de gebruiker zegt ja.

## Poort

- De schema-validator (validator.schema.org) geeft geen fouten op de homepage en op één entiteitpagina, en
  `curl` van de homepage toont antwoordzin, peildatum en bron.
- `docs/lancering.md` staat er, ingevuld uit het sjabloon: de drie haakjes, de lijst met plekken en het meetplan. De
  gebruiker heeft de pitch uitdrukkelijk goedgekeurd; stilte is geen akkoord.
- Wat er gemeten wordt, staat op de site.
