// Häufige Arten Mitteleuropas für die Schnellauswahl („Was hast du gefunden?“) und für die Funde der Gegner.
// Systematik nach iNaturalist (Reich › Stamm › Klasse › Ordnung › Familie › Gattung), Beobachtungszahlen grob gerundet.
// Wenn iNaturalist erreichbar ist, wird beim Eintragen immer der echte Datensatz von dort geholt (mit Foto und genauen Zahlen);
// diese Liste ist nur die Auswahl und der Ersatz, falls keine Verbindung besteht.

const P = {
  aves:"Animalia/Chordata/Aves", mamm:"Animalia/Chordata/Mammalia", amph:"Animalia/Chordata/Amphibia", rept:"Animalia/Chordata/Reptilia",
  ins:"Animalia/Arthropoda/Insecta", arach:"Animalia/Arthropoda/Arachnida", gast:"Animalia/Mollusca/Gastropoda",
  dik:"Plantae/Tracheophyta/Magnoliopsida", mono:"Plantae/Tracheophyta/Liliopsida", nadel:"Plantae/Tracheophyta/Pinopsida",
  farn:"Plantae/Tracheophyta/Polypodiopsida", moos:"Plantae/Bryophyta/Polytrichopsida",
  agar:"Fungi/Basidiomycota/Agaricomycetes", lecan:"Fungi/Ascomycota/Lecanoromycetes"
};
const R = ["kingdom", "phylum", "class"];

// [deutscher Name, wissenschaftlicher Name, Zeichen, Pfad, Ordnung, Familie, Beobachtungen weltweit, Wuchsform, Zusatz-Ränge]
const L = [
  ["Amsel","Turdus merula","🐦‍⬛","aves","Passeriformes","Turdidae",420000],
  ["Kohlmeise","Parus major","🐤","aves","Passeriformes","Paridae",330000],
  ["Blaumeise","Cyanistes caeruleus","🐦","aves","Passeriformes","Paridae",260000],
  ["Rotkehlchen","Erithacus rubecula","🐦","aves","Passeriformes","Muscicapidae",300000],
  ["Haussperling","Passer domesticus","🐦","aves","Passeriformes","Passeridae",600000],
  ["Buchfink","Fringilla coelebs","🐦","aves","Passeriformes","Fringillidae",220000],
  ["Elster","Pica pica","🐦‍⬛","aves","Passeriformes","Corvidae",200000],
  ["Rabenkrähe","Corvus corone","🐦‍⬛","aves","Passeriformes","Corvidae",160000],
  ["Stockente","Anas platyrhynchos","🦆","aves","Anseriformes","Anatidae",900000],
  ["Höckerschwan","Cygnus olor","🦢","aves","Anseriformes","Anatidae",200000],
  ["Graureiher","Ardea cinerea","🪶","aves","Pelecaniformes","Ardeidae",250000],
  ["Weißstorch","Ciconia ciconia","🪶","aves","Ciconiiformes","Ciconiidae",90000],
  ["Kranich","Grus grus","🪶","aves","Gruiformes","Gruidae",60000],
  ["Mäusebussard","Buteo buteo","🦅","aves","Accipitriformes","Accipitridae",140000],
  ["Rotmilan","Milvus milvus","🦅","aves","Accipitriformes","Accipitridae",45000],
  ["Turmfalke","Falco tinnunculus","🦅","aves","Falconiformes","Falconidae",120000],
  ["Waldkauz","Strix aluco","🦉","aves","Strigiformes","Strigidae",40000],
  ["Buntspecht","Dendrocopos major","🐦","aves","Piciformes","Picidae",150000],
  ["Grünspecht","Picus viridis","🐦","aves","Piciformes","Picidae",60000],
  ["Ringeltaube","Columba palumbus","🕊️","aves","Columbiformes","Columbidae",230000],
  ["Eisvogel","Alcedo atthis","🐦","aves","Coraciiformes","Alcedinidae",110000],
  ["Lachmöwe","Chroicocephalus ridibundus","🕊️","aves","Charadriiformes","Laridae",150000],
  ["Reh","Capreolus capreolus","🦌","mamm","Artiodactyla","Cervidae",90000],
  ["Wildschwein","Sus scrofa","🐗","mamm","Artiodactyla","Suidae",60000],
  ["Rotfuchs","Vulpes vulpes","🦊","mamm","Carnivora","Canidae",130000],
  ["Dachs","Meles meles","🦡","mamm","Carnivora","Mustelidae",25000],
  ["Eichhörnchen","Sciurus vulgaris","🐿️","mamm","Rodentia","Sciuridae",110000],
  ["Igel","Erinaceus europaeus","🦔","mamm","Eulipotyphla","Erinaceidae",50000],
  ["Feldhase","Lepus europaeus","🐇","mamm","Lagomorpha","Leporidae",60000],
  ["Zwergfledermaus","Pipistrellus pipistrellus","🦇","mamm","Chiroptera","Vespertilionidae",15000],
  ["Erdkröte","Bufo bufo","🐸","amph","Anura","Bufonidae",80000],
  ["Grasfrosch","Rana temporaria","🐸","amph","Anura","Ranidae",70000],
  ["Teichmolch","Lissotriton vulgaris","🦎","amph","Caudata","Salamandridae",25000],
  ["Feuersalamander","Salamandra salamandra","🦎","amph","Caudata","Salamandridae",35000],
  ["Zauneidechse","Lacerta agilis","🦎","rept","Squamata","Lacertidae",45000,"",[["Lacertilia","suborder"]]],
  ["Blindschleiche","Anguis fragilis","🦎","rept","Squamata","Anguidae",30000,"",[["Lacertilia","suborder"]]],
  ["Ringelnatter","Natrix natrix","🐍","rept","Squamata","Colubridae",40000,"",[["Serpentes","suborder"]]],
  ["Tagpfauenauge","Aglais io","🦋","ins","Lepidoptera","Nymphalidae",200000,"",[["Papilionoidea","superfamily"]]],
  ["Kleiner Fuchs","Aglais urticae","🦋","ins","Lepidoptera","Nymphalidae",130000,"",[["Papilionoidea","superfamily"]]],
  ["Zitronenfalter","Gonepteryx rhamni","🦋","ins","Lepidoptera","Pieridae",90000,"",[["Papilionoidea","superfamily"]]],
  ["Admiral","Vanessa atalanta","🦋","ins","Lepidoptera","Nymphalidae",210000,"",[["Papilionoidea","superfamily"]]],
  ["Siebenpunkt-Marienkäfer","Coccinella septempunctata","🐞","ins","Coleoptera","Coccinellidae",160000],
  ["Hirschkäfer","Lucanus cervus","🪲","ins","Coleoptera","Lucanidae",14000],
  ["Feldmaikäfer","Melolontha melolontha","🪲","ins","Coleoptera","Scarabaeidae",20000],
  ["Westliche Honigbiene","Apis mellifera","🐝","ins","Hymenoptera","Apidae",700000,"",[["Anthophila","epifamily"]]],
  ["Dunkle Erdhummel","Bombus terrestris","🐝","ins","Hymenoptera","Apidae",160000,"",[["Anthophila","epifamily"]]],
  ["Steinhummel","Bombus lapidarius","🐝","ins","Hymenoptera","Apidae",50000,"",[["Anthophila","epifamily"]]],
  ["Rote Waldameise","Formica rufa","🐜","ins","Hymenoptera","Formicidae",12000],
  ["Feuerwanze","Pyrrhocoris apterus","🪳","ins","Hemiptera","Pyrrhocoridae",60000,"",[["Heteroptera","suborder"]]],
  ["Blaugrüne Mosaikjungfer","Aeshna cyanea","🪽","ins","Odonata","Aeshnidae",35000],
  ["Gebänderte Prachtlibelle","Calopteryx splendens","🪽","ins","Odonata","Calopterygidae",60000],
  ["Grünes Heupferd","Tettigonia viridissima","🦗","ins","Orthoptera","Tettigoniidae",40000],
  ["Hain-Schwebfliege","Episyrphus balteatus","🪰","ins","Diptera","Syrphidae",90000],
  ["Garten-Kreuzspinne","Araneus diadematus","🕷️","arach","Araneae","Araneidae",80000],
  ["Weinbergschnecke","Helix pomatia","🐌","gast","Stylommatophora","Helicidae",40000],
  ["Hain-Bänderschnecke","Cepaea nemoralis","🐌","gast","Stylommatophora","Helicidae",70000],
  ["Gänseblümchen","Bellis perennis","🌼","dik","Asterales","Asteraceae",140000],
  ["Gewöhnlicher Löwenzahn","Taraxacum officinale","🌼","dik","Asterales","Asteraceae",450000],
  ["Gewöhnliche Schafgarbe","Achillea millefolium","🌼","dik","Asterales","Asteraceae",350000],
  ["Große Brennnessel","Urtica dioica","🌿","dik","Rosales","Urticaceae",200000],
  ["Spitzwegerich","Plantago lanceolata","🌿","dik","Lamiales","Plantaginaceae",180000],
  ["Buschwindröschen","Anemone nemorosa","🌸","dik","Ranunculales","Ranunculaceae",70000],
  ["Scharbockskraut","Ficaria verna","🌼","dik","Ranunculales","Ranunculaceae",90000],
  ["Rotklee","Trifolium pratense","🌸","dik","Fabales","Fabaceae",230000],
  ["Hundsrose","Rosa canina","🌹","dik","Rosales","Rosaceae",45000,"S"],
  ["Schwarzer Holunder","Sambucus nigra","🫐","dik","Dipsacales","Viburnaceae",110000,"S"],
  ["Rotbuche","Fagus sylvatica","🌳","dik","Fagales","Fagaceae",60000,"B"],
  ["Stieleiche","Quercus robur","🌳","dik","Fagales","Fagaceae",150000,"B"],
  ["Hänge-Birke","Betula pendula","🌳","dik","Fagales","Betulaceae",80000,"B"],
  ["Bergahorn","Acer pseudoplatanus","🍁","dik","Sapindales","Sapindaceae",90000,"B"],
  ["Gemeine Fichte","Picea abies","🌲","nadel","Pinales","Pinaceae",50000,"B"],
  ["Waldkiefer","Pinus sylvestris","🌲","nadel","Pinales","Pinaceae",60000,"B"],
  ["Gemeiner Efeu","Hedera helix","🍃","dik","Apiales","Araliaceae",200000,"K"],
  ["Weiße Seerose","Nymphaea alba","🪷","dik","Nymphaeales","Nymphaeaceae",15000,"W"],
  ["Rundblättriger Sonnentau","Drosera rotundifolia","🪤","dik","Caryophyllales","Droseraceae",25000],
  ["Kleines Schneeglöckchen","Galanthus nivalis","🌷","mono","Asparagales","Amaryllidaceae",30000,"Z"],
  ["Breitblättriges Knabenkraut","Dactylorhiza majalis","🪻","mono","Asparagales","Orchidaceae",9000],
  ["Wiesen-Knäuelgras","Dactylis glomerata","🌾","mono","Poales","Poaceae",80000],
  ["Gewöhnlicher Wurmfarn","Dryopteris filix-mas","☘️","farn","Polypodiales","Dryopteridaceae",30000],
  ["Goldenes Frauenhaarmoos","Polytrichum commune","🍀","moos","Polytrichales","Polytrichaceae",15000],
  ["Fliegenpilz","Amanita muscaria","🍄","agar","Agaricales","Amanitaceae",90000],
  ["Parasol","Macrolepiota procera","🍄","agar","Agaricales","Agaricaceae",30000],
  ["Hallimasch","Armillaria mellea","🍄","agar","Agaricales","Physalacriaceae",20000],
  ["Steinpilz","Boletus edulis","🍄‍🟫","agar","Boletales","Boletaceae",40000],
  ["Maronen-Röhrling","Imleria badia","🍄‍🟫","agar","Boletales","Boletaceae",25000],
  ["Pfifferling","Cantharellus cibarius","🍄","agar","Cantharellales","Hydnaceae",35000],
  ["Spei-Täubling","Russula emetica","🍄","agar","Russulales","Russulaceae",12000],
  ["Zunderschwamm","Fomes fomentarius","🪵","agar","Polyporales","Polyporaceae",40000],
  ["Schmetterlings-Tramete","Trametes versicolor","🪵","agar","Polyporales","Polyporaceae",180000],
  ["Gelbe Wandflechte","Xanthoria parietina","🪨","lecan","Teloschistales","Teloschistaceae",70000]
];

// Kleine, gleichbleibende Nummer aus dem Namen (negativ, damit sie nie mit einer iNaturalist-Nummer verwechselt wird)
const nummer = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return -Math.abs(h || 1); };

export const ARTEN = L.map(([name, sci, zeichen, pfad, ordnung, familie, obs, wu = "", extra = []]) => {
  const anc = P[pfad].split("/").map((n, i) => ({ n, r:R[i] }));
  anc.push({ n:ordnung, r:"order" }, ...extra.map(([n, r]) => ({ n, r })), { n:familie, r:"family" }, { n:sci.split(" ")[0], r:"genus" });
  const tid = nummer(sci);
  return { tid, sci, name, rank:"species", zeichen, art:{ tid, sci, name }, anc, obs, gef:false, eing:false, foto:null, wu };
});
export const ART_SCI = Object.fromEntries(ARTEN.map(a => [a.sci, a]));

// Für die Schnellauswahl auf der Startseite: nach Bereichen
export const SCHNELL = [
  ["Vögel", ["Amsel","Kohlmeise","Blaumeise","Rotkehlchen","Haussperling","Elster","Stockente","Mäusebussard","Buntspecht","Graureiher","Waldkauz","Eisvogel"]],
  ["Säugetiere", ["Eichhörnchen","Reh","Rotfuchs","Igel","Feldhase","Wildschwein","Dachs","Zwergfledermaus"]],
  ["Amphibien & Reptilien", ["Erdkröte","Grasfrosch","Teichmolch","Feuersalamander","Zauneidechse","Blindschleiche","Ringelnatter"]],
  ["Insekten & Co.", ["Tagpfauenauge","Zitronenfalter","Siebenpunkt-Marienkäfer","Dunkle Erdhummel","Westliche Honigbiene","Feuerwanze","Blaugrüne Mosaikjungfer","Hirschkäfer","Garten-Kreuzspinne","Weinbergschnecke"]],
  ["Pflanzen & Bäume", ["Gänseblümchen","Gewöhnlicher Löwenzahn","Buschwindröschen","Große Brennnessel","Rotklee","Hundsrose","Stieleiche","Rotbuche","Hänge-Birke","Waldkiefer","Gemeiner Efeu","Gewöhnlicher Wurmfarn"]],
  ["Pilze & Flechten", ["Fliegenpilz","Steinpilz","Pfifferling","Parasol","Hallimasch","Schmetterlings-Tramete","Zunderschwamm","Gelbe Wandflechte"]]
].map(([titel, namen]) => [titel, namen.map(n => ARTEN.find(a => a.name === n)).filter(Boolean)]);
