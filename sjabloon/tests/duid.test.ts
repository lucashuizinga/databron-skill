import assert from "node:assert/strict";
import { test } from "node:test";
import type { Rij } from "../lib/data.ts";
import { antwoord, datum, getal, graden, kopJaarlijnen, kopJaarstaven, maandTip, metTeken, opsomming, temperatuur, voorlopigZin } from "../lib/duid.ts";
import { dagErbij, leidAf } from "../lib/reken.ts";

test("Nederlandse getalnotatie", () => {
  assert.equal(getal(1234.5), "1.234,5");
  assert.equal(getal(-0.04), "0,0");
  assert.equal(getal(-1.25, 1), "−1,3"); // echt minteken
  assert.equal(metTeken(1.26), "+1,3");
  assert.equal(temperatuur(11.5), "11,5 °C");
  assert.equal(graden(1), "1,0 graad");
  assert.equal(graden(-1.34), "1,3 graden");
  assert.equal(datum("2026-10-16"), "16 oktober 2026");
  assert.equal(opsomming([2024, 2023, 2014]), "2024, 2023 en 2014");
});

function reeks(tot: string, toeslag: number): Rij[] {
  const uit: Rij[] = [];
  for (let d = "1951-01-01"; d <= tot; d = dagErbij(d, 1)) {
    // een seizoen en een beetje variatie per jaar, zodat de rang iets betekent
    const dag = (Date.parse(d) / 86_400_000) % 365.25;
    const jaar = Number(d.slice(0, 4));
    const v = 10 + 8 * Math.sin((dag / 365.25) * 2 * Math.PI - 1.8) + ((jaar * 7) % 11) / 10 - 0.5 + (jaar === 2026 ? toeslag : 0);
    uit.push({ entiteit: "260", periode: d, waarde: Math.round(v * 10) / 10, status: d > dagErbij(tot, -30) ? "voorlopig" : "definitief" });
  }
  return uit;
}

test("geen NaN, undefined, lege plekken of 'nu', over veel uitkomsten", () => {
  for (const tot of ["2026-01-31", "2026-06-30", "2026-10-16", "2026-12-31"]) {
    for (let toeslag = -3; toeslag <= 3; toeslag += 0.37) {
      const a = leidAf(reeks(tot, toeslag));
      const ant = antwoord(a);
      const zinnen = [ant.zin, ant.rang, ant.voorlopig ?? "", kopJaarlijnen(a).kop, kopJaarlijnen(a).onder, kopJaarstaven(a).kop, kopJaarstaven(a).onder];
      for (let m = 1; m <= 12; m++) zinnen.push(maandTip(a, m) ?? "");
      for (const z of zinnen) {
        assert.doesNotMatch(z, /NaN|undefined|null|Infinity|\{|\}|  /, z);
        assert.doesNotMatch(z, /\b(nu|deze maand|vandaag|gisteren)\b/i, z);
      }
      assert.match(ant.zin, new RegExp(datum(a.laatste, false)));
      const r = Number(a.lopend.afwijking.toFixed(1));
      if (r > 0) assert.match(ant.zin, /^Ja: .* warmer/);
      if (r < 0) assert.match(ant.zin, /^Nee: .* kouder/);
      if (r === 0) assert.match(ant.zin, /even warm/);
      assert.doesNotMatch(ant.zin, /1 graden|1,0 graden/);
    }
  }
});

test("voorlopige cijfers worden benoemd", () => {
  const a = leidAf(reeks("2026-10-16", 1));
  assert.equal(voorlopigZin(a), "De cijfers vanaf 17 september 2026 zijn voorlopig: het KNMI kan ze na controle nog aanpassen.");
});
