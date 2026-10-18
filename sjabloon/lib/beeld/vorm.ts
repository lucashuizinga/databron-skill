// LAAG 1 van de grafische engine: puur, zonder DOM. Van data naar een scène met vormen en teksten.
// Getest in tests/vorm.test.ts.
//
// Werkwijze van de engine: de vormen (lijnen, vlakken, staven) staan in een SVG die met de breedte meerekt
// (preserveAspectRatio="none", lijndikte vast met vector-effect). Alle tekst staat als HTML erboven, op een
// positie in procenten. Zo werkt één server-render op elke schermbreedte en worden letters nooit klein geschaald.
// Het deelbeeld (OG) gebruikt dezelfde scène op een vaste maat in pixels.

// ---------- schalen ----------

export type Schaal = {
  (x: number): number;
  domein: [number, number];
  bereik: [number, number];
  terug(y: number): number;
};

export function lineair(domein: [number, number], bereik: [number, number]): Schaal {
  const [d0, d1] = domein;
  const [r0, r1] = bereik;
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  const f = ((x: number) => r0 + (x - d0) * k) as Schaal;
  f.domein = domein;
  f.bereik = bereik;
  f.terug = (y: number) => (k === 0 ? d0 : d0 + (y - r0) / k);
  return f;
}

/** Tijdschaal op ISO-datums ("2026-10-16"). */
export function tijdschaal(van: string, tot: string, bereik: [number, number]) {
  const ms = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  const s = lineair([ms(van), ms(tot)], bereik);
  return (iso: string) => s(ms(iso));
}

// ---------- nette getallen ----------

/** Rond af naar boven op 1, 2, 2,5 of 5 maal een macht van tien: mooiMax(83) = 100, mooiMax(23) = 25. */
export function mooiMax(x: number): number {
  if (!Number.isFinite(x) || x <= 0) return 1;
  const macht = 10 ** Math.floor(Math.log10(x));
  for (const f of [1, 2, 2.5, 5, 10]) if (x <= f * macht + 1e-9 * macht) return f * macht;
  return 10 * macht;
}

/** Een nette stapgrootte voor ongeveer `aantal` stappen over `bereik`. */
export function mooiStap(bereik: number, aantal = 5): number {
  if (bereik <= 0) return 1;
  const ruw = bereik / Math.max(1, aantal);
  const macht = 10 ** Math.floor(Math.log10(ruw));
  const f = ruw / macht;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * macht;
}

/** Breidt [min, max] uit tot veelvouden van een nette stap en geeft het domein plus de asgetallen. */
export function netteAs(min: number, max: number, aantal = 5): { domein: [number, number]; ticks: number[]; stap: number } {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const stap = mooiStap(max - min, aantal);
  const lo = Math.floor(min / stap + 1e-9) * stap;
  const hi = Math.ceil(max / stap - 1e-9) * stap;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + stap / 2; v += stap) ticks.push(Number(v.toFixed(10)));
  return { domein: [lo, hi], ticks, stap };
}

// ---------- paden ----------

const r1 = (x: number) => Math.round(x * 10) / 10;

/** Lijnpad door punten; `null` onderbreekt de lijn. Afgerond op 0,1 eenheid, dubbele punten vallen weg. */
export function lijnPad(punten: ([number, number] | null)[]): string {
  let d = "";
  let open = false;
  let vorig = "";
  for (const p of punten) {
    if (!p) {
      open = false;
      continue;
    }
    const xy = `${r1(p[0])} ${r1(p[1])}`;
    if (open && xy === vorig) continue;
    d += `${open ? "L" : "M"}${xy}`;
    open = true;
    vorig = xy;
  }
  return d;
}

/** Vlak tussen twee reeksen (boven en onder) met dezelfde x; onderbreekt bij een lege waarde. */
export function vlakPad(x: (i: number) => number, boven: (number | null)[], onder: (number | null)[], y: (v: number) => number): string {
  const stukken: string[] = [];
  let stuk: number[] = [];
  const sluit = () => {
    if (stuk.length > 1) {
      const heen = stuk.map((i, k) => `${k ? "L" : "M"}${r1(x(i))} ${r1(y(boven[i]!))}`).join("");
      const terug = [...stuk].reverse().map((i) => `L${r1(x(i))} ${r1(y(onder[i]!))}`).join("");
      stukken.push(`${heen}${terug}Z`);
    }
    stuk = [];
  };
  for (let i = 0; i < boven.length; i++) {
    if (boven[i] === null || onder[i] === null || boven[i] === undefined || onder[i] === undefined) sluit();
    else stuk.push(i);
  }
  sluit();
  return stukken.join("");
}

// ---------- klassen ----------

/** Klassegrenzen: `n` klassen van gelijke breedte, of kwantielen (elke klasse even veel waarden). */
export function klassen(waarden: number[], n: number, methode: "gelijk" | "kwantiel" = "kwantiel"): number[] {
  const xs = waarden.filter(Number.isFinite).sort((a, b) => a - b);
  if (!xs.length || n < 2) return [];
  const grenzen: number[] = [];
  for (let k = 1; k < n; k++) {
    if (methode === "gelijk") grenzen.push(xs[0]! + ((xs.at(-1)! - xs[0]!) * k) / n);
    else {
      const h = (xs.length - 1) * (k / n);
      const lo = Math.floor(h);
      grenzen.push(xs[lo]! + (xs[Math.ceil(h)]! - xs[lo]!) * (h - lo));
    }
  }
  return grenzen;
}

export function klasseVan(waarde: number, grenzen: number[]): number {
  let k = 0;
  while (k < grenzen.length && waarde > grenzen[k]!) k++;
  return k;
}

// ---------- directe labels ----------

export type Label = { id: string; y: number; hoogte: number };

/**
 * Duwt labels verticaal uit elkaar tot ze niet meer botsen, zo dicht mogelijk bij hun gewenste plek,
 * en binnen [min, max]. Alle maten in dezelfde eenheid (meestal pixels).
 */
export function plaatsLabels(labels: Label[], opties: { min?: number; max?: number; tussen?: number } = {}): Map<string, number> {
  const { min = -Infinity, max = Infinity, tussen = 2 } = opties;
  const l = [...labels].sort((a, b) => a.y - b.y);
  // Groepen van labels die tegen elkaar aan liggen. Een groep staat zo dicht mogelijk bij het gemiddelde
  // van de gewenste plekken van zijn leden; overlappen twee groepen, dan worden ze één groep.
  type Groep = { leden: Label[]; top: number; hoogte: number };
  const hoogteVan = (leden: Label[]) => leden.reduce((t, x) => t + x.hoogte, 0) + tussen * (leden.length - 1);
  const idealeTop = (leden: Label[]) => {
    let offset = 0;
    let som = 0;
    for (const x of leden) {
      som += x.y - (offset + x.hoogte / 2);
      offset += x.hoogte + tussen;
    }
    return som / leden.length;
  };
  const binnen = (g: Groep) => Math.min(Math.max(g.top, min), max - g.hoogte);
  let groepen: Groep[] = l.map((x) => ({ leden: [x], top: x.y - x.hoogte / 2, hoogte: x.hoogte }));
  groepen.forEach((g) => (g.top = binnen(g)));
  for (let veranderd = true; veranderd; ) {
    veranderd = false;
    const uit: Groep[] = [];
    for (const g of groepen) {
      const vorige = uit.at(-1);
      if (vorige && vorige.top + vorige.hoogte + tussen > g.top + 1e-9) {
        const leden = [...vorige.leden, ...g.leden];
        const samen: Groep = { leden, top: idealeTop(leden), hoogte: hoogteVan(leden) };
        samen.top = binnen(samen);
        uit[uit.length - 1] = samen;
        veranderd = true;
      } else uit.push(g);
    }
    groepen = uit;
  }
  const plek = new Map<string, number>();
  for (const g of groepen) {
    let y = g.top;
    for (const x of g.leden) {
      plek.set(x.id, y + x.hoogte / 2);
      y += x.hoogte + tussen;
    }
  }
  return plek;
}

// ---------- beeswarm ----------

/**
 * Stippen op een as zonder overlap: elke stip krijgt een verticale verschuiving (0, +d, −d, +2d …).
 * x in pixels; geeft dy in pixels ten opzichte van de middenlijn.
 */
export function beeswarm<T extends { x: number }>(punten: T[], straal: number, tussen = 1): (T & { dy: number })[] {
  const d = straal * 2 + tussen;
  const geplaatst: (T & { dy: number })[] = [];
  for (const p of [...punten].sort((a, b) => a.x - b.x)) {
    const buren = geplaatst.filter((q) => Math.abs(q.x - p.x) < d);
    let dy = 0;
    for (let k = 0; k < 200; k++) {
      dy = k === 0 ? 0 : Math.ceil(k / 2) * (k % 2 ? 1 : -1) * (d / 2);
      if (buren.every((q) => Math.hypot(q.x - p.x, q.dy - dy) >= d - 1e-6)) break;
    }
    geplaatst.push({ ...p, dy });
  }
  return geplaatst;
}

// ---------- kleur per logica ----------

/**
 * Drie logica's die je nooit mengt in één grafiek:
 * - oordeel: goed of slecht (rood alleen voor het slechtste oordeel);
 * - hoeveelheid: één reeks van licht naar donker;
 * - geen data: altijd grijs.
 * Plus onderwerp/context: één kleur voor wat de lezer zoekt, grijs voor de rest.
 */
export function kleur(
  logica: "oordeel" | "hoeveelheid" | "categorie" | "onderwerp",
  waarde: number | boolean | null,
  opties: { grenzen?: number[] } = {},
): string {
  if (waarde === null || (typeof waarde === "number" && !Number.isFinite(waarde))) return "var(--geen-data)";
  if (logica === "onderwerp") return waarde ? "var(--onderwerp)" : "var(--context)";
  if (logica === "oordeel") return waarde === true || (typeof waarde === "number" && waarde > 0) ? "var(--goed)" : "var(--slecht)";
  if (logica === "categorie") return `var(--categorie-${(Number(waarde) % 5) + 1})`;
  const k = klasseVan(Number(waarde), opties.grenzen ?? []);
  return `var(--hoeveelheid-${Math.min(k, 4) + 1})`;
}

// ---------- scènes ----------

export type Tekst = { id: string; x: number; y: number; tekst: string; klasse?: string };

/** Invoer voor de jaarlijnen: per kalenderdag een waarde (of null). */
export type JaarlijnenInvoer = {
  lopend: (number | null)[];
  vorig?: (number | null)[];
  context?: (number | null)[][];
  band?: { onder: (number | null)[]; boven: (number | null)[]; midden?: (number | null)[] };
  labels: { lopend: string; vorig?: string; midden?: string };
};

export type JaarlijnenScene = {
  breedte: number;
  hoogte: number;
  domein: [number, number];
  ticks: { y: number; waarde: number }[];
  maanden: { x: number; breedte: number; maand: number }[];
  paden: { band: string; midden: string; vorig: string; lopend: string; context: string[] };
  punt: { x: number; y: number; waarde: number; index: number } | null;
  eindlabels: Tekst[]; // rechts naast de grafiek
};

const MAAND_BEGIN = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

/**
 * Jaarlijnen: elk jaar een lijn van januari tot december. `breedte` en `hoogte` zijn de eenheden van de scène;
 * `labelHoogte` is de hoogte van een eindlabel in dezelfde eenheid (voor de botsingscontrole).
 */
export function jaarlijnenScene(inv: JaarlijnenInvoer, breedte: number, hoogte: number, labelHoogte = 16): JaarlijnenScene {
  const alles = [
    ...inv.lopend,
    ...(inv.vorig ?? []),
    ...(inv.band?.onder ?? []),
    ...(inv.band?.boven ?? []),
    ...(inv.context ?? []).flat(),
  ].filter((v): v is number => v !== null && Number.isFinite(v));
  const as = netteAs(Math.min(...alles), Math.max(...alles), 6);
  const n = inv.lopend.length;
  const x = lineair([0, n - 1], [0, breedte]);
  const y = lineair(as.domein, [hoogte, 0]);
  const pad = (reeks: (number | null)[] | undefined) =>
    reeks ? lijnPad(reeks.map((v, i) => (v === null || v === undefined ? null : ([x(i), y(v)] as [number, number])))) : "";

  let laatste = -1;
  inv.lopend.forEach((v, i) => {
    if (v !== null) laatste = i;
  });
  const punt = laatste >= 0 ? { x: x(laatste), y: y(inv.lopend[laatste]!), waarde: inv.lopend[laatste]!, index: laatste } : null;

  // Eindlabels rechts: vorig jaar en normaal, uit elkaar geduwd.
  const kandidaten: Label[] = [];
  const eind = (reeks?: (number | null)[]) => {
    if (!reeks) return null;
    for (let i = reeks.length - 1; i >= 0; i--) if (reeks[i] !== null && reeks[i] !== undefined) return y(reeks[i]!);
    return null;
  };
  const yVorig = eind(inv.vorig);
  const yMidden = eind(inv.band?.midden);
  if (yVorig !== null && inv.labels.vorig) kandidaten.push({ id: "vorig", y: yVorig, hoogte: labelHoogte });
  if (yMidden !== null && inv.labels.midden) kandidaten.push({ id: "midden", y: yMidden, hoogte: labelHoogte });
  const plek = plaatsLabels(kandidaten, { min: 0, max: hoogte, tussen: 2 });
  const eindlabels: Tekst[] = kandidaten.map((k) => ({
    id: k.id,
    x: breedte,
    y: plek.get(k.id)!,
    tekst: k.id === "vorig" ? inv.labels.vorig! : inv.labels.midden!,
    klasse: k.id,
  }));

  return {
    breedte,
    hoogte,
    domein: as.domein,
    ticks: as.ticks.map((t) => ({ y: r1(y(t)), waarde: t })),
    maanden: MAAND_BEGIN.slice(0, 12).map((b, m) => ({ x: r1(x(b)), breedte: r1(x(MAAND_BEGIN[m + 1]!) - x(b)), maand: m + 1 })),
    paden: {
      band: inv.band ? vlakPad(x, inv.band.boven, inv.band.onder, y) : "",
      midden: pad(inv.band?.midden),
      vorig: pad(inv.vorig),
      lopend: pad(inv.lopend),
      context: (inv.context ?? []).map(pad),
    },
    punt,
    eindlabels,
  };
}

export type StaafScene = {
  breedte: number;
  hoogte: number;
  nul: number;
  ticks: { y: number; waarde: number }[];
  staven: { x: number; y: number; b: number; h: number; waarde: number; label: string; laatste: boolean }[];
};

/** Staven per periode, as vanaf 0 (ook bij negatieve waarden: dan hangen ze onder de nullijn). */
export function stavenScene(reeks: { label: string; waarde: number }[], breedte: number, hoogte: number, tussen = 0.25): StaafScene {
  const ws = reeks.map((r) => r.waarde);
  const as = netteAs(Math.min(0, ...ws), Math.max(0, ...ws), 6);
  const y = lineair(as.domein, [hoogte, 0]);
  const stap = breedte / reeks.length;
  const b = stap * (1 - tussen);
  return {
    breedte,
    hoogte,
    nul: r1(y(0)),
    ticks: as.ticks.map((t) => ({ y: r1(y(t)), waarde: t })),
    staven: reeks.map((r, i) => ({
      x: r1(i * stap + (stap - b) / 2),
      y: r1(Math.min(y(0), y(r.waarde))),
      b: r1(b),
      h: r1(Math.abs(y(r.waarde) - y(0))),
      waarde: r.waarde,
      label: r.label,
      laatste: i === reeks.length - 1,
    })),
  };
}

export type ReeksScene = {
  breedte: number;
  hoogte: number;
  domein: [number, number];
  ticks: { y: number; waarde: number }[];
  xLabels: { x: number; tekst: string }[];
  pad: string;
  vergelijk: string;
  vlak?: string;
  eind: { x: number; y: number; waarde: number } | null;
  eindVergelijk: { x: number; y: number; waarde: number } | null;
};

/** Een tijdreeks met optionele vergelijkingslijn (stippel) en optionele bandbreedte. */
export function reeksScene(
  punten: { periode: string; waarde: number | null; vergelijk?: number | null; onder?: number | null; boven?: number | null }[],
  breedte: number,
  hoogte: number,
  opties: { vanafNul?: boolean; xLabel?: (periode: string, i: number) => string | null; extra?: number[] } = {},
): ReeksScene {
  // `extra`: waarden die alleen voor de as meetellen (bijvoorbeeld een doel), niet voor de lijn.
  const alle = [...punten.flatMap((p) => [p.waarde, p.vergelijk ?? null, p.onder ?? null, p.boven ?? null]), ...(opties.extra ?? [])].filter(
    (v): v is number => v !== null && Number.isFinite(v),
  );
  const as = netteAs(opties.vanafNul ? Math.min(0, ...alle) : Math.min(...alle), Math.max(...alle), 4);
  const x = lineair([0, Math.max(1, punten.length - 1)], [0, breedte]);
  const y = lineair(as.domein, [hoogte, 0]);
  const lijn = (k: "waarde" | "vergelijk") => lijnPad(punten.map((p, i) => (p[k] === null || p[k] === undefined ? null : ([x(i), y(p[k]!)] as [number, number]))));
  const laatsteIndex = (k: "waarde" | "vergelijk") => {
    for (let i = punten.length - 1; i >= 0; i--) if (punten[i]![k] !== null && punten[i]![k] !== undefined) return i;
    return -1;
  };
  const iw = laatsteIndex("waarde");
  const iv = laatsteIndex("vergelijk");
  const heeftBand = punten.some((p) => p.onder !== undefined && p.boven !== undefined);
  return {
    breedte,
    hoogte,
    domein: as.domein,
    ticks: as.ticks.map((t) => ({ y: y(t), waarde: t })),
    xLabels: punten.flatMap((p, i) => {
      const t = opties.xLabel?.(p.periode, i);
      return t ? [{ x: x(i), tekst: t }] : [];
    }),
    pad: lijn("waarde"),
    vergelijk: lijn("vergelijk"),
    vlak: heeftBand ? vlakPad(x, punten.map((p) => p.boven ?? null), punten.map((p) => p.onder ?? null), y) : undefined,
    eind: iw >= 0 ? { x: x(iw), y: y(punten[iw]!.waarde!), waarde: punten[iw]!.waarde! } : null,
    eindVergelijk: iv >= 0 ? { x: x(iv), y: y(punten[iv]!.vergelijk!), waarde: punten[iv]!.vergelijk! } : null,
  };
}

/** Van een scène-coördinaat naar een percentage, voor de HTML-tekstlaag. */
export const pct = (v: number, totaal: number) => `${Math.round((v / totaal) * 10000) / 100}%`;
