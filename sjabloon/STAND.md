# Stand van het project

Bijgewerkt op 18 oktober 2026.

## Wat er is

- **Een werkende site op trede 1** (bestanden, geen database) met een echte voorbeeldbron: de daggemiddelde
  temperatuur in De Bilt van het KNMI, van 1 januari 1951 tot en met 16 oktober 2026 (27.683 dagen, geen lege dagen).
- **Het antwoord**: "Ja: 2026 is tot en met 16 oktober 1,3 graden warmer dan het gemiddelde van 1991–2020 over
  dezelfde dagen." Geen enkel jaar sinds 1951 was over dezelfde dagen zo warm (13,0 °C tegen 11,6 °C normaal).
- **Pagina's**: de antwoordpagina met twee grafieken (jaarlijnen en jaarstaven), de methode met de exacte aanroep, een
  pagina met alle grafiekvormen, het deelbeeld, `llms.txt`, de sitemap en de data als JSON op `/data/tg`.
- **De keten**: ophalen met een waakhond, een toets vóór publicatie, en een GitHub Action die elke ochtend ophaalt,
  toetst en de nieuwe stand commit.
- **Getest**: 22 tests (parser, rekenregels met een met de hand gecontroleerd getal, alle zinnen over veel uitkomsten,
  de grafiekvormen, de waakhond). Een nagebootste storing (leeg, korter, gaten, geen antwoord) laat de laatste goede
  stand staan.

## De volgende stap

1. Zet de repo op GitHub en koppel hem aan Vercel (zie README, "Publiceren"). De map `data/` gaat mee, dus de eerste
   deploy toont al de grafiek.
2. Start de oogst één keer met de hand in GitHub Actions en kijk of hij groen is en commit.
3. Kies je eigen vraag en bron: `/databron` begint bij `vraag.md` en vervangt de KNMI-bron stap voor stap.

## Open beslispunten

- **Hoe lang heet een dag voorlopig?** Het KNMI zegt niet per dag of hij gecontroleerd is. Wij nemen 30 dagen
  (`VOORLOPIG_DAGEN` in `oogst/draai.ts`). Langer of korter mag, als het in `bronnen/knmi-daggegevens.md` staat.
- **Elke dag een commit**: `data/run.json` verandert bij elke run, dus er komt elke dag een commit (en een deploy),
  ook als het KNMI niets nieuws had. Dat houdt de geplande workflow wakker; wil je minder deploys, laat run.json dan
  alleen meegaan als de data veranderden.
- **Cloudflare** is klaargezet maar niet gedeployed.
