/**
 * Génère src/data/communes.ts depuis l'API officielle geo.api.gouv.fr.
 *
 * Pourquoi une base complète plutôt qu'une liste de grandes villes : les aides
 * locales sont attachées à un département ou à une région, pas seulement à une
 * commune. Tant que l'app ne connaissait que 41 villes, un jeune de Gentilly —
 * 19 000 habitants, collé à Paris — ne voyait AUCUNE aide, alors qu'il a droit
 * à celles du Val-de-Marne et de toute l'Île-de-France.
 *
 * Usage : node scripts/generer-communes.js
 * (nécessite un accès réseau ; à relancer quand le découpage administratif change)
 */
const fs = require('fs');
const path = require('path');

const API = 'https://geo.api.gouv.fr';

/**
 * Intercommunalités dont on a besoin pour rattacher une aide à son vrai
 * territoire. Un abonnement de transport n'est ni communal ni départemental :
 * il couvre le ressort de la métropole. Rattaché au département, l'abonnement
 * TCL s'affichait jusqu'à Villefranche-sur-Saône, que le réseau ne dessert pas.
 *
 * Seules ces intercommunalités sont écrites dans le fichier généré : stocker le
 * code EPCI des 34 964 communes ajouterait 350 Ko pour une information dont
 * l'app ne se sert pas.
 */
const EPCI_UTILES = new Set([
  '244400404', // Nantes Métropole — réseau Naolib
  '243300316', // Bordeaux Métropole — réseau TBM
  '200046977', // Métropole de Lyon — réseau TCL
  '243100518', // Toulouse Métropole — réseau Tisséo
  '243400017', // Montpellier Méditerranée Métropole — réseau TaM
  '200093201', // Métropole Européenne de Lille — réseau ilévia
  '246700488', // Eurométropole de Strasbourg — réseau CTS
  // Aix-Marseille-Provence est volontairement absente : la métropole compte
  // plusieurs réseaux (RTM à Marseille, Aix en Bus à Aix), donc l'abonnement
  // RTM ne s'applique pas à ses 92 communes.
]);

async function json(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
}

(async () => {
  const [communes, regions] = await Promise.all([
    json(`${API}/communes?fields=nom,codesPostaux,codeDepartement,codeRegion,population,codeEpci&format=json`),
    json(`${API}/regions`),
  ]);

  const nomRegion = Object.fromEntries(regions.map((r) => [r.code, r.nom]));
  const regionParDept = {};
  for (const c of communes) {
    if (c.codeDepartement && nomRegion[c.codeRegion]) regionParDept[c.codeDepartement] = nomRegion[c.codeRegion];
  }

  const retenues = communes.filter((c) => c.nom && c.codesPostaux && c.codesPostaux.length && c.codeDepartement);
  // Un seul code postal par commune : seules 387 communes en ont plusieurs, et les
  // arrondissements de Paris, Lyon et Marseille sont déjà couverts par GEO_FRANCE.
  // La population sert à départager les homonymes : « Sainte-Marie » désigne
  // une douzaine de communes. À défaut de demander, on retient la plus peuplée,
  // et l'app affiche le département pour que l'utilisateur puisse corriger.
  const table = retenues
    .map((c) => {
      const epci = EPCI_UTILES.has(c.codeEpci) ? c.codeEpci : '';
      return `${c.nom}|${c.codesPostaux[0]}|${c.codeDepartement}|${c.population || 0}|${epci}`;
    })
    .join('~');
  const couvertes = retenues.filter((c) => EPCI_UTILES.has(c.codeEpci)).length;
  console.log(`${couvertes} communes rattachées à une intercommunalité suivie`);

  const sortie = `// Fichier généré par scripts/generer-communes.js — NE PAS ÉDITER À LA MAIN.
// Source : API Découpage administratif, geo.api.gouv.fr (données INSEE).
// ${retenues.length} communes · ${Object.keys(regionParDept).length} départements · généré le ${process.argv[2] || 'date non fournie'}
//
// Format compact « nom|code postal|département|population|intercommunalité », séparé par ~ : un tableau
// d'objets pèserait trois fois plus lourd dans le bundle pour la même information.

export const COMMUNES_BRUT = ${JSON.stringify(table)};

export const REGION_PAR_DEPARTEMENT: Record<string, string> = ${JSON.stringify(regionParDept, null, 2)};
`;

  const cible = path.join(__dirname, '..', 'src', 'data', 'communes.ts');
  fs.writeFileSync(cible, sortie);
  const ko = (Buffer.byteLength(sortie, 'utf8') / 1024).toFixed(0);
  console.log(`${cible} écrit — ${retenues.length} communes, ${ko} Ko`);
})();
