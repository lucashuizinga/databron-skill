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
4. **Samenvoegen en prioriteren**: dubbele bevindingen samen. 75 en hoger is **P1** (moet vóór publicatie), 50 is
   **P2** (deze ronde, of als beslispunt in `STAND.md`). Lager meld je niet. Schrijf ze naar
   `docs/review/<datum>.md` als lijst met per regel: prioriteit, reviewer, bewijs, status (`open`, `opgelost`,
   `bewust`).
5. **Triage met de gebruiker, één tegelijk**, alleen voor wat een keuze is (smaak, inhoud, een afweging). Wat
   aantoonbaar fout is, herstel je zelf en meld je als opgelost. P1 eerst.
6. **De gebruiker beoordeelt de bedoeling, de reviewers de rest.** Vraag de gebruiker niet om code te lezen. Vraag:
   klopt de antwoordzin met wat we wilden weten, is de aanpak logisch, staat er iets wat de data niet dragen?
7. **Vang het de volgende keer zelf.** Kwam dezelfde soort fout al eens voor, dan hoort er een test, een toetsregel
   of een regel in `references/reviewers.md` bij (via `databron-leer`), niet nog een keer handwerk.

## Poort

Geen open P1 in `docs/review/<datum>.md`. Wat bewust blijft staan, staat er met reden als `bewust`, en in
`STAND.md`.
