// Cloudflare via OpenNext. Alleen klaargezet: @opennextjs/cloudflare is geen vaste afhankelijkheid van het sjabloon.
// Zo zet je het aan (zie README.md, "Publiceren op Cloudflare"):
//   pnpm add -D @opennextjs/cloudflare wrangler
//   pnpm exec opennextjs-cloudflare build && pnpm exec opennextjs-cloudflare preview
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
