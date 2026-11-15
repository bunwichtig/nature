// „Schritt für Schritt bestimmen“ im Reiter Eintragen.
// 1. Gruppe wählen (Vögel, Bäume & Sträucher, Insekten …)
// 2. Nur die Fragen, die in dieser Gruppe wirklich etwas unterscheiden (Größe, Beine, Flügel, Wuchs, Blätter, Pilzform, Ort, Jahreszeit)
// 3. Passende Untergruppen (Familien/Ordnungen aus der Merkmalstabelle von naturewissen)
// 4. Arten dazu aus iNaturalist – am Heimatort (sonst in Deutschland) nach Häufigkeit, mehrseitig.
// Bis 25 Untergruppen werden direkt über ihre iNaturalist-Nummern abgefragt, sonst über die Großgruppe (wie im Bauplan).
import { esc, fmt, photoSize, freePhoto, commonName } from "./util.js";
import { inat, INAT_DE, taxonIdsOf, isAbort } from "./api.js";

const GROB = [
  { id:"voegel", label:"Vögel", z:"🐦", taxa:"Aves", ok:g => g.icon === "Aves" },
  { id:"saeuger", label:"Säugetiere", z:"🦊", taxa:"Mammalia", ok:g => g.icon === "Mammalia" },
  { id:"amph", label:"Amphibien", z:"🐸", taxa:"Amphibia", ok:g => g.icon === "Amphibia" },
  { id:"rept", label:"Reptilien", z:"🦎", taxa:"Reptilia", ok:g => g.icon === "Reptilia" },
  { id:"fische", label:"Fische", z:"🐟", taxa:"Actinopterygii", ok:g => g.icon === "Actinopterygii" },
  { id:"insekten", label:"Insekten", z:"🐞", taxa:"Insecta", ok:g => g.icon === "Insecta" },
  { id:"spinnen", label:"Spinnen & Co.", z:"🕷️", taxa:"Arachnida", ok:g => g.icon === "Arachnida" },
  { id:"weich", label:"Schnecken & Muscheln", z:"🐌", taxa:"Mollusca", ok:g => g.icon === "Mollusca" },
  { id:"baeume", label:"Bäume & Sträucher", z:"🌳", taxa:"Plantae", ok:g => g.icon === "Plantae" && (g.a.g?.has("baum") || g.a.g?.has("strauch")) },
  { id:"blumen", label:"Blumen & Kräuter", z:"🌼", taxa:"Plantae", ok:g => g.icon === "Plantae" && (g.a.g?.has("kraut") || g.a.g?.has("kletter") || g.a.g?.has("wasser")) },
  { id:"gras", label:"Gräser, Farne & Moose", z:"🌾", taxa:"Plantae", ok:g => g.icon === "Plantae" && (g.a.g?.has("gras") || g.a.g?.has("moos")) },
  { id:"pilze", label:"Pilze & Flechten", z:"🍄", taxa:"Fungi,Protozoa", ok:g => g.icon === "Fungi" || g.icon === "Protozoa" }
];
const FRAGEN_REIHE = ["g", "b", "f", "z", "l", "w", "h"];
const MONATE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

let M = null;                 // Merkmalstabelle (wird beim ersten Öffnen geladen)
const st = { grob:null, wahl:{}, unter:null, monat:false, bluete:false, page:1, per:20 };
let ergebnis = null, laeuft = null;
let ctx = { hat:() => false, heimat:() => null, neu:() => {} };

export function initBestimmen(c){ ctx = c; }
async function laden(){ if (!M) M = await import("../daten/merkmale.js"); return M; }

const passend = () => {
  if (!M || !st.grob) return [];
  const grob = GROB.find(x => x.id === st.grob);
  return M.GRUPPEN.filter(g => grob.ok(g) && Object.entries(st.wahl).every(([k, v]) => g.a[k]?.has(v)));
};

/** HTML für den ganzen Bereich */
export function bestimmenHTML(){
  if (!M){ laden().then(() => ctx.neu()); return `<section class="karte"><h2>Schritt für Schritt bestimmen</h2><p class="muted">Lade …</p></section>`; }
  const schritt1 = `<div class="schritt"><b>1. Was ist es?</b><div class="grob">${GROB.map(g =>
    `<button class="grob-k${st.grob === g.id ? " an" : ""}" data-bf-grob="${g.id}"><span>${g.z}</span>${esc(g.label)}</button>`).join("")}</div></div>`;
  if (!st.grob) return `<section class="karte bestimmen"><h2>Schritt für Schritt bestimmen</h2>${schritt1}</section>`;

  const grob = GROB.find(x => x.id === st.grob);
  const basis = M.GRUPPEN.filter(grob.ok), liste = passend();
  // Nur Fragen zeigen, die unter den noch passenden Gruppen etwas unterscheiden (oder schon beantwortet sind)
  const fragen = FRAGEN_REIHE.map(id => M.MERKMALE.find(m => m.id === id)).filter(Boolean).map(m => {
    const ohne = basis.filter(g => Object.entries(st.wahl).every(([k, v]) => k === m.id || g.a[k]?.has(v)));
    const opts = m.opts.map(([v, l]) => ({ v, l, n: ohne.filter(g => g.a[m.id]?.has(v)).length })).filter(o => o.n);
    return { m, opts, wichtig: st.wahl[m.id] || (opts.length > 1 && opts.some(o => o.n < ohne.length)) };
  }).filter(f => f.wichtig);
  const pflanze = ["baeume", "blumen", "gras"].includes(st.grob);
  const schritt2 = `<div class="schritt"><b>2. Merkmale</b> <small class="muted">– nur, was du sicher weißt</small>
    ${fragen.map(({ m, opts }) => `<div class="frage"><span>${esc(m.label)}</span><div class="chips">${opts.map(o =>
      `<button class="chip${st.wahl[m.id] === o.v ? " an" : ""}" data-bf-m="${m.id}" data-bf-v="${o.v}">${esc(o.l)} <small>${o.n}</small></button>`).join("")}</div></div>`).join("")}
    <div class="frage"><span>Wann?</span><div class="chips">
      <button class="chip${st.monat ? " an" : ""}" data-bf-monat="1">jetzt im ${MONATE[new Date().getMonth()]}</button>
      ${pflanze ? `<button class="chip${st.bluete ? " an" : ""}" data-bf-bluete="1">blüht gerade</button>` : ""}</div></div>
    ${Object.keys(st.wahl).length || st.monat || st.bluete ? `<button class="btn leise klein" data-bf-reset="1">Merkmale zurücksetzen</button>` : ""}</div>`;
  const schritt3 = `<div class="schritt"><b>3. Passende Gruppen (${liste.length})</b>
    <div class="chips">${liste.length > 1 ? `<button class="chip${!st.unter ? " an" : ""}" data-bf-unter="">alle</button>` : ""}${liste.map(g =>
      `<button class="chip${st.unter === g.sci ? " an" : ""}" data-bf-unter="${esc(g.sci)}">${esc(g.label)}</button>`).join("")}</div>
    ${!liste.length ? `<p class="muted">Keine Gruppe passt zu allen Merkmalen. Nimm eines wieder heraus.</p>` : ""}</div>`;
  const h = ctx.heimat();
  const schritt4 = liste.length ? `<div class="schritt"><b>4. Arten</b> <small class="muted">${h ? `um ${esc(h.ort)} (50 km)` : "in Deutschland"}, häufigste zuerst</small>
    <div id="bf-arten">${artenHTML()}</div></div>` : "";
  return `<section class="karte bestimmen"><h2>Schritt für Schritt bestimmen</h2>${schritt1}${schritt2}${schritt3}${schritt4}</section>`;
}

function artenHTML(){
  if (!ergebnis) return `<p class="muted">Lade Arten …</p>`;
  if (ergebnis.fehler) return `<p class="muted">${esc(ergebnis.fehler)}</p>`;
  if (!ergebnis.results.length) return `<p class="muted">Hier wurden noch keine passenden Arten bestätigt.</p>`;
  return `<div class="liste">${ergebnis.results.map(r => {
    const t = r.taxon, ph = freePhoto(t), hab = ctx.hat(t.id);
    return `<a class="zeile" href="#eintragen/${t.id}">${ph ? `<img class="mini" src="${esc(photoSize(ph.square_url || ph.url, "square"))}" alt="" loading="lazy" title="Foto: ${esc(ph.attribution)}">` : `<span class="mini nofoto">${GROB.find(x => x.id === st.grob)?.z || "🌱"}</span>`}
      <span><b>${esc(commonName(t))}</b><small>${esc(t.name)} · ${fmt(r.count)} Funde</small></span>${hab ? `<span class="tag neu">✓ hab ich</span>` : `<span class="plus">＋</span>`}</a>`;
  }).join("")}</div>${seiten(ergebnis.total, st.page, st.per, "bf")}`;
}

/** Seitennavigation (auch für die Habitatkarten) */
export function seiten(total, page, per, ns){
  const n = Math.max(1, Math.ceil(total / per));
  const knoepfe = [];
  const add = p => knoepfe.push(`<button class="pg${p === page ? " an" : ""}" data-${ns}-page="${p}" ${p === page ? 'aria-current="page"' : ""}>${p}</button>`);
  const luecke = () => knoepfe.push(`<span class="pg-luecke">…</span>`);
  const sichtbar = new Set([1, n, page - 1, page, page + 1].filter(p => p >= 1 && p <= n));
  let vor = 0; for (const p of [...sichtbar].sort((a, b) => a - b)){ if (vor && p - vor > 1) luecke(); add(p); vor = p; }
  return `<nav class="pager" aria-label="Seiten">
    <button class="pg" data-${ns}-page="${page - 1}" ${page <= 1 ? "disabled" : ""} aria-label="vorige Seite">‹</button>${knoepfe.join("")}
    <button class="pg" data-${ns}-page="${page + 1}" ${page >= n ? "disabled" : ""} aria-label="nächste Seite">›</button>
    <label class="pro-seite">je Seite <select data-${ns}-per>${[10, 20, 30, 50].map(v => `<option${v === per ? " selected" : ""}>${v}</option>`).join("")}</select></label>
    <span class="muted klein">${fmt(total)} Arten</span></nav>`;
}

/** Arten für die aktuelle Auswahl laden */
export async function bestimmenLaden(){
  if (!M || !st.grob) return;
  const box = () => document.getElementById("bf-arten");
  const liste = st.unter ? passend().filter(g => g.sci === st.unter) : passend();
  if (!liste.length) return;
  const key = JSON.stringify([st, ctx.heimat()?.ort]);
  if (ergebnis?.key === key){ const b = box(); if (b) b.innerHTML = artenHTML(); return; }
  laeuft?.abort(); const ab = laeuft = new AbortController();
  ergebnis = null; if (box()) box().innerHTML = artenHTML();
  try{
    const grob = GROB.find(x => x.id === st.grob), h = ctx.heimat();
    const p = { per_page:st.per, page:st.page, quality_grade:"research", ...INAT_DE,
      ...(h ? { lat:h.lat.toFixed(3), lng:h.lng.toFixed(3), radius:50 } : { place_id:"7207" }) };
    if (st.monat) p.month = new Date().getMonth() + 1;
    if (st.bluete){ p.term_id = 12; p.term_value_id = 13; }
    if (liste.length <= 25){
      if (box()) box().innerHTML = `<p class="muted">Suche ${liste.length} Gruppe${liste.length > 1 ? "n" : ""} bei iNaturalist …</p>`;
      const ids = await taxonIdsOf(liste.map(g => g.sci), { signal:ab.signal });
      if (!ids.length) throw new Error("Gruppen bei iNaturalist nicht gefunden.");
      p.taxon_id = ids.join(",");
    } else p.iconic_taxa = grob.taxa;
    const d = await inat("/observations/species_counts", p, { signal:ab.signal });
    if (ab.signal.aborted) return;
    ergebnis = { key, total:d.total_results || 0, results:d.results || [] };
  }catch(err){ if (isAbort(err)) return; ergebnis = { key, fehler:"Konnte nicht geladen werden: " + err.message }; }
  const b = box(); if (b) b.innerHTML = artenHTML();
}

/** Klicks im Bereich. Gibt true zurück, wenn der Klick hierher gehörte. */
export function bestimmenKlick(t){
  const d = t.dataset;
  if (d.bfGrob !== undefined){ st.grob = st.grob === d.bfGrob ? null : d.bfGrob; st.wahl = {}; st.unter = null; st.page = 1; }
  else if (d.bfM){ st.wahl[d.bfM] === d.bfV ? delete st.wahl[d.bfM] : (st.wahl[d.bfM] = d.bfV); st.unter = null; st.page = 1; }
  else if (d.bfMonat){ st.monat = !st.monat; st.page = 1; }
  else if (d.bfBluete){ st.bluete = !st.bluete; st.page = 1; }
  else if (d.bfReset){ st.wahl = {}; st.monat = false; st.bluete = false; st.unter = null; st.page = 1; }
  else if (d.bfUnter !== undefined){ st.unter = d.bfUnter || null; st.page = 1; }
  else if (d.bfPage){ st.page = Math.max(1, +d.bfPage); bestimmenLaden(); document.getElementById("bf-arten")?.scrollIntoView({ block:"start", behavior:"smooth" }); return true; }
  else return false;
  ctx.neu();
  return true;
}
export function bestimmenProSeite(v){ st.per = +v; st.page = 1; bestimmenLaden(); }
export const BF_SELECTOR = "[data-bf-grob],[data-bf-m],[data-bf-monat],[data-bf-bluete],[data-bf-reset],[data-bf-unter],[data-bf-page]";
