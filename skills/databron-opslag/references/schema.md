# De Databron-indeling

Werkt op Postgres (Neon) en SQLite (Cloudflare D1) via Drizzle. Postgres-extra's (volledige tekst, trigrammen) zitten
in een losse, optionele laag.

| Tabel | Wat erin staat | Velden |
|---|---|---|
| `bron` | spiegel van `bronnen.yaml` | `id`, `naam`, `uitgever`, `licentie`, `robots_afweging`, `ritme`, `url`, `odi` |
| `run` | elke oogst, ook als hij faalde | `id`, `bron_id`, `begon`, `klaar`, `status`, `nieuw`, `gewijzigd`, `fouten`, `ruw_pad` |
| `versie` | een publiceerbare stand | `id`, `aangemaakt`, `status` (kandidaat, gepubliceerd, afgewezen), `rapport`, `checksum` |
| `entiteit` | waar de cijfers over gaan | `code` (officieel), `soort`, `naam`, `ouder`, `indeling` |
| `maat` | wat er gemeten wordt (het register) | `id`, `naam`, `eenheid`, `soort` (telling, mediaan, gemiddelde, aandeel, score), `hoger_is_beter`, `decimalen`, `bron_id`, `definitie`, `aanroep`, `nullen_weggelaten` |
| `waarneming` | de cijfers, lang formaat | `maat_id`, `entiteit`, `periode`, `dims`, `dims_sleutel`, `waarde`, `status` (voorlopig, definitief), `vlag`, `versie_id`, `run_id`, `ruw_ref` |

## Regels

- **Officiële code als sleutel**; hiërarchie uit de code of `ouder`. Een herindeling = nieuwe `indeling`.
- **`periode` als ISO-tekst**: `2025`, `2025-Q3`, `2025-09`, `2025-09-14`. Sorteert goed, werkt overal.
- **`dims`** voor extra uitsplitsingen (leeftijd, geslacht, categorie): jsonb of json-tekst, plus `dims_sleutel`
  (sleutels gesorteerd, `leeftijd=30-34;geslacht=v`, of `""` zonder dims) voor de primaire sleutel. Een nieuwe
  uitsplitsing vraagt geen migratie.
- **`waarde` mag `null` zijn, nooit stil 0.** Rij met `null` = de bron noemt het zonder getal; geen rij = de bron noemt
  het niet. Laat een bron nullen weg (CBS-politie), zet dan `maat.nullen_weggelaten = true` zodat de leeslaag aanvult.
- **Nooit bijwerken.** Revisie = nieuwe rij met nieuwe `versie_id`. Primaire sleutel:
  `(maat_id, entiteit, periode, dims_sleutel, versie_id)`. View `actueel`: per sleutel de waarde uit de nieuwste
  gepubliceerde versie.
- **Indexen**: `(maat_id, periode)` voor een kaart of ranglijst, `(entiteit, maat_id)` voor een reeks.
- **Ruw naar objectopslag**: `ruw/<bron>/<datum>/<hash>.json.gz`; `ruw_ref` wijst ernaar.

## Per type erbij

- **monitor**: `doel` (`maat_id`, `waarde`, `geldig_van`, `geldig_tot`, `bron`).
- **atlas**: `buren` (`entiteit`, `buur`) en optioneel `zoek` (Postgres tsvector).
- **profiel**: niets; combinaties staan in `dims`.
- **audit**: `criterium` (`id`, `gewicht`, `uitleg`), `beoordeling` (`entiteit`, `criterium_id`, `score`, `bewijs_url`,
  `gevonden_op`, `zekerheid`, `status`), `correctie` (`gemeld`, `wat`, `bewijs`, `besluit`).

## Trede 1 als bestanden

```
data/maten.json             [{ id, naam, eenheid, soort, hoger_is_beter, decimalen, bron, definitie, aanroep }]
data/entiteiten.json        [{ code, soort, naam, ouder? }]
data/waarnemingen/<maat>.json   { maat, versie, checksum, rijen: [{ entiteit, periode, dims?, waarde, status }] }
data/run.json               { begon, klaar, bronnen: { <id>: { ok, rijen, fout?, waakhond? } } }
```
