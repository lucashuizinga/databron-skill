// Het deelbeeld: dezelfde antwoordzin en dezelfde jaarlijnen als op de pagina, uit dezelfde afleiding.
// Satori kent geen CSS-variabelen en geen filters: kleuren komen uit lib/beeld/tokens.ts.
// Elke container met meer dan één kind heeft display: flex nodig.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { jaarlijnenScene } from "@/lib/beeld/vorm.ts";
import { licht as t } from "@/lib/beeld/tokens.ts";
import { leesWaarnemingen } from "@/lib/data.ts";
import { antwoord, datum, datumKort, temperatuur } from "@/lib/duid.ts";
import { leidAf } from "@/lib/reken.ts";
import { SITE } from "@/lib/site.ts";

export const alt = SITE.vraag;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const letter = (f: string) => readFile(join(process.cwd(), "assets", "fonts", f));

export default async function Deelbeeld() {
  const [w, semibold, extrabold, lees] = await Promise.all([
    leesWaarnemingen("tg"),
    letter("SchibstedGrotesk-SemiBold.woff"),
    letter("SchibstedGrotesk-ExtraBold.woff"),
    letter("Newsreader-Regular.woff"),
  ]);
  const a = leidAf(w.rijen);
  const ant = antwoord(a);
  const W = 1072;
  const H = 230;
  const sc = jaarlijnenScene(
    {
      lopend: a.jaarlijnen.lopend,
      vorig: a.jaarlijnen.vorig,
      band: { onder: a.jaarlijnen.band.p10, boven: a.jaarlijnen.band.p90, midden: a.jaarlijnen.band.gem },
      labels: { lopend: String(a.lopend.jaar) },
    },
    W,
    H,
  );
  const p = sc.punt;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: t.papier, color: t.inkt, padding: "52px 64px 44px", fontFamily: "Schibsted" }}>
        <div style={{ display: "flex", fontSize: 28, color: t.inkt2, fontWeight: 600 }}>{SITE.vraag}</div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 46, lineHeight: 1.2, fontFamily: "Newsreader" }}>{ant.zin}</div>
        <div style={{ display: "flex", position: "relative", width: W, height: H, marginTop: "auto" }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {sc.ticks
              .filter((tk) => tk.waarde === 0)
              .map((tk) => (
                <line key={tk.waarde} x1={0} x2={W} y1={tk.y} y2={tk.y} stroke={t.inkt3} strokeWidth={1} />
              ))}
            <path d={sc.paden.band} fill={t.band} />
            <path d={sc.paden.midden} fill="none" stroke={t.context} strokeWidth={1.5} strokeDasharray="4 4" />
            <path d={sc.paden.vorig} fill="none" stroke={t.inkt2} strokeWidth={1.5} />
            <path d={sc.paden.lopend} fill="none" stroke={t.onderwerp} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
            {p ? <circle cx={p.x} cy={p.y} r={8} fill={t.onderwerp} stroke={t.papier} strokeWidth={3} /> : null}
          </svg>
          {p ? (
            <div style={{ position: "absolute", left: p.x + 16, top: p.y - 26, display: "flex", flexDirection: "column", fontSize: 22, lineHeight: 1.1 }}>
              <span style={{ color: t.onderwerp, fontWeight: 800 }}>{a.lopend.jaar}</span>
              <span style={{ color: t.inkt }}>{`${datumKort(a.lopend.tot)}: ${temperatuur(p.waarde)}`}</span>
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 20, color: t.inkt2 }}>
          {`KNMI daggegevens, De Bilt, tot en met ${datum(a.laatste)}. Lopend gemiddelde over 7 dagen; grijs is 1991–2020.`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Schibsted", data: semibold, weight: 600, style: "normal" },
        { name: "Schibsted", data: extrabold, weight: 800, style: "normal" },
        { name: "Newsreader", data: lees, weight: 400, style: "normal" },
      ],
    },
  );
}
