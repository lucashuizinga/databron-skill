# Werken aan Databron zelf

- Skills staan in `skills/<naam>/SKILL.md`, met `references/` en `templates/` ernaast. De `name` in de frontmatter is
  gelijk aan de mapnaam. Draai `node scripts/check-skills.mjs` na elke wijziging.
- Schrijfregels: uitkomst eerst; alleen regels die een fout voorkomen, een neiging van het model tegengaan of
  domeinkennis toevoegen; aantallen en grenzen naast de handeling; bij een regel de reden. Geen "wees grondig". Een SKILL.md blijft onder ~150 regels; de rest gaat naar `references/`.
- Elke skill eindigt met een **poort**: een controleerbaar "klaar als".
- `sjabloon/` moet altijd werken: `pnpm install && pnpm oogst && pnpm toets && pnpm test && pnpm build`.
- Nieuwe smaakregels gaan naar `skills/databron-beeld/references/smaak.md`, met de reden.
