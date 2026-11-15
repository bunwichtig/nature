// Spielregeln: aus den Funden werden XP, Level, Abzeichen, Titel, Avatare, Umrandungen und Habitatkarten berechnet.
// Alles wird bei jeder Änderung neu aus der Fundliste gerechnet – so bleibt es immer stimmig.
import { GRUPPEN, GRUPPE } from "./katalog/gruppen.js";
import { ABZEICHEN, ABZ } from "./katalog/abzeichen.js";
import { TITEL } from "./katalog/titel.js";
import { AVATARE } from "./katalog/avatare.js";
import { RAHMEN } from "./katalog/rahmen.js";
import { HABITATE } from "./katalog/habitate.js";

// ---------- Level ----------
export const LEVEL_MAX = 100;
export const xpFuerLevel = n => Math.round(60 * Math.pow(Math.max(0, n - 1), 1.6));
export const levelAus = xp => { let n = 1; while (n < LEVEL_MAX && xpFuerLevel(n + 1) <= xp) n++; return n; };

// ---------- Seltenheit nach Beobachtungen weltweit (iNaturalist observations_count) ----------
export const SELTEN = [
  { id:"haeufig",   name:"Häufig",         ab:50000, bonus:0 },
  { id:"mittel",    name:"Mittelhäufig",   ab:10000, bonus:15 },
  { id:"weniger",   name:"Weniger häufig", ab:2000,  bonus:40 },
  { id:"selten",    name:"Selten",         ab:300,   bonus:100 },
  { id:"sehrselten",name:"Sehr selten",    ab:0,     bonus:250 }
];
export const seltenheit = obs => SELTEN.find(s => (obs ?? 0) >= s.ab) || SELTEN[4];

// ---------- Hilfen ----------
const JZ = m => m >= 3 && m <= 5 ? "fruehling" : m >= 6 && m <= 8 ? "sommer" : m >= 9 && m <= 11 ? "herbst" : "winter";
export const JAHRESZEIT_DE = { fruehling:"Frühling", sommer:"Sommer", herbst:"Herbst", winter:"Winter" };
const tagVon = iso => iso.slice(0, 10);
const km = (a, b) => {
  const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const ANFANG = s => (s || "").trim().charAt(0).toUpperCase().replace("Ä","A").replace("Ö","O").replace("Ü","U");
const istArt = f => !!f.art;
const anc = (f, rank) => f.anc?.find(a => a.r === rank)?.n || (f.rank === rank ? f.sci : null);

/** Gehört ein Fund zu einer Gruppe? */
export function inGruppe(f, g){
  if (g.wuchs) return (f.wu || "").includes(g.wuchs);
  if (g.match.includes(f.sci)) return true;
  return (f.anc || []).some(a => g.match.includes(a.n));
}
export const gruppenVon = f => GRUPPEN.filter(g => inGruppe(f, g)).map(g => g.id);

// ---------- XP je Fund ----------
/** Geht alle Funde der Zeit nach durch und vergibt XP. Gibt Gesamt-XP und die XP je Fund zurück. */
export function rechneXP(funde){
  const sorted = [...funde].sort((a, b) => a.zeit.localeCompare(b.zeit));
  const arten = new Set(), taxa = new Set(), gat = new Set(), fam = new Set(), ord = new Set(), kla = new Set(), proTag = new Set();
  const je = new Map(); let xp = 0;
  for (const f of sorted){
    const teile = [];
    if (istArt(f)){
      if (!arten.has(f.art.tid)){
        arten.add(f.art.tid);
        const s = seltenheit(f.obs);
        teile.push(["Neue Art", 50]);
        if (s.bonus) teile.push([s.name, s.bonus]);
        if (f.gef) teile.push(["Gefährdet", 50]);
        const g = anc(f, "genus"), fa = anc(f, "family"), o = anc(f, "order"), k = anc(f, "class");
        if (g && !gat.has(g)){ gat.add(g); teile.push(["Neue Gattung", 10]); }
        if (fa && !fam.has(fa)){ fam.add(fa); teile.push(["Neue Familie", 20]); }
        if (o && !ord.has(o)){ ord.add(o); teile.push(["Neue Ordnung", 40]); }
        if (k && !kla.has(k)){ kla.add(k); teile.push(["Neue Klasse", 80]); }
      } else {
        const key = f.art.tid + "|" + tagVon(f.zeit);
        if (!proTag.has(key)){ proTag.add(key); teile.push(["Wiedersehen", 5]); }
      }
    } else if (!taxa.has(f.tid)){ taxa.add(f.tid); teile.push(["Neue Gruppe (nicht bis zur Art)", 15]); }
    if (f.notiz?.trim()) teile.push(["Notiz", 3]);
    const sum = teile.reduce((s, [, n]) => s + n, 0);
    je.set(f.id, { sum, teile }); xp += sum;
  }
  return { xp, je };
}

// ---------- Kennzahlen ----------
export function kennzahlen(funde, einst = {}){
  const S = {
    funde: funde.length, arten: new Map(), gruppen: Object.fromEntries(GRUPPEN.map(g => [g.id, new Set()])),
    monate: new Set(), zeiten: new Set(), jahre: new Set(), tage: new Set(), md: new Set(), stunden: new Set(),
    nacht: 0, zellen: new Set(), punkte: [], selten: 0, sehrselten: 0, gef: new Set(), eing: new Set(),
    familien: new Set(), ordnungen: new Set(), klassen: new Set(), reiche: new Set(), buchstaben: new Set(),
    namen: [], jeArt: new Map(), artZeiten: new Map(), gattung: new Map(), tagArten: new Map(), tagReiche: new Map(),
    tagGruppen: new Map(), tagGattung: new Map(), notizen: 0, importiert: 0, heimat: new Set()
  };
  const heim = einst.heimat;
  for (const f of funde){
    const d = new Date(f.zeit), m = d.getMonth() + 1, h = d.getHours(), tag = tagVon(f.zeit);
    S.monate.add(m); S.zeiten.add(JZ(m)); S.jahre.add(d.getFullYear()); S.tage.add(tag); S.md.add(f.zeit.slice(5, 10)); S.stunden.add(h);
    if (h >= 21 || h < 5) S.nacht++;
    if (f.lat != null){ const z = `${Math.round(f.lat * 20)}|${Math.round(f.lng * 20)}`; if (!S.zellen.has(z)){ S.zellen.add(z); S.punkte.push({ lat:f.lat, lng:f.lng }); } }
    if (f.notiz?.trim()) S.notizen++;
    if (f.quelle === "inat") S.importiert++;
    const reich = anc(f, "kingdom"); if (reich){ S.reiche.add(reich); (S.tagReiche.get(tag) || S.tagReiche.set(tag, new Set()).get(tag)).add(reich); }
    const gs = gruppenVon(f);
    for (const g of gs) (S.tagGruppen.get(tag) || S.tagGruppen.set(tag, new Set()).get(tag)).add(g);
    if (!istArt(f)) continue;
    const id = f.art.tid;
    if (!S.arten.has(id)){
      S.arten.set(id, f);
      S.namen.push({ name:(f.art.name || "").toLowerCase(), reich });
      const sel = seltenheit(f.obs).id;
      if (sel === "selten" || sel === "sehrselten") S.selten++;
      if (sel === "sehrselten") S.sehrselten++;
      if (f.gef) S.gef.add(id);
      if (f.eing) S.eing.add(id);
      const fa = anc(f, "family"), o = anc(f, "order"), k = anc(f, "class"), g = anc(f, "genus");
      if (fa) S.familien.add(fa); if (o) S.ordnungen.add(o); if (k) S.klassen.add(k);
      if (g) S.gattung.set(g, (S.gattung.get(g) || 0) + 1);
      const b = ANFANG(f.art.name); if (/[A-Z]/.test(b)) S.buchstaben.add(b);
      if (heim && f.lat != null && km(heim, f) <= 2) S.heimat.add(id);
    }
    for (const g of gs) S.gruppen[g].add(id);
    S.jeArt.set(id, (S.jeArt.get(id) || 0) + 1);
    (S.artZeiten.get(id) || S.artZeiten.set(id, new Set()).get(id)).add(JZ(m));
    (S.tagArten.get(tag) || S.tagArten.set(tag, new Set()).get(tag)).add(id);
    const g = anc(f, "genus");
    if (g){ const k = tag + "|" + g; (S.tagGattung.get(k) || S.tagGattung.set(k, new Set()).get(k)).add(id); }
  }
  // Serien und Pausen
  const tage = [...S.tage].sort(); let serie = tage.length ? 1 : 0, best = serie, pause = 0;
  for (let i = 1; i < tage.length; i++){
    const diff = Math.round((new Date(tage[i]) - new Date(tage[i - 1])) / 864e5);
    serie = diff === 1 ? serie + 1 : 1; best = Math.max(best, serie); pause = Math.max(pause, diff);
  }
  S.serie = best; S.pause = pause;
  // Größte Entfernung zwischen zwei Fundorten (über Zellen von etwa 5 km)
  let weite = 0; const P = S.punkte.slice(0, 400);
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) weite = Math.max(weite, km(P[i], P[j]));
  S.weite = weite;
  S.sciArten = new Set([...S.arten.values()].map(f => f.art.sci));
  return S;
}

// ---------- Bedingungen ----------
const max = it => { let m = 0; for (const v of it) m = Math.max(m, v.size ?? v); return m; };

/** Fortschritt einer Bedingung: { ist, soll } (soll = 1 bei Ja/Nein-Bedingungen). */
export function fortschritt(w, C){
  const S = C.S, n = w.n ?? 1, ja = b => ({ ist: b ? 1 : 0, soll: 1 });
  switch (w.t){
    case "immer": return ja(true);
    case "gruppe": return { ist: S.gruppen[w.g]?.size || 0, soll: n };
    case "arten": return { ist: S.arten.size, soll: n };
    case "funde": return { ist: S.funde, soll: n };
    case "monat": return ja(S.monate.has(w.m));
    case "monate": return { ist: S.monate.size, soll: n };
    case "jahreszeit": return ja(S.zeiten.has(w.s));
    case "jahreszeiten": return { ist: S.zeiten.size, soll: n };
    case "vierZeiten": return { ist: max(S.artZeiten.values()), soll: 4 };
    case "jahre": return { ist: S.jahre.size, soll: n };
    case "datum": return ja(S.md.has(w.md));
    case "stunde": return ja([...S.stunden].some(h => h >= w.von && h < w.bis));
    case "nachtFunde": return { ist: S.nacht, soll: n };
    case "serie": return { ist: S.serie, soll: n };
    case "tage": return { ist: S.tage.size, soll: n };
    case "pause": return ja(S.pause >= n);
    case "tagArten": return { ist: max(S.tagArten.values()), soll: n };
    case "tagReiche": return { ist: max(S.tagReiche.values()), soll: n };
    case "tagGattung": return { ist: max(S.tagGattung.values()), soll: n };
    case "tagGruppen": return { ist: max([...S.tagGruppen.values()].map(s => w.gs.filter(g => s.has(g)).length)), soll: w.gs.length };
    case "orte": return { ist: S.zellen.size, soll: n };
    case "weite": return { ist: Math.floor(S.weite), soll: n };
    case "heimat": return { ist: S.heimat.size, soll: n };
    case "selten": return { ist: w.stufe === "sehrselten" ? S.sehrselten : S.selten, soll: n };
    case "gefaehrdet": return { ist: S.gef.size, soll: n };
    case "eingefuehrt": return { ist: S.eing.size, soll: n };
    case "familien": return { ist: S.familien.size, soll: n };
    case "ordnungen": return { ist: S.ordnungen.size, soll: n };
    case "klassen": return { ist: S.klassen.size, soll: n };
    case "reiche": return { ist: ["Animalia","Plantae","Fungi"].filter(r => S.reiche.has(r)).length, soll: n };
    case "gattungMax": return { ist: max(S.gattung.values()), soll: n };
    case "wieder": return { ist: max(S.jeArt.values()), soll: n };
    case "notizen": return { ist: S.notizen, soll: n };
    case "wort": return { ist: S.namen.filter(x => (!w.reich || x.reich === w.reich) && w.w.some(t => x.name.includes(t))).length, soll: n };
    case "buchstaben": return { ist: S.buchstaben.size, soll: n };
    case "artenAlle": return { ist: w.sci.filter(s => S.sciArten.has(s)).length, soll: w.sci.length };
    case "importiert": return { ist: S.importiert, soll: n };
    case "profil": return ja(!!C.einst.profilGewaehlt);
    case "level": return { ist: C.level, soll: n };
    case "xp": return { ist: C.xp, soll: n };
    case "karten": return { ist: C.karten.size, soll: n };
    case "abz": return ja(C.abz?.has(w.id));
    case "abzAnzahl": return { ist: C.abz?.size || 0, soll: n };
    case "abzAlle": return { ist: w.ids.filter(id => C.abz?.has(id)).length, soll: w.ids.length };
    default: return { ist: 0, soll: 1 };
  }
}
export const erfuellt = (w, C) => { const p = fortschritt(w, C); return p.ist >= p.soll; };

/** Bedingung in Worten */
export function beschreibe(w){
  const n = w.n ?? 1, de = x => new Intl.NumberFormat("de-DE").format(x);
  switch (w.t){
    case "immer": return "Von Anfang an";
    case "gruppe": return `${n === 1 ? "1 Art" : n + " Arten"} aus „${GRUPPE[w.g]?.label}“`;
    case "abz": return `Abzeichen „${ABZ[w.id]?.name || w.id}“`;
    case "level": return `Level ${n}`;
    case "xp": return `${de(n)} XP`;
    default: return null;
  }
}

// ---------- Alles zusammen ----------
/** Spielstand aus Funden und Einstellungen berechnen. */
export function spielstand(funde, einst = {}){
  const { xp, je } = rechneXP(funde);
  const level = levelAus(xp);
  const karten = new Set(HABITATE.filter(h => xp >= h.xp).map(h => h.id));
  const S = kennzahlen(funde, einst);
  const C = { S, einst, xp, level, karten, abz: new Set() };
  // Zwei Durchgänge, weil manche Abzeichen von anderen Abzeichen abhängen
  for (let i = 0; i < 3; i++){
    const neu = new Set(ABZEICHEN.filter(a => erfuellt(a.wann, C)).map(a => a.id));
    const gleich = neu.size === C.abz.size;
    C.abz = neu; if (gleich && i) break;
  }
  C.titel = new Set(TITEL.filter(t => erfuellt(t.wann, C)).map(t => t.id));
  C.avatare = new Set(AVATARE.filter(a => erfuellt(a.wann, C)).map(a => a.id));
  C.rahmen = new Set(RAHMEN.filter(r => erfuellt(r.wann, C)).map(r => r.id));
  C.je = je;
  C.sammlerwert = [...C.abz].reduce((s, id) => s + (ABZ[id]?.xp || 0), 0);
  C.levelVon = xpFuerLevel(level); C.levelBis = level >= LEVEL_MAX ? xpFuerLevel(level) : xpFuerLevel(level + 1);
  return C;
}
