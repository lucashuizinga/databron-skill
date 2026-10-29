// De waarnemingen per maat als JSON-download, statisch gebouwd: /data/tg
import { leesMaten } from "@/lib/data.ts";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await leesMaten()).map((m) => ({ maat: m.id }));
}

export async function GET(_req: Request, { params }: RouteContext<"/data/[maat]">) {
  const { maat } = await params;
  if (!/^[a-z0-9-]+$/.test(maat)) return new Response("Onbekende maat", { status: 404 });
  // Het bestand zoals het in git staat, ongewijzigd: dan klopt de checksum ook voor wie het downloadt.
  const tekst = await readFile(join(process.cwd(), "data", "waarnemingen", `${maat}.json`), "utf8");
  return new Response(tekst, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `inline; filename="${maat}.json"`,
    },
  });
}
