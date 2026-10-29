---
name: databron-opslag
description: Kies en bouw de opslag van een Databron-project in de vaste indeling (bron, run, versie, entiteit, maat, waarneming) - als bestanden in git (trede 1) of in Postgres/Neon of Cloudflare D1 via Drizzle (trede 2 en 3) - met historie, versies, back-up en herstel. Gebruik dit bij het opzetten van de data, bij groei naar een database, of bij vragen over het schema.
argument-hint: "[trede 1|2|3]"
---

# Databron: opslag

Doel: de juiste opslag voor de vorm van de data, **zonder ooit historie weg te gooien**, in een indeling die elk
Databron-project deelt. Wie er één kent, kent ze allemaal.

## Welke trede?

| Trede | Wanneer | Waar |
|---|---|---|
| **1. Bestanden** | tot een paar MB, vooraf te renderen, één of weinig bronnen | `data/` in git; git is de historie |
| **2. Database** | veel entiteiten, zoeken, revisies volgen, meer dan ~20 MB | Neon (Vercel) of D1/Neon (Cloudflare) + objectopslag voor ruw |
| **3. Live** | dagelijks of vaker, API of MCP voor anderen | als 2, plus versies met een publicatiepoort |

Ga pas een trede omhoog als het project erom vraagt, en zeg de gebruiker waarom.

## De indeling

Lees `references/schema.md` (de zes tabellen en de regels) en kopieer `templates/schema.ts` (Drizzle, Postgres) naar
`db/schema.ts` bij trede 2. Op trede 1 is het dezelfde vorm als bestanden: `data/maten.json`,
`data/entiteiten.json`, `data/waarnemingen/<maat>.json` (met `versie` en `checksum`), `data/run.json`.

## Vaste regels

- **Nooit inkorten.** Geen `slice(-N)` op archief of reeksen. Een kleine "warme kopie" voor de site mag, naast het archief.
- **Nooit overschrijven.** Een revisie van de bron wordt een nieuwe versie; de view `actueel` (of de nieuwste versie
  in het bestand) geeft de geldende waarde.
- **Strikt lezen vóór een merge**: een mislukte read is geen lege lijst. Faalt het lezen, dan schrijf je niet.
- **Alleen echt gewijzigde rijen schrijven** (Postgres: `on conflict … do update … where (…) is distinct from excluded`).
- **Elke run gelogd** (`run`: begon, klaar, status, nieuw, gewijzigd, fouten).
- **Officiële codes als sleutel** (CBS `GM0363`, NUTS, ISO), met de jaargang van de indeling.
- **Migraties in git** (`drizzle-kit generate`), uitgevoerd in CI vóór de deploy; nooit `drizzle-kit push` op productie.
- **Back-up met een herstelscript dat je hebt geprobeerd.** Trede 1: git is de back-up. Trede 2: dagelijkse export naar
  objectopslag (Blob of R2), plus `scripts/herstel.mjs`.

## Van trede 1 naar 2

1. Database aanmaken: Vercel → `vercel integration add neon` (de env-variabelen komen vanzelf); Cloudflare →
   `npx wrangler d1 create <naam>` of Neon met Hyperdrive. Laat de gebruiker inloggen; noem wat het kost.
2. `db/schema.ts` uit het sjabloon, `pnpm add drizzle-orm @neondatabase/serverless` en `pnpm add -D drizzle-kit`,
   `drizzle-kit generate`, migreren.
3. `scripts/importeer.mjs`: de bestanden uit `data/` in de tabellen (idempotent).
4. `lib/data.ts` leest voortaan uit de database met cache; de pagina's veranderen niet.
5. De oogst schrijft naar de database in plaats van naar `data/`.

## Poort

Trede 1: `git log -p data/` laat de wijzigingen per run zien en `data/` klopt met de checksums. Trede 2: herstel uit de
back-up in een lege database (of een Neon-branch) geeft op de site dezelfde cijfers; draai die proef echt.
