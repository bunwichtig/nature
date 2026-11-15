// Drei Gegner (Computer-Spieler). Sie haben schon einen Vorsprung und sammeln jeden Tag weiter –
// berechnet aus einem festen Zufall pro Gegner und Tag, also auf jedem Gerät gleich und ohne Server.
// Ihre Funde laufen durch dieselben Regeln wie deine: XP, Level, Abzeichen, Titel, Avatare, Umrandungen.
import { ARTEN } from "./katalog/arten.js";
import { spielstand, gruppenVon } from "./regeln.js";
import { GRUPPE } from "./katalog/gruppen.js";
import { TITEL } from "./katalog/titel.js";
import { RAH } from "./katalog/rahmen.js";

export const GEGNER = [
  { id:"fritzi", name:"Fritzi Fernglas", spruch:"Ich hör den Buchfink, bevor du ihn siehst!", vorsprung:45, tempo:1.3,
    stunden:[5, 10], vorliebe:{ tiere:4, pflanzen:1, pilze:0.3 }, liebling:["voegel"], avatar:["g-voegel-3","g-voegel-1"], rahmen:["federkranz","feder"] },
  { id:"moosbart", name:"Opa Moosbart", spruch:"Pilze laufen nicht weg. Ich auch nicht.", vorsprung:60, tempo:0.8,
    stunden:[10, 17], vorliebe:{ tiere:0.6, pflanzen:3, pilze:3 }, liebling:["pilze","pflanzen","moose"], avatar:["g-pilze-3","g-pilze-1"], rahmen:["pilzring","moos"] },
  { id:"nox", name:"Nox die Nachteule", spruch:"Die besten Funde gibt's nach Mitternacht.", vorsprung:30, tempo:1.0,
    stunden:[20, 27], vorliebe:{ tiere:3, pflanzen:0.5, pilze:0.5 }, liebling:["saeuger","amphibien","fledermaeuse","eulen"], avatar:["s-zeit-geisterstunde","g-fledermaeuse-1"], rahmen:["mond","sternenhimmel"] }
];

// Fester Zufall (mulberry32)
const zufall = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const tagStr = d => d.toISOString().slice(0, 10);
const bereichVon = a => GRUPPE[gruppenVon(a).find(g => GRUPPE[g].bereich)]?.bereich || "tiere";

/** Alle Funde eines Gegners vom Start (dein Spielbeginn minus Vorsprung) bis heute */
export function gegnerFunde(g, seit){
  const start = new Date(seit); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - g.vorsprung);
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const gewicht = ARTEN.map(a => {
    const gs = gruppenVon(a);
    return (g.vorliebe[bereichVon(a)] ?? 1) * (gs.some(x => g.liebling.includes(x)) ? 2.5 : 1) * (a.obs > 100000 ? 1.5 : a.obs < 20000 ? 0.5 : 1);
  });
  const summe = gewicht.reduce((s, w) => s + w, 0);
  const funde = [], gesehen = new Set();
  for (const d = new Date(start); d <= heute; d.setDate(d.getDate() + 1)){
    const tag = tagStr(new Date(d.getTime() - d.getTimezoneOffset() * 6e4));
    const r = zufall(hash(g.id + tag));
    // Wie viele Funde heute? Manchmal Pause, manchmal ein großer Tag
    let n = r() < 0.25 ? 0 : Math.round(r() * g.tempo * 2.2);
    if (r() < 0.05) n += 5;
    for (let i = 0; i < n; i++){
      let x = r() * summe, k = 0;
      while ((x -= gewicht[k]) > 0 && k < ARTEN.length - 1) k++;
      // Bekannte Arten werden öfter übersprungen, damit die Sammlung wächst
      if (gesehen.has(k) && r() < 0.6) continue;
      gesehen.add(k);
      const std = (g.stunden[0] + Math.floor(r() * (g.stunden[1] - g.stunden[0]))) % 24, min = Math.floor(r() * 60);
      const a = ARTEN[k];
      funde.push({ ...a, id:`${g.id}-${tag}-${i}`, zeit:`${tag}T${String(std).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        lat:null, lng:null, ort:"", notiz: r() < 0.2 ? "Notiert." : "", quelle:"gegner" });
    }
  }
  return funde;
}

const cache = new Map();
/** Gegner mit berechnetem Spielstand (einmal pro Tag neu) */
export function gegnerStand(seit){
  const key = tagStr(new Date()) + "|" + seit;
  if (cache.has(key)) return cache.get(key);
  const out = GEGNER.map(g => {
    const funde = gegnerFunde(g, seit);
    const C = spielstand(funde, {});
    const avatar = g.avatar.find(a => C.avatare.has(a)) || "start-blatt";
    const rahmen = g.rahmen.find(r => C.rahmen.has(r)) || [...C.rahmen].sort((a, b) => (RAH[b]?.selten || 0) - (RAH[a]?.selten || 0))[0] || "holz";
    const titel = [...TITEL].reverse().find(t => C.titel.has(t.id))?.name || "";
    return { ...g, funde, C, avatarId:avatar, rahmenId:rahmen, titel };
  });
  cache.clear(); cache.set(key, out);
  return out;
}
