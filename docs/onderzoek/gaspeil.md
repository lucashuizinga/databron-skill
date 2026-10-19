# Onderzoek Gaspeil (gasvullen): hoe een goede dataset-site is opgebouwd

Alleen gelezen. Geen servers gestart, geen `.env*` geopend. Repo: `gasvullen` (270 commits, 21 mei tot 18 oktober 2026). Verwante repo: `gasveld` (10 commits).

## 1. Wat het is

**Gaspeil** (https://www.gaspeil.nl) volgt elke dag hoe vol de Nederlandse gasopslagen zijn, waar het gas vandaan komt en of we de winter doorkomen. De homepage stelt één vraag: *halen we het vuldoel?* (sinds 11 september 2026 64 %, daarvoor 74 %). Zie de docstring in `app/page.tsx`: "één vraag, één beeld (Nederland in doorsnede) en per hoofdstuk de kerncijfers". De grafieken en berekeningen staan uitgebreid op `/cijfers`.

Doelgroepen (`docs/data-science-roadmap.md`, geheugennotitie `project_marketing_strategie.md`): pers (FD, NRC, NOS), beleidsmedewerkers energie in de Tweede Kamer, onderzoekers (PBL, TNO) en geïnformeerde burgers. De positionering is "de onafhankelijke gasvoorraad-monitor van Nederland" en nooit "dashboard".

Het project groeide uit tot een kleine productfamilie:
- `/radar`: LNG-radar met tankers, lossingen en herkomst (MapLibre, AIS-collector op Fly.io);
- `/winter`: De Gaswinter in 3D, een spel in react-three-fiber dat start met de echte stand van vandaag;
- `/rekening`: calculator voor de gasrekening;
- `/simulator`, `/scenarios`, `/voorspelling-historie`, `/methodologie`, `/kijken` en `/documenten` (kennisbank);
- een publieke API (`/api/v1/*`, sleutels en limieten in Neon Postgres);
- een wekelijkse mail en een wekelijkse video.

## 2. Databronnen

| Bron | Code | Sleutel | Ritme |
|---|---|---|---|
| GIE AGSI+ (opslag NL, per opslag, EU-landen) | `lib/agsi.ts`, docs `docs/agsi-api.md` | ja (`x-key`) | sync 3x per dag |
| GIE ALSI+ (LNG-terminals Gate, EemsEnergy) | `lib/alsi.ts`, `lib/lng-arrivals.ts` | ja, naamsvermelding verplicht | dagelijks + uurcron |
| NED.nl (verbruik, sectoren 53/54/55/56, verse opslagstand) | `lib/ned.ts`, `lib/ned-storage.ts`, `lib/ned-sectors-parse.ts`, `docs/ned-api.md` | ja | dagelijks |
| ENTSOG Transparency (stromen per buurland, per punt) | `lib/entsog-flows.ts` + `-parse.ts` | nee | dagelijks, 10 dagen herladen |
| KNMI De Bilt (graaddagen) | `lib/knmi.ts`, `lib/hdd.ts` | nee | backfill tot 1990, daarna 30 dagen top-up |
| Open-Meteo (weersverwachting 14 dagen) | `lib/weather-outlook.ts` | nee | dagelijks |
| Yahoo Finance (TTF, Henry Hub, EUR/USD) | `lib/ttf.ts`, `lib/markets.ts` | nee, "alleen indicatief" | per sync |
| Havenbedrijf Rotterdam, Groningen Seaports (pc-gsp.com) | `lib/port-rotterdam.ts`, `lib/port-eemshaven.ts` | nee | elk uur |
| aisstream.io (AIS-websocket) | `scripts/ais-collector.mjs`, `deploy/ais-collector/` | ja | continu |
| Global Fishing Watch (satelliet-AIS), US DOE (export per schip), CBS 86103NED | `lib/gfw.ts`, `lib/doe-lng.ts` | GFW ja | 6-uurlijks / maandelijks |
| NewsAPI, Wikipedia-paginaweergaven | `lib/news.ts`, `lib/wiki.ts` | NewsAPI ja | dagelijks |

**Ophalen.** Op Vercel draait alles als cron (`vercel.json`). `/api/sync` om 07:30, 11:00 en 15:00 UTC. Verder `lng-snapshot` elk uur, `lng-daily`, `lng-flows` en `lng-backup` dagelijks, `lng-satellite` elke zes uur, `weekly-email` en `debriefing` op maandag. De routes eisen `verifyCronAuth` (`lib/auth.ts`). Wat niet in een serverless functie past, draait ergens anders: de AIS-websocket als altijd-aan proces op Fly.io (`deploy/ais-collector/fly.toml`) en de scheepsrenders als nachtelijke GitHub Action die het resultaat commit (`.github/workflows/ship-visuals.yml`).

**Brongebruik en voorwaarden.** Per LNG-bron staan rol, ritme, vertraging en licentie in een register: `LNG_SOURCES` in `lib/lng-sources.ts`, met de rollen primair, meting, validatie en context. Afwegingen worden apart vastgelegd als HTML-memo, bijvoorbeeld `docs/reviews/2026-09-11-vesselfinder-afweging.html` ("hun site scrapen mag niet; vraag schriftelijk of we API-data publiek mogen tonen"). Het oordeel per kandidaatbron staat in een tabel in `docs/lng-vessel-tracking.md` (Rijkswaterstaat AIS "niet open, privacygevoelig", Kpler betaald, enzovoort). Over robots.txt staat in deze repo veel minder dan in bronwijzer.

**Foutafhandeling.** Er zijn drie lagen:
1. `safeRun(label, errors, fn)` in `lib/sync.ts`: een bron die faalt komt in `errors[]` terecht en de rest van de sync loopt door. Het resultaat (`SyncMeta`: tijd, duur, aantallen per sleutel, fouten) gaat naar `meta:last_sync`.
2. Een waakhond (`lib/lng-guard.ts`, pure functies) keurt verse data goed of af. Een reeks mag niet korter zijn dan de vorige goede stand, mag geen gat van meer dan 3 dagen hebben in het recente venster en mag niet meer dan 4 dagen oud zijn. Een feed met minder dan 30 % van de vorige bezoeken telt als storing, niet als rustige haven. Wordt verse data afgekeurd, dan gebruikt `lib/lng-safe-sources.ts` de *laatste goede stand* en meldt een `Degradation`.
3. Elke bron krijgt een gezondheidsrecord (`recordSourceHealth`: lastOkAt, lastErrorAt) zodat een stilgevallen bron zichtbaar wordt.

**Versheid.** `components/DataFreshness.tsx` toont de datadag en de sync-tijd ("3 uur geleden"). De kopcijfers noemen altijd de gasdag. Volgens `docs/data-science-roadmap.md` heet de site nooit "live" maar "dagelijks bijgewerkt", omdat AGSI 1 à 2 dagen achterloopt. Het hoofdcijfer komt van NED, dat verser is dan AGSI. De homepage, het OG-beeld en de mail rekenen bewust allemaal vanaf dezelfde stand ("anders spreekt de pagina zichzelf tegen", `app/page.tsx`).

## 3. Opslag

- **Upstash Redis (Vercel KV)** is de hoofdopslag (`lib/kv.ts`). Alle sleutels staan centraal in `KV_KEYS`, bijvoorbeeld `agsi:year:<jaar>` (bevroren historie, alleen via de handmatige `/api/sync/historical`), `agsi:current:<jaar>` (elke sync overschreven, zodat revisies meekomen), `ned:sector:<type>:<jaar>` en `ttf:daily:<jaar>` (append-only jaarbuckets).
- **Twee leesfuncties.** `kvGet` geeft `null` bij een fout. `kvGetStrict` gooit een fout, want "een mislukte read mag nooit als leeg gelden, anders overschrijft een merge de bestaande rijen". Bij merges op datum wint de nieuwste, en als een merge rijen zou verliezen wordt er niet geschreven.
- **Grote sleutels met versie** (`lib/lng-kv-versioned.ts`): een envelope `{v, updatedAt, data}` en compare-and-set via een Lua-EVAL, omdat Upstash REST geen WATCH/MULTI kent. Mutaties moeten idempotent zijn. In-memory fake voor de tests.
- **Archief.** `lng:archive:tracks:<dag>` en `lng:archive:ships:<dag>`, append-only en nooit gewist. Daarnaast een ingekorte "warme set" van 60 dagen voor de kaart. Regel van Lucas (`memory/feedback_nooit_data_verwijderen.md`): "historie is de waarde", geen `slice(-N)` op archiefdata.
- **Back-ups.** Dagelijks een JSON-dump van alle `lng:*`-sleutels naar Vercel Blob (`lib/lng-backup.ts`, SCAN, nooit KEYS), lokaal `pnpm backup` naar `backups/`, herstellen met `scripts/kv-restore.mjs`.
- **Neon Postgres** alleen voor API-accounts (`db/migrations/001_api_accounts.sql`): gebruikers, inlogtokens (alleen als SHA-256-hash), sessies, sleutels en het aanroeplog. Neon-skills staan in `skills-lock.json` en `.claude/skills/`.
- **Caching van de pagina's.** `unstable_cache` in shards (`lib/store.ts`: lopend jaar, opslagen, historie A/B …) vanwege de limiet van 2 MB per cache-item. Tag `dashboard` en ISR (`revalidate = 300` op de homepage). Na een sync volgen `revalidateTag` en `revalidatePath("/")`. Zonder KV haalt de site de data live bij de bron op (`source: "upstream-fallback"`).

## 4. Bewerking en validatie

**Afgeleide cijfers** (allemaal in `lib/`, deterministisch en uitlegbaar):
- massabalans: pijpleiding = verbruik + opslag-netto − LNG (`lib/supply.ts`), later gecontroleerd tegen de ENTSOG-meting (`compareWithMassBalance`);
- tempo en projectie naar het doel (`lib/analysis.ts`, `lib/tempo-parse.ts`), aanvoer nu (`lib/supply-now.ts`, `roundToTotal` zodat aandelen op precies 100 % uitkomen);
- prognose "wanneer is de tank leeg" met scenario's (`lib/forecast.ts`), HDD-regressie op KNMI (`lib/hdd.ts`, `lib/forecast-hdd.ts`), block-bootstrap Monte Carlo met P10/P50/P90 (`lib/monte-carlo.ts`), stresstests, en een Gas Stress Index van 0 tot 100 met z-scores tegen de basisperiode 2011-2020 (`lib/stress-index.ts`);
- LNG: lossing = sprong in de tankvoorraad, ladingschatting, herkomst gewogen naar lading (`lib/lng-cargo-detect.ts`, `lib/origin-share.ts`, `lib/lng-russia.ts`), omrekenfactoren op één plek met bron (`lib/lng-constants.ts`).

**Regels tegen verzonnen of misleidende cijfers:**
- **3-dagen-overslaanregel**: AGSI reviseert voorlopige data, dus lopende gemiddelden laten de laatste 3 dagen weg (`TEMPO_SKIP_LAST_DAYS` in `lib/analysis.ts`). Kanttekening: de constante staat nog drie keer los in `lib/facts.ts`, `lib/debrief.ts` en `lib/debriefing-report.ts`.
- **Anti-patronen** in `docs/data-science-roadmap.md`: geen black-box-modellen ("reproduceerbaar met pen en papier"), geen schijnprecisie ("eind februari", niet "27 februari 14:31"), geen causaliteit uit observatie, geen 2022/2023 in de basisperiode, geen "live" bij vertraagde data, en een vermelding van de beschikbare periode bij elke reeks.
- **Validatie-checklist per nieuwe metric** (zelfde document): formules in `docs/`, backtest met MAE/RMSE, een onzekerheidsmaat, beschikbare periode, beperkingen, privacy, reproduceerbaar voor een TNO-stagiair. `/voorspelling-historie` en `scripts/forecast-backfill.mts` laten zien wat eerdere prognoses zeiden, herberekend met dezelfde rekenregel.
- **Wat het model is, staat erbij.** `lib/forecast.ts` zet `headlineFrom` als het kopgetal uit de scenariomediaan komt. Uit het geheugen: "noem die datum nooit 'gemiddelde winter'". Het sterretje bij Rusland zegt "indicatie".
- **Beleidsfeiten met bron in code**: `lib/targets.ts` (vuldoelen met artikel, Kamerbrief en URL, plus `primaryTargetPctForYear`).

**Tests.** 31 bestanden, 188 tests met de ingebouwde Node-testrunner (`node --experimental-strip-types --test tests/*.test.ts`). Het vaste patroon: per bron een **fetcher** (`lib/entsog-flows.ts`, met KV en IO) en een **pure parser** (`lib/entsog-flows-parse.ts`: "geen KV, geen pad-aliassen, zodat dit los te testen is"). De tests leggen domeinregels vast, bijvoorbeeld dat VIP-punten niet meetellen (dubbeltelling), dat een merge niets wist en dat de invoer onaangetast blijft (`tests/entsog-flows-parse.test.ts`).

**Teksten uit cijfers.** Op drie niveaus:
1. *Volledig berekend*: de antwoordzin op de homepage ("Ja, als het tempo van de afgelopen week blijft"), de kop van het OG-beeld, het mailonderwerp (`subjectFor` in `app/api/cron/weekly-email/route.ts`), de debriefzin (`lib/debrief.ts`: netto TWh, procentpunten en tempo tegenover hetzelfde week-gemiddelde van eerdere jaren) en de feitenkaartjes (`lib/facts.ts`: kop, detail, waarde, toon, bron).
2. *Redactioneel met geldigheidsvenster*: `lib/weekly-note.ts` (notitie alleen zichtbaar tussen `from` en `until`, "zodat een vergeten notitie niet blijft hangen"), `lib/week-video.ts` (highlights, `publishedAt`, een week "nieuw"), `lib/updates.ts` ("wat is nieuw", in gewone taal).
3. *Het cijferblad van de video*: `video/week-42/BRIEF.md` noemt elk getal met bron, gasdag en de afwijking tussen bronnen ("NED zei halverwege de week gehaald, AGSI+ op 16 oktober").

Stijlregels uit het geheugen (`project_stijl_2026.md`): verschillen voluit in "procentpunt" (nooit "pp"), standen in %, harde spaties bij procenten, en minder gedachtestreepjes (commit 63fda1b).

## 5. Visualisatie

Er is geen één grafische engine. Per taak is een ander gereedschap gekozen:

| Laag | Techniek | Waar |
|---|---|---|
| Kerngrafieken (nieuwe stijl) | **eigen SVG in React**, geen bibliotheek | `components/site/FillChart.tsx`, `YearCompare.tsx`, `YearGrid.tsx`, `Sections.tsx`, `Chapters.tsx` |
| Oudere en diepere grafieken | Recharts (15 componenten) | `components/Charts.tsx`, `ForecastCard.tsx`, `MonteCarlo.tsx` … op `/cijfers` |
| Hero-beeld | **Canvas pixel-art** met de echte vulgraad | `components/site/PolderDiorama.tsx`, `diorama-layout.ts`, footer `components/art/PixelHarbor.tsx` |
| Kaarten | MapLibre GL (OpenFreeMap Positron) | `components/radar/RadarMap.tsx`, `ShipTrackMap.tsx` |
| 3D | three.js via react-three-fiber/drei | `components/gaswinter3d/*`, `components/simulator/scene/*` |
| Deelbeelden | `next/og` ImageResponse met Bricolage-letter | `app/og/{home,opslag,radar,debriefing,infographic}/[file]/route.tsx` |
| Video | Remotion (data-gedreven) en Diffusion Studio (weekvideo met stem) | `remotion/gas-storage/*`, `video/week-4x/` |

**Waarom het visueel sterk is** (af te lezen aan `FillChart.tsx`):
- Eén hoofdlijn in gasblauw, eerdere jaren grijs met het jaartal direct aan de lijn (geen legenda nodig).
- De bandbreedte sinds 2011 als zachte vlakte en het doel als stip, met het oude doel als lege stip ("was 74 %").
- Het actuele cijfer staat bij het eindpunt.
- Bij hover een verticale lijn met de waarden van alle jaren op die dag.
- `aria-label` met de kernzin. Op mobiel scrolt de grafiek horizontaal en opent hij rechts, bij vandaag (`dir="rtl"`).
- Eén tooltiplaag voor de hele site (`components/site/TipLayer.tsx`): elk element met `data-tip`, ook server-gerenderde SVG, krijgt een tooltip, en de tekst staat ook in de HTML.
- Het canvas is `aria-hidden` decoratie. De cijfers liggen er als HTML overheen (`PolderDiorama.tsx`: "zodat ze in de server-HTML zitten").

**Design-tokens** in `app/globals.css` (`:root` + Tailwind 4 `@theme inline`), thema `.theme-2026` "koude winterpolder": canvas #e6eef3, inkt #15202b, gasblauw #1f5fd1. Betekenis van de kleuren: "rood is eruit of te laag, groen is erbij of op koers, blauw is gas". Letters in `app/layout.tsx`: Bricolage Grotesque voor koppen en grote cijfers, Geist voor tekst, Silkscreen alleen in de pixelscènes.

**Animatie** is spaarzaam en houdt rekening met `prefers-reduced-motion` (`Feest.tsx`, `PolderDiorama.tsx`, `WeekVideo.tsx`, `PixelHarbor.tsx`). Er zit speelsheid op het juiste moment in: toen het vuldoel gehaald was kwamen er confetti en een feesthoedje op de ring dat eraf valt na zes klikken (commits ab4de1b, f4990f1, 09da655). Ook het OG-beeld werd dan feestelijk, met een nieuwe beeld-URL zodat platforms het opnieuw ophalen.

## 6. Website

- **Next.js 16** App Router, React 19, Tailwind 4, TypeScript, pnpm, Vercel.
- **Server-first**: `AGENTS.md` beschrijft "SSR-first: content moet crawlbaar zijn". Koppen, cijfers en tabellen staan in de HTML zonder JS. Geen primaire content via `useEffect`+`fetch`. `dynamic(..., {ssr:false})` alleen voor 3D, kaart en canvas, en dan met `noindex` of met SSR-tekst eromheen. Controle met `curl -s <url> | grep "<kernzin>"`.
- **Pagina's**: homepage (hoofdstukken Nederland/Europa/Vullen/Winter/De week), `/cijfers`, `/opslag/[slug]` per opslag en terminal, `/radar` met `/radar/schip/[imo]`, `/debriefing/[week]`, `/methodologie`, `/disclaimer`, `/over`, `/api-docs`, `/account`.
- **SEO**: `generateMetadata` die meebeweegt met de stand (titel "Vuldoel van 64% gehaald"), `app/sitemap.ts` met per opslag een OG-beeld en per schip met een lossing een pagina, `app/robots.ts`, JSON-LD (`lib/structured-data.ts`: Organization, WebSite, Dataset, ImageObject voor grafiekbeelden via `SharePngBlock`).
- **Taal**: alleen Nederlands (`lang="nl"`, `nl-NL`-getalnotatie overal).
- **Deelbaar**: dynamische OG-beelden, een deelbare radarlink en download (CSV/JSON via `/api/v1/lng/lossingen`), en een open API met codevoorbeelden (curl, JS, Python) en een testpaneel.
- **Bereik**: wekelijkse mail met dubbele opt-in, honeypot en rate limit (Resend, `@upstash/ratelimit`), automatische debriefing per week, `docs/marketingstrategie.md`, `docs/wikipedia-backlinks-plan.md`, `docs/analytics-tracking-plan.md` (GA4-events).
- **Video**: Remotion-compositie die zijn props uit de eigen API haalt (`scripts/write-infographic-props.mjs` → `/api/remotion/infographic-props`). Daarnaast een wekelijkse video per map `video/week-NN/` (BRIEF.md met cijfers en toon, voice-over via ElevenLabs, compositie in Diffusion Studio), geplaatst op de homepage (stil teaser-bestand, groot met geluid) en in de mail.

## 7. Werkwijze en kennis

- **CLAUDE.md** verwijst alleen naar AGENTS.md: Next 16 is anders dan je denkt (lees `node_modules/next/dist/docs/`), plus de SSR-regel. Kort en hard.
- **De meeste kennis zit in `docs/` per bron en per onderwerp**. `docs/lng-vessel-tracking.md` (635 regels) is een logboek met gedateerde secties: wat werkt, wat niet, bronnen met oordeel, bewaarbeleid, valkuilen ("ALSI: lege pagina's bij parallelle verzoeken").
- **Geheugen** (`~/.claude/projects/-Users-lucashuizinga-code-gasvullen/memory/`): feedback (niets verwijderen, stijlvoorkeuren, juiste git-branch) en projectnotities met "Why / How to apply" en verificatierecepten. Een voorbeeld: MapLibre en WebGL headless vastleggen met Chrome CDP en swiftshader.
- **Plannen** in compound-engineering-formaat (`docs/plans/2026-09-12-001-feat-…-plan.md`, `artifact_contract: ce-unified-plan/v1`), gekoppeld aan GitHub-issues (#22, #35). Elk plan begint met *echte API-calls als onderzoek* en legt bevindingen vast (welke ENTSOG-punten data hebben, waarom VIP's dubbel tellen) voordat er code komt.
- **Afwegingen en reviews** als HTML in `docs/reviews/`, ideation in `docs/ideation/`, en een briefing voor de 3D-simulator (`docs/briefing-3d-simulator.md`: "wat waar moet zijn, niet onderhandelbaar" en "wat we bewust vereenvoudigen").
- **Parallelle agents** in git-worktrees (`.claude/worktrees/agent-*`, merges "worktree-agent-…"), elk met één issue.
- **De terugblik** `docs/debriefing-franklin.md` beschrijft de methode: start met een MVP-prompt van één alinea, geef domeinkennis en geen implementatie-aanwijzingen, één feature per commit met een scherpe message, `tsc` en build voor elke commit, en controleer visueel werk zelf. Dat het tempocijfer niet klopte met de aanvoermix leidde tot de 3-dagenregel. De 2 MB-limiet leidde tot de shards.
- **Terugkerende valkuilen**: revisies in voorlopige data; bronnen die van elkaar afwijken (NED tegenover AGSI, en dan expliciet zeggen welke); framework-eigenaardigheden (unstable_cache van 2 MB, `revalidateTag` met een nieuwe signatuur, stylesheet-volgorde die de kaart 0 px hoog maakte); een halve respons die cijfers stil halveert; een collector die op een dode socket bleef hangen (waakhond, commit 4af9391); oude AIS-posities die als live werden getoond (9397a9d); data die per ongeluk werd afgekapt.

**Gasveld.nl.** `gasvullen/gasveld.nl/` bevat de briefings en het bouwpakket (zip) die vanuit Gaspeil voor het tweede product zijn geschreven. `gasveld` is dat product: een campagnesite over het dichten van het Groningenveld, gebouwd door een andere agent (branches `codex/…`) op basis van dat pakket. Gasveld voegt het strengste herkomstmodel toe:
- gedateerde **releases** met een `source-manifest.json` (URL, aantal, primaire sleutel, sha256, ophaaltijd, CRS);
- fetchers die een diff maken op id en hash (`scripts/fetch-knmi.mjs`);
- een **claimregister** met de niveaus A tot X, waarbij X technisch niet te publiceren is (`lib/content/claims.ts`);
- een voorzichtige statusvertaling met een kanttekening per status (`lib/status.ts`);
- een adapter seed/database met dezelfde vorm;
- regels voor de wekelijkse pipeline (`docs/BRIEFING.md` §11-12: lock, herhaalpogingen, review bij meer dan 5 % verschil, "een verdwenen record is een onderzoekspunt", "een taalmodel mag helpen extraheren maar nooit direct als feit publiceren");
- Playwright-acceptatietests op 375 tot 2560 px;
- eigen SVG-grafieken zonder chart-bibliotheek.

## 8. Het patroon: wat je als skills kunt vastleggen

### Stappen die steeds terugkomen

1. **Kernvraag en publiek eerst.** Eén vraag die de homepage beantwoordt ("halen we het vuldoel?"), een antwoordzin die uit de cijfers volgt, en een positionering. Pas dan bronnen zoeken.
2. **Bronnen verkennen met echte aanroepen** en de bevindingen in een brondoc zetten: endpoints, sleutel, limieten, revisiegedrag, vertraging, licentie, wat niet werkt. Daarbij een bronnenregister met rol, ritme, vertraging en licentie (`LNG_SOURCES`).
3. **Per bron twee bestanden**: `<bron>.ts` (fetch, paginering, time-outs, KV) en `<bron>-parse.ts` (pure normalisatie, merge, controles) met `tests/<bron>-parse.test.ts`.
4. **Opslagcontract**: sleutelregister op één plek, jaarbuckets, append-only met merge op datum, strikt lezen voor elke merge, nooit inkorten (alleen een warme kopie), versie-envelope met CAS voor gedeelde sleutels, dagelijkse back-up met een herstelscript.
5. **Sync-orkestratie**: `safeRun` per bron, metadata met aantallen en fouten, cron-auth, tijdbudget per run (backfill in stukken, "de rest komt morgen"), en na afloop de pagina's verversen.
6. **Waakhond en laatste goede stand**: completeness- en versheidscontrole voordat verse data de oude vervangt. Een terugval wordt in de UI gemeld, plus een gezondheidsrecord per bron.
7. **Afgeleide cijfers als pure functies** met een vaste rekenregel die overal hergebruikt wordt (kopgetal, OG-beeld, mail en snapshot-historie rekenen hetzelfde), een revisievenster, een basisperiode zonder crisisjaren, en een onzekerheidsmaat.
8. **Teksten uit cijfers**: zinnen berekenen met drempels (op koers, krap, nee), notatieregels (nl-NL, procentpunt, `roundToTotal`), redactionele notities met een geldigheidsvenster, en een cijferblad met bron per getal voor video en mail.
9. **Visualisatie**: eigen SVG voor de hoofdgrafiek (direct label, context in grijs, bandbreedte, doelstip, hover-lijn, aria-label, mobiel scrollend vanaf vandaag), canvas of 3D alleen als decoratie of spel met HTML-cijfers erop, tokens met betekeniskleuren, rekening houden met reduced motion.
10. **Publiceren**: server-first, crawlbaar, metadata die meebeweegt, dynamische OG-beelden, JSON-LD Dataset, sitemap met detailpagina's, methodologie- en disclaimerpagina, open API en download.
11. **Distributie**: weekmail, debriefing, weekvideo met brief, "wat is nieuw".
12. **Verifiëren**: tests, `tsc` en build, een no-JS curl op de kernzin, headless screenshots (ook WebGL), en spot-checks tegen de ruwe API.
13. **Kennis bijhouden**: brondoc met gedateerde secties, geheugen met Why/How, een plan per issue, een afwegingsmemo per lastige keuze.

### Wat eigenlijk al een sjabloon is

- `lib/kv.ts` (kvGet, kvGetStrict, kvSet, KV_KEYS), `lib/lng-kv-versioned.ts` (envelope + CAS), `lib/lng-backup.ts` met `scripts/kv-backup.mjs` en `kv-restore.mjs`.
- `safeRun` + `SyncMeta` + `app/api/sync/route.ts` (auth, uitvoeren, revalidate).
- `lib/lng-guard.ts` + `lib/lng-safe-sources.ts` + `lib/lng-sources.ts` (validatie, laatste goede stand, gezondheid en register).
- Het paar `*-parse.ts` / `*.test.ts` met Node `--test` en `--experimental-strip-types`.
- `components/site/FillChart.tsx` als referentie voor een "jaar tegenover eerdere jaren"-grafiek, en `TipLayer.tsx` met `data-tip`.
- De OG-route met ImageResponse en Google Font, `lib/structured-data.ts`, `app/sitemap.ts`.
- `lib/weekly-note.ts`, `lib/week-video.ts`, `lib/updates.ts` (redactie als getypte data).
- `docs/data-science-roadmap.md` §anti-patronen + validatie-checklist; `docs/debriefing-franklin.md` als werkwijze.
- Van Gasveld: `source-manifest.json`, de fetcher met hash-diff, het claimregister en de statusvertaling met kanttekeningen.

### Voorstel voor skills

- **dataset-bron-verkennen**: checklist (robots en voorwaarden, sleutel, limieten, paginering, revisies, vertraging, licentie, voorbeeldrespons) + template brondoc + registerregel.
- **dataset-ophalen**: scaffold fetcher/parser/test, safeRun-orkestratie, cron-route met auth en tijdbudget, waakhond met laatste goede stand.
- **dataset-opslaan**: sleutelregister, jaarbuckets append-only, strikt lezen, envelope/CAS, back-up en herstel, manifest met hash (Gasveld).
- **dataset-bewerken**: pure rekenregels, revisievenster, basisperiode, onzekerheid, backtest, validatie-checklist en anti-patronen, één bron van waarheid voor het kopcijfer.
- **dataset-teksten**: zinnen uit cijfers, notatieregels, claimniveaus, geldigheidsvensters, cijferblad met bron per getal.
- **dataset-grafiek**: grafiekvormen met regels (direct label, context grijs, band, doel, hover, aria, mobiel), tokens met betekeniskleur, SVG of canvas/3D-keuze, reduced motion.
- **dataset-publiceren**: SSR-first-controle, metadata, OG-route, JSON-LD Dataset, sitemap, methodologie, API en download, no-JS curl-test, screenshots.
- **dataset-distributie** (optioneel): weekmail, debrief, video-brief.

### Uniek aan Gaspeil, en wat algemeen is

**Uniek**:
- domeinlogica (gasdagen, vuldoelen per jaar, massabalans, VIP-dubbeltelling, LNG-lossingsdetectie, AIS-plausibiliteit);
- het verhaal rond één deadline;
- spel en 3D;
- pixel-diorama als merkbeeld;
- de altijd-aan AIS-collector;
- de scheepsrenders via Gemini.

**Algemeen**:
- kernvraag eerst;
- bronregister en brondoc;
- fetcher/parser-scheiding met tests;
- append-only met strikt lezen en back-up;
- waakhond met laatste goede stand;
- revisievenster;
- één rekenregel voor alle uitingen;
- teksten uit cijfers;
- eigen SVG-grafieken met vaste ontwerpregels;
- SSR-first met dynamische OG en JSON-LD;
- gedateerde kennisdocumenten;
- verifiëren met no-JS en screenshots.

**Zwakke plekken om in de skill beter te doen**:
- `toNumber` in `lib/agsi.ts` maakt van `null` een `0`, zodat een ontbrekende waarde een nul wordt;
- de 3-dagenconstante is gedupliceerd;
- `forecast:index` wordt toch ingekort tot 180 (`slice(-180)` in `lib/sync.ts`), wat botst met de regel om niets te verwijderen;
- herkomst per getal (hash, manifest) zit in Gasveld en niet in Gaspeil;
- robots.txt wordt in Gaspeil nauwelijks expliciet vastgelegd.
