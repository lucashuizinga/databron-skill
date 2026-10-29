---
name: databron-verken
description: Verken een databron voordat je er code tegen schrijft - eerst wat Open Data Index weet (geef_bron, geef_lessen), dan robots.txt en licentie, een proefaanroep zonder filters, elk filter testen, nullen, revisies en publicatiedag. Schrijft een datacontract per bron. Gebruik dit voor elke nieuwe bron of API in een Databron-project.
argument-hint: "[bron-id uit de Index, of de URL van een API]"
---

# Databron: een bron verkennen

Doel: van "er is een API" naar een **getest datacontract**. De bron is de baas: eerst echt aanroepen en de structuur
lezen, dan pas bouwen.

## Stappen

1. **Wat weet de Index?** `geef_bron(<id>)` (inhoud, API, valkuilen, voorbeeldcode) en `geef_lessen(<id>)` (wat
   andere bouwers tegenkwamen, de geteste aanroep, lessen voor het platform). Niet in de Index: `zoek_datasets` met het
   onderwerp; anders zoek je zelf. Noem wat de Index al wist: dat scheelt de gebruiker werk.
2. **robots.txt en voorwaarden.** Lees `/robots.txt` van de host, ook voor de API-paden, en de gebruiksvoorwaarden of
   licentie. Schrijf de afweging op met datum. Een `Disallow` op het pad of een 403 respecteer je: geen omweg, geen
   andere user-agent. Twijfel (zoals `Disallow: /api/` bij een open overheidsportaal) is een beslispunt voor de
   gebruiker, met jouw advies.
3. **Eerlijke user-agent** met contact (`<project>/0.1 (+<site of e-mail>)`) en `Accept-Language: nl, en;q=0.8`
   (Node fetch stuurt anders `*`, en sommige API's weigeren dat).
4. **Eén proefaanroep zonder filters**, klein (één periode, één gebied). Lees de echte dimensies, codes, eenheden en
   veldnamen uit het antwoord. Raad nooit codes: "de 400's waren van ons".
5. **Elk filter testen met een telling**: geeft het filter minder rijen dan zonder? Stille filters zijn de duurste
   valkuil (CBS Feed past alleen het eerste predicaat toe; PDOK negeert `cql_filter`).
6. **Vorm van de data vaststellen**: worden nullen weggelaten? Zijn sleutels opgevuld met spaties? Wat betekent een lege
   waarde, -1 of -99997? Hoe zien voorlopige cijfers eruit, en worden oude periodes later bijgesteld? Op welke dag
   verschijnt nieuwe data, en hoeveel loopt hij achter?
7. **Grenzen**: limiet per aanroep, paginering, quotum, time-outs. Meet het, schrijf het op.
8. **Licentie en bronvermelding**, en wat níet mag (geen doorgeven aan derden, alleen niet-commercieel, logo niet
   gebruiken).
9. Schrijf `bronnen/<id>.md` volgens `templates/bron.md` en een regel in `bronnen.yaml`:
   `{ id, odi: <id in de Index of null>, rol: primair|meting|validatie|context, ritme, vertraging, licentie, robots: <afweging + datum> }`.
10. Ontdekte je iets dat niet in `geef_lessen` stond? Noteer het: `databron-leer` meldt het terug.

## Poort

Elke bron in `bronnen.yaml` heeft een geteste aanroep met datum en een kort voorbeeldantwoord in zijn contract, een
licentie en een robots-afweging. Een bron die niet mag of niet werkt, staat erin met de reden, niet stil weggelaten.
