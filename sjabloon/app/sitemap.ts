import type { MetadataRoute } from "next";
import { leesWaarnemingen } from "@/lib/data.ts";
import { siteUrl } from "@/lib/site.ts";

// Alleen de pagina's die ertoe doen. lastmod is de versie van de data, nooit een verzonnen datum.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const w = await leesWaarnemingen("tg");
  const basis = siteUrl();
  return [
    { url: `${basis}/`, lastModified: w.versie },
    { url: `${basis}/methode`, lastModified: w.versie },
  ];
}
