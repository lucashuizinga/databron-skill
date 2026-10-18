---
name: databron-duid
description: Maak de tekst van een Databron-project uit de cijfers - antwoordzin, koppen die de bevinding zeggen, onderregels, metabeschrijvingen en mails - met een resolver, sjablonen in code en vaste cijferregels; een taalmodel alleen met bewijsplicht. Gebruik dit voor elke zin op de site waar een getal in staat.
---

# Databron: tekst uit cijfers

Doel: elke zin met een getal volgt uit de data en blijft kloppen als de data verandert. Lees eerst
`references/cijferregels.md`.

## Stappen

1. **Resolver eerst.** Voordat er een zin komt: welke uitsnede leverde dit cijfer (land, leeftijd, gemeente, of een
   terugval op een breder niveau)? Een zin spreekt alleen voor wat echt gemeten is. Viel het cijfer terug op het
   landelijke getal, dan zegt de zin dat, of verdwijnt het zinsdeel.
2. **Sjablonen in code** (`lib/duid.ts`): een `Feit` = `{ toon: "goed" | "slecht" | "neutraal", getal, eenheid,
   peildatum, zin }`. De toon volgt het oordeel (`maat.hoger_is_beter`), niet de richting: minder misdrijven is goed.
   Drempels in code ("op koers", "krap", "nee"), niet in de tekst.
3. **Meer talen?** Elk zinsdeel is een volledig ICU-bericht; lijsten met `Intl.ListFormat`, getallen met
   `Intl.NumberFormat`. Nooit losse stukken tekst aan elkaar plakken (meervouden, woordvolgorde).
4. **Redactie met een geldigheidsvenster**: een handgeschreven notitie krijgt `van` en `tot`, zodat een vergeten
   notitie vanzelf verdwijnt. Getallen in redactionele tekst komen uit dezelfde data (geen vaste getallen in artikelen).
5. **Een taalmodel alleen met bewijsplicht**, en alleen waar oordeel of lezen nodig is (een samenvatting van een
   rapport, niet een kop over een cijfer):
   - geef de feiten als genummerde regels (`F1 Gemiddelde temperatuur 2026 tot 17 okt = 12,4 °C`);
   - vraag een vast JSON-schema terug, met bij elk punt de F-nummers;
   - haal daarna elk getal uit de tekst en controleer het tegen de feiten (±5% na afronding); een getal zonder bron =
     het punt valt weg;
   - een citaat moet letterlijk in de bron staan.
   Een model maakt nooit een getal.

## Poort

`tests/duid.test.ts` draait de tekstlaag over **alle** entiteiten en periodes en vindt geen `NaN`, `undefined`,
`null`, lege plekken (`{`), dubbele spaties, getallen zonder eenheid, verkeerde meervouden, of de woorden "nu",
"momenteel", "deze maand", "live". Lees daarna drie zinnen hardop (de voorleestest) en verbeter wat stroef is.
