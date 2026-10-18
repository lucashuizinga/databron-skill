// Aandeel: een balk van 100 met directe labels. De delen moeten samen het geheel zijn.
import s from "./beeld.module.css";

export function Aandeel(props: {
  delen: { id: string; naam: string; waarde: number; kleur?: string }[];
  aria: string;
  waarde?: (deel: number, totaal: number) => string;
}) {
  const totaal = props.delen.reduce((t, d) => t + d.waarde, 0);
  const fmt = props.waarde ?? ((d: number, t: number) => `${Math.round((d / t) * 100)}%`);
  return (
    <div role="img" aria-label={props.aria}>
      <div className={s.aandeel}>
        {props.delen.map((d, i) => {
          const breed = d.waarde / totaal;
          const kleur = d.kleur ?? `var(--categorie-${(i % 5) + 1})`;
          return (
            <span key={d.id} className={s.deel} style={{ flexGrow: d.waarde, flexBasis: 0, background: kleur }} data-tip={`${d.naam}: ${fmt(d.waarde, totaal)}`}>
              {breed >= 0.18 ? fmt(d.waarde, totaal) : ""}
            </span>
          );
        })}
      </div>
      <div className={s.deelLabels}>
        {props.delen.map((d, i) => (
          <span key={d.id} style={{ ["--kleur" as string]: d.kleur ?? `var(--categorie-${(i % 5) + 1})` }}>
            {d.naam} {fmt(d.waarde, totaal)}
          </span>
        ))}
      </div>
    </div>
  );
}
