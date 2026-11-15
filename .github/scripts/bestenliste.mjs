// Trägt einen Spielstand aus einem Issue in bestenliste.json ein.
// Eingabe über Umgebungsvariablen: ISSUE_BODY, ISSUE_USER. Ausgabe: Text für den Kommentar in kommentar.txt.
// Ein Eintrag pro GitHub-Konto – so kann niemand den Platz einer anderen Person überschreiben.
import { readFileSync, writeFileSync } from "node:fs";

const body = process.env.ISSUE_BODY || "", user = process.env.ISSUE_USER || "";
const out = t => { writeFileSync("kommentar.txt", t); console.log(t); };
const m = body.match(/```\s*([A-Za-z0-9_-]{10,4000})\s*```/);
if (!m || !user){ out("Ich habe keinen Spielstand-Code gefunden. Bitte nutze den Knopf „Meinen Stand eintragen“ im Spiel."); process.exit(0); }

let d;
try{ d = JSON.parse(Buffer.from(m[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")); }
catch{ out("Der Code ließ sich nicht lesen. Bitte nutze den Knopf im Spiel und ändere den Text nicht."); process.exit(0); }

const str = (v, max = 40) => String(v ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
const zahl = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
const id = v => /^[a-z0-9-]{1,40}$/.test(String(v)) ? String(v) : "";
const e = {
  gh: user, n: str(d.n) || user, t: str(d.t, 60),
  l: Math.max(1, zahl(d.l, 100)), x: zahl(d.x, 10_000_000), a: zahl(d.a, 100_000), ab: zahl(d.ab, 2000), sw: zahl(d.sw, 1_000_000),
  av: id(d.av) || "start-spross", r: id(d.r) || "holz", d: new Date().toISOString().slice(0, 10)
};

const datei = "bestenliste.json";
const liste = JSON.parse(readFileSync(datei, "utf8"));
liste.spieler = (liste.spieler || []).filter(s => s.gh !== user);
liste.spieler.push(e);
liste.spieler.sort((a, b) => b.x - a.x);
liste.stand = new Date().toISOString();
writeFileSync(datei, JSON.stringify(liste, null, 2) + "\n");
const platz = liste.spieler.findIndex(s => s.gh === user) + 1;
out(`✓ Eingetragen: **${e.n}** – Level ${e.l}, ${e.x} XP, ${e.a} Arten. Platz ${platz} von ${liste.spieler.length}. In etwa einer Minute ist es im Spiel zu sehen.`);
