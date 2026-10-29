---
name: databron-ververs
description: Laat een Databron-project zichzelf bijhouden - een GitHub Action of cron op het ritme van de bron die ophaalt, toetst en alleen bij een groene toets publiceert (direct of via een PR met het rapport), met een tijdbudget en een melding als iets faalt. Gebruik dit als de site moet blijven kloppen zonder dat iemand iets doet.
---

# Databron: verversen

Doel: de site blijft vers zonder hulp, en breekt nooit. Vereist een repo op GitHub: staat die er nog niet, dan eerst
`databron-live` (na een ja van de gebruiker). De keten: **oogst → toets → publiceer → cache legen →
opwarmen → (eventueel) mail**.

## Stappen

1. **Het ritme van de bron.** Lees in `bronnen.yaml` wanneer de bron publiceert en hoeveel hij achterloopt. Plan de
   run daarna (publiceert de bron rond de 15e, draai dan op de 16e). Dagelijks is voor bijna alles genoeg;
   uurlijks alleen als de vraag erom vraagt.
2. **Waar draait het?** Standaard in GitHub Actions (`.github/workflows/oogst.yml` uit het sjabloon): lange looptijd,
   geen functielimiet, gratis voor openbare repo's. Een cron op het platform alleen voor kleine stappen (cache legen,
   een snelle versheidscheck).
3. **Twee standen**, kies per project:
   - **direct**: toets groen → commit `data/` (trede 1) of publiceer de versie (trede 2). Voor een dagelijkse monitor.
   - **via PR**: de run opent een pull request met `toets/rapport.md` als tekst; een mens merget. Voor grote of
     zeldzame wijzigingen (een jaarlijkse release, een herindeling). Zet "Allow GitHub Actions to create pull
     requests" aan.
4. **Concurrency**: een `concurrency`-groep zodat twee runs elkaar niet raken.
5. **Tijdbudget**: een backfill gaat in stukken ("de rest komt morgen"), met een state-bestand of de laatste periode
   in de data als startpunt.
6. **Na publicatie**: op trede 1 deployt de host vanzelf na de commit. Op trede 2: `revalidateTag` via een beveiligde
   route (`Authorization: Bearer $CRON_SECRET`) en een opwarmronde langs de belangrijkste pagina's.
7. **Melden als het faalt**: een rode run mailt GitHub al; zet daarnaast in `data/run.json` wat er misging, zodat de
   site het kan tonen ("De laatste ophaalronde van 18 oktober mislukte; de cijfers zijn van 17 oktober").
8. **Valkuilen** (`databron-live/references/github.md`): UTC, vertraagde starts, uitgeschakelde schema's na 60 dagen
   zonder activiteit in openbare repo's, `GITHUB_TOKEN` start geen nieuwe workflows, bot-bescherming van de host.

## Poort

Eén echte run met `gh workflow run oogst.yml` is groen, en een run met een kapotte bron (tijdelijk een foute URL via een
`workflow_dispatch`-invoer) laat de vorige stand staan, commit niets, en zegt in het log en in `data/run.json` wat er
misging.
