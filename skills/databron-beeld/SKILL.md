---
name: databron-beeld
description: Maak de grafieken van een Databron-project met de eigen engine (pure vorm-functies, SVG op de server, één tooltiplaag) en de Databron-smaak - één grafiek per bevinding, de kop is de bevinding, labels aan de lijn, grijs voor context. Gebruik dit voor elke grafiek, kaart of datavisual, en voor het ontwerp van de pagina eromheen.
argument-hint: "[de bevinding die de grafiek moet laten zien]"
---

# Databron: het beeld

Doel: grafieken op het niveau van een goede krantenredactie, die op de pagina, in het deelbeeld en als download
dezelfde getallen tonen. **Lees eerst `references/smaak.md`** (de smaak voor interface en grafieken); die is niet
optioneel. Lees `references/vormen.md` om de vorm te kiezen.

## De engine (staat in het sjabloon)

- **Laag 1, vorm** (`lib/beeld/vorm.ts`): pure functies van data naar een scène: schalen, nette assen (`mooiMax`),
  lijnpaden met pixel-snap, klassegrenzen, directe labels met botsingscontrole, beeswarm-indeling, kleur per logica.
  Te testen in Node.
- **Laag 2, renderers** (`components/beeld/`): React SVG op de server (standaard), dezelfde scène zonder filters in het
  OG-beeld (Satori: elke container met meer kinderen `display: flex`), canvas alleen bij duizenden punten.
- **Laag 3, interactie**: één tooltiplaag (`components/beeld/Tip.tsx`) op `[data-tip]`, met de tekst ook in de HTML;
  bediening met het toetsenbord; `prefers-reduced-motion`.

Een vorm die er nog niet is: bouw hem in dezelfde drie lagen, met een test voor laag 1, en zet hem in `vormen.md` van
het project.

## Stappen

1. **De bevinding in één zin.** Wat moet de lezer zien? Die zin wordt de kop. Geen zin = geen grafiek.
2. **Kies de vorm** bij de bevinding (`references/vormen.md`). Eén grafiek per bevinding.
3. **Wikkel hem in `<Bevinding>`**: kop (de bevinding), onderregel (eenheid, periode, bewerking zoals "7-daags
   gemiddelde"), de grafiek, en de bron met peildatum en een link naar de exacte aanroep.
4. **Kies de kleurlogica**: oordeel (goed/slecht), hoeveelheid (één reeks), of geen data (grijs). Nooit mengen.
   Het onderwerp krijgt de accentkleur; al het andere is grijs.
5. **Markeer wat de lezer zoekt**: het lopende jaar, de eigen gemeente, Nederland. Een stip op de laatste meting met de
   waarde ernaast.
6. **Toegankelijk**: `role="img"` en een `aria-label` met de kernzin; richting ook als teken (▲▼); getest palet.
7. **Mobiel**: op 390 px krimpt de grafiek of scrolt hij in zijn eigen vak, openend bij vandaag. Labels botsen niet.
8. **Deelbeeld en download** gebruiken dezelfde vorm-functie en dezelfde getallen.
9. **Het visitekaartje** (optioneel, één per project): een beeld dat het onderwerp draagt. Altijd met de echte cijfers
   als HTML erover, en stil bij reduced motion. Voor een getekend object: de skill `anatomy`; voor de pagina: de skill
   `frontend-design` (met deze smaak als brief).
10. **Eerst richtingen tonen** bij iets nieuws: twee of drie varianten naast elkaar renderen, klein bekijken, de
    gebruiker laten kiezen. Pas dan uitwerken.

## Poort

Schermafbeeldingen op 390 en 1280 px, licht en donker (Playwright; headless Chromium verbergt scrollbalken, dus meet
overloop met `document.documentElement.scrollWidth > clientWidth` en per element). Bekijk ze zelf kritisch tegen
`references/smaak.md`: niets uit "Niet doen", geen botsende labels, kop klopt met wat je ziet. Zet ze in `docs/beeld/`.
