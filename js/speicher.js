// Der Spielstand liegt nur auf diesem Gerät (localStorage). Es gibt keinen eigenen Server.
// Mehrere Spieler können sich ein Gerät teilen – wie bei Bomberman: einfach dazukommen und loslegen.
// Sicherung: als Datei exportieren und wieder einlesen.
import { local } from "./util.js";

const KEY = "pn-spiel-v1";
const START_AVATARE = ["start-spross", "start-blatt", "start-stein"];
const neueId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const LEER = (name = "", avatar = "start-spross") => ({
  id: neueId(), funde: [], freunde: [],
  einst: { name, heimat:null, pro:false, avatar, rahmen:"holz", titel:null, profilGewaehlt:false, seit:new Date().toISOString() }
});
const fuellen = s => { const l = LEER(); s.einst = Object.assign(l.einst, s.einst); s.funde ||= []; s.freunde ||= []; s.id ||= l.id; return s; };

function laden(){
  const roh = local.get(KEY, null);
  if (!roh) { const s = LEER(); return { spieler:[s], aktiv:s.id }; }
  if (!roh.spieler) { const s = fuellen({ funde:roh.funde, einst:roh.einst, freunde:roh.freunde }); return { spieler:[s], aktiv:s.id }; }   // altes Format
  roh.spieler = roh.spieler.map(fuellen);
  if (!roh.spieler.some(s => s.id === roh.aktiv)) roh.aktiv = roh.spieler[0].id;
  return roh;
}
let root = laden();
const hoerer = new Set();

export const spiel = () => root.spieler.find(s => s.id === root.aktiv);
export const alleSpieler = () => root.spieler;
export const beiAenderung = fn => hoerer.add(fn);
export function speichern(){
  const ok = local.set(KEY, root);
  hoerer.forEach(fn => fn(spiel()));
  return ok;
}
export function fundHinzu(f){ spiel().funde.push(f); return speichern(); }
export function fundeHinzu(liste){ spiel().funde.push(...liste); return speichern(); }
export function fundLoeschen(id){ const s = spiel(); s.funde = s.funde.filter(f => f.id !== id); return speichern(); }
export function einstellen(patch){ Object.assign(spiel().einst, patch); return speichern(); }
export { neueId, START_AVATARE };

/** Neuer Spieler am selben Gerät – Heimatort und Pro übernimmt er vom aktuellen */
export function mitspielen(name, avatar){
  const vor = spiel(), s = LEER(name, avatar);
  s.einst.heimat = vor?.einst.heimat || null; s.einst.pro = !!vor?.einst.pro;
  root.spieler.push(s); root.aktiv = s.id; return speichern();
}
export function wechseln(id){ if (root.spieler.some(s => s.id === id)){ root.aktiv = id; speichern(); } }
export function spielerEntfernen(id){
  if (root.spieler.length < 2) return false;
  root.spieler = root.spieler.filter(s => s.id !== id);
  if (root.aktiv === id) root.aktiv = root.spieler[0].id;
  return speichern();
}

export function exportieren(){
  const blob = new Blob([JSON.stringify(root, null, 1)], { type:"application/json" });
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`naturspiel-sicherung-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export async function einlesen(file){
  const d = JSON.parse(await file.text());
  if (Array.isArray(d.spieler)){ root = { spieler:d.spieler.map(fuellen), aktiv:d.aktiv }; if (!root.spieler.some(s => s.id === root.aktiv)) root.aktiv = root.spieler[0].id; }
  else if (Array.isArray(d.funde)){ const s = fuellen({ funde:d.funde, einst:d.einst, freunde:d.freunde }); root = { spieler:[s], aktiv:s.id }; }
  else throw new Error("Das ist keine Sicherung aus diesem Spiel.");
  return speichern();
}
/** Nur den aktuellen Spieler zurücksetzen */
export function allesLoeschen(){
  const s = spiel(), neu = LEER(s.einst.name, s.einst.avatar);
  neu.id = s.id; root.spieler = root.spieler.map(x => x.id === s.id ? neu : x); return speichern();
}
