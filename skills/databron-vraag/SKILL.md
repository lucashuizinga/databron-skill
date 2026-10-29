---
name: databron-vraag
description: Leg vast wat een Databron-project beantwoordt - de kernvraag, de antwoordzin die uit de cijfers volgt, het publiek, het projecttype (monitor, atlas, profiel, audit), de claimladder en de these die je toetst. Gebruik dit aan het begin van elk project of als iemand een onderwerp heeft maar nog geen scherpe vraag.
argument-hint: "[onderwerp of vraag]"
---

# Databron: de vraag

Een goede dataset-site beantwoordt **één vraag** met **één zin die uit de cijfers volgt**. "Is het dit jaar warmer dan normaal?"
"Hoe staat jouw buurt ervoor?" "Hoe goed rapporteren landen hun cijfers?" Alles daarna (bronnen, opslag,
grafieken) volgt uit die vraag.

## Stappen

1. **Wat bestaat er al?** Vraag de Index: `zoek_bron` met het onderwerp, `lijst_projecten` met het thema. Past een
   bouwproject, lees `geef_project`: neem de vraag, de geteste aanroepen en de valkuilen over in plaats van opnieuw te
   beginnen. Noem wat je vond.
2. **De kernvraag in één zin**, vanuit de lezer, zonder jargon. Toets: kan iemand die het onderwerp niet kent hem
   hardop lezen en begrijpen?
3. **De antwoordzin met lege plekken**, zo dat elke plek uit een cijfer komt:
   "{Ja/Nee}: {jaar} is tot en met {datum} {x} graad {warmer/kouder} dan het gemiddelde van 1991–2020." Zoek per plek
   een bron (stap 2 van de lus). Een plek zonder bron is een open punt, geen invulling.
4. **Het publiek**: wie leest het, wat weten ze al, wat willen ze delen (een kaart van hun gemeente, één getal, een
   grafiek voor een raadsvergadering)?
5. **Het type** (monitor, atlas, profiel of audit; zie `/databron`). Bij twijfel: de eenheid beslist. Eén reeks met een
   doel = monitor; veel gebieden = atlas; combinaties van filters = profiel; per entiteit een oordeel met bewijs = audit.
6. **De claimladder**: wat mogen we zeggen, wat alleen met een kanttekening, wat nooit. Bijvoorbeeld: "warmer dan
   normaal" mag; "door klimaatverandering" alleen met een bron die dat onderbouwt; "het warmste jaar ooit" alleen als de
   reeks dat echt laat zien, met de begindatum van de reeks erbij.
7. **De these en wat haar weerlegt.** Wat verwachten we, en welk cijfer zou ons ongelijk geven? Een audit die begint
   met "alleen Nederland heeft recente data" kan dat weerleggen; dan wordt de scherpere conclusie het product. Schrijf
   op hoe je het toetst.
8. **Wat we bewust niet doen** (geen prognose, geen ranglijst van personen, geen …).
9. Schrijf `vraag.md` volgens `templates/vraag.md` en werk `STAND.md` bij.

## Poort

Elke lege plek in de antwoordzin heeft een kandidaat-bron uit de Index (met id) of staat als open punt in `STAND.md`.
Lees de antwoordzin hardop voor de gebruiker en vraag of dit de vraag is die ze beantwoord willen zien.
