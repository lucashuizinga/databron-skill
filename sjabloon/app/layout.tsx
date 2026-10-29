import type { Metadata, Viewport } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { Tip } from "@/components/beeld/index.ts";
import { SITE, siteUrl } from "@/lib/site.ts";
import "./globals.css";

const grotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const lees = Newsreader({ subsets: ["latin"], variable: "--font-lees", display: "swap", style: ["normal"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE.naam, template: `%s | ${SITE.naam}` },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#10151b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={SITE.taal} className={`${grotesk.variable} ${lees.variable}`}>
      <body>
        <header className="kop-site">
          <Link href="/" className="naam">
            {SITE.naam}
          </Link>
          <nav aria-label="Hoofdmenu">
            <Link href="/methode">Hoe we rekenen</Link>
            <a href="/data/tg">Data</a>
          </nav>
        </header>
        {children}
        <footer className="voet">
          <p>Gemaakt met Databron. Cijfers van het KNMI, onder CC BY 4.0.</p>
          <nav aria-label="Voettekst">
            <Link href="/methode">Hoe we rekenen</Link>
            <Link href="/vormen">Vormen</Link>
            <a href="/llms.txt">Voor AI-assistenten</a>
          </nav>
        </footer>
        <Tip />
      </body>
    </html>
  );
}
