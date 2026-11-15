// Der Spielstand liegt nur auf diesem Gerät (localStorage). Es gibt keinen eigenen Server.
// Sicherung: als Datei exportieren und wieder einlesen.
import { local } from "./util.js";

const KEY = "pn-spiel-v1";
const LEER = () => ({
  funde: [],
  einst: { name:"", heimat:null, pro:false, avatar:"start-spross", rahmen:"holz", titel:null, profilGewaehlt:false },
  freunde: [],
  gesehen: null          // was beim letzten Mal schon freigeschaltet war (für „Neu!“)
});

let daten = Object.assign(LEER(), local.get(KEY, {}));
daten.einst = Object.assign(LEER().einst, daten.einst);
const hoerer = new Set();

export const spiel = () => daten;
export const beiAenderung = fn => hoerer.add(fn);
export function speichern(){
  const ok = local.set(KEY, daten);
  hoerer.forEach(fn => fn(daten));
  return ok;
}
export function fundHinzu(f){ daten.funde.push(f); return speichern(); }
export function fundeHinzu(liste){ daten.funde.push(...liste); return speichern(); }
export function fundLoeschen(id){ daten.funde = daten.funde.filter(f => f.id !== id); return speichern(); }
export function einstellen(patch){ Object.assign(daten.einst, patch); return speichern(); }
export const neueId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function exportieren(){
  const blob = new Blob([JSON.stringify(daten, null, 1)], { type:"application/json" });
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`naturspiel-sicherung-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export async function einlesen(file){
  const d = JSON.parse(await file.text());
  if (!Array.isArray(d.funde)) throw new Error("Das ist keine Sicherung aus diesem Spiel.");
  daten = Object.assign(LEER(), d); daten.einst = Object.assign(LEER().einst, d.einst);
  return speichern();
}
export function allesLoeschen(){ daten = LEER(); return speichern(); }
