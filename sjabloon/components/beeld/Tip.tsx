"use client";
// LAAG 3: één tooltiplaag voor de hele site. Werkt op elk element met data-tip, ook in server-SVG.
// De tekst staat dus al in de HTML (het attribuut); dit maakt hem alleen zichtbaar bij aanwijzen of focus.
// Voor schermlezers verandert er niets: de grafiek heeft een aria-label met de kernzin.
import { useEffect, useRef, useState } from "react";
import s from "./beeld.module.css";

type Stand = { tekst: string; left: number; top: number } | null;

export function Tip() {
  const [stand, setStand] = useState<Stand>(null);
  const vak = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zoek = (el: EventTarget | null) => (el instanceof Element ? el.closest("[data-tip]") : null);
    // Plaats boven het punt, binnen het scherm. De maat van het vak komt van de vorige tekst; dat is goed genoeg.
    const plaats = (tekst: string, x: number, y: number): Stand => {
      const b = vak.current?.offsetWidth ?? 220;
      const h = vak.current?.offsetHeight ?? 40;
      const left = Math.min(Math.max(x - b / 2, 16), window.innerWidth - b - 16);
      const top = y - h - 14 < 8 ? y + 18 : y - h - 14;
      return { tekst, left, top };
    };
    const toon = (e: PointerEvent) => {
      const tekst = zoek(e.target)?.getAttribute("data-tip");
      setStand(tekst ? plaats(tekst, e.clientX, e.clientY) : null);
    };
    const focus = (e: FocusEvent) => {
      const doel = zoek(e.target);
      const tekst = doel?.getAttribute("data-tip");
      if (!doel || !tekst) return;
      const r = doel.getBoundingClientRect();
      setStand(plaats(tekst, r.left + r.width / 2, r.top));
    };
    const weg = () => setStand(null);
    document.addEventListener("pointermove", toon, { passive: true });
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", weg);
    window.addEventListener("scroll", weg, { passive: true });
    return () => {
      document.removeEventListener("pointermove", toon);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", weg);
      window.removeEventListener("scroll", weg);
    };
  }, []);

  return (
    <div
      ref={vak}
      className={s.tip}
      aria-hidden="true"
      style={{ left: stand?.left ?? 0, top: stand?.top ?? 0, visibility: stand ? "visible" : "hidden" }}
    >
      {stand?.tekst}
    </div>
  );
}
