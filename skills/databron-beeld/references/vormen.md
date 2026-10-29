# Vormen kiezen

| Bevinding | Vorm | Component |
|---|---|---|
| Hoe dit jaar zich verhoudt tot eerdere jaren, per dag of maand | jaarlijnen | `Jaarlijnen` |
| Een stand tegenover de normale bandbreedte en een doel | band met doel | `BandMetDoel` |
| Een reeks over jaren, eventueel tegen een vergelijking (NL tegen EU) | reeks | `Reeks` |
| Een totaal per jaar | jaarstaven | `Jaarstaven` |
| Welke entiteiten het hoogst of laagst zijn | rangorde | `Rangorde` |
| Waar één entiteit staat tussen alle andere | stippenrij | `Stippenrij` |
| Delen van een geheel (hooguit 6 delen) | aandeel | `Aandeel` |
| Hoe het verschilt per gebied | choropleet | nog te bouwen (d3-geo) |
| Hetzelfde patroon in veel groepen | kleine veelvouden | nog te bouwen |
| Of twee maten samenhangen | spreiding met r | nog te bouwen |
| Een score per entiteit met de opbouw | scorekaart | nog te bouwen |

## Regels per vorm

- **Jaarlijnen**: lopend jaar dik in het accent, vorig jaar donkergrijs, oudere licht of als band; labels aan het eind
  van de lijn; een 7-daags gemiddelde bij daglijnen, en zeg dat in de onderregel.
- **Band met doel**: de band is de spreiding van eerdere jaren (min–max of p10–p90, zeg welke); het doel als stip, een
  oud doel als lege stip.
- **Reeks**: de vergelijking als stippellijn en grijs; begin niet in een jaar met heel weinig waarnemingen.
- **Jaarstaven**: as vanaf 0; het laatste (lopende) jaar donker of gemarkeerd als onvolledig.
- **Rangorde**: hooguit 12 balken, de rest "en nog N"; de eigen entiteit gemarkeerd; waarden aan de balk.
- **Stippenrij**: alle entiteiten als stippen; referentielijn (landelijk) met label; eigen entiteit in het accent.
- **Aandeel**: één balk van 100, labels aan de delen; delen moeten samen het geheel zijn.
- **Choropleet**: klassen met gelijke breedte of kwantielen (zeg welke), grijs voor geen data, legenda met de
  klassegrenzen; nooit een regenboog.
