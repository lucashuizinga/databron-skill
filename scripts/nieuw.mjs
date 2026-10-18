// Een nieuw Databron-project uit het sjabloon.
//   node scripts/nieuw.mjs <doelmap> [naam]
// Kopieert sjabloon/ (zonder node_modules, .next en bouwresten), zet de naam in package.json en STAND.md.
// Overschrijft nooit: bestaat de doelmap al en is hij niet leeg, dan stopt het script.
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [, , doelArg, naamArg] = process.argv;
if (!doelArg) { console.error("Gebruik: node scripts/nieuw.mjs <doelmap> [naam]"); process.exit(1); }
const bron = join(dirname(fileURLToPath(import.meta.url)), "..", "sjabloon");
const doel = resolve(doelArg.replace(/^~(?=\/)/, process.env.HOME));
const naam = (naamArg ?? basename(doel)).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
if (existsSync(doel) && readdirSync(doel).length) { console.error(`${doel} bestaat al en is niet leeg; kies een andere map.`); process.exit(1); }

const OVERSLAAN = new Set(["node_modules", ".next", ".ruw", ".open-next", ".wrangler", "tsconfig.tsbuildinfo", "next-env.d.ts", ".DS_Store"]);
cpSync(bron, doel, { recursive: true, filter: (p) => !OVERSLAAN.has(basename(p)) });

const pkg = join(doel, "package.json");
writeFileSync(pkg, readFileSync(pkg, "utf8").replace(/"name":\s*"[^"]*"/, `"name": "${naam}"`));
const stand = join(doel, "STAND.md");
if (existsSync(stand)) writeFileSync(stand, readFileSync(stand, "utf8").replace(/^# .*$/m, `# Stand van ${naam}`));
console.log(`Nieuw project in ${doel}\nVolgende stappen: cd ${doel} && pnpm install && pnpm oogst && pnpm toets && pnpm dev`);
