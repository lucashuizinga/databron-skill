---
name: databron-leer
description: Leg vast wat je leerde, zodat de volgende ronde makkelijker is - één les per bestand in docs/lessen/ met frontmatter, de aanroep opnieuw gecontroleerd, en een les over een bron of platform terug naar Open Data Index met meld_les. Ook --ververs om oude lessen na te lopen. Gebruik dit aan het eind van elke sessie waarin iets niet-triviaals is opgelost, of als een les niet meer klopt.
argument-hint: "[--ververs]"
---

# Databron: leren

Elke ronde maakt de volgende makkelijker, omdat de les wordt opgeschreven waar de volgende haar vindt. Drie ringen:

1. **Het project**: `docs/lessen/<soort>/<slug>.md`. `AGENTS.md` wijst ernaar.
2. **Open Data Index**: een les over een bron of platform gaat terug met `meld_les`. Na controle staat ze in
   `geef_lessen`, voor iedereen die met die bron bouwt.
3. **Databron zelf**: een les die voor elk project geldt (smaak, werkwijze, hosting), zet je als voorstel in `STAND.md`
   onder "Voor Databron"; de beheerder van de plugin neemt hem op in de skills.

## Wanneer wel, wanneer niet

Wel: het probleem is opgelost, je hebt het bewezen, en het was niet triviaal (een stil filter, een fout met HTTP 200,
een limiet, een trendbreuk, een valkuil in hosting of GitHub, feedback over smaak). Je kunt de les in één zin zeggen.
Niet: een typefout, iets dat al in `geef_lessen` of `docs/lessen/` staat (werk die dan bij in plaats van een dubbele),
een vermoeden zonder bewijs. Eén les per keer.

## Stappen

1. **Bestaat hij al?** Grep in `docs/lessen/` op titel en bron, en vraag `geef_lessen(bron)`. Lijkt het sterk: werk het
   bestaande bestand bij (`laatst_bijgewerkt`).
2. **Schrijf het bestand** volgens `references/les.md`: frontmatter plus de secties Wat we zagen, Wat niet werkte,
   Wat werkt, Hoe je het voorkomt, Bewijs.
3. **Controleer de bewering**: staat er een `aanroep` en `herkomst: gemeten`, voer de aanroep opnieuw uit en kijk of het
   klopt. Lukt dat niet: `herkomst: leerpunt` met de oorspronkelijke datum. Paden en functienamen in de les moeten
   bestaan.
4. **Terug naar de Index** als de les over een bron (`bron: <id>`) of een platform gaat: `meld_les` met titel, bron of
   platform, soort, wat je zag (met getallen), wat werkt, de aanroep zonder sleutels, en de datum. Vraag de gebruiker of
   het project genoemd mag worden (`project`). Meld het id dat terugkomt in `STAND.md`.
5. **Vindbaarheid**: wijst `AGENTS.md` naar `docs/lessen/`? Zo niet, voeg één regel toe: "Lessen uit eerdere rondes
   staan in docs/lessen/: lees die bij werk aan een bron of onderdeel dat daar genoemd wordt." Klopt de README nog met
   de echte stand?

## --ververs

Loop alle lessen langs (maandelijks, of als een bron verandert). Per les één van vijf: **houden**, **bijwerken**,
**samenvoegen** (twee over hetzelfde), **vervangen** (nieuwe aanpak), **verouderd** (`status: verouderd` met reden).
Niets stil wissen. Controleer aanroepen opnieuw; vergelijk met `status` en `geef_lessen` van de Index.

## Poort

De les staat als bestand met geldige frontmatter, de aanroep is opnieuw gecontroleerd (of de herkomst eerlijk
aangepast), en een les over een bron of platform is gemeld met een id.
