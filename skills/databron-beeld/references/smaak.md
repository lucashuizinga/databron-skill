# De smaak van Databron

Een mening, op papier. De regels komen uit feedback van Lucas Huizinga in vijf projecten (Open Data Index, Gaspeil,
Staat van, averageperson.eu, Stikstofcijfers), met waar het vandaan komt. De reviewer Smaak (`databron-review`) toetst
eraan met schermafbeeldingen. Nieuwe feedback wordt een nieuwe regel, met datum en project (`databron-leer`).

## Interface: doen

- **Licht thema als standaard**: papier en inkt. Donker als keuze, nooit als enige. ("te donker, te negatief", Staat van, 2026)
- **Eén grotesk voor koppen en interface**, hooguit één tweede letter voor inleidende tekst (een serif). Mono alleen in
  code. Test tabulaire cijfers per letter: bij Schibsted Grotesk werden punten te breed ("20 . 822", Open Data Index, 15 okt 2026).
- **Eén accentkleur, voor wat leeft**: het lopende jaar, de laatste meting, groei. Verder is kleur betekenis.
- **Structuur met witruimte en zachte vlakken.** Haarlijnen alleen in tabellen en lijsten. Geen dikke lijnen
  ("sloppig, dikke lijnen lelijk", Open Data Index, 15 okt 2026).
- **Echte logo's van uitgevers** waar dat mag; een monogram waar niet (NS, TenneT).
- **Eén iconenset** (Phosphor duotone), spaarzaam.
- **Herkomst zichtbaar**: bron en peildatum onder elk blok, met een link naar de exacte aanroep.
- **Zinnen in plaats van labels.** Een knop zegt wat er gebeurt ("Kopieer de prompt", "Download de cijfers").
  Een lege staat nodigt uit tot een handeling. Een fout zegt wat er misging en wat je nu doet.
- **Mobiel eerst** (390 px): geen zijwaartse overloop, grids met `minmax(0, 1fr)`, tabellen scrollen in hun eigen vak,
  onder 900 px een menu.
- **Eén beweegmoment per pagina**, gekoppeld aan echte data of aan wat iemand doet. Bij reduced motion meteen klaar.
- **Eén visitekaartje per project** dat het onderwerp draagt (het polderdiorama van Gaspeil, de puls-kaart van Staat
  van, de getekende burger van averageperson.eu, de mockups op /bouwen).
- **Eerst richtingen tonen, dan bouwen**: varianten naast elkaar, gerenderd, op het echte formaat bekeken
  (het logo van Open Data Index: "eerst schetsen renderen en op 16 px bekijken").
- **Schermafbeeldingen in een paginakop klein en stil**: niet kantelen, niet bewegen (Open Data Index).
- **Reageer bij het indrukken, niet bij het loslaten**: een knop krimpt in 100 ms naar 0,97 op `:active`, en bevestigt
  met dezelfde woorden ("Kopieer", dan "Gekopieerd"). Vier soorten terugkoppeling: stand, klaar, waarschuwing, fout.
  (apple-design, naar WWDC, 19 okt 2026)
- **Beweging is onderbreekbaar.** Wat iemand aanraakt, beweegt vanaf de huidige waarde en kan halverwege terug; geen
  vaste keyframes voor een gebaar. Standaard een veer zonder overschot; een beetje veer alleen na een veeg. Wat
  verdwijnt, gaat terug langs de weg waarlangs het kwam. (apple-design)
- **Letterspatiëring hangt af van de grootte**: grote koppen strakker (-0,02 tot -0,03 em), lopende tekst 0, kleine
  tekst iets ruimer. Regelafstand omgekeerd: koppen rond 1,05, tekst 1,5. Optische grootte aan waar de letter die heeft
  (Newsreader). (apple-design)
- **Waar ben ik?** De navigatie laat zien in welk deel je bent, en elke pagina zegt waar je heen kunt en hoe je terug
  komt. Labels noemen de inhoud ("Voorbeeld", "Smaak"), geen vage paraplu's. (apple-design)
- **Een plakkende kop is een laag, geen balk**: doorschijnend met vervaging, en een zachte overgang waar inhoud eronder
  schuift in plaats van een harde lijn. Dicht bij `prefers-reduced-transparency`, met rand bij `prefers-contrast: more`.
  (apple-design)

## Interface: niet doen

- Kickers of labels in hoofdletters boven elke kop.
- Gekleurde accentranden links aan kaarten ("typische gen-AI-styling", Staat van).
- Alles in kaartjes met dezelfde ronde hoek en dezelfde schaduw.
- Pillenwolken, carrousels die vanzelf bewegen, gradient-vlekken, oranje heatmap-blobs ("AI-slop", Staat van).
- Gedachtestreepjes en middenpuntjes in metadata; "→" achter elke link.
- Kantelende of bewegende beelden in de paginakop.
- Dashboardtaal: "Dashboard", "Insights", "Live" bij data die een dag achterloopt (Gaspeil: "dagelijks bijgewerkt").
- Beelden die de inhoud niet dragen: een isometrische plaat met logo's aan draadjes, een gebogen wand waar je niet door
  kunt (beide weggehaald bij Open Data Index).
- De standaardlook van een template of componentenbibliotheek (Tailwind-defaults, shadcn-kaartjes).

## Grafieken: doen

- **De kop is de bevinding**, als zin. Onderregel: eenheid, periode, bewerking. Daaronder één grafiek en de bron.
- **Labels aan de lijn**, geen legenda als het kan.
- **Grijs voor context, één kleur voor het onderwerp.** Eerdere jaren, andere gemeenten, de EU: grijs.
- **Een bandbreedte in plaats van tien lijnen**; kleine veelvouden in plaats van één drukke grafiek.
- **Weinig rasterlijnen, ronde asgetallen.** Staven beginnen bij 0; een lijn hoeft dat niet (zeg het als hij dat niet doet).
- **Kleurlogica nooit mengen**: oordeel, hoeveelheid, geen data. Rood alleen voor het slechtste oordeel (Stikstofcijfers).
- **Richting ook als teken** (▲ ▼), nooit alleen in kleur. Palet getest op kleurenblindheid
  (licht `#2a64b8 #d9662f #1a9a6c #c98b00`, donker `#5b8fe0 #d9662f #22a477 #c98500`).
- **Markeer het "nu"**: een stip op de laatste meting met de waarde ernaast.
- **Beweging alleen met echte data**: de puls-kaart van Staat van speelt echte registraties af en eindigt op het echte totaal.
- **Op mobiel**: krimpen of scrollen in het eigen vak, openend bij vandaag (Gaspeil).
- **Elke grafiek ook als tekst**: aria-label met de kernzin; de tooltiptekst staat ook in de HTML.

## Grafieken: niet doen

- Taartdiagrammen met meer dan drie delen; 3D-grafieken; een tweede y-as.
- Regenboogpaletten; rood en groen als enige verschil.
- De standaardlook van Recharts of Chart.js (Gaspeil stapte er voor de hoofdgrafiek van af).
- Animaties die niets betekenen; tellers die optellen naar een getal dat niet klopt.
- Een getal zonder eenheid of jaar.

## Gereedschap

- **SVG op de server** voor alles wat een grafiek is: crawlbaar, klein, zonder JavaScript leesbaar.
- **d3 alleen om te rekenen** (schalen, geo, beeswarm), niet om te tekenen.
- **Kaarten**: SVG met d3-geo voor choropleten; MapLibre voor schuifbare kaarten, met een ondergrond zonder sleutel
  (PDOK BRT-achtergrondkaart grijs, OpenFreeMap). CARTO vraagt sinds 2026 een sleutel (Staat van).
- **Canvas** pas bij duizenden punten; **three.js** alleen voor spel of het visitekaartje.
- **Vormen en tekst scheiden**: lijnen en vlakken in een SVG die met de breedte meerekt
  (`preserveAspectRatio="none"`, `vector-effect: non-scaling-stroke`), alle tekst als HTML erboven. Een SVG met een vaste
  viewBox schaalt op 390 px letters van 12 naar 5,6 px (Databron-sjabloon, 18 okt 2026).
- **Labelplaatsing in groepen**, niet paarsgewijs duwen: duwen plus afkappen aan de rand laat botsingen staan. Test met
  honderden willekeurige opstellingen (Databron-sjabloon, 18 okt 2026).
