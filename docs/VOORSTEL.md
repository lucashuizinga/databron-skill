# Databron: een skillset om goede datasets te bouwen

Voorstel, 18 oktober 2026 (tweede versie). Gebaseerd op onderzoek naar de plugin Compound Engineering (Every) en vier
eigen projecten:
- Gaspeil (`~/code/gasvullen`);
- Staat van (`~/code/gedoe`);
- averageperson.eu (`~/code/eufam-style-lab`, de nieuwste stand van `eufam`);
- Stikstofcijfers (`~/code/stikstofindex`).

Open Data Index zelf telt als vijfde. De volledige onderzoeksrapporten staan in `docs/skillset/onderzoek/`.

Nieuw in deze versie:
- de naam Databron;
- de databaseindeling (§8);
- draaien op Vercel of Cloudflare (§9);
- GitHub als motor en het begeleiden van mensen (§10);
- de smaak voor interface en grafieken (§11 en §12).

---

## 1. In het kort

- **Vind het in de Index, bouw het met Databron.** Open Data Index is waar je bronnen vindt. Databron is de skillset
  waarmee je er zelf een goede dataset, grafiek en site van maakt. Wat je bouwt, meldt zijn lessen terug aan de Index.
- De vier projecten volgen dezelfde keten:
  1. één vraag;
  2. bronnen echt aanroepen;
  3. ophalen met een waakhond;
  4. opslaan zonder iets weg te gooien;
  5. controleren vóór publicatie;
  6. tekst uit de cijfers;
  7. één grafiek per bevinding;
  8. een site met de herkomst bij elk getal;
  9. automatisch verversen.

  Geen project doet alles goed. Databron maakt het beste van elk de standaard.
- Van Compound Engineering nemen we de kern over: **elke ronde maakt de volgende makkelijker**, omdat elke les wordt
  opgeschreven waar de volgende agent haar vindt. Bij ons groeit die kennis niet alleen in één repo, maar ook in Open
  Data Index (§13).
- Databron heeft **een mening**:
  - een vaste databaseindeling;
  - code die op Vercel én Cloudflare draait;
  - GitHub als motor;
  - een uitgesproken smaak voor interface en grafieken, opgebouwd uit jouw feedback in vijf projecten.

  Wie Databron gebruikt, krijgt die keuzes cadeau, en wordt bij elke stap begeleid.
- Dertien skills plus de dirigent `/databron` (§6), vier projecttypen (§7), drie treden van eenvoudig naar zwaar
  (§10), één gedeelde grafische engine (§12). Bouwen in zes fasen, elk met een proef (§16).

---

## 2. Wat de projecten gemeen hebben

### Per project

| | Gaspeil | Staat van (gedoe) | averageperson.eu (eufam) | Stikstofcijfers |
|---|---|---|---|---|
| **Kernvraag** | Halen we het vuldoel? | Hoe staat jouw buurt ervoor? | Hoe leeft de doorsnee persoon zoals jij in land X? | Hoe goed rapporteren landen hun stikstofcijfers? |
| **Type** | Tijdreeks-monitor | Entiteitenatlas (18.500 gebieden) | Profiel en vergelijker | Audit-index (27 landen) |
| **Bronnen** | GIE AGSI+/ALSI+, NED, ENTSOG, KNMI, havens, AIS | CBS/politie OData, KWB, PDOK, RIVM | Eurostat JSON-stat (≈85 metrics) | Handmatige audit + Eurostat |
| **Opslag** | Upstash KV, jaarbuckets append-only, back-up naar Blob | Neon, smalle feitentabel + EAV + `etl_runs` | Neon met vintages, bevroren `eu.json` met checksum in git | Getypte TS-bestanden |
| **Beeld** | Eigen SVG, canvas-diorama, MapLibre, three.js | Eigen SVG-grammatica, canvas-puls, MapLibre | Handgeschreven SVG, parametrische figuur | d3-geo-choropleet, HTML |
| **Ververs** | Cron 3x per dag | GitHub Action op de 16e | Wekelijkse PR met validatierapport | Niet (eenmalig) |

### Wat elk project uitzonderlijk goed doet

- **Gaspeil**:
  - **de waakhond met de laatste goede stand** (`lib/lng-guard.ts`): verse data die korter, ouder of leger is dan de
    vorige goede stand wordt geweigerd, en de site meldt dat;
  - één rekenregel voor de pagina, het OG-beeld en de mail;
  - het revisievenster: de laatste 3 dagen tellen niet mee in gemiddelden;
  - fetcher en parser gescheiden, de parser puur en getest.
- **Staat van**:
  - **de acht cijferregels**;
  - `check-data.mjs` als poort vóór publicatie;
  - een LLM alleen met bewijsplicht: feiten krijgen F-nummers en elk getal in de tekst wordt nagerekend;
  - de placebotoets;
  - de viz-grammatica (Bevinding, Jaarlijnen, Stippenrij, Rangorde, Verschillen).
- **averageperson.eu**:
  - **een register in plaats van code per metric**;
  - één afleidfunctie voor validatie én export;
  - vintages met een publicatiepoort en een checksum in de build;
  - de resolver vóór de tekst ("een zin spreekt alleen voor wat echt gemeten is");
  - een bytebudget per route.
- **Stikstofcijfers**:
  - **de these eerst toetsen**;
  - een claimladder;
  - een scoremodel met tests en verhaaltests;
  - drie kleurlogica's (oordeel, hoeveelheid, geen data);
  - "niet gevonden" is iets anders dan "bestaat niet".
- **Open Data Index**:
  - herkomst per feit;
  - kop en dek berekend uit de cijfers;
  - eerlijke user-agent en een robots-afweging per bron;
  - de MCP-server en Markdown per pagina voor AI-assistenten.

### Waar het nog misgaat (en wat Databron zou vangen)

| Project | Gat | Skill die het vangt |
|---|---|---|
| Gaspeil | `toNumber` in `lib/agsi.ts` maakt van `null` een `0` | `databron-toets` |
| Gaspeil | `slice(-180)` op `forecast:index`, terwijl de regel is: nooit inkorten | `databron-opslag` |
| Gaspeil | de 3-dagenconstante staat vier keer los in de code | `databron-reken` |
| Gaspeil | robots.txt nauwelijks vastgelegd | `databron-verken` |
| Staat van | geen unit-tests | `databron-toets` |
| Staat van | de pilot doet zich voor als browser (Chrome-UA) | `databron-verken`, `databron-review` |
| averageperson.eu | README beschrijft de eerste fase; de echte stand staat in een worktree | `databron-leer` |
| Stikstofcijfers | geen ophaalscripts: verversen is niet herhaalbaar | `databron-oogst` |
| Stikstofcijfers | vaste getallen in de artikelen | `databron-duid` |
| Open Data Index | `docs/LEERPUNTEN.md` wordt in elke sessie helemaal ingeladen | `databron-leer` (§13) |

### De denkwijze, in tien regels

1. **Eén vraag, één antwoordzin** die uit de cijfers volgt.
2. **De bron is de baas.** Eerst echt aanroepen en de structuur lezen, dan bouwen. Elke eigenaardigheid met datum
   opschrijven.
3. **Niets verzinnen.** Ontbrekend is leeg, nooit 0. Een model maakt geen getal.
4. **Historie is de waarde.** Append-only, versies, nooit inkorten.
5. **Eén rekenregel, overal.**
6. **Een poort vóór publicatie.** Faalt de controle, dan blijft de laatste goede stand staan.
7. **Tekst uit cijfers, met regels.**
8. **Eén grafiek per bevinding.** De kop is de bevinding.
9. **Herkomst bij elk getal**, op de pagina én in de data.
10. **Kennis groeit mee.**

---

## 3. Wat we van Compound Engineering leren

**Wat het is.** Een plugin van Every met 30 skills in de lus brainstorm → plan → work → simplify → review → compound.
"Each unit of engineering work should make subsequent units easier, not harder." De stap *compound* schrijft na elke
klus één les naar `docs/solutions/<categorie>/<slug>.md` met frontmatter. Bij de volgende planning zoekt een agent daar
eerst in.

**Overnemen:**
- één les per bestand, gezocht vóór het werk;
- vaste secties (vooral "Wat niet werkte" en "Hoe je het voorkomt");
- **grounding** (bij ons: de aanroep uit de les opnieuw uitvoeren);
- refresh met houden, bijwerken, samenvoegen, vervangen of verouderd;
- een vindbaarheidscheck;
- reviewers met vaste ankers en een verplicht citaat;
- subagents die naar een bestand schrijven en een pad teruggeven;
- harde poorten tussen stappen;
- schrijfregels: uitkomst eerst, geen "wees grondig", aantallen naast de handeling.

**Niet overnemen:**
- de PR-, worktree- en release-machinerie;
- tien platforms en een converter;
- test-first als enig bewijs (bij grafieken is een schermafbeelding op 390 px het bewijs);
- skills van 800 regels (wij beginnen met 60 tot 150);
- volle autopilot: bij data hoort soms een beslispunt voor de eigenaar.

---

## 4. De naam: Databron

- **Wat eruit komt, is letterlijk een goede databron.** De skillset maakt van losse API's een dataset die klopt, ververst
  en herkomst heeft.
- **Samen met de Index**: *Vind het in de Index, bouw het met Databron.* De twee versterken elkaar: elk project dat met
  Databron gebouwd wordt, meldt lessen terug aan de Index.
- **Het groeiende zit in het beeld**: een bron wordt gevoed door grondwater, regen die jaren in de bodem zakte. Wat het
  ene project leert, zakt in de Index; het volgende pompt het weer op.
- **databron.nl** wordt de thuisbasis: wat het is, hoe je begint, en welke projecten ermee gebouwd zijn. Later kan het
  collectief daar ook komen.
- **In het Engels**: *Databron, the Open Data Index build kit.*
- **Commando's**: `/databron` stuurt de lus aan; de skills heten `databron-<stap>`.
- **Kanttekening**: een gewoon woord is als merk lastig te beschermen; het domein liefst voor zo'n €400.

---

## 5. De lus

```
              ┌───────────────────────── Open Data Index (MCP) ─────────────────────────┐
              │   geef_bron · geef_project · zoek_datasets · geef_lessen · meld_les       │
              └──────▲──────────────────────────────────────────────────────────┬───────┘
                     │ leest vooraf                                             │ meldt na afloop
                     │                                                          │
 databron-start ─► databron-vraag ─► databron-verken ─► databron-oogst ─► databron-opslag
                                                                                 │
                                                                                 ▼
 databron-ververs ◄─ databron-site ◄─ databron-beeld ◄─ databron-duid ◄─ databron-reken ◄─ databron-toets
        │                                                                          (poort)
        └──────► databron-review (bij elke poort) ──► databron-leer ──► docs/lessen + meld_les
```

- **`/databron`** is de dirigent. Hij leest `vraag.md` en `STAND.md`, ziet welke stap open staat, roept die skill aan
  en gaat pas verder als de poort groen is. Elke skill kan ook los.
- Elke stap schrijft een vast artefact (bestand) dat de volgende leest.
- `STAND.md` houdt in gewone taal bij waar het project staat: wat er is, wat er nog moet, welke beslispunten openstaan.
  Zo kan iemand na een week verder, of een andere agent.

---

## 6. De skills

Per skill: doel, wat hij leest en schrijft, de stappen, de poort ("klaar als") en de herkomst. Omvang eerst 60 tot
150 regels in `SKILL.md`; de rest in `references/`, `templates/` en `scripts/`.

### 6.1 `databron-start`: beginnen en begeleiden
- **Doel**: van niets naar een werkende, gekoppelde repo met een eerste deploy, zonder dat de gebruiker hoeft te weten
  hoe dat moet. Zie §10.
- **Stappen**:
  1. gereedschap nakijken (node, pnpm, gh, vercel of wrangler);
  2. inloggen: de gebruiker draait de interactieve logins zelf, met `! gh auth login`;
  3. een repo maken uit de sjabloon-repo;
  4. hosting kiezen en koppelen (§9);
  5. database aanmaken als de trede dat vraagt;
  6. geheimen zetten zonder ze in de chat te zien;
  7. eerste deploy en controle van de live-URL.
- **Uitlegstand**: `uitleg:veel` voor wie nooit een terminal gebruikte, `uitleg:weinig` voor ontwikkelaars.
- **Poort**: de live-URL toont de startpagina, de eerste Action is groen en `STAND.md` bestaat.

### 6.2 `databron-vraag`: de vraag en de belofte
- **Schrijft**: `vraag.md` met:
  - de kernvraag en de antwoordzin met lege plekken;
  - het publiek;
  - het projecttype (§7);
  - de **claimladder** (wat we wel, met kanttekening, of nooit zeggen);
  - de **these** en wat ons ongelijk zou geven;
  - wat we bewust niet doen.
- **Leest**: `lijst_projecten` en `zoek_bron` via de MCP-server.
- **Poort**: de antwoordzin is met echte cijfers in te vullen.
- **Herkomst**: Gaspeil, Stikstofcijfers, Staat van (de zes vragen per pagina).

### 6.3 `databron-verken`: een bron verkennen
- **Leest eerst** `geef_bron(<id>)` en `geef_lessen(<id>)` uit Open Data Index.
- **Stappen**:
  1. robots.txt en voorwaarden lezen, ook voor API-paden, en de afweging opschrijven. Eerlijke user-agent met contact;
     403 en robots respecteren.
  2. één proefaanroep **zonder filters**, om de echte dimensies en codes te lezen.
  3. elk filter testen: wordt het echt toegepast?
  4. nullen, opvulling, revisies, publicatiedag en vertraging vaststellen.
  5. licentie, bronvermelding en wat níet mag.
- **Schrijft**: `bronnen/<id>.md` (datacontract) en een regel in `bronnen.yaml` (register met rol, ritme, vertraging,
  licentie en robots-afweging).
- **Poort**: elke bron heeft een geteste aanroep met datum, een licentie en een robots-afweging.

### 6.4 `databron-oogst`: ophalen
- **Sjablonen per platform**: OData, JSON-stat, SDMX, ArcGIS REST, WFS/OGC API, CKAN, Socrata, STAC (uit `lib/oogst/` van
  Open Data Index en `scripts/eurostat.mjs` van averageperson.eu).
- **Opbouw**:
  - per bron `oogst/<bron>.ts` (IO, paginering, time-outs, retry met `Retry-After`) en `oogst/<bron>-parse.ts`
    (puur), met tests;
  - ruwe antwoorden bewaren met de hash van de aanvraag (cache en replay);
  - `veilig(label, fouten, fn)`: één kapotte bron stopt de rest niet;
  - **de waakhond met de laatste goede stand**;
  - een gezondheidsrecord per bron.
- **Draait overal**: als script, in een GitHub Action of in een cron-route (§9).
- **Poort**: twee keer draaien geeft hetzelfde resultaat; een gesimuleerde storing laat de laatste goede stand staan.

### 6.5 `databron-opslag`: bewaren zonder weg te gooien
- Kiest de vorm bij de trede en het type (§8 en §10).
- **Vaste regels**:
  - nooit inkorten;
  - strikt lezen vóór een merge;
  - alleen echt gewijzigde rijen schrijven;
  - elke run gelogd;
  - een manifest met sha256 per publicatie;
  - een back-up met een getest herstelscript;
  - migraties in git.
- **Poort**: herstel uit de back-up in een lege database geeft dezelfde cijfers op de site.

### 6.6 `databron-toets`: de poort vóór publicatie
- **Controles**:
  - **dekking**;
  - **grenzen**;
  - **sommen** tussen niveaus;
  - **consistentie**;
  - **versheid**;
  - **drift** tegenover de vorige versie (> 25% waarschuwing, > 60% fout);
  - **verhaaltests**;
  - een **null-test** (geen 0 waar de bron leeg was).
- **Schrijft**: `toets/rapport.md`.
- **Poort**: exit 0. Bij exit 1 publiceert niets.

### 6.7 `databron-reken`: afgeleide cijfers
- **Eén afleidfunctie** voor toets en export, en één rekenregel voor pagina, deelbeeld, mail en API.
- **Regels**:
  - een revisievenster;
  - per 1.000 alleen boven een drempel;
  - een basisperiode zonder crisisjaren;
  - een onzekerheid bij prognoses, met backtest;
  - eerlijk vergelijken: vergelijkbare entiteiten zonder de uitkomstvariabele, en een placebotoets;
  - omrekenfactoren op één plek met bron.
- **Poort**: elke functie heeft een test met een getal dat met de hand tegen de bron is gecontroleerd.

### 6.8 `databron-duid`: tekst uit cijfers
1. **Resolver**: welke uitsnede leverde dit cijfer?
2. **Sjablonen** (`Feit` met toon, getal en zin), met ICU-berichten bij meer talen.
3. **De cijferregels**:
   - onderwerp vooraan;
   - eenheid en peilperiode;
   - procentpunten bij percentages;
   - "9,6 keer zo veel" bij grote groei;
   - nooit "nu" of "deze maand", altijd de datamaand;
   - voorlopige cijfers benoemen;
   - mediaan is doorsnee, gemiddelde is gemiddeld;
   - de voorleestest.
4. **Redactie met een geldigheidsvenster** (`van`/`tot`).
5. **Een model alleen met bewijsplicht**: F-nummers, en elk getal in de tekst wordt nagerekend. Een model maakt nooit
   een getal.
- **Poort**: een test over álle entiteiten vindt geen "NaN", "undefined", lege plekken, verkeerde meervouden of
  getallen zonder eenheid.

### 6.9 `databron-beeld`: de grafiek
- **Kiest de vorm** bij de bevinding, wikkelt hem in een **Bevinding** (kop, onderregel, grafiek, bron) en kiest de
  kleurlogica.
- **Maakt dezelfde grafiek** voor de pagina, het deelbeeld en de download.
- **Het visitekaartje** is optioneel, één per project. Zie §12.
- **Volgt de smaak** in §11 en §12.
- **Poort**: schermafbeeldingen op 390 en 1280 px in licht en donker, zonder overloop, met een aria-label en een
  palet dat getest is op kleurenblindheid.

### 6.10 `databron-site`: publiceren
- **Checklist**:
  - server-first, gecontroleerd met `curl -s <url> | grep "<kernzin>"`;
  - een pagina per entiteit, met nette slugs en A-Z-indexen;
  - metadata met echte cijfers en een OG-beeld per pagina;
  - JSON-LD `Dataset`;
  - een sitemap uit de code;
  - een methode- en bronnenpagina met de exacte aanroepen;
  - `llms.txt` en Markdown per pagina;
  - een bytebudget per route;
  - een smoke-test na de deploy.
- **Poort**: de productiebuild draait, de curl-test vindt de kernzin en de smoke-test is groen.

### 6.11 `databron-ververs`: automatisch bijhouden
- **De keten**: oogst → toets → publiceer → cache legen → opwarmen → eventueel mail.
- **Ritme**: de cron is afgestemd op de publicatiedag van de bron.
- **Twee standen**: direct live als de toets groen is, of eerst een PR met het rapport.
- **Tijdbudget per run** ("de rest komt morgen").
- **Poort**: een run met een kapotte bron laat de vorige stand staan en meldt het.

### 6.12 `databron-review`: zes reviewers
Elke reviewer gebruikt vaste ankers (0/25/50/75/100). Een bevinding van 75 of meer moet de regel citeren, of de
schermafbeelding aanwijzen.

| Reviewer | Let op |
|---|---|
| **Bron** | robots, licentie, user-agent, geheimen niet in code of logs, bronvermelding |
| **Cijfer** | null tegen 0, procentpunten, peilperiode, voorlopig, sommen, revisievenster |
| **Grafiek** | vorm past bij de bevinding, kleurlogica, directe labels, kleurenblind, 390 px |
| **Taal** | voorleestest, geen jargon, geen "nu", meervouden, Engels zonder Nederlandse resten |
| **Smaak** | de lijst in §11: niets uit "Niet doen", met schermafbeeldingen als bewijs |
| **Site** | server-HTML, payload, OG, sitemap, geheimen, draait op het gekozen platform |

### 6.13 `databron-leer`: de les vastleggen
Zie §13.

---

## 7. Vier projecttypen

| Type | Voorbeeld | Eenheid | Toets | Vormen | Pagina's |
|---|---|---|---|---|---|
| **Monitor** | Gaspeil | één reeks per dag of week, met een doel | versheid, revisievenster, waakhond | band met doel, jaarlijnen, kalender | één antwoordpagina + cijfers + methode |
| **Atlas** | Staat van | duizenden entiteiten × maten × tijd | sommen tussen niveaus, aantallen | stippenrij, rangorde, choropleet, kleine veelvouden | pagina per entiteit, A-Z, vergelijk |
| **Profiel** | averageperson.eu | combinaties van filters | dekking, consistentie, drift | balk van 100, piramide, reeks met EU-lijn | toestand in het pad, OG per URL |
| **Audit** | Stikstofcijfers | entiteit × vraag, met bewijs en oordeel | gewichten tellen op, elke rij een bron, verhaaltests | scorekaart, choropleet met lagen, perspectieven | ranglijst, entiteit, methode, correctie |

Het audit-type past opvallend goed bij Open Data Index zelf. Voorbeelden zijn "Hoe open is jouw gemeente?" (de /gemeenten-kaart is eigenlijk al een audit) of "Welke bron loopt het verst achter?".

---

## 8. De databaseindeling

Databron geeft elk project **dezelfde indeling**. Een agent of mens die één Databron-project kent, kent ze allemaal.
Het schema staat in Drizzle (TypeScript) en werkt op **Postgres (Neon)** en op **SQLite (Cloudflare D1)**.
Postgres-extra's zoals volledige tekst en trigrammen zitten in een losse, optionele laag.

### De kern: zes tabellen

| Tabel | Wat erin staat | Belangrijkste velden |
|---|---|---|
| `bron` | spiegel van `bronnen.yaml` | `id`, `naam`, `uitgever`, `licentie`, `robots_afweging`, `ritme`, `url` |
| `run` | elke oogst, ook als hij faalde | `id`, `bron_id`, `begon`, `klaar`, `status`, `nieuw`, `gewijzigd`, `fouten`, `ruw_pad` |
| `versie` | een publiceerbare stand (vintage) | `id`, `aangemaakt`, `status` (kandidaat · gepubliceerd · afgewezen), `rapport`, `checksum` |
| `entiteit` | waar de cijfers over gaan | `code` (de officiële code: `GM0363`, `NL`, `BU03630001`), `soort`, `naam`, `ouder`, `indeling` (jaargang) |
| `maat` | wat er gemeten wordt (het register) | `id`, `naam`, `eenheid`, `soort` (telling · mediaan · gemiddelde · aandeel · score), `hoger_is_beter`, `decimalen`, `bron_id`, `definitie`, `aanroep` |
| `waarneming` | de cijfers zelf, in lang formaat | `maat_id`, `entiteit`, `periode`, `dims`, `waarde`, `status` (voorlopig · definitief), `vlag`, `versie_id`, `run_id`, `ruw_ref` |

### De regels erachter

- **Een officiële code als sleutel**: CBS, NUTS of ISO. Geen eigen nummers. De hiërarchie volgt uit de code of uit
  `ouder`. Een herindeling is een nieuwe `indeling`, geen overschreven rij.
- **`periode` als tekst in ISO-vorm**: `2025`, `2025-Q3`, `2025-09`, `2025-09-14`. Dat sorteert goed en werkt in beide
  databases.
- **`dims` voor extra uitsplitsingen** (leeftijd, geslacht, categorie): jsonb in Postgres, json-tekst in SQLite, plus
  een `dims_sleutel` (vaste volgorde, gehasht) zodat de primaire sleutel werkt. Een nieuwe uitsplitsing vraagt geen
  migratie.
- **`waarde` mag leeg zijn, nooit stil 0.**
  - Een rij met `waarde = null` betekent "de bron noemt dit, maar zonder getal".
  - Geen rij betekent "de bron noemt dit niet".
  - Bronnen die nullen weglaten (CBS-politie) krijgen dat als regel in `maat`, zodat de leeslaag het kan aanvullen.
- **Nooit bijwerken, altijd een nieuwe versie.** Een revisie van de bron wordt een nieuwe rij met een nieuwe
  `versie_id`. De view `actueel` geeft per sleutel de waarde uit de laatste gepubliceerde versie.
- **Indexen op de twee leesvormen**:
  - `(maat_id, periode)` voor een kaart of ranglijst;
  - `(entiteit, maat_id)` voor een reeks.
- **Ruw naar objectopslag**, niet in de database: `ruw/<bron>/<datum>/<hash>.json.gz` in Vercel Blob of Cloudflare R2.
  `ruw_ref` wijst ernaar.
- **Migraties in git** (Drizzle Kit), uitgevoerd in CI vóór de deploy. Nooit `push` op productie.

### Aanvullingen per type

- **Monitor**: niets extra; `periode` op dagniveau, plus een tabel `doel` (waarde, geldig van/tot, bron).
- **Atlas**: `buren` (voor "in de omgeving") en optioneel `zoek` (Postgres, tsvector).
- **Profiel**: niets extra; de combinaties zitten in `dims`.
- **Audit**:
  - `criterium` (id, gewicht, uitleg);
  - `beoordeling` (entiteit, criterium, score, bewijs_url, gevonden_op, zekerheid, status);
  - `correctie` (wie meldde wat, met welk bewijs, en wat we deden).

### Trede 1 heeft geen database
In de eerste trede (§10) is dezelfde indeling er als bestanden:
- `data/maten.json`;
- `data/entiteiten.json`;
- `data/waarnemingen/<maat>.json`, met een checksum.

Groeit het project, dan zet `databron-opslag` die bestanden met één script in de database. De vorm blijft gelijk.

### Een keuze
Ik heb de tabelnamen in het Nederlands gezet, zoals in Open Data Index. Wil je de skillset ook buiten Nederland
aanbieden, dan zijn Engelse namen (`source`, `run`, `vintage`, `entity`, `measure`, `observation`) verstandiger. Zie de
beslispunten.

---

## 9. Draaien op Vercel of Cloudflare

### De standaard: Vercel + Neon
- Next.js draait daar zonder aanpassingen.
- Neon komt via de Marketplace met de env-variabelen erbij.
- Blob voor ruwe bestanden en crons in `vercel.ts`.
- Zo werken Open Data Index, Gaspeil en Staat van al.

### Het alternatief: Cloudflare
Voor wie:
- veel verkeer heeft tegen lage kosten;
- een grotendeels statische site heeft;
- of al bij Cloudflare zit.

Next.js draait daar via de OpenNext-adapter (`@opennextjs/cloudflare`). Voor de rest:
- database **D1** (SQLite) voor kleine projecten, of **Neon via Hyperdrive**;
- **R2** voor ruwe bestanden;
- **Cron Triggers** voor het verversen.

### Vergelijking

| | Vercel | Cloudflare |
|---|---|---|
| Next.js | eersteklas | via OpenNext; ISR en caching werken anders, dus testen |
| Functies | Node, tot 300 s per aanroep | Workers: kortere CPU-limiet en 128 MB geheugen |
| Database | Neon (Marketplace) | D1 (SQLite) of Neon via Hyperdrive |
| Ruwe bestanden | Blob | R2 (geen kosten voor uitgaand verkeer) |
| Verversen | crons in `vercel.ts` | Cron Triggers, Workflows voor lange ketens |
| Geheimen | `vercel env` | `wrangler secret` |

De limieten van beide platforms veranderen. `databron-start` leest de actuele documentatie voordat hij kiest.

### Regels die het project overdraagbaar houden
1. **De zware oogst draait in GitHub Actions, niet in een functie** (§10). Dan maken de tijd- en geheugenlimieten van
   het platform niet uit, en wisselen van platform raakt alleen de site.
2. **De site leest alleen.** Er wordt niet geoogst in een request.
3. **Alleen webstandaarden in sitecode**: `fetch`, `Request`, `Response`, Web Crypto. Geen `fs` tijdens het draaien.
4. **De database via Drizzle met de HTTP-driver van Neon.** Die werkt in Node én in Workers.
5. **Opslag achter een kleine interface** (`opslag.zet`, `opslag.haal`), met een adapter voor Blob en een voor R2.
6. **Configuratie alleen via env**, en `.env.example` noemt elke naam.
7. **Grote lijsten streamen**, nooit als één JSON-tekst in het geheugen (de DANS-les uit Open Data Index: "Invalid
   string length").

`databron-review` (reviewer Site) controleert deze regels. `databron-site` bouwt bij elk project ook eens voor het
andere platform, zodat een overstap nooit een verrassing is.

---

## 10. GitHub als motor, en mensen begeleiden

### Drie treden
Iemand begint klein en groeit door. Databron zegt bij elke trede wat erbij komt en waarom.

| Trede | Voor wie | Data | Ophalen | Site |
|---|---|---|---|---|
| **1. Bestanden** | eerste project, kleine dataset (tot een paar MB) | JSON/CSV in de repo; **git is de historie** | GitHub Action die ophaalt, toetst en commit | statisch, op Vercel of Cloudflare |
| **2. Database** | veel entiteiten, zoeken, revisies volgen | Neon of D1 met de indeling uit §8, ruw in Blob of R2 | Action schrijft naar de database | leest met cache, ververst na een run |
| **3. Live** | dagelijks of vaker, API of MCP voor anderen | idem, plus versies met een publicatiepoort | crons op het platform voor kleine stappen, Actions voor zware | API-routes, `llms.txt`, eventueel MCP |

**Trede 1 is bijzonder sterk.** Een Action die elke dag ophaalt en de wijziging commit, geeft gratis een volledige
geschiedenis. Elke commit is een versie, `git diff` laat zien wat de bron veranderde, en er is niets om te beheren.
Voor veel projecten is dat genoeg. Sommige blijven er hun hele leven.

### De vaste GitHub-opbouw
- **Een sjabloon-repo** `databron/start`: Next.js, Drizzle-schema (§8), oogstmap met een voorbeeldbron, de
  grafische engine, `AGENTS.md`, `vraag.md`, `STAND.md` en de workflows. Maken met
  `gh repo create <naam> --template databron/start`.
- **`main` is productie.** Elke andere branch krijgt een preview op Vercel of Cloudflare.
- **Workflows**:
  - `ci.yml`: typecheck, tests, toets en build, bij elke push;
  - `oogst.yml`: op schema en met de hand te starten (`workflow_dispatch`), met een `concurrency`-groep zodat twee
    oogsten elkaar niet raken;
  - `migreer.yml`: migraties vóór de deploy.
- **Geheimen op één plek beschreven.**
  - `.env.example` noemt de namen.
  - `databron-start` zet ze in GitHub (`gh secret set`) en in Vercel (`vercel env add`) of Cloudflare
    (`wrangler secret put`), via een invoerprompt en nooit via de chat.
  - Een controle vergelijkt alleen de namen (de lessen van Staat van: geheimen die uit de pas liepen).
- **Beveiliging aan**: secret scanning met push protection, en Dependabot voor updates.
- **Issue-sjablonen**: "Nieuwe bron toevoegen" en "Fout in een cijfer melden". Dat laatste is het correctiekanaal van
  Stikstofcijfers.

### Valkuilen die Databron vooraf afvangt
- Geplande workflows draaien in **UTC** en kunnen vertraagd starten. In openbare repo's schakelt GitHub ze uit na
  **60 dagen zonder activiteit**. De oogst-commit telt als activiteit; `databron-ververs` controleert het.
- Een Action mag standaard geen PR openen. Dat moet in de repo-instellingen aan (de les van averageperson.eu).
- De eigen bot-bescherming van de host kan de eigen Action blokkeren (Staat van: een 429). Gebruik een bypass-token.
- Een Action die commit, start geen nieuwe workflows (met `GITHUB_TOKEN`). De deploy loopt dan via de koppeling met
  Vercel of Cloudflare, niet via een tweede workflow.

### Hoe `databron-start` begeleidt
- **Eén stap tegelijk, in gewone taal.** Elke stap zegt wat er gebeurt, waarom, en wat je daarna hebt.
  Bijvoorbeeld: "Nu maken we de database. Daarna kan je site cijfers bewaren die niet verdwijnen als je iets aanpast."
- **De gebruiker doet de inlogstappen zelf**, met `! gh auth login`, `! vercel login` of `! wrangler login`. Databron
  ziet nooit een wachtwoord of sleutel in de chat. Sleutels gaan via een invoerprompt rechtstreeks naar de juiste plek.
- **Elke stap wordt gecontroleerd voordat de volgende begint**: is de repo er, staat de Action op groen, antwoordt de
  live-URL?
- **`STAND.md` vertelt na elke sessie waar je bent**: wat werkt, wat de volgende stap is, welke beslissing nog bij jou
  ligt.
- **Twee standen**: `uitleg:veel` (begrippen worden uitgelegd, één keuze tegelijk, steeds een aanbevolen optie) en
  `uitleg:weinig` (alleen de commando's en de poorten).
- **Fouten in gewone taal**: wat er misging, wat het betekent, en wat je nu doet. Geen kale stacktrace.

---

## 11. De smaak: interface

Databron heeft een mening, en die staat op papier. De regels komen uit jouw feedback in vijf projecten, met de datum en
het project erbij, zodat ze uitlegbaar blijven. Ze staan in `databron-beeld/references/smaak.md` en worden door de
reviewer Smaak gecontroleerd met schermafbeeldingen. Nieuwe feedback wordt een nieuwe regel (§13, ring 3).

### Doen
- **Licht thema als standaard**: papier en inkt. Donker als keuze, nooit als enige; "te donker, te negatief" was de
  les bij Staat van.
- **Eén grotesk voor koppen en interface**, hooguit één tweede letter voor inleidende tekst. Mono alleen in code.
  Tabulaire cijfers alleen als de letter ze goed doet; bij Schibsted werden punten dan te breed.
- **Eén accentkleur, voor wat leeft**: nu, live, groei. Verder is kleur alleen betekenis.
- **Structuur met witruimte en zachte vlakken.** Haarlijnen alleen in tabellen en lijsten. Geen dikke lijnen.
- **Echte logo's van uitgevers** waar dat mag, een monogram waar niet (NS, TenneT).
- **Eén iconenset** (Phosphor duotone).
- **Herkomst zichtbaar**: bron en peildatum onder elk blok, met een link naar de exacte aanroep.
- **Zinnen in plaats van labels.** Een knop zegt wat er gebeurt ("Kopieer de prompt"). Een lege staat nodigt uit tot
  een handeling.
- **Mobiel eerst** (390 px): geen zijwaartse overloop, tabellen scrollen in hun eigen vak, onder 900 px een menu.
- **Eén beweegmoment per pagina**, gekoppeld aan echte data of aan wat iemand doet. Bij reduced motion is alles meteen
  klaar.
- **Eén visitekaartje per project** dat het onderwerp draagt: het polderdiorama, de puls-kaart, de parametrische
  figuur, de mockups op /bouwen.
- **Eerst richtingen tonen, dan bouwen**: twee of drie varianten naast elkaar, gerenderd en klein bekeken, voordat er
  één wordt uitgewerkt. Dat werkte bij het logo en bij /bouwen.

### Niet doen
- kickers in hoofdletters boven elke kop;
- gekleurde accentranden links aan kaarten;
- alles in kaartjes met dezelfde schaduw;
- pillenwolken, carrousels die vanzelf bewegen, gradient-vlekken, oranje heatmap-blobs;
- gedachtestreepjes en middenpuntjes in metadata, "→" achter elke link;
- kantelende of bewegende beelden in de paginakop;
- dashboardtaal ("Dashboard", "Insights", "Live" bij data die een dag achterloopt);
- beelden die de inhoud niet dragen (de isometrische plaat en de gebogen wand werden weggehaald);
- een standaard-template-look die je op elke AI-site ziet. De skill `frontend-design` noemt die valkuilen; Databron
  verwijst ernaar.

---

## 12. De grafische engine en zijn smaak

### Wat er nu is
Elk project heeft een eigen variant:

| Project | Grafieken |
|---|---|
| Open Data Index | `lib/grafieken.js` (d3, in de browser) |
| Staat van | `components/viz/*` |
| Gaspeil | `FillChart.tsx` (stapte af van Recharts) |
| averageperson.eu | `lib/stats.ts` + SVG |
| Stikstofcijfers | `EuropeMap.tsx` |

De ontwerpregels zijn dezelfde, de code niet. Voorstel: **één engine in drie lagen**.

### Laag 1: vorm (puur, zonder DOM)
Functies van data naar een scène:
- schalen en nette assen (`mooiMax`);
- klassegrenzen;
- directe labels met botsingscontrole;
- beeswarm-indeling;
- kleurtoewijzing per logica.

Uitvoer: vormen en teksten met coördinaten. Te testen in Node.

### Laag 2: renderers
- **React SVG op de server** (standaard): crawlbaar, geen JavaScript nodig, klein in de payload.
- **OG (Satori)**: dezelfde scène zonder filters.
- **Canvas**: alleen bij massa (meer dan ~5.000 punten) of beweging.
- **Export**: SVG en PNG met kop, jaar, bron en bron-URL in de metadata.

### Laag 3: interactie
- één tooltiplaag (`data-tip`), met de tekst ook in de HTML;
- een hoverlijn met alle waarden op dat moment;
- bediening met het toetsenbord;
- reduced motion;
- op mobiel horizontaal scrollen, openend bij vandaag.

### Vormen in de eerste versie

| Vorm | Basis |
|---|---|
| Bevinding (omhulsel) | Staat van |
| Band met doel | Gaspeil `FillChart` |
| Jaarlijnen | Staat van |
| Reeks met vergelijkingslijn (NL tegen EU) | Open Data Index |
| Jaarstaven | Open Data Index |
| Rangorde | Staat van, Open Data Index |
| Stippenrij | Staat van |
| Kleine veelvouden | Staat van |
| Choropleet (NL-gebieden, EU27) | Open Data Index, Stikstofcijfers |
| Aandeel (balk van 100) | averageperson.eu, Open Data Index |
| Spreiding met r | Open Data Index |
| Kalender | Open Data Index |
| Scorekaart | Stikstofcijfers |

### Tokens (contract per project)
`--papier`, `--inkt`, `--inkt-2`, `--context`, `--onderwerp`, `--goed`, `--slecht`, `--geen-data`,
`--hoeveelheid-1…5` en `--categorie-1…5`. Het palet wordt getest op kleurenblindheid.

### De smaak van de grafieken

**Doen**
- **De kop is de bevinding**, als zin. De onderregel geeft eenheid en peilperiode. Daaronder één grafiek en de bron.
- **Labels aan de lijn**, geen legenda als het kan.
- **Grijs voor context, één kleur voor het onderwerp.** Markeer wat de lezer zoekt: het lopende jaar, de eigen
  gemeente, Nederland.
- **Een bandbreedte in plaats van tien lijnen**, kleine veelvouden in plaats van één drukke grafiek.
- **Weinig rasterlijnen, ronde asgetallen.** Staven beginnen bij 0; een lijn hoeft dat niet.
- **Kleurlogica nooit mengen**: oordeel (goed/slecht), hoeveelheid (één reeks), geen data (grijs). Rood alleen voor
  het slechtste oordeel.
- **Richting ook als teken** (▲ ▼), nooit alleen in kleur.
- **Nederlandse getalnotatie** (1.234,5), en één notatie voor procenten per project.
- **Beweging alleen met echte data**: de puls-kaart speelt echte registraties af en de teller eindigt op het echte
  totaal.

**Niet doen**
- taartdiagrammen met meer dan drie delen;
- 3D-grafieken;
- een tweede y-as;
- regenboogpaletten;
- de standaardlook van een grafiekbibliotheek (Recharts, Chart.js);
- animaties die niets betekenen;
- een getal zonder eenheid of jaar.

**Gereedschap, met een mening**
- **SVG op de server** voor alles wat een grafiek is.
- **d3 alleen om te rekenen** (schalen, geo, beeswarm), niet om te tekenen.
- **Kaarten met MapLibre** en een ondergrond zonder sleutel: PDOK BRT-grijs of OpenFreeMap. CARTO vraagt sinds 2026 een
  sleutel.
- **Canvas** pas bij duizenden punten; **three.js** alleen voor spel of het visitekaartje. Voor dat laatste verwijst de
  skill naar `anatomy`.

### Pakket of sjablonen
Mijn advies: begin met sjablonen die de skill in een project kopieert. Pas als drie projecten dezelfde versie gebruiken,
wordt het een npm-pakket.

---

## 13. De kennislaag: drie ringen

### Ring 1: het project
- `docs/lessen/<categorie>/<slug>.md`: één les per bestand. `AGENTS.md` wijst ernaar.
- Frontmatter:

```yaml
titel: Feed-endpoint past alleen het eerste $filter-predicaat toe
bron: politie-overlast          # id in Open Data Index, of leeg
platform: odata-v3
soort: stil-filter              # robots | limiet | schemawijziging | codering | trendbreuk | fout-met-200
                                # | stil-filter | revisie | licentie | rekenen | tekst | grafiek | smaak | hosting | github
herkomst: gemeten               # gemeten | beschrijving | platform | redactie
gemeten_op: 2026-10-16
aanroep: "https://dataderden.cbs.nl/ODataFeed/OData/47024NED/TypedDataSet?$filter=…"
status: geldig                  # geldig | verouderd
```

- Secties: **Wat we zagen**, **Wat niet werkte**, **Wat werkt**, **Hoe je het voorkomt**, **Bewijs**.
- **Grounding**: voordat een les met `herkomst: gemeten` wordt opgeslagen, voert `databron-leer` de aanroep opnieuw
  uit. Lukt dat niet, dan wordt de herkomst `redactie`, met de oorspronkelijke datum.
- **Open Data Index gaat ook zo werken**: `docs/LEERPUNTEN.md` wordt een korte index en de lessen per bron worden
  losse bestanden. CLAUDE.md laadt dan alleen de index.

### Ring 2: het platform (Open Data Index)
- Twee nieuwe MCP-functies:
  - **`geef_lessen(bron)`**: de geldige lessen over een bron;
  - **`meld_les({…})`**: komt in een wachtrij in Neon (`les_melding`). Na jouw goedkeuring gaat de les naar de
    bron-YAML of de API-kennis.
- `databron-verken` leest altijd eerst `geef_bron` en `geef_lessen`. Wat Gaspeil bij GIE leerde, staat zo klaar voor de
  volgende, ook als dat een buitenstaander is.
- De bouwprojecten op /bouwen worden **Databron-starters**: de prompt start de lus, de MCP-server levert de kennis.

### Ring 3: de skill
- Een les die voor álle bronnen geldt, wordt een regel in de skill zelf. Voorbeelden:
  - Node `fetch` stuurt `Accept-Language: *`;
  - de ECB blokkeert de standaard-user-agent van curl en requests;
  - `$` moet je in curl escapen.
- Hetzelfde voor smaak en hosting. Jouw feedback ("geen kickers in hoofdletters", 2026) wordt een regel in `smaak.md`,
  met datum en project.
- **`databron-leer --ververs`** loopt maandelijks de lessen langs. Per les volgt één van vijf uitkomsten: houden,
  bijwerken, samenvoegen, vervangen of verouderd. Niets wordt stil gewist.

---

## 14. Hoe een Databron-project eruitziet

```
vraag.md                    # kernvraag, antwoordzin, publiek, type, claimladder, these
STAND.md                    # waar het project staat, in gewone taal
bronnen.yaml                # register: id, rol, ritme, vertraging, licentie, robots-afweging
bronnen/<id>.md             # datacontract per bron
oogst/<bron>.ts             # IO
oogst/<bron>-parse.ts       # puur
tests/                      # parsers, rekenregels, verhaal, tekst over alle entiteiten
db/schema.ts                # de indeling uit §8 (trede 2 en 3)
db/migraties/
data/                       # trede 1: dezelfde indeling als bestanden, met checksum
lib/reken.ts                # één afleidfunctie
lib/duid.ts                 # resolver, Feit, sjablonen
lib/opslag.ts               # zet/haal, met adapter voor Blob of R2
components/beeld/           # uit de engine
toets/rapport.md            # laatste validatierapport
docs/lessen/                # ring 1
.github/workflows/          # ci, oogst, migreer
.github/ISSUE_TEMPLATE/     # nieuwe bron, fout in een cijfer
.env.example                # alle namen van geheimen, geen waarden
AGENTS.md                   # regels, verwijzing naar docs/lessen en de smaak
```

---

## 15. Verpakking

- **Eén repo** `databron` als Claude Code-plugin: `.claude-plugin/plugin.json` en `skills/databron-*/SKILL.md`, met
  `references/` (smaak, cijferregels, valkuilen, vormen), `templates/` en `scripts/`.
- **Een tweede repo** `databron/start` als GitHub-sjabloon (§10).
- **Scripts**:
  - `databron nieuw`;
  - `databron bron <platform> <id>`;
  - `databron toets`;
  - `databron les`;
  - `databron geheimen` (namen vergelijken tussen `.env.example`, GitHub en de host).
- **Tests op de skills zelf**: verwijzingen bestaan, de frontmatter klopt, kopieën zijn gelijk.
- **databron.nl** legt uit wat het is, hoe je begint (één commando om de plugin te installeren) en welke projecten
  ermee gebouwd zijn.

---

## 16. Fasering

| Fase | Wat | Proef (klaar als) |
|---|---|---|
| **1. Fundament** | plugin-repo, `/databron`, `databron-start`, `-vraag`, `-verken`, `-leer`; sjabloon-repo op trede 1; `geef_lessen` in de MCP-server | Iemand zonder ervaring komt met `uitleg:veel` van niets tot een live site op trede 1, met een Action die dagelijks ophaalt en commit |
| **2. Data** | `-oogst` (sjablonen voor OData, JSON-stat, ArcGIS/WFS, CKAN), `-opslag` met het schema uit §8, `-toets`, `-reken`; trede 2 | Een oogst draait twee keer idempotent; een gesimuleerde storing laat de laatste goede stand staan; het rapport vangt een null die 0 werd |
| **3. Beeld en smaak** | de engine (laag 1 en 2), acht vormen, tokens, OG en export; `smaak.md` met alle regels uit §11 en §12 | Dezelfde grafiek op de pagina, in het OG-beeld en als PNG, met identieke getallen; de reviewer Smaak vindt in een bewust foute versie de geplante fouten |
| **4. Tekst en site** | `-duid`, `-site`, `-review`; dezelfde site ook op Cloudflare | De eigenschapstest over alle entiteiten is schoon; de curl-test vindt de kernzin; de build draait op beide platforms |
| **5. Verversen en kennis terug** | `-ververs`, trede 3; `meld_les` met wachtrij; LEERPUNTEN.md opgesplitst | Een refresh draait zonder hulp; een les komt na jouw goedkeuring in de bron-YAML en is via `geef_lessen` te lezen |
| **6. Echt project** | één nieuw project helemaal met Databron, bijvoorbeeld een audit "Hoe open is jouw gemeente?" | Live, met de lessen van de bouw in de Index |

Mijn advies blijft: bouw fase 1 en probeer hem meteen op een echt project.

---

## 17. Beslispunten voor jou

1. **databron.nl kopen** (liefst rond de €400), nu de naam Databron is?
2. **Openbaar**: blijven de plugin en het sjabloon privé, of worden ze open via databron.nl en /bouwen?
3. **Tabelnamen**: Nederlands (zoals Open Data Index) of Engels (beter voor gebruik buiten Nederland)?
4. **Standaard hosting**: Vercel als standaard met Cloudflare als alternatief (mijn advies), of beide gelijk?
5. **De engine**: eerst sjablonen (mijn advies) of meteen een npm-pakket?
6. **Lessen van buiten**: mag iedereen via `meld_les` een les insturen, met jouw goedkeuring?
7. **Model in de duiding**: alleen met bewijsplicht in een besloten stand, of ook op publieke pagina's als de
   getalcontrole slaagt?
8. **LEERPUNTEN.md opsplitsen**: mag dat al in fase 1?
9. **Doelgroep van `databron-start`**: ook mensen die nog nooit een terminal gebruikten (dan wordt `uitleg:veel`
   belangrijk), of vooral ontwikkelaars?
10. **Eerste echte project**: een audit van gemeenten, een van de bouwprojecten, of iets nieuws?
