---
titel: tsc kent de globale routetypen pas na next typegen
bron:
platform: nextjs-16
soort: hosting
herkomst: gemeten
gemeten_op: 2026-10-18
aanroep: "pnpm typecheck"
status: geldig
---

## Wat we zagen
Next.js 16 geeft globale typen als `LayoutProps<"/">`, `PageProps<"/pad">` en `RouteContext<"/pad">`. Die staan in
`.next/types` en `.next/dev/types`, die pas bestaan na `next dev`, `next build` of `next typegen`.

## Wat niet werkte
`tsc --noEmit` in een verse checkout (zoals in GitHub Actions, vóór de build): de typen bestaan dan nog niet.
Lokaal merk je het niet, omdat de dev-server ze al heeft aangemaakt.

## Wat werkt
`"typecheck": "next typegen && tsc --noEmit"` in `package.json`.

## Hoe je het voorkomt
Draai de typecheck één keer na `rm -rf .next` voordat je CI vertrouwt.

## Bewijs
`pnpm typecheck` geeft "Types generated successfully" en daarna geen fouten (18 oktober 2026).
