---
name: databron-ontwerp
description: Denk met de gebruiker mee over hoe het eruit moet zien en wat interactief wordt, in een kort gesprek van een paar vragen met keuzes - de toon, de stijl, het visitekaartje van de pagina, wat iemand kan aanklikken of filteren - en leg de keuzes vast voordat databron-beeld en databron-site bouwen. Gebruik dit nadat de cijfers kloppen (na databron-duid) en voor het bouwen van grafieken en pagina's, of als de gebruiker zegt "maak het mooier", "interactiever" of "meer vibe".
---

# Databron: het ontwerp, samen

Doel: een ontwerp dat bij de vraag en het publiek past, gekozen door de gebruiker, zonder dat die verstand van design
hoeft te hebben. Kort: hooguit vijf vragen, één tegelijk, elk met twee tot vier keuzes, een aanbevolen keuze bovenaan
en een zin waarom. Laat waar het kan een schets of schermafbeelding zien in plaats van te beschrijven.

## De vragen (in deze volgorde, sla over wat al duidelijk is)

1. **Voor wie en waar** wordt het gelezen? Op een telefoon onderweg, op een groot scherm in een vergadering, gedeeld op
   LinkedIn? Dat bepaalt de opbouw (één kolom of breed) en de grootte van cijfers.
2. **Welke toon?** Bijvoorbeeld: *rustig en betrouwbaar* (zoals een krant), *uitgesproken en urgent* (zoals een
   campagne), *speels en nieuwsgierig* (zoals een uitleg voor iedereen). Laat bij elke keuze één voorbeeld zien.
3. **Het visitekaartje**: het ene beeld bovenaan dat het onderwerp draagt. Stel twee of drie ideeën voor die uit de data
   komen (een kaart, een streepbeeld, één groot getal met de trend, een tekening), met een aanbeveling.
4. **Wat kan iemand doen?** Bijvoorbeeld: een eigen gemeente of jaar kiezen, aanwijzen voor details, vergelijken met
   het land, een link delen naar zijn eigen uitkomst. Kies er hooguit twee; elke interactie kost tijd en kan stuk.
5. **Kleur en letter**: het eigen huisstijl van de gebruiker, of de Databron-smaak (licht, één accentkleur,
   `databron-beeld/references/smaak.md`). Vraag dit alleen als de gebruiker een eigen stijl lijkt te hebben.

## Afmaken hoort erbij

Een pagina is pas af met: een favicon, een titel en beschrijving uit de echte cijfers, een deelbeeld, een korte uitleg
voor wie de pagina voor het eerst ziet ("wat zie je hier, waar komen de cijfers vandaan") en een manier om een fout te
melden. Noem dat in het gesprek, zodat de gebruiker weet dat het eraan komt (`databron-site` bouwt het).

## Vastleggen

Zet de keuzes in `ontwerp.md` (publiek, toon, visitekaartje, interacties, stijl, met per keuze de reden) en een regel
in `STAND.md`. `databron-beeld` en `databron-site` lezen `ontwerp.md` voordat ze bouwen.

## Poort

`ontwerp.md` staat er, met de keuzes en hun reden, en de gebruiker heeft ze bevestigd.
