// Avatare: ein Zeichen (Emoji der Systemschrift, keine fremden Bilder) vor einer Szene.
// Jede Sammel-Gruppe schaltet drei Avatare frei (Bronze, Gold, Diamant), dazu kommen Sonder-Avatare.
import { GRUPPEN } from "./gruppen.js";

// Szenen = Hintergründe (CSS-Verläufe, in css/app.css als .sz-<name>)
export const SZENEN = {
  wiese:"Sommerwiese", wald:"Waldlicht", nacht:"Mondnacht", wasser:"Uferblau", morgen:"Morgenrot", herbst:"Herbstlaub",
  schnee:"Neuschnee", moor:"Moornebel", sonne:"Mittagssonne", gold:"Goldglanz", sterne:"Sternenhimmel", polar:"Polarlicht"
};

// Grund-Szene je Gruppe (sonst nach Bereich: Tiere → Wiese, Pflanzen → Wald, Pilze → Herbst)
const SZENE = {
  eulen:"nacht", fledermaeuse:"nacht", voegel:"morgen", singvoegel:"morgen", greife:"sonne", spechte:"wald",
  enten:"wasser", watvoegel:"wasser", reiher:"wasser", fische:"wasser", libellen:"wasser", amphibien:"moor",
  molche:"moor", froesche:"moor", muscheln:"wasser", krebse:"wasser", wasserpflanzen:"wasser", moose:"moor",
  sauergraeser:"moor", reptilien:"sonne", schlangen:"sonne", eidechsen:"sonne", schildkroeten:"wasser",
  rabenvoegel:"schnee", meisen:"schnee", nadelbaeume:"schnee", huftiere:"wald", raubtiere:"wald", saeuger:"wald",
  nager:"wald", insektenfresser:"herbst", schnecken:"moor", flechten:"schnee", schleimpilze:"moor"
};
const BEREICH_SZENE = { tiere:"wiese", pflanzen:"wald", pilze:"herbst" };

// Für die Avatare schönere Zeichen als für die Abzeichen (alle einzeln gut lesbar)
const ZEICHEN = {
  voegel:"🐦", greife:"🦅", eulen:"🦉", spechte:"🐦", enten:"🦆", singvoegel:"🐤", watvoegel:"🕊️", rabenvoegel:"🐦‍⬛",
  meisen:"🐥", reiher:"🦩", tauben:"🕊️", saeuger:"🦊", fledermaeuse:"🦇", nager:"🐿️", raubtiere:"🦡", huftiere:"🦌",
  insektenfresser:"🦔", amphibien:"🐸", molche:"🦎", froesche:"🐸", reptilien:"🐊", schlangen:"🐍", eidechsen:"🦎",
  schildkroeten:"🐢", fische:"🐟", insekten:"🐞", schmetterlinge:"🦋", tagfalter:"🦋", libellen:"🪽", kaefer:"🪲",
  marienkaefer:"🐞", laufkaefer:"🪲", bienen:"🐝", hummeln:"🐝", ameisen:"🐜", wanzen:"🪳", heuschrecken:"🦗",
  fliegen:"🪰", schwebfliegen:"🪰", spinnentiere:"🦂", spinnen:"🕷️", weberknechte:"🕸️", tausendfuesser:"🐛",
  schnecken:"🐌", muscheln:"🐚", krebse:"🦀", pflanzen:"🌿", baeume:"🌳", straeucher:"🫐", nadelbaeume:"🌲",
  orchideen:"🪻", korbbluetler:"🌼", rosen:"🌹", huelsen:"🫛", lippenbluetler:"🌱", doldenbluetler:"💮", hahnenfuss:"🌻",
  graeser:"🌾", sauergraeser:"🎋", farne:"☘️", moose:"🍀", wasserpflanzen:"🪷", fruehblueher:"🌷", kletterpflanzen:"🍃",
  pilze:"🍄", roehrlinge:"🍄‍🟫", blaetterpilze:"🍄", taeublinge:"🍄", porlinge:"🪵", flechten:"🪨", schleimpilze:"🫧"
};

const V = [];
const add = (id, name, zeichen, szene, wann, text) => V.push({ id, name, zeichen, szene, wann, text });

// ---------- Start-Avatare (immer frei) ----------
add("start-spross", "Spross", "🌱", "wiese", { t:"immer" }, "Von Anfang an");
add("start-blatt", "Blatt im Wind", "🍃", "wald", { t:"immer" }, "Von Anfang an");
add("start-stein", "Kieselstein", "🪨", "wasser", { t:"immer" }, "Von Anfang an");

// ---------- Gruppen-Avatare ----------
for (const g of GRUPPEN){
  const z = ZEICHEN[g.id] || g.zeichen, s = SZENE[g.id] || BEREICH_SZENE[g.bereich];
  add(`g-${g.id}-1`, `${g.label}: ${SZENEN[s]}`, z, s, { t:"abz", id:`g-${g.id}-1` }, `Abzeichen „${g.namen[0]}“`);
  add(`g-${g.id}-3`, `${g.label}: Goldglanz`, z, "gold", { t:"abz", id:`g-${g.id}-3` }, `Abzeichen „${g.namen[2]}“ (Gold)`);
  add(`g-${g.id}-5`, `${g.label}: Polarlicht`, z, "polar", { t:"abz", id:`g-${g.id}-5` }, `Abzeichen „${g.namen[4]}“ (Diamant)`);
}

// ---------- Level ----------
[[2,"Keimling","🌱","morgen"],[5,"Junger Trieb","🌿","wiese"],[10,"Wanderstiefel","🥾","wald"],[15,"Lupe","🔍","sonne"],
 [20,"Rucksack","🎒","herbst"],[25,"Fernglas","🔭","morgen"],[30,"Zeltlager","🏕️","nacht"],[40,"Kompass","🧭","moor"],
 [50,"Weltkarte","🗺️","gold"],[60,"Bergspitze","🏔️","schnee"],[70,"Mondsichel","🌙","sterne"],[80,"Sonnenkrone","☀️","gold"],
 [90,"Sternschnuppe","🌠","sterne"],[100,"Blauer Planet","🌍","polar"]]
  .forEach(([n, name, z, s]) => add(`lv-${n}`, name, z, s, { t:"level", n }, `Level ${n}`));

// ---------- Jahreszeiten, Tageszeiten, besondere Tage ----------
[["fruehling","Frühlingsbote","🌷","wiese"],["sommer","Sommerkind","🌻","sonne"],["herbst","Herbstwind","🍁","herbst"],["winter","Schneeflocke","❄️","schnee"]]
  .forEach(([s, name, z, sz]) => add(`zeit-${s}`, name, z, sz, { t:"abz", id:`zeit-${s}` }, `Ein Fund im ${name.startsWith("Früh") ? "Frühling" : name.startsWith("Sommer") ? "Sommer" : name.startsWith("Herbst") ? "Herbst" : "Winter"}`));
[["zeit-morgengrauen","Morgenstern","🌅","morgen"],["zeit-geisterstunde","Geisterstunde","👻","nacht"],["nacht-25","Nachtauge","🌙","sterne"],
 ["tag-10-31","Kürbislicht","🎃","nacht"],["tag-12-24","Tannenbaum","🎄","schnee"],["tag-01-01","Feuerwerk","🎆","sterne"],
 ["tag-06-21","Mittsommer","🌞","sonne"],["tag-05-20","Bienentag","🐝","wiese"],["tag-04-22","Erdentag","🌍","wiese"],["tag-02-29","Glücksklee","🍀","gold"]]
  .forEach(([id, name, z, s]) => add(`s-${id}`, name, z, s, { t:"abz", id }, "Sonderabzeichen"));

// ---------- Sammelsets und Besonderes ----------
[["set-grosse-fuenf","Platzhirsch","🦌","gold"],["set-eulen-trio","Eulenrat","🦉","sterne"],["set-reptilien-set","Kleiner Drache","🐉","sonne"],
 ["set-giftschrank","Giftmischer","☠️","moor"],["set-pilzkorb","Pilzkorb","🧺","herbst"],["set-wasserwelt","Wassertropfen","💧","wasser"],
 ["set-zugvoegel","Zugvogel","🪿","morgen"],["set-nachtschwaermer","Glühwürmchen","✨","nacht"],["set-moor-set","Moorlicht","🫧","moor"],
 ["sehrselten-1","Einhorn","🦄","polar"],["selten-5","Juwel","💎","sterne"],["gefaehrdet-5","Schutzschild","🛡️","wald"],
 ["serie-30","Lagerfeuer","🔥","nacht"],["serie-365","Phönix","🐦‍🔥","gold"],["tag-arten-20","Blitz","⚡","sonne"],
 ["orte-25","Heißluftballon","🎈","morgen"],["weite-1000","Weltreise","✈️","sonne"],["abc-20","Buchstabensalat","🔤","wiese"],
 ["regenbogen","Regenbogen","🌈","polar"],["zoo-im-garten","Löwenzahn-Löwe","🦁","wiese"],["drei-reiche","Dreizack","🔱","wasser"],
 ["familien-50","Stammbaum","🌳","gold"],["abz-50","Ordensband","🎖️","gold"],["abz-200","Pokal","🏆","polar"],
 ["karten-10","Atlas","🗺️","wald"],["import-1","Brücke","🌉","wasser"],["vierzeiten-art","Jahresbaum","🌳","polar"]]
  .forEach(([id, name, z, s]) => add(`s-${id}`, name, z, s, { t:"abz", id }, "Abzeichen"));

export const AVATARE = V;
export const AVA = Object.fromEntries(V.map(a => [a.id, a]));
