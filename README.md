# Databron

**Vind het in de Index, bouw het met Databron.**

Databron is een set skills voor Claude Code waarmee je van open-data-API's een goede dataset maakt: een dataset die klopt,
zichzelf ververst en bij elk getal zegt waar het vandaan komt, met grafieken en een site die je durft te delen.

De kennis komt van [Open Data Index](https://www.opendataindex.nl): welke bronnen er zijn, hoe je ze ophaalt, geteste
aanroepen en de valkuilen die andere bouwers vonden. De plugin koppelt de MCP-server van de Index vanzelf. Wat jij
onderweg leert, gaat terug naar de Index, zodat de volgende het niet opnieuw hoeft uit te zoeken.

## Installeren

```
/plugin marketplace add lucashuizinga/databron-skill
/plugin install databron@databron
```

Of met de skills los: `npx skills add lucashuizinga/databron-skill`.

Daarna in een lege map: `/databron ik wil laten zien …`, of `/databron-start`.

## De lus

| | Skill | Wat het oplevert |
|---|---|---|
| 0 | `databron-start` | de voorbeeldsite lokaal op je computer, zodat je ziet wat het wordt |
| 1 | `databron-vraag` | de kernvraag en de antwoordzin die uit de cijfers volgt |
| 2 | `databron-verken` | per bron een getest datacontract (robots, licentie, aanroep, valkuilen) |
| 3 | `databron-oogst` | ophalen met een waakhond die bij storing de laatste goede stand houdt |
| 4 | `databron-opslag` | de vaste indeling, als bestanden in git of in Neon/D1 |
| 5 | `databron-toets` | de controle vóór publicatie |
| 6 | `databron-reken` | afgeleide cijfers als pure, geteste functies |
| 7 | `databron-duid` | tekst uit cijfers, met vaste regels |
| 8 | `databron-ontwerp` | een kort gesprek over toon, beeld en interactie, vastgelegd in `ontwerp.md` |
| 9 | `databron-beeld` | grafieken met de eigen engine en de Databron-smaak |
| 10 | `databron-site` | een afgemaakte site: server-first, favicon, OG, sitemap, JSON-LD, llms.txt |
| 11 | `databron-live` | pas na jouw ja: GitHub en hosting op Vercel of Cloudflare |
| 12 | `databron-ververs` | een GitHub Action die ophaalt, toetst en publiceert |
| 13 | `databron-deel` | gevonden, geciteerd en gebruikt: JSON-LD, lancering, meten, feed |
| ✓ | `databron-review` | zes reviewers die alleen melden wat ze kunnen aanwijzen |
| ✓ | `databron-leer` | lessen in `docs/lessen/`, terug naar de Index met `meld_les`, en jouw feedback met `meld_feedback` |

Alles gebeurt eerst lokaal. Online zetten komt pas als je de site gezien hebt en ja zegt.

`/databron` is de dirigent: hij kijkt waar een project staat en roept de volgende stap aan.

## Het sjabloon

`sjabloon/` is een complete, kleine Next.js-site op trede 1 (bestanden, geen database), met een echte voorbeeldbron
(KNMI De Bilt: "Is het dit jaar warmer dan normaal?"), de grafische engine, de toets en de workflows. Een nieuw project:

```
node scripts/nieuw.mjs ~/code/mijn-project
```

## De MCP-server van Open Data Index

`https://www.opendataindex.nl/api/mcp` (openbaar, geen sleutel). Functies die Databron gebruikt: `zoek_bron`,
`geef_bron`, `geef_lessen`, `lijst_projecten`, `geef_project`, `zoek_datasets`, `status` en `meld_les`.

## Onderhoud

`node scripts/check-skills.mjs` controleert de frontmatter en of alle verwijzingen in de skills bestaan.

## Licentie

MIT, zie [LICENSE](LICENSE). De voorbeelddata in het sjabloon komen van het KNMI (CC BY 4.0); elke bron die je met
Databron gebruikt, houdt zijn eigen licentie.
