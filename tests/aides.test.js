// Non-régression du moteur d'aides et des données locales.
// Lancer avec : npm test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { simulerAides, DERNIERE_MAJ_BAREMES } = require('../.test-build/src/data/aidesData.js');
const { getAidesLocales, AIDES_LOCALES } = require('../.test-build/src/data/aidesLocales.js');

const base = { age: 20, onboardingComplete: true, primaryGoal: 'aides', claimedAids: [] };
const depenses = (loyer = 0, autres = {}) => ({
  loyer, abonnements: 0, electricite: 0, courses: 0, transport: 0, sorties: 0, ...autres,
});

const VILLES = [
  ['Paris', '75', 'Île-de-France'], ['Lyon', '69', 'Auvergne-Rhône-Alpes'],
  ['Marseille', '13', "Provence-Alpes-Côte d'Azur"], ['Bordeaux', '33', 'Nouvelle-Aquitaine'],
  ['Toulouse', '31', 'Occitanie'], ['Montpellier', '34', 'Occitanie'], ['Lille', '59', 'Hauts-de-France'],
  ['Rennes', '35', 'Bretagne'], ['Nantes', '44', 'Pays de la Loire'], ['Strasbourg', '67', 'Grand Est'],
  ['Amiens', '80', 'Hauts-de-France'], ['Nice', '06', "Provence-Alpes-Côte d'Azur"], ['Reims', '51', 'Grand Est'],
];
const STATUTS = ['etudiant', 'apprenti', 'salarie', 'recherche_emploi', 'service_civique', 'auto_entrepreneur'];

// Profils types : chacun a été construit pour déclencher une branche différente du moteur.
const PROFILS = [
  { firstName: 'Léo', age: 18, status: 'etudiant', schoolType: 'public', housingType: 'futur', monthlySalary: 0, expenses: depenses(520), ville: 'Lyon', departement: '69', region: 'Auvergne-Rhône-Alpes' },
  { firstName: 'Yasmine', age: 20, status: 'apprenti', housingType: 'coloc', monthlySalary: 950, expenses: depenses(400, { courses: 200 }), ville: 'Lille', departement: '59', region: 'Hauts-de-France' },
  { firstName: 'Malik', age: 23, status: 'recherche_emploi', housingType: 'parents', monthlySalary: 0, expenses: depenses(0, { courses: 60 }), ville: 'Marseille', departement: '13', region: "Provence-Alpes-Côte d'Azur" },
  { firstName: 'Camille', age: 22, status: 'etudiant', schoolType: 'prive_non_reconnu', housingType: 'crous', monthlySalary: 400, expenses: depenses(280, { courses: 150 }), ville: 'Toulouse', departement: '31', region: 'Occitanie' },
  { firstName: 'Sofiane', age: 26, status: 'auto_entrepreneur', housingType: 'seul', monthlySalary: 1350, expenses: depenses(600), ville: 'Bordeaux', departement: '33', region: 'Nouvelle-Aquitaine' },
  { firstName: 'Inès', age: 21, status: 'service_civique', housingType: 'foyer', monthlySalary: 620, expenses: depenses(250), ville: 'Rennes', departement: '35', region: 'Bretagne' },
  { firstName: 'Thomas', age: 24, status: 'salarie', housingType: 'seul', monthlySalary: 1750, expenses: depenses(650), ville: 'Nantes', departement: '44', region: 'Pays de la Loire' },
  { firstName: 'Nadia', age: 19, status: 'etudiant', schoolType: 'prive_reconnu', housingType: 'coloc', monthlySalary: 0, expenses: depenses(350), ville: 'Strasbourg', departement: '67', region: 'Grand Est' },
  { firstName: 'Hugo', age: 31, status: 'salarie', housingType: 'seul', monthlySalary: 2100, expenses: depenses(750), ville: 'Paris', departement: '75', region: 'Île-de-France' },
].map((p) => ({ ...base, ...p }));

const moisEntre = (isoA, dateB) => {
  const a = new Date(isoA);
  return (dateB.getFullYear() - a.getFullYear()) * 12 + (dateB.getMonth() - a.getMonth());
};

test('chaque ville couverte propose au moins une aide locale, quel que soit le statut', () => {
  const vides = [];
  for (const [ville, dep, region] of VILLES) {
    for (const statut of STATUTS) {
      if (getAidesLocales(ville.toLowerCase(), dep, region, statut).length === 0) vides.push(`${ville} · ${statut}`);
    }
  }
  assert.deepEqual(vides, [], `combinaisons sans aucune aide locale : ${vides.join(', ')}`);
});

test('aucun profil ne fait planter le moteur', () => {
  for (const p of PROFILS) assert.doesNotThrow(() => simulerAides(p), p.firstName);
});

test('aucune aide annoncée éligible sans montant affiché', () => {
  for (const p of PROFILS) {
    const sansMontant = simulerAides(p).filter((a) => a.eligible === 'oui' && !a.montantEstime).map((a) => a.name);
    assert.deepEqual(sansMontant, [], `${p.firstName} : ${sansMontant.join(', ')}`);
  }
});

test('aucune aide locale affichée sans source officielle datée', () => {
  const nonSourcees = AIDES_LOCALES.filter((a) => !a.aVerifier && !(a.source && a.verifieLe)).map((a) => a.id);
  assert.deepEqual(nonSourcees, []);
});

test('aucune vérification de plus de 12 mois — les montants changent chaque année', () => {
  const maintenant = new Date();
  assert.ok(moisEntre(DERNIERE_MAJ_BAREMES, maintenant) < 12, `barèmes nationaux vérifiés le ${DERNIERE_MAJ_BAREMES} : à revérifier`);
  const perimees = AIDES_LOCALES.filter((a) => !a.aVerifier && a.verifieLe && moisEntre(a.verifieLe, maintenant) >= 12)
    .map((a) => `${a.id} (${a.verifieLe})`);
  assert.deepEqual(perimees, [], `aides locales à revérifier : ${perimees.join(', ')}`);
});

test("une aide supprimée ne réapparaît pas : l'aide de 500 € au permis des apprentis", () => {
  const yasmine = PROFILS.find((p) => p.status === 'apprenti');
  const permis = simulerAides(yasmine).find((a) => a.id === 'permis');
  assert.ok(!permis || !/500 € \(automatique\)/.test(permis.montantEstime ?? ''));
});

test("l'APL d'un étudiant signale la restriction des étudiants hors UE (1er juillet 2026)", () => {
  const leo = PROFILS[0];
  const apl = simulerAides(leo).find((a) => a.id === 'apl');
  assert.match(apl.description + apl.conditions.join(' '), /Union européenne|hors UE/);
});

test('les seuils indexés sur le SMIC du 1er juin 2026 sont appliqués', () => {
  const yasmine = PROFILS.find((p) => p.status === 'apprenti');
  const mobili = simulerAides({ ...yasmine, monthlySalary: 2220 }).find((a) => a.id === 'mobili-jeune');
  assert.equal(mobili.eligible, 'oui', 'Mobili-Jeune : plafond à 120 % du SMIC brut, soit 2 240 €');
  const prime = simulerAides({ ...PROFILS[0], housingType: 'seul', monthlySalary: 1100 }).find((a) => a.id === 'prime-activite');
  assert.equal(prime.eligible, 'non', "prime d'activité étudiant : revenu minimum 1 144,21 €");
});

test('le Contrat d\'Engagement Jeune est proposé à un jeune sans emploi', () => {
  const malik = PROFILS.find((p) => p.status === 'recherche_emploi');
  assert.ok(simulerAides(malik).some((a) => a.id === 'cej' && a.eligible === 'oui'));
});

test('le remboursement transport par l\'employeur n\'est promis qu\'à qui a un employeur', () => {
  const malik = PROFILS.find((p) => p.status === 'recherche_emploi');
  const transport = simulerAides(malik).find((a) => a.id === 'transport');
  assert.doesNotMatch(transport.name, /employeur/);
});

// Une base de 41 grandes villes laissait invisible toute personne habitant
// ailleurs : à Gentilly (20 000 habitants, collée à Paris), l'app répondait
// « Aucune ville trouvée » et n'affichait plus aucune aide locale, alors que
// le Val-de-Marne et l'Île-de-France en proposent.
const { detectGeo } = require('../.test-build/src/data/geoFrance.js');

test('une commune quelconque est résolue avec son vrai département', () => {
  const gentilly = detectGeo('Gentilly');
  assert.deepEqual(
    { ville: gentilly.ville, departement: gentilly.departement, region: gentilly.region },
    { ville: 'Gentilly', departement: '94', region: 'Île-de-France' }
  );
  // Surtout pas de rattachement automatique à la grande ville voisine : Gentilly
  // n'est pas dans le 75, et les aides propres à la Ville de Paris n'y ouvrent pas droit.
  assert.notEqual(gentilly.departement, '75');
  assert.equal(detectGeo('94250').ville, 'Gentilly');
  assert.equal(detectGeo('Le Kremlin-Bicêtre').departement, '94');
  assert.equal(detectGeo('Villeurbanne').departement, '69');
});

test('les arrondissements et les grandes villes restent correctement détectés', () => {
  assert.equal(detectGeo('75014').ville, 'Paris');
  assert.equal(detectGeo('Paris').departement, '75');
  assert.equal(detectGeo('69003').ville, 'Lyon');
  assert.equal(detectGeo('Marseille').region, 'Provence-Alpes-Côte d\'Azur');
});

test('une saisie qui ne désigne aucune commune ne renvoie pas une ville au hasard', () => {
  assert.equal(detectGeo('xyzabc'), null);
  assert.equal(detectGeo('12345'), null);
  assert.equal(detectGeo(''), null);
});

test('les communes homonymes sont signalées plutôt que tranchées en silence', () => {
  const sainteMarie = detectGeo('Sainte-Marie');
  assert.ok(sainteMarie.homonymes > 1, 'Sainte-Marie devrait être signalée comme ambiguë');
  assert.equal(detectGeo('Gentilly').homonymes, 1);
});

// Le forfait Imagine R couvre toute l'Île-de-France : restreint à Paris, il
// disparaissait pour un étudiant de Gentilly, qui y a pourtant droit.
test('un étudiant francilien hors Paris voit le Pass Navigo', () => {
  const geo = detectGeo('Gentilly');
  const aides = getAidesLocales(geo.ville, geo.departement, geo.region, 'etudiant');
  const ids = aides.map((a) => a.id);
  assert.ok(ids.includes('navigo-imagine-r'), `Pass Navigo absent pour Gentilly (aides : ${ids.join(', ') || 'aucune'})`);
  // …mais pas les aides réservées aux Parisiens.
  assert.ok(!ids.includes('faj-paris'), 'le FAJ de Paris ne doit pas apparaître dans le 94');
  assert.ok(!ids.includes('aide-urgence-crous-paris'), 'le CROUS de Paris ne couvre pas le Val-de-Marne');
});

// Les réseaux de transport suivent le ressort d'une métropole, pas un département.
// Rattachés au département, ils s'affichaient à Villefranche-sur-Saône ou à
// Dunkerque, que ces réseaux ne desservent pas — et l'app envoyait des jeunes
// demander un abonnement qui n'existe pas chez eux.
const transportDe = (saisie) => {
  const g = detectGeo(saisie);
  if (!g) return null;
  return getAidesLocales(g.ville, g.departement, g.region, 'etudiant')
    .filter((a) => a.epcis && a.epcis.length)
    .map((a) => a.id);
};

test('une aide de métropole couvre toutes ses communes', () => {
  assert.deepEqual(transportDe('Villeurbanne'), ['tcl-tarif-reduit']);
  assert.deepEqual(transportDe('Vénissieux'), ['tcl-tarif-reduit']);
  assert.deepEqual(transportDe('Saint-Herblain'), ['naolib-jeune']);
  assert.deepEqual(transportDe('Roubaix'), ['carte-avantage-mel']);
});

test('une aide de métropole ne déborde pas sur le reste du département', () => {
  // Contrôle par identifiant, et non sur les seules aides intercommunales :
  // sinon un retour à une portée départementale passerait inaperçu ici.
  const idsDe = (saisie) => {
    const g = detectGeo(saisie);
    return g ? getAidesLocales(g.ville, g.departement, g.region, 'etudiant').map((a) => a.id) : [];
  };
  // Même département que Lyon, mais hors Métropole de Lyon : pas de réseau TCL.
  assert.ok(!idsDe('Villefranche-sur-Saône').includes('tcl-tarif-reduit'));
  // Nord, mais réseau DK'Bus et non ilévia.
  assert.ok(!idsDe('Dunkerque').includes('carte-avantage-mel'));
  // Loire-Atlantique, hors Nantes Métropole.
  assert.ok(!idsDe('Ancenis-Saint-Géréon').includes('naolib-jeune'));
  // Hérault, hors Montpellier Méditerranée Métropole.
  assert.ok(!idsDe('Béziers').includes('tam-etudiant'));
});

test('chaque aide intercommunale cible une intercommunalité réellement connue', () => {
  const connues = new Set();
  for (const ligne of require('../.test-build/src/data/communes.js').COMMUNES_BRUT.split('~')) {
    const epci = ligne.split('|')[4];
    if (epci) connues.add(epci);
  }
  for (const aide of AIDES_LOCALES.filter((a) => a.epcis && a.epcis.length)) {
    for (const code of aide.epcis) {
      assert.ok(connues.has(code), `${aide.id} vise l'intercommunalité ${code}, absente des communes`);
    }
    // Sinon le filtre par intercommunalité serait court-circuité par le département.
    assert.ok(!aide.departements, `${aide.id} garde une portée départementale qui annule son périmètre`);
    assert.ok(!aide.villes, `${aide.id} garde une portée communale qui annule son périmètre`);
  }
});
