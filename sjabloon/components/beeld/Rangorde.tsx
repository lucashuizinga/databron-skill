// Rangorde: gesorteerde horizontale balken, de eigen entiteit gemarkeerd. Gewone HTML: krimpt vanzelf mee.
import s from "./beeld.module.css";

export function Rangorde(props: {
  rijen: { id: string; naam: string; waarde: number }[];
  eigen?: string; // id van wat de lezer zoekt
  aria: string;
  waarde?: (v: number) => string;
  max?: number; // aantal rijen
}) {
  const fmt = props.waarde ?? ((v: number) => String(v));
  const rijen = [...props.rijen].sort((a, b) => b.waarde - a.waarde).slice(0, props.max ?? 12);
  // Balken vanaf 0; bij negatieve waarden schaalt de engine op de absolute waarde.
  const top = Math.max(...rijen.map((r) => Math.abs(r.waarde)), 1e-9);
  return (
    <ol className={s.rangorde} role="img" aria-label={props.aria}>
      {rijen.map((r) => (
        <li key={r.id} className={`${s.rang} ${r.id === props.eigen ? s.eigen : ""}`} data-tip={`${r.naam}: ${fmt(r.waarde)}`}>
          <span className={s.rangNaam}>{r.naam}</span>
          <span className={s.rangBalk} style={{ width: `${(Math.abs(r.waarde) / top) * 100}%` }} />
          <span className={s.rangWaarde}>{fmt(r.waarde)}</span>
        </li>
      ))}
    </ol>
  );
}
