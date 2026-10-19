# Onderzoek: het project `gedoe` (Staat van, staatvan.nl)

Alleen gelezen: niets gewijzigd, geen server gestart, geen `.env*` geopend. Bronnen: de docs in de root, `docs/`, `etl/`, `lib/`, `app/`, `components/`, `zorgfinancien/`, `onderzoek/`, `.github/workflows/`, `git log` (145 commits) en het projectgeheugen in `~/.claude/projects/-Users-lucashuizinga-code-gedoe/memory/`.

## 1. Wat het is

- **Staat van** (repo-map `gedoe`, eerdere namen Overlastradar en BuurtInzicht). Live op **https://staatvan.nl** sinds 6 juli 2026, ook op gedoe.vercel.app. Repo `github.com/Lucaks3/gedoe` (privé). Push naar `main` = productie-deploy op Vercel.
- De kernvraag staat op de homepage: **"Hoe staat jouw buurt ervoor?"** Het gaat om veiligheid (overlast, misdrijven), inkomen, wonen en bewoners, van Nederland via provincie en gemeente naar wijk en buurt (18.500+ gebieden), met tijdreeksen vanaf 2012 en vergelijking per 1.000 inwoners (`README.md`, `INZICHTEN.md` §1).
- Doelgroep: een bewoner die zijn eigen buurt opzoekt (B1-niveau). Daarnaast journalisten (deelbare pagina's, widgets) en, in de pilot, raadsleden.
- Naast de publieke site staat een besloten **Raadsradar-pilot** (`app/(pilot)`, `docs/raadsradar.md`, pilot.staatvan.nl achter een login via `proxy.ts`). Die bevat zorgfinanciën (DigiMV), onderzoeksdossiers, raadsstukken met AI-duiding en uitlegvideo's. In de pilot speelt een LLM wél een rol, op de hoofdsite niet.

## 2. Databronnen

| Bron | Hoe opgehaald | Script |
|---|---|---|
| Politie-overlast 47024NED (CBS dataderden OData v3) | Feed-endpoint, 10k per pagina, 6 pagina's parallel, hervatbaar | `etl/03-overlast.mjs` |
| Misdrijven 47018NED / 47013NED / 47022NED (188 mln rijen, alleen recente jaren per buurt-maand) | idem | `etl/05`, `etl/06` |
| CBS Kerncijfers wijken en buurten, 13 jaargangen (2013–2025) | velden herkend op **kolomtitel**, want de keys verschillen per jaargang | `etl/07-kerncijfers.mjs` |
| Inwoners via PDOK WFS, grenzen via cartomap GeoJSON | statische bestanden, per gemeente gesplitst | `etl/02`, `etl/04-geo.mjs` |
| Veiligheidsmonitor, bevolking per maand (37230ned), provincie-indeling (86059NED), postcode→buurt | OData | `etl/09`, `etl/14`, `etl/10`, `etl/12` |
| RIVM GCN (luchtkwaliteit, ESRI-ASCII-raster) | buurtzwaartepunt → RD → rastercel | `etl/13-lucht.mjs` |
| GGZ (regiobeeld/RIVM JSON), COA-locaties (CSV-momentopname), vakantieverhuur, OSM-hotels | voor labs/verkenners | `etl/15–18` |
| Pilot: DigiMV, Notubiz, Open Raadsinformatie, SRU Gemeenteblad, Iv3, subsidieregister, streekomroepen | Python + Node | `zorgfinancien/*.py`, `onderzoek/bronnen.py`, `etl/19–22` |

**Ritme en automatisering.** `.github/workflows/refresh.yml` draait op de 16e van elke maand om 03:30 UTC (de politie publiceert rond de 15e). Stappen: overlast herladen met `OVERLAST_VANAF=recent`, recente misdrijfmaanden, Veiligheidsmonitor, bevolking per maand, provincie-aggregaten, **`scripts/check-data.mjs`** (stopt bij een fout), cache legen via `POST /api/revalidate?secret=`, opwarmen (`scripts/warm.mjs`) en het **Buurtbericht** versturen (maandmail). `warm.yml` warmt na elke productie-deploy op.

**Sleutels.** De bronnen zijn open, er is geen API-sleutel nodig. Geheimen zijn infrastructuur: Neon (`DATABASE_URL`, `_UNPOOLED`), `REVALIDATE_SECRET`, `WARM_TOKEN` (bypass voor Vercel Bot Protection; die brak de refresh in augustus en september met een 429), `RESEND_API_KEY`, `EMAIL_SECRET`, `PILOT_BLOB_TOKEN`. Ze staan in GitHub-secrets en als sensitive env in Vercel.

**Foutafhandeling** (`etl/lib.mjs`):
- `fetchJson` met 6 pogingen en exponentiële backoff;
- `fetchAllePaginas` met parallelle pagina's en 150 ms pauze ("vriendelijk voor de CBS-API");
- een state-bestand per ETL (`etl/.state-*.json`) om te hervatten;
- `logRun` naar `etl_runs` voor de herkomst van elke laadactie.

**Versheid.** "Nooit 'deze maand' of 'nu'": altijd de datamaand zelf noemen (`AGENTS.md` regel 5, `fmtMonth`). Sitemap-`lastmod` = de 16e na de meetmaand (`lib/seo.ts refreshDatum`). Check-data eist een nieuwste maand van hooguit 2 maanden oud.

**Robots en voorwaarden.** Hier is het project zwakker dan Bronwijzer. Er staat geen robots-regel in de docs. De hoofd-ETL stuurt geen User-Agent mee (`etl/lib.mjs`). De pilot gebruikt op een paar plekken een **browser-UA** (`zorgfinancien/onderzoek.mjs`, `lib/pilot/organisatie.ts`: "Mozilla/5.0 … Chrome/126"). Andere scripts zetten wel een eerlijke UA ("staatvan.nl ETL (hotels Amsterdam; contact via staatvan.nl)"). `etl/20-omroep-activiteit.mjs` leest robots.txt alleen om sitemaps te vinden. Licentie (CC-BY politie) en caveats staan wel op `/over`.

**Bron-eigenaardigheden, empirisch vastgelegd** (`ARCHITECTURE.md`, `INZICHTEN.md` §2, commentaar in `etl/03`):
- sleutels zijn met spaties opgevuld;
- `$skip` werkt alleen op ODataFeed;
- **Feed past alleen het eerste `$filter`-predicaat toe**: de "recente" refresh haalde daardoor eerst 28,8 mln rijen op;
- filters op maatkolommen worden stil genegeerd;
- 50–90% van de rijen is 0;
- cijfers worden met terugwerkende kracht herzien.

## 3. Opslag

- **Neon Postgres** (~2 GB). Schema in `etl/schema.sql`:
  - `areas` (CBS-code als PK, hiërarchie in de code zelf, `indeling`-jaargang);
  - `overlast` en `misdrijven` (smal en lang: area, period_type Y/M, period, category, count; **alleen niet-nul rijen**, ontbrekend = 0 en aangevuld met `fillSeries`);
  - `area_stats` (EAV: area, jaar, metric, waarde; uitbreidbaar zonder migratie);
  - `categories`, `buurt_buren`, `gemeente_buren`, `bevolking_maand`, `abonnees` (adres versleuteld met pgcrypto, lookup via HMAC);
  - `etl_runs`;
  - indexen afgestemd op de twee leesvormen: tijdreeks per gebied en choropleth per periode.
- **Herindelingen** lost de bron zelf op: CBS rekent de hele historie elk jaar om naar de nieuwste indeling. Een herindeling is dus een idempotente full-refresh.
- **Historie**: de bronhistorie (2012–nu) staat in de feitentabellen. Er is geen eigen versiegeschiedenis van wijzigingen, alleen `etl_runs`.
- **Statische bestanden**: `public/geo/` (vereenvoudigde grenzen per gemeente, via CDN), `lib/geo/buurt-punten.json` (zwaartepunten voor de puls-kaart, `scripts/buurt-punten.mjs`).
- **Pilot**: JSON-bestanden in `.pilot/` (gitignored), gesynchroniseerd naar besloten Vercel Blob met `scripts/pilot-data.mjs push|pull` en bij de build meegetraceerd via `outputFileTracingIncludes` per route (`next.config.ts`).
- **Leeslaag**: alle SQL in `lib/data.ts` (plus domeinmodules `lib/se.ts`, `verbanden.ts`, `vergelijkbaar.ts`), elk als `cache(unstable_cache(fn, ["v1:naam"], { revalidate: 86400, tags: ["data"] }))`. Versie in de cachekey ophogen bij een vormwijziging. Tabelnamen alleen via whitelists. Valkuil: Neon geeft maximaal 64 MB per HTTP-respons, en `unstable_cache` geeft problemen boven 2 MB.

## 4. Bewerking

**ETL-stappen.** Genummerde scripts `etl/00…22`, elk één bron → één tabel, idempotente upsert via `batchUpsert`. Die schrijft alleen echt gewijzigde rijen (`WHERE (…) IS DISTINCT FROM EXCLUDED`), want bij herladen is meer dan 95% identiek en zijn lege upserts duur.

**Afgeleide cijfers** (in SQL of TypeScript, op het moment van lezen):
- per 1.000 inwoners, alleen bij 50 inwoners of meer (`per1000` in `lib/format.ts`);
- jaar-op-jaar, momentum (laatste 3 maanden tegen de 3 ervoor) en seizoenseerlijk (dezelfde 3 maanden vorig jaar);
- anomalieën: z-score tegen het eigen gemiddelde per kalendermaand, met drempels `mu ≥ 3` en `sd ≥ 1` (`_getAnomalies`);
- percentielen, gepresenteerd als rang;
- stijgers en dalers met een minimale basis (gemeenten ≥ 25.000 inwoners);
- streaks;
- location quotient (in het advies);
- Spearman en decielen (`/verbanden`);
- vergelijkbare buurten (8 nearest neighbours op het sociaaleconomische profiel, **bewust zonder de uitkomstvariabele**, anders wordt de benchmark circulair: `ARCHITECTURE.md`);
- schaalverwachting (criminaliteit groeit bovenlineair met inwonertal, Bettencourt 2010, `lib/vergelijkbaar.ts`);
- provincies als exacte som van de gemeenten.

**Validatie.** `scripts/check-data.mjs`: nieuwste maand recent genoeg, aantal rijen plausibel, som van gemeenten ≈ NL-totaal (< 2%), som van provincies ≈ NL, aantal KWB-metrics. Exit 1 laat de workflow falen. Er zijn **geen unit-tests** (geen `*.test.*`, geen testscript). De WBSO-aanvraag noemt property-based tests als ambitie.

**Statistische eerlijkheid in de labs** (`lib/coa.ts`, `lib/ggz.ts`): een **placebotoets**, met 200 sets nep-locaties binnen dezelfde gemeente en stedelijkheidsklasse. Dan zie je of het verschil bij echte COA- of GGZ-locaties groter is dan toeval. Ook correctie voor inkomen en dichtheid (GGZ ↔ "verward persoon": ρ 0,48 ruw, 0,22 gecorrigeerd).

**Teksten uit cijfers, zonder LLM op de hoofdsite.** Een bewuste keuze: "zonder generatieve AI (hallucinatierisico is onacceptabel bij feitelijke cijfers over buurten)" (`docs/wbso-aanvraag-concept-2026.md`, Project 1 "Duidingsengine"). In plaats daarvan sjablonen in code:
- `lib/facts.ts`: type `Fact` = toon (alert/up/down/neutral), badge, groot getal en een Nederlandse zin met **vet**;
- `lib/verhaal.ts`: slides voor het maandverhaal;
- `lib/buurtbericht.ts`: maandmail;
- `lib/seo.ts`: metabeschrijvingen met echte cijfers;
- `lib/widget-html.ts`.
- Taalhulpjes: `keerNormaal` ("3× normaal" in plaats van sigma's) en `LEVEL_MEERVOUD` ("nooit + 'en' plakken: Gemeenteen").

**De stijlregels in `AGENTS.md`** gelden voor elke datamodule:
1. het grote getal gaat over het onderwerp zelf;
2. het onderwerp staat vooraan;
3. de vergelijkingsgroep komt na de claim;
4. geen jargon;
5. eenheid en peilperiode altijd noemen;
6. de kleur volgt het oordeel, niet de richting;
7. eerlijk over onzekerheid;
8. de voorleestest.

**LLM in de pilot, met harde controle.** Aanroepen via `claude -p` (abonnement, Opus 5.5 medium, geen tools, `--json-schema` als uitvoercontract, neutrale werkmap zodat CLAUDE.md niet wordt geladen: `lib/pilot/claude.ts`). Het patroon in `zorgfinancien/duiding.mjs`:
1. de feiten gaan als genummerde regels `F1 … = waarde` mee;
2. het model moet bij elk punt de F-nummers noemen;
3. het script haalt alle getallen uit de tekst en controleert ze tegen die feiten (afgerond, ±5%);
4. een punt met een getal zonder bron krijgt een waarschuwing.

Verder:
- `zorgfinancien/pdf.mjs`: Haiku geeft per bedrag de letterlijke regel, het script zoekt die terug in de PDF-tekst, bepaalt zelf de eenheid en doet een rekencontrole (opbrengsten − kosten ≈ resultaat);
- `onderzoek/analyse.mjs`: citaten die niet letterlijk in de brontekst staan, vallen weg;
- goedkoop model (Haiku) voor lezen en uittrekken, sterk model (Opus) voor synthese en oordeel;
- het principe uit `zorgfinancien/README.md`: "downloaden en omzetten gebeurt bewust zonder model … modellen alleen waar oordeel of lezen nodig is".

## 5. Visualisatie

**Engine: geen grafiekbibliotheek.** Alles is eigen SVG in React (`components/charts.tsx`, 794 regels; `components/viz/*`), Canvas 2D voor de puls-kaart (`components/PulsKaart.tsx`, drie offscreen-lagen: basis, gloed, etiket) en **MapLibre GL** voor choropleths en heatmaps (`AreaMap.tsx`, `KloofKaart.tsx`, `WoonKaart.tsx`, pilotkaarten). Als ondergrond dient de PDOK BRT-grijs-raster, ontkleurd (`lib/basemap.ts`: gratis, geen sleutel; CARTO vraagt sinds 2026 een sleutel).

**De viz-grammatica** (23 sep 2026, Lucas: "NRC/NYT-waardig"), vijf vormen in `components/viz/`:
- `Bevinding`: de kop is de bevinding als zin, een onderregel met eenheid en peildatum, één grafiek, de bron; geen kader, alleen een `border-t` in inktkleur;
- `Jaarlijnen`: elk jaar een lijn over januari–december, het lopende jaar dik en in kleur, vorig jaar donkergrijs, oudere jaren licht; labels direct aan de lijnen, geen legenda; `mooiMax` voor nette assen;
- `Stippenrij`: beeswarm van alle gemeenten of buurten, met een NL-lijn en het eigen gebied in amber;
- `Rangorde`: gesorteerde balken;
- `Verschillen`: kleine veelvouden, één gemeente gemarkeerd over alle thema's.

**Wat het visueel sterk maakt:**
- de kop zegt wat je ziet;
- één grafiek per bevinding;
- directe labels;
- grijs voor context, kleur alleen voor het onderwerp;
- echte data in elke animatie. De puls-kaart speelt de nieuwste maand af in ~22 s: 14.678 buurtpunten, elke flits is ≈4.500 echte registraties, de teller eindigt precies op het NL-totaal. De eerlijkheidszin "tijdstip binnen de maand gespreid" is verplicht.
- "De typische inwoner": een oliepastelfiguur uit KWB-cijfers (`lib/persoon.ts`, motor `lib/character` uit averageperson.eu, seed = gebiedscode).
- Het maandverhaal "Wrapped" (`components/MaandVerhaal.tsx`): story-kaart, kleur volgt het oordeel, getallen tellen op, deeplink `#verhaal`.

**Design-tokens** in `app/globals.css` (`:root` + Tailwind 4 `@theme inline`):
- `--bg`, `--card`, `--line`, `--ink`/`-2`/`-3`;
- `--brand` blauw, `--accent` amber;
- semantisch: `--leven` (geboorten), `--nieuw` (verhuizingen);
- heat-ramp `--heat-0…6`;
- `--delta-up` rood / `--delta-down` groen (oordeel, niet richting);
- `--cat-1…5` + `--cat-other`, gevalideerd op kleurenblindheid;
- richting ook als teken (▲/▼), nooit alleen met kleur.
- Lettertypen: Inter Tight overal plus tabulaire cijfers (`.num`), via `next/font` (`lib/fonts.ts`). Iconen: Phosphor duotone.

**Animatie.** CSS-keyframes (shimmer-skeletons tegen verspringen, verhaal, decor), alles uit bij `prefers-reduced-motion`. `AnimatedNumber`, `LiveCounter`.

**Mobiel.** Het advies "fix mobiel eerst" (horizontale overloop 691 px op 390 px, `ADVIESRAPPORT_LLM.md` §3.1) leidde tot een hamburgermenu, `min-w-0`, scrollbare tabellen en `cooperativeGestures` op kaarten. Geen donker thema meer: de huisstijl ging van donker (Nachtkaart) naar licht na de feedback "te donker, te negatief".

**Design-proces.** Varianten naast elkaar op `/concepten` (vier richtingen, daarna A3/B3), ideation-pagina's als HTML (`docs/ideation/*.html`), een design-handoff-zip (`Homepage wireframe improvements.zip` → factcard-modules).

Feedback van Lucas die regel werd:
- geen gekleurde accentranden ("typische gen-AI-styling");
- geen kapitalen-kickers;
- geen pillenwolk, carrousel of oranje heatmap-blob ("AI-slop");
- geen em-dashes in metadata.

## 6. Website

- **Framework**: Next.js 16.2 (App Router, React 19, Tailwind 4), Neon serverless driver, Vercel (fra), Resend voor mail, Vercel Blob voor luchtfoto's en pilotdata. `AGENTS.md` waarschuwt: "This is NOT the Next.js you know", eerst `node_modules/next/dist/docs/` lezen.
- **Route groups**: `app/(site)`, `app/(kaart)`, `app/(pilot)`, `app/(toegang)`.
- **Paginastructuur**:
  - homepage (puls-kaart, "Deze maand in Nederland" met vier Bevindingen, "Hoe Nederland verschilt", "Verder lezen");
  - `/[gemeente]` en `/[gemeente]/[sub]` met nette slugs (`lib/slugs.ts`; `/gebied/[code]` doet een 308 daarheen);
  - themapagina's uit één config (`lib/themas.ts` + `ThemaPagina`: fietsendiefstal, woninginbraak …);
  - analysepagina's `/trends`, `/verbanden`, `/welvaart`, `/vergelijk`, `/kloof`, `/woonzoeker`, `/ranglijsten`;
  - uitleg `/indeling`, `/over` (met updates-log uit `lib/updates.ts`);
  - verborgen labs met een willekeurige slug en noindex (`/lab/coa-3m7p`, `/lab/ggz-8k2x`).
- **Gebiedspagina** (`components/nieuw/GebiedView2.tsx`): luchtfoto-hero → portret + ritme → maandverhaal → puls-kaart van de gemeente → "Zo staat X ervoor" (Stippenrijen tegen 342 gemeenten, of binnen de eigen gemeente) → "Alle cijfers".
- **Rendering**: ISR op aanvraag (`generateStaticParams` geeft `[]`, `revalidate = 86400`, bewust geen `searchParams`), API-routes met `s-maxage`.
- **SEO** (`lib/seo.ts`):
  - titels en beschrijvingen met echte cijfers;
  - title-template "%s | Staat van";
  - BreadcrumbList JSON-LD;
  - sitemap-index met delen van 10.000;
  - `robots.ts` sluit `/api/`, `/gebied/` (redirects), widgets en de bèta uit;
  - tegen orphan pages: A-Z-indexen (`/provincies`, `/gemeenten`, `/buurten/[letter]`) en een "In de omgeving"-blok.
- **Deelbaarheid**:
  - URL-state en `DeelKnop` (kopieert de link);
  - insluitbare **widgets** als losse HTML zonder JavaScript (`app/widget/[gemeente]` → `lib/widget-html.ts`: ~6 kB, CSS-only paginering, `force-static`);
  - `/widgets` als generator;
  - het maandverhaal met deeplink;
  - Buurtbericht (dubbele opt-in, HMAC-tokens, uitschrijven verwijdert het adres helemaal).
- **Meten**: GA4 via `next/script`.

## 7. Werkwijze en kennis

**Instructies.** `CLAUDE.md` is alleen `@AGENTS.md`. `AGENTS.md` bevat de Next-waarschuwing en de acht cijferregels. De echte kennis staat in:
- `ARCHITECTURE.md`: datamodel, identifiers, dataflow, grootte;
- `INZICHTEN.md`: databevindingen, interpretatiegrenzen, technische valkuilen, keuzes met hun reden, roadmap op impact en moeite, BI-visie, operationeel;
- `ADVIESRAPPORT_LLM.md`: overdrachtsadvies "voor de bouwende LLM", met prioriteiten en de zes vragen die elke pagina moet beantwoorden (wat valt op, veel of weinig voor dit type gebied, structureel of tijdelijk, wat verklaart het, hoe zeker, welke trendbreuk);
- `docs/raadsradar.md`, `zorgfinancien/README.md` en `onderzoek/README.md`: pijplijntabellen in de vorm "stap | commando | model | wat";
- het projectgeheugen (zeer uitgebreid, met valkuilen en ops-lessen).

**Backlog.** GitHub-issues (#1–#20, in sprints gesloten). Commitberichten noemen het issue.

**Agents en skills.** In de repo staan geen `.claude/`-skills of `skills-lock.json`. LLM-gebruik zit in de pijplijn zelf via `claude -p` met JSON-schema. In onderzoek zijn dat drie web-agents per aanbieder (online, toezicht, lokaal) en een parallelle extractie (`ONDERZOEK_PARALLEL=12`). Ideation-documenten (`docs/ideation`) lijken uit een ideation-skill te komen.

**Terugkerende valkuilen:**
- bron-API's die stil filters negeren of rijen opvullen;
- Bot Protection die de eigen scripts blokkeert;
- secrets die niet gelijk lopen tussen `.env`, GitHub en Vercel (sensitive vars zijn niet te pullen);
- cachekeys die niet zijn opgehoogd na een vormwijziging;
- de Neon-limiet van 64 MB per respons, `unstable_cache` boven 2 MB;
- de sitemap-bug (slug en code verwisseld: 343 kapotte URL's naar Google);
- "deze maand" terwijl de data 1–2 maanden achterloopt;
- zombie-`next-server` op een poort;
- op mobiel overloop door brede tabellen en grids zonder `min-w-0`;
- trendbreuken (maart 2021, dronkenschap vanaf juli 2012);
- kleine aantallen die "+300%" geven.

## 8. Het patroon: wat zich herhaalt en wat een skill kan worden

**De vaste keten** (elke nieuwe dataset doorliep hem):

1. **Bron verkennen en vastleggen.** Tabel-id, dimensies, eenheid, ritme, licentie, trendbreuken, API-eigenaardigheden. Meteen naar INZICHTEN/LEERPUNTEN.
2. **Sleutel kiezen.** Een officiële code als canonieke sleutel (CBS GM/WK/BU), de hiërarchie afleidbaar uit de code (`parseAreaCode`), de jaargang van de indeling erbij.
3. **ETL-script `NN-naam.mjs`.** Ophalen (retry, paginering, parallel, pauze) → normaliseren (trim, periode parsen, nullen weg) → `batchUpsert` (alleen wijzigingen) → `logRun`. Hervatbaar met een state-bestand; de vlag `…_VANAF=recent` voor maandelijks.
4. **Opslag in twee vormen.** Feitentabel (lang en smal, niet-nul) voor tellingen; EAV `area_stats` voor kenmerken. Een eigen tabel als de vorm afwijkt.
5. **Controle.** Sommen tussen niveaus, versheid, aantallen; exit 1 stopt de publicatie.
6. **Leeslaag.** Eén module met alle SQL, gecachet met een versie in de key en een tag; revalidate- en warm-route.
7. **Afleiden.** Per 1.000 (met drempel), tegen vorig jaar, seizoensnorm, anomalie met minimaal signaal, rang in plaats van percentiel, eerlijke benchmark (vergelijkbare gebieden, placebotoets).
8. **Duiden.** Sjablonen (Fact, Slide) volgens de acht cijferregels. Een LLM alleen met een feitenlijst, F-nummers en een automatische getalcontrole.
9. **Visualiseren** in de vaste grammatica (Bevinding + Jaarlijnen, Stippenrij, Rangorde, Verschillen, kaart).
10. **Publiceren.** ISR-pagina per entiteit met slug, SEO met echte cijfers, sitemap-delen, JSON-LD, A-Z-indexen, widget, deellink, updates-log.
11. **Automatiseren.** Cron na de publicatiedatum van de bron → ETL → controle → cache legen → opwarmen → mail.

**Wat eigenlijk sjablonen zijn:**
- `etl/lib.mjs` (fetchJson, fetchAllePaginas, batchUpsert, logRun, parse-helpers);
- `etl/schema.sql` (feit + EAV + runs);
- `etl/03-overlast.mjs` (hervatbare OData-lader);
- `etl/07-kerncijfers.mjs` (jaargangen met veldherkenning op titel);
- `scripts/check-data.mjs`;
- `.github/workflows/refresh.yml` en `warm.yml`;
- `app/api/revalidate/route.ts` + `scripts/warm.mjs`;
- het `cache(unstable_cache(…))`-patroon in `lib/data.ts`;
- `lib/format.ts` (nl-NL-getallen, `per1000` met drempel, `fmtMonth`, meervouden);
- `lib/facts.ts` (Fact-type en toon);
- `components/viz/*` (vijf vormen, kopieerbaar);
- het tokenblok in `app/globals.css`;
- `lib/seo.ts` (metadata met cijfers, sitemap-delen, breadcrumbs);
- `lib/widget-html.ts`;
- `lib/themas.ts` (één config → N pagina's);
- `lib/pilot/claude.ts` + het controleblok in `zorgfinancien/duiding.mjs` (LLM met schema en getalcontrole);
- de placebofunctie in `lib/coa.ts`.

**Voorstel voor skills:**
- **bron-verkennen**: checklist (licentie, robots, UA, ritme, publicatiedag, eenheid, trendbreuken, filters echt testen, nullen tellen, terugwerkende herziening) + sjabloon voor een bronnotitie.
- **etl-bouwen**: scaffold `etl/NN-*.mjs` op basis van `lib.mjs`, schema-sjabloon (feit/EAV/runs), regels (idempotent, alleen wijzigingen, hervatbaar, `_VANAF=recent`).
- **data-controleren**: generator voor `check-data` (versheid, som tussen niveaus, aantal, metrics) met exit-code.
- **duiden-zonder-verzinnen**: de acht cijferregels als checklist + Fact/Slide-typen + het LLM-protocol (feiten met F-nummers, JSON-schema, getalextractie, tolerantie, waarschuwing, letterlijke citaten).
- **eerlijk-vergelijken**: per 1.000 met drempel, seizoensnorm, anomaliedrempels, vergelijkbare gebieden zonder de uitkomst, placebotoets, trendbreukvoetnoten.
- **grafiek-grammatica**: de vijf componenten + tokens + regels (kop = bevinding, één grafiek, directe labels, grijs voor context, kleur = oordeel, teken naast kleur, reduced-motion, echte data in animaties).
- **datasite-publiceren**: ISR-entiteitspagina's, slugs, SEO met cijfers, sitemap-delen, robots, widget, deellink, updates-log, mobiele controle op 390 px.
- **maandelijkse-refresh**: workflow-sjabloon (cron na publicatie → ETL → check → revalidate → warm → mail) en de ops-valkuilen (bot protection-bypass, secrets gelijk houden).

**Uniek voor dit project.** De CBS-codehiërarchie en de herindeling via een full-refresh. De politie/CBS-OData-eigenaardigheden. De Nederlandse taalhulpjes. De puls-kaart en de pastelfiguren. De Raadsradar-pilot (Notubiz, Iv3, DigiMV).

**Algemeen bruikbaar.** De keten bron → idempotente ETL → controle → gecachte leeslaag → afleiden → sjabloonduiding → vaste grafiekgrammatica → ISR + SEO → cron. De cijferregels. "Model alleen waar lezen of oordeel nodig is, en elk getal terugzoeken." De placebotoets. De gewoonte om elke valkuil met datum vast te leggen in één kennisdocument.

**Aandachtspunt voor de skillset.** Neem de discipline van Bronwijzer erbij die hier ontbreekt: een eerlijke User-Agent overal (de pilot spooft nu een browser), robots.txt lezen en vastleggen, en echte tests (property-based op teksten over alle gebieden), niet alleen een plausibiliteitsscript.
