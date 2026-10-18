---
name: databron-site
description: Publiceer een Databron-project als site die mensen, zoekmachines en AI-assistenten goed lezen - server-first, een pagina per entiteit, metadata met echte cijfers, een OG-beeld per pagina, JSON-LD Dataset, sitemap, bronnenpagina met de exacte aanroepen, llms.txt en Markdown, bytebudget en smoke-test. Werkt op Vercel en Cloudflare. Gebruik dit vóór elke publicatie en bij vragen over SEO, delen of hosting.
---

# Databron: de site

Doel: een site die je durft te delen, die zonder JavaScript leesbaar is, en die op Vercel én Cloudflare draait.

## Checklist

1. **Server-first.** Koppen, cijfers, tabellen en de antwoordzin staan in de HTML. Controle:
   `curl -s <url> | grep "<deel van de antwoordzin>"`. Alleen kaarten, canvas en 3D mogen client-only.
2. **Kleine client-onderdelen.** Alles wat een client-component als prop krijgt, staat ook in de RSC-payload. Geef
   lichte data mee; haal grote lijsten op bij gebruik.
3. **Een pagina per entiteit** bij atlas en audit (op aanvraag gebouwd en bewaard), met nette slugs, en A-Z-indexen
   zodat geen pagina zonder inkomende link staat.
4. **Metadata met echte cijfers**: titel en beschrijving uit de data ("De Bilt was in 2026 1,4 graad warmer dan
   normaal"), canonical, hreflang bij meer talen.
5. **OG-beeld per pagina** (`opengraph-image.tsx`) met dezelfde antwoordzin en vorm-functie; zonder SVG-filters.
   Verander je het ontwerp, verander dan ook het adres (versienummer), anders blijft de oude in caches staan.
   In Satori is elke span een flex-item: zet een zin als één tekst in één element, en bekijk het beeld als PNG.
6. **JSON-LD `Dataset`** met naam, beschrijving, licentie, bron, periode en de download-URL.
7. **Sitemap uit de code** (`app/sitemap.ts`) en `app/robots.ts`. Een nieuwe soort pagina = ook in de sitemap.
8. **Methode en bronnen**: een pagina die zegt hoe elk cijfer berekend is, met de exacte aanroepen, de licenties en de
   peildatum. Een correctiekanaal (issue-sjabloon "Fout in een cijfer").
9. **Voor AI-assistenten**: `llms.txt` (vraag, antwoord, bronnen, data-adressen), de data als JSON-download, en de
   vermelding in Open Data Index (een bouwproject of een bron) zodat assistenten het vinden via de MCP-server.
10. **Bytebudget**: meet HTML en JavaScript per route na de build en zet een grens (bijvoorbeeld 200 kB HTML voor een
    entiteitpagina). Groeit het, zoek wat er in de payload sluipt.
11. **Verhuisbaar** (`databron-start/references/hosting.md`): alleen webstandaarden in sitecode, geen `fs` tijdens het
    draaien, configuratie via env. Bouw eens voor het andere platform.
12. **Smoke-test na de deploy**: de productie-URL antwoordt, de antwoordzin staat erin, `/sitemap.xml`, `/llms.txt` en
    het OG-beeld geven 200.

## Poort

`pnpm build && pnpm start` draait zonder fouten in de browserconsole; de curl-test vindt de antwoordzin; sitemap,
llms.txt en OG-beeld geven 200; schermafbeeldingen op 390 px tonen geen overloop.
