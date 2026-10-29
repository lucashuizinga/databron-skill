---
name: databron-start
description: Begin een nieuw Databron-project op de eigen computer - het sjabloon kopiëren, installeren, de voorbeeldsite lokaal laten draaien en in de browser laten zien. Nog niets naar GitHub of online; dat komt pas met databron-live als de gebruiker enthousiast is en ja zegt. Gebruik dit bij "nieuw project", "ik wil beginnen", of als /databron geen project vindt. Ook voor mensen die nog nooit een terminal gebruikten.
argument-hint: "[projectnaam]"
---

# Databron: beginnen (lokaal)

Doel: binnen een paar minuten een werkende site op de eigen computer, met de voorbeeldvraag, zodat de gebruiker
**ziet** wat Databron maakt. Er gaat nog niets naar buiten: geen GitHub, geen hosting, geen account. Dat komt later
met `databron-live`, en alleen als de gebruiker dat wil.

Het sjabloon staat in deze plugin: `<basismap van deze skill>/../../sjabloon` (een complete Next.js-site met een
echte voorbeeldbron, KNMI De Bilt). Kopiëren met `node <plugin>/scripts/nieuw.mjs <doelmap> <naam>`. Staat het er niet
(skills los geïnstalleerd met `npx skills add`): `npx degit lucashuizinga/databron-skill/sjabloon <doelmap>`.

## Eerst: zeg in drie zinnen wat er gaat gebeuren

Begin met gewone taal, geen jargon. Bijvoorbeeld:

> "Ik zet eerst een voorbeeldsite op je computer, zodat je ziet wat Databron maakt. Daarna kiezen we samen jouw vraag
> en bouw ik de site om naar jouw onderwerp. Online zetten doen we pas als jij het goed vindt."

Vraag daarna **één** ding, met twee duidelijke keuzes (en zet de keuze in `STAND.md`):

> "Hoe wil je dat ik werk?
> 1. Ik leg elke stap kort uit en vraag het als er iets te kiezen is. (Aanbevolen als dit nieuw voor je is.)
> 2. Ik werk door en meld alleen wat ik deed en wat jij moet beslissen."

Gebruik tegenover de gebruiker nooit interne woorden als "poort", "trede", "oogst" of "lus". Zeg "controle",
"opslag", "ophalen", "de stappen".

## Stappen

1. **Gereedschap nakijken**: `node -v` (22 of hoger) en `pnpm -v` (anders `npm i -g pnpm`). Ontbreekt Node, leg dan uit
   hoe je het installeert (nodejs.org, de LTS-versie) en wacht.
2. **Waar komt het project?** Stel een naam voor (kleine letters en streepjes, uit het onderwerp) en een map
   (`~/code/<naam>`). Vraag alleen als de gebruiker iets anders wil.
3. **Kopiëren en draaien**: `node <plugin>/scripts/nieuw.mjs ~/code/<naam> <naam>`, dan `pnpm install`, `pnpm oogst`,
   `pnpm toets` en `pnpm dev`.
4. **Laten zien.** Open de lokale site (`http://localhost:3481`) en beschrijf in twee zinnen wat de gebruiker ziet: de
   vraag, de antwoordzin, de grafiek, de bron. Maak een schermafbeelding als dat kan en laat die zien.
5. **`STAND.md` schrijven**: wat er nu lokaal staat, de gekozen werkwijze, en de volgende stap (`databron-vraag`: jouw
   eigen vraag in plaats van het KNMI-voorbeeld).

## Poort

De site draait lokaal, de gebruiker heeft hem gezien, en `STAND.md` beschrijft de stand. Zeg in twee zinnen wat er nu
is en wat de volgende stap is. Stel GitHub of online zetten hier nog niet voor.
