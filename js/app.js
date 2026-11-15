// Pure Nature – Kompendium: die ganze Oberfläche. Seiten über die Adresse (#start, #kompendium, #eintragen, #karten, #trophaeen …).
import { $, $$, esc, fmt, debounce, datumDE, zeitDE, jetztLokal, photoSize, freePhoto, commonName } from "./util.js";
import { spiel, speichern, fundHinzu, fundeHinzu, fundLoeschen, einstellen, neueId, exportieren, einlesen, allesLoeschen, beiAenderung } from "./speicher.js";
import { spielstand, fortschritt, beschreibe, seltenheit, gruppenVon, LEVEL_MAX, JAHRESZEIT_DE } from "./regeln.js";
import { sucheArten, holeTaxon, holeTaxa, beobachtungenVon, beobachterUmkreis, artenUmkreis, sucheOrt, ortsname, kurzOrt } from "./inat.js";
import { taxonIdsOf, isAbort } from "./api.js";
import { GRUPPEN, GRUPPE, STUFEN_NAME } from "./katalog/gruppen.js";
import { ABZEICHEN, ABZ } from "./katalog/abzeichen.js";
import { TITEL, TIT } from "./katalog/titel.js";
import { AVATARE, AVA, SZENEN } from "./katalog/avatare.js";
import { RAHMEN, RAH, SELTENHEIT } from "./katalog/rahmen.js";
import { HABITATE, HAB } from "./katalog/habitate.js";

const main = $("#main");
let C = null;                    // aktueller Spielstand (berechnet)
const neu = () => (C = spielstand(spiel().funde, spiel().einst));
neu();
beiAenderung(neu);

const pro = () => !!spiel().einst.pro;

// ---------- Bausteine ----------
const avatarHTML = (size = 56, avaId, raId) => {
  const e = spiel().einst;
  const a = AVA[avaId ?? (pro() && C.avatare.has(e.avatar) ? e.avatar : "start-spross")] || AVA["start-spross"];
  const r = raId ?? (pro() && C.rahmen.has(e.rahmen) ? e.rahmen : "holz");
  return `<span class="ava ra-${esc(r)}" style="--s:${size}px"><span class="ava-in sz-${a.szene}" aria-hidden="true">${a.zeichen}</span></span>`;
};
const titelName = () => { const t = spiel().einst.titel; return pro() && t && C.titel.has(t) ? TIT[t].name : null; };
const balken = (ist, soll, cls = "") => `<span class="bar ${cls}"><i style="width:${Math.min(100, soll ? ist / soll * 100 : 0).toFixed(1)}%"></i></span>`;
const seltenTag = obs => { const s = seltenheit(obs); return `<span class="tag sel-${s.id}">${s.name}</span>`; };
const fotoHTML = (f, cls = "") => f?.foto
  ? `<img class="${cls}" src="${esc(f.foto.url)}" alt="" loading="lazy" title="Foto: ${esc(f.foto.by)} (${esc(f.foto.lic)}) via iNaturalist">`
  : `<span class="${cls} nofoto" aria-hidden="true">${GRUPPE[gruppenVon(f)[0]]?.zeichen || "🌱"}</span>`;
const medaille = (a, offen) => `<span class="med st-${a.stufe}${offen ? " offen" : ""}" aria-hidden="true">${a.zeichen}</span>`;
const leer = (t, extra = "") => `<div class="leer"><p>${t}</p>${extra}</div>`;
const proSchloss = (was) => `<div class="pro-teaser">
  <div><b>${was} gibt es in der Pro-Version.</b><p>Deine Fortschritte werden schon jetzt mitgezählt. Alles, was du verdient hast, ist sofort da, wenn du Pro einschaltest.</p></div>
  <button class="btn gold" data-act="pro-an">Pro-Vorschau einschalten</button></div>`;

function toast(html, ms = 3500){
  const t = Object.assign(document.createElement("div"), { className:"toast", innerHTML:html });
  document.body.append(t); setTimeout(() => t.classList.add("weg"), ms); setTimeout(() => t.remove(), ms + 400);
}
function dialog(html){
  const d = Object.assign(document.createElement("dialog"), { className:"dlg", innerHTML:`<div class="dlg-in">${html}</div>` });
  document.body.append(d); d.showModal();
  d.addEventListener("close", () => d.remove());
  d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  return d;
}

// ---------- Kopf und Navigation ----------
function kopf(){
  const e = spiel().einst;
  $("#kopf-ava").innerHTML = avatarHTML(34);
  $("#kopf-lv").textContent = `Lv ${C.level}`;
  $("#kopf-pro").hidden = !e.pro;
  const route = (location.hash.slice(1) || "start").split("/")[0];
  for (const a of $$(".nav a")) a.classList.toggle("an", a.dataset.r === route || (a.dataset.r === "kompendium" && route === "art") || (a.dataset.r === "karten" && route === "karte"));
}

// ---------- Start ----------
function seiteStart(){
  const s = spiel(), e = s.einst, S = C.S;
  const naechste = HABITATE.find(h => !C.karten.has(h.id));
  const fast = ABZEICHEN.map(a => ({ a, p:fortschritt(a.wann, C) })).filter(x => x.p.soll > 1 && x.p.ist > 0 && x.p.ist < x.p.soll)
    .sort((x, y) => y.p.ist / y.p.soll - x.p.ist / x.p.soll).slice(0, 4);
  const letzte = [...s.funde].sort((a, b) => b.zeit.localeCompare(a.zeit)).slice(0, 5);
  const t = titelName();
  return `
  <section class="karte profil">
    <a href="#profil" class="profil-kopf">${avatarHTML(76)}
      <div><h1>${esc(e.name || "Naturfreund")}</h1>${t ? `<p class="titel">${esc(t)}</p>` : pro() ? `<p class="muted">Wähle einen Titel unter Trophäen</p>` : ""}
      <p class="lv">Level ${C.level}${C.level >= LEVEL_MAX ? " (Höchststufe)" : ""} · ${fmt(C.xp)} XP</p></div></a>
    ${balken(C.xp - C.levelVon, C.levelBis - C.levelVon, "xp")}
    <p class="klein muted">${C.level >= LEVEL_MAX ? "Mehr geht nicht." : `Noch ${fmt(C.levelBis - C.xp)} XP bis Level ${C.level + 1}`}</p>
    <div class="zahlen">
      <a href="#kompendium"><b>${fmt(S.arten.size)}</b><span>Arten</span></a>
      <a href="#kompendium"><b>${fmt(S.funde)}</b><span>Funde</span></a>
      <a href="#karten"><b>${C.karten.size}<small>/${HABITATE.length}</small></b><span>Habitatkarten</span></a>
      <a href="#trophaeen"><b>${pro() ? fmt(C.abz.size) : "🔒"}${pro() ? `<small>/${ABZEICHEN.length}</small>` : ""}</b><span>Abzeichen</span></a>
    </div>
  </section>
  <a class="btn gross" href="#eintragen">＋ Fund eintragen</a>
  ${!s.funde.length ? `<section class="karte"><h2>Willkommen!</h2>
    <p>Trag ein, was du draußen entdeckst: Vögel, Blumen, Pilze, Käfer, Bäume … Jede Art kommt in dein persönliches Kompendium und bringt Erfahrungspunkte (XP). Mit XP schaltest du Habitatkarten frei, die zeigen, wo in deiner Umgebung welche Lebewesen zu finden sind.</p>
    <p>Du nutzt schon iNaturalist? <a href="#profil">Übernimm deine Beobachtungen</a> mit einem Klick.</p></section>` : ""}
  ${naechste ? `<section class="karte"><h2>Nächste Habitatkarte</h2>
    <a class="zeile" href="#karten"><span class="hab-z">${naechste.zeichen}</span><span><b>${esc(naechste.name)}</b><small>noch ${fmt(naechste.xp - C.xp)} XP</small>${balken(C.xp, naechste.xp)}</span></a></section>` : ""}
  ${pro() ? (fast.length ? `<section class="karte"><h2>Fast geschafft</h2>${fast.map(({ a, p }) => `
    <a class="zeile" href="#trophaeen/abzeichen">${medaille(a, true)}<span><b>${esc(a.name)}</b><small>${esc(a.text)} · ${fmt(p.ist)}/${fmt(p.soll)}</small>${balken(p.ist, p.soll)}</span></a>`).join("")}</section>` : "")
    : (C.abz.size ? `<section class="karte pro-mini"><p>🏅 Du hast schon <b>${fmt(C.abz.size)} Abzeichen</b>, <b>${C.titel.size} Titel</b>, <b>${C.avatare.size} Avatare</b> und <b>${C.rahmen.size} Umrandungen</b> verdient.</p><button class="btn gold klein" data-act="pro-an">Mit Pro ansehen</button></section>` : "")}
  ${letzte.length ? `<section class="karte"><h2>Zuletzt gefunden</h2>${letzte.map(f => `
    <a class="zeile" href="#art/${f.art?.tid || f.tid}">${fotoHTML(f, "mini")}<span><b>${esc(f.art?.name || f.name)}</b><small>${zeitDE(f.zeit)}${f.ort ? " · " + esc(f.ort) : ""}</small></span><span class="plus">+${C.je.get(f.id)?.sum || 0}</span></a>`).join("")}</section>` : ""}`;
}

// ---------- Kompendium ----------
const kf = { q:"", bereich:"alle", gruppe:"", sort:"neu" };
function seiteKompendium(){
  const S = C.S, s = spiel();
  const arten = [...S.arten.values()].map(f => {
    const alle = s.funde.filter(x => x.art?.tid === f.art.tid);
    const letzte = alle.reduce((m, x) => x.zeit > m ? x.zeit : m, "");
    return { f, n:alle.length, letzte, gs:gruppenVon(f) };
  });
  const bereichOk = x => kf.bereich === "alle" || x.gs.some(g => GRUPPE[g].bereich === kf.bereich);
  const q = kf.q.toLowerCase();
  let liste = arten.filter(x => bereichOk(x) && (!kf.gruppe || x.gs.includes(kf.gruppe)) && (!q || (x.f.art.name + " " + x.f.art.sci).toLowerCase().includes(q)));
  const sorts = { neu:(a, b) => b.letzte.localeCompare(a.letzte), az:(a, b) => a.f.art.name.localeCompare(b.f.art.name, "de"),
    selten:(a, b) => (a.f.obs ?? 0) - (b.f.obs ?? 0), oft:(a, b) => b.n - a.n };
  liste.sort(sorts[kf.sort]);
  const ohneArt = s.funde.filter(f => !f.art);
  const gruppenMit = GRUPPEN.filter(g => S.gruppen[g.id].size && (kf.bereich === "alle" || g.bereich === kf.bereich));
  return `
  <div class="kopfzeile"><h1>Mein Kompendium</h1><p class="muted">${fmt(S.arten.size)} Arten · ${fmt(S.funde)} Funde</p></div>
  <div class="filter">
    <input type="search" id="kq" placeholder="Im Kompendium suchen …" value="${esc(kf.q)}" aria-label="Im Kompendium suchen">
    <div class="chips">${[["alle","Alle"],["tiere","Tiere"],["pflanzen","Pflanzen"],["pilze","Pilze & Flechten"]].map(([id, l]) =>
      `<button class="chip${kf.bereich === id ? " an" : ""}" data-kb="${id}">${l}</button>`).join("")}</div>
    <div class="reihe">
      <select id="kg" aria-label="Gruppe"><option value="">Alle Gruppen</option>${gruppenMit.map(g => `<option value="${g.id}"${kf.gruppe === g.id ? " selected" : ""}>${g.zeichen} ${esc(g.label)} (${S.gruppen[g.id].size})</option>`).join("")}</select>
      <select id="ks" aria-label="Sortierung">${[["neu","Zuletzt gefunden"],["az","A–Z"],["selten","Seltenste zuerst"],["oft","Am häufigsten gefunden"]].map(([v, l]) => `<option value="${v}"${kf.sort === v ? " selected" : ""}>${l}</option>`).join("")}</select>
    </div>
  </div>
  ${!S.funde ? leer("Noch leer. Trag deinen ersten Fund ein!", `<a class="btn" href="#eintragen">＋ Fund eintragen</a>`) :
    !liste.length ? leer("Keine Art passt zu diesem Filter.") : `<div class="raster">${liste.map(({ f, n }) => `
    <a class="kachel" href="#art/${f.art.tid}">${fotoHTML(f, "bild")}<span class="txt"><b>${esc(f.art.name)}</b><i>${esc(f.art.sci)}</i>
      <span class="tags">${seltenTag(f.obs)}${f.gef ? `<span class="tag gef">gefährdet</span>` : ""}${n > 1 ? `<span class="tag">${n}×</span>` : ""}</span></span></a>`).join("")}</div>`}
  ${ohneArt.length ? `<details class="karte"><summary>Nicht bis zur Art bestimmt (${ohneArt.length})</summary>${ohneArt.map(f => `
    <div class="zeile">${fotoHTML(f, "mini")}<span><b>${esc(f.name)}</b><small>${esc(f.sci)} · ${zeitDE(f.zeit)}</small></span>
    <button class="icon" data-del="${f.id}" aria-label="Fund löschen">🗑️</button></div>`).join("")}
    <p class="klein muted">Zählen als Funde, aber nicht als Art. Abzeichen gibt es für Arten.</p></details>` : ""}`;
}

function seiteArt(tid){
  const s = spiel(); tid = +tid;
  const funde = s.funde.filter(f => (f.art?.tid || f.tid) === tid).sort((a, b) => b.zeit.localeCompare(a.zeit));
  if (!funde.length) return leer("Diese Art ist (nicht mehr) im Kompendium.", `<a class="btn" href="#kompendium">Zum Kompendium</a>`);
  const f = funde[funde.length - 1], name = f.art?.name || f.name, sci = f.art?.sci || f.sci;
  const gs = gruppenVon(f).map(g => GRUPPE[g]);
  return `
  <a class="zurueck" href="#kompendium">← Kompendium</a>
  <section class="karte art">
    ${f.foto ? `<figure><img src="${esc(photoSize(f.foto.url, "medium"))}" alt="${esc(name)}"><figcaption>Foto: ${esc(f.foto.by)} · ${esc(f.foto.lic)} · via iNaturalist</figcaption></figure>` : ""}
    <h1>${esc(name)}</h1><p class="sci">${esc(sci)}</p>
    <p class="tags">${seltenTag(f.obs)}${f.gef ? `<span class="tag gef">gefährdet</span>` : ""}${f.eing ? `<span class="tag">eingeführt</span>` : ""}
      ${f.obs != null ? `<span class="tag">${fmt(f.obs)} Beobachtungen weltweit</span>` : ""}</p>
    <p class="chips">${gs.map(g => `<span class="chip">${g.zeichen} ${esc(g.label)}</span>`).join("")}</p>
    <div class="reihe"><a class="btn" href="#eintragen/${f.tid}">＋ Wieder gefunden</a>
      <a class="btn leise" href="https://www.inaturalist.org/taxa/${tid}" target="_blank" rel="noopener">Bei iNaturalist ansehen ↗</a></div>
  </section>
  <section class="karte"><h2>${funde.length === 1 ? "Ein Fund" : funde.length + " Funde"}</h2>${funde.map(x => `
    <div class="fund"><div><b>${zeitDE(x.zeit)}</b>${x.ort ? ` · ${esc(x.ort)}` : ""}${x.quelle === "inat" ? ` · <a href="https://www.inaturalist.org/observations/${x.inat}" target="_blank" rel="noopener">iNaturalist ↗</a>` : ""}
      ${x.notiz ? `<p>${esc(x.notiz)}</p>` : ""}<small class="muted">${(C.je.get(x.id)?.teile || []).map(([t, n]) => `${esc(t)} +${n}`).join(" · ")}</small></div>
      <button class="icon" data-del="${x.id}" aria-label="Fund löschen">🗑️</button></div>`).join("")}</section>`;
}

// ---------- Eintragen ----------
let wahl = null, ortWahl = null;
function seiteEintragen(tid){
  if (tid && (!wahl || wahl.tid !== +tid)){
    wahl = { tid:+tid, laedt:true }; ortWahl = null;
    holeTaxon(+tid).then(t => { wahl = t; render(); }).catch(e => { wahl = null; toast("Art konnte nicht geladen werden: " + esc(e.message)); render(); });
  }
  if (!tid) { wahl = null; }
  const e = spiel().einst;
  if (!wahl) return `
  <div class="kopfzeile"><h1>Fund eintragen</h1><p class="muted">Was hast du entdeckt? Deutscher oder wissenschaftlicher Name.</p></div>
  <form class="suche" id="artsuche" autocomplete="off" onsubmit="return false">
    <input id="aq" type="search" placeholder="z. B. Rotkehlchen, Fliegenpilz, Stieleiche …" aria-label="Lebewesen suchen" autofocus>
    <ul id="avorschlag" class="vorschlag" hidden></ul>
  </form>
  <p class="klein muted">Die Vorschläge kommen von iNaturalist. Wenn du die Art nicht kennst, nimm die Gruppe (z. B. „Täublinge“) – das zählt als Fund.</p>`;
  if (wahl.laedt) return `<p class="muted">Lade Art …</p>`;
  const schon = C.S.arten.has(wahl.art?.tid);
  return `
  <a class="zurueck" href="#eintragen">← andere Art</a>
  <section class="karte gewaehlt">${fotoHTML(wahl, "bild")}<div><h1>${esc(wahl.name)}</h1><p class="sci">${esc(wahl.sci)}</p>
    <p class="tags">${wahl.art ? seltenTag(wahl.obs) : `<span class="tag">nicht bis zur Art</span>`}${schon ? `<span class="tag">schon im Kompendium</span>` : wahl.art ? `<span class="tag neu">neue Art!</span>` : ""}${wahl.gef ? `<span class="tag gef">gefährdet</span>` : ""}</p></div></section>
  <form id="fundform" class="karte form">
    <label>Wann?<input type="datetime-local" name="zeit" value="${jetztLokal()}" max="${jetztLokal()}" required></label>
    <fieldset><legend>Wo?</legend>
      <div class="reihe"><button type="button" class="btn leise" data-act="standort">📍 Mein Standort</button>
      ${e.heimat ? `<button type="button" class="btn leise" data-act="heimat">🏡 ${esc(e.heimat.ort)}</button>` : ""}</div>
      <div class="suche-zeile"><input name="ortq" placeholder="Ort suchen …" aria-label="Ort suchen"><button type="button" class="btn leise" data-act="ortsuche">Suchen</button></div>
      <ul id="ortliste" class="ortliste"></ul>
      <p id="ortwahl" class="ortwahl">${ortWahl ? "✓ " + esc(ortWahl.ort) : "Noch kein Ort gewählt (geht auch ohne)."}</p>
    </fieldset>
    <label>Notiz (freiwillig)<textarea name="notiz" rows="3" placeholder="Was war besonders? Verhalten, Wetter, Lebensraum …"></textarea></label>
    <button class="btn gross" type="submit">Ins Kompendium eintragen</button>
  </form>`;
}

function belohnung(vor, nach, f){
  const xp = nach.xp - vor.xp, d = (a, b) => [...b].filter(x => !a.has(x));
  const nk = d(vor.karten, nach.karten), na = d(vor.abz, nach.abz), nt = d(vor.titel, nach.titel), nv = d(vor.avatare, nach.avatare), nr = d(vor.rahmen, nach.rahmen);
  const teile = nach.je.get(f.id)?.teile || [];
  const proZahl = na.length + nt.length + nv.length + nr.length;
  dialog(`
    <h2>${f.art && !vor.S.arten.has(f.art.tid) ? "Neue Art im Kompendium!" : "Fund gespeichert"}</h2>
    <p class="gross-xp">+${fmt(xp)} XP</p>
    <p class="klein muted">${teile.map(([t, n]) => `${esc(t)} +${n}`).join(" · ")}</p>
    ${nach.level > vor.level ? `<p class="lvup">⭐ Level ${nach.level}!</p>` : ""}
    ${nk.map(id => `<a class="zeile" href="#karte/${id}" data-close><span class="hab-z">${HAB[id].zeichen}</span><span><b>Habitatkarte freigeschaltet</b><small>${esc(HAB[id].name)}</small></span></a>`).join("")}
    ${pro() ? `
      ${na.map(id => `<div class="zeile">${medaille(ABZ[id])}<span><b>${esc(ABZ[id].name)}</b><small>${esc(ABZ[id].text)}</small></span></div>`).join("")}
      ${nt.map(id => `<div class="zeile"><span class="hab-z">🎗️</span><span><b>Neuer Titel</b><small>${esc(TIT[id].name)}</small></span></div>`).join("")}
      ${nv.map(id => `<div class="zeile">${avatarHTML(40, id, "kein")}<span><b>Neuer Avatar</b><small>${esc(AVA[id].name)}</small></span></div>`).join("")}
      ${nr.map(id => `<div class="zeile">${avatarHTML(40, null, id)}<span><b>Neue Umrandung</b><small>${esc(RAH[id].name)}</small></span></div>`).join("")}`
    : proZahl ? `<p class="pro-mini">🔒 ${proZahl} neue Pro-Belohnung${proZahl > 1 ? "en" : ""} (Abzeichen, Titel, Avatare, Umrandungen) warten auf dich.</p>` : ""}
    <div class="reihe"><a class="btn" href="#eintragen" data-close>Noch einen Fund</a><a class="btn leise" href="#art/${f.art?.tid || f.tid}" data-close>Ansehen</a></div>`);
}

// ---------- Habitatkarten ----------
function seiteKarten(){
  return `
  <div class="kopfzeile"><h1>Habitatkarten</h1><p class="muted">Mit Erfahrungspunkten schaltest du Karten frei. Sie zeigen, wo in deiner Umgebung bestimmte Lebewesen gefunden werden – und welche Arten dort am häufigsten sind.</p>
  <p><b>${C.karten.size} von ${HABITATE.length}</b> freigeschaltet · ${fmt(C.xp)} XP</p></div>
  <div class="raster karten">${HABITATE.map(h => {
    const offen = C.karten.has(h.id);
    return `<a class="habkarte${offen ? "" : " zu"}" href="#karte/${h.id}"><span class="hab-z">${offen ? h.zeichen : "🔒"}</span><b>${esc(h.name)}</b>
      ${offen ? `<small>Ansehen</small>` : `<small>ab ${fmt(h.xp)} XP</small>${balken(C.xp, h.xp)}`}</a>`;
  }).join("")}</div>`;
}

let kartenKm = 30, karteObj = null;
function seiteKarte(id){
  const h = HAB[id]; if (!h) return leer("Diese Karte gibt es nicht.");
  const e = spiel().einst;
  if (!C.karten.has(id)) return `<a class="zurueck" href="#karten">← Habitatkarten</a>
    <section class="karte"><h1>${h.zeichen} ${esc(h.name)}</h1><p>Diese Karte wird bei <b>${fmt(h.xp)} XP</b> freigeschaltet. Dir fehlen noch ${fmt(h.xp - C.xp)} XP.</p>${balken(C.xp, h.xp)}
    <p class="muted">Tipp: Neue Arten bringen am meisten XP – besonders seltene und solche aus neuen Familien.</p></section>`;
  return `<a class="zurueck" href="#karten">← Habitatkarten</a>
  <section class="karte"><h1>${h.zeichen} ${esc(h.name)}</h1><p>${esc(h.wo)}</p>
    ${e.heimat ? `<div class="reihe"><span class="muted">Um ${esc(e.heimat.ort)}</span>
      <select id="kkm" aria-label="Umkreis">${[10, 30, 50, 100].map(k => `<option value="${k}"${k === kartenKm ? " selected" : ""}>${k} km</option>`).join("")}</select></div>
      <div id="map" class="map"></div><p class="klein muted">Orange Kästchen: hier wurde die Gruppe bei iNaturalist beobachtet. Zum Bewegen am Handy zwei Finger nehmen.</p>`
    : heimatForm("Für die Karte brauchen wir deinen Heimatort.")}
  </section>
  ${e.heimat ? `<section class="karte"><h2>Häufig in deiner Umgebung</h2><div id="hablist" class="muted">Lade …</div></section>` : ""}`;
}
async function karteLaden(id){
  const h = HAB[id], e = spiel().einst; if (!h || !e.heimat || !$("#map")) return;
  try{
    const ids = h.taxa.length ? await taxonIdsOf(h.taxa) : [];
    const { zeigeKarte } = await import("./karte.js");
    karteObj?.remove?.(); karteObj = await zeigeKarte($("#map"), { lat:e.heimat.lat, lng:e.heimat.lng, km:kartenKm, taxonIds:ids, extra:h.extra });
    const d = await artenUmkreis(ids, e.heimat.lat, e.heimat.lng, kartenKm, h.extra);
    const box = $("#hablist"); if (!box) return;
    box.classList.remove("muted");
    box.innerHTML = d.results.length ? `<p class="klein muted">${fmt(d.total)} Arten mit bestätigten Funden im Umkreis von ${kartenKm} km. Die häufigsten:</p>` + d.results.map(r => {
      const t = r.taxon, ph = freePhoto(t), hab = C.S.arten.has(t.id);
      return `<a class="zeile" href="#eintragen/${t.id}">${ph ? `<img class="mini" src="${esc(photoSize(ph.square_url || ph.url, "square"))}" alt="" loading="lazy" title="Foto: ${esc(ph.attribution)}">` : `<span class="mini nofoto">${h.zeichen}</span>`}
        <span><b>${esc(commonName(t))}</b><small>${esc(t.name)} · ${fmt(r.count)} Funde</small></span>${hab ? `<span class="tag neu">✓ hab ich</span>` : `<span class="plus">＋</span>`}</a>`;
    }).join("") : `<p>Hier gibt es noch keine bestätigten Funde dieser Gruppe. Vielleicht bist du die erste Person?</p>`;
  }catch(err){ if (!isAbort(err)) { const b = $("#hablist"); if (b) b.textContent = "Konnte nicht geladen werden: " + err.message; } }
}

function heimatForm(text){
  return `<div class="heimat"><p>${esc(text)}</p>
    <div class="reihe"><button type="button" class="btn leise" data-act="heimat-standort">📍 Mein Standort</button></div>
    <div class="suche-zeile"><input id="hq" placeholder="Heimatort suchen …" aria-label="Heimatort suchen"><button type="button" class="btn leise" data-act="heimat-suche">Suchen</button></div>
    <ul id="hliste" class="ortliste"></ul></div>`;
}

// ---------- Trophäen (Pro) ----------
let tf = "alle";
function seiteTrophaeen(tab = "abzeichen"){
  const tabs = [["abzeichen","Abzeichen", `${C.abz.size}/${ABZEICHEN.length}`],["titel","Titel", `${C.titel.size}/${TITEL.length}`],
    ["avatare","Avatare", `${C.avatare.size}/${AVATARE.length}`],["rahmen","Umrandungen", `${C.rahmen.size}/${RAHMEN.length}`],["bestenliste","Bestenliste",""]];
  const inhalt = { abzeichen:tAbzeichen, titel:tTitel, avatare:tAvatare, rahmen:tRahmen, bestenliste:tBestenliste }[tab] || tAbzeichen;
  return `
  <div class="kopfzeile"><h1>Trophäen <span class="pro-pill">PRO</span></h1>
  ${pro() ? `<p class="muted">Sammlerwert: <b>${fmt(C.sammlerwert)}</b> Punkte aus Abzeichen</p>` : ""}</div>
  ${pro() ? "" : proSchloss("Abzeichen, Titel, Avatare, Umrandungen und die Bestenliste")}
  <nav class="tabs" aria-label="Trophäen">${tabs.map(([id, l, z]) => `<a href="#trophaeen/${id}" class="${tab === id ? "an" : ""}">${l}${z ? `<small>${z}</small>` : ""}</a>`).join("")}</nav>
  ${inhalt()}`;
}
const filterLeiste = () => `<div class="chips">${[["alle","Alle"],["verdient","Verdient"],["offen","Noch offen"]].map(([id, l]) => `<button class="chip${tf === id ? " an" : ""}" data-tf="${id}">${l}</button>`).join("")}</div>`;
function tAbzeichen(){
  const fams = new Map();
  for (const a of ABZEICHEN){
    const hat = C.abz.has(a.id);
    if ((tf === "verdient" && !hat) || (tf === "offen" && hat)) continue;
    (fams.get(a.fam) || fams.set(a.fam, []).get(a.fam)).push(a);
  }
  return filterLeiste() + [...fams].map(([fam, list]) => {
    const hat = list.filter(a => C.abz.has(a.id)).length;
    return `<details class="karte fam"${tf !== "alle" || (hat && hat < list.length) ? " open" : ""}><summary><b>${esc(fam)}</b><span class="muted">${hat}/${list.length}</span></summary>
      <div class="abz-liste">${list.map(a => {
        const p = fortschritt(a.wann, C), ok = C.abz.has(a.id);
        return `<div class="abz${ok ? " ok" : ""}${ok && !pro() ? " gesperrt" : ""}">${medaille(a, !ok)}<div><b>${esc(a.name)}</b>
          <small>${a.stufe ? STUFEN_NAME[a.stufe - 1] + " · " : "Sonder · "}${esc(a.text)}</small>
          ${ok ? (pro() ? `<small class="gold">✓ verdient · +${a.xp} Sammlerwert</small>` : `<small>🔒 verdient – mit Pro freischalten</small>`) : p.soll > 1 ? `${balken(p.ist, p.soll)}<small>${fmt(Math.min(p.ist, p.soll))} / ${fmt(p.soll)}</small>` : ""}</div></div>`;
      }).join("")}</div></details>`;
  }).join("");
}
function tTitel(){
  const e = spiel().einst, arten = ["Level", "Erfahrung", "Abzeichen"];
  return filterLeiste() + arten.map(art => {
    const list = TITEL.filter(t => t.art === art && (tf === "alle" || (tf === "verdient") === C.titel.has(t.id)));
    if (!list.length) return "";
    return `<details class="karte fam" open><summary><b>Titel aus ${art === "Level" ? "Level" : art === "Erfahrung" ? "Erfahrungspunkten" : "Abzeichen"}</b><span class="muted">${list.filter(t => C.titel.has(t.id)).length}/${list.length}</span></summary>
      <div class="titel-liste">${list.map(t => {
        const ok = C.titel.has(t.id), an = e.titel === t.id;
        return `<button class="titel-k${ok ? " ok" : ""}${an ? " an" : ""}" ${ok && pro() ? `data-titel="${t.id}"` : "disabled"}><b>${esc(t.name)}</b><small>${ok ? (an ? "✓ trägst du" : pro() ? "Antippen zum Tragen" : "🔒 Pro") : esc(t.text)}</small></button>`;
      }).join("")}</div></details>`;
  }).join("");
}
function tAvatare(){
  const e = spiel().einst;
  const list = AVATARE.filter(a => tf === "alle" || (tf === "verdient") === C.avatare.has(a.id));
  return filterLeiste() + `<div class="ava-raster">${list.map(a => {
    const ok = C.avatare.has(a.id), an = e.avatar === a.id;
    return `<button class="ava-k${ok ? " ok" : ""}${an ? " an" : ""}" ${ok && pro() ? `data-ava="${a.id}"` : "disabled"} title="${esc(a.name)}">
      ${avatarHTML(64, a.id, ok ? "kein" : "kein")}<b>${esc(a.name)}</b><small>${ok ? (an ? "✓ aktiv" : pro() ? "wählen" : "🔒 Pro") : esc(beschreibe(a.wann) || a.text)}</small></button>`;
  }).join("")}</div>`;
}
function tRahmen(){
  const e = spiel().einst;
  const list = RAHMEN.filter(r => tf === "alle" || (tf === "verdient") === C.rahmen.has(r.id));
  return filterLeiste() + `<div class="ava-raster">${list.map(r => {
    const ok = C.rahmen.has(r.id), an = e.rahmen === r.id;
    return `<button class="ava-k${ok ? " ok" : ""}${an ? " an" : ""}" ${ok && pro() ? `data-rahmen="${r.id}"` : "disabled"}>
      ${avatarHTML(64, null, r.id)}<b>${esc(r.name)}</b><small class="sr-${r.selten}">${SELTENHEIT[r.selten]}</small><small>${ok ? (an ? "✓ aktiv" : pro() ? "wählen" : "🔒 Pro") : esc(beschreibe(r.wann) || r.text)}</small></button>`;
  }).join("")}</div>`;
}

// Bestenliste: Forschende im Umkreis (iNaturalist, öffentlich) und Freunde (Codes, nur auf dem Gerät)
let bl = "freunde";
function meinEintrag(){
  const e = spiel().einst;
  return { n:e.name || "Ich", l:C.level, x:C.xp, a:C.S.arten.size, ab:C.abz.size, sw:C.sammlerwert,
    t:titelName() || "", av:pro() && C.avatare.has(e.avatar) ? e.avatar : "start-spross", r:pro() && C.rahmen.has(e.rahmen) ? e.rahmen : "holz", d:new Date().toISOString().slice(0, 10) };
}
const code = o => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const decode = c => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(c.replace(/-/g, "+").replace(/_/g, "/")), ch => ch.charCodeAt(0))));
function tBestenliste(){
  if (!pro()) return `<section class="karte"><p class="muted">Die Bestenliste ist Teil von Pro.</p></section>`;
  const e = spiel().einst;
  const seg = `<div class="chips">${[["freunde","Freunde"],["umgebung","Umgebung (iNaturalist)"]].map(([id, l]) => `<button class="chip${bl === id ? " an" : ""}" data-bl="${id}">${l}</button>`).join("")}</div>`;
  if (bl === "umgebung") return seg + (e.heimat ? `<section class="karte"><h2>Forschende um ${esc(e.heimat.ort)}</h2>
    <p class="klein muted">Wer im Umkreis von 30 km die meisten bestätigten Arten bei iNaturalist hat – und wo du mit deinem Kompendium stehen würdest.</p>
    <div id="umgebung" class="muted">Lade …</div></section>` : `<section class="karte">${heimatForm("Für die Bestenliste der Umgebung brauchen wir deinen Heimatort.")}</section>`);
  const ich = { ...meinEintrag(), ich:true };
  const alle = [ich, ...spiel().freunde].sort((a, b) => b.x - a.x);
  return seg + `<section class="karte"><h2>Freunde</h2>
    <p class="klein muted">Es gibt keinen Server: Ihr tauscht Codes aus. Schick deinen Code an Freunde, und füge ihre Codes hier ein. Neue Codes ersetzen alte.</p>
    <ol class="rang">${alle.map((f, i) => `<li class="${f.ich ? "ich" : ""}"><span class="platz">${i + 1}</span>${avatarHTML(44, AVA[f.av] ? f.av : "start-spross", RAH[f.r] ? f.r : "holz")}
      <span><b>${esc(f.n)}${f.ich ? " (du)" : ""}</b><small>${f.t ? esc(f.t) + " · " : ""}Level ${f.l} · ${fmt(f.a)} Arten · ${fmt(f.ab)} Abzeichen</small></span><span class="xp">${fmt(f.x)} XP</span>
      ${f.ich ? "" : `<button class="icon" data-freund-weg="${esc(f.n)}" aria-label="Entfernen">✕</button>`}</li>`).join("")}</ol>
    <div class="reihe"><button class="btn" data-act="code-teilen">Meinen Code teilen</button></div>
    <div class="suche-zeile"><input id="fcode" placeholder="Code oder Link von Freunden einfügen" aria-label="Code einfügen"><button class="btn leise" data-act="code-rein">Hinzufügen</button></div></section>`;
}
async function umgebungLaden(){
  const e = spiel().einst, box = $("#umgebung"); if (!box || !e.heimat) return;
  try{
    const list = await beobachterUmkreis(e.heimat.lat, e.heimat.lng, 30);
    const mine = C.S.arten.size;
    let platz = list.findIndex(r => r.species_count < mine); if (platz < 0) platz = list.length;
    const zeilen = list.map((r, i) => `<li><span class="platz">${i + 1}</span><span class="ava" style="--s:44px"><span class="ava-in sz-wald">${esc((r.user?.login || "?")[0].toUpperCase())}</span></span>
      <span><b><a href="https://www.inaturalist.org/people/${esc(r.user?.login)}" target="_blank" rel="noopener">${esc(r.user?.login)}</a></b><small>${fmt(r.observation_count)} Beobachtungen</small></span><span class="xp">${fmt(r.species_count)} Arten</span></li>`);
    zeilen.splice(platz, 0, `<li class="ich"><span class="platz">${platz + 1}</span>${avatarHTML(44)}<span><b>${esc(e.name || "Du")} (du)</b><small>dein Kompendium</small></span><span class="xp">${fmt(mine)} Arten</span></li>`);
    box.classList.remove("muted");
    box.innerHTML = `<ol class="rang">${zeilen.join("")}</ol><p class="klein muted">Daten: iNaturalist (öffentliche Beobachtungen mit Forschungsqualität).</p>`;
  }catch(err){ box.textContent = "Konnte nicht geladen werden: " + err.message; }
}

// ---------- Profil & Einstellungen ----------
function seiteProfil(){
  const e = spiel().einst;
  return `
  <div class="kopfzeile"><h1>Profil & Einstellungen</h1></div>
  <section class="karte"><div class="profil-kopf">${avatarHTML(76)}<div><label>Dein Name<input id="pname" value="${esc(e.name)}" maxlength="40" placeholder="Wie sollen dich Freunde sehen?"></label></div></div></section>
  <section class="karte"><h2>Version</h2>
    <label class="schalter"><input type="checkbox" id="ppro"${e.pro ? " checked" : ""}><span><b>Pro-Version</b> (Vorschau)<small>Abzeichen, Titel, Avatare, Umrandungen und Bestenliste. Standard: dein persönliches Kompendium mit XP, Level und Habitatkarten.</small></span></label>
  </section>
  <section class="karte"><h2>Heimatort</h2>${e.heimat ? `<p>🏡 <b>${esc(e.heimat.ort)}</b></p>` : ""}${heimatForm(e.heimat ? "Ändern:" : "Für Habitatkarten, Bestenliste und das Abzeichen „Heimatkunde“.")}</section>
  <section class="karte"><h2>Von iNaturalist übernehmen</h2>
    <p>Deine öffentlichen Beobachtungen bei iNaturalist kommen ins Kompendium (höchstens 2.000, schon übernommene werden übersprungen).</p>
    <div class="suche-zeile"><input id="ilogin" placeholder="Dein iNaturalist-Benutzername" aria-label="iNaturalist-Benutzername" autocapitalize="off"><button class="btn" data-act="import">Übernehmen</button></div>
    <p id="istatus" class="klein muted"></p></section>
  <section class="karte"><h2>Sicherung</h2>
    <p class="klein muted">Dein Spielstand liegt nur auf diesem Gerät. Sichere ihn ab und zu als Datei.</p>
    <div class="reihe"><button class="btn leise" data-act="export">Sicherung speichern</button>
    <label class="btn leise">Sicherung einlesen<input type="file" id="pimport" accept="application/json" hidden></label>
    <button class="btn leise rot" data-act="loeschen">Alles löschen</button></div></section>
  <section class="karte"><h2>So gibt es XP</h2><ul class="regeln">
    <li>Neue Art: 50 XP, dazu nach Seltenheit (weltweite Beobachtungen bei iNaturalist): Mittelhäufig +15, Weniger häufig +40, Selten +100, Sehr selten +250</li>
    <li>Gefährdete Art +50 · erste Art einer neuen Gattung +10, Familie +20, Ordnung +40, Klasse +80</li>
    <li>Bekannte Art wiedergesehen: +5 (einmal pro Tag und Art) · Notiz +3 · nur bis zur Gruppe bestimmt: +15</li>
    <li>${LEVEL_MAX} Level. Habitatkarten von 0 bis ${fmt(HABITATE[HABITATE.length - 1].xp)} XP.</li></ul>
    <p><a href="quellen.html">Quellen und Lizenzen</a></p></section>`;
}

async function importieren(){
  const login = $("#ilogin").value.trim(), st = $("#istatus"); if (!login) return;
  try{
    st.textContent = "Lade Beobachtungen …";
    const obs = await beobachtungenVon(login, (n, t) => st.textContent = `Lade Beobachtungen … ${fmt(n)} von ${fmt(t)}`);
    const da = new Set(spiel().funde.filter(f => f.inat).map(f => f.inat));
    const neuObs = obs.filter(o => o.taxon && !da.has(o.id));
    if (!neuObs.length){ st.textContent = obs.length ? "Alles schon übernommen." : "Keine öffentlichen Beobachtungen gefunden."; return; }
    const info = await holeTaxa(neuObs.map(o => o.taxon.id), (n, t) => st.textContent = `Lade Arten … ${fmt(n)} von ${fmt(t)}`);
    const vor = C;
    const funde = neuObs.filter(o => info.has(o.taxon.id)).map(o => {
      const [lat, lng] = (o.location || "").split(",").map(Number);
      const zeit = o.time_observed_at ? jetztLokal(new Date(o.time_observed_at)) : (o.observed_on ? o.observed_on + "T12:00" : jetztLokal(new Date(o.created_at)));
      return { id:neueId(), ...info.get(o.taxon.id), zeit, lat:isFinite(lat) ? lat : null, lng:isFinite(lng) ? lng : null,
        ort:(o.place_guess || "").split(",")[0], notiz:"", quelle:"inat", inat:o.id };
    });
    fundeHinzu(funde);
    st.textContent = `✓ ${fmt(funde.length)} Funde übernommen: +${fmt(C.xp - vor.xp)} XP, jetzt Level ${C.level}.`;
    toast(`✓ ${fmt(funde.length)} Funde von iNaturalist übernommen`);
  }catch(err){ st.textContent = "Fehler: " + err.message; }
}

// ---------- Seite zeichnen ----------
function render(){
  const [route, arg] = (location.hash.slice(1) || "start").split("/");
  if (route.startsWith("freund=")) return freundAusLink(route.slice(7));
  const seiten = { start:seiteStart, kompendium:seiteKompendium, art:seiteArt, eintragen:seiteEintragen, karten:seiteKarten,
    karte:seiteKarte, trophaeen:seiteTrophaeen, profil:seiteProfil };
  main.innerHTML = (seiten[route] || seiteStart)(arg);
  kopf();
  document.title = { kompendium:"Kompendium", karten:"Habitatkarten", trophaeen:"Trophäen", profil:"Profil", eintragen:"Fund eintragen" }[route] ? `${{ kompendium:"Kompendium", karten:"Habitatkarten", trophaeen:"Trophäen", profil:"Profil", eintragen:"Fund eintragen" }[route]} · Pure Nature` : "Pure Nature – Kompendium";
  if (route === "eintragen" && !wahl) artsucheAn();
  if (route === "karte") karteLaden(arg);
  if (route === "trophaeen" && arg === "bestenliste" && bl === "umgebung") umgebungLaden();
}

function artsucheAn(){
  const input = $("#aq"), box = $("#avorschlag"); let ab, liste = [];
  input?.addEventListener("input", debounce(async () => {
    const q = input.value.trim(); if (q.length < 2){ box.hidden = true; return; }
    ab?.abort(); ab = new AbortController();
    try{
      liste = (await sucheArten(q, ab.signal)).slice(0, 8);
      if (input.value.trim() !== q) return;
      box.innerHTML = liste.length ? liste.map(t => { const ph = freePhoto(t); const hab = C.S.arten.has(t.id);
        return `<li><a href="#eintragen/${t.id}">${ph ? `<img src="${esc(photoSize(ph.square_url || ph.url, "square"))}" alt="" loading="lazy">` : `<span class="nofoto">🌱</span>`}
          <span><b>${esc(commonName(t))}</b><i>${esc(t.name)}</i></span>${hab ? `<small class="tag neu">✓</small>` : ""}</a></li>`; }).join("") : `<li class="muted">Nichts gefunden.</li>`;
      box.hidden = false;
    }catch(err){ if (!isAbort(err)){ box.innerHTML = `<li class="muted">Die Suche ist gerade nicht erreichbar.</li>`; box.hidden = false; } }
  }, 300));
}

function freundAusLink(c){
  history.replaceState(null, "", "#trophaeen/bestenliste");
  freundHinzu(c); render();
}
function freundHinzu(c){
  try{
    c = c.trim().replace(/^.*#freund=/, "");
    const f = decode(c);
    if (typeof f.n !== "string" || typeof f.x !== "number") throw 0;
    const s = spiel(); s.freunde = s.freunde.filter(x => x.n !== f.n); s.freunde.push(f); speichern();
    toast(`✓ ${esc(f.n)} ist jetzt in deiner Bestenliste`);
  }catch{ toast("Dieser Code passt nicht."); }
}

// ---------- Ereignisse ----------
async function standort(){
  if (!navigator.geolocation) throw new Error("Dieses Gerät kann den Standort nicht bestimmen.");
  const p = await new Promise((ok, fail) => navigator.geolocation.getCurrentPosition(ok, () => fail(new Error("Standort nicht freigegeben.")), { enableHighAccuracy:true, timeout:15000 }));
  const lat = p.coords.latitude, lng = p.coords.longitude;
  return { lat, lng, ort:(await ortsname(lat, lng)) || `${lat.toFixed(3)}, ${lng.toFixed(3)}` };
}
async function ortSuchen(q, liste, waehle){
  if (!q) return; liste.innerHTML = `<li class="muted">Suche …</li>`;
  try{
    const r = await sucheOrt(q);
    liste.innerHTML = r.length ? r.map((x, i) => `<li><button type="button" data-i="${i}">${esc(kurzOrt(x))}<small>${esc(x.display_name)}</small></button></li>`).join("") : `<li class="muted">Nichts gefunden.</li>`;
    liste.onclick = e => { const b = e.target.closest("button[data-i]"); if (!b) return; const x = r[+b.dataset.i]; waehle({ lat:+x.lat, lng:+x.lon, ort:kurzOrt(x) }); };
  }catch(err){ liste.innerHTML = `<li class="muted">${esc(err.message)}</li>`; }
}
const setzeHeimat = h => { einstellen({ heimat:h }); toast(`🏡 Heimatort: ${esc(h.ort)}`); };

document.addEventListener("click", async e => {
  const t = e.target.closest("[data-act],[data-kb],[data-tf],[data-bl],[data-titel],[data-ava],[data-rahmen],[data-del],[data-freund-weg]");
  if (!t) return;
  const d = t.dataset;
  if (d.kb){ kf.bereich = d.kb; kf.gruppe = ""; return render(); }
  if (d.tf){ tf = d.tf; return render(); }
  if (d.bl){ bl = d.bl; return render(); }
  if (d.titel){ einstellen({ titel:d.titel, profilGewaehlt:true }); return toast(`Titel: ${esc(TIT[d.titel].name)}`); }
  if (d.ava){ einstellen({ avatar:d.ava, profilGewaehlt:true }); return; }
  if (d.rahmen){ einstellen({ rahmen:d.rahmen, profilGewaehlt:true }); return; }
  if (d.del){ if (confirm("Diesen Fund löschen?")) fundLoeschen(d.del); return; }
  if (d.freundWeg){ const s = spiel(); s.freunde = s.freunde.filter(x => x.n !== d.freundWeg); return speichern(); }
  try{
    switch (d.act){
      case "pro-an": einstellen({ pro:true }); toast("✨ Pro-Vorschau ist an"); break;
      case "standort": $("#ortwahl").textContent = "Bestimme Standort …"; ortWahl = await standort(); $("#ortwahl").textContent = "✓ " + ortWahl.ort; break;
      case "heimat": ortWahl = { ...spiel().einst.heimat }; $("#ortwahl").textContent = "✓ " + ortWahl.ort; break;
      case "ortsuche": ortSuchen($("[name=ortq]").value.trim(), $("#ortliste"), o => { ortWahl = o; $("#ortwahl").textContent = "✓ " + o.ort; $("#ortliste").innerHTML = ""; }); break;
      case "heimat-standort": setzeHeimat(await standort()); break;
      case "heimat-suche": ortSuchen($("#hq").value.trim(), $("#hliste"), setzeHeimat); break;
      case "import": importieren(); break;
      case "export": exportieren(); break;
      case "loeschen": if (confirm("Wirklich alle Funde und Einstellungen löschen? Das lässt sich nicht rückgängig machen.")) allesLoeschen(); break;
      case "code-teilen": {
        const link = `${location.origin}${location.pathname}#freund=${code(meinEintrag())}`;
        if (navigator.share) await navigator.share({ title:"Mein Naturspiel-Stand", text:`Level ${C.level}, ${C.S.arten.size} Arten – füg mich zu deiner Bestenliste hinzu:`, url:link }).catch(() => {});
        else { await navigator.clipboard?.writeText(link); toast("Link kopiert – schick ihn an Freunde."); }
        break;
      }
      case "code-rein": freundHinzu($("#fcode").value); break;
    }
  }catch(err){ toast(esc(err.message)); const o = $("#ortwahl"); if (o && d.act === "standort") o.textContent = "Kein Standort."; }
});

document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "kg"){ kf.gruppe = t.value; render(); }
  else if (t.id === "ks"){ kf.sort = t.value; render(); }
  else if (t.id === "kkm"){ kartenKm = +t.value; karteLaden(location.hash.split("/")[1]); }
  else if (t.id === "ppro") einstellen({ pro:t.checked });
  else if (t.id === "pname") einstellen({ name:t.value.trim() });
  else if (t.id === "pimport" && t.files[0]) einlesen(t.files[0]).then(() => toast("✓ Sicherung eingelesen"), err => toast(esc(err.message)));
});
document.addEventListener("input", debounce(e => {
  if (e.target.id === "kq"){ kf.q = e.target.value; const pos = e.target.selectionStart; render(); const i = $("#kq"); i.focus(); i.setSelectionRange(pos, pos); }
}, 250));

document.addEventListener("submit", async e => {
  if (e.target.id !== "fundform") return;
  e.preventDefault();
  if (!wahl || wahl.laedt) return;
  const fd = new FormData(e.target);
  const f = { id:neueId(), ...wahl, zeit:fd.get("zeit") || jetztLokal(), lat:ortWahl?.lat ?? null, lng:ortWahl?.lng ?? null,
    ort:ortWahl?.ort || "", notiz:(fd.get("notiz") || "").trim(), quelle:"selbst" };
  delete f.laedt;
  const vor = C;
  if (!fundHinzu(f)) toast("Achtung: Der Speicher auf diesem Gerät ist voll oder gesperrt.");
  wahl = null; ortWahl = null;
  location.hash = "#start";
  belohnung(vor, C, f);
});

window.addEventListener("hashchange", () => { window.scrollTo(0, 0); render(); });
beiAenderung(() => render());
render();
