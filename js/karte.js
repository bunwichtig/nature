// Habitatkarte: MapLibre (liegt im Repo unter vendor/, kein CDN), Kartenbild von OpenFreeMap,
// darüber das Fundraster von iNaturalist (/v1/grid-Kacheln) für die Gruppe der Karte.
let laden;
function maplibre(){
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  return laden ||= new Promise((ok, fail) => {
    const css = Object.assign(document.createElement("link"), { rel:"stylesheet", href:"vendor/maplibre-gl.css" });
    const js = Object.assign(document.createElement("script"), { src:"vendor/maplibre-gl.js" });
    js.onload = () => ok(window.maplibregl); js.onerror = () => fail(new Error("Karte konnte nicht geladen werden"));
    document.head.append(css, js);
  });
}

/** Karte in el zeichnen. taxonIds: iNaturalist-Nummern (leer = alles), extra: weitere Filter */
export async function zeigeKarte(el, { lat, lng, km = 30, taxonIds = [], extra = {} }){
  const ml = await maplibre();
  const p = new URLSearchParams({ color:"#e7ad4f", ...extra });
  if (taxonIds.length) p.set("taxon_id", taxonIds.join(","));
  const zoom = Math.max(5, Math.min(12, 1 + Math.log2(9000 / km)));
  const map = new ml.Map({
    container: el, style: "https://tiles.openfreemap.org/styles/liberty", center:[lng, lat], zoom,
    attributionControl: { compact:true, customAttribution:'Fundraster: <a href="https://www.inaturalist.org" target="_blank" rel="noopener">iNaturalist</a>' },
    cooperativeGestures: true
  });
  map.addControl(new ml.NavigationControl({ showCompass:false }), "top-right");
  map.on("load", () => {
    map.addSource("funde", { type:"raster", tileSize:256, maxzoom:16,
      tiles:[`https://api.inaturalist.org/v1/grid/{z}/{x}/{y}.png?${p}`] });
    map.addLayer({ id:"funde", type:"raster", source:"funde", paint:{ "raster-opacity":0.85 } });
    new ml.Marker({ color:"#86b86f" }).setLngLat([lng, lat]).addTo(map);
  });
  return map;
}
