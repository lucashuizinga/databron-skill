---
name: databron-toets
description: De poort vóór publicatie in een Databron-project - een toets die dekking, grenzen, sommen, consistentie, versheid, drift tegenover de vorige versie, verhaaltests en null-tegen-0 controleert, een rapport schrijft en met exit 1 publicatie tegenhoudt. Gebruik dit na de oogst, bij elke refresh, en als cijfers op de site niet lijken te kloppen.
---

# Databron: de toets

Doel: **niets gaat live dat niet klopt.** De toets draait na elke oogst en vóór elke publicatie. Faalt hij, dan blijft
de vorige stand staan (de oogst-Action commit niet; trede 2 publiceert de kandidaat-versie niet).

## Wat `toets/toets.ts` controleert

Elke controle heeft een naam, een uitkomst (ok, waarschuwing, fout) en een zin die zegt wat er mis is.

1. **Dekking**: elke kernmaat voor elke entiteit en de verwachte periodes; wat ontbreekt wordt genoemd, niet gevuld.
2. **Grenzen**: plausibele bereiken per maat (−30 tot +40 °C; een aandeel tussen 0 en 100; inwoners > 0).
3. **Sommen**: delen tellen op tot het geheel (gemeenten tot Nederland binnen 2%, aandelen tot 100 ± 0,5).
4. **Consistentie**: het totaal ligt tussen de delen (mannen en vrouwen), zelf berekend ≈ wat de bron zegt.
5. **Versheid**: de nieuwste periode is niet ouder dan het ritme van de bron plus de vertraging toestaat.
6. **Drift**: vergelijk met de vorige versie. Meer dan 25% van de bestaande waarden veranderd = waarschuwing, meer dan
   60% = fout. Een revisievenster (laatste dagen voorlopig) telt niet mee.
7. **Null tegen 0**: geen 0 waar de bron leeg was. Vergelijk met de ruwe stand of met de parser-uitvoer.
8. **Verhaaltests**: wat de site beweert, staat als controle ("de antwoordzin noemt hetzelfde getal als de grafiek",
   "Nederland is als enige A+"). Breekt de data het verhaal, dan moet een mens kijken.
9. **Vorm**: checksums in `data/` kloppen; geen dubbele sleutels.

## Het rapport

`toets/rapport.md`: datum, versie, per controle de uitkomst, en bovenaan een samenvatting in één zin
("Alles in orde: 27.402 waarnemingen, laatste meting 17 oktober 2026 (voorlopig)."). Bij een refresh via PR is dit de
PR-tekst; bij direct publiceren staat het in de commit.

## Ook unit-tests

De toets bewaakt de data; tests (`pnpm test`) bewaken de code: parsers, rekenregels, de tekstlaag. Beide moeten groen.

## Poort

`pnpm toets` geeft exit 0. Bewijs één keer dat de poort werkt: maak een kopie van `data/` met een geplante fout (een 0
waar null hoort, een sprong van 80%) en laat zien dat de toets faalt met een duidelijke zin. Herstel daarna.
