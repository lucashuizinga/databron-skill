import assert from "node:assert/strict";
import { test } from "node:test";
import { parseKnmi } from "../oogst/knmi-parse.ts";

test("tienden worden graden, met precies één decimaal", () => {
  const r = parseKnmi([{ station_code: 260, date: "2026-10-16T00:00:00.000Z", TG: 147 }], "TG");
  assert.deepEqual(r, [{ entiteit: "260", periode: "2026-10-16", waarde: 14.7 }]);
  // 0,1 + 0,2-ruis mag er niet in sluipen
  assert.equal(parseKnmi([{ station_code: 260, date: "2026-01-01T00:00:00.000Z", TG: 3 }], "TG")[0]!.waarde, 0.3);
});

test("leeg blijft leeg, nul blijft nul", () => {
  const r = parseKnmi(
    [
      { station_code: 260, date: "2026-01-01T00:00:00.000Z", TG: null },
      { station_code: 260, date: "2026-01-02T00:00:00.000Z" },
      { station_code: 260, date: "2026-01-03T00:00:00.000Z", TG: 0 },
      { station_code: 260, date: "2026-01-04T00:00:00.000Z", TG: -52 },
    ],
    "TG",
  );
  assert.deepEqual(
    r.map((x) => x.waarde),
    [null, null, 0, -5.2],
  );
});

test("de datum is een kalenderdag, zonder tijdzone-omrekening", () => {
  const r = parseKnmi([{ station_code: 260, date: "1951-01-01T00:00:00.000Z", TG: 14 }], "TG");
  assert.equal(r[0]!.periode, "1951-01-01");
});

test("een fout van de bron is geen lege lijst", () => {
  assert.throws(() => parseKnmi({ error: "x" }, "TG"), /geen lijst/);
  assert.throws(() => parseKnmi("<html>", "TG"), /geen lijst/);
  assert.throws(() => parseKnmi([{ station_code: 260, date: "x", TG: 1 }], "TG"), /datum/);
  assert.throws(() => parseKnmi([{ station_code: 260, date: "2026-01-01", TG: "abc" }], "TG"), /onleesbare/);
  assert.throws(() => parseKnmi([], "RH"), /geen schaal/);
  assert.deepEqual(parseKnmi([], "TG"), []);
});
