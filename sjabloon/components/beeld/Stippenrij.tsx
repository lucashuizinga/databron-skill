// Stippenrij (beeswarm): alle entiteiten als stip op één as, met een referentielijn.
// De eigen entiteit in het onderwerp-accent. Stippen botsen niet bij een vak van `ontwerpBreedte` pixels of breder.
import { beeswarm, lineair, netteAs, pct } from "@/lib/beeld/vorm.ts";
import s from "./beeld.module.css";

export function Stippenrij(props: {
  punten: { id: string; naam: string; waarde: number }[];
  eigen?: string;
  referentie?: { waarde: number; label: string };
  aria: string;
  waarde?: (v: number) => string;
  as?: (v: number) => string;
  ontwerpBreedte?: number;
}) {
  const fmt = props.waarde ?? ((v: number) => String(v));
  const asFmt = props.as ?? fmt;
  const W = props.ontwerpBreedte ?? 320;
  const r = 4;
  const ws = props.punten.map((p) => p.waarde);
  const as = netteAs(Math.min(...ws, props.referentie?.waarde ?? Infinity), Math.max(...ws, props.referentie?.waarde ?? -Infinity), 4);
  const x = lineair(as.domein, [0, W]);
  const zwerm = beeswarm(
    props.punten.map((p) => ({ ...p, x: x(p.waarde) })),
    r,
    1,
  );
  const hoogste = Math.max(...zwerm.map((p) => Math.abs(p.dy)), 0);
  const H = Math.max(48, hoogste * 2 + 28);
  const midden = H / 2;
  const eigen = zwerm.find((p) => p.id === props.eigen);

  return (
    <div className={s.omhulsel} role="img" aria-label={props.aria}>
      <div className={s.stippen} style={{ height: H }}>
        {props.referentie ? (
          <>
            <span className={s.referentie} style={{ left: pct(x(props.referentie.waarde), W) }} />
            <span className={s.stipLabel} style={{ left: pct(x(props.referentie.waarde), W), top: -20 }}>
              {props.referentie.label}
            </span>
          </>
        ) : null}
        {zwerm.map((p) => (
          <span
            key={p.id}
            className={`${s.stip} ${p.id === props.eigen ? s.eigen : ""}`}
            style={{ left: pct(p.x, W), top: midden + p.dy }}
            data-tip={`${p.naam}: ${fmt(p.waarde)}`}
          />
        ))}
        {eigen ? (
          <span
            className={`${s.stipLabel} ${s.eigen} ${s.halo}`}
            // bij de rand het label naar binnen uitlijnen, zodat het nooit buiten het vak valt
            style={{ left: pct(eigen.x, W), top: H + 4, transform: eigen.x / W > 0.7 ? "translateX(calc(-100% + 6px))" : eigen.x / W < 0.3 ? "translateX(-6px)" : undefined }}
          >
            {eigen.naam}: {fmt(eigen.waarde)}
          </span>
        ) : null}
        {as.ticks.map((t) => (
          <span key={t} className={s.maand} style={{ left: pct(x(t), W), top: H + (eigen ? 26 : 6) }}>
            {asFmt(t)}
          </span>
        ))}
      </div>
    </div>
  );
}
