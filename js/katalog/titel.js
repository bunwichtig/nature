// Titel stehen unter dem Namen im Profil und in der Bestenliste.
// Quellen: Level, gesammelte XP, Abzeichen (jede Gruppe ab Platin und bei Diamant) und Sonderabzeichen.
import { GRUPPEN } from "./gruppen.js";
import { ABZ } from "./abzeichen.js";

const T = [];
const add = (id, name, art, wann, text) => T.push({ id, name, art, wann, text });

// ---------- Level ----------
[[1,"Spaziergang"],[3,"Wegrand-Entdeckung"],[5,"Feldbuch-Neuling"],[8,"Pfadfinder"],[10,"Naturfreund"],
 [12,"Spurensuche"],[15,"Feldforscher"],[18,"Lupenträger"],[20,"Naturkundler"],[25,"Wildnis-Wanderer"],
 [30,"Biotop-Kenner"],[35,"Artenspäher"],[40,"Ökologe"],[45,"Expeditionsleitung"],[50,"Naturforscher"],
 [55,"Feldbiologe"],[60,"Artenkenner"],[65,"Naturhistoriker"],[70,"Hüter der Vielfalt"],[75,"Weise der Wälder"],
 [80,"Stimme der Natur"],[85,"Großmeister der Arten"],[90,"Lebende Legende"],[95,"Gaias Auge"],[100,"Herz der Erde"]]
  .forEach(([n, name]) => add(`lv-${n}`, name, "Level", { t:"level", n }, `Level ${n}`));

// ---------- Erfahrungspunkte ----------
[[1000,"Tausend Schritte"],[5000,"Erfahrene Sohlen"],[10000,"Zehntausend Blicke"],[25000,"Feldbuch voller Leben"],
 [50000,"Fünfzigtausend Momente"],[100000,"Wandelnde Enzyklopädie"],[150000,"Unermesslich"],[250000,"Ewiger Wanderer"]]
  .forEach(([n, name]) => add(`xp-${n}`, name, "Erfahrung", { t:"xp", n }, `${new Intl.NumberFormat("de-DE").format(n)} XP gesammelt`));

// ---------- Gruppen (aus den Sammler-Abzeichen) ----------
for (const g of GRUPPEN){
  add(`g-${g.id}-4`, g.titel[0], "Abzeichen", { t:"abz", id:`g-${g.id}-4` }, `Abzeichen „${g.namen[3]}“ (${g.label}, Platin)`);
  add(`g-${g.id}-5`, g.titel[1], "Abzeichen", { t:"abz", id:`g-${g.id}-5` }, `Abzeichen „${g.namen[4]}“ (${g.label}, Diamant)`);
}

// ---------- Sonderabzeichen ----------
[["zeit-geisterstunde","Geisterstunden-Gast"],["nacht-100","Kind der Nacht"],["zeit-morgengrauen","Morgenstern"],
 ["serie-30","Unermüdlicher Geist"],["serie-365","Jahreskreis-Wächter"],["tage-365","Draußen zuhause"],
 ["tag-arten-50","Big-Day-Legende"],["drei-reiche","Diener dreier Reiche"],["fuenf-gruppen","Allrounder"],
 ["orte-50","Weltenbummler"],["weite-1000","Fernwanderer"],["heimat-150","Hüter der Nachbarschaft"],
 ["sehrselten-1","Einhorn-Finder"],["sehrselten-25","Legendensammlung"],["gefaehrdet-30","Hüter der Roten Liste"],
 ["eingefuehrt-15","Neobiota-Detektiv"],["familien-100","Familien-Chronist"],["ordnungen-60","Meister der Ordnung"],
 ["klassen-15","Klassenkunde"],["wieder-25","Treue Seele"],["notizen-200","Naturschriftsteller"],
 ["regenbogen","Regenbogenjäger"],["zoo-im-garten","Zoodirektor im Garten"],["abc-23","Alphabet-Gelehrter"],
 ["set-grosse-fuenf","Kenner der Großen Fünf"],["set-giftschrank","Giftschrank-Wächter"],["set-reptilien-set","Drachenkunde"],
 ["set-nachtschwaermer","Nachtschwärmer"],["set-pilzkorb","Pilzsammler"],["set-moor-set","Moorgeist"],
 ["monate-12","Ganzjahres-Blick"],["vierzeiten-art","Treuer Jahreszeitenfreund"],["jahre-10","Zehn Jahresringe"],
 ["tag-10-31","Spukfund-Sammler"],["tag-02-29","Glückskind des Schalttags"],["tag-12-24","Christkind im Wald"],
 ["karten-40","Kartograf"],["abz-100","Ordensträger"],["abz-350","Ehrenhalle"]]
  .forEach(([id, name]) => add(`s-${id}`, name, "Abzeichen", { t:"abz", id }, `Abzeichen „${ABZ[id]?.name || id}“`));

export const TITEL = T;
export const TIT = Object.fromEntries(T.map(t => [t.id, t]));
