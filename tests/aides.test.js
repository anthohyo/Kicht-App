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
