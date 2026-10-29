# De vraag

## Kernvraag

Is het dit jaar warmer dan normaal in De Bilt?

## Antwoordzin

> {Ja|Nee}: {jaar} is tot en met {dag en maand van de laatste meting} {verschil} {graad|graden} {iets }{warmer|kouder}
> dan het gemiddelde van 1991–2020 over dezelfde dagen.

Bij een verschil van 0,0 graden: "{jaar} is tot en met {datum} even warm als het gemiddelde …".
Gemaakt door `antwoord()` in `lib/duid.ts`, uit `leidAf()` in `lib/reken.ts`.

Ingevuld op 18 oktober 2026: "Ja: 2026 is tot en met 16 oktober 1,3 graden warmer dan het gemiddelde van 1991–2020
over dezelfde dagen."

## Publiek

Iedereen die wil weten of het gevoel klopt dat het warm is geweest: lezers, journalisten, leraren. Geen
voorkennis van klimaatstatistiek nodig.

## Type

Monitor: één reeks per dag, één station, een vaste vergelijking (het normaal van 1991–2020).

## Claimladder

| We zeggen | Met kanttekening | Nooit |
|---|---|---|
| Hoeveel graden warmer of kouder dan normaal, over dezelfde kalenderdagen | Dat de laatste 30 dagen voorlopig zijn | Dat dit voor heel Nederland geldt |
| Op welke plek het jaar staat sinds 1951, over dezelfde dagen | "Iets warmer" bij minder dan een halve graad | Hoe warm het hele jaar wordt |
| Op hoeveel dagen het warmer was dan het normaal van die dag | Dat de reeks ruw is (niet gehomogeniseerd) | Waarom het warmer is |

## These

Door de opwarming liggen de meeste jaren sinds 2014 boven het normaal van 1991–2020, en een gewoon jaar is nu warmer
dan dat normaal.

**Wat ons ongelijk zou geven**: een lopend jaar dat over dezelfde dagen kouder is dan normaal, of een rij recente
jaren onder de nullijn in de jaarstaven. De site toont dat dan ook zo: de zinnen worden uit de cijfers gemaakt, niet
uit de these.

## Wat we bewust niet doen

- Geen voorspelling voor de rest van het jaar.
- Geen andere stations of variabelen (neerslag, zon). Wie dat wil, voegt een maat toe in `oogst/knmi.ts` (`MATEN`).
- Geen data van vóór 1951 (de ruwe reeks heeft daarvoor andere meetomstandigheden; zie `bronnen/knmi-daggegevens.md`).
