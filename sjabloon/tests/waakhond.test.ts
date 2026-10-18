import assert from "node:assert/strict";
import { test } from "node:test";
import type { Rij } from "../lib/data.ts";
import { voegSamen, waakhond } from "../oogst/draai.ts";

const rij = (periode: string, waarde: number | null): Rij => ({ entiteit: "260", periode, waarde, status: "definitief" });
const vorige = [rij("2026-01-01", 1), rij("2026-01-02", 2), rij("2026-01-03", 3), rij("2026-01-04", 4), rij("2026-01-05", 5)];
const zonder = (r: Rij) => ({ entiteit: r.entiteit, periode: r.periode, waarde: r.waarde });

test("de waakhond laat goede verse data door", () => {
  assert.deepEqual(waakhond(vorige, [...vorige.map(zonder), zonder(rij("2026-01-06", 6))], "2026-01-01"), []);
});

test("de waakhond weigert leeg, korter, ouder en leger", () => {
  assert.match(waakhond(vorige, [], "2026-01-01")[0]!, /geen enkele rij/);
  const kort = waakhond(vorige, vorige.slice(0, 3).map(zonder), "2026-01-01").join(" ");
  assert.match(kort, /Ouder/);
  assert.match(kort, /Korter/);
  const leeg = vorige.map((r) => zonder({ ...r, waarde: null }));
  assert.match(waakhond(vorige, leeg, "2026-01-01").join(" "), /Leger: 5 dagen/);
});

test("samenvoegen gooit niets weg en telt revisies", () => {
  const { rijen, nieuw, gewijzigd } = voegSamen(vorige, [zonder(rij("2026-01-05", 5.5)), zonder(rij("2026-01-06", 6))]);
  assert.equal(rijen.length, 6);
  assert.equal(nieuw, 1);
  assert.equal(gewijzigd, 1);
  assert.equal(rijen.find((r) => r.periode === "2026-01-05")!.waarde, 5.5);
  assert.equal(rijen.at(-1)!.status, "voorlopig");
});
