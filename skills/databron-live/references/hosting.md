# Hosting: Vercel of Cloudflare

Lees de actuele documentatie van de host voordat je limieten noemt; ze veranderen. Dit is de stand van oktober 2026.

## Kiezen

| | Vercel (standaard) | Cloudflare |
|---|---|---|
| Next.js | eersteklas, zonder aanpassingen | via `@opennextjs/cloudflare`; ISR en caching werken anders: testen |
| Functies | Node, tot 300 s per aanroep | Workers: kortere CPU-limiet, 128 MB geheugen |
| Database (trede 2) | Neon via de Vercel Marketplace | D1 (SQLite) of Neon via Hyperdrive |
| Ruwe bestanden | Vercel Blob | R2 |
| Verversen | crons in `vercel.ts` (op Hobby beperkt) | Cron Triggers; Workflows voor lange ketens |
| Geheimen | `vercel env add` | `wrangler secret put` |

Kies Cloudflare als de gebruiker er al zit, veel verkeer verwacht tegen lage kosten, of een grotendeels statische site
heeft. Anders Vercel. De zware oogst draait in beide gevallen in GitHub Actions, dus de functielimieten doen er niet toe.

## Vercel

```bash
! vercel login                     # de gebruiker logt zelf in
vercel link --yes                  # koppelt de map aan een (nieuw) project
vercel git connect                 # elke push naar main = productie, andere branches = preview
vercel deploy --prod               # eerste deploy; daarna gaat het via git
```

Of via het dashboard: vercel.com/new → de GitHub-repo importeren. Framework: Next.js, verder niets aanpassen.

## Cloudflare

```bash
pnpm add -D @opennextjs/cloudflare wrangler
! npx wrangler login
pnpm exec opennextjs-cloudflare build && pnpm exec opennextjs-cloudflare deploy
```

Het sjabloon heeft `wrangler.jsonc` en `open-next.config.ts` al klaarstaan. Koppel daarna de repo in het dashboard
(Workers & Pages → de Worker → Settings → Builds) zodat elke push deployt.

## Regels die een project verhuisbaar houden

1. De zware oogst draait in GitHub Actions, niet in een functie.
2. De site leest alleen; er wordt niet geoogst tijdens een request.
3. Alleen webstandaarden in sitecode (`fetch`, `Request`, `Response`, Web Crypto); geen `fs` tijdens het draaien
   (lezen tijdens de build mag).
4. Database via Drizzle met de HTTP-driver van Neon (werkt in Node én Workers), of D1 via dezelfde Drizzle-schema's.
5. Opslag achter `lib/opslag.ts` (`zet`, `haal`), met een adapter voor Blob en een voor R2.
6. Configuratie alleen via env; `.env.example` noemt elke naam.
7. Grote lijsten streamen, nooit als één JSON-tekst in het geheugen.
