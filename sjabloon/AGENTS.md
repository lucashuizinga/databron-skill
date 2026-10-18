# Regels voor agents in dit project

Dit is een Databron-project op trede 1: bestanden in plaats van een database. Een GitHub Action haalt elke ochtend
de data op, toetst ze en commit de nieuwe stand; de site is statisch en leest alleen `data/`.

## Next.js 16

Dit is niet de Next.js uit je trainingsdata. API's, conventies en bestandsindeling kunnen anders zijn. Lees de gids in
`node_modules/next/dist/docs/` voordat je iets gebruikt wat je niet al in deze code ziet, en let op meldingen over
verouderde functies. Bekend in dit project:
- `params` is een Promise; gebruik de globale typen `PageProps<"/pad">`, `LayoutProps<"/">`, `RouteContext<"/pad">`.
- Een GET-route is niet statisch tenzij je `export const dynamic = "force-static"` zet (zie `app/llms.txt/route.ts`).
- `tsc` kent die globale typen pas na `next typegen`; daarom doet `pnpm typecheck` dat eerst.

## Draaien, toetsen, bouwen

```
pnpm install
pnpm oogst        # data ophalen naar data/ (dagelijks: de laatste twee jaar; --volledig: alles)
pnpm toets        # de poort: schrijft toets/rapport.md, exit 1 bij een fout
pnpm test         # node --test op tests/*.test.ts
pnpm typecheck
pnpm dev          # http://localhost:3481
pnpm build
```

Poort 3481. Stop je server op poortnummer (`lsof -ti tcp:3481 | xargs kill`), nooit met `pkill`.
Scripts in `oogst/` en `toets/` zijn TypeScript die Node direct draait: imports met de extensie `.ts`, en alleen
syntaxis die Node kan weglaten (geen `enum`, geen parameter-properties; `erasableSyntaxOnly` staat aan).

## Waar alles staat

| Wat | Waar |
|---|---|
| De vraag, de antwoordzin, de claimladder | `vraag.md` |
| Waar het project staat | `STAND.md` (bijwerken na elke sessie) |
| Bronnen en hun afspraken | `bronnen.yaml`, `bronnen/<id>.md` |
| Ophalen | `oogst/<bron>.ts` (IO), `oogst/<bron>-parse.ts` (puur), `oogst/draai.ts` (veilig, waakhond) |
| Data | `data/maten.json`, `data/entiteiten.json`, `data/waarnemingen/<maat>.json`, `data/run.json` |
| Rekenen | `lib/reken.ts`: één afleidfunctie `leidAf()` voor pagina, deelbeeld, llms.txt en toets |
| Tekst uit cijfers | `lib/duid.ts` |
| Grafieken | `lib/beeld/vorm.ts` (laag 1, puur), `components/beeld/` (laag 2 en 3) |
| Lessen | `docs/lessen/` (lees ze vóór je aan een bron of grafiek werkt) |

## De denkwijze

1. Eén vraag, één antwoordzin die uit de cijfers volgt.
2. De bron is de baas. Eerst echt aanroepen en de structuur lezen, dan bouwen. Elke eigenaardigheid met datum
   opschrijven in `bronnen/<id>.md` of als les.
3. Niets verzinnen. Ontbrekend is leeg (`null`), nooit 0. Een model maakt geen getal.
4. Historie is de waarde. Nooit inkorten: `voegSamen()` gooit niets weg, de toets faalt als rijen verdwijnen.
5. Eén rekenregel, overal. Een getal op de pagina komt uit `leidAf()`, niet uit een losse berekening in een component.
6. Een poort vóór publicatie. Faalt de toets, dan wordt er niets gecommit en blijft de laatste goede stand staan.
7. Tekst uit cijfers, met regels (hieronder).
8. Eén grafiek per bevinding. De kop is de bevinding, als zin.
9. Herkomst bij elk getal: bron, peildatum en een link naar de exacte aanroep, op de pagina én in de data.
10. Kennis groeit mee: wat je leert, wordt een les in `docs/lessen/`.

## De cijferregels

- Onderwerp vooraan: "2026 is 1,3 graden warmer", niet "Er is sprake van een stijging".
- Altijd eenheid en peilperiode. Een getal zonder eenheid of jaar staat er niet.
- Nooit "nu", "vandaag" of "deze maand": de datum van de laatste meting ("tot en met 16 oktober").
- Voorlopige cijfers benoemen.
- Percentages vergelijk je in procentpunten. Grote groei als "9,6 keer zo veel", niet "860% meer".
- Mediaan is "doorsnee", gemiddelde is "gemiddeld".
- Nederlandse notatie: 1.234,5 en een vaste spatie tussen getal en eenheid (`temperatuur()` en `graden()` doen dat).
- De voorleestest: lees de zin hardop. Klinkt hij als een mens, dan is hij goed.
- `tests/duid.test.ts` draait de zinnen over veel uitkomsten en vindt NaN, undefined, lege plekken en "nu".

## De bron aanroepen

- Eerlijke user-agent met contact (`oogst/knmi.ts`: `USER_AGENT`). Nooit een browser nadoen.
- Lees robots.txt en de voorwaarden, ook voor API-paden, en schrijf de afweging met datum in `bronnen.yaml`.
- Een 403 of een verbod in robots.txt respecteer je. Niet omzeilen.
- Node `fetch` stuurt `Accept-Language: *`; sommige servers weigeren dat. Zet zelf `nl, en;q=0.8`.
- Een fout kan met HTTP 200 komen. Controleer altijd de inhoud (de parser weigert alles wat geen lijst is).
- Vraag lange reeksen in stukken op, met een pauze ertussen, en respecteer `Retry-After`.

## De smaak

De regels voor interface en grafieken staan in de Databron-plugin: `skills/databron-beeld/references/smaak.md`.
Kort: licht thema van papier en inkt, één accent (`--onderwerp`) alleen voor wat leeft, structuur met witruimte,
labels aan de lijn, grijs voor context, Nederlandse notatie, mobiel eerst (390 px zonder zijwaartse overloop).
Niet: kickers in hoofdletters, gekleurde accentranden, alles in kaartjes met schaduw, dashboardtaal, `tabular-nums`
met Schibsted Grotesk, Tailwind-standaardlook. Kleuren alleen via de tokens in `app/globals.css` (en dezelfde
waarden in `lib/beeld/tokens.ts` voor het deelbeeld).

Elke grafiek: `role="img"` met een `aria-label` die de kernzin bevat, en de bron eronder.
Een grafiek is pas af na een schermafbeelding op 390 en 1280 px, licht en donker.

## Lessen

Lees `docs/lessen/` voordat je aan een bron, de oogst of een grafiek werkt. Kom je iets tegen wat de volgende moet
weten (een stil filter, een fout met HTTP 200, een grafiekvalkuil), schrijf het op als les: één bestand per les,
in het formaat van `docs/lessen/README.md`.
