import assert from "node:assert/strict";
import { test } from "node:test";
import type { Rij } from "../lib/data.ts";
import { dagErbij, gemiddelde, kalender, leidAf, lopendGemiddelde, percentiel, voortschrijdend } from "../lib/reken.ts";
import { parseKnmi } from "../oogst/knmi-parse.ts";

// Met de hand gecontroleerd tegen de bron: curl op 18 oktober 2026,
// stns=260&vars=TG&start=20261001&end=20261016. Som 2.149 tienden over 16 dagen = 13,43125 °C.
const OKTOBER_2026 = [173, 131, 128, 127, 137, 144, 158, 127, 131, 118, 101, 104, 149, 115, 159, 147];

test("gemiddelde van 1 tot en met 16 oktober 2026 klopt met de handberekening", () => {
  const rijen = parseKnmi(
    OKTOBER_2026.map((tg, i) => ({ station_code: 260, date: `2026-10-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`, TG: tg })),
    "TG",
  );
  assert.ok(Math.abs(gemiddelde(rijen.map((r) => r.waarde))! - 13.43125) < 1e-9);
});

/** Kunstmatige reeks: elke dag `basis` °C, en vanaf `vanaf` een vaste toeslag. */
function reeks(tot: string, toeslag: number, vanaf = "2026-01-01"): Rij[] {
  const uit: Rij[] = [];
  for (let d = "1991-01-01"; d <= tot; d = dagErbij(d, 1)) {
    uit.push({ entiteit: "260", periode: d, waarde: 10 + (d >= vanaf ? toeslag : 0), status: "definitief" });
  }
  return uit;
}

test("afwijking van het lopende jaar over dezelfde dagen", () => {
  const a = leidAf(reeks("2026-10-16", 1.3));
  assert.equal(a.laatste, "2026-10-16");
  assert.ok(Math.abs(a.lopend.normaal - 10) < 1e-9);
  assert.ok(Math.abs(a.lopend.afwijking - 1.3) < 1e-9);
  assert.equal(a.lopend.rang, 1);
  assert.equal(a.lopend.dagen, 289);
  assert.equal(a.lopend.dagenBoven, 289);
});

test("een leeg jaar telt niet mee, en leeg wordt nooit 0", () => {
  const rijen = reeks("2026-10-16", 0).map((r) => (r.periode.startsWith("2005") ? { ...r, waarde: null } : r));
  const a = leidAf(rijen);
  const j2005 = a.perJaar.find((p) => p.jaar === 2005)!;
  assert.equal(j2005.gemiddelde, null);
  assert.equal(j2005.volledig, false);
  assert.ok(Math.abs(a.lopend.normaal - 10) < 1e-9, "het normaal blijft 10 zonder 2005");
  assert.equal(a.jaargemiddelden.some((j) => j.jaar === 2005), false);
});

test("percentiel en lopend gemiddelde", () => {
  assert.equal(percentiel([1, 2, 3, 4, 5], 0.5), 3);
  assert.equal(percentiel([1, 2, 3, 4], 0.1), 1.3);
  const m = new Map<string, number | null>([
    ["2026-01-01", 1],
    ["2026-01-02", 2],
    ["2026-01-03", null],
    ["2026-01-04", 4],
    ["2026-01-05", 5],
    ["2026-01-06", 6],
    ["2026-01-07", 7],
  ]);
  assert.equal(lopendGemiddelde(m, "2026-01-07"), (1 + 2 + 4 + 5 + 6 + 7) / 6);
  assert.equal(lopendGemiddelde(m, "2026-01-03"), null, "te weinig dagen");
  assert.deepEqual(voortschrijdend([1, 2, 3, 4], 2), [null, 1.5, 2.5, 3.5]);
  assert.equal(kalender().length, 365);
  assert.equal(kalender().includes("02-29"), false);
});
