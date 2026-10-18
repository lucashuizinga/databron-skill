// Band met doel: de stand tegen een bandbreedte (zachte vlakte) en een optionele doelstip.
// Het eindpunt krijgt zijn waarde erbij. Basis: de vulgrafiek van Gaspeil.
import { lineair, pct, reeksScene } from "@/lib/beeld/vorm.ts";
import s from "./beeld.module.css";

const B = 1000;

export function BandMetDoel(props: {
  punten: { periode: string; waarde: number | null; onder: number | null; boven: number | null }[];
  aria: string;
  punt: { titel: string; waarde: (v: number) => string };
  doel?: { index: number; waarde: number; label: string };
  hoogte?: number;
  as?: (v: number) => string;
  xLabel?: (periode: string, i: number) => string | null;
}) {
  const H = props.hoogte ?? 260;
  const sc = reeksScene(props.punten, B, H, { xLabel: props.xLabel, extra: props.doel ? [props.doel.waarde] : [] });
  const as = props.as ?? ((v: number) => String(v));
  const x = lineair([0, Math.max(1, props.punten.length - 1)], [0, B]);
  const y = lineair(sc.domein, [H, 0]);
  const links = sc.eind ? sc.eind.x / B > 0.86 : false;

  return (
    <div className={s.omhulsel} role="img" aria-label={props.aria}>
      <div className={s.vak} style={{ height: H }}>
        <svg className={s.svg} viewBox={`0 0 ${B} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {sc.ticks.map((t) => (
            <line key={t.waarde} className={s.raster} x1={0} x2={B} y1={t.y} y2={t.y} />
          ))}
          {sc.vlak ? <path className={s.band} d={sc.vlak} /> : null}
          <path className={s.lijn} d={sc.pad} />
        </svg>
        {sc.ticks.map((t) => (
          <span key={t.waarde} className={s.as} style={{ top: t.y }}>
            {as(t.waarde)}
          </span>
        ))}
        {sc.xLabels.map((l, i) => (
          // in een smal vak valt elk tweede label weg, anders lopen ze in elkaar
          <span key={l.tekst} className={`${s.maand} ${i % 2 ? s.oneven : ""}`} style={{ left: pct(l.x, B) }}>
            {l.tekst}
          </span>
        ))}
        {props.doel ? (
          <>
            <span className={s.doel} style={{ left: pct(x(props.doel.index), B), top: y(props.doel.waarde) }} />
            <span
              className={`${s.label} ${s.halo}`}
              // onder de stip: boven staat meestal het label van de laatste meting
              style={{ left: pct(x(props.doel.index), B), top: y(props.doel.waarde) + 12, transform: "translateX(-100%)" }}
            >
              {props.doel.label}
            </span>
          </>
        ) : null}
        {sc.eind ? (
          <>
            <span className={s.punt} style={{ left: pct(sc.eind.x, B), top: sc.eind.y }} />
            <span className={`${s.puntlabel} ${s.halo} ${links ? s.links : ""}`} style={{ left: pct(sc.eind.x, B), top: sc.eind.y }}>
              <b>{props.punt.titel}</b>
              <span>{props.punt.waarde(sc.eind.waarde)}</span>
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
