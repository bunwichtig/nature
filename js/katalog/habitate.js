// Habitatkarten: werden mit Erfahrungspunkten (XP) freigeschaltet – auch in der Standardversion.
// Jede Karte zeigt, wo die Gruppe in der Umgebung gefunden wird: Fundraster von iNaturalist
// (Kacheln /v1/grid, CC BY-NC & Co. je Beobachtung) auf einer MapLibre-Karte und die häufigsten Arten im Umkreis.
// taxa: wissenschaftliche Namen, die beim Öffnen einmal in iNaturalist-Nummern übersetzt und gemerkt werden.
// extra: zusätzliche Filter für iNaturalist (z. B. nur gefährdete Arten).

const H = [];
const add = (id, name, zeichen, xp, taxa, wo, extra = {}) => H.push({ id, name, zeichen, xp, taxa, wo, extra });

add("voegel", "Vögel", "🐦", 0, ["Aves"], "Am besten früh am Morgen an Waldrändern, Hecken, Parks und Gewässern. Im Winter am Futterhaus.");
add("pflanzen", "Pflanzen", "🌿", 100, ["Plantae"], "Wegränder, Wiesen und Brachen sind artenreich. Ungemähte Ecken lohnen sich besonders.");
add("pilze", "Pilze", "🍄", 250, ["Fungi"], "Feuchte Wälder von August bis November, nach Regen. Auf Totholz das ganze Jahr.");
add("baeume", "Bäume", "🌳", 500, ["Fagaceae", "Betulaceae", "Pinaceae", "Sapindaceae", "Salicaceae", "Cupressaceae", "Taxaceae"], "Alte Parks, Friedhöfe, Alleen und Auwälder. Im Winter an Rinde und Knospen erkennen.");
add("amphibien", "Amphibien", "🐸", 800, ["Amphibia"], "Tümpel, Teiche und Gräben. Im März und April wandern Kröten in milden, feuchten Nächten.");
add("reptilien", "Reptilien", "🦎", 1200, ["Reptilia"], "Sonnige Stellen mit Versteck: Steinmauern, Bahndämme, Heiden und Waldränder am Vormittag.");
add("saeuger", "Säugetiere", "🦊", 1700, ["Mammalia"], "In der Dämmerung an Waldrändern und Feldern. Spuren im Schnee oder Schlamm verraten viel.");
add("schmetterlinge", "Schmetterlinge", "🦋", 2300, ["Lepidoptera"], "Blühende Wiesen und Säume an warmen, windstillen Tagen. Nachtfalter am Licht.");
add("libellen", "Libellen", "🪽", 3000, ["Odonata"], "Sonnige Teiche, Bäche und Moore von Mai bis September.");
add("eulen", "Eulen", "🦉", 4000, ["Strigiformes"], "Alte Bäume, Scheunen und Kirchtürme. Rufe im Spätwinter in der Abenddämmerung.");
add("greife", "Greifvögel", "🦅", 5000, ["Accipitriformes", "Falconiformes"], "Offene Felder mit Hecken, an warmen Tagen kreisend in der Thermik.");
add("spechte", "Spechte", "🪵", 6000, ["Picidae"], "Alte Laub- und Mischwälder mit Totholz. Im Frühjahr hört man sie trommeln.");
add("wasservoegel", "Wasservögel", "🦆", 7000, ["Anatidae", "Podicipedidae", "Rallidae"], "Seen, Teiche und Flüsse – im Winter rasten viele Gäste aus dem Norden.");
add("bienen", "Wildbienen & Hummeln", "🐝", 8000, ["Anthophila"], "Blütenreiche Gärten, Böschungen mit offenem Boden und Totholz.");
add("kaefer", "Käfer", "🪲", 9000, ["Coleoptera"], "Totholz, Blüten, Steine umdrehen (und zurücklegen!), Ufer und Kompost.");
add("orchideen", "Orchideen", "🌸", 10000, ["Orchidaceae"], "Kalkmagerrasen, lichte Buchenwälder und Feuchtwiesen von Mai bis Juli. Nur schauen, nicht pflücken.");
add("farne", "Farne", "☘️", 11500, ["Polypodiopsida"], "Schattige, feuchte Wälder, Schluchten und alte Mauern.");
add("moose", "Moose", "🍀", 13000, ["Bryophyta", "Marchantiophyta", "Anthocerotophyta"], "Das ganze Jahr: Baumstämme, Steine, Moore. Mit Lupe noch schöner.");
add("roehrlinge", "Röhrlinge", "🍄‍🟫", 14500, ["Boletales"], "Unter Fichten, Kiefern, Birken und Eichen im Spätsommer und Herbst.");
add("fledermaeuse", "Fledermäuse", "🦇", 16000, ["Chiroptera"], "Warme Sommerabende über Gewässern und an Straßenlaternen am Waldrand.");
add("spinnen", "Spinnen", "🕷️", 17500, ["Araneae"], "Im Spätsommer am Morgen, wenn Tau die Netze sichtbar macht.");
add("fische", "Fische", "🐟", 19000, ["Actinopterygii"], "Klare Bäche, Brücken und Stege mit Blick ins Wasser.");
add("weichtiere", "Schnecken & Muscheln", "🐌", 21000, ["Mollusca"], "Nach Regen in Gärten und Wäldern, Muschelschalen am Ufer.");
add("heuschrecken", "Heuschrecken", "🦗", 23000, ["Orthoptera"], "Warme Wiesen und Heiden im Spätsommer – man hört sie zuerst.");
add("flechten", "Flechten", "🪨", 25000, ["Lecanoromycetes"], "Baumrinde, Steine, Dächer. Viele Arten zeigen saubere Luft an.");
add("nadelwald", "Nadelbäume", "🌲", 27500, ["Pinophyta"], "Bergwälder, Heiden, Dünen und Forste.");
add("laubwald", "Buchen & Eichen", "🌳", 30000, ["Fagaceae"], "Alte Laubwälder, Hutewälder und Parks.");
add("wiesenblumen", "Wiesenblumen", "🌼", 33000, ["Asteraceae", "Fabaceae", "Campanulaceae"], "Ungedüngte Wiesen, Wegränder und Magerrasen von Mai bis August.");
add("raubtiere", "Raubtiere", "🐺", 36000, ["Carnivora"], "Fuchs, Dachs, Marder und Wolf: Spuren, Kot und Wildkameras verraten sie.");
add("huftiere", "Hirsche & Wildschweine", "🦌", 40000, ["Artiodactyla"], "Waldränder und Lichtungen in der Morgen- und Abenddämmerung.");
add("kueste", "Möwen & Watvögel", "🌊", 44000, ["Charadriiformes"], "Küsten, Watt, Kiesgruben und Klärteiche, besonders im Vogelzug.");
add("molche", "Molche & Salamander", "🦎", 48000, ["Caudata"], "Kleine fischfreie Tümpel im Frühjahr, Feuersalamander in feuchten Buchenwäldern nach Regen.");
add("schlangen", "Schlangen", "🐍", 52000, ["Serpentes"], "Moore, Heiden und Ufer an sonnigen Vormittagen. Abstand halten.");
add("schwebfliegen", "Schwebfliegen", "🌼", 56000, ["Syrphidae"], "Doldenblüten und Gärten an sonnigen Tagen.");
add("ameisen", "Ameisen", "🐜", 60000, ["Formicidae"], "Waldränder mit Ameisenhügeln, Steine und Totholz.");
add("krebse", "Krebstiere", "🦀", 65000, ["Crustacea"], "Bäche, Teiche, Küste – Asseln unter Steinen und Laub.");
add("schleimpilze", "Schleimpilze", "🫧", 70000, ["Mycetozoa"], "Feuchtes Totholz und Laub im Sommer und Herbst.");
add("seggen", "Seggen & Binsen", "🎋", 75000, ["Cyperaceae", "Juncaceae"], "Nasse Wiesen, Moore und Ufer.");
add("fleischfresser", "Fleischfressende Pflanzen", "🪤", 80000, ["Droseraceae", "Lentibulariaceae"], "Hochmoore und nährstoffarme Gewässer. Bitte auf den Wegen bleiben.");
add("gefaehrdet", "Gefährdete Arten", "🛡️", 90000, [], "Hier zeigt iNaturalist nur Funde gefährdeter Arten (Rote Liste). Fundorte sind oft absichtlich ungenau.", { threatened:"true" });
add("alles", "Alles Leben", "🌍", 100000, [], "Alle Beobachtungen in deiner Umgebung – das große Ganze.");

export const HABITATE = H;
export const HAB = Object.fromEntries(H.map(h => [h.id, h]));
