// Sauvegarde et restauration : la validation protège contre l'écrasement des données.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { construireSauvegarde, lireSauvegarde, nomFichier } = require('../.test-build/src/utils/sauvegarde.js');

const profil = { firstName: 'Léo', onboardingComplete: true, claudeApiKey: 'sk-ant-secret', status: 'etudiant' };
const stockage = [
  ['@kichtapp_profile', JSON.stringify(profil)],
  ['@kichtapp_checklist', '[{"id":"visale","checked":true}]'],
  ['@kichtapp_pending_chat', 'message en attente'],
  ['@kichtapp_rappels_actifs', 'true'],
  ['autre_app_cle', 'ne doit pas partir'],
  ['@kichtapp_vide', null],
];
const maintenant = new Date(2026, 8, 17, 10);

test('la sauvegarde ne contient jamais la clé API', () => {
  const f = construireSauvegarde(stockage, maintenant);
  assert.doesNotMatch(JSON.stringify(f), /sk-ant-secret/);
  assert.equal(JSON.parse(f.donnees['@kichtapp_profile']).firstName, 'Léo');
});

test("la sauvegarde ignore les autres apps, les états passagers et les réglages de l'appareil", () => {
  const cles = Object.keys(construireSauvegarde(stockage, maintenant).donnees);
  assert.deepEqual(cles.sort(), ['@kichtapp_checklist', '@kichtapp_profile']);
});

test('une sauvegarde relue est identique à celle écrite', () => {
  const f = construireSauvegarde(stockage, maintenant);
  const lu = lireSauvegarde(JSON.stringify(f));
  assert.equal(lu.ok, true);
  assert.deepEqual(lu.fichier.donnees, f.donnees);
  assert.equal(lu.profil.firstName, 'Léo');
});

test('un texte quelconque est refusé avec une explication', () => {
  for (const texte of ['', 'bonjour', '{"app":"autre","donnees":{}}', '[]']) {
    const lu = lireSauvegarde(texte);
    assert.equal(lu.ok, false, texte);
    assert.ok(lu.erreur.length > 10);
  }
});

test('une sauvegarde contenant des clés étrangères est refusée', () => {
  const f = construireSauvegarde(stockage, maintenant);
  f.donnees['cle_etrangere'] = 'x';
  assert.equal(lireSauvegarde(JSON.stringify(f)).ok, false);
});

test("une sauvegarde d'une version future ou sans profil complet est refusée", () => {
  const f = construireSauvegarde(stockage, maintenant);
  assert.equal(lireSauvegarde(JSON.stringify({ ...f, version: 99 })).ok, false);
  const sansProfil = construireSauvegarde([['@kichtapp_checklist', '[]']], maintenant);
  assert.equal(lireSauvegarde(JSON.stringify(sansProfil)).ok, false);
});

test('le nom de fichier est daté et triable', () => {
  assert.equal(nomFichier(maintenant), 'kichtapp-sauvegarde-2026-09-17.json');
});
