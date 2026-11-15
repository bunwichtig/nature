// Kleine Helfer, die überall gebraucht werden (teils aus bunwichtig/naturewissen übernommen).
export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[m]));
export const fmt = n => new Intl.NumberFormat("de-DE").format(n ?? 0);
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const photoSize = (url, size) => url ? url.replace(/\/(square|small|medium|large|original)\./, `/${size}.`) : null;
const LIC = { "cc0":"CC0", "cc-by":"CC BY", "cc-by-sa":"CC BY-SA", "cc-by-nd":"CC BY-ND", "cc-by-nc":"CC BY-NC", "cc-by-nc-sa":"CC BY-NC-SA", "cc-by-nc-nd":"CC BY-NC-ND" };
export const licName = code => LIC[code] || (code || "").toUpperCase();
// Nur Fotos mit freier Lizenz (license_code vorhanden)
export const freePhoto = t => t?.default_photo?.license_code ? t.default_photo : null;
export const commonName = t => t?.preferred_common_name || t?.name || "";
export const datumDE = iso => new Intl.DateTimeFormat("de-DE", { day:"numeric", month:"short", year:"numeric" }).format(new Date(iso));
export const zeitDE = iso => new Intl.DateTimeFormat("de-DE", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }).format(new Date(iso));
// Lokale Zeit als "YYYY-MM-DDTHH:MM" (für <input type=datetime-local> und zum Speichern)
export const jetztLokal = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
export const local = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch{ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch{ return false; } }
};
