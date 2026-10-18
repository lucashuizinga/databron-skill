# Datacontract: KNMI daggegevens

Wat we van de bron verwachten, en wat we gemeten hebben. Elke eigenaardigheid met de datum waarop we hem zagen.

## Aanroep

```
POST https://www.daggegevens.knmi.nl/klimatologie/daggegevens
Content-Type: application/x-www-form-urlencoded

stns=260&vars=TG&start=20261001&end=20261016&fmt=json
```

- Geen sleutel. User-agent: `databron-sjabloon/0.1 (+https://www.opendataindex.nl)`.
- `stns`: stationsnummer (260 = De Bilt). `vars`: variabelen, met `:` gescheiden (`TG:TX:TN`).
- `start` en `end`: JJJJMMDD, beide inclusief.
- In code: `oogst/knmi.ts` (IO) en `oogst/knmi-parse.ts` (puur).

## Antwoord

Een JSON-lijst, één object per dag (gemeten 18 oktober 2026):

```json
[
  {"station_code":260,"date":"2026-10-15T00:00:00.000Z","TG":159},
  {"station_code":260,"date":"2026-10-16T00:00:00.000Z","TG":147}
]
```

- `date` is middernacht UTC van de kalenderdag: neem de eerste tien tekens, reken niet via een tijdzone.
- `TG` in **tienden van een graad**: 147 = 14,7 °C. Ook TN, TX, RH (neerslag, 0,1 mm) en SQ (zon, 0,1 uur) staan in
  tienden. Bij RH betekent -1 "minder dan 0,05 mm": daar is een eigen regel voor nodig voordat je RH gebruikt.
- Een ontbrekende waarde is `null` of ontbreekt. Wij houden die leeg, nooit 0.

## Omvang en snelheid (gemeten 18 oktober 2026)

- 5 jaar TG voor één station: 1.826 rijen, 116 kB, 0,7 s.
- De hele reeks 1951 tot en met 16 oktober 2026: 27.683 dagen in 16 aanvragen van 5 jaar, samen 19 s met 1 s pauze.
- In die reeks staat geen enkele lege waarde.

## Ritme, vertraging en revisies

- Nieuwe dag: op 18 oktober 2026 (zondagavond) was 16 oktober de nieuwste. Reken op 1 tot 2 dagen, langer in het weekend.
- Volgens het KNMI worden de gegevens op werkdagen gecontroleerd, "eventueel aangepast" en worden ontbrekende waarden
  waar mogelijk aangevuld (knmi.nl, pagina daggegevens, gelezen 18 oktober 2026). De JSON zegt niet welke dagen al
  gecontroleerd zijn. **Onze afspraak**: de laatste 30 dagen tot de nieuwste meting heten voorlopig (`VOORLOPIG_DAGEN`
  in `oogst/draai.ts`).
- Daarom halen we elke dag vanaf 1 januari van vorig jaar opnieuw op, en op de eerste van de maand alles.

## Valkuilen

- **Een periode in de toekomst geeft HTTP 200 met `[]`** (gemeten 18 oktober 2026, start 20 oktober). Een lege lijst is
  dus geen fout van de bron, maar ook geen bewijs dat er niets is: de waakhond weigert een lege oogst.
- **Een variabele die niet bij het eindpunt hoort, geeft HTTP 500 met HTML** (Open Data Index, 16 oktober 2026). De
  parser weigert alles wat geen JSON-lijst is.
- **Ruwe reeks**: niet gehomogeniseerd. Veranderingen in meetopstelling en omgeving zitten erin. Het KNMI publiceert
  voor De Bilt ook een gehomogeniseerde reeks; gebruik die als je periodes van vóór 1951 vergelijkt.
- **Eén station is niet heel Nederland**: aan de kust is het 's zomers koeler en 's winters zachter.

## Licentie en bronvermelding

CC BY 4.0: hergebruik mag, met vermelding van het KNMI (volgens Open Data Index, bron `knmi-daggegevens`, 15 oktober 2026).
Op de site staat de bron onder elke grafiek en in de voettekst.

## robots.txt

`https://www.daggegevens.knmi.nl/robots.txt` bevat alleen een commentaarregel (18 oktober 2026): geen verbod.
