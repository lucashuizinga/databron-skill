import assert from "node:assert/strict";
import { test } from "node:test";
import { beeswarm, jaarlijnenScene, klassen, lijnPad, mooiMax, netteAs, plaatsLabels, stavenScene } from "../lib/beeld/vorm.ts";

test("mooiMax geeft ronde getallen", () => {
  assert.equal(mooiMax(83), 100);
  assert.equal(mooiMax(23), 25);
  assert.equal(mooiMax(4.1), 5);
  assert.equal(mooiMax(1), 1);
  assert.equal(mooiMax(0), 1);
  assert.equal(mooiMax(1200), 2000);
});

test("netteAs omvat de data met ronde ticks", () => {
  const a = netteAs(-2.96, 1.31, 6);
  assert.deepEqual(a.ticks, [-3, -2, -1, 0, 1, 2]);
  const b = netteAs(-3.1, 25.2, 6);
  assert.equal(b.stap, 5);
  assert.ok(b.domein[0] <= -3.1 && b.domein[1] >= 25.2);
});

test("lijnPad breekt bij een lege waarde", () => {
  assert.equal(lijnPad([[0, 0], [1, 1], null, [2, 2], [3, 3]]), "M0 0L1 1M2 2L3 3");
  assert.equal(lijnPad([[0.04, 0], [0.04, 0]]), "M0 0", "dubbele punten vallen weg");
});

test("labels botsen niet en blijven binnen het vak", () => {
  for (let ronde = 0; ronde < 200; ronde++) {
    const n = 2 + (ronde % 6);
    const labels = Array.from({ length: n }, (_, i) => ({ id: String(i), y: ((ronde * 37 + i * 13) % 100) + (i % 2), hoogte: 16 }));
    const plek = plaatsLabels(labels, { min: 0, max: 200, tussen: 2 });
    const ys = [...plek.values()].sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) assert.ok(ys[i]! - ys[i - 1]! >= 18 - 1e-6, `botsing in ronde ${ronde}`);
    for (const y of ys) assert.ok(y >= 8 - 1e-6 && y <= 192 + 1e-6);
  }
});

test("beeswarm: stippen overlappen niet", () => {
  const punten = Array.from({ length: 80 }, (_, i) => ({ x: ((i * 7919) % 100) / 2 }));
  const z = beeswarm(punten, 4, 1);
  for (let i = 0; i < z.length; i++)
    for (let j = i + 1; j < z.length; j++) assert.ok(Math.hypot(z[i]!.x - z[j]!.x, z[i]!.dy - z[j]!.dy) >= 9 - 1e-6);
});

test("klassen: kwantielen en gelijke breedte", () => {
  assert.deepEqual(klassen([1, 2, 3, 4, 5], 2, "gelijk"), [3]);
  assert.deepEqual(klassen([1, 2, 3, 4, 5], 4, "kwantiel"), [2, 3, 4]);
});

test("staven beginnen bij 0, ook onder de nullijn", () => {
  const sc = stavenScene([{ label: "a", waarde: -1 }, { label: "b", waarde: 2 }], 100, 100);
  const [a, b] = sc.staven;
  assert.ok(Math.abs(a!.y - sc.nul) < 1e-9, "negatieve staaf hangt aan de nullijn");
  assert.ok(Math.abs(b!.y + b!.h - sc.nul) < 1e-9, "positieve staaf staat op de nullijn");
  assert.equal(b!.laatste, true);
});

test("jaarlijnen: eindlabels uit elkaar en het punt op de laatste meting", () => {
  const lijn = Array.from({ length: 365 }, (_, i) => (i < 288 ? 10 + Math.sin(i / 58) * 8 : null));
  const vorig = Array.from({ length: 365 }, (_, i) => 10 + Math.sin(i / 58) * 8);
  const sc = jaarlijnenScene({ lopend: lijn, vorig, band: { onder: vorig.map((v) => v - 3), boven: vorig.map((v) => v + 3), midden: vorig }, labels: { lopend: "2026", vorig: "2025", midden: "normaal" } }, 1000, 320, 16);
  assert.equal(sc.punt?.index, 287);
  const [l1, l2] = sc.eindlabels;
  assert.ok(Math.abs(l1!.y - l2!.y) >= 18 - 1e-6, "2025 en normaal eindigen op dezelfde plek, maar de labels botsen niet");
});
