# Onderzoek: de Claude Code-plugin "Compound Engineering" (Every)

Gelezen op 18 oktober 2026, alleen lezend. Basispad hieronder: `~/.claude/plugins/cache/compound-engineering-plugin/compound-engineering/3.19.0/` (afgekort tot `CE/`). Ter vergelijking stond 2.65.0 ernaast.

## 1. De filosofie

### Wat "compound" betekent

Het idee is samengestelde rente op engineeringwerk. Gewoon softwarewerk wordt per feature zwaarder. Hier moet elke ronde de volgende juist lichter maken, omdat de lessen worden opgeschreven en de volgende agent ze leest.

Kernzinnen:

- README (`CE/README.md`): "**Each unit of engineering work should make subsequent units easier -- not harder.**" en "Traditional development accumulates technical debt. [...] Compound engineering inverts this. 80% is in planning and review, 20% is in execution."
- Ook README: "A good brainstorm makes the plan sharper. A good plan makes execution smaller. A good review catches the pattern, not just the bug. A good compound note means the next agent does not have to learn the same lesson from scratch."
- `CE/skills/ce-compound/SKILL.md`: "The first time you solve a problem takes research. Document it, and the next occurrence takes minutes. Knowledge compounds."
- Het eerste stuk (Kieran Klaassen, Every *Source Code*, 18 aug 2025): "every pull request teaches the system, every bug becomes a permanent lesson, and every code review updates the defaults." en "AI engineering makes you faster today. Compounding engineering makes you faster tomorrow, and each day after." Over fixes: "Every bug fix feels half-done if it doesn't prevent its entire category going forward." En: "CLAUDE.md becomes your taste in plain language."
- Het methodestuk (Dan Shipper en Kieran Klaassen, *Chain of Thought*, 11 dec 2025): "Roughly 80 percent of compound engineering is in the plan and review parts, while 20 percent is in the work and compound." Het contrast: bij traditioneel werk "you expect each feature to make the next feature harder to build".

### De lus

In het artikel heeft de lus vier stappen: **plan → work → assess/review → compound**. In de plugin (3.19) zijn het er zes geworden: **brainstorm → plan → work → simplify → review → compound**. Daarbij komt een terugpijl: `/ce-compound` schrijft naar `docs/solutions/`, en `/ce-brainstorm` en `/ce-plan` lezen dat bij de volgende ronde in. De README zegt: "That return arrow is the whole point." Het schema staat in `CE/docs/skills/README.md`.

Rond de lus staan nog skills die er niet strikt bij horen: `ce-ideate` (wat moeten we bouwen?), `ce-strategy` (`STRATEGY.md` als anker), `ce-product-pulse` (wat gebruikers echt merkten, de buitenste lus), `ce-compound-refresh` (onderhoud van de kennis) en `ce-debug` (voor bugs in plaats van brainstorm/plan/work). `lfg` draait de hele lus zonder tussenkomst tot een groene PR.

### Waarom elke ronde makkelijker wordt

Drie mechanismen houden dat in stand:

1. **Duurzame artefacten tussen de stappen.** De brainstorm schrijft een "requirements-only unified plan" in `docs/plans/`. `ce-plan` verrijkt **hetzelfde bestand** tot `implementation-ready`, met stabiele ID's (R-, U-, AE-ID's). `ce-work` voert dat uit. Zo hoeft geen stap opnieuw onderzoek te doen dat al gedaan is (`CE/CONCEPTS.md`, "Pipeline").
2. **Lessen worden gezocht vóór het werk.** Een learnings-researcher draait bij elke plan, review en ideate-run.
3. **Vindbaarheid wordt bewaakt.** Na elke compound-run kijkt de skill of het instructiebestand van het project (`AGENTS.md`/`CLAUDE.md`) een nieuwe agent wel naar `docs/solutions/` stuurt.

## 2. De opbouw

### Wat erin zit (3.19.0)

- **30 skills, 0 losse agents, geen hooks, geen commands.** README: "The `compound-engineering` plugin currently ships 30 skills and 0 standalone agents." Hooks komen alleen voor in testfixtures (`CE/tests/fixtures/sample-plugin/hooks/`). Het enige command is repo-intern: `CE/.claude/commands/triage-prs.md`.
- Specialisten (reviewers, researchers) zijn **prompt-assets binnen de skill**, zonder frontmatter: `skills/<skill>/references/agents/*.md` of `references/personas/*.md`. De skill leest het bestand en start een generieke subagent met die tekst als prompt. Uit `CE/AGENTS.md`: "These prompt assets must not include YAML frontmatter. Model selection, tool constraints, and dispatch policy belong in the calling skill's `SKILL.md`".
- Elke skill staat op zichzelf: hij verwijst niet naar bestanden buiten zijn eigen map. Gedeelde bestanden worden **byte voor byte gekopieerd** (bijvoorbeeld `repo-profile-cache.py` in zes skills), en een paritytest bewaakt dat ze gelijk blijven (`CE/tests/repo-profile-cache-parity.test.ts`).

### Hoe skills elkaar aanroepen

- Bij naam ("Invoke the `ce-plan` skill with `$ARGUMENTS`", `CE/skills/lfg/SKILL.md`), met **mode-tokens** in de argumenten: `mode:headless`, `mode:agent`, `mode:return-to-caller`, `mode:pipeline`, `output:html`, `plan:<pad>`, `depth:full`. Zo werkt één skill zowel interactief als als stap in een pijplijn.
- Tussen de stappen staan harde **GATEs**. Een voorbeeld uit `lfg`: "GATE: STOP. [...] verify that the `ce-plan` workflow produced a plan file in `docs/plans/`." `ce-work` geeft in return-to-caller-modus een gestructureerde envelop terug (`status`, `changed_files`, `verification_evidence` …). `lfg` gaat pas verder als die envelop compleet is.
- Plan-metadata stuurt de route: `artifact_contract: ce-unified-plan/v1`, `artifact_readiness: requirements-only | implementation-ready`, `execution: code | knowledge-work` (`CE/skills/ce-work/SKILL.md`, Phase 0).

### Verpakking en versies

- Manifest per platform: `.claude-plugin/plugin.json` + `marketplace.json`, `.codex-plugin/`, `.cursor-plugin/`, `.kimi-plugin/`, `.grok-plugin/`, `.devin-plugin/`, `.opencode/`, `.pi/`, `.agy/`. In de root staan nog `plugin.json` (Antigravity-schema), `GEMINI.md` (runtimecontext voor Antigravity/Gemini; "not contributor guidance") en `CLAUDE.md`, dat alleen `@AGENTS.md` bevat.
- `CE/src/` is een Bun/TypeScript-CLI die een Claude-plugin omzet naar andere platforms. Elk platform heeft een converter en een writer (`src/converters/claude-to-*.ts`, `src/targets/*.ts`), plus een "install manifest" zodat de CLI nooit bestanden overschrijft die de gebruiker zelf heeft aangepast.
- Versies regelt **release-please** (conventional commits, `CE/scripts/release/{preview,validate,sync-metadata}.ts`). Met de hand ophogen is verboden. Een kleinigheid: de cache heet 3.19.0, maar `CHANGELOG.md` begint bij 3.13.1, want GitHub Releases zijn de bron.
- `CE/tests/` (±55 testbestanden) test ook **de inhoud van de skills**: verwijzingen moeten binnen de skill blijven en bestaan, er mogen geen platformvariabelen zonder fallback in staan, frontmatterlimieten, shell-veiligheid, gelijke kopieën (`skill-conventions.test.ts`, `skill-shell-safety.test.ts`, `review-skill-contract.test.ts`).

### Wat er veranderde sinds 2.65.0

| 2.65.0 (april 2026) | 3.19.0 (juli 2026) |
|---|---|
| 53 losse agents in `agents/{review,research,design,docs,workflow,document-review}/` met frontmatter (`model`, `tools`, `color`) | 0 agents; alles als prompt-asset in de skill |
| ~40 skills, veel Rails/Ruby (`dhh-rails-style`, `andrew-kane-gem-writer`, `kieran-rails-reviewer`, `dspy-ruby`) | 30 skills, stack-neutraal; Rails-persona's weg |
| Namen gemengd (`git-commit`, `document-review`, `ce-review`) | Overal het `ce-`voorvoegsel (3.0.0, breaking) |
| Alleen Claude-manifest | Tien platforms native |
| Vertrouwensscore 0,60–0,80 (continu) | Vaste ankers 0/25/50/75/100 met gedragscriteria |

De reden staat in `CE/docs/brainstorms/2026-06-19-agentless-plugin-surface-reduction-requirements.md`: "Public skills should represent user-facing jobs, not convenience wrappers around specialist agents." En: "Prefer skill-local duplication over shared agent infrastructure."

## 3. Kennis vastleggen en terugvinden

### Waar en in welk formaat

- **`docs/solutions/<categorie>/<slug>.md`**: één les per bestand. In de bestandsnaam staat geen datum; de datum staat in de frontmatter.
- **`CONCEPTS.md`** in de root: een woordenlijst van projecttermen ("Glossary only, not a spec or catch-all").
- `docs/plans/` (plannen), `docs/brainstorms/` (oude requirements), `docs/residual-review-findings/` (reviewpunten die openbleven).

De frontmatter ligt vast in `CE/skills/ce-compound/references/schema.yaml`. Er zijn twee sporen:

- **Bug-track** (`build_error`, `runtime_error`, `performance_issue`, `integration_issue` …). Verplicht: `symptoms`, `root_cause` (enum), `resolution_type` (enum). Secties: Problem, Symptoms, **What Didn't Work**, Solution, Why This Works, Prevention.
- **Knowledge-track** (`best_practice`, `convention`, `tooling_decision`, `architecture_pattern` …). Optioneel: `applies_when`. Secties: Context, Guidance, Why This Matters, When to Apply, Examples.
- Altijd verplicht: `module`, `date`, `problem_type`, `component`, `severity`. Optioneel: `tags` (max 8). Bij een update van een bestaand bestand komt er `last_updated` bij, en bij verouderde kennis `status: stale` + `stale_reason`.

De `component`-enum is nog die van hun eigen product: `brief_system`, `email_processing`, `rails_model`. Die zou je dus vervangen. Sjablonen staan in `CE/skills/ce-compound/assets/resolution-template.md`. Een echt voorbeeld: `CE/docs/solutions/skill-design/strong-models-mask-defensive-skill-fixes.md`.

### Hoe een les wordt geschreven (`ce-compound`, 732 regels)

1. **Fase 1:** drie subagents tegelijk. Een *Context Analyzer* maakt de frontmatter en kiest de categorie. Een *Solution Extractor* schrijft de tekst. Een *Related Docs Finder* zoekt bestaande lessen en scoort de **overlap** op vijf dimensies. Ze schrijven naar `/tmp/compound-engineering/ce-compound/<run-id>/` en geven alleen een pad terug. Daarnaast een goedkope zoektocht door eerdere sessies, die alleen doorgaat bij een relevante treffer.
2. **Fase 2:** alleen de orchestrator schrijft. Bij hoge overlap wordt het bestaande bestand bijgewerkt in plaats van een dubbel gemaakt. Een script valideert de frontmatter.
3. **Fase 2.4:** termen vastleggen in `CONCEPTS.md`.
4. **Fase 2.45, grounding:** `scripts/validate-doc-claims.py` controleert of genoemde paden, SHA's en links bestaan. Daarna toetst een leessubagent elke bewering aan de bron, met `file:line`. "A claim that cannot be verified against the tree is softened or attributed."
5. **Fase 2.5:** alleen bij duidelijk bewijs `ce-compound-refresh` voorstellen voor oude lessen die nu niet meer kloppen.
6. **Discoverability check:** stuurt het instructiebestand een agent naar `docs/solutions/`? Zo niet, dan stelt de skill één regel voor, beschrijvend en niet dwingend ("relevant when implementing or debugging in documented areas").

Daarbij gelden twee regels: "One learning per run." en "Preconditions: problem solved, verified, non-trivial". `ce-debug` biedt compounding alleen aan als je de les in één zin kunt formuleren.

### Hoe een les wordt teruggevonden

Via `references/agents/learnings-researcher.md`, dat in ce-plan, ce-code-review, ce-ideate en andere skills zit. Het zoekt eerst met grep en leest daarna pas:

1. `CONCEPTS.md` lezen voor de juiste termen.
2. Trefwoorden halen uit een `<work-context>`-blok (Activity, Concepts, Decisions, Domains).
3. Parallel grep op frontmatter (`title:`, `tags:`, `module:`, `problem_type:`). Bij meer dan 25 treffers smaller zoeken, bij minder dan 3 breder.
4. Van de kandidaten alleen de eerste 30 regels lezen, scoren, en alleen sterke treffers helemaal lezen.
5. Maximaal 5 lessen teruggeven. "never let a past learning silently override present evidence"; vermeld de datum zodat de lezer kan zien of de les nog geldt.

Een harde regel: de lijst van `docs/solutions/` wordt **nooit gecachet**, omdat er net een nieuwe les bij kan zijn gekomen.

### Onderhoud

`ce-compound-refresh` (679 regels) loopt de lessen langs tegen de huidige code, met vijf uitkomsten: **Keep / Update / Consolidate / Replace / Delete**. Eerst de losse lessen, daarna de patroondocs die erop leunen. In headless-modus markeert hij twijfelgevallen als `stale` in plaats van te gokken.

## 4. Hoe een goede SKILL.md er bij hen uitziet

### Structuur

- Frontmatter met alleen `name`, `description`, `argument-hint` (soms `disable-model-invocation: true`, zoals bij `lfg`). De description is een **activatiecontract**: wanneer de skill wél draait en welke verwante vraag ergens anders hoort ("use ce-debug for open-ended bugs").
- Dan doel en uitkomst, modi (tabel), eventueel vooraf opgehaalde context (`` !`git rev-parse --show-toplevel` `` met een fallback als dat niet lukte), een lijst met ondersteunende bestanden ("Read them on-demand at the step that needs them"), genummerde fases, "Common Mistakes" als tabel met fout en goed, en een vastgelegde eindoutput (in headless-modus met een eindsignaal zoals `Documentation complete`).
- Lengte loopt sterk uiteen: `ce-simplify-code` 62 regels, `lfg` 80, `ce-work` 432, `ce-code-review` 837. De lange skills verwijzen veel door naar `references/` (ce-plan: 29 bestanden).

### Schrijfregels (`CE/AGENTS.md` en `CE/docs/solutions/skill-design/portable-agent-skill-authoring.md`)

- "Start with the outcome and intent. Add only the smallest protocol needed to protect that outcome."
- Een regel mag alleen blijven als hij een toetsbare eis stelt, een bekende neiging van het model tegengaat of domeinkennis toevoegt die een beslissing verandert. "Be thorough" telt dus niet. De gids zet er een vervanging naast: in plaats van "Be thorough" → "Check every changed execution path and report any path you could not verify."
- Onderscheid **protocol** (paden, enums, volgorde, drempels, grenzen, completion) van **oordeel** (dat mag je aan het model overlaten). Zet aantallen en grenzen direct naast de handeling: "Return exactly three...".
- Naar `references/` gaat een blok dat voorwaardelijk is of laat in het verloop komt en minstens ~20% van de skill beslaat. Op de plek zelf blijft een "load stub" staan: welke inhoud het bestand heeft en wat er misgaat als je het overslaat. Nooit met `@`-include, want dat laadt het meteen mee.
- Scripts roep je aan met een pad dat het model zelf invult. Let op de puntkomma: `SKILL_DIR="<absolute path ...>";` op dezelfde regel, omdat de shell-state niet bewaard blijft tussen aanroepen.
- Beschrijf eerst de capaciteit, dan de tool: "the project's issue tracker (e.g., GitHub Issues, Linear, Jira)". Een tool die ontbreekt mag nooit stil overgeslagen worden.

### Subagents, parallel werk, verificatie

- Subagents schrijven hun volledige uitvoer naar `/tmp/...` en geven een pad terug. Dat lost een bekend probleem op: een subagent gaf soms alleen een samenvatting terug en de tekst zelf was weg ("issue #956").
- **Modelniveaus**: extraction / generation / ceiling, per skill vastgelegd en nooit met een modelnaam. Bijvoorbeeld: correctness- en security-reviewers draaien op het sessiemodel, de rest op een middenniveau.
- `ce-work` heeft een "Parallel Safety Check": niet alleen kijken of twee units dezelfde bestanden raken, ook gedeelde migraties, lockfiles en één dev-server tellen mee. Maximaal 3–5 workers. Alleen de orchestrator commit.
- Verificatie is bewijs: test eerst rood, dan groen, of een expliciete uitzondering met vervangende verificatie, vastgelegd als `verification_evidence`.

### Twee fragmenten van de schrijfstijl (ingekort)

Uit `ce-compound`, over waarom de skill niet vraagt welke modus:

> Mode selection (Full vs Lightweight) — decide it, don't ask it. [...] Choose Lightweight ONLY under real context pressure [...]. These are conditions the agent can observe and the user cannot, which is exactly why this is not a question.

Uit de correctness-persona (`ce-code-review/references/personas/correctness-reviewer.md`), het patroon "wat je zoekt / ankers / wat je níet meldt":

> **Anchor 75** — you can trace the full execution path from input to bug [...].
> **Anchor 25 or below — suppress** — the bug requires runtime conditions you have no evidence for.
> **What you don't flag:** Style preferences [...] Defensive coding suggestions [...] Only flag missing checks when the null/undefined can actually occur.

De toon: zakelijk en stellig. Elke regel krijgt een reden mee (vaak een issuenummer of de fout die hij voorkomt). Veel tabellen, weinig motivatie, en steeds een fallback voor andere platforms.

## 5. Review- en kwaliteitsmechanismen

- **`ce-code-review`**: 13 persona's in lagen. Altijd aan: correctness, testing, maintainability, project-standards, agent-native en learnings-researcher. Op voorwaarde: security, performance, api-contract, data-migration, reliability, adversarial, previous-comments. Per stack: frontend-races, swift-ios. Welke persona's meedoen is een oordeel over de diff, geen trefwoordmatch. Het team wordt vooraf aangekondigd, met één zin per extra reviewer.
- **Persona-opbouw**: rol, "What you're hunting for", vertrouwensankers, "What you don't flag", JSON-uitvoer volgens `references/findings-schema.json`.
- **Ankers in plaats van percentages**: alleen 0/25/50/75/100, elk met een gedragscriterium. 0 en 25 worden nooit gerapporteerd. Een bevinding op 75 of 100 moet **de exacte regel citeren** (`first_evidence`), anders zakt hij naar 50. Bevestiging door een tweede, onafhankelijke persona tilt hem één niveau op. De eigen snelle eerste lezing van de orchestrator blijft op maximaal 50 en telt niet als bevestiging.
- **Ernst P0–P3** staat los van de **autofix-klasse** (`gated_auto`, `manual`, `advisory`). Synthese kiest bij onenigheid de voorzichtigste route.
- **Een tweede model**: een adversarial pass via een ander modelfamilie-CLI (Codex als je in Claude zit, en omgekeerd). Die draait ernaast en blokkeert niet.
- **Kleine diff → lichte review**, maar het systeem kiest bij twijfel voor de volledige review. Een auth-wijziging van 12 regels krijgt dus toch alle reviewers.
- **`ce-doc-review`** doet hetzelfde voor plannen, met de persona's coherence, feasibility, product-lens, design-lens, security-lens, scope-guardian en adversarial.
- **`ce-simplify-code`**: drie reviewers (reuse, quality, efficiency). "Never simplify away a safety check", en de skill bewijst daarna met typecheck, lint en tests dat het gedrag gelijk bleef.
- **Beschermde artefacten**: geen enkele reviewer mag voorstellen om `docs/plans/` of `docs/solutions/` te verwijderen.
- **Skills testen**: `skill-creator`-evals, met de les "a strong model can mask a defensive fix". Een gelijkspel tussen oude en nieuwe tekst betekent dus niet vanzelf dat er niets verbeterde.

## 6. Wat slim en overneembaar is voor Open Data Index, en wat niet past

### Overnemen

1. **Eén les per bestand met frontmatter, naast of in plaats van één groot LEERPUNTEN.md.** `docs/LEERPUNTEN.md` is nu één groot document dat in elke sessie volledig in de context zit. Het CE-model (`docs/solutions/<categorie>/<slug>.md` + grep op frontmatter + alleen de top 5 helemaal lezen) schaalt beter. Een eigen schema ligt voor de hand: `bron: cbs-statline` (in plaats van `module`), `platform: odata-v3 | arcgis | ckan | wfs …`, `problem_type: robots | rate-limit | schemawijziging | codering | trendbreuk | fout-met-200 | licentie | stille-filter`, `peildatum`, `gemeten: ja/nee` (de herkomstlabels "beschrijving / gemeten / platform / leerpunt" zitten al in `lib/api.ts`). LEERPUNTEN.md kan dan een korte index worden die naar die bestanden wijst.
2. **Een eigen compound-skill met de vaste secties "What Didn't Work" en "Prevention".** Juist "wat werkte niet" (Node-`fetch` stuurt `Accept-Language: *`; `$filter` stil genegeerd) is de duurste kennis, en die staat nu verspreid.
3. **Grounding-validatie.** Bij data betekent dat: een bewering over een bron opnieuw meten voordat hij de kennisbank in gaat (de URL antwoordt nog, het aantal klopt, de datum staat erbij), of hem afzwakken ("gemeten op 16 okt 2026"). Dat past bij "niets verzinnen".
4. **Refresh met vijf uitkomsten en `status: stale`.** Bronkennis veroudert snel (ohsome v1 stopt, CBS-API's verschuiven, Tweede Kamer v4 → v5). Een refresh-skill die lessen tegen de statuscheck en een nieuwe meting houdt, is hier waardevoller dan bij code.
5. **Hoge overlap → bestaand bestand bijwerken.** Zo voorkom je dubbele leerpunten over dezelfde bron.
6. **De discoverability check** en `CONCEPTS.md` als woordenlijst ("herkomst", "blok", "haler", "oogster", "basis = eerste geslaagde oogst", "peildatum").
7. **Persona's met ankers en een verplicht citaat** voor een eigen review van nieuwe bronnen en blokken. Bijvoorbeeld: een *bronpersona* (robots.txt, licentie, user-agent), een *cijferpersona* (kop en dek uit de cijfers, procentpunten, voorlopige cijfers), een *grafiekpersona* (dataviz, kleurenblindheid, mobiel 390 px), een *i18n-persona* (`voor(taal)`, geen Nederlands in de Engelse dek). De regel "die bevinding citeert de regel of telt niet" is direct overneembaar.
8. **Subagents schrijven naar scratch en geven een pad terug.** Jullie werken al met parallelle agents, elk met eigen bestanden. Dit maakt het robuuster.
9. **Schrijfregels voor skills**: uitkomst eerst, geen "wees grondig", aantallen en grenzen naast de handeling, references alleen bij ~20%+ en voorwaardelijk.

### Past niet (of minder)

- **De git/PR-machinerie** (`ce-babysit-pr`, `ce-commit-push-pr`, worktrees, residual-review-bestanden, release-please). Lucas pusht direct naar `main` en Vercel deployt. Een PR-lus met CI-bewaking is daar overhead.
- **Multi-platformverpakking en de converter-CLI** (`src/`, tien manifesten, `SKILL_DIR`-ankers, fallbacks voor Codex/Gemini). Voor één gebruiker op Claude Code is dat onnodig. Gewone projectskills in `.claude/skills/` volstaan.
- **Test-first als standaardbewijs.** Bij grafieken en bronpagina's is het juiste bewijs een schermafbeelding (`scripts/shot.mjs`), een productiebuild (`pnpm build && pnpm start`), een `--droog`-run van de fabriek en een meting tegen de bron, niet een rode unittest.
- **De Rails-erfenis in het schema** (`component: brief_system`, `rails_model`) en codegerichte persona's (data-migration, swift-ios, frontend-races).
- **Het volle `lfg`-autopilotgevoel** past niet bij werk waar elke nieuwe bron een robots- en licentieafweging en soms een beslispunt voor Lucas vraagt. Een headless-modus die twijfel als "beslispunt" of `stale` markeert in plaats van te gokken, is wél overneembaar.
- **Het volume.** Skills van 700–800 regels zijn het product van een jaar bijschaven voor veel modellen. Begin klein (de ce-simplify-code-maat, 60–150 regels) en laat ze groeien op echte fouten. Dat is hun eigen regel.

## Bronnen

- Kieran Klaassen, "My AI Had Already Fixed the Code Before I Saw It", Every *Source Code*, 18 aug 2025: https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it
- Dan Shipper en Kieran Klaassen, "Compound Engineering: How Every Codes With Agents", Every *Chain of Thought*, 11 dec 2025: https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents
- GitHub-repo (25,6k sterren, beschrijving "Official Compound Engineering plugin for Claude Code, Codex, Cursor, and more"): https://github.com/EveryInc/compound-engineering-plugin
- Lokaal: `~/.claude/plugins/cache/compound-engineering-plugin/compound-engineering/3.19.0/` en `.../2.65.0/`
