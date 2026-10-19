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

Of vanaf een lokale kopie: `/plugin marketplace add ~/code/databron`.

Daarna in een lege map: `/databron ik wil laten zien …`, of `/databron-start`.

## De lus

| | Skill | Wat het oplevert |
|---|---|---|
| 0 | `databron-start` | een repo uit het sjabloon, op GitHub, live op Vercel of Cloudflare |
| 1 | `databron-vraag` | de kernvraag en de antwoordzin die uit de cijfers volgt |
| 2 | `databron-verken` | per bron een getest datacontract (robots, licentie, aanroep, valkuilen) |
| 3 | `databron-oogst` | ophalen met een waakhond die bij storing de laatste goede stand houdt |
| 4 | `databron-opslag` | de vaste indeling, als bestanden in git of in Neon/D1 |
| 5 | `databron-toets` | de poort vóór publicatie |
| 6 | `databron-reken` | afgeleide cijfers als pure, geteste functies |
| 7 | `databron-duid` | tekst uit cijfers, met vaste regels |
| 8 | `databron-beeld` | grafieken met de eigen engine en de Databron-smaak |
| 9 | `databron-site` | server-first, OG, sitemap, JSON-LD, llms.txt |
| 10 | `databron-ververs` | een GitHub Action die ophaalt, toetst en publiceert |
| 11 | `databron-deel` | gevonden, geciteerd en gebruikt: JSON-LD, lancering, meten, feed |
| ✓ | `databron-review` | zes reviewers die alleen melden wat ze kunnen aanwijzen |
| ✓ | `databron-leer` | lessen in `docs/lessen/` en terug naar de Index met `meld_les` |

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

## Achtergrond

- `docs/VOORSTEL.md`: het ontwerp van Databron (de lus, de poorten, de treden, het schema, de smaak).
- `docs/onderzoek/`: het onderzoek waar het op rust: de Compound Engineering-plugin van Every en vier eigen
  projecten (Gaspeil, gedoe, averageperson.eu, Stikstofindex), plus wat we overnamen uit de Compound-gids van Every,
  de Marketing Skills-collectie en de apple-design-skill (`bronnen-okt-2026.md`).

## Onderhoud

`node scripts/check-skills.mjs` controleert de frontmatter en of alle verwijzingen in de skills bestaan.

## Licentie

MIT, zie [LICENSE](LICENSE). De voorbeelddata in het sjabloon komen van het KNMI (CC BY 4.0); elke bron die je met
Databron gebruikt, houdt zijn eigen licentie.
