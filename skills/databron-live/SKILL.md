---
name: databron-live
description: Zet een Databron-project online - een repo op GitHub, hosting op Vercel of Cloudflare, de eerste deploy en de dagelijkse ophaalronde. Alleen als de gebruiker de lokale site gezien heeft en uitdrukkelijk ja zegt op online zetten. Gebruik dit bij "zet het online", "publiceer", "deel de link", of als databron-site klaar is en de gebruiker enthousiast is.
argument-hint: "[vercel|cloudflare]"
---

# Databron: online zetten

Pas na een **uitdrukkelijk ja**. Vraag het zo, met wat het betekent:

> "De site werkt lokaal. Zal ik hem online zetten? Dan komt de code op jouw GitHub (privé, tenzij je het anders wilt) en
> de site op Vercel, gratis. Daarna haalt GitHub elke ochtend de nieuwe cijfers op. Je hebt een GitHub- en een
> Vercel-account nodig; inloggen doe je zelf."

Stilte, "mooi" of "ga door" over iets anders is geen ja. Zegt de gebruiker nee of later: zet het als beslispunt in
`STAND.md` en ga verder met wat lokaal kan.

## Regels

- **Inloggen doet de gebruiker zelf.** Laat interactieve logins typen met `!`: `! gh auth login`, `! vercel login`,
  `! npx wrangler login`. Je ziet nooit een wachtwoord of sleutel in de chat.
- **Sleutels gaan via een invoerprompt rechtstreeks naar de plek**: `! gh secret set NAAM`,
  `! vercel env add NAAM production`, `! npx wrangler secret put NAAM`.
- **Iets openbaar maken** (repo, link delen, domein koppelen, iets betalen) vraag je apart.
- **Fouten in gewone taal**: wat er misging, wat het betekent, wat we nu doen.

## Stappen

1. **GitHub.** `gh auth status`; zo niet ingelogd: `! gh auth login`. Dan `git init -b main && git add -A && git commit
   -m "Start uit het Databron-sjabloon"` en `gh repo create <naam> --private --source . --push`. Openbaar alleen als de
   gebruiker dat wil (`references/github.md`: geplande Actions vallen in openbare repo's stil na 60
   dagen zonder activiteit).
2. **Hosting.** Standaard Vercel; Cloudflare als de gebruiker daar al zit of veel verkeer verwacht
   (`references/hosting.md`). Koppel de repo zodat elke push naar `main` deployt.
3. **Eerste deploy controleren.** Open de productie-URL met curl en zoek de antwoordzin in de HTML. Geef de gebruiker de
   link.
4. **De ophaalronde.** `gh workflow run oogst.yml`, dan `gh run watch`. Groen: de dagelijkse ronde werkt. Rood: lees het
   log, leg uit, los op. Verder in `databron-ververs`.
5. **`STAND.md` bijwerken** met de repo, de live-URL en de volgende stap.

## Poort

De live-URL toont de site met de antwoordzin, `oogst.yml` is één keer groen gedraaid, en de gebruiker heeft de link.
