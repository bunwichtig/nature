// Alle Abzeichen. Jedes hat eine Bedingung „wann“ (siehe js/regeln.js) und bringt XP.
// Stufe 1–5 = Bronze, Silber, Gold, Platin, Diamant. Stufe 0 = Sonderabzeichen.
import { GRUPPEN, STUFEN, STUFEN_NAME } from "./gruppen.js";

export const STUFE_XP = [40, 25, 60, 150, 350, 800];   // Index = Stufe (0 = Sonder)

const A = [];
const add = (fam, id, name, zeichen, stufe, wann, text) => A.push({ fam, id, name, zeichen, stufe, wann, text, xp: STUFE_XP[stufe] });

// ---------- 1. Sammler je Gruppe: 70 Gruppen × 5 Stufen ----------
for (const g of GRUPPEN){
  STUFEN[g.groesse].forEach((n, i) => add("Sammler: " + g.label, `g-${g.id}-${i + 1}`, g.namen[i], g.zeichen, i + 1,
    { t:"gruppe", g:g.id, n }, `${n === 1 ? "Eine Art" : n + " verschiedene Arten"} aus „${g.label}“ (${STUFEN_NAME[i]})`));
}

// ---------- 2. Meilensteine ----------
const stufeFuer = (i, len) => Math.min(5, 1 + Math.floor(i * 5 / len));
[[1,"Erster Eintrag"],[5,"Handvoll Leben"],[10,"Zehn im Buch"],[25,"Viertel-Hundert"],[50,"Halbes Hundert"],[100,"Hundert Arten"],
 [200,"Zweihundert"],[300,"Dreihundert"],[500,"Fünfhundert"],[750,"Dreiviertel-Tausend"],[1000,"Tausendsassa"],[1500,"Lebendes Lexikon"],[2000,"Arche"]]
  .forEach(([n, name], i, all) => add("Meilensteine: Arten", `arten-${n}`, name, "📗", stufeFuer(i, all.length), { t:"arten", n }, `${n} verschiedene Arten im Kompendium`));

[[1,"Erster Fund"],[10,"Zehn Notizen"],[50,"Fleißiges Feldbuch"],[100,"Hundert Begegnungen"],[250,"Feldbuch-Profi"],
 [500,"Dicke Kladde"],[1000,"Tausend Momente"],[2500,"Chronik"],[5000,"Lebenswerk"]]
  .forEach(([n, name], i, all) => add("Meilensteine: Funde", `funde-${n}`, name, "📝", stufeFuer(i, all.length), { t:"funde", n }, `${n} Funde eingetragen`));

// ---------- 3. Kalender: Monate und Jahreszeiten ----------
const MONATE = [["Eismond","❄️"],["Hornung","🌨️"],["Lenzmond","🌱"],["Ostermond","🐣"],["Wonnemond","🌸"],["Brachmond","🌾"],
  ["Heumond","☀️"],["Erntemond","🌻"],["Herbstmond","🍂"],["Weinmond","🍇"],["Nebelmond","🌫️"],["Julmond","🕯️"]];
const MONAT_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
MONATE.forEach(([name, z], i) => add("Kalender: Monate", `monat-${i + 1}`, name, z, 1, { t:"monat", m:i + 1 }, `Ein Fund im ${MONAT_DE[i]}`));
[[3,"Vierteljahr"],[6,"Halbjahr"],[9,"Dreivierteljahr"],[12,"Ganzjahres-Blick"]]
  .forEach(([n, name], i) => add("Kalender: Monate", `monate-${n}`, name, "📅", i + 2, { t:"monate", n }, `Funde in ${n} verschiedenen Monaten`));
[["fruehling","Frühlingserwachen","🌷","Frühling"],["sommer","Sommerglut","🌞","Sommer"],["herbst","Herbstzauber","🍁","Herbst"],["winter","Winterruhe","⛄","Winter"]]
  .forEach(([s, name, z, de]) => add("Kalender: Jahreszeiten", `zeit-${s}`, name, z, 1, { t:"jahreszeit", s }, `Ein Fund im ${de}`));
add("Kalender: Jahreszeiten", "zeiten-4", "Vier Jahreszeiten", "🔄", 3, { t:"jahreszeiten", n:4 }, "Funde in allen vier Jahreszeiten");
add("Kalender: Jahreszeiten", "vierzeiten-art", "Ganzjahres-Freundschaft", "🌳", 4, { t:"vierZeiten" }, "Dieselbe Art in allen vier Jahreszeiten gefunden");
[[2,"Zweites Jahr"],[3,"Dritter Frühling"],[5,"Fünf Jahresringe"],[10,"Zehn Jahresringe"]]
  .forEach(([n, name], i) => add("Kalender: Jahre", `jahre-${n}`, name, "🪵", i + 2, { t:"jahre", n }, `Funde in ${n} verschiedenen Jahren`));

// ---------- 4. Besondere Tage ----------
[["01-01","Neujahrsfund","🎆","Ein Fund am 1. Januar"],["02-02","Tag der Feuchtgebiete","💧","Ein Fund am 2. Februar"],
 ["02-29","Schalttag-Glück","🍀","Ein Fund am 29. Februar"],["03-03","Tag des Artenschutzes","🛡️","Ein Fund am 3. März"],
 ["03-20","Frühlingsanfang","🌼","Ein Fund am 20. März"],["04-22","Tag der Erde","🌍","Ein Fund am 22. April"],
 ["05-20","Weltbienentag","🐝","Ein Fund am 20. Mai"],["05-22","Tag der Artenvielfalt","🧬","Ein Fund am 22. Mai"],
 ["06-05","Weltumwelttag","♻️","Ein Fund am 5. Juni"],["06-21","Sommersonnenwende","🌅","Ein Fund am 21. Juni"],
 ["09-22","Tagundnachtgleiche","⚖️","Ein Fund am 22. September"],["10-04","Welttierschutztag","🐾","Ein Fund am 4. Oktober"],
 ["10-31","Spukfund","🎃","Ein Fund am 31. Oktober"],["12-21","Wintersonnenwende","🌑","Ein Fund am 21. Dezember"],
 ["12-24","Heiligabend im Wald","🎄","Ein Fund am 24. Dezember"],["12-31","Silvester-Spaziergang","🎇","Ein Fund am 31. Dezember"]]
  .forEach(([md, name, z, text]) => add("Besondere Tage", `tag-${md}`, name, z, 0, { t:"datum", md }, text));

// ---------- 5. Tageszeiten ----------
[["morgengrauen","Morgengrauen","🌄",4,6],["fruehtau","Frühtau","💧",6,8],["mittag","Mittagshitze","🔆",12,14],
 ["abendrot","Abendrot","🌇",18,21],["nachtschicht","Nachtschicht","🌙",22,24],["geisterstunde","Geisterstunde","👻",0,2],["tiefnacht","Tiefe Nacht","🌌",2,4]]
  .forEach(([id, name, z, von, bis]) => add("Tageszeiten", `zeit-${id}`, name, z, 0, { t:"stunde", von, bis }, `Ein Fund zwischen ${von} und ${bis} Uhr`));
[[5,"Nachtschwärmer"],[25,"Eulenaugen"],[100,"Kind der Nacht"]]
  .forEach(([n, name], i) => add("Tageszeiten", `nacht-${n}`, name, "🌙", i + 2, { t:"nachtFunde", n }, `${n} Funde zwischen 21 und 5 Uhr`));

// ---------- 6. Ausdauer ----------
[[3,"Drei Tage draußen"],[7,"Wochenwanderung"],[14,"Zwei Wochen am Stück"],[30,"Monat im Grünen"],[60,"Unermüdlich"],[100,"Hundert Tage"],[365,"Ein ganzes Jahr"]]
  .forEach(([n, name], i, all) => add("Ausdauer: Serien", `serie-${n}`, name, "🔥", stufeFuer(i, all.length), { t:"serie", n }, `An ${n} Tagen hintereinander etwas gefunden`));
[[10,"Zehn Ausflüge"],[30,"Dreißig Ausflüge"],[100,"Hundert Ausflüge"],[200,"Zweihundert Ausflüge"],[365,"Draußen zuhause"]]
  .forEach(([n, name], i) => add("Ausdauer: Fundtage", `tage-${n}`, name, "🥾", i + 1, { t:"tage", n }, `An ${n} verschiedenen Tagen etwas gefunden`));
add("Ausdauer: Serien", "pause-30", "Willkommen zurück", "👋", 0, { t:"pause", n:30 }, "Nach mindestens 30 Tagen Pause wieder etwas gefunden");

// ---------- 7. Rekordtage ----------
[[5,"Guter Tag"],[10,"Großer Tag"],[20,"Big Day"],[35,"Rekordjagd"],[50,"Fünfzig an einem Tag"],[100,"Legendärer Tag"]]
  .forEach(([n, name], i) => add("Rekordtage", `tag-arten-${n}`, name, "⚡", Math.min(5, i + 1), { t:"tagArten", n }, `${n} verschiedene Arten an einem Tag`));
add("Rekordtage", "drei-reiche", "Drei Reiche", "👑", 2, { t:"tagReiche", n:3 }, "Tier, Pflanze und Pilz am selben Tag");
add("Rekordtage", "doppelgaenger", "Doppelgänger", "👯", 0, { t:"tagGattung", n:2 }, "Zwei Arten derselben Gattung am selben Tag");
add("Rekordtage", "fuenf-gruppen", "Bunte Mischung", "🎨", 3, { t:"tagGruppen", gs:["voegel","saeuger","insekten","pflanzen","pilze"] }, "Vogel, Säugetier, Insekt, Pflanze und Pilz am selben Tag");

// ---------- 8. Unterwegs ----------
[[3,"Drei Orte"],[10,"Zehn Orte"],[25,"Weitgereist"],[50,"Fünfzig Orte"],[100,"Kartograf der Natur"]]
  .forEach(([n, name], i) => add("Unterwegs", `orte-${n}`, name, "🧭", i + 1, { t:"orte", n }, `Funde an ${n} verschiedenen Orten (je etwa 5 km)`));
[[50,"Ausflug"],[200,"Große Runde"],[500,"Fernreise"],[1000,"Tausend Kilometer"]]
  .forEach(([n, name], i) => add("Unterwegs", `weite-${n}`, name, "🗺️", i + 2, { t:"weite", n }, `Zwei Funde liegen mindestens ${n} km auseinander`));
add("Unterwegs", "heimat-10", "Heimatkunde", "🏡", 2, { t:"heimat", n:10 }, "10 Arten im Umkreis von 2 km um den Heimatort");
add("Unterwegs", "heimat-50", "Hinterhof-Safari", "🏡", 3, { t:"heimat", n:50 }, "50 Arten im Umkreis von 2 km um den Heimatort");
add("Unterwegs", "heimat-150", "Kenner der Nachbarschaft", "🏡", 5, { t:"heimat", n:150 }, "150 Arten im Umkreis von 2 km um den Heimatort");

// ---------- 9. Seltenheit (Beobachtungen weltweit bei iNaturalist) ----------
[["selten",1,"Glücksfund"],["selten",5,"Spürnase"],["selten",25,"Raritätenkabinett"],
 ["sehrselten",1,"Einhorn"],["sehrselten",5,"Phantom-Jäger"],["sehrselten",25,"Legendensammlung"]]
  .forEach(([stufe, n, name], i) => add("Seltenheit", `${stufe}-${n}`, name, stufe === "selten" ? "💎" : "🦄", [2,3,4,3,4,5][i],
    { t:"selten", stufe, n }, `${n} ${stufe === "selten" ? "seltene oder sehr seltene" : "sehr seltene"} Art${n > 1 ? "en" : ""} (wenige Beobachtungen weltweit)`));
[[1,"Hüter-Anwärter"],[5,"Rote-Liste-Wache"],[15,"Artenschutz-Stimme"],[30,"Hüter der Roten Liste"]]
  .forEach(([n, name], i) => add("Seltenheit", `gefaehrdet-${n}`, name, "🛡️", i + 2, { t:"gefaehrdet", n }, `${n} gefährdete Art${n > 1 ? "en" : ""} dokumentiert`));
[[1,"Neuankömmling"],[5,"Neobiota-Detektiv"],[15,"Einwanderungsbehörde"]]
  .forEach(([n, name], i) => add("Seltenheit", `eingefuehrt-${n}`, name, "🧳", i + 1, { t:"eingefuehrt", n }, `${n} eingeführte Art${n > 1 ? "en" : ""} gefunden`));

// ---------- 10. Systematik ----------
[[10,"Familienbande"],[25,"Stammbaum"],[50,"Großfamilie"],[100,"Hundert Familien"],[200,"Familienchronik"]]
  .forEach(([n, name], i) => add("Systematik", `familien-${n}`, name, "🌳", i + 1, { t:"familien", n }, `Arten aus ${n} verschiedenen Familien`));
[[5,"Ordnung muss sein"],[15,"Ordnungsliebe"],[30,"Große Ordnung"],[60,"Meister der Ordnungen"]]
  .forEach(([n, name], i) => add("Systematik", `ordnungen-${n}`, name, "🗂️", i + 2, { t:"ordnungen", n }, `Arten aus ${n} verschiedenen Ordnungen`));
[[3,"Klassenausflug"],[6,"Klassenbeste"],[10,"Klassensprecher"],[15,"Klassenkunde"]]
  .forEach(([n, name], i) => add("Systematik", `klassen-${n}`, name, "🏫", i + 2, { t:"klassen", n }, `Arten aus ${n} verschiedenen Klassen`));
add("Systematik", "reiche-3", "Drei Reiche im Buch", "🔱", 1, { t:"reiche", n:3 }, "Tiere, Pflanzen und Pilze im Kompendium");
add("Systematik", "gattung-5", "Gattungs-Sammlung", "🧩", 3, { t:"gattungMax", n:5 }, "5 Arten derselben Gattung");
add("Systematik", "gattung-10", "Gattungs-Expertise", "🧩", 4, { t:"gattungMax", n:10 }, "10 Arten derselben Gattung");

// ---------- 11. Treue ----------
[[5,"Alter Bekannter"],[10,"Treuer Freund"],[25,"Unzertrennlich"]]
  .forEach(([n, name], i) => add("Treue", `wieder-${n}`, name, "💚", i + 1, { t:"wieder", n }, `Dieselbe Art ${n}-mal gefunden`));
[[1,"Erste Notiz"],[10,"Notizbuch"],[50,"Tagebuch der Natur"],[200,"Naturschriftsteller"]]
  .forEach(([n, name], i) => add("Treue", `notizen-${n}`, name, "✏️", i + 1, { t:"notizen", n }, `${n} Funde mit Notiz`));

// ---------- 12. Wortspiele (deutsche Artnamen) ----------
const WORT = [
  ["rot","Rotstift","🔴",["rot"]],["blau","Blaues Wunder","🔵",["blau"]],["gelb","Gelbsucht","🟡",["gelb"]],
  ["gruen","Grünschnabel","🟢",["grün"]],["schwarz","Schwarzmalerei","⚫",["schwarz"]],["weiss","Weiße Weste","⚪",["weiß"]],
  ["gold","Goldgrube","🥇",["gold"]],["silber","Silberstreif","🥈",["silber"]],
  ["wald","Waldgeist","🌲",["wald"]],["wiese","Wiesenkind","🌼",["wiese","feld","acker"]],["wasser","Wasserratte","💦",["wasser","teich","bach","see","fluss","ufer"]],
  ["berg","Bergfex","⛰️",["berg","alpen","fels"]],["garten","Gartenzwerg","🏡",["garten","haus","dach","mauer"]],["moor","Moorleiche","🫧",["moor","sumpf","ried"]],
  ["koenig","Hofstaat","👑",["könig","kaiser","fürst","prinz"]],["riese","Riesenfreude","🦣",["riesen","groß"]],["zwerg","Zwergenreich","🧙",["zwerg","klein"]]
];
for (const [id, name, z, w] of WORT) add("Wortspiele", `wort-${id}`, name, z, 0, { t:"wort", w, n:3 }, `3 Arten mit „${w.join("“, „")}“ im deutschen Namen`);
add("Wortspiele", "regenbogen", "Regenbogen", "🌈", 4, { t:"abzAlle", ids:["wort-rot","wort-blau","wort-gelb","wort-gruen","wort-schwarz","wort-weiss"] }, "Alle sechs Farb-Wortspiele");
add("Wortspiele", "zoo-im-garten", "Zoo im Garten", "🦁", 3,
  { t:"wort", w:["hund","katz","fuchs","wolf","bär","hase","kuh","schwein","pferd","gans","storch","hahn","löwe","maus","ochs","ziege","schaf"], reich:"Plantae", n:5 },
  "5 Pflanzen mit einem Tier im Namen (z. B. Löwenzahn, Bärlauch, Storchschnabel)");
[[5,"ABC-Schütze"],[10,"Buchstabensuppe"],[15,"Lexikon-Lehrling"],[20,"Alphabet der Natur"],[23,"Vom A bis fast Z"]]
  .forEach(([n, name], i) => add("Wortspiele", `abc-${n}`, name, "🔤", i + 1, { t:"buchstaben", n }, `Deutsche Artnamen mit ${n} verschiedenen Anfangsbuchstaben`));

// ---------- 13. Sammelsets (bestimmte Arten) ----------
const SETS = [
  ["grosse-fuenf", "Große Fünf des Waldes", "🦌", 4, ["Sus scrofa","Cervus elaphus","Capreolus capreolus","Vulpes vulpes","Meles meles"], "Wildschwein, Rothirsch, Reh, Rotfuchs und Dachs"],
  ["gartenvoegel", "Gartenvogel-Quintett", "🐦", 2, ["Turdus merula","Parus major","Cyanistes caeruleus","Erithacus rubecula","Passer domesticus"], "Amsel, Kohlmeise, Blaumeise, Rotkehlchen und Haussperling"],
  ["eulen-trio", "Eulen-Trio", "🦉", 4, ["Strix aluco","Asio otus","Tyto alba"], "Waldkauz, Waldohreule und Schleiereule"],
  ["spechte-quartett", "Specht-Quartett", "🪵", 4, ["Dendrocopos major","Picus viridis","Dryocopus martius","Dendrocoptes medius"], "Buntspecht, Grünspecht, Schwarzspecht und Mittelspecht"],
  ["greif-trio", "Greifvogel-Trio", "🦅", 2, ["Buteo buteo","Falco tinnunculus","Milvus milvus"], "Mäusebussard, Turmfalke und Rotmilan"],
  ["zugvoegel", "Zugvogel-Ankunft", "🧳", 3, ["Grus grus","Ciconia ciconia","Hirundo rustica","Cuculus canorus"], "Kranich, Weißstorch, Rauchschwalbe und Kuckuck"],
  ["wasserwelt", "Wasserwelt", "💧", 3, ["Alcedo atthis","Ardea cinerea","Anas platyrhynchos","Cygnus olor","Aeshna cyanea"], "Eisvogel, Graureiher, Stockente, Höckerschwan und Blaugrüne Mosaikjungfer"],
  ["nachtschwaermer", "Nachtschwärmer-Set", "🌙", 4, ["Nyctalus noctula","Pipistrellus pipistrellus","Erinaceus europaeus","Strix aluco","Lampyris noctiluca"], "Abendsegler, Zwergfledermaus, Igel, Waldkauz und Glühwürmchen"],
  ["fruehblueher-set", "Frühblüher-Strauß", "🌷", 2, ["Anemone nemorosa","Ficaria verna","Galanthus nivalis","Tussilago farfara","Hepatica nobilis"], "Buschwindröschen, Scharbockskraut, Schneeglöckchen, Huflattich und Leberblümchen"],
  ["kraeutergarten", "Wildkräuter-Korb", "🌿", 1, ["Urtica dioica","Plantago lanceolata","Achillea millefolium","Bellis perennis","Taraxacum officinale"], "Brennnessel, Spitzwegerich, Schafgarbe, Gänseblümchen und Löwenzahn"],
  ["waldriesen", "Waldriesen", "🌳", 2, ["Fagus sylvatica","Quercus robur","Picea abies","Pinus sylvestris","Abies alba"], "Rotbuche, Stieleiche, Fichte, Waldkiefer und Weißtanne"],
  ["pilzkorb", "Voller Pilzkorb", "🧺", 3, ["Boletus edulis","Cantharellus cibarius","Imleria badia","Macrolepiota procera"], "Steinpilz, Pfifferling, Maronen-Röhrling und Parasol"],
  ["giftschrank", "Giftschrank (nur gucken!)", "☠️", 3, ["Amanita muscaria","Amanita phalloides","Atropa belladonna","Taxus baccata","Digitalis purpurea"], "Fliegenpilz, Knollenblätterpilz, Tollkirsche, Eibe und Fingerhut"],
  ["amphibien-set", "Amphibien-Rundgang", "🐸", 3, ["Bufo bufo","Rana temporaria","Lissotriton vulgaris","Salamandra salamandra"], "Erdkröte, Grasfrosch, Teichmolch und Feuersalamander"],
  ["reptilien-set", "Reptilien-Rundgang", "🦎", 5, ["Lacerta agilis","Zootoca vivipara","Anguis fragilis","Natrix natrix","Vipera berus"], "Zauneidechse, Waldeidechse, Blindschleiche, Ringelnatter und Kreuzotter"],
  ["sommerfalter", "Sommerfalter-Fünf", "🦋", 2, ["Aglais io","Aglais urticae","Gonepteryx rhamni","Vanessa atalanta","Papilio machaon"], "Tagpfauenauge, Kleiner Fuchs, Zitronenfalter, Admiral und Schwalbenschwanz"],
  ["hummel-set", "Hummel-Trio", "🐝", 2, ["Bombus terrestris","Bombus lapidarius","Bombus pascuorum"], "Dunkle Erdhummel, Steinhummel und Ackerhummel"],
  ["kaefer-stars", "Käfer-Stars", "🪲", 4, ["Lucanus cervus","Coccinella septempunctata","Melolontha melolontha","Pyrrhocoris apterus"], "Hirschkäfer, Siebenpunkt, Maikäfer und Feuerwanze (Ehrengast)"],
  ["heckenfruechte", "Heckenfrüchte", "🫐", 2, ["Sambucus nigra","Prunus spinosa","Crataegus monogyna","Rosa canina","Rubus fruticosus"], "Holunder, Schlehe, Weißdorn, Hundsrose und Brombeere"],
  ["moor-set", "Moor-Trio", "🫧", 4, ["Drosera rotundifolia","Eriophorum angustifolium","Vaccinium oxycoccos"], "Sonnentau, Wollgras und Moosbeere"]
];
for (const [id, name, z, stufe, sci, text] of SETS) add("Sammelsets", `set-${id}`, name, z, stufe, { t:"artenAlle", sci }, text);

// ---------- 14. Habitatkarten, Level, Abzeichen ----------
[[1,"Erste Karte"],[5,"Kartenmappe"],[10,"Atlas"],[20,"Großer Atlas"],[40,"Weltkarte der Natur"]]
  .forEach(([n, name], i) => add("Fortschritt", `karten-${n}`, name, "🗺️", i + 1, { t:"karten", n }, `${n} Habitatkarte${n > 1 ? "n" : ""} freigeschaltet`));
[5,10,20,30,40,50,60,75,90,100]
  .forEach((n, i) => add("Fortschritt", `level-${n}`, `Level ${n}`, "⭐", Math.min(5, 1 + Math.floor(i / 2)), { t:"level", n }, `Level ${n} erreicht`));
[[10,"Zehn Abzeichen"],[25,"Abzeichen-Band"],[50,"Abzeichen-Weste"],[100,"Hundert Abzeichen"],[200,"Abzeichen-Wand"],[350,"Ehrenhalle"]]
  .forEach(([n, name], i) => add("Fortschritt", `abz-${n}`, name, "🎖️", Math.min(5, i + 1), { t:"abzAnzahl", n }, `${n} Abzeichen gesammelt`));
add("Fortschritt", "import-1", "Brückenbau", "🌉", 0, { t:"importiert", n:1 }, "Funde von iNaturalist übernommen");
add("Fortschritt", "profil", "Neues Gesicht", "🪞", 0, { t:"profil" }, "Avatar, Rahmen und Titel selbst gewählt");

export const ABZEICHEN = A;
export const ABZ = Object.fromEntries(A.map(a => [a.id, a]));
