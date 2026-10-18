---
name: databron-review
description: Review een Databron-project met zes reviewers (bron, cijfer, grafiek, taal, smaak, site) die elk alleen melden wat ze kunnen aanwijzen - een regel code, een bestand of een schermafbeelding - met vaste ankers 0/25/50/75/100. Gebruik dit bij de poorten na de toets, het beeld en de site, en vóór een eerste publicatie.
argument-hint: "[alles | bron | cijfer | grafiek | taal | smaak | site]"
---

# Databron: review

Doel: fouten vinden die de maker niet meer ziet, zonder ruis. Lees `references/reviewers.md` voor wat elke reviewer
zoekt en wat hij níet meldt.

## Werkwijze

1. **Verzamel het bewijs eerst**: de diff of de bestanden, `toets/rapport.md`, schermafbeeldingen op 390 en 1280 px
   (licht en donker) van de belangrijkste pagina's, de HTML van de homepage (`curl`), `bronnen.yaml`.
2. **Draai de reviewers parallel** als subagents, elk met zijn eigen deel van `references/reviewers.md` en het bewijs.
   Elke subagent schrijft zijn bevindingen naar een bestand (`/tmp/databron-review/<reviewer>.json`) en geeft het pad
   terug, niet de tekst.
3. **Ankers**: elke bevinding krijgt 0, 25, 50, 75 of 100.
   - 100: aantoonbaar fout, met citaat (regel code, getal, schermafbeelding).
   - 75: vrijwel zeker, het pad van invoer naar fout is te volgen.
   - 50: waarschijnlijk, maar hangt af van iets dat je niet kunt zien.
   - 25 of lager: niet melden.
   Een bevinding van 75 of meer **moet** het bewijs citeren (bestand:regel, of de schermafbeelding met wat erop te zien
   is), anders zakt ze naar 50. Twee reviewers die onafhankelijk hetzelfde vinden: één niveau omhoog.
4. **Samenvoegen**: dubbele bevindingen samen, gesorteerd op anker. Meld de gebruiker alleen 75 en hoger als "moet",
   50 als "kijk even".
5. **Herstellen** wat duidelijk is (en zeg wat je herstelde); vraag bij smaak en bij inhoudelijke keuzes eerst.

## Poort

Geen open bevindingen van 75 of hoger. Wat bewust blijft staan, staat met reden in `STAND.md`.
