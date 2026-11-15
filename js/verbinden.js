// Direkt verbinden – wie bei Bomberman: zwei Geräte reden direkt miteinander (WebRTC), ohne eigenen Server.
// Der Handschlag läuft über zwei Links, die man sich schickt:
//   1. Gerät A lädt ein  → Link mit #verbinden=…  (Angebot)
//   2. Gerät B öffnet ihn → Link mit #antwort=…   (Antwort) zurück an A
// Öffnet A den Antwort-Link in einem neuen Tab, reicht ein BroadcastChannel ihn an den wartenden Tab weiter.
// Solange beide online sind, schicken sich die Geräte gegenseitig ihren Spielstand (Punkte, Level, Arten …).
// Netz: „Gleiches WLAN“ braucht keinen fremden Dienst. „Übers Internet“ fragt einen öffentlichen STUN-Dienst
// (Cloudflare) nach der eigenen Adresse – dabei werden keine Spieldaten übertragen.

const STUN = [{ urls:"stun:stun.cloudflare.com:3478" }];
const kanal = "BroadcastChannel" in self ? new BroadcastChannel("pn-verbinden") : null;
const geraet = (() => { try{ let id = localStorage.getItem("pn-geraet"); if (!id){ id = Math.random().toString(36).slice(2, 10); localStorage.setItem("pn-geraet", id); } return id; }catch{ return Math.random().toString(36).slice(2, 10); } })();

const verbindungen = new Map();   // id → { pc, dc, name, spieler:[], online, seit }
let offen = null;                 // wartende Einladung { id, pc, dc }
let meinStand = () => ({ name:"", spieler:[] }), beiNeu = () => {};
let zuletzt = "";

export function initVerbinden({ stand, neu }){ meinStand = stand; beiNeu = neu; }
export const online = () => [...verbindungen.values()].filter(v => v.online);
export const alle = () => [...verbindungen.values()];

// ---------- Codes: SDP gepackt und als base64url ----------
const b64 = u8 => btoa(String.fromCharCode(...u8)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
async function packen(obj){
  const roh = new TextEncoder().encode(JSON.stringify(obj));
  if (!("CompressionStream" in self)) return "j" + b64(roh);
  const z = new Uint8Array(await new Response(new Blob([roh]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer());
  return "z" + b64(z);
}
async function auspacken(code){
  code = code.trim().replace(/^.*#(verbinden|antwort)=/, "");
  const art = code[0], daten = unb64(code.slice(1));
  const roh = art === "z" ? new Uint8Array(await new Response(new Blob([daten]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer()) : daten;
  return JSON.parse(new TextDecoder().decode(roh));
}

function warteKandidaten(pc, ms = 4000){
  return new Promise(ok => {
    if (pc.iceGatheringState === "complete") return ok();
    const t = setTimeout(ok, ms);
    pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete"){ clearTimeout(t); ok(); } });
  });
}
const neuesPC = internet => new RTCPeerConnection({ iceServers: internet ? STUN : [] });

function kanalAn(id, dc, pc){
  const v = verbindungen.get(id) || { id, name:"…", spieler:[], online:false };
  Object.assign(v, { dc, pc }); verbindungen.set(id, v);
  const auf = () => { if (v.online) return; v.online = true; v.seit = Date.now(); senden(true); beiNeu("offen", v); };
  dc.onopen = auf;
  if (dc.readyState === "open") setTimeout(auf);
  dc.onclose = () => { v.online = false; beiNeu("zu", v); };
  dc.onmessage = e => {
    try{
      const m = JSON.parse(e.data);
      if (m.typ === "stand" && Array.isArray(m.spieler)){
        v.name = String(m.name || "Gerät").slice(0, 40);
        v.spieler = m.spieler.slice(0, 12);
        beiNeu("stand", v);
      }
    }catch{}
  };
  pc.onconnectionstatechange = () => { if (["failed", "closed", "disconnected"].includes(pc.connectionState)){ v.online = false; beiNeu("zu", v); } };
}

/** Eigenen Stand an alle verbundenen Geräte schicken (nur wenn er sich geändert hat) */
export function senden(immer = false){
  const s = JSON.stringify({ typ:"stand", ...meinStand() });
  if (!immer && s === zuletzt) return;
  zuletzt = s;
  for (const v of verbindungen.values()) if (v.dc?.readyState === "open") try{ v.dc.send(s); }catch{}
}

/** Gerät A: Einladung erzeugen → Link */
export async function einladen(internet){
  offen?.pc.close();
  const pc = neuesPC(internet), dc = pc.createDataChannel("naturspiel"), id = Math.random().toString(36).slice(2, 10);
  offen = { id, pc, dc };
  await pc.setLocalDescription(await pc.createOffer());
  await warteKandidaten(pc);
  return packen({ v:1, id, g:geraet, n:meinStand().name, i:internet ? 1 : 0, sdp:pc.localDescription.sdp });
}
/** Gerät A: Antwort einsetzen */
export async function abschliessen(code){
  const a = await auspacken(code);
  if (!offen) throw new Error("Hier wartet gerade keine Einladung. Lade neu ein.");
  if (a.id !== offen.id) throw new Error("Diese Antwort gehört zu einer anderen Einladung.");
  const { pc, dc, id } = offen; offen = null;
  kanalAn(a.g + ":" + id, dc, pc);
  await pc.setRemoteDescription({ type:"answer", sdp:a.sdp });
}
/** Gerät B: Einladung annehmen → Antwort-Link */
export async function annehmen(code){
  const o = await auspacken(code);
  if (o.g === geraet) throw new Error("Das ist deine eigene Einladung. Schick den Link an das andere Gerät.");
  const pc = neuesPC(!!o.i), id = o.g + ":" + o.id;
  pc.ondatachannel = e => kanalAn(id, e.channel, pc);
  await pc.setRemoteDescription({ type:"offer", sdp:o.sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await warteKandidaten(pc);
  return { von:String(o.n || "jemand").slice(0, 40), code:await packen({ v:1, id:o.id, g:geraet, sdp:pc.localDescription.sdp }) };
}
export const wartet = () => !!offen;

/** Antwort-Link in einem anderen Tab geöffnet? Dann an den wartenden Tab weitergeben. */
export function antwortWeitergeben(code){
  if (offen){ return abschliessen(code).then(() => true); }
  kanal?.postMessage({ antwort:code });
  return Promise.resolve(false);
}
kanal?.addEventListener("message", e => {
  if (e.data?.antwort && offen) abschliessen(e.data.antwort).catch(err => beiNeu("fehler", null, err));
});
export function trennen(id){ const v = verbindungen.get(id); v?.pc?.close(); verbindungen.delete(id); beiNeu("zu", v); }
