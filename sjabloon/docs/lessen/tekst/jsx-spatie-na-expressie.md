---
titel: Een spatie na een expressie verdwijnt als de tekst over meer regels loopt
bron:
platform: react-jsx
soort: tekst
herkomst: gemeten
gemeten_op: 2026-10-18
aanroep: "curl -s http://localhost:3481/methode | grep -o '.\\{25\\}<!-- -->[A-Za-z(].\\{20\\}'"
status: geldig
---

## Wat we zagen
In `app/methode/page.tsx` stond `Het verschil, {metTeken(l.afwijking)} graden, is het antwoord. We ronden …`, met
de zin doorlopend op de volgende regel. Op de pagina stond "+1,3graden": de spatie na de expressie was weg.

## Wat niet werkte
Vertrouwen op de spatie in de broncode. De JSX-compiler kort witruimte in tekst die over meer regels loopt in, en
daarbij ging de spatie direct na `}` verloren. Op één regel ging het wel goed, dus je ziet het niet aan de code.

## Wat werkt
Getal en eenheid samen in één expressie, met een vaste spatie: `` {`${metTeken(x)} graden`} ``. Of de helpers uit
`lib/duid.ts` (`temperatuur()`, `graden()`), die de vaste spatie al zetten.

## Hoe je het voorkomt
Zoek in de server-HTML naar een expressie die direct aan een woord vastzit: `<!-- -->` gevolgd door een letter.
Elke treffer is een ontbrekende spatie.

## Bewijs
Vóór de fix gaf de grep `et verschil, <!-- -->+1,3<!-- -->graden`; erna geen treffer meer.
