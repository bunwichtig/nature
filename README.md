# Pure Nature – Kompendium (Naturspiel)

Sammelspiel für draußen: Trag ein, was du entdeckst, und bau dein persönliches Natur-Kompendium auf.
Aufgebaut nach dem Bauplan von [bunwichtig/naturewissen](https://github.com/bunwichtig/naturewissen): nur freie Daten, keine CDNs, statisch ohne Build, Handy zuerst, Deutsch.

## Standard und Pro

- **Standard:** persönliches Kompendium (Funde mit Zeit, Ort, Notiz), Erfahrungspunkte (XP), 100 Level und **41 Habitatkarten**, die mit XP freigeschaltet werden. Jede Karte zeigt auf einer Karte, wo eine Gruppe (Vögel, Pflanzen, Pilze, Bäume, Amphibien, Reptilien, Eulen, Orchideen …) in der Umgebung gefunden wird, und die häufigsten Arten dort.
- **Pro:** **566 Abzeichen**, **214 Titel**, **271 Avatare**, **53 Umrandungen** und die **Bestenliste** (Freunde per Code, Umgebung über iNaturalist). Fortschritte zählen auch in Standard mit und sind sofort da, wenn Pro eingeschaltet wird. Im Moment ist Pro ein Schalter im Profil („Vorschau“).

## Wo was steht

| Datei | Inhalt |
|---|---|
| `js/katalog/gruppen.js` | 70 Sammel-Gruppen mit je 5 Abzeichen-Namen und 2 Titeln |
| `js/katalog/abzeichen.js` | alle Abzeichen und ihre Bedingungen |
| `js/katalog/titel.js`, `avatare.js`, `rahmen.js` | Titel, Avatare (Emoji + Szene), Umrandungen (CSS) |
| `js/katalog/habitate.js` | Habitatkarten mit XP-Schwelle |
| `js/regeln.js` | XP, Level, Seltenheit, Bedingungen |
| `js/app.js` | Oberfläche |
| `archiv/mockup/` | das ursprüngliche Mockup |

Spielstand nur im Browser (localStorage), Sicherung als Datei im Profil. Quellen: `quellen.html`.

## Lokal starten

Ein einfacher Webserver im Ordner reicht, z. B. `python3 -m http.server`, dann http://localhost:8000.
