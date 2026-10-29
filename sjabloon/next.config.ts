import type { NextConfig } from "next";

// De site leest alleen: alles wat ze toont, staat in data/ en wordt bij de build gelezen.
const config: NextConfig = {
  devIndicators: false,
  // data/ en de lettertypen voor het deelbeeld moeten mee in de serverbundel.
  outputFileTracingIncludes: {
    "/*": ["./data/**/*", "./assets/fonts/**/*"],
  },
};

export default config;
