// Omhulsel van elke grafiek: de bevinding als kop, een onderregel met eenheid en peildatum, de grafiek, en de bron.
import type { ReactNode } from "react";
import s from "./beeld.module.css";

export function Bevinding(props: {
  kop: string;
  onder: string;
  bron: string; // naam van de bron en peildatum, als zin
  aanroep?: { href: string; tekst: string }; // link naar de exacte aanroep
  id?: string;
  niveau?: 2 | 3;
  children: ReactNode;
}) {
  const Kop = props.niveau === 3 ? "h3" : "h2";
  return (
    <figure className={s.bevinding} id={props.id}>
      <figcaption>
        <Kop className={s.kop}>{props.kop}</Kop>
        <p className={s.onder}>{props.onder}</p>
      </figcaption>
      <div className={s.grafiek}>{props.children}</div>
      <p className={s.bron}>
        Bron: {props.bron}
        {props.aanroep ? (
          <>
            {" "}
            <a href={props.aanroep.href}>{props.aanroep.tekst}</a>
          </>
        ) : null}
      </p>
    </figure>
  );
}
