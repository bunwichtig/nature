// Abfragen an iNaturalist und Nominatim – über die Warteschlangen aus api.js (iNaturalist höchstens etwa 1/s,
// Nominatim 1/s und nur nach dem Absenden). Aus einem iNaturalist-Taxon wird ein Fund-Eintrag fürs Kompendium.
import { inat, getJSON, INAT_DE, PRIO, API } from "./api.js";
import { freePhoto, photoSize, licName, commonName } from "./util.js";
import { wuchsVon } from "../daten/wuchs/index.js";

const ARTRANG = ["species", "hybrid"];
const UNTER = ["subspecies", "variety", "form", "infrahybrid"];

/** Vorschläge für die Artsuche (beim Tippen, 300 ms Pause macht der Aufrufer) */
export async function sucheArten(q, signal){
  const d = await inat("/taxa/autocomplete", { q, per_page:10, is_active:"true", ...INAT_DE }, { signal, prio:PRIO.high });
  const lower = q.toLowerCase();
  const score = t => ((commonName(t).toLowerCase().startsWith(lower) || t.name.toLowerCase().startsWith(lower)) ? 0 : 2) + (ARTRANG.includes(t.rank) ? 0 : 1);
  return (d.results || []).map((t, i) => [t, i]).sort((a, b) => score(a[0]) - score(b[0]) || a[1] - b[1]).map(x => x[0]);
}

/** Taxon (mit Vorfahren) → die Angaben, die ein Fund braucht */
export async function taxonInfo(t){
  const ancestors = t.ancestors || [];
  let art = null, obs = t.observations_count;
  if (ARTRANG.includes(t.rank)) art = { tid:t.id, sci:t.name, name:commonName(t) };
  else if (UNTER.includes(t.rank)){
    const sp = ancestors.find(a => a.rank === "species");
    if (sp){ art = { tid:sp.id, sci:sp.name, name:commonName(sp) }; obs = sp.observations_count ?? obs; }
  }
  const ph = freePhoto(t);
  const iucn = t.conservation_status?.iucn ?? 0;
  const kingdom = ancestors.find(a => a.rank === "kingdom")?.name;
  return {
    tid:t.id, sci:t.name, name:commonName(t), rank:t.rank, iconic:t.iconic_taxon_name || null,
    art, obs: obs ?? null,
    anc: ancestors.map(a => ({ n:a.name, r:a.rank })),
    gef: !!t.threatened || iucn >= 30,
    eing: t.establishment_means?.establishment_means === "introduced",
    foto: ph ? { url:photoSize(ph.square_url || ph.url, "medium"), by:ph.attribution || "", lic:licName(ph.license_code) } : null,
    wu: kingdom === "Plantae" && art ? await wuchsVon(art.sci) : ""
  };
}

/** Ein Taxon vollständig laden (für einen neuen Fund) */
export async function holeTaxon(id){
  const d = await inat(`/taxa/${id}`, INAT_DE, { prio:PRIO.high });
  const t = d.results?.[0]; if (!t) throw new Error("Art nicht gefunden");
  return taxonInfo(t);
}

/** Viele Taxa auf einmal (je 30), z. B. beim Übernehmen von iNaturalist */
export async function holeTaxa(ids, onStep){
  const out = new Map(), list = [...new Set(ids)];
  for (let i = 0; i < list.length; i += 30){
    const d = await inat(`/taxa/${list.slice(i, i + 30).join(",")}`, INAT_DE, { prio:PRIO.normal });
    for (const t of d.results || []) out.set(t.id, await taxonInfo(t));
    onStep?.(Math.min(list.length, i + 30), list.length);
  }
  return out;
}

/** Eigene Beobachtungen einer Person bei iNaturalist (öffentlich), höchstens 2.000 */
export async function beobachtungenVon(login, onStep){
  const all = [];
  for (let page = 1; page <= 10; page++){
    const d = await inat("/observations", { user_login:login, per_page:200, page, order_by:"observed_on", order:"asc", verifiable:"true" }, { cache:false });
    all.push(...(d.results || []));
    onStep?.(all.length, d.total_results || all.length);
    if (all.length >= (d.total_results || 0) || !(d.results || []).length) break;
  }
  return all;
}

/** Forschende im Umkreis bei iNaturalist, nach Artenzahl */
export async function beobachterUmkreis(lat, lng, km){
  const d = await inat("/observations/observers", { lat:lat.toFixed(3), lng:lng.toFixed(3), radius:km, order_by:"species_count", per_page:30, quality_grade:"research" });
  return d.results || [];
}

/** Häufigste Arten einer Gruppe im Umkreis */
export async function artenUmkreis(taxonIds, lat, lng, km, extra = {}){
  const p = { lat:lat.toFixed(3), lng:lng.toFixed(3), radius:km, per_page:12, quality_grade:"research", ...INAT_DE, ...extra };
  if (taxonIds?.length) p.taxon_id = taxonIds.join(",");
  const d = await inat("/observations/species_counts", p);
  return { total:d.total_results || 0, results:d.results || [] };
}

/** Ortssuche (erst nach dem Absenden) */
export async function sucheOrt(q){
  const p = new URLSearchParams({ format:"jsonv2", limit:"6", "accept-language":"de", q });
  return getJSON(`${API.nominatim}/search?${p}`, { prio:PRIO.high });
}
export async function ortsname(lat, lng){
  const p = new URLSearchParams({ format:"jsonv2", lat:lat.toFixed(5), lon:lng.toFixed(5), zoom:"12", "accept-language":"de" });
  try{
    const d = await getJSON(`${API.nominatim}/reverse?${p}`, { prio:PRIO.high });
    const a = d.address || {};
    return a.village || a.town || a.city || a.municipality || a.county || d.name || "";
  }catch{ return ""; }
}
export const kurzOrt = r => (r.display_name || r.name || "").split(",").slice(0, 2).join(",").trim();
