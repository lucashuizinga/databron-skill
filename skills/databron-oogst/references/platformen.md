# Ophalen per platform

Vraag altijd ook `geef_lessen(platform: "<platform>")` aan de Index: daar staan de nieuwste valkuilen.

## OData v3/v4 (CBS, politie via dataderden.cbs.nl, Tweede Kamer)
- Structuur: `<basis>/<tabel>/DataProperties` (maten met eenheid), `<Dimensie>` (codes), `TypedDataSet` (data).
- CBS-sleutels zijn met spaties opgevuld (`'GM0363    '`): lees ze uit de dimensie, typ ze nooit zelf.
- Max 10.000 rijen per aanroep: filter op regio en periode, pagineer met `$skip` (niet op dataderden). `$filter` op een
  cijferkolom wordt stil genegeerd. Het Feed-endpoint past alleen het eerste predicaat toe.
- Nieuwe CBS-API: `datasets.cbs.nl/odata/v1` (100.000 cellen per pagina, alleen Nederlandstalige tabellen).
- Versheid = de nieuwste `Perioden`-sleutel, niet `Modified`.

## JSON-stat (Eurostat, ook CBS-achtig)
- `…/statistics/1.0/data/<code>?geo=NL&lang=EN&sinceTimePeriod=…`. Eerst één geo en één periode zonder andere filters;
  lees de dimensies uit `id` en `size`. Waarden staan in een platte lijst; positie = som van index × stapgrootte.
- Datasets zonder geo-dimensie geven 400 op `geo=NL`. Codes veranderen (bij een 400: de structuur opnieuw bekijken).

## SDMX (OESO, ECB)
- Sleutel = één plek per dimensie, punten ertussen, leeg = alles, `+` = meer. Geen `*` (ECB-firewall).
- Geen resultaat = 404 `NoResultsFound`. Begin met alleen het land en lees de codes uit het antwoord.
- `format=csvfilewithlabels` is het makkelijkst te parsen. ECB: eigen user-agent verplicht.

## ArcGIS REST
- Laag: `<dienst>/MapServer/<n>?f=json` (velden, `maxRecordCount`). Query: `…/query?where=1=1&outFields=…&f=json`,
  tellen met `returnCountOnly=true`, groeperen met `outStatistics` + `groupByFieldsForStatistics`.
- Fouten komen met HTTP 200 in `error`. Het telveld heet per server `n` of `N`. Pagineer met `resultOffset`.

## WFS en OGC API (PDOK, GeoServer)
- Tellen: WFS `resultType=hits`. OGC API (GoKoala) geeft geen `numberMatched`.
- MapServer-WFS geeft altijd geometrie: één veld met `request=GetPropertyValue&valueReference=<veld>`.
- GeoServer: `propertyName` zonder geometrie en `outputFormat=csv` werken. Filter met FES (XML), niet `cql_filter` bij PDOK.
- `srsName=EPSG:4326` voor webkaarten; WFS-velden camelCase, OGC API snake_case.

## CKAN (data.overheid.nl, DUO, gemeenten)
- `package_search?fq=…&rows=1000&start=…&sort=name asc` (niet op wijzigingsdatum pagineren). Eigenaar = `authority`.
- Datastore: `datastore_search?resource_id=…&filters=<json>&limit=…` (filters-JSON URL-encoderen).

## Socrata (RDW)
- `<domein>/resource/<id>.json?$select=…&$where=…&$group=…&$limit=50000`. Grote `$group` kan 20+ s duren: retry.

## STAC (Copernicus, Landsat, Planetary Computer)
- `…/search?collections=…&bbox=…&datetime=…&sortby=-properties.datetime`. Vaak geen totaal; tellen met de
  aggregatie-extensie als die er is. Downloads vragen vaak een account; de catalogus zelf niet.

## Bestanden (CSV, xlsx, zip)
- HEAD voor `Last-Modified` en grootte; Range-verzoek om een groot bestand te peilen. Codering per jaar controleren
  (cp1252 tegen UTF-8). Kolomnamen per jaargang vergelijken; herken velden op titel, niet op positie.
