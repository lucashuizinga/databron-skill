// Reeks: een tijdreeks in het accent, met optioneel een vergelijkingslijn (stippel), bijvoorbeeld NL tegen EU
// of een jaar tegen een voortschrijdend gemiddelde. Labels aan het eind van de lijn, geen legenda.
import { pct, plaatsLabels, reeksScene } from "@/lib/beeld/vorm.ts";
import s from "./beeld.module.css";

const B = 1000;

export function Reeks(props: {
  punten: { periode: string; waarde: number | null; vergelijk?: number | null }[];
  aria: string;
  labels: { lijn: string; vergelijk?: string };
  hoogte?: number;
  vanafNul?: boolean;
  as?: (v: number) => string;
  xLabel?: (periode: string, i: number) => string | null;
}) {
  const H = props.hoogte ?? 240;
  const sc = reeksScene(props.punten, B, H, { vanafNul: props.vanafNul, xLabel: props.xLabel });
  const as = props.as ?? ((v: number) => String(v));
  const labels = [
    sc.eind ? { id: "lijn", y: sc.eind.y, hoogte: 16 } : null,
    sc.eindVergelijk && props.labels.vergelijk ? { id: "vergelijk", y: sc.eindVergelijk.y, hoogte: 16 } : null,
  ].filter((x) => x !== null);
  const plek = plaatsLabels(labels, { min: 0, max: H });

  return (
    <div className={s.omhulsel} role="img" aria-label={props.aria}>
      <div className={s.vak} style={{ height: H }}>
        <svg className={s.svg} viewBox={`0 0 ${B} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {sc.ticks.map((t) => (
            <line key={t.waarde} className={t.waarde === 0 && props.vanafNul ? s.nul : s.raster} x1={0} x2={B} y1={t.y} y2={t.y} />
          ))}
          {sc.vergelijk ? <path className={s.vergelijk} d={sc.vergelijk} /> : null}
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
        {sc.eind ? (
          <span className={`${s.eindlabel} ${s.halo}`} style={{ top: plek.get("lijn"), color: "var(--onderwerp)", fontWeight: 700 }}>
            {props.labels.lijn}
          </span>
        ) : null}
        {sc.eindVergelijk && props.labels.vergelijk ? (
          <span className={`${s.eindlabel} ${s.halo}`} style={{ top: plek.get("vergelijk") }}>
            {props.labels.vergelijk}
          </span>
        ) : null}
      </div>
    </div>
  );
}
