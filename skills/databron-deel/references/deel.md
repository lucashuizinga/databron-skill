# Sjablonen voor delen

Kopieer naar `docs/lancering.md` in het project en vul in. Alles met echte cijfers uit de site; niets wat de data niet
dragen.

## De drie haakjes

| Haakje | Zin (uit de cijfers) | Voor wie |
|---|---|---|
| Nieuws | "Over dezelfde dagen was geen jaar sinds 1951 zo warm als 2026." | landelijke media, nieuwsbrieven |
| Dichtbij | "In jouw gemeente …" (per entiteit uit `lib/duid.ts`) | regionale media, lokale groepen |
| Methode | "We vergelijken met 1991–2020 over dezelfde kalenderdagen, met de ruwe KNMI-reeks." | vakgenoten, factcheckers |

## De pitch (mail of bericht, kort)

```
Onderwerp: <de antwoordzin, ingekort tot ~70 tekens>

<Naam>,

<De antwoordzin.> <Eén zin waarom dat opvalt of ertoe doet.>

De cijfers komen van <bron> (<licentie>), tot en met <peildatum>. Hoe we rekenen: <url>/methode.
De data zelf: <url>/data/<maat>.json. Het deelbeeld: <url>/opengraph-image.

<Eén zin over wie je bent en waarom je dit maakte.> Ziet u iets dat niet klopt, dan hoor ik het graag.

<Naam>
```

Geen bijlagen, geen "exclusief", geen opvolgmail binnen een week.

## De lijst met plekken

| Plek | Wie of welk kanaal | Waarom zij | Haakje | Wat je stuurt | Status |
|---|---|---|---|---|---|
| De bron | communicatie van <uitgever> | hergebruik van hun data | methode | pitch + vraag of het klopt | |
| Betrokkenen | <groep over wie het gaat> | zij weten of het klopt | dichtbij | pitch | |
| Open Data Index | beheerder | vermelding als voorbeeld | methode | url + korte uitleg | |
| Journalist onderwerp | | | nieuws | pitch | |
| Regionale media | | | dichtbij | pitch met de regio-zin | |
| Gemeenschap | forum, vakgroep, nieuwsbrief | | methode | bericht in hun vorm | |

## Per platform

- **LinkedIn**: de antwoordzin, één alinea waarom, het deelbeeld van die bevinding, de link in het bericht.
- **Bluesky of Mastodon**: de antwoordzin plus de link; het deelbeeld komt mee via Open Graph.
- **Nieuwsbrief of forum**: in hun vorm, met de methode erbij; vraag om correcties.

## Meetplan

| Vraag | Gebeurtenis of bron | Waar je het ziet |
|---|---|---|
| Komen mensen bij de antwoordzin? | paginabezoek, scrolldiepte tot de eerste grafiek | Vercel/Cloudflare Analytics |
| Delen ze het? | verwijzers, opvragingen van het deelbeeld | Analytics, logs |
| Gebruiken ze de data? | opvragingen van `/data/*` en `llms.txt` | logs of een teller |
| Vinden assistenten het? | verwijzers `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com` | Analytics |

## Een item in de feed

```xml
<entry>
  <title>Ja: 2026 is tot en met 16 oktober 1,3 graden warmer dan normaal</title>
  <id>https://<site>/#2026-10-16</id>
  <updated>2026-10-17T06:00:00Z</updated>
  <link href="https://<site>/"/>
  <summary>Gemiddeld 13,0 °C tegen 11,6 °C normaal. KNMI, station De Bilt, tot en met 16 oktober 2026.</summary>
</entry>
```

`updated` is het moment van publiceren; de peildatum staat in de tekst.
