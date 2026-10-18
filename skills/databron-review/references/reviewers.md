# De zes reviewers

## Bron
**Zoekt**: robots.txt en voorwaarden niet gelezen of genegeerd; een browser-user-agent of geen user-agent; een 403 die
wordt omzeild; sleutels in code, logs, `data/` of git-geschiedenis; ontbrekende bronvermelding of licentie op de site;
een bron in de code die niet in `bronnen.yaml` staat.
**Meldt niet**: een bron die ontbreekt in Open Data Index (dat is geen fout).

## Cijfer
**Zoekt**: `null` die 0 wordt (`Number(x) || 0`, `?? 0` op een meting, `parseFloat` op lege tekst); percentages die als
procenten worden vergeleken in plaats van procentpunten; een periode zonder jaar; voorlopige cijfers zonder markering;
sommen die niet kloppen; een revisievenster dat ontbreekt; een constante die op twee plekken staat; afronden vóór
rekenen; `slice(-N)` op historie.
**Meldt niet**: stijlvoorkeuren in code.

## Grafiek
**Zoekt**: een kop die niet de bevinding is; een legenda waar labels aan de lijn kunnen; kleurlogica's door elkaar;
staven die niet bij 0 beginnen; botsende labels; geen aria-label; overloop op 390 px; een palet dat niet getest is; een
tweede y-as; meer dan drie taartdelen.
**Meldt niet**: een vorm die anders kan maar goed werkt.

## Taal
**Zoekt**: "nu", "momenteel", "deze maand", "live" bij achterlopende data; jargon; verkeerde meervouden; getallen zonder
eenheid; Engelse tekst met Nederlandse resten (of omgekeerd); de voorleestest die faalt; vaste getallen in redactionele
tekst die ook uit de data komen.
**Meldt niet**: woordkeus die smaak is maar klopt.

## Smaak
**Zoekt** (met de schermafbeeldingen, tegen `databron-beeld/references/smaak.md`): kickers in hoofdletters, gekleurde
accentranden, overal dezelfde kaartjes met schaduw, pillenwolken, carrousels, gradient-vlekken, gedachtestreepjes en
middenpuntjes in metadata, "→" achter links, bewegende of kantelende beelden in de kop, dashboardtaal, een tweede accent,
dikke lijnen, een donker thema als enige.
**Meldt niet**: iets dat niet op de lijst staat; dan hooguit als vraag (anker 50).

## Site
**Zoekt**: de antwoordzin niet in de server-HTML; grote props naar client-components; ontbrekende OG, sitemap, JSON-LD of
llms.txt; `fs` tijdens het draaien; configuratie buiten env; links die niet werken; console-fouten in de productiebuild;
een geheim in `.env.example` met waarde.
**Meldt niet**: prestaties binnen het bytebudget.
