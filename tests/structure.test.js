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

const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

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

// L'âge conditionne six aides (CEJ 16-25, Visale < 31, Mobili-Jeune < 30…).
// Il a longtemps été écrit en dur à 20 ans sans jamais être demandé : un jeune
// de 28 ans se voyait proposer des aides réservées aux moins de 25.
test('l\'âge du profil vient d\'une saisie, jamais d\'une valeur par défaut', () => {
  const onboarding = lire('src/screens/OnboardingScreen.tsx');
  assert.doesNotMatch(onboarding, /age:\s*\d+/, 'âge écrit en dur dans l\'onboarding');
  assert.match(onboarding, /age:\s*parseInt\(age/, 'l\'âge saisi n\'est pas enregistré');
  assert.match(onboarding, /placeholder="Ton âge"/, 'aucun champ ne demande l\'âge');
  // Et il doit rester corrigeable ensuite.
  assert.match(lire('src/screens/ProfileScreen.tsx'), /editAge/, 'âge non modifiable dans le profil');
});

// Une page légale dont l'adresse de contact ne reçoit rien n'est pas une page
// légale : le domaine kichtapp.fr n'a jamais été enregistré (AFNIC : NOT FOUND).
test('aucune adresse de contact morte n\'est publiée', () => {
  for (const f of [...fichiers('src/screens'), 'src/legal.ts']) {
    const mortes = sansCommentaires(lire(f)).match(/[\w.]+@kichtapp\.fr/g) || [];
    assert.equal(mortes.length, 0, `${f} publie ${mortes[0]}, qui n'existe pas`);
  }
});

// Un avis fabriqué présenté comme réel est une pratique commerciale trompeuse.
// L'écran d'accueil en a porté un (« Inès, 22 ans — alternante à Marseille »),
// qui citait en prime l'aide au permis, supprimée en février 2026.
test('l\'accueil ne met en avant aucun témoignage inventé', () => {
  const accueil = lire('src/screens/WelcomeScreen.tsx');
  const guillemets = /❝|«\s*J'ai (découvert|trouvé|économisé)/;
  assert.doesNotMatch(accueil, guillemets, 'témoignage en style direct sur l\'écran d\'accueil');
  // Le chiffre qui le remplace doit porter sa source.
  assert.match(accueil, /Source\s*:/, 'le chiffre affiché n\'est pas sourcé');
});

// Les taux réglementés vieillissent vite : le Livret A est passé de 3 % à 1,7 %
// en trois révisions. Un taux sans date devient faux sans que personne ne le voie.
test('aucune fiche n\'annonce le Livret A à un taux périmé', () => {
  for (const f of ['src/data/guides.ts', 'src/data/premiumGuides.ts']) {
    const code = sansCommentaires(lire(f));
    for (const m of code.matchAll(/Livret A[^.!\n]{0,120}?(\d+(?:[,.]\d+)?)\s*%/g)) {
      assert.equal(m[1].replace('.', ','), '1,7', `${f} annonce le Livret A à ${m[1]} %`);
    }
  }
});

// Recommander des courtiers ou des assureurs nommés relève du conseil en
// investissement, réglementé par l'AMF — et laisse croire à un partenariat.
test('aucune fiche ne recommande un courtier ou un produit commercial nommé', () => {
  const enseignes = /Boursorama|BoursoBank|Fortuneo|Bourse Direct|Hello Bank|Linxea|Yomoni|Trade Republic|Revolut|\bN26\b|BNP|Crédit Agricole|Société Générale/i;
  for (const f of ['src/data/guides.ts', 'src/data/premiumGuides.ts']) {
    // Les lignes « Fondation … » sont écartées : une fondation d'entreprise qui
    // distribue des bourses est une piste de financement, pas un produit à souscrire.
    const code = sansCommentaires(lire(f))
      .split('\n')
      .filter((l) => !/Fondation/.test(l))
      .join('\n');
    assert.doesNotMatch(code, enseignes, `${f} cite une enseigne financière`);
  }
});
