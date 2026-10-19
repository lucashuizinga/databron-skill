---
name: databron
description: De dirigent van Databron. Gebruik dit wanneer iemand een dataset, grafiek, monitor, atlas, vergelijker of index wil bouwen op open data ("ik wil laten zien hoe…", "bouw een site over…", "/databron"), of verder wil met een Databron-project (er staat een vraag.md of STAND.md). Kiest de volgende stap in de lus en roept die skill aan; elke stap heeft een poort.
argument-hint: "[wat je wilt bouwen, of leeg om verder te gaan]"
---

# Databron

Vind het in de Index, bouw het met Databron. Databron maakt van open-data-API's een dataset die klopt, zichzelf
ververst en bij elk getal zegt waar het vandaan komt, met een grafiek en een site die je durft te delen.

De kennis komt van **Open Data Index** via de MCP-server `opendataindex` (deze plugin koppelt hem vanzelf). Gebruik hem
vóór je iets zelf uitzoekt: `zoek_bron`, `geef_bron`, `geef_lessen`, `lijst_projecten`, `geef_project`, `zoek_datasets`.
Wat je onderweg leert over een bron, gaat terug met `meld_les` (via `databron-leer`).

## Zonder de plugin (Codex, Cursor, Copilot, Gemini CLI)

Wie de skills met `npx skills add lucashuizinga/databron-skill` installeerde, heeft geen sjabloon naast de skills en
misschien geen MCP-server. Dan:
- **Sjabloon**: `npx degit lucashuizinga/databron-skill/sjabloon <map>` (of clone de repo en kopieer `sjabloon/`).
- **De Index**: zie je geen `opendataindex`-functies, vraag de gebruiker de MCP-server toe te voegen
  (`https://www.opendataindex.nl/api/mcp`, HTTP, geen sleutel; uitleg op databron.nl). Intussen lees je dezelfde kennis
  als tekst: `https://www.opendataindex.nl/llms.txt` en per bron `https://www.opendataindex.nl/bron/<id>.md`.
  `meld_les` kan dan niet: zet de les in `STAND.md` onder "Voor de Index".

## De lus

| Stap | Skill | Schrijft | Poort (klaar als) |
|---|---|---|---|
| 0 | `databron-start` | het sjabloon lokaal, `STAND.md` | de voorbeeldsite draait lokaal en de gebruiker heeft hem gezien |
| 1 | `databron-vraag` | `vraag.md` | de antwoordzin is met echte cijfers in te vullen |
| 2 | `databron-verken` | `bronnen.yaml`, `bronnen/<id>.md` | elke bron: geteste aanroep met datum, licentie, robots-afweging |
| 3 | `databron-oogst` | `oogst/<bron>.ts`, `-parse.ts`, tests | twee keer draaien = zelfde resultaat; storing → laatste goede stand |
| 4 | `databron-opslag` | `data/` of `db/` | herstel uit back-up geeft dezelfde cijfers |
| 5 | `databron-toets` | `toets/rapport.md` | exit 0 |
| 6 | `databron-reken` | `lib/reken.ts` | elke functie getest met een met de hand gecontroleerd getal |
| 7 | `databron-duid` | `lib/duid.ts` | tekst over alle entiteiten zonder NaN, lege plek of "nu" |
| 8 | `databron-ontwerp` | `ontwerp.md` | toon, visitekaartje en interacties gekozen door de gebruiker |
| 9 | `databron-beeld` | `components/beeld/…` | schermafbeeldingen 390/1280, licht/donker, zonder overloop |
| 10 | `databron-site` | pagina's, favicon, OG, sitemap, llms.txt | productiebuild lokaal, curl vindt de kernzin, pagina is af |
| 11 | `databron-live` | GitHub-repo, hosting | alleen na een ja: live-URL antwoordt, eerste ophaalronde groen |
| 12 | `databron-ververs` | `.github/workflows/oogst.yml` | kapotte bron laat vorige stand staan en meldt het |
| 13 | `databron-deel` | `docs/lancering.md`, JSON-LD, feed | schema zonder fouten, pitch goedgekeurd |
| ✓ | `databron-review` | bevindingen | bij de poorten na 5, 9 en 10 |
| ✓ | `databron-leer` | `docs/lessen/`, `meld_les`, `meld_feedback` | aan het eind van elke sessie met een niet-triviale oplossing |

## Hoe je dirigeert

1. **Waar staan we?** Lees `STAND.md` en `vraag.md` in de projectmap. Geen van beide en geen project: begin bij
   `databron-start` (nieuw project) of `databron-vraag` (bestaand project zonder Databron-opbouw).
2. **Begin bij de Index.** Vraag `lijst_projecten` en `zoek_bron` met het onderwerp. Bestaat er een bouwproject dat
   past, lees het met `geef_project`: dan heb je geteste aanroepen, een prompt en valkuilen.
3. **Eén stap tegelijk.** Roep de skill van de eerste stap aan waarvan de poort nog niet groen is. Controleer na afloop
   zelf de poort (draai het commando, bekijk het bestand). Pas dan de volgende.
4. **Werk `STAND.md` bij** na elke stap, in gewone taal, met vijf kopjes: *Wat er is*, *Wat deze ronde klaar kwam*,
   *Wat nog moet*, *Hoe je verder gaat* (het eerstvolgende commando of de skill) en *Beslispunten*. Iemand moet er na
   een week mee verder kunnen, ook een andere agent.
5. **Akkoord is een woord.** Bij de antwoordzin (stap 1), bij het ontwerp (stap 8), vóór online zetten (stap 11) en
   vóór de lancering vraag je de gebruiker uitdrukkelijk om ja. Stilte, of je eigen "ziet er goed uit", is geen akkoord.
6. **Drie zinnen bij elke poort.** Meld naast "klaar": wat de moeilijkste beslissing was, welk alternatief afviel en
   waarom, en waar je het minst zeker van bent. Dat laatste is waar de gebruiker naar kijkt.
7. **Tijd gaat naar denken en controleren.** Het meeste werk zit in vraag, verkennen, toets en review; bouwen gaat
   snel. Vraag na elke ronde: wat maakt de volgende ronde makkelijker? Dat antwoord gaat naar `databron-leer`.
8. **Beslispunten niet gokken.** robots.txt die het verbiedt, een licentie die hergebruik beperkt, een sleutel die de
   gebruiker moet aanvragen, een betaalde dienst: zet het als beslispunt in `STAND.md`, leg de opties uit met een advies,
   en vraag het. Ga intussen verder met wat niet afhangt van het antwoord.
9. **Sluit af met `databron-leer`** als er iets niet-triviaals is opgelost, en vraag aan het eind van een sessie één
   keer of de gebruiker feedback over Databron wil geven (`meld_feedback`, zie `databron-leer`). Een ronde zonder les is een ronde waarin
   het systeem niet slimmer werd.

## Projecttype

`databron-vraag` kiest het type; dat bepaalt de standaarden in de rest van de lus.

| Type | Voorbeeld | Hoofdvormen | Opslag (trede) |
|---|---|---|---|
| monitor | Gaspeil: halen we het vuldoel? | band met doel, jaarlijnen | bestanden (1) of database (2) |
| atlas | Staat van: hoe staat jouw buurt ervoor? | stippenrij, rangorde, choropleet | database (2) |
| profiel | averageperson.eu: de doorsnee persoon zoals jij | aandeel, reeks met EU-lijn | bestanden met versies (1) |
| audit | Stikstofcijfers: hoe goed rapporteren landen? | scorekaart, choropleet, perspectieven | bestanden (1) |

## Wat Databron nooit doet

- Een getal verzinnen, een ontbrekende waarde als 0 tonen, of een gat in een reeks opvullen.
- robots.txt of een 403 omzeilen, een browser-user-agent nadoen, of een sleutel in code, chat of log zetten.
- "nu", "live" of "deze maand" schrijven bij data die achterloopt: altijd de datum van de laatste meting.
- Publiceren als de toets faalt.
- Historie weggooien (`slice(-N)` op archiefdata, rijen overschrijven).

## Eerst lokaal, online pas na een ja

Alles gebeurt eerst op de computer van de gebruiker: de site draait lokaal en de gebruiker ziet hem in de browser.
Stel GitHub, hosting of een account niet voor voordat de lokale site er staat en de gebruiker hem goed vindt; dan pas
`databron-live`, na een uitdrukkelijk ja.

## Praten met de gebruiker

- **Begin met drie zinnen gewone taal** over wat er gaat gebeuren, en vraag dan hoe de gebruiker wil dat je werkt:
  "1. Ik leg elke stap kort uit en vraag het als er iets te kiezen is (aanbevolen als dit nieuw voor je is). 2. Ik werk
  door en meld alleen wat ik deed en wat jij moet beslissen." Zet de keuze in `STAND.md`.
- **Geen interne woorden**: niet "poort", "trede", "oogst", "lus" of skillnamen tegen de gebruiker. Zeg "controle",
  "opslag", "ophalen", "de stappen".
- **Keuzes met opties**: twee tot vier, de aanbevolen keuze bovenaan met een zin waarom. Terminalcommando's die de
  gebruiker zelf moet typen (logins) met `!` ervoor.
- **Laat zien in plaats van beschrijven**: een schermafbeelding van de lokale site zegt meer dan een opsomming.
