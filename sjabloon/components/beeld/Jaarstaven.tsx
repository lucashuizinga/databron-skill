// Jaarstaven: één staaf per jaar, as vanaf 0, de laatste staaf in het accent met zijn waarde erbij.
// Negatieve waarden hangen onder de nullijn. Server-component.
import { pct, stavenScene } from "@/lib/beeld/vorm.ts";
import s from "./beeld.module.css";

const B = 1000;

export function Jaarstaven(props: {
  reeks: { label: string; waarde: number; tip?: string }[];
  aria: string;
  hoogte?: number;
  as?: (v: number) => string;
  waarde?: (v: number) => string; // notatie van het label bij de laatste staaf
  xLabels?: (label: string, i: number) => boolean; // welke jaren onder de as staan
}) {
  const H = props.hoogte ?? 240;
  const sc = stavenScene(props.reeks, B, H, 0.28);
  const as = props.as ?? ((v: number) => String(v));
  const fmt = props.waarde ?? ((v: number) => String(v));
  const toonX = props.xLabels ?? ((l: string) => Number(l) % 10 === 0);
  const laatste = sc.staven.at(-1);

  return (
    <div className={s.omhulsel} role="img" aria-label={props.aria}>
      <div className={`${s.vak} ${s.zonderRechts}`} style={{ height: H }}>
        <svg className={s.svg} viewBox={`0 0 ${B} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {sc.ticks.map((t) => (t.waarde === 0 ? null : <line key={t.waarde} className={s.raster} x1={0} x2={B} y1={t.y} y2={t.y} />))}
          {sc.staven.map((st, i) => (
            <rect
              key={st.label}
              className={`${s.staaf} ${st.laatste ? s.laatste : ""}`}
              x={st.x}
              y={st.y}
              width={st.b}
              height={Math.max(st.h, 0.5)}
              data-tip={props.reeks[i]?.tip}
            />
          ))}
          <line className={s.nul} x1={0} x2={B} y1={sc.nul} y2={sc.nul} />
        </svg>

        {sc.ticks.map((t) => (
          <span key={t.waarde} className={s.as} style={{ top: t.y }}>
            {as(t.waarde)}
          </span>
        ))}

        {sc.staven.map((st, i) =>
          toonX(st.label, i) || st.laatste ? (
            <span
              key={st.label}
              className={s.maand}
              // het laatste label rechts uitlijnen op zijn staaf, zodat het nooit buiten het vak valt
              style={st.laatste ? { left: pct(st.x + st.b, B), transform: "translateX(-100%)", fontWeight: 700, color: "var(--inkt)" } : { left: pct(st.x + st.b / 2, B) }}
            >
              {st.label}
            </span>
          ) : null,
        )}

        {laatste ? (
          <span
            className={`${s.staaflabel} ${s.halo} ${laatste.waarde < 0 ? s.onder : ""}`}
            style={{ left: pct(laatste.x + laatste.b, B), top: laatste.waarde < 0 ? laatste.y + laatste.h : laatste.y }}
          >
            {fmt(laatste.waarde)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
