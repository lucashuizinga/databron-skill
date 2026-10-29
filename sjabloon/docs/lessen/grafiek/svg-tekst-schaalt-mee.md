---
titel: Tekst in een meeschalende SVG wordt op mobiel onleesbaar
bron:
platform:
soort: grafiek
herkomst: redactie
gemeten_op: 2026-10-18
aanroep:
status: geldig
---

## Wat we zagen
Een SVG met een vaste `viewBox` (bijvoorbeeld 760 breed) en `width: 100%` schaalt op een telefoon (358 px vak) alles
met 0,47: letters van 12 px worden 5,6 px.

## Wat niet werkte
- Twee varianten (smal en breed) renderen en met CSS wisselen: dubbele payload, en tussen de breekpunten nog steeds
  te kleine of te grote letters.
- De grafiek in de browser opnieuw tekenen na het meten: dan is de server-HTML niet het eindbeeld en verspringt hij.

## Wat werkt
Vormen en tekst scheiden. De lijnen, vlakken en staven staan in een SVG met `preserveAspectRatio="none"` die met de
breedte meerekt, met `vector-effect: non-scaling-stroke` zodat lijnen even dik blijven. Alle tekst (asgetallen,
labels, de stip op de laatste meting) staat als HTML erboven, op een positie in procenten van de breedte en in pixels
van de vaste hoogte. Botsingen tussen labels reken je in pixels, omdat de hoogte vast is.

## Hoe je het voorkomt
Gebruik de vormen in `components/beeld/`; die werken al zo. Een rond element (stip) kan niet in de uitrekbare SVG,
want dan wordt het een ovaal: zet het als HTML erboven.

## Bewijs
Schermafbeeldingen in `docs/beeld/` op 390 en 1280 px: zelfde lettergrootte in beide.
