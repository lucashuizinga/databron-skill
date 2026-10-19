# Onderzoek: stikstofcijfers.nl als voorbeeld voor een skillset "een goede dataset bouwen"

Project: `stikstofindex` (alleen gelezen; geen server gestart, geen .env geopend). Stand: 23 commits, 26 aug tot 2 sep 2026, gebouwd met Claude (Co-Authored-By in elke commit).

## 1. Wat het is

- **Stikstofcijfers** (eerst "stikstofindex.nl", hernoemd in commit `bdee76e`), live op **https://stikstofcijfers.nl** (canonical, OG-tags en sitemap wijzen daarheen; Engels onder `/en/`).
- **Kernvraag** (hero, `src/i18n/nl.ts`): "Hoe goed rapporteren landen hun stikstofcijfers?" Het is geen ranglijst van stikstofdruk maar van **datavisibiliteit**: hoe vers, fijnmazig, open en navolgbaar publiceert elk EU27-land zijn depositiedata. Graad A+ tot F; geen vindbaar landelijk product = automatisch E zonder puntenscore.
- **Voor wie**: Nederlands publiek dat zich schaamt voor "het stikstofprobleem", journalisten, beleidsmakers, onderzoekers. Het verhaal (uit `marketing_verbeterplan.md`): "Nederland heeft geen groter stikstofprobleem dan de buren; het heeft een scherpere meetlat, en wat je scherp meet, zie je ook", met altijd de eerlijke kanttekening (per hectare op Malta na de hoogste druk).
- Vier onderdelen (README): **Index** (ranglijst + uitklapbaar bewijs per land), **Kaart** (zes lagen), **Duiding** (14 artikelen), **Methode** (scoreopbouw).

## 2. Databronnen

Twee soorten data, en dat onderscheid is de kern van het ontwerp.

**a. Handmatige audit van nationale depositieproducten (het eigen product).** Per land is met de hand (door een agent, 24 aug 2026) gezocht naar een openbaar, actueel, landelijk totaal-N-depositieproduct. Vastgelegd in `eu_nitrogen_data_audit_and_build_plan.xlsx`, tabblad *EU27 Audit* (27 velden per land) en *Source Log* (14 bronnen met organisatie, URL, wat er gevonden is, datum, zekerheid). Uitkomst in vijf productklassen:
- actueel landelijk raster: NL (RIVM GDN 2025, 1×1 km), DK (DCE NOVANA 2024, ~6 km), SE (Krondroppsnätet, hydrologisch jaar 2024/25);
- actuele nationale data/rapport: CZ (CHMI-tabellen), PL (GIOS, alleen natte depositie), SK (SHMU, 4 stations);
- regionaal of modelservice: BE (alleen Vlaanderen, VLOPS25, 2023-emissies met 2017-weer), FI (FMI Hilatar NetCDF);
- ouder landelijk raster: DE (UBA, gemiddelde 2013 tot 2019);
- "EEA fallback, nog te verifiëren": de overige 18.

Geen enkele van deze bronnen wordt automatisch opgehaald; per land staat één `sourceUrl` plus beoordeling. Frequentie van herbeoordeling: niet geautomatiseerd; het plan noemt een maandelijkse versheidsscan en jaarlijkse EEA-verversing (fase 10), maar dat is niet gebouwd.

**b. Geharmoniseerde Europese context (rekencijfers).** Eenmalig opgehaald en als TypeScript-constanten in de code gezet, met bron en jaar in de kopcommentaar:
- `src/data/emissies.ts`: NH₃ en NOₓ nationaal totaal 2023 (Eurostat `env_air_emis`, NFR_TOT_NAT), bevolking 2025 (`demo_pjan`), landoppervlak (`reg_area3`, L0008), bbp 2025 (`nama_10_gdp`, B1GQ).
- `src/data/nec.ts`: reductiepercentages 2020 en 2030 uit NEC-richtlijn (EU) 2016/2284 bijlage II, "opgehaald via de CELLAR-API van het Publicatiebureau (CELEX 32016L2284)", plus compliance-totalen 2005 en 2023 (`NFR_TOT_NAT_C`).
- `src/data/landbouw.ts`: landbouwuitstoot (NFR3-sectoren) en bruto stikstofoverschot (`aei_pr_gnb`, BAL_UAA), **met het jaar per land** omdat dat verschilt (2012 tot 2023).

Er is geen ophaalscript in de repo (`scripts/` bevat alleen `sitemap.mjs`). De data is dus "eenmalig uitgezocht, als code vastgelegd, met tests bewaakt". Versheid staat in de UI als peildatum ("audit 24 augustus 2026", "uitstoot 2023", "proefscore v0.1").

Opvallend: het werkplan noemt EEA-emissies 2024 als basis, de site gebruikt Eurostat 2023 (het meest recente afrekenjaar dat er stond). Commits `e2cb070` en `2c147c4` verankerden daarna alle tijdsclaims aan "2023" ("zat in 2023 al onder het plafond" in plaats van "zit nu").

**Voorwaarden**: hergebruik CC BY 4.0 ("Stikstofcijfers 2026, proefscore v0.1"); het plan eist een licentieregister en link-only bij beperkte rasters (niet gebouwd; de site verspreidt geen rasters, alleen links).

## 3. Opslag

- **Geen database, geen API voor data.** Alles is statisch: `src/data/*.ts` (getypte records), gebundeld door Vite. De enige serverfunctie is `api/nieuwsbrief.js` (Vercel function, Resend-audience + meldmail, honeypot, 409 = al aangemeld).
- **Structuur van de auditdata** (`src/data/countries.ts`, type `CountryEvidence`): `iso2`, `numericId` (koppeling met world-atlas), `productClass`, `referencePeriod` (tekst, bv. "Hydrologisch jaar 2024/25") én `referenceYear` (getal, voor kleur en versheid), `geography`, `scope` (wat er precies gemeten is: totaal/nat/concentratie), `spatialDetail`, `frequency`, `method`, `access`, `attribution`, `confidence` (Hoog/Middel/Laag), `auditStatus` (Geverifieerd/Deels/Open), `finding` (één zin), `sourceName`, `sourceUrl`, optioneel `score` + `breakdown` (7 criteria), `rasterKort`, `detailNiveau`.
- **Bewijs per land** = één bron-URL + bevinding + metadatavelden + zekerheid + status. In het xlsx daarnaast per land een "Next verification action" en zoekgebied (*Verification Backlog*), die niet op de site staan.
- Het werkplan (`nitrogen_tool_working_plan.md` §12) ontwerpt een veel zwaarder model: tabellen source, dataset, release (met `reference_year`, `publication_date`, `meteorology_year` apart, checksum, `supersedes_release_id`), observation, metric compatibility, geography; PostGIS, COG, PMTiles, ruwe archieven. Daarvan is in de bouw alleen de **scheiding van referentiejaar en publicatiejaar** en de **bron per record** overgebleven. Les: het plan is maximaal, de site is de dunste verticale plak die het verhaal draagt.

## 4. Bewerking en beoordelingsmodel

**Scoremodel** (`src/data/countries.ts`, "proefscore v0.1"): zeven criteria, samen 100 punten: actualiteit 20 (meetjaar telt, niet publicatiejaar), updatefrequentie 15, dekking/detail 15, validatie 20, open data 15, historische reeksen 10, bronanalyse 5. Gegroepeerd in drie pijlers (35/30/35). Elk criterium heeft een uitlegtekst die als tooltip op de site staat.

**Graadschaal**: A+ ≥95, A ≥85, B ≥70, C ≥55, D ≥40, E ≥25, F <25, elk met label en kleur (`gradeScale`). `scoreToGrade(undefined)` geeft **E**: "zonder vindbaar openbaar landelijk totaalproduct krijgt een land automatisch een E. De E gaat over vindbaarheid; een puntenscore hoort er dan niet bij." F blijft gereserveerd voor beoordeelde producten die overal tekortschieten. Uitkomst: NL 97 (A+), DK 84, SE 77, CZ 69, PL 67, BE 62, FI 61, SK 56, DE 53; 18 landen E.

**Afgeleide cijfers** (allemaal pure functies met tests):
- elementair N: NH₃ × 14/17 + NOₓ × 14/46 ("nooit ruwe tonnen optellen", werkplan §10);
- per inwoner, per hectare, per 1000 euro bbp, landbouw-N per inwoner, landbouwaandeel;
- NEC-plafond 2030 per stof en gecombineerd (expliciet "afgeleide maat"), status klaar / bijna (≤15%) / ver, en "eerste horde 2020 gehaald";
- `meetjaarStatus`: vers als ≤2 jaar oud (2024+), anders oud of onbekend.

**Validatie** (`src/data/countries.test.ts`, `src/data/en/*.test.ts`, `src/i18n/routes.test.ts`, vitest):
- precies 27 landen, unieke codes; open landen hebben géén score; elke rij heeft bron, URL en bevinding;
- de gewichten tellen op tot 100, pijlers ook en dekken elk criterium één keer;
- graadgrenzen per waarde (100, 97, 95, 94 …);
- vastgepinde referentieperiodes (NL "2025", SE "Hydrologisch jaar 2024/25", DE "Gemiddelde 2013–2019");
- plausibiliteit (kg N per inwoner tussen 0 en 50, per ha < 100, landbouw ≤ totaal, 2020-verplichting ≤ 2030);
- **controle tegen de bron**: NEC-percentages voor NL/DE/IE/DK letterlijk uit de richtlijn; NL 8,4 kg/inw, 44,7 kg/ha;
- **verhaalbewaking**: "NL is als enige A+", "7 landen halen 2030 al", "Ierse landbouw-N per inwoner > 3× Nederlandse". Als de data verandert en het verhaal niet meer klopt, breekt de test.

**Regels tegen verzonnen data**, verspreid over plan en code:
- "Not located means not found in this audit, not proof that it does not exist" (xlsx *Executive Summary*, werkplan §2); op de site: "in deze eerste audit niet gevonden";
- geen score zonder product (test); lege waarden tonen `·`, nooit 0;
- natte depositie nooit als totaal (Polen-artikel, bevinding);
- een claimladder met **veilige en onveilige claims** (werkplan §4: "Only the Netherlands has recent nitrogen data" staat expliciet bij de te vermijden claims);
- "Wat we bewust niet doen" in `marketing_verbeterplan.md`: geen trotsclaim zonder kanttekening, geen maatregelen zonder primaire bron, geen export-stikstof zonder handelsmodel;
- correctiekanaal (`bronnen@stikstofcijfers.nl`) met de belofte dat de E zichtbaar vervalt bij een geldige bron.

**Van audit naar duiding**: elk artikel (`src/data/artikelen.ts`) is één bevinding uit de audit, uitvergroot: Duitsland (scherp maar oud), Polen (alleen nat), Denemarken/Zweden (niet uniek, niet vergelijkbaar), "zonder product een E" (methode), "export vertrekt, stikstof blijft" (per inwoner versus per hectare), Ierland, NOₓ-schoonmaak, drie ranglijsten, Natura 2000. Elk artikel heeft `bronnen[]` met URL's en verwijst naar de score ("Duitsland 15/15 op detail, 5/20 op actualiteit"). Een blokmodel (`kop`, `alinea`, `uitlicht`, `cijfers`, `feiten`) geeft langere stukken ritme. **Zwakke plek**: de getallen in artikelen zijn tekst, niet berekend. Interfacezinnen (NL-band, perspectiefduiding, tijdlijn) worden wél live uit de data gevuld (commit `88bb550`: "Koploperclaim, live berekend"; "een test bewaakt dat Nederland bovenaan staat").

## 5. Visualisatie

- **Engine**: geen grafiekbibliotheek. De kaart is **d3-geo** (`geoMercator().fitExtent`) + **topojson-client** + **world-atlas countries-110m**, getekend als eigen SVG in React (`src/components/EuropeMap.tsx`). Overzeese Franse polygonen worden weggeknipt (anders klopt de projectie niet); Malta krijgt een stip omdat het op 110m te klein is; labels alleen voor tien landen. Een `strak`-modus snijdt de viewBox op de contouren voor de hero.
- **Kaartlagen**: graad, meetjaar, productklasse, 2030-doel, kg N/ha, kg N/inwoner. Hover/focus geeft een readout-regel; selectie opent een paneel met meetjaar, soort data, detail, uitstoot, plafond, status en bronlink. Volledig toetsenbord- en aria-bediend.
- **Overige vormen**, allemaal in HTML/CSS: ranglijst met graadbadge en balk, scoreopbouw in zeven balkjes per land, graadverdeling, staafjes per meetjaar, mini-lijsten, cijferblokken in artikelen, tijdlijnband 2005-2016-2020-2030.
- **Twee kleurlogica's, bewust gescheiden** (`src/data/intensiteit.ts`): graadkleuren groen-goud-oranje-rood voor een **oordeel**, en één amberreeks (licht = laag, donker = hoog) voor **hoeveelheden**: "intensiteit is een hoeveelheid, geen oordeel". Waarschuwingen zijn geel zodat rood voor de E blijft (commit `b0c559f`). Neutraal grijs `#dcd8cb` voor "geen data".
- **Design-tokens** (`src/styles.css`, `:root`): papier `#faf9f6`, inkt `#16150f`, lijnen, groen, één font (**Archivo Variable** met tabelcijfers) en `--dataschaal: 1.2` waaraan alle tabelcelgroottes én kolombreedtes hangen. Het datafont is gekozen met een tijdelijke **fontvergelijker** in de site (vier fonts, schaalknoppen), daarna vastgezet en de vergelijker opgeruimd (`b0c559f`, `5375334`, `5fad7d5`). Geen donkere modus.
- **Wat het sterk maakt**: één beeldtaal (de graadkaart) die terugkomt in hero, kaart, OG-beeld en badges; elk getal met eenheid en jaar; de lezer kiest een **perspectief** (beste meetcijfers, per inwoner, per hectare, per euro, landbouw & export, afstand tot 2030), elk met oordeelregel ("lager is beter"), duiding, "Opvallend:"-contrast en bronregel; Nederland krijgt een kader en een zwevende voetbalk "NL staat op plek X" (IntersectionObserver). Begrippen (`src/data/begrippen.ts`, 20 termen) krijgen automatisch een gestippelde tooltip bij het eerste voorkomen per tekstblok.
- **Mobiel**: kolommen vallen af op prioriteit via breedteklassen xs-xl in JavaScript, één bron voor cellen én grid-template (commit `535fed5`, na een mislukte horizontale-scroll-aanpak), naam- en scorekolom altijd zichtbaar, getest op vijf breedtes. Tekstgrootte-knop (drie standen, localStorage). `.design-audit/` bevat geautomatiseerde lay-outrapporten op 390 en 1440 px (afgekapte tekst, te kleine tiktargets, tekst op de rand) van het prototype.
- **Illustraties**: per artikel een risograph-achtig beeld in huisstijl (`public/beeld/<slug>.jpg`, 1600 px), plus `og.png` 2400×1260 met graadkaart en badges. Hoe ze gemaakt zijn staat niet in de repo.

## 6. Website

- **Framework**: Vite 8 + React 19 + TypeScript, SPA. Eigen padrouter (`src/i18n/routes.ts`: `parseRoute`, `padVoor`), oude `#/`-links worden doorgestuurd. Vercel: `vercel.json` herschrijft `/en/*` naar `en.html`, de rest (behalve `/api`) naar `index.html`; `vite.config.ts` doet hetzelfde in dev en preview.
- **Paginastructuur**: `/` (hero, tijdlijn, ranglijst, NL-band, duidingteasers, nieuwsbrief), `/kaart`, `/duiding`, `/duiding/<slug>`, `/methode`, `/land/<iso>` (opent de rij in de ranglijst). Engels: `/en/map`, `/en/insights/<slug>`, `/en/methodology`, `/en/country/<iso>`.
- **Tweetaligheid**: Nederlands is de kern; Engels is een **laag**. Interfaceteksten in `src/i18n/nl.ts` en `en.ts` met hetzelfde type; landteksten en artikelen in `src/data/en/` die alleen woorden bevatten, nooit cijfers, URL's of sleutels; `src/data/inhoud.ts` is de enige ingang voor de app. Tests eisen dat elk artikel vertaald is in dezelfde volgorde en blokstructuur, dat bron-URL's gelijk zijn, Engelse decimaalpunten en geen em-dash. Decimaalteken per taal (`src/i18n/getal.ts`).
- **SEO/OG**: twee HTML-shells met eigen `lang`, description, OG en Twitter-tags; per route zet de app `document.title`, canonical en hreflang nl/en/x-default. `scripts/sitemap.mjs` leest slugs en landcodes uit de broncode en faalt als een Engelse slug ontbreekt (45 pagina's × 2 talen). `robots.txt` alles open. Zwakte: de SPA levert per route geen eigen server-HTML en geen eigen OG-beeld per artikel of land.
- **Meten en marketing**: GA4 met eigen events voor elke keuze (`src/analytics.ts`: perspectief, kaartlaag, dossier, bronklik, kolomtoggle, NL-voetbalk, nieuwsbrief, `verwezen_binnenkomst` bij utm). Kruisverwijzingen naar gaspeil.nl en Datavizier met UTM-tags. Het marketingplan formuleert het doel als "begrip, geloofwaardigheid en deelbaarheid", met testideeën voor later ("pas bij echt verkeer").

## 7. Werkwijze en kennis

**Volgorde van werk** (te reconstrueren uit bestanden en git):
1. **Onderzoek en these** (24 aug): audit van 27 landen in het xlsx, met als eerste conclusie dat de oorspronkelijke these ("alleen NL heeft recente data") niet klopt en scherper moet. De "stronger and more defensible conclusion" wordt de productpropositie.
2. **Werkplan** (`nitrogen_tool_working_plan.md`): claimladder, vier productmodi, metriekfamilies, eenheidsregels, vergelijkbaarheidsregels, datamodel, QA-lijsten, risico's met maatregelen, 221 persondagen. Het xlsx bevat hetzelfde als tabellen (*Data Dictionary*, *Product Spec* met acceptatiecriteria, *Build Plan*, *Risks and QA*, keuzelijsten).
3. **Prototype** met geautomatiseerde ontwerpaudit (`.design-audit/`, 24 aug).
4. **Eerste versie in één commit** (26 aug 10:12): data als TS + tests + site in één keer.
5. **Marketingverbeterplan** (25 aug): perspectiefknoppen, NL-band, 2030-tijdlijn, maatregelendossier, met "wat we bewust niet doen".
6. **Snelle iteraties op één dag** (26 aug): koppen herschrijven op begrijpelijkheid, naam en OG, oordeelregels, em-dash weg, meetjaar standaard, fontvergelijker, kolommen op prioriteit, padrouting en sitemap, artikelen met blokken, begrippen, nieuwsbrief, tijdsclaims verankeren.
7. **Engelse versie** (2 sep).

**Kennisdocumenten**: README (inclusief "inhoudelijke grens": wat de graad wel en niet zegt), werkplan, marketingplan, xlsx. Commitberichten zijn uitgebreid en leggen de reden vast. Er is géén leerpuntenbestand zoals `docs/LEERPUNTEN.md` in Open Data Index.

**Terugkerende valkuilen** (genoemd of zichtbaar gerepareerd):
- publicatiejaar ≠ meetjaar ≠ meteorologiejaar (Duitsland, Vlaanderen);
- natte ≠ totale depositie (Polen); oppervlak bos ≠ open veld (Zweden);
- NH₃ en NOₓ niet ruw optellen;
- "niet gevonden" ≠ "bestaat niet";
- tijdsgebonden zinnen ("nu", "inmiddels", "zeven jaar voor de deadline") die verouderen;
- noemers met een eigen jaar (bevolking 2025, uitstoot 2023, stikstofbalans per land anders);
- een te vrolijk trotsverhaal zonder kanttekening;
- kleurbetekenis: rood alleen voor het slechtste oordeel;
- tabellen die op mobiel afkappen;
- CSS-`transform` op een sectie breekt `position: fixed` van een tooltip (commit `cd5c9ae`).

## 8. Het patroon: wat is herbruikbaar als skill?

### Het "audit/index"-type dataset
Anders dan een tijdreeks (ophalen, opslaan, plotten) is dit een **beoordeling van bronnen**: de eenheid is een entiteit (land, gemeente, organisatie) × een vraag ("publiceert X Y?"), het product is een record met bewijs en een oordeel. De vaste onderdelen:
1. **Universum vastleggen**: alle entiteiten, ook zonder data (27 landen, test op aantal). Ontbrekend is een toestand, geen weglating.
2. **Zoekprotocol per entiteit**: wat zoek je precies (definitie: "openbaar, actueel, landelijk totaal-N-product"), waar (agentschap, meteo-instituut, EMEP, ICP Forests, nationale taal), wat leg je vast (bron-URL, datum, zekerheid, status, volgende actie).
3. **Classificatie** in een handvol productklassen plus vrije beschrijvende velden (scope, detail, frequentie, methode, toegang).
4. **Scoremodel** met gewichten die optellen tot 100, criteria met uitleg, pijlers, en een expliciete regel voor "geen bewijs" (hier: automatische E zonder score).
5. **Contextcijfers uit geharmoniseerde bronnen** die de score niet beïnvloeden maar het verhaal dragen (uitstoot per inwoner, per ha, doelafstand), met eigen jaar en bron.
6. **Perspectieven**: dezelfde entiteiten op verschillende maten gesorteerd, elk met een andere winnaar en een oordeelregel. "Sorteren wordt een verhaal kiezen."
7. **Correctiekanaal en versie** ("proefscore v0.1", "eerste editie", auditdatum).

### Algemene stappen (gelden ook voor tijdreeksen)
- **These eerst toetsen**: begin met een audit die de these mag weerleggen; schrijf de claimladder (veilig/onveilig) vóór de bouw.
- **Datacontract per bron**: kopcommentaar met dataset-code, filter, jaar, eenheid, URL; waarde met jaar als het per record verschilt.
- **Afleidingen als pure functies met tests**, inclusief één test die het getal uit de bron letterlijk controleert en één die het **verhaal** bewaakt.
- **Interfacezinnen uit de data vullen**, nooit getallen in UI-tekst hardcoderen; tijdsclaims aan een meetjaar verankeren.
- **Kleur scheiden**: oordeelpalet versus hoeveelheidsreeks versus neutraal "geen data".
- **Kaart zelf tekenen** met d3-geo + topojson voor choropleten van een vaste set gebieden: klein, toegankelijk, volledig in eigen stijl.
- **Taal als laag**: één databron, vertalingen alleen voor tekst, tests op volledigheid en structuur.
- **Sitemap uit de broncode genereren**, met een fout als een vertaling ontbreekt.
- **Meten per keuze** (events voor elk perspectief en elke laag), zodat je later weet welk verhaal werkt.
- **Mobiel**: kolommen op prioriteit laten vallen in plaats van horizontaal scrollen; testen op vijf breedtes.

### Bestanden die eigenlijk sjablonen zijn
| Bestand | Sjabloon voor |
|---|---|
| `src/data/countries.ts` | entiteitrecord met bewijs, scoremodel (`scoreWeights`, `scorePijlers`, `gradeScale`, `scoreToGrade`) |
| `src/data/countries.test.ts` | testsuite voor een index: universum, herkomst, gewichten = 100, graadgrenzen, brongetallen, verhaal |
| `src/data/emissies.ts`, `nec.ts`, `landbouw.ts` | contextdataset met kopcommentaar en afleidfuncties |
| `src/data/intensiteit.ts` | klassegrenzen + kleurreeks + legenda |
| `src/components/EuropeMap.tsx` | choropleet met lagen, readout, toegankelijkheid |
| `src/data/artikelen.ts` (bloktype) | duidingartikel met bronnen |
| `src/data/begrippen.ts` + `metBegrippen` | automatische begriptooltips |
| `src/i18n/routes.ts`, `inhoud.ts`, `src/data/en/` | tweetalige laag |
| `scripts/sitemap.mjs`, `index.html`/`en.html`, `vercel.json`, `vite.config.ts` | publicatieschil |
| xlsx-tabbladen *EU27 Audit*, *Source Log*, *Verification Backlog*, *Data Dictionary*, *Risks and QA* | auditwerkboek |
| werkplan §4 (claimladder), §11 (vergelijkbaarheid), §15 (QA), §19 (risico's) | checklists |

### Voorstel voor skills
1. **these-en-claimladder** (stap + template): kernvraag, veilige en onveilige claims, wat het product wel en niet zegt.
2. **bronnenaudit** (checklist + template, xlsx of YAML): universum, zoekprotocol, velden, zekerheid, status, volgende actie, "niet gevonden"-taal.
3. **scoremodel** (template + testgenerator): criteria met uitleg en gewichten = 100, graadschaal, regel voor ontbrekend bewijs, versienummer.
4. **contextdata ophalen** (script per familie: Eurostat, CBS, EEA, OData, SDMX): schrijft een getypt databestand met kopcommentaar, jaar per waarde en een controle tegen de bron. Dit ontbrak hier: de cijfers zijn met de hand geplakt; een script maakt verversen herhaalbaar.
5. **verhaaltests**: bevindingen als tests ("X staat bovenaan", "N landen halen het doel") en een lint op tijdswoorden ("nu", "inmiddels") en hardgecodeerde getallen in teksten.
6. **visualisatiepakket**: tokens (papier/inkt/één font met tabelcijfers/dataschaal), drie kleurlogica's, choropleet-component, ranglijst met perspectieven en prioriteitkolommen, begriptooltips.
7. **duiding uit de audit** (stap): per opvallende bevinding een artikel met bronnen en verwijzing naar de score; twee-zijdig geformuleerd.
8. **publiceren** (checklist): tweetalige routes, canonical/hreflang, sitemap uit de bron, OG-beeld, analytics-events, correctiekanaal, licentie en citeerregel.

### Uniek aan dit project
Het stikstofdomein (depositie, NHx/NOy, kritische depositiewaarden, NEC-plafonds), de keuze voor een automatische E, de Nederland-invalshoek en de illustratiestijl. Ook bijzonder: het grote verschil tussen plan (PostGIS, API, versiebeheer van releases) en uitvoering (statische TS-bestanden). Dat werkte omdat de dataset klein is (27 rijen); voor een grotere of vaker verversende index (zoals Open Data Index) moet de opslag- en ophaalstap juist wél echt gebouwd worden, met de discipline van dit project (jaar bij elk getal, bron bij elk record, test op elk verhaal) erbovenop.
