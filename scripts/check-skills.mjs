// Controleert de skills: frontmatter (name = mapnaam, description aanwezig) en dat elke verwezen
// references/… of templates/… echt bestaat. Exit 1 bij een fout.  node scripts/check-skills.mjs
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../skills/", import.meta.url).pathname;
let fouten = 0;
for (const map of readdirSync(root)) {
  const pad = join(root, map, "SKILL.md");
  if (!existsSync(pad)) { console.log(`✗ ${map}: geen SKILL.md`); fouten++; continue; }
  const tekst = readFileSync(pad, "utf8");
  const fm = tekst.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const naam = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  if (naam !== map) { console.log(`✗ ${map}: name is '${naam}'`); fouten++; }
  if (!/^description:\s*\S/m.test(fm)) { console.log(`✗ ${map}: geen description`); fouten++; }
  for (const [, rel] of tekst.matchAll(/`((?:references|templates)\/[^`\s]+)`/g)) {
    if (!existsSync(join(root, map, rel))) { console.log(`✗ ${map}: ${rel} bestaat niet`); fouten++; }
  }
  for (const [, ander, rel] of tekst.matchAll(/`(databron-[a-z]+)\/((?:references|templates)\/[^`\s]+)`/g)) {
    if (!existsSync(join(root, ander, rel))) { console.log(`✗ ${map}: ${ander}/${rel} bestaat niet`); fouten++; }
  }
  const regels = tekst.split("\n").length;
  console.log(`${fouten ? " " : "✓"} ${map} (${regels} regels)`);
}
if (fouten) { console.log(`\n${fouten} fout(en)`); process.exit(1); }
console.log("\nAlle skills in orde.");
