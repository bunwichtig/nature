// Wuchsformen europäischer Gefäßpflanzen nach der World Checklist of Vascular Plants (WCVP),
// Royal Botanic Gardens, Kew, CC BY 4.0. Govaerts R. et al. (2021), Scientific Data 8: 215.
// Übernommen aus bunwichtig/naturewissen (dev/daten/wuchs). Hier nur die Listen, die das Spiel braucht:
// B Baum, S Strauch, W Wasser & Sumpf, Z Zwiebel & Knolle, K Kletterpflanze.
// Jede Liste wird erst geladen, wenn zum ersten Mal eine Pflanze eingetragen wird.
export const WUCHS_CODES = ["B", "S", "W", "Z", "K"];
const cache = {};
/** Menge wissenschaftlicher Namen einer Wuchsform */
export async function wuchsSet(code){
  if (cache[code]) return cache[code];
  const { default:s } = await import(`./${code.toLowerCase()}.js`);
  return cache[code] = new Set(s.split("|").flatMap(g => { const [gen, sp] = g.split(":"); return sp.split(",").map(e => gen + " " + e); }));
}
/** Alle Wuchsform-Codes einer Art, z. B. "BS" */
export async function wuchsVon(sci){
  if (!sci) return "";
  const out = [];
  for (const c of WUCHS_CODES) if ((await wuchsSet(c)).has(sci)) out.push(c);
  return out.join("");
}
