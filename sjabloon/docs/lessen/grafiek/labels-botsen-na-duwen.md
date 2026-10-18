---
titel: Labels uit elkaar duwen kan botsingen laten staan
bron:
platform:
soort: grafiek
herkomst: gemeten
gemeten_op: 2026-10-18
aanroep: "pnpm test (tests/vorm.test.ts: labels botsen niet en blijven binnen het vak)"
status: geldig
---

## Wat we zagen
De eerste versie van `plaatsLabels()` duwde elk paar overlappende labels steeds een stukje uit elkaar en hield ze
daarna binnen het vak. De test met 200 willekeurige opstellingen vond in ronde 3 al een botsing.

## Wat niet werkte
Paarsgewijs duwen plus afkappen aan de rand. Bij drie of meer labels dicht bij de rand duwt het afkappen een label
terug op zijn buurman, en de lus stopt na een vast aantal rondes met een overlap.

## Wat werkt
Groeperen: labels die tegen elkaar aan liggen worden één groep, gecentreerd op het gemiddelde van hun gewenste
plekken en daarna binnen het vak gezet. Overlappen twee groepen, dan worden ze samengevoegd, tot niets meer overlapt.
Zie `plaatsLabels()` in `lib/beeld/vorm.ts`.

## Hoe je het voorkomt
Test labelplaatsing met veel willekeurige opstellingen, niet met één voorbeeld, en controleer twee dingen: geen
overlap en binnen de grenzen.

## Bewijs
`tests/vorm.test.ts`, 200 opstellingen van 2 tot 7 labels: 0 botsingen na de nieuwe versie.
