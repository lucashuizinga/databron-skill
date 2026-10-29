# GitHub als motor

## De vaste opbouw (staat al in het sjabloon)

- `main` is productie; elke andere branch krijgt een preview bij de host.
- `.github/workflows/ci.yml`: typecheck, tests, toets en build bij elke push.
- `.github/workflows/oogst.yml`: dagelijks op schema en met de hand te starten (`workflow_dispatch`), met een
  `concurrency`-groep. Haalt op, toetst, en commit `data/` alleen als de toets slaagt en er iets veranderde.
  Op trede 1 is git zo de volledige historie: elke commit is een versie, `git log -p data/` laat zien wat de bron veranderde.
- `.github/ISSUE_TEMPLATE/`: "Nieuwe bron toevoegen" en "Fout in een cijfer melden" (het correctiekanaal).
- `.env.example`: de namen van alle geheimen, zonder waarden.

## Geheimen

- Namen in `.env.example`; waarden nooit in git, chat of log.
- Zetten via een invoerprompt: `! gh secret set NAAM` (voor Actions) en bij de host (`vercel env add`,
  `wrangler secret put`). Vergelijk daarna alleen de namen: `gh secret list` tegen `.env.example`.
- Zet in de repo-instellingen secret scanning met push protection aan, en Dependabot.

## Valkuilen

- Geplande workflows draaien in UTC en kunnen vertraagd starten.
- In openbare repo's schakelt GitHub geplande workflows uit na 60 dagen zonder activiteit. De oogst-commit telt als
  activiteit; komt er wekenlang geen nieuwe data, zet dan een maandelijkse "hartslag"-commit in `data/run.json`.
- Een Action mag standaard geen pull request openen: Settings → Actions → General → "Allow GitHub Actions to create
  and approve pull requests" (nodig als `databron-ververs` met PR's werkt).
- Een commit met `GITHUB_TOKEN` start geen nieuwe workflows. Laat de deploy via de koppeling met de host lopen.
- Bot-bescherming bij de host kan je eigen Action blokkeren (429): gebruik de bypass-token van de host.
