// Naam en adres van de site. Het adres komt uit env (zie .env.example); op Vercel valt het terug op het
// productiedomein van het project, lokaal op localhost.
export const SITE = {
  naam: "Warmte in De Bilt",
  vraag: "Is het dit jaar warmer dan normaal in De Bilt?",
  taal: "nl",
} as const;

export function siteUrl(): string {
  const env = process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null);
  return (env ?? "http://localhost:3481").replace(/\/$/, "");
}
