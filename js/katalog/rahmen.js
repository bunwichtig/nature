// Umrandungen um den Avatar. Aussehen: css/app.css (.ra-<id>). Seltenheit: 1 gewöhnlich … 4 legendär (bewegt).
export const SELTENHEIT = ["", "Gewöhnlich", "Selten", "Episch", "Legendär"];

const R = [];
const add = (id, name, selten, wann, text) => R.push({ id, name, selten, wann, text });

// ---------- Gewöhnlich ----------
add("kein", "Ohne Rahmen", 1, { t:"immer" }, "Von Anfang an");
add("holz", "Holzring", 1, { t:"immer" }, "Von Anfang an");
add("kiesel", "Kiesel", 1, { t:"funde", n:5 }, "5 Funde");
add("moos", "Moospolster", 1, { t:"gruppe", g:"moose", n:1 }, "Ein Moos gefunden");
add("gras", "Grashalme", 1, { t:"gruppe", g:"graeser", n:1 }, "Ein Gras gefunden");
add("rinde", "Rinde", 1, { t:"gruppe", g:"baeume", n:3 }, "3 Baumarten");
add("lehm", "Lehm", 1, { t:"tage", n:10 }, "An 10 Tagen etwas gefunden");
add("sand", "Ufersand", 1, { t:"gruppe", g:"watvoegel", n:1 }, "Eine Möwe oder ein Watvogel");
add("schilf", "Schilfgürtel", 1, { t:"gruppe", g:"reiher", n:1 }, "Ein Reiher oder Storch");
add("feder", "Feder", 1, { t:"gruppe", g:"voegel", n:10 }, "10 Vogelarten");

// ---------- Selten ----------
add("bronze", "Bronze", 2, { t:"level", n:5 }, "Level 5");
add("silber", "Silber", 2, { t:"level", n:15 }, "Level 15");
add("gold", "Gold", 2, { t:"level", n:30 }, "Level 30");
add("bernstein", "Bernstein", 2, { t:"gruppe", g:"nadelbaeume", n:4 }, "4 Nadelholz-Arten");
add("tau", "Morgentau", 2, { t:"abz", id:"zeit-fruehtau" }, "Ein Fund zwischen 6 und 8 Uhr");
add("kastanie", "Kastanie", 2, { t:"abz", id:"zeit-herbst" }, "Ein Fund im Herbst");
add("heide", "Heideblüte", 2, { t:"monat", m:8 }, "Ein Fund im August");
add("lavendel", "Lavendel", 2, { t:"gruppe", g:"lippenbluetler", n:3 }, "3 Lippenblütler");
add("kornblume", "Kornblume", 2, { t:"abz", id:"wort-blau" }, "Wortspiel „Blaues Wunder“");
add("mohn", "Mohnfeld", 2, { t:"abz", id:"wort-rot" }, "Wortspiel „Rotstift“");
add("birke", "Birkenrinde", 2, { t:"abz", id:"zeit-winter" }, "Ein Fund im Winter");
add("efeu", "Efeuranke", 2, { t:"gruppe", g:"kletterpflanzen", n:2 }, "2 Kletterpflanzen");
add("marienkaefer", "Glückspunkte", 2, { t:"gruppe", g:"marienkaefer", n:2 }, "2 Marienkäfer-Arten");
add("wabe", "Honigwabe", 2, { t:"gruppe", g:"bienen", n:3 }, "3 Bienenarten");
add("streifen", "Wespenstreifen", 2, { t:"gruppe", g:"schwebfliegen", n:2 }, "2 Schwebfliegen");

// ---------- Episch ----------
add("herbstlaub", "Herbstlaub", 3, { t:"monate", n:6 }, "Funde in 6 Monaten");
add("bluete", "Frühlingsblüte", 3, { t:"gruppe", g:"fruehblueher", n:7 }, "7 Zwiebel- und Knollenpflanzen");
add("sommerwiese", "Sommerwiese", 3, { t:"gruppe", g:"korbbluetler", n:15 }, "15 Korbblütler");
add("frost", "Winterfrost", 3, { t:"jahreszeiten", n:4 }, "Funde in allen vier Jahreszeiten");
add("morgenroete", "Morgenröte", 3, { t:"abz", id:"zeit-morgengrauen" }, "Ein Fund zwischen 4 und 6 Uhr");
add("abendrot", "Abendrot", 3, { t:"abz", id:"zeit-abendrot" }, "Ein Fund zwischen 18 und 21 Uhr");
add("tiefsee", "Tiefsee", 3, { t:"gruppe", g:"fische", n:7 }, "7 Fischarten");
add("pilzring", "Hexenring", 3, { t:"gruppe", g:"pilze", n:15 }, "15 Pilzarten");
add("federkranz", "Federkranz", 3, { t:"gruppe", g:"voegel", n:30 }, "30 Vogelarten");
add("schuppen", "Drachenschuppen", 3, { t:"gruppe", g:"reptilien", n:4 }, "4 Reptilienarten");
add("netz", "Spinnennetz", 3, { t:"gruppe", g:"spinnen", n:7 }, "7 Spinnenarten");
add("libelle", "Libellenflügel", 3, { t:"gruppe", g:"libellen", n:7 }, "7 Libellenarten");
add("falter", "Falterflügel", 3, { t:"gruppe", g:"schmetterlinge", n:15 }, "15 Schmetterlingsarten");
add("platin", "Platin", 3, { t:"level", n:50 }, "Level 50");
add("rubin", "Rubin", 3, { t:"gefaehrdet", n:5 }, "5 gefährdete Arten");
add("smaragd", "Smaragd", 3, { t:"gruppe", g:"pflanzen", n:75 }, "75 Pflanzenarten");
add("saphir", "Saphir", 3, { t:"gruppe", g:"amphibien", n:7 }, "7 Amphibienarten");
add("mond", "Mondschein", 3, { t:"nachtFunde", n:25 }, "25 Funde in der Nacht");

// ---------- Legendär (bewegt) ----------
add("gluehwuermchen", "Glühwürmchen", 4, { t:"abz", id:"set-nachtschwaermer" }, "Sammelset „Nachtschwärmer“");
add("regenbogen", "Regenbogen", 4, { t:"abz", id:"regenbogen" }, "Abzeichen „Regenbogen“");
add("polarlicht", "Polarlicht", 4, { t:"level", n:75 }, "Level 75");
add("diamant", "Diamant", 4, { t:"abzAnzahl", n:200 }, "200 Abzeichen");
add("sternenhimmel", "Sternenhimmel", 4, { t:"abz", id:"nacht-100" }, "100 Funde in der Nacht");
add("sonnenkrone", "Sonnenkrone", 4, { t:"abz", id:"serie-100" }, "100 Tage am Stück");
add("phoenix", "Phönix", 4, { t:"abz", id:"serie-365" }, "Ein ganzes Jahr am Stück");
add("einhorn", "Einhorn", 4, { t:"selten", stufe:"sehrselten", n:5 }, "5 sehr seltene Arten");
add("gaia", "Gaia", 4, { t:"level", n:100 }, "Level 100");
add("jahresrad", "Jahresrad", 4, { t:"abz", id:"monate-12" }, "Funde in allen 12 Monaten");

export const RAHMEN = R;
export const RAH = Object.fromEntries(R.map(r => [r.id, r]));
