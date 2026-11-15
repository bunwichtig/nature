// Pure Nature – Kompendium: die ganze Oberfläche. Seiten über die Adresse (#start, #kompendium, #eintragen, #karten, #trophaeen …).
import { $, $$, esc, fmt, debounce, datumDE, zeitDE, jetztLokal, photoSize, freePhoto, commonName } from "./util.js";
import { spiel, speichern, fundHinzu, fundeHinzu, fundLoeschen, einstellen, neueId, exportieren, einlesen, allesLoeschen, beiAenderung, alleSpieler, mitspielen, wechseln, spielerEntfernen, START_AVATARE } from "./speicher.js";
import { gegnerStand } from "./gegner.js";
import { ART_SCI, SCHNELL } from "./katalog/arten.js";
import { spielstand, fortschritt, beschreibe, seltenheit, gruppenVon, LEVEL_MAX, JAHRESZEIT_DE } from "./regeln.js";
import { sucheArten, holeTaxon, holeTaxa, beobachtungenVon, beobachterUmkreis, artenUmkreis, sucheOrt, ortsname, kurzOrt } from "./inat.js";
import { taxonIdsOf, taxonIdOf, isAbort } from "./api.js";
import { GRUPPEN, GRUPPE, STUFEN_NAME } from "./katalog/gruppen.js";
import { ABZEICHEN, ABZ } from "./katalog/abzeichen.js";
import { TITEL, TIT } from "./katalog/titel.js";
import { AVATARE, AVA, SZENEN } from "./katalog/avatare.js";
import { RAHMEN, RAH, SELTENHEIT } from "./katalog/rahmen.js";
import { HABITATE, HAB } from "./katalog/habitate.js";
import { initVerbinden, online, einladen, abschliessen, annehmen, antwortWeitergeben, senden, trennen, wartet } from "./verbinden.js";
import { initBestimmen, bestimmenHTML, bestimmenLaden, bestimmenKlick, bestimmenProSeite, seiten, BF_SELECTOR } from "./bestimmen.js";

const main = $("#main");
let C = null;                    // aktueller Spielstand (berechnet)
const neu = () => (C = spielstand(spiel().funde, spiel().einst));
neu();
beiAenderung(neu);
initBestimmen({ hat:tid => C.S.arten.has(tid), heimat:() => spiel().einst.heimat, neu:() => render() });

const pro = () => !!spiel().einst.pro;

// ---------- Bausteine ----------
const avatarHTML = (size = 56, avaId, raId) => {
  const e = spiel().einst;
  const a = AVA[avaId ?? ((pro() && C.avatare.has(e.avatar)) || START_AVATARE.includes(e.avatar) ? e.avatar : "start-spross")] || AVA["start-spross"];
  const r = raId ?? (pro() && C.rahmen.has(e.rahmen) ? e.rahmen : "holz");
  return `<span class="ava ra-${esc(r)}" style="--s:${size}px"><span class="ava-in sz-${a.szene}" aria-hidden="true">${a.zeichen}</span></span>`;
};
const titelName = () => { const t = spiel().einst.titel; return pro() && t && C.titel.has(t) ? TIT[t].name : null; };
const balken = (ist, soll, cls = "") => `<span class="bar ${cls}"><i style="width:${Math.min(100, soll ? ist / soll * 100 : 0).toFixed(1)}%"></i></span>`;
const seltenTag = obs => { const s = seltenheit(obs); return `<span class="tag sel-${s.id}">${s.name}</span>`; };
const fotoHTML = (f, cls = "") => f?.foto
  ? `<img class="${cls}" src="${esc(f.foto.url)}" alt="" loading="lazy" title="Foto: ${esc(f.foto.by)} (${esc(f.foto.lic)}) via iNaturalist">`
  : `<span class="${cls} nofoto" aria-hidden="true">${f.zeichen || GRUPPE[gruppenVon(f)[0]]?.zeichen || "🌱"}</span>`;
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
  kopfSpieler();
}
const freundeOffline = () => { const on = new Set(onlineSpieler().map(o => o.n)); return (spiel().freunde || []).filter(f => !on.has(f.n)); };
/** Oben links: wer spielt mit? Avatar-Stapel, aufklappbar zur Liste */
function kopfSpieler(){
  const box = $("#kopf-spieler"); if (!box) return;
  const offen = box.open, lokal = lokaleStaende(), geg = gegnerStand(fruehesterStart());
  const ich = lokal.find(x => x.p.id === spiel().id);
  const stapel = [ich, ...lokal.filter(x => x !== ich)].slice(0, 3);
  box.innerHTML = `<summary aria-label="Wer spielt mit?"><span class="stapel">${stapel.map(x => avatarHTML(26, x.av, x.ra)).join("")}</span>
    <span class="wer"><b>${esc(spiel().einst.name || "Naturfreund")}</b><small>${lokal.length + onlineSpieler().length} Spieler${online().length ? ` (${onlineSpieler().length} online)` : ""} · ${geg.length} Gegner ▾</small></span></summary>
  <div class="spieler-menue">
    <p class="menue-titel">Spielen auf diesem Gerät</p>
    ${lokal.map(({ p, C:c, av, ra }) => `<button class="menue-zeile${p.id === spiel().id ? " an" : ""}" data-spieler="${p.id}">${avatarHTML(32, av, ra)}<span><b>${esc(p.einst.name || "Naturfreund")}</b><small>Lv ${c.level} · ${fmt(c.S.arten.size)} Arten</small></span>${p.id === spiel().id ? `<em>spielt</em>` : ""}</button>`).join("")}
    <button class="menue-zeile neu" data-act="mitspielen"><span class="plus-rund">＋</span><span><b>Mitspielen</b><small>Name, Figur, los</small></span></button>
    <p class="menue-titel">Online verbunden</p>
    ${onlineSpieler().map(o => `<div class="menue-zeile">${avatarHTML(32, o.av, o.ra)}<span><b>${esc(o.n)}</b><small>Lv ${o.c.level} · ${fmt(o.c.xp)} XP · ${fmt(o.c.S.arten.size)} Arten</small></span><em>🟢</em></div>`).join("")}
    <button class="menue-zeile neu" data-act="verbinden"><span class="plus-rund">📶</span><span><b>Mit anderem Gerät verbinden</b><small>wie bei Bomberman – Punkte live teilen</small></span></button>
    <p class="menue-titel">Gegner</p>
    ${geg.map(g => `<a class="menue-zeile" href="#gegner/${g.id}">${avatarHTML(32, g.avatarId, g.rahmenId)}<span><b>${esc(g.name)}</b><small>Lv ${g.C.level} · ${fmt(g.C.S.arten.size)} Arten</small></span></a>`).join("")}
    ${freundeOffline().length ? `<p class="menue-titel">Freunde</p>${freundeOffline().map(f => `<a class="menue-zeile" href="#trophaeen/bestenliste"><span class="plus-rund">👤</span><span><b>${esc(f.n)}</b><small>${fmt(f.x)} XP</small></span></a>`).join("")}` : ""}
    <a class="menue-fuss" href="#trophaeen/bestenliste">Zur Bestenliste →</a>
  </div>`;
  box.open = offen;
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
  ${arenaHTML()}
  <section class="karte finder">${wasGefunden()}</section>
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
  ${wettstreitHTML(5)}
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

// ---------- Was hast du gefunden? (Suche + Schnellauswahl) ----------
let schnellTab = 0;
function wasGefunden(){
  const [titel, liste] = SCHNELL[schnellTab];
  return `<h1>Was hast du gefunden?</h1>
  <form class="suche" id="artsuche" autocomplete="off" onsubmit="return false">
    <input id="aq" type="search" placeholder="Name eintippen, z. B. Rotkehlchen, Fliegenpilz …" aria-label="Lebewesen suchen">
    <ul id="avorschlag" class="vorschlag" hidden></ul>
  </form>
  <p class="klein muted">Oder tippe auf ein häufiges Lebewesen:</p>
  <div class="chips scroll">${SCHNELL.map(([t], i) => `<button class="chip${i === schnellTab ? " an" : ""}" data-sw="${i}">${esc(t)}</button>`).join("")}</div>
  <div class="schnell">${liste.map(a => { const hab = C.S.sciArten.has(a.sci);
    return `<a class="schnell-k${hab ? " hab" : ""}" href="#eintragen/sci/${encodeURIComponent(a.sci)}"><span>${a.zeichen}</span><b>${esc(a.name)}</b>${hab ? "<small>✓ hab ich</small>" : ""}</a>`; }).join("")}</div>
  <p class="klein muted">Vorschläge und Fotos kommen von iNaturalist. Kennst du die Art nicht genau, nimm die Gruppe (z. B. „Täublinge“) – das zählt als Fund.</p>`;
}

// ---------- Mitspieler und Gegner ----------
function lokaleStaende(){
  return alleSpieler().map(p => {
    const c = p.id === spiel().id ? C : spielstand(p.funde, p.einst);
    const pr = !!p.einst.pro;
    return { p, C:c, av: pr && c.avatare.has(p.einst.avatar) ? p.einst.avatar : (START_AVATARE.includes(p.einst.avatar) ? p.einst.avatar : "start-spross"),
      ra: pr && c.rahmen.has(p.einst.rahmen) ? p.einst.rahmen : "holz" };
  });
}
/** Spieler auf verbundenen Geräten (nur solange beide online sind) */
const onlineSpieler = () => online().flatMap(v => v.spieler.map(x => ({ v, n:String(x.n || "Naturfreund").slice(0, 40), av:AVA[x.av] ? x.av : "start-spross", ra:RAH[x.ra] ? x.ra : "holz",
  c:{ level:+x.l || 1, xp:+x.x || 0, S:{ arten:{ size:+x.a || 0 } }, abz:{ size:+x.ab || 0 } } })));
const fruehesterStart = () => alleSpieler().map(p => p.einst.seit).sort()[0];
function arenaHTML(){
  return `<section class="arena" aria-label="Spieler">${lokaleStaende().map(({ p, C:c, av, ra }) => `
    <button class="spieler-chip${p.id === spiel().id ? " an" : ""}" data-spieler="${p.id}">${avatarHTML(38, av, ra)}<span><b>${esc(p.einst.name || "Naturfreund")}</b><small>Lv ${c.level}</small></span></button>`).join("")}
    ${onlineSpieler().map(o => `<span class="spieler-chip online">${avatarHTML(38, o.av, o.ra)}<span><b>${esc(o.n)}</b><small>online · Lv ${o.c.level}</small></span></span>`).join("")}
    <button class="spieler-chip neu" data-act="mitspielen"><span class="plus-rund">＋</span><span><b>Mitspielen</b><small>dazukommen</small></span></button>
    <button class="spieler-chip neu" data-act="verbinden"><span class="plus-rund">📶</span><span><b>Verbinden</b><small>anderes Gerät</small></span></button>
    ${gegnerStand(fruehesterStart()).map(g => `<a class="spieler-chip gegner" href="#gegner/${g.id}">${avatarHTML(38, g.avatarId, g.rahmenId)}<span><b>${esc(g.name.split(" ")[0])}</b><small>Gegner · Lv ${g.C.level}</small></span></a>`).join("")}
  </section>`;
}
function wettstreitHTML(max = 99){
  const zeilen = [
    ...lokaleStaende().map(({ p, C:c, av, ra }) => ({ name:p.einst.name || "Naturfreund", ich:p.id === spiel().id, av, ra, c, link:null, sub:p.id === spiel().id ? "du" : "Mitspieler" })),
    ...onlineSpieler().map(o => ({ name:o.n, av:o.av, ra:o.ra, c:o.c, link:null, sub:"🟢 online" })),
    ...gegnerStand(fruehesterStart()).map(g => ({ name:g.name, av:g.avatarId, ra:g.rahmenId, c:g.C, link:`#gegner/${g.id}`, sub:g.titel || "Gegner", gegner:true }))
  ].sort((a, b) => b.c.xp - a.c.xp);
  return `<section class="karte"><h2>Wettstreit</h2>
    <ol class="rang">${zeilen.slice(0, max).map((z, i) => `<li class="${z.ich ? "ich" : ""}"><span class="platz">${i + 1}</span>${avatarHTML(44, z.av, z.ra)}
      <span>${z.link ? `<a href="${z.link}"><b>${esc(z.name)}</b></a>` : `<b>${esc(z.name)}</b>`}<small>${esc(z.sub)} · Lv ${z.c.level} · ${fmt(z.c.S.arten.size)} Arten${pro() ? ` · ${fmt(z.c.abz.size)} Abzeichen` : ""}</small></span>
      <span class="xp">${fmt(z.c.xp)} XP</span></li>`).join("")}</ol>
    <p class="klein muted">Die drei Gegner sammeln jeden Tag weiter. Hol sie ein!</p></section>`;
}
function seiteGegner(id){
  const g = gegnerStand(fruehesterStart()).find(x => x.id === id); if (!g) return leer("Diesen Gegner gibt es nicht.");
  const c = g.C, ich = C;
  const kurz = g.name.split(" ")[0];
  const vgl = (label, a, b) => `<div class="vgl"><span class="vl">${label}</span>
    <small>${esc(kurz)}</small>${balken(b, Math.max(a, b, 1), "gegner")}<b>${fmt(b)}</b>
    <small>Du</small>${balken(a, Math.max(a, b, 1))}<b>${fmt(a)}</b></div>`;
  const arten = [...c.S.arten.values()].sort((a, b) => a.art.name.localeCompare(b.art.name, "de"));
  const letzte = [...g.funde].sort((a, b) => b.zeit.localeCompare(a.zeit)).slice(0, 6);
  return `<a class="zurueck" href="#start">← Start</a>
  <section class="karte"><div class="profil-kopf">${avatarHTML(76, g.avatarId, g.rahmenId)}<div><h1>${esc(g.name)}</h1>
    ${g.titel ? `<p class="titel">${esc(g.titel)}</p>` : ""}<p class="lv">Gegner · Level ${c.level} · ${fmt(c.xp)} XP</p></div></div>
    <p class="spruch">„${esc(g.spruch)}“</p></section>
  <section class="karte"><h2>Du gegen ${esc(g.name.split(" ")[0])}</h2>
    ${vgl("XP", ich.xp, c.xp)}${vgl("Arten", ich.S.arten.size, c.S.arten.size)}${vgl("Funde", ich.S.funde, c.S.funde)}${vgl("Habitatkarten", ich.karten.size, c.karten.size)}${vgl("Abzeichen", ich.abz.size, c.abz.size)}</section>
  <section class="karte"><h2>Zuletzt gefunden</h2>${letzte.map(f => `<div class="zeile">${fotoHTML(f, "mini")}<span><b>${esc(f.name)}</b><small>${zeitDE(f.zeit)}</small></span></div>`).join("") || "<p class=muted>Noch nichts.</p>"}</section>
  <section class="karte"><h2>Kompendium von ${esc(g.name.split(" ")[0])} (${arten.length} Arten)</h2>
    <div class="schnell">${arten.map(a => { const hab = ich.S.sciArten.has(a.art.sci);
      return `<a class="schnell-k${hab ? " hab" : ""}" href="#eintragen/sci/${encodeURIComponent(a.art.sci)}"><span>${a.zeichen || "🌱"}</span><b>${esc(a.art.name)}</b>${hab ? "<small>✓ hab ich auch</small>" : "<small>fehlt dir</small>"}</a>`; }).join("")}</div></section>`;
}
function mitspielenDialog(){
  const d = dialog(`<h2>Mitspielen</h2><p class="muted">Name eingeben, Figur wählen, los geht's. Jeder Spieler hat sein eigenes Kompendium.</p>
    <form id="mitspielen-form" class="form"><label>Name<input name="name" maxlength="40" required placeholder="z. B. Lina" autofocus></label>
    <div class="reihe">${START_AVATARE.map((a, i) => `<button type="button" class="ava-k${i ? "" : " an"} ok" data-start-ava="${a}">${avatarHTML(56, a, "holz")}<small>${esc(AVA[a].name)}</small></button>`).join("")}</div>
    <div class="reihe"><button class="btn" type="submit">Los geht's!</button><button class="btn leise" type="button" data-close>Abbrechen</button></div></form>`);
  d.querySelector("form").addEventListener("submit", e => {
    e.preventDefault();
    const name = new FormData(e.target).get("name").trim(); if (!name) return;
    const av = d.querySelector("[data-start-ava].an")?.dataset.startAva || START_AVATARE[0];
    d.close(); mitspielen(name, av); location.hash = "#start"; toast(`👋 Willkommen, ${esc(name)}!`);
  });
}

// ---------- Direkt verbinden (wie bei Bomberman) ----------
const linkVon = (art, c) => `${location.origin}${location.pathname}#${art}=${c}`;
const teilenKnopf = (link, text) => `<div class="v-link"><input readonly value="${esc(link)}" aria-label="Link"><button type="button" class="btn" data-act="v-teilen" data-link="${esc(link)}" data-text="${esc(text)}">Link schicken</button></div>`;
let verbindenDlg = null;
function verbindenDialog(){
  verbindenDlg = dialog(`<h2>📶 Mit anderem Gerät verbinden</h2>
    <p class="muted">Wie bei Bomberman: Die Geräte verbinden sich direkt miteinander, ohne Server. Solange beide online sind, seht ihr gegenseitig eure Punkte, Level und Arten – live.</p>
    <fieldset class="netz"><legend>Wo seid ihr?</legend>
      <label><input type="radio" name="vnetz" value="wlan" checked><span>Im selben WLAN<small>kein fremder Dienst</small></span></label>
      <label><input type="radio" name="vnetz" value="internet"><span>Übers Internet<small>Ein STUN-Dienst von Cloudflare hilft beim Finden. Spieldaten gehen dort nicht hin.</small></span></label></fieldset>
    <p><b>1.</b> Einladung erstellen und an das andere Gerät schicken.</p>
    <div id="v-ein"><button class="btn" data-act="v-einladen">Einladung erstellen</button></div>
    <p><b>2.</b> Das andere Gerät öffnet den Link und schickt dir einen Antwort-Link zurück. Öffne ihn – oder füge ihn hier ein:</p>
    <div class="v-link"><input id="v-antwort" placeholder="Antwort-Link einfügen" aria-label="Antwort-Link"><button class="btn leise" data-act="v-fertig">Verbinden</button></div>
    <p id="v-status" class="klein muted">Lass dieses Fenster offen, bis ihr verbunden seid.</p>
    <div class="reihe"><button class="btn leise" data-close>Schließen</button></div>`);
  verbindenDlg.addEventListener("close", () => { verbindenDlg = null; });
}
async function einladungAnnehmen(c){
  const d = verbindenDlg = dialog(`<h2>📶 Einladung</h2><p id="v-status" class="muted">Antwort wird vorbereitet …</p><div id="v-ein"></div><div class="reihe"><button class="btn leise" data-close>Schließen</button></div>`);
  d.addEventListener("close", () => { verbindenDlg = null; });
  try{
    const a = await annehmen(c);
    d.querySelector("#v-status").innerHTML = `<b>${esc(a.von)}</b> lädt dich ein. Schick diesen Antwort-Link zurück. Sobald ihr verbunden seid, steht es hier.`;
    d.querySelector("#v-ein").innerHTML = teilenKnopf(linkVon("antwort", a.code), "Meine Antwort fürs Naturspiel – einfach öffnen:");
  }catch(err){ d.querySelector("#v-status").textContent = "Das hat nicht geklappt: " + err.message; }
}
async function antwortAusLink(c){
  history.replaceState(null, "", "#start");
  try{
    const hier = await antwortWeitergeben(c);
    toast(hier ? "Verbinde …" : "Antwort an das wartende Fenster weitergegeben. Du kannst diesen Tab schließen.", 6000);
  }catch(err){ toast("Das hat nicht geklappt: " + esc(err.message)); }
}
const geraetStand = () => ({
  name: alleSpieler().map(p => p.einst.name || "Naturfreund").join(" & "),
  spieler: lokaleStaende().map(({ p, C:c, av, ra }) => ({ n:p.einst.name || "Naturfreund", l:c.level, x:c.xp, a:c.S.arten.size, ab:c.abz.size, av, ra }))
});
function onlineMerken(v){
  // Punkte der anderen bleiben nach dem Trennen in der Freunde-Bestenliste
  if (!v?.spieler?.length) return;
  const s = spiel(), heute = new Date().toISOString().slice(0, 10);
  for (const x of v.spieler){ const n = String(x.n || "").slice(0, 40); if (!n) continue;
    s.freunde = s.freunde.filter(f => f.n !== n); s.freunde.push({ n, l:+x.l || 1, x:+x.x || 0, a:+x.a || 0, ab:+x.ab || 0, av:x.av, r:x.ra, d:heute }); }
  speichern();
}
initVerbinden({ stand:geraetStand, neu:(art, v, err) => {
  if (art === "offen"){ toast("📶 Verbunden! Ihr seht jetzt gegenseitig eure Punkte."); verbindenDlg?.close(); }
  if (art === "zu" && v){ toast(`📴 ${esc(v.name)} ist offline.`); onlineMerken(v); }
  if (art === "fehler"){ const st = $("#v-status"); if (st) st.textContent = "Das hat nicht geklappt: " + err.message; }
  if (art === "stand" && !v.gemerkt){ v.gemerkt = true; onlineMerken(v); return; }
  kopfSpieler();
  const r = location.hash.slice(1) || "start";
  if (r === "start" || r === "trophaeen/bestenliste") render();
} });

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
      ${tid > 0 ? `<a class="btn leise" href="https://www.inaturalist.org/taxa/${tid}" target="_blank" rel="noopener">Bei iNaturalist ansehen ↗</a>` : ""}</div>
  </section>
  <section class="karte"><h2>${funde.length === 1 ? "Ein Fund" : funde.length + " Funde"}</h2>${funde.map(x => `
    <div class="fund"><div><b>${zeitDE(x.zeit)}</b>${x.ort ? ` · ${esc(x.ort)}` : ""}${x.quelle === "inat" ? ` · <a href="https://www.inaturalist.org/observations/${x.inat}" target="_blank" rel="noopener">iNaturalist ↗</a>` : ""}
      ${x.notiz ? `<p>${esc(x.notiz)}</p>` : ""}<small class="muted">${(C.je.get(x.id)?.teile || []).map(([t, n]) => `${esc(t)} +${n}`).join(" · ")}</small></div>
      <button class="icon" data-del="${x.id}" aria-label="Fund löschen">🗑️</button></div>`).join("")}</section>`;
}

// ---------- Eintragen ----------
let wahl = null, ortWahl = null;
// Art laden: über iNaturalist (mit Foto); aus der Schnellauswahl notfalls aus der eingebauten Liste
async function ladeWahl(key){
  if (/^\d+$/.test(key)) return holeTaxon(+key);
  try{ const id = await taxonIdOf(key); if (id) return await holeTaxon(id); }catch(err){ if (!ART_SCI[key]) throw err; }
  if (ART_SCI[key]) return { ...ART_SCI[key], offline:true };
  throw new Error("Art nicht gefunden");
}
function seiteEintragen(tid, sci){
  const key = tid === "sci" ? decodeURIComponent(sci || "") : tid;
  if (key && (!wahl || wahl.key !== key)){
    wahl = { key, laedt:true }; ortWahl = null;
    ladeWahl(key).then(t => { wahl = { ...t, key }; render(); }).catch(e => { wahl = null; toast("Art konnte nicht geladen werden: " + esc(e.message)); location.hash = "#eintragen"; });
  }
  if (!key) { wahl = null; }
  const e = spiel().einst;
  if (!wahl) return `<section class="karte finder">${wasGefunden()}</section>${bestimmenHTML()}`;
  if (wahl.laedt) return `<p class="muted">Lade Art …</p>`;
  const schon = C.S.arten.has(wahl.art?.tid);
  return `
  <a class="zurueck" href="#eintragen">← andere Art</a>
  <section class="karte gewaehlt">${fotoHTML(wahl, "bild")}<div><h1>${esc(wahl.name)}</h1><p class="sci">${esc(wahl.sci)}</p>
    <p class="tags">${wahl.art ? seltenTag(wahl.obs) : `<span class="tag">nicht bis zur Art</span>`}${schon ? `<span class="tag">schon im Kompendium</span>` : wahl.art ? `<span class="tag neu">neue Art!</span>` : ""}${wahl.gef ? `<span class="tag gef">gefährdet</span>` : ""}${wahl.offline ? `<span class="tag">ohne Verbindung – ohne Foto</span>` : ""}</p></div></section>
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

let kartenKm = 30, karteObj = null, kartenOffen = false;
const hk = { id:null, page:1, per:20 };
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
      <details class="karten-klapp" id="kklapp"${kartenOffen ? " open" : ""}><summary>🗺️ Karte ${kartenOffen ? "verbergen" : "zeigen"}</summary>
        <div id="map" class="map"></div><p class="klein muted">Orange Kästchen: hier wurde die Gruppe bei iNaturalist beobachtet. Zum Bewegen am Handy zwei Finger nehmen.</p></details>`
    : heimatForm("Für die Karte brauchen wir deinen Heimatort.")}
  </section>
  ${e.heimat ? `<section class="karte"><h2>Häufig in deiner Umgebung</h2><div id="hablist" class="muted">Lade …</div></section>` : ""}`;
}
async function karteZeichnen(id){
  const h = HAB[id], e = spiel().einst; if (!h || !e.heimat || !$("#map") || !kartenOffen) return;
  try{
    const ids = h.taxa.length ? await taxonIdsOf(h.taxa) : [];
    const { zeigeKarte } = await import("./karte.js");
    if (!$("#map")) return;
    karteObj?.remove?.(); karteObj = await zeigeKarte($("#map"), { lat:e.heimat.lat, lng:e.heimat.lng, km:kartenKm, taxonIds:ids, extra:h.extra });
  }catch(err){ if (!isAbort(err)) { const m = $("#map"); if (m) m.innerHTML = `<p class="muted" style="padding:12px">Karte konnte nicht geladen werden.</p>`; } }
}
function karteLaden(id){ karteZeichnen(id); return listeLaden(id); }
async function listeLaden(id){
  const h = HAB[id], e = spiel().einst; if (!h || !e.heimat || !$("#hablist")) return;
  if (hk.id !== id){ hk.id = id; hk.page = 1; }
  try{
    const ids = h.taxa.length ? await taxonIdsOf(h.taxa) : [];
    const d = await artenUmkreis(ids, e.heimat.lat, e.heimat.lng, kartenKm, { ...h.extra, per_page:hk.per, page:hk.page });
    const box = $("#hablist"); if (!box) return;
    box.classList.remove("muted");
    const start = (hk.page - 1) * hk.per;
    box.innerHTML = d.results.length ? `<p class="klein muted">${fmt(d.total)} Arten mit bestätigten Funden im Umkreis von ${kartenKm} km, häufigste zuerst – Platz ${fmt(start + 1)} bis ${fmt(start + d.results.length)}.</p>` + d.results.map(r => {
      const t = r.taxon, ph = freePhoto(t), hab = C.S.arten.has(t.id);
      return `<a class="zeile" href="#eintragen/${t.id}">${ph ? `<img class="mini" src="${esc(photoSize(ph.square_url || ph.url, "square"))}" alt="" loading="lazy" title="Foto: ${esc(ph.attribution)}">` : `<span class="mini nofoto">${h.zeichen}</span>`}
        <span><b>${esc(commonName(t))}</b><small>${esc(t.name)} · ${fmt(r.count)} Funde</small></span>${hab ? `<span class="tag neu">✓ hab ich</span>` : `<span class="plus">＋</span>`}</a>`;
    }).join("") + seiten(d.total, hk.page, hk.per, "hk") : `<p>Hier gibt es noch keine bestätigten Funde dieser Gruppe. Vielleicht bist du die erste Person?</p>`;
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
let bl = "wettstreit";
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
  const seg = `<div class="chips">${[["wettstreit","Gegner & Mitspieler"],["gemeinsam","Gemeinsam"],["freunde","Freunde"],["umgebung","Umgebung (iNaturalist)"]].map(([id, l]) => `<button class="chip${bl === id ? " an" : ""}" data-bl="${id}">${l}</button>`).join("")}</div>`;
  if (bl === "wettstreit") return seg + wettstreitHTML();
  if (bl === "gemeinsam") return seg + `<section class="karte"><h2>Gemeinsame Bestenliste</h2>
    <p class="klein muted">Alle, die ihren Stand eintragen, landen in einer Textdatei im Repo (<a href="https://github.com/${REPO}/blob/main/bestenliste.json" target="_blank" rel="noopener">bestenliste.json</a>). Schick das Spiel einem Kumpel – sobald ihr beide eingetragen seid, seht ihr euch hier.</p>
    <div id="gemeinsam" class="muted">Lade …</div>
    <div class="reihe"><a class="btn" href="${eintragLink()}" target="_blank" rel="noopener">Meinen Stand eintragen ↗</a></div>
    <p class="klein muted">Der Knopf öffnet bei GitHub ein fertig ausgefülltes Formular – nur noch auf „Submit new issue“ tippen (GitHub-Konto nötig). Nach etwa einer Minute stehst du in der Liste. Später wieder eintragen aktualisiert deinen Platz.</p></section>`;
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
const REPO = "bunwichtig/nature";
function eintragLink(){
  const m = meinEintrag();
  const body = `Mein Spielstand für die gemeinsame Bestenliste (bitte nicht ändern):\n\n\`\`\`\n${code(m)}\n\`\`\`\n\nLevel ${m.l} · ${m.x} XP · ${m.a} Arten`;
  return `https://github.com/${REPO}/issues/new?` + new URLSearchParams({ title:`Bestenliste: ${m.n}`, body });
}
async function gemeinsamLaden(){
  const box = $("#gemeinsam"); if (!box) return;
  let d = null;
  for (const url of [`https://raw.githubusercontent.com/${REPO}/main/bestenliste.json?t=${Date.now()}`, "bestenliste.json"]){
    try{ const r = await fetch(url, { cache:"no-store" }); if (r.ok){ d = await r.json(); break; } }catch{}
  }
  if (!d){ box.textContent = "Die Liste konnte nicht geladen werden."; return; }
  const name = (spiel().einst.name || "").toLowerCase();
  const list = [...(d.spieler || [])].sort((a, b) => b.x - a.x);
  box.classList.remove("muted");
  box.innerHTML = list.length ? `<ol class="rang">${list.map((f, i) => `<li class="${f.n.toLowerCase() === name ? "ich" : ""}"><span class="platz">${i + 1}</span>${avatarHTML(44, AVA[f.av] ? f.av : "start-spross", RAH[f.r] ? f.r : "holz")}
    <span><b>${esc(f.n)}</b><small>${f.t ? esc(f.t) + " · " : ""}Level ${f.l} · ${fmt(f.a)} Arten · ${fmt(f.ab)} Abzeichen · @${esc(f.gh)}</small></span><span class="xp">${fmt(f.x)} XP</span></li>`).join("")}</ol>
    <p class="klein muted">Stand: ${d.stand ? zeitDE(d.stand) : "–"}</p>` : `<p>Noch niemand eingetragen. Sei die erste Person!</p>`;
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
  <section class="karte"><h2>Spieler auf diesem Gerät</h2>
    <p class="klein muted">Wie bei Bomberman: Jeder kann einfach dazukommen. Tippe oben auf der Startseite auf einen Spieler, um zu wechseln.</p>
    <div class="reihe"><button class="btn" data-act="mitspielen">＋ Mitspielen</button>${alleSpieler().length > 1 ? `<button class="btn leise rot" data-act="spieler-weg">Diesen Spieler entfernen</button>` : ""}</div></section>
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
    <p><a href="quellen.html">Herkunft & Quellen</a> · <a href="archiv/mockup/">Ursprüngliches Mockup</a></p></section>`;
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
  const [route, arg, arg2] = (location.hash.slice(1) || "start").split("/");
  if (route.startsWith("freund=")) return freundAusLink(route.slice(7));
  if (route.startsWith("verbinden=")){ history.replaceState(null, "", "#start"); render(); return einladungAnnehmen(route.slice(10)); }
  if (route.startsWith("antwort=")){ antwortAusLink(route.slice(8)); return render(); }
  const seiten = { start:seiteStart, kompendium:seiteKompendium, art:seiteArt, eintragen:seiteEintragen, karten:seiteKarten,
    karte:seiteKarte, trophaeen:seiteTrophaeen, profil:seiteProfil, gegner:seiteGegner };
  main.innerHTML = (seiten[route] || seiteStart)(arg, arg2);
  kopf();
  document.title = { kompendium:"Kompendium", karten:"Habitatkarten", trophaeen:"Trophäen", profil:"Profil", eintragen:"Fund eintragen" }[route] ? `${{ kompendium:"Kompendium", karten:"Habitatkarten", trophaeen:"Trophäen", profil:"Profil", eintragen:"Fund eintragen" }[route]} · Pure Nature` : "Pure Nature – Kompendium";
  if ($("#aq")) artsucheAn();
  if (route === "karte") karteLaden(arg);
  if (route === "eintragen" && !arg) bestimmenLaden();
  if (route === "trophaeen" && arg === "bestenliste" && bl === "umgebung") umgebungLaden();
  if (route === "trophaeen" && arg === "bestenliste" && bl === "gemeinsam") gemeinsamLaden();
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
  const sp = $("#kopf-spieler");
  if (sp?.open && !e.target.closest("#kopf-spieler summary") && (!sp.contains(e.target) || e.target.closest("a,button"))) sp.open = false;
  const bf = e.target.closest(BF_SELECTOR);
  if (bf){ bestimmenKlick(bf); return; }
  const pg = e.target.closest("[data-hk-page]");
  if (pg){ hk.page = Math.max(1, +pg.dataset.hkPage); $("#hablist")?.scrollIntoView({ block:"start", behavior:"smooth" }); listeLaden(location.hash.split("/")[1]); return; }
  const t = e.target.closest("[data-act],[data-kb],[data-tf],[data-bl],[data-titel],[data-ava],[data-rahmen],[data-del],[data-freund-weg],[data-spieler],[data-sw],[data-start-ava]");
  if (!t) return;
  const d = t.dataset;
  if (d.kb){ kf.bereich = d.kb; kf.gruppe = ""; return render(); }
  if (d.tf){ tf = d.tf; return render(); }
  if (d.bl){ bl = d.bl; return render(); }
  if (d.titel){ einstellen({ titel:d.titel, profilGewaehlt:true }); return toast(`Titel: ${esc(TIT[d.titel].name)}`); }
  if (d.ava){ einstellen({ avatar:d.ava, profilGewaehlt:true }); return; }
  if (d.rahmen){ einstellen({ rahmen:d.rahmen, profilGewaehlt:true }); return; }
  if (d.spieler){ if (d.spieler !== spiel().id){ wechseln(d.spieler); toast(`Jetzt spielt: ${esc(spiel().einst.name || "Naturfreund")}`); } return; }
  if (d.sw){ schnellTab = +d.sw; return render(); }
  if (d.startAva){ $$("[data-start-ava]").forEach(b => b.classList.toggle("an", b === t)); return; }
  if (d.del){ if (confirm("Diesen Fund löschen?")) fundLoeschen(d.del); return; }
  if (d.freundWeg){ const s = spiel(); s.freunde = s.freunde.filter(x => x.n !== d.freundWeg); return speichern(); }
  try{
    switch (d.act){
      case "mitspielen": mitspielenDialog(); break;
      case "verbinden": verbindenDialog(); break;
      case "v-einladen": {
        const box = $("#v-ein"); box.innerHTML = `<p class="muted">Einladung wird vorbereitet …</p>`;
        const c = await einladen($("[name=vnetz]:checked")?.value === "internet");
        box.innerHTML = teilenKnopf(linkVon("verbinden", c), "Spiel mit mir im Naturspiel – öffne diesen Link:");
        break;
      }
      case "v-teilen": {
        if (navigator.share) await navigator.share({ title:"Naturspiel verbinden", text:d.text, url:d.link }).catch(() => {});
        else { await navigator.clipboard?.writeText(d.link); toast("Link kopiert."); }
        break;
      }
      case "v-fertig": { const st = $("#v-status"); await abschliessen($("#v-antwort").value); if (st) st.textContent = "Verbinde …"; break; }
      case "spieler-weg": if (confirm(`${spiel().einst.name || "Diesen Spieler"} mit allen Funden vom Gerät entfernen?`)) spielerEntfernen(spiel().id); break;
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
  else if (t.id === "kkm"){ kartenKm = +t.value; hk.page = 1; karteLaden(location.hash.split("/")[1]); }
  else if (t.matches("[data-hk-per]")){ hk.per = +t.value; hk.page = 1; listeLaden(location.hash.split("/")[1]); }
  else if (t.matches("[data-bf-per]")) bestimmenProSeite(t.value);
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
  delete f.laedt; delete f.key; delete f.offline;
  const vor = C;
  if (!fundHinzu(f)) toast("Achtung: Der Speicher auf diesem Gerät ist voll oder gesperrt.");
  wahl = null; ortWahl = null;
  location.hash = "#start";
  belohnung(vor, C, f);
});

document.addEventListener("toggle", e => {
  if (e.target.id !== "kklapp") return;
  kartenOffen = e.target.open;
  e.target.querySelector("summary").textContent = `🗺️ Karte ${kartenOffen ? "verbergen" : "zeigen"}`;
  if (kartenOffen) karteZeichnen(location.hash.split("/")[1]); else { karteObj?.remove?.(); karteObj = null; }
}, true);
window.addEventListener("hashchange", () => { window.scrollTo(0, 0); render(); });
beiAenderung(() => { render(); senden(); });
render();
