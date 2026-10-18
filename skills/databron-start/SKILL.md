---
name: databron-start
description: Begin een nieuw Databron-project en begeleid de gebruiker van niets naar een live site - repo uit het sjabloon, GitHub, Vercel of Cloudflare, eerste deploy. Gebruik dit bij "nieuw project", "ik wil beginnen", "zet het online", of als /databron geen project vindt. Ook voor mensen die nog nooit een terminal gebruikten.
argument-hint: "[projectnaam] [uitleg:veel|uitleg:weinig]"
---

# Databron: beginnen

Doel: een werkende, gekoppelde repo met een eerste deploy, zonder dat de gebruiker hoeft te weten hoe dat moet.
Het sjabloon staat in deze plugin: `<basismap van deze skill>/../../sjabloon` (een complete Next.js-site op trede 1
met een echte voorbeeldbron, KNMI De Bilt). Kopiëren met `node <plugin>/scripts/nieuw.mjs <doelmap> <naam>`.

## Regels voor het begeleiden

- **Eén stap tegelijk, in gewone taal.** Zeg per stap wat er gebeurt, waarom, en wat de gebruiker daarna heeft.
  ("Nu maken we de repo op GitHub. Daarna staat je code veilig online en kan GitHub elke dag de data ophalen.")
- **Inloggen doet de gebruiker zelf.** Interactieve logins laat je typen met `!`: `! gh auth login`,
  `! vercel login`, `! npx wrangler login`. Je ziet nooit een wachtwoord of sleutel in de chat.
- **Sleutels gaan via een invoerprompt rechtstreeks naar de plek**, nooit via de chat of een bestand in git:
  `! gh secret set NAAM`, `! vercel env add NAAM production`, `! npx wrangler secret put NAAM`.
- **Controleer elke stap voordat de volgende begint** (bestaat de repo, is de Action groen, antwoordt de URL).
- **Fouten in gewone taal**: wat er misging, wat het betekent, wat we nu doen. Geen kale stacktrace.
- **Iets dat naar buiten gaat** (repo openbaar maken, een domein koppelen, iets betalen) vraag je eerst.

## Stappen

1. **Uitleg kiezen.** Als het niet duidelijk is: vraag `uitleg:veel` of `uitleg:weinig` (zie `/databron`).
2. **Gereedschap nakijken**: `node -v` (22 of hoger), `pnpm -v` (anders `npm i -g pnpm`), `gh --version`, en de
   CLI van de host (`vercel --version` of `npx wrangler --version`). Leg bij `uitleg:veel` uit wat elk ding is.
3. **Waar komt het project?** Vraag een naam (kleine letters en streepjes) en map. Kopieer het sjabloon:
   `node <plugin>/scripts/nieuw.mjs ~/code/<naam> <naam>`. Daarna `pnpm install`, `pnpm oogst`, `pnpm toets`,
   `pnpm dev` en laat de gebruiker de lokale site zien. Zo weten jullie dat alles werkt vóór er iets online gaat.
4. **GitHub.** `gh auth status`; zo niet ingelogd: laat `! gh auth login` typen. Dan
   `git init -b main && git add -A && git commit -m "Start uit het Databron-sjabloon"` en
   `gh repo create <naam> --private --source . --push`. Openbaar alleen als de gebruiker dat wil (lees
   `references/github.md`: geplande Actions vallen in openbare repo's stil na 60 dagen zonder activiteit).
5. **Hosting kiezen.** Standaard Vercel; Cloudflare als de gebruiker daar al zit of veel verkeer verwacht. Lees
   `references/hosting.md` voor de keuze en de commando's. Koppel de repo zodat elke push naar `main` deployt.
6. **Eerste deploy controleren.** Open de productie-URL met curl en zoek de antwoordzin in de HTML. Laat de gebruiker
   de URL openen.
7. **De oogst-Action proberen.** `gh workflow run oogst.yml`, dan `gh run watch`. Groen = de dagelijkse ophaalronde
   werkt. Rood: lees het log, leg uit, los op.
8. **`STAND.md` schrijven**: wat er nu staat (lokaal, GitHub, live-URL), de uitlegkeuze, de volgende stap
   (`databron-vraag`: de eigen vraag in plaats van het KNMI-voorbeeld), open beslispunten.

## Poort

De live-URL toont de site met de antwoordzin, `oogst.yml` is één keer groen gedraaid, en `STAND.md` beschrijft de
stand. Meld de gebruiker in twee zinnen wat er nu is en wat de volgende stap is.

## Later meer nodig?

Trede 2 (database) en trede 3 (live, API, MCP) komen pas als het project erom vraagt; `databron-opslag` zegt wanneer.
