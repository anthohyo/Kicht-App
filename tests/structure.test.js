// Cohérence de l'app vue depuis le code source : navigation et questions suggérées.
// Ces défauts ont réellement existé : cinq écrans inaccessibles, et une question
// suggérée au Parrain à laquelle aucune règle ne répondait.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');
const fichiers = (dossier) =>
  fs.readdirSync(path.join(racine, dossier)).filter((f) => f.endsWith('.tsx')).map((f) => `${dossier}/${f}`);

function cibles(code) {
  const out = new Set();
  for (const re of [
    /navigate\(\s*['"](\w+)['"]/g,
    /screen:\s*['"](\w+)['"]/g,
    /key:\s*['"](\w+)['"]/g,
    /navigateTo:\s*['"](\w+)['"]/g,
  ]) {
    for (const m of code.matchAll(re)) out.add(m[1]);
  }
  return out;
}

test('tous les écrans déclarés sont accessibles depuis le parcours principal', () => {
  const routes = [...lire('src/navigation/RootNavigator.tsx').matchAll(/name="(\w+)"/g)].map((m) => m[1]);
  const graphe = new Map();
  for (const f of fichiers('src/screens')) {
    graphe.set(path.basename(f, '.tsx').replace(/Screen$/, ''), cibles(lire(f)));
  }
  const composants = new Set(fichiers('src/components').flatMap((f) => [...cibles(lire(f))]));
  const barre = cibles(lire('src/navigation/TabNavigator.tsx'));
  const onglets = ['Home', 'Aides', 'Budget', 'Chat'];
  const alias = { Main: onglets, SimulateurAides: ['Aides'] };

  const atteints = new Set(['Welcome', 'Onboarding', 'Main', ...onglets]);
  const pile = [...atteints];
  while (pile.length) {
    const ecran = pile.pop();
    let sorties = graphe.get(ecran) ?? new Set();
    if (onglets.includes(ecran)) sorties = new Set([...sorties, ...composants, ...barre]);
    for (const c of sorties) {
      for (const x of alias[c] ?? [c]) {
        if (!atteints.has(x)) { atteints.add(x); pile.push(x); }
      }
    }
  }
  const orphelins = routes.filter((r) => !atteints.has(r));
  assert.deepEqual(orphelins, [], `écrans inaccessibles : ${orphelins.join(', ')}`);
});

test('chaque question suggérée au Parrain a une règle qui y répond', () => {
  const chat = lire('src/screens/ChatScreen.tsx');
  // Les questions sont entre guillemets doubles et contiennent des apostrophes.
  const questions = [...chat.matchAll(/questions\.push\(\s*"([^"]+)"\s*\)/g)].map((m) => m[1]);
  // Questions choisies par un ternaire : les deux branches comptent.
  for (const m of chat.matchAll(/\?\s*"([^"]+\?)"\s*:\s*"([^"]+\?)"/g)) questions.push(m[1], m[2]);
  assert.ok(questions.length >= 5, 'extraction des questions suggérées');

  // On interroge le vrai moteur de réponses, avec sa normalisation des accents,
  // plutôt que de réinterpréter ses mots-clés à la main.
  const { getParrainResponse } = require('../.test-build/src/utils/parrainAI.js');
  const reponseGenerique = getParrainResponse('xqzw', null).text;
  const sansReponse = questions.filter((q) => getParrainResponse(q, null).text === reponseGenerique);
  assert.deepEqual(sansReponse, [], `questions sans règle : ${sansReponse.join(' | ')}`);
});
