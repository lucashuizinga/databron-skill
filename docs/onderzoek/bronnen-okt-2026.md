# Wat Databron overnam uit drie bronnen (19 oktober 2026)

Gelezen: de Compound Engineering-gids van Every (every.to/guides/compound-engineering), de Marketing Skills-collectie
(marketing-skills.com/skills, 50 skills van Corey Haines) en de apple-design-skill van Emil Kowalski
(github.com/emilkowalski/skills, naar de WWDC-talks van Apple). Per bron: wat we overnamen, waar het staat, en wat
bewust niet.

## Compound Engineering-gids

De kern: elke ronde maakt de volgende makkelijker. Plan, werk, review, *compound*. Wie de laatste stap overslaat, doet
"traditionele engineering met AI-hulp".

| Overgenomen | Waar in Databron |
|---|---|
| Een les is pas af als het systeem hem de volgende keer zelf vangt ("would the system catch this automatically?") | `databron-leer`, stap 6 "Maak het vangbaar", en de poort |
| Bevindingen met prioriteit (P1 moet, P2 zou moeten) en triage één tegelijk | `databron-review`, stap 4 en 5, `docs/review/<datum>.md` |
| De mens beoordeelt de bedoeling, de agents de uitvoering | `databron-review`, stap 6 |
| Plan-akkoord: stilte is geen akkoord | `databron`, regel 5; `databron-deel` (pitch) |
| Drie vragen aan elk resultaat: moeilijkste beslissing, verworpen alternatief, minst zeker | `databron`, regel 6 |
| Tijd naar plannen en reviewen (80/20), en elke ronde iets aan het systeem | `databron`, regel 7 en 9 |
| Overdracht: status, klaar, nog te doen, hoe verder | `databron`, regel 4 (vijf kopjes in `STAND.md`) |
| Agent-native: de agent kan zelf draaien, testen, kijken en logs lezen | `databron-start`, stap 2 |
| Marketing en copy uit het plan (release notes, schermafbeeldingen) | `databron-deel` |

Al in Databron vóór deze ronde: één les per bestand met frontmatter, parallelle reviewers met een eigen bestand,
smaak vastgelegd in een skill, de dirigent als keten (vergelijkbaar met `/lfg`).

Bewust niet: 26 agents en 40 tot 50 subagents per run (te zwaar voor een dataproject; zes reviewers is genoeg),
`--dangerously-skip-permissions` als advies (past niet bij beginners met `uitleg:veel`), git worktrees per taak
(trede 1 heeft één map en één Action).

## Marketing Skills

Acht groepen (SEO, copy, CRO, ads, lifecycle, groei, strategie, onderzoek), elk een korte skill met verwijzingen en
voorbeelden. Voor een dataproject telt een klein deel. Wat Databron miste, is de stap ná de site: gevonden, geciteerd
en gebruikt worden. Die staat nu in `databron-deel`.

| Uit | In `databron-deel` |
|---|---|
| ai-seo (structuur, bronvermelding, versheid) | §1 Citeerbaar: antwoordzin vooraan, peildatum in tekst, `dateModified` = laatste meting |
| schema | JSON-LD `Dataset` met dekking, distributie en licentie, gevalideerd in de poort |
| programmatic-seo, site-architecture | §2 Entiteitpagina's zonder dunne inhoud, links als een web |
| launch, public-relations, social | §3 Drie haakjes, eerst de bron en de betrokkenen, per platform een eigen tekst, de week erna |
| analytics | §4 Meten vanuit een vraag, zonder cookies als standaard |
| emails | §5 Bericht alleen bij echte verandering, dubbele bevestiging |

Ook van de site zelf geleerd: een uitleg voor wie skills nog niet kent, en per skill een voorbeeldopdracht. Dat staat
nu op databron.nl.

Bewust niet: advertenties, prijzen, betaalmuren, pop-ups, cold e-mail en sms. Een open-dataproject verdient zijn
bereik met een goede bevinding, niet met trechteroptimalisatie.

## apple-design-skill

Vooral beweging en gebaren; voor Databron telt de discipline eronder. Vijf regels staan nu in
`databron-beeld/references/smaak.md` (interface, doen): reageren bij indrukken, onderbreekbare beweging met veren
zonder overschot, letterspatiëring per grootte en optische grootte, "waar ben ik?" in de navigatie, en een plakkende
kop als doorschijnende laag met `prefers-reduced-transparency`. De reviewer Site controleert terugkoppeling en
reduced motion.

Bewust niet: momentumprojectie, rubberband-randen en haptiek. Databron-sites hebben weinig sleepgebaren; wie een kaart
of schuifregelaar bouwt, leest de skill zelf.
