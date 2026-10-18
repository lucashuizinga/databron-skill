// Jaarlijnen: elk jaar een lijn van januari tot december. Het lopende jaar dik in het onderwerp-accent,
// vorig jaar donkergrijs, oudere jaren licht, optioneel een band (bijvoorbeeld 8 van de 10 jaren uit 1991–2020).
// Server-component: de SVG en alle tekst staan in de HTML.
import { jaarlijnenScene, pct, type JaarlijnenInvoer } from "@/lib/beeld/vorm.ts";
import { maandNaam } from "@/lib/duid.ts";
import s from "./beeld.module.css";

const B = 1000; // breedte van de scène in eenheden; de SVG rekt mee met het vak

export function Jaarlijnen(props: {
  invoer: JaarlijnenInvoer;
  aria: string;
  hoogte?: number; // in pixels; ook de hoogte van de scène, zodat labels in pixels botsen
  punt?: { titel: string; waarde: string };
  tips?: (string | null)[]; // één per maand, voor de tooltiplaag
  as?: (v: number) => string;
  animeer?: boolean;
}) {
  const H = props.hoogte ?? 320;
  const sc = jaarlijnenScene(props.invoer, B, H, 16);
  const as = props.as ?? ((v: number) => String(v));
  const puntLinks = sc.punt ? sc.punt.x / B > 0.86 : false;
  const animeer = props.animeer ?? true;

  return (
    <div className={s.omhulsel} role="img" aria-label={props.aria}>
      <div className={s.vak} style={{ height: H }}>
        <svg className={s.svg} viewBox={`0 0 ${B} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {sc.ticks.map((t) => (
            <line key={t.waarde} className={t.waarde === 0 ? s.nul : s.raster} x1={0} x2={B} y1={t.y} y2={t.y} />
          ))}
          {sc.paden.band ? <path className={s.band} d={sc.paden.band} /> : null}
          {sc.paden.context.map((d, i) => (
            <path key={i} className={s.context} d={d} />
          ))}
          {sc.paden.midden ? <path className={s.midden} d={sc.paden.midden} /> : null}
          {sc.paden.vorig ? <path className={s.vorig} d={sc.paden.vorig} /> : null}
          <path className={`${s.lopend} ${animeer ? s.teken : ""}`} d={sc.paden.lopend} />
          {props.tips
            ? sc.maanden.map((m) =>
                props.tips?.[m.maand - 1] ? (
                  <rect key={m.maand} className={s.raak} x={m.x} y={0} width={m.breedte} height={H} data-tip={props.tips[m.maand - 1]!} />
                ) : null,
              )
            : null}
        </svg>

        {sc.ticks.map((t) => (
          <span key={t.waarde} className={s.as} style={{ top: t.y }}>
            {as(t.waarde)}
          </span>
        ))}

        {sc.maanden.map((m) => (
          <span key={m.maand} className={s.maand} style={{ left: pct(m.x + m.breedte / 2, B) }}>
            <span className={s.lang}>{maandNaam(m.maand, true)}</span>
            <span className={s.kort}>{maandNaam(m.maand, true).slice(0, 1)}</span>
          </span>
        ))}

        {sc.eindlabels.map((l) => (
          <span key={l.id} className={`${s.eindlabel} ${l.id === "vorig" ? s.vorigL : ""}`} style={{ top: l.y }}>
            {l.tekst}
          </span>
        ))}

        {sc.punt ? (
          <>
            <span className={`${s.punt} ${animeer ? s.verschijn : ""}`} style={{ left: pct(sc.punt.x, B), top: sc.punt.y }} />
            {props.punt ? (
              <span className={`${s.puntlabel} ${s.halo} ${puntLinks ? s.links : ""}`} style={{ left: pct(sc.punt.x, B), top: sc.punt.y }}>
                <b>{props.punt.titel}</b>
                <span>{props.punt.waarde}</span>
              </span>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
