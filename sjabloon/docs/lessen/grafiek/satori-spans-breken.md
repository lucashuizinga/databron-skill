---
titel: Satori zet losse spans op een eigen regel
bron:
platform: next-og
soort: grafiek
herkomst: gemeten
gemeten_op: 2026-10-18
aanroep: "curl -s http://localhost:3481/opengraph-image -o og.png"
status: geldig
---

## Wat we zagen
In het deelbeeld (`app/opengraph-image.tsx`) stonden "Ja:" en de rest van de zin als twee spans in een flex-container
met `flexWrap: wrap`. Satori zette "Ja:" op een eigen regel, omdat de tweede span als geheel niet meer op de regel paste.

## Wat niet werkte
Opmaak binnen een zin met losse spans: in Satori is elke span een flex-item, geen stuk lopende tekst.

## Wat werkt
De hele zin als één tekst in één element. Wil je nadruk, zet die dan op een eigen regel (bijvoorbeeld de vraag erboven).

## Hoe je het voorkomt
Bekijk het deelbeeld altijd als PNG voordat je het af noemt. Elke container met meer dan één kind heeft
`display: flex` nodig; lopende tekst met opmaak bestaat er niet.

## Bewijs
Twee versies van `og.png` op 18 oktober 2026: eerst "Ja:" alleen op regel 1, daarna de zin doorlopend.
