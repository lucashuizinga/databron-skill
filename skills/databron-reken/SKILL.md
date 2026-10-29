---
name: databron-reken
description: Bouw de afgeleide cijfers van een Databron-project als pure, geteste functies op één plek - normaal en afwijking, per 1.000 inwoners met drempel, tempo en prognose met onzekerheid, eerlijke vergelijkingen. Eén rekenregel voor pagina, deelbeeld, mail en API. Gebruik dit als een cijfer op de site berekend wordt in plaats van letterlijk uit de bron komt.
---

# Databron: rekenen

Doel: elk afgeleid cijfer op **één plek** (`lib/reken.ts`), puur en getest, zodat de pagina, het OG-beeld, de mail en de
API nooit iets anders zeggen. Anders spreekt de pagina zichzelf tegen.

## Regels

- **Eén afleidfunctie** (bijvoorbeeld `afleiden(data) → { kop, reeksen, tabel }`) voedt zowel de toets als de site.
  Wat je controleert, is wat uitgaat.
- **Pure functies**: data erin, cijfers eruit. Geen netwerk, geen datum van vandaag binnen de functie (geef `peildatum`
  mee), geen `Math.random`.
- **Constanten één keer**: een revisievenster, een basisperiode of een omrekenfactor staat op één plek, met bron.
- **Revisievenster**: voorlopige periodes tellen niet mee in gemiddelden en tempo's, of alleen met een markering.
- **Per 1.000 inwoners alleen boven een drempel** (bijvoorbeeld 50 inwoners); daaronder `null` met reden.
- **Normaal**: een vaste basisperiode (KNMI 1991–2020), zonder crisisjaren als de vraag over "gewoon" gaat.
- **Vergelijken over dezelfde periode**: "tot en met 17 oktober" tegen hetzelfde stuk van eerdere jaren, niet tegen
  hele jaren.
- **Prognose alleen met onzekerheid** (bandbreedte, P10/P50/P90) en een backtest op eerdere jaren. Geen schijnprecisie:
  "eind februari", niet "27 februari 14:31".
- **Eerlijk vergelijken**: vergelijk met entiteiten die erop lijken zonder de uitkomstvariabele zelf te gebruiken; een
  "verband" alleen met een controle op toeval (placebotoets: dezelfde berekening op willekeurige entiteiten).
- **Afronden aan het eind**, en aandelen zo afronden dat ze samen precies 100 zijn.

## Tests

`tests/reken.test.ts` met minstens één getal per functie dat je **met de hand tegen de bron** hebt nagerekend (zet in
het testcommentaar hoe), plus randgevallen: lege reeks, één waarde, null in het midden, schrikkeldag, jaargrens.

## Poort

`pnpm test` slaagt, en elke functie in `lib/reken.ts` heeft een test met een met de hand gecontroleerd getal.
