# Onderzoek: "EU farm" (`eufam`) = averageperson.eu

## 0. Eerst: welke map is "het project"?

- `eufam` en `eufam-style-lab` zijn **dezelfde git-repository** (`github.com/lucashuizinga/averageperson`). `eufam-style-lab` is een **git-worktree** van `eufam` (zijn `.git` is een bestand dat naar `eufam/.git/worktrees/eufam-style-lab` wijst).
- **De nieuwste stand staat in `eufam-style-lab`**: branch `seo-map-canonical` op `06caf53` = `origin/main` (23 sep 2026, 119 commits). De map `eufam` zelf staat op een oudere Codex-branch (`codex/ask-layout-and-analytics`, `a5eb22a`, 21 sep) met niet-gecommitte wijzigingen, 54 commits achter. Wie dit project als voorbeeld gebruikt, moet `eufam-style-lab` lezen (of `origin/main`).
- De naam "style lab" komt van het laatste grote werk: een stijl-laag voor de figuur (`lib/character/style.ts`, `styles/{riso,gouache,watercolour,refined}.ts`, een lokale vergelijkpagina `lib/character/lab/index.html`). Risograaf werd de getoonde stijl.
- Er staan nog ~20 verlaten worktrees in `/private/tmp/eufam-issue37…52`: Codex werkte issues #37–#52 tegelijk af, elk in een eigen worktree en branch `codex/<onderwerp>`, als PR #54–#70.
- De `README.md` is verouderd: die beschrijft nog de allereerste fase (losse HTML-verkenningen van een tekenfiguur, "static site, no build step"). Het project is sindsdien een volledige Next.js-site geworden.

## 1. Wat het is, voor wie, adres, kernvraag

**averageperson.eu**: "27 countries. One statistical standard." In het midden staat één getekende, anonieme burger (geen gezicht). Standaard is dat de gemiddelde Europeaan. Kies je een land, leeftijd, geslacht of huishouden, dan veranderen dezelfde persoon en dezelfde cijfers mee. Elke stand is een eigen URL (`/{lang}/{land}/{leeftijd}/{geslacht}/{huishouden}`, bv. `/nl/nl/30/f/couple-kids`).

- **Kernvraag**: "Hoe leeft de doorsnee persoon van jouw leeftijd en jouw soort huishouden in land X, vergeleken met de EU?" Dat gaat over inkomen, werk, gezondheid, wonen, onderwijs, en waar €100 overheidsgeld naartoe gaat (COFOG).
- **Voor wie**: een breed, niet-specialistisch Europees publiek, in alle 24 EU-talen; ook journalisten, en mensen die één statistiek willen delen (`/explore/<metric>`, `/map`).
- **Live**: `www.averageperson.eu` draait op Vercel (project `averageperson`). Volgens `docs/OPS.md` wees de apex `averageperson.eu` nog naar de registrar (DNS-actie voor de eigenaar). Google Analytics `G-4Y8G3WZJTH`, alleen in productie.
- **Bouwtempo**: 18 tot 23 september 2026. Eerst Claude (Fable 5.1, één sessie, ~65 commits), daarna Codex in parallelle worktrees, daarna weer Claude (Opus 5.5) voor stijl en pagina-focus. Werk is geordend in GitHub-issues (#4–#82); commits noemen `closes #N`/`refs #N`.

## 2. Databronnen

- **Eén bron: de Eurostat dissemination API** (`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/<DATASET>?format=JSON&lang=EN&…`), JSON-stat 2.0. Geen sleutel. Daarnaast als "bouwsteen" Natural Earth via world-atlas (kaart, eenmalig) en Google Fonts (OG-beelden).
- **Hoe**: `scripts/eurostat.mjs` = minimale client plus eigen **JSON-stat-decoder** (platte index terug naar code per dimensie, `table.get({geo, time, …})`, vlaggen per cel, labels). `scripts/data/metrics.def.mjs` is het **register**: per metric welke request (dataset + filters), welke selector per uitsplitsing, en hoeveel decimalen. Er zijn drie selectorvormen: één cel, een **som** van cellen (leeftijdsbanden samenstellen) en `{alt:[…]}` (**de eerste die bestaat wint**: fallback op bredere banden).
- ~75 HTTP-aanroepen, telkens alle 28 geo's (EU27 + 27 lidstaten) tegelijk, `sinceTimePeriod` = 16 jaar terug (voor 15-jaarsreeksen). ~85 metrics in 8 categorieën.
- **Cache**: ruwe antwoorden in `data/raw/<dataset>-<hash van query>.json` (gitignored, ~2,5 MB). In de nieuwste versie: `scripts/eurostat-cache.mjs` met content-hash-objecten, atomisch schrijven, maximale leeftijd (24 u), `--offline` en exacte **replay** op herkomst. `scripts/eurostat-request.mjs` heeft time-out per poging (30 s) en totaal (90 s), maximaal 4 pogingen, exponentiële backoff, `Retry-After`, en een lijst tijdelijke statuscodes en netwerkfouten. Alles is via env te regelen.
- **Frequentie**: wekelijks via GitHub Actions (`.github/workflows/data-refresh.yml`, maandag 05:17 UTC). Dat opent een **PR** met de nieuwe `data/eu.json` en het validatierapport als PR-tekst. Pas bij merge publiceert CI die vintage. "Eurostat-storingen kunnen productie nooit breken."
- **Versheid**: per land en per metric het **eigen nieuwste jaar**. `referenceYears` noteert het nieuwste jaar dat alle 28 delen; een `yearNote` waarschuwt als een vergelijking met de EU over twee jaren gaat. Uitzondering: het COFOG-blok houdt één jaar, zodat de aandelen samen 100 blijven.
- **Valkuilen staan in `docs/DATA.md`**: "de 400's waren van ons" (dimensies verzonnen; oplossing: eerst één geo en één periode zonder filters opvragen en de dimensiecodes uit het antwoord lezen); `tran_sf_roadse` bestaat niet meer; de per-miljoen-cel van Eurostat klopte niet (zelf delen door bevolking); EHIS maar om de zes jaar; misdaadcijfers zonder EU-totaal; SILC-"2025" = inkomen over 2024.

## 3. Opslag

Drie lagen (`docs/DATA-MODEL.md`, "binding"):

1. **Neon Postgres** (via Vercel Marketplace) als *system of record*, **Drizzle ORM** (`db/schema.ts`, `drizzle.config.ts`, migraties `db/migrations/0000–0005`, seed `db/seed/{geos,sources,metrics}.ts`). Migraties via de unpooled URL, scripts via de pooled URL (`neon-http`). Skills `neon` en `neon-postgres` (van `neondatabase/agent-skills`) staan in `skills-lock.json`, `.claude/skills/` en `.agents/skills/`.
2. **Tabellen**: `geos`, `sources` (één rij per API-request, met exacte aanroep), `metrics` (catalogus: unit-enum, kind-enum median/mean/rate/share/…/model_case, category, `higher_is_better` true/false/null, `is_core`), `vintages` (candidate → published → rejected, `stats` jsonb), **`observations` in lang formaat** (één rij per metric × geo × `dims` jsonb × jaar, met ruwe waarde, Eurostat-vlaggen en `raw_ref` = de exacte selector; gegenereerde kolommen `age_band`, `sex`, `cofog`), `snapshots` (het geëxporteerde profiel per geo met sha256) en `refresh_runs` (audit).
3. **Bevroren export in git**: `data/eu.json` (3,4 MB, alle profielen), `data/meta.json` (catalogus zonder cijfers) en `data/eu.checksum` (`vintage:11 sha256:…`). **De site leest alleen die JSON**, nooit de database.

**Historie**: rijen worden nooit bijgewerkt; elke oogst = nieuwe vintage (~230.000 observaties). Oude gepubliceerde vintages blijven staan. Een nieuwe uitsplitsing = een nieuwe `dims`-sleutel, geen migratie. `prettyJson` houdt getallenreeksen op één regel, zodat git-diffs alleen tonen wat echt veranderde.

## 4. Bewerking, validatie, eerlijkheid

- **Pijplijn**: `data:fetch → data:validate → data:export → (PR) → data:publish → data:verify`. In de nieuwste versie zit het samen in `scripts/data/refresh.mjs` met één expliciete vintage per run, transactionele imports en herstelbare exports.
- **Afleiden op één plek**: `scripts/data/derive.mjs` (`buildDataset`) doet alles: jaar kiezen, per inwoner (MIO_EUR × 1e6 / bevolking van *hetzelfde* jaar), per €100 (aandeel van het totaal), `vsEU` (land / EU27, 4 decimalen), leeftijd × geslacht en reeksen. **Validate en export roepen dezelfde functie aan**: wat gevalideerd wordt, is wat uitgaat.
- **Validatieregels** (`scripts/data/validate.mjs` → `data/validation-report.md`): dekking (elke kernmetric × 28), grenzen (bv. mediane leeftijd 30–60), COFOG-som 100 ± 0,5, leeftijdsbanden 100, het totaal ligt tussen man en vrouw (2 %), afgeleide dichtheid binnen 5 % van Eurostats eigen cijfer, reeksen strikt oplopend en eindigend op de kopwaarde, minstens 5 punten per kernmetric, **drift** tegenover de vorige gepubliceerde vintage (> 25 % = waarschuwing, > 60 % = fout), en een inhoudelijke check (sociale bescherming is overal de grootste post).
- **Poortwachters in de build**: `prebuild` = `scripts/check-data.mjs` (contract) + `data:verify` (checksum van bestand == snapshots in Neon; een met de hand aangepast cijfer laat de build falen, getest in OPS.md) + `scripts/i18n/check.mjs`. `postbuild` = `payload:check` (gemeten bytes per route tegen budgetten).
- **Regels tegen verzinnen** (`docs/DATA.md`, `docs/SPEC.md`): "Nothing is estimated, modelled or filled in." Ontbrekend = `null`, en dat staat in de dekkingstabel. Gaten in reeksen blijven gaten (geen interpolatie). Modelgevallen (netto loon) heten overal "model case". De belastingpagina heet "allocation model".
- **Woordregels**: mediaan = "typical", gemiddelde per inwoner = "average". Nooit "de meest voorkomende persoon"; de voetnoot zegt dat het een samenstelling van statistieken is. `docs/GLOSSARY.md` legt dat per taal vast (NL *typisch/doorsnee* vs *gemiddeld*).
- **Teksten uit cijfers**:
  - `lib/person.ts` maakt de openingszin met drie regels: een zinsdeel mag alleen spreken voor de persoon op het podium (een cijfer dat terugviel op het landelijke getal verdwijnt uit de zin, `speaksFor`); de zinsdelen passen bij de levensfase; een huishouden is een groep. Elk zinsdeel is een volledig ICU-bericht en ze worden samengevoegd met `Intl.ListFormat`, nooit door losse stukken aan elkaar te plakken.
  - `lib/resolve.ts` zegt alleen *welke uitsnede* antwoordde (`basis`: country/age/sex/age-sex/household, `missing`), nooit een zin.
  - `narratives()` en `lib/standouts.ts` rangschikken op `|ln(ratio)|` ten opzichte van de EU (wat valt op), met een maximum per soort.
  - `lib/related-correlations.ts`: paren worden redactioneel gekozen, "never select pairs by their r value"; zwakke en negatieve verbanden blijven zichtbaar.
- **Tests**: `node --test` (45 bestanden in de nieuwste versie): JSON-stat, data-invarianten (`test/data.test.mjs`), ranglijsten, URL ↔ toestand, i18n, Ask met opgenomen fixtures (geen netwerk), kaartklassen, standouts.

## 5. Visualisatie

- **Geen grafiekbibliotheek.** Alles is inline **SVG, met de hand geschreven** in React (`components/TrendChart.tsx`, `Sparkline.tsx`, `Hundred.tsx` (€100-staaf), `AgeStructure.tsx` (bevolkingspiramide), `EuropeMap.tsx`, `CompareRows.tsx`, `IncomeByAge.tsx`), met pure hulpfuncties in `lib/stats.ts` (`extentOf`, `projector`, `linePath` met pixel-snap, `rankRows`, `drawable`). d3-geo en topojson worden alleen gebruikt in een eenmalig bouwscript (`scripts/map/build.mjs`: Natural Earth 50 m, conforme kegelprojectie, 10 % van de punten, overzeese gebieden weg → `lib/map/europe.json`, 16 KB).
- **Het onderscheidende stuk is de parametrische figuur** (`lib/character/`, ~5.000 regels TS, geen afhankelijkheden, geen DOM): een **rig** (leeftijd, lengte, bouw, schouders, heupen …) levert ankerpunten, en 72 kleding-, haar- en accessoire-assets hangen aan die ankers, zodat elk kledingstuk op elk lichaam past. `specFromProfile({land, leeftijd, geslacht, huishouden})` is **deterministisch** (seed uit een stabiele hash, nooit `Math.random`). Leeftijd stuurt proporties (6 hoofden volwassen, 3,5 baby). Geslacht is een **neiging, geen regel**. De huidskleur is één gewogen trekking naar het aandeel geboren buiten de EU, uitdrukkelijk "een proxy, geen meting", met een spreidingsaudit (`audit.mjs`). Huishoudens tekenen partner en kinderen.
  - **Morph**: getallen lineair, kleuren in **OKLab**, categorieën wisselen op t = 0,5 met een veeg (`morph.ts`).
  - **Drie kwaliteiten**: `full` (filters, korrel) voor de hoofdfiguur, `lite` voor rasters en zwakke apparaten, `flat` (geen filters) voor de eerste weergave en voor **OG-beelden** (Satori/resvg kan geen `feTurbulence`). Een LRU-cache per spec-hash.
  - **Stijl-laag** (nieuwste versie): "een stijl verandert hoe iemand geschilderd wordt, nooit wie." Risograaf met kleur- en schaduwplaat, misregistratie en korrel; knoppen voor de stijl in de lab-pagina.
  - Het ontstond via verkenningen: `explorations/option-a…f*.html` (zes losse HTML-pagina's met live editor). Optie F (oliepastel) werd de basis, later riso.
- **Achtergrondschilderijen per land** (`scenes/`): per land een dag- en een nachtversie, **met een beeldgenerator gemaakt** vanuit een vaste stijlreferentie en de prompts in `scenes/catalog.json`, met verantwoording per beeld in `scenes/records/` en `generation-log.json`. Ze worden eerst met het oog beoordeeld (`public/scenes-review.html`) en **nooit automatisch in CI gegenereerd**. Het bouwscript maakt AVIF en WebP op 320/640/1080 px, LQIP-placeholders en bestandsnamen met een hash (een jaar cache, immutable). `scenes:check` bewaakt dekking en bytebudget.
- **Design-tokens** (`app/globals.css`): warm papier `#f2ece1`, inkt `#2a2521`, één **accent per land uit de vlag** als `--accent-l`/`--accent-d` op een wrapper (zodat het donkere thema nooit een licht-thema-kleur krijgt), `color-mix` voor tinten, papierkorrel via een SVG-noise-`::before`. Fraunces + Instrument Sans; voor Grieks en Cyrillisch Source Serif 4 + Inter. Tabulaire cijfers, U+2212 als minteken. Licht en donker (systeem + `data-theme`), tekstgrootte-knop, `prefers-reduced-motion` gerespecteerd.
- **Mobiel eerst**: de burger blijft in beeld (sticky rail) terwijl de cijfers scrollen; vergelijkingstabellen die een telefoon kan lezen; 2×2-standouts op 400 px.
- **Statistische kaartmaker** (`/map`, nieuwste versie): vijf klassen van gelijke breedte, null = grijs, een historisch jaar valt nooit terug op een nieuwer jaar, export naar SVG (met waarden en bron-URL's in de metadata) en 2× PNG met kop, jaar, schaal, definitie en bron.

## 6. Website

- **Next.js 15 App Router**, TypeScript strict, `next-intl` (ICU), Vercel. Statisch waar het kan: 24 × 28 landpagina's voorgerenderd, diepere profielpaden op aanvraag en daarna gecachet. De toestand staat in het **pad**, niet in de query.
- **Pagina's**: `/[lang]` (EU), `/[lang]/[country]/[age]/[sex]/[household]`, `/[lang]/compare/a/b/…` (2–5 landen), `/[lang]/explore/[metric]` (één statistiek over 27 landen), `/[lang]/map`, `/[lang]/sources` (per cijfer de dataset, de exacte aanroep, de eenheid, het jaar en de definitie), `/[lang]/ask`.
- **Ask** (`docs/ASK.md`): een vrije vraag ("Nederland vs België, vrouwen, inkomen") wordt een **getypte query**. Eerst lexicaal (landnamen in 24 talen via `Intl.DisplayNames`, leeftijd met regex), daarna een klein classificatiemodel (TypeSafe "System One", alleen keuzes uit vaste lijsten, drempel 0,35, time-out 2,5 s), daarna de huidige stand. **Het model maakt nooit een getal, een zin of een grafiek**; de code stelt antwoordblokken samen (fact, ranking, gap, spend, compare, trend, tiles) met bron en vervolgvragen. Zonder sleutel werkt het lexicaal en zegt de pagina dat.
- **Payload-discipline** (`ARCHITECTURE.md` §4, `docs/production-payload-budget.md`, `scripts/ops/payload-budget.mjs`): LCP < 1,5 s, budgetten per route (bv. landpagina ≤ 220 KB HTML, JS-limiet per route), "de pagina stuurt wat hij tekent en niets meer". Ranglijsten en vertaalteksten die je pas bij openen nodig hebt, komen van versie-gebonden, onveranderlijke API-bronnen (`/api/resources/{version}/…`). Het profiel is uitgekleed (reeks = beginjaar + waarden). Alleen gebruikte fonts worden voorgeladen.
- **SEO en delen**: OG-beeld per URL (`opengraph-image.tsx` in elk segment; `lib/og.tsx`: platte figuur + vlag + drie cijfers; fonts van Google met `&text=` alleen voor de tekens op de kaart). Beschrijving per pagina uit de echte cijfers (`lib/seo.ts`). JSON-LD `WebSite`, `Dataset` (CC BY 4.0) en `FAQPage` (`lib/faq.ts`: tien vragen uit de data per vergelijking). hreflang voor 24 talen + x-default, sitemaps per taal, canonieke URL = genormaliseerd pad. Een knop kopieert de URL.
- **Taal**: `middleware.ts` stuurt URL's zonder taal één keer door (cookie → Accept-Language → en). URL's mét taal worden nooit doorgestuurd, zodat een gedeelde link zijn taal houdt. De botsing tussen taal- en landcodes (`/nl`) is expliciet opgelost. Vertalen gaat via `scripts/i18n/translate.mjs` (AI Gateway, temperature 0, alleen ontbrekende of gewijzigde sleutels, `status: machine|reviewed`, "reviewed" wordt nooit overschreven). `check.mjs` controleert in de build dat placeholders en ICU-structuur identiek zijn en dat de vormen `in/of/people` per land bestaan.
- **Verhaal**: openingszin over "de doorsnee 30-jarige vrouw in Nederland", dan "Wat valt op" (vier afwijkingen), dan secties per categorie met "beste vier, toon alle", dan waar €100 naartoe gaat, buren, bronnen. Voettekst in EU-blauw, onafhankelijk (geen officiële EU-site), credit aan Datavizier en Eurostat.
- **Operatie**: CI (test, `scenes:check`, tsc, publish + verify op main, build), post-deploy smoke-test (`scripts/ops/smoke.mjs`) die bij een fout een commit-commentaar plaatst, en `docs/OPS.md` met een lijst acties die alleen de eigenaar kan doen (DNS, betaalde integraties).

## 7. Werkwijze en kennis

- **Documenten als contract**: `docs/SPEC.md` (wat), `docs/ARCHITECTURE.md` ("owned by the integrator, binding for all parts"), `docs/DATA-MODEL.md` (binding), `docs/DATA.md` (per metric dataset, filters, eenheid, jaar en valkuil), `docs/I18N.md`, `docs/GLOSSARY.md`, `docs/CHARACTER.md`, `docs/ASK.md`, `docs/OPS.md`, en per feature `docs/features/*.md` ("built in parallel against this document"). Elk document bevat beslissingen *met de reden* ("it used to be X; that cost too much because …").
- **Rolverdeling tussen agents**: er is een "data agent" (eigenaar van `lib/data/types.ts`), een site-kant (`lib/contract.ts` als spiegel "zodat de UI compileert voordat de data-module er is") en één **naad** (`lib/adapters.ts` server, `lib/adapters.client.ts` client). Parallel werk liep via GitHub-issues → één worktree en branch per issue → PR met review. Er is geen `CLAUDE.md`/`AGENTS.md`; de kennis staat in `docs/` en in uitgebreide JSDoc-koppen boven elk bestand.
- **Eigenaarsverzoeken worden letterlijk vastgelegd** (bv. page-focus: "all the datapoints are a bit overwhelming"; geen bril op een gezicht zonder ogen: "leest als censuurbalk").
- **Terugkerende valkuilen**: dimensiecodes raden (eerst de kubus uitlezen); één achterblijvend land dat de hele kaart vastzet op een oud jaar (per land eigen jaar); dubbele cijfers op één pagina (één bron per grootheid); payload die stil groeit (budget in de build); vertalingen die placeholders breken (check in de build); OG-renderers zonder filters (`flat`-kwaliteit); hydratatieverschillen (alles deterministisch, figuur aan beide kanten berekend); kapotte Actions-rechten voor PR's (in OPS.md opgelost).

## 8. Het patroon: wat is sjabloon, wat is uniek

### De stappen die zich herhalen

1. **Vraag en contract eerst**: één kernvraag, een SPEC met het dataschema (`Profile`, `Metric` met `value, unit, year, source, series, by*`), de woordregels (typical/average) en de URL-structuur. Pas dan code.
2. **Bron verkennen**: per dataset eerst één geo en één periode zonder filters opvragen, de dimensies uitlezen, dan pas filters kiezen. Alles in `DATA.md` per metric: dataset, filters, eenheid, jaar, valkuil.
3. **Register in plaats van code per metric**: `metrics.def.mjs` (request + selector: cel / som / alternatieven) plus een catalogus in de database (`metrics`: unit, kind, category, higherIsBetter, isCore).
4. **Ophalen met cache**: client + decoder + cache op hash van de query + retry/time-out/backoff + bijhouden welke aanroep wat opleverde.
5. **Ruw opslaan, nooit overschrijven**: vintages, lang formaat met `dims` jsonb, `raw_ref` per waarde.
6. **Eén afleidfunctie** die zowel validatie als export voedt.
7. **Valideren met een rapport**: dekking, grenzen, sommen, onderlinge consistentie, reeksen, drift tegenover de vorige vintage; markdown-rapport als PR-tekst.
8. **Publiceren via een poort**: candidate → (PR, mens merget) → published; bevroren JSON in git + checksum; de build faalt als JSON en database niet overeenkomen.
9. **Pure tekstlaag**: resolver ("welke uitsnede antwoordde") → ICU-templates → `Intl` voor getallen en lijsten; zinnen spreken alleen voor wat gemeten is.
10. **Visualiseren zonder bibliotheek**: pure geometrie-hulpen + inline SVG + tokens voor beide thema's + een accent per entiteit; elke grafiek leesbaar per punt, met bron en jaar.
11. **Site**: toestand in het pad, statisch prerenderen, OG per URL, JSON-LD (Dataset/FAQ), hreflang, sitemaps, een bronnenpagina met de exacte aanroepen.
12. **Bewaken**: payloadbudget in postbuild, smoke-test na deploy, wekelijkse refresh-PR.

### Bestanden die eigenlijk sjablonen zijn

| Sjabloon | Bestand(en) | Algemeen bruikbaar als |
|---|---|---|
| JSON-stat-client + decoder | `scripts/eurostat.mjs` | client voor elke JSON-stat-bron (Eurostat, CBS, SSB, Statistik Austria) |
| Verzoek met deadlines en retry | `scripts/eurostat-request.mjs` | `fetchMetRetry` voor elke API |
| Cache met herkomst en replay | `scripts/eurostat-cache.mjs` | raw-cache-laag |
| Metric-register met selectorvormen | `scripts/data/metrics.def.mjs` | YAML/JS-spec per metric |
| Schema met vintages en lang formaat | `db/schema.ts`, `drizzle.config.ts`, `docs/DATA-MODEL.md` | standaard Drizzle-schema "observations + vintages + snapshots" |
| fetch/validate/publish/export/verify | `scripts/data/*.mjs`, `lib.mjs` (canonical JSON, checksum, prettyJson) | vijf commando's per project |
| Contractcheck in prebuild | `scripts/check-data.mjs` | invarianten van het dataschema |
| Wekelijkse refresh-PR + publish bij merge | `.github/workflows/{data-refresh,ci}.yml` | CI-sjabloon |
| Smoke na deploy | `scripts/ops/smoke.mjs`, `post-deploy.yml` | idem |
| Payloadbudget | `scripts/ops/payload-budget.mjs`, `docs/measurements/` | idem |
| Formatteren via Intl | `lib/format.ts` | getallen, valuta, lijsten per taal |
| Resolver + tekstregels | `lib/resolve.ts`, `lib/person.ts`, `docs/GLOSSARY.md` | "cijfer → zin" met eerlijkheidsregels |
| SVG-grafiekhulpen | `lib/stats.ts`, `components/TrendChart.tsx`, `Sparkline.tsx` | lijn/rang/strook zonder bibliotheek |
| Kaart bouwen | `scripts/map/build.mjs` | vereenvoudigde, geprojecteerde kaart als JSON |
| Tokens + thema + accent | `app/globals.css` | ontwerpbasis |
| OG + SEO + JSON-LD | `lib/og.tsx`, `lib/seo.ts`, `lib/faq.ts`, `app/sitemap.ts` | deelbaarheid |
| i18n-pijplijn | `scripts/i18n/{translate,check}.mjs`, `middleware.ts` | vertalen met glossarium en checks |
| Beeldpijplijn | `scenes/` + `scripts/scenes/*` | gegenereerde illustraties met verantwoording en review |

### Wat zou je als skill kunnen vastleggen

- **Skill "bron verkennen"** (stap + checklist): robots/voorwaarden, structuur uitlezen vóór filters, één kleine aanroep, in `DATA.md` per metric dataset/filters/eenheid/jaar/valkuil, en wat ontbreekt.
- **Skill "datapijplijn"** (script + template): Drizzle-schema met vintages en observaties, de vijf commando's, checksum en verify in prebuild, de CI-workflow met refresh-PR. Parametriseerbaar per bron (JSON-stat, OData, SDMX, CSV).
- **Skill "validatie"** (checklist + rapportgenerator): dekking, grenzen, sommen, consistentie (totaal tussen delen), reeksregels, drift tegenover de vorige versie, gaten benoemen in plaats van vullen.
- **Skill "cijfers naar tekst"** (regels + template): mediaan/gemiddelde, eenheid en jaar altijd bij het getal, "spreekt alleen voor gemeten uitsnede", ICU + `Intl`, nooit zinnen aan elkaar plakken, `|ln(ratio)|` voor "wat valt op", correlaties redactioneel kiezen.
- **Skill "grafische engine"**: tokens, accent per entiteit, SVG-hulpen, drie kwaliteitsniveaus (vol, licht, plat voor OG), determinisme, reduced motion, mobiel; plus de dataviz-skill voor vorm en kleur.
- **Skill "site-schil"**: toestand in het pad, prerender, OG per URL, JSON-LD Dataset, bronnenpagina met exacte aanroepen, hreflang, payloadbudget, smoke-test.
- **Skill "parallel bouwen"**: binding docs vóór agents, één eigenaar per bestand of laag, een contract-spiegel zodat de UI eerder kan bouwen, één issue = één worktree = één PR, feature-doc "built in parallel against this document".

### Uniek voor dit project (niet generaliseren)

De parametrische burger (rig, assets, morph, stijlen) en de huidskleur-proxy; de landenschilderijen; Ask met een classificatiemodel; COFOG en de belastingallocatie; de 24-talenschil met grammaticale landvormen. Die zijn het visitekaartje, maar het herbruikbare goud zit in de lagen eronder: **register → cache → vintage → één afleidfunctie → validatierapport → poort → bevroren JSON met checksum → pure tekstregels → bibliotheekloze SVG met tokens → statische site met herkomst per getal**.

### Vergelijking met Open Data Index (kort)

Bronwijzer doet al veel hetzelfde (Neon + Blob, crons, nooit bijwerken in `status_meting`, kop en dek uit de cijfers, "niets verzinnen"). Wat averageperson.eu extra heeft en wat de skillset zou moeten bevatten: **vintages met een publicatiepoort en checksum-verify in de build**, **één afleidfunctie voor validatie en export**, **drift-validatie met een markdown-rapport als PR**, het **register met selectorvormen** (som en alternatieven), **payloadbudgetten in de build**, en de **resolver die zegt welke uitsnede antwoordde** voordat er tekst van wordt gemaakt.
