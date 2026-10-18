// De Databron-indeling in Drizzle (Postgres/Neon). Voor Cloudflare D1: dezelfde tabellen met drizzle-orm/sqlite-core
// (jsonb → text met mode "json", timestamp → integer met mode "timestamp"). Zie references/schema.md voor de regels.
import { pgTable, text, integer, boolean, numeric, jsonb, timestamp, serial, primaryKey, index, pgView } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bron = pgTable("bron", {
  id: text("id").primaryKey(),
  naam: text("naam").notNull(),
  uitgever: text("uitgever"),
  licentie: text("licentie"),
  robotsAfweging: text("robots_afweging"),
  ritme: text("ritme"),
  url: text("url"),
  odi: text("odi"), // id in Open Data Index
});

export const run = pgTable("run", {
  id: serial("id").primaryKey(),
  bronId: text("bron_id").references(() => bron.id),
  begon: timestamp("begon", { withTimezone: true }).notNull().defaultNow(),
  klaar: timestamp("klaar", { withTimezone: true }),
  status: text("status").notNull().default("bezig"), // bezig | ok | fout | geweigerd (waakhond)
  nieuw: integer("nieuw").notNull().default(0),
  gewijzigd: integer("gewijzigd").notNull().default(0),
  fouten: jsonb("fouten").$type<string[]>().notNull().default([]),
  ruwPad: text("ruw_pad"),
});

export const versie = pgTable("versie", {
  id: serial("id").primaryKey(),
  aangemaakt: timestamp("aangemaakt", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("kandidaat"), // kandidaat | gepubliceerd | afgewezen
  rapport: text("rapport"),
  checksum: text("checksum"),
});

export const entiteit = pgTable("entiteit", {
  code: text("code").primaryKey(), // officiële code: GM0363, NL, BU03630001, 260
  soort: text("soort").notNull(), // land | provincie | gemeente | wijk | buurt | station | …
  naam: text("naam").notNull(),
  ouder: text("ouder"),
  indeling: integer("indeling"), // jaargang van de gebiedsindeling
}, (t) => [index("entiteit_ouder_idx").on(t.ouder)]);

export const maat = pgTable("maat", {
  id: text("id").primaryKey(),
  naam: text("naam").notNull(),
  eenheid: text("eenheid").notNull(),
  soort: text("soort").notNull(), // telling | mediaan | gemiddelde | aandeel | score
  hogerIsBeter: boolean("hoger_is_beter"), // null = geen oordeel
  decimalen: integer("decimalen").notNull().default(0),
  bronId: text("bron_id").references(() => bron.id),
  definitie: text("definitie"),
  aanroep: text("aanroep"), // de exacte aanroep die dit cijfer levert
  nullenWeggelaten: boolean("nullen_weggelaten").notNull().default(false),
});

export const waarneming = pgTable("waarneming", {
  maatId: text("maat_id").notNull().references(() => maat.id),
  entiteit: text("entiteit").notNull().references(() => entiteit.code),
  periode: text("periode").notNull(), // 2025 | 2025-Q3 | 2025-09 | 2025-09-14
  dims: jsonb("dims").$type<Record<string, string>>(),
  dimsSleutel: text("dims_sleutel").notNull().default(""),
  waarde: numeric("waarde", { mode: "number" }), // null = de bron noemt het zonder getal; nooit stil 0
  status: text("status").notNull().default("definitief"), // voorlopig | definitief
  vlag: text("vlag"),
  versieId: integer("versie_id").notNull().references(() => versie.id),
  runId: integer("run_id").references(() => run.id),
  ruwRef: text("ruw_ref"),
}, (t) => [
  primaryKey({ columns: [t.maatId, t.entiteit, t.periode, t.dimsSleutel, t.versieId] }),
  index("waarneming_kaart_idx").on(t.maatId, t.periode),
  index("waarneming_reeks_idx").on(t.entiteit, t.maatId),
]);

// De geldende stand: per sleutel de waarde uit de nieuwste gepubliceerde versie.
export const actueel = pgView("actueel").as((qb) =>
  qb.selectDistinctOn([waarneming.maatId, waarneming.entiteit, waarneming.periode, waarneming.dimsSleutel])
    .from(waarneming)
    .innerJoin(versie, sql`${versie.id} = ${waarneming.versieId} and ${versie.status} = 'gepubliceerd'`)
    .orderBy(waarneming.maatId, waarneming.entiteit, waarneming.periode, waarneming.dimsSleutel, sql`${waarneming.versieId} desc`),
);
