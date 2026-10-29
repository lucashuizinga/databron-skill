import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site.ts";

// Alles open, ook voor AI-crawlers: deze site is er om gevonden en hergebruikt te worden.
// Previews op Vercel zijn niet de echte site en worden niet geïndexeerd.
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl()}/sitemap.xml` };
}
