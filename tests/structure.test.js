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

/** Balises ouvrantes <Nom ...> en suivant accolades et chaînes : les props contiennent des « => ». */
function balisesOuvrantes(code, nom) {
  const res = [];
  let i = 0;
  while ((i = code.indexOf(`<${nom}`, i)) !== -1) {
    let j = i + nom.length + 1;
    if (/[A-Za-z0-9]/.test(code[j] ?? '')) { i = j; continue; }
    let profondeur = 0;
    let chaine = null;
    for (; j < code.length; j++) {
      const c = code[j];
      if (chaine) {
        if (c === '\\') { j++; continue; }
        if (c === chaine) chaine = null;
      } else if (c === '"' || c === "'" || c === '`') chaine = c;
      else if (c === '{') profondeur++;
      else if (c === '}') profondeur--;
      else if (c === '>' && profondeur === 0) break;
    }
    const balise = code.slice(i, j + 1);
    res.push({ debut: i, fin: j + 1, balise, autoFermante: code[j - 1] === '/' });
    i = j;
  }
  return res;
}

test('chaque élément tactile est annoncé aux lecteurs d\'écran', () => {
  // Sans rôle, un lecteur d'écran lit un texte sans dire qu'on peut appuyer dessus ;
  // sans étiquette, un bouton « ✕ » ou « + » est simplement lu « croix » ou « plus ».
  const sansRole = [];
  const iconeSansEtiquette = [];
  const sources = [...fichiers('src/screens'), ...fichiers('src/components'), 'src/navigation/TabNavigator.tsx', 'src/navigation/RootNavigator.tsx'];
  for (const f of sources) {
    const code = lire(f);
    for (const nom of ['TouchableOpacity', 'Pressable']) {
      for (const { debut, fin, balise, autoFermante } of balisesOuvrantes(code, nom)) {
        const ligne = code.slice(0, debut).split('\n').length;
        if (!/\brole=/.test(balise)) sansRole.push(`${f}:${ligne}`);
        if (/aria-label=/.test(balise)) continue;
        if (autoFermante) { iconeSansEtiquette.push(`${f}:${ligne}`); continue; }
        const contenu = code.slice(fin, code.indexOf(`</${nom}>`, fin));
        // Contenu complet des <Text> : texte fixe, valeur dynamique, ou mélange des deux.
        const textes = [...contenu.matchAll(/<Text[^>]*>([\s\S]*?)<\/Text>/g)].map((t) => t[1]);
        const lisible = textes.some((t) => /[A-Za-zÀ-ÿ]{2,}/.test(t.replace(/\{[^}]*\}/g, '')) || /\{[^}]*\}/.test(t));
        if (!lisible) iconeSansEtiquette.push(`${f}:${ligne}`);
      }
    }
  }
  assert.deepEqual(sansRole, [], `sans role : ${sansRole.join(', ')}`);
  assert.deepEqual(iconeSansEtiquette, [], `bouton-icône sans étiquette : ${iconeSansEtiquette.join(', ')}`);
  // accessibilityState et accessibilityRole sont ignorés ou dépréciés sur le web : ils
  // n'atteignent jamais un lecteur d'écran dans la version en ligne.
  const anciennesProps = sources.filter((f) => /accessibility(State|Role|Label)=/.test(lire(f)));
  assert.deepEqual(anciennesProps, [], `anciennes props d'accessibilité : ${anciennesProps.join(', ')}`);
});
