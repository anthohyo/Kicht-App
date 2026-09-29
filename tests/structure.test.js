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

// Le signalement d'erreur est le seul mécanisme par lequel un montant périmé
// remonte : sans lui, l'app affirme des chiffres que plus personne ne surveille.
test('le signalement n\'expose que ce qui sert à vérifier', () => {
  const { corpsSignalement, lienSignalement, objetSignalement } = require('../.test-build/src/utils/signalement.js');
  const s = {
    aide: 'Abonnement TCL 18-25 ans',
    montantAffiche: '26 €/mois',
    ville: 'Villeurbanne',
    departement: '69',
    verifieLe: '2026-09-17',
  };
  const corps = corpsSignalement(s, '1.0.0');
  for (const attendu of ['Abonnement TCL 18-25 ans', '26 €/mois', 'Villeurbanne', '69', '2026-09-17', '1.0.0']) {
    assert.ok(corps.includes(attendu), `le signalement omet ${attendu}`);
  }
  // Un signalement ne doit jamais obliger à livrer sa situation financière.
  for (const interdit of ['salaire', 'revenu', 'loyer', 'prénom', 'âge']) {
    assert.ok(!corps.toLowerCase().includes(interdit), `le signalement contient « ${interdit} »`);
  }
  // Le lien doit rester ouvrable : objet et corps encodés, adresse réelle.
  const lien = lienSignalement(s, '1.0.0');
  assert.match(lien, /^mailto:[^?]+@[^?]+\?subject=/);
  assert.ok(!/\s/.test(lien), 'lien mailto non encodé');
  assert.ok(objetSignalement(s).includes(s.aide));
});

// La version sert à savoir à quelle build correspond un montant contesté :
// désalignée, elle envoie sur une fausse piste.
test('la version affichée dans les signalements suit celle de app.json', () => {
  const { VERSION_APP } = require('../.test-build/src/legal.js');
  const { expo } = JSON.parse(lire('app.json'));
  assert.equal(VERSION_APP, expo.version);
});

// Un bouton de signalement sans aide à signaler ne sert à rien : il doit être
// posé sur les deux familles d'aides, nationales et locales.
test('chaque famille d\'aides porte un bouton de signalement', () => {
  const ecran = lire('src/screens/AidesScreen.tsx');
  assert.ok(ecran.includes('BoutonSignaler'), 'aucun bouton de signalement sur l\'écran des aides');
  assert.equal((ecran.match(/<BoutonSignaler/g) || []).length, 2, 'les aides nationales ET locales doivent en porter un');
});

// Apple refuse les applications contenant des fonctions non opérationnelles
// (App Store Review Guidelines, 2.1 et 2.2). Le profil affichait « Fonctionnalité
// disponible prochainement » au toucher de la photo : soit une fonction marche,
// soit elle n'est pas proposée.
test('aucun écran ne promet une fonctionnalité qui n\'existe pas', () => {
  const promesses = /disponible prochainement|bientôt disponible|fonctionnalité à venir|coming soon|en cours de développement/i;
  for (const f of [...fichiers('src/screens'), ...fichiers('src/components')]) {
    assert.doesNotMatch(sansCommentaires(lire(f)), promesses, `${f} annonce une fonctionnalité factice`);
  }
});

// La lettre du Parrain passe par un formulaire hébergé par Brevo. La seule
// chose à renseigner dans l'app est l'adresse PUBLIQUE de ce formulaire : une
// clé d'API y serait extractible par n'importe qui, qui pourrait alors écrire
// à toute la liste d'abonnés.
test('la configuration de la newsletter ne contient jamais de clé', () => {
  const { NEWSLETTER_URL } = require('../.test-build/src/legal.js');
  assert.ok(NEWSLETTER_URL === '' || /^https:\/\/\S+$/.test(NEWSLETTER_URL),
    'NEWSLETTER_URL doit être vide ou une adresse https');
  assert.doesNotMatch(NEWSLETTER_URL, /xkeysib|xsmtpsib|api[-_]?key|token|secret/i,
    'NEWSLETTER_URL ressemble à une clé d\'API');
});

// Tant que la lettre n'existe pas, la confidentialité doit rester absolue ;
// dès qu'elle existe, elle doit être expliquée. Les deux états dépendent du
// même interrupteur, pour qu'ils ne puissent pas diverger.
test('les textes de confidentialité suivent l\'état réel de la newsletter', () => {
  const ecran = lire('src/screens/ConfidentialiteScreen.tsx');
  assert.match(ecran, /newsletterActive\(\)\s*\?[\s\S]*?:\s*'Aucun compte, aucune inscription, aucune adresse e-mail demandée\.'/,
    'la promesse « aucune adresse e-mail » doit dépendre de newsletterActive()');
  assert.match(ecran, /newsletterActive\(\) && \([\s\S]*?La lettre du Parrain/,
    'la section consacrée à la lettre doit n\'apparaître que si elle est active');
  // Le point d'inscription ne s'affiche pas tant que le formulaire n'existe pas.
  assert.match(lire('src/components/InscriptionLettre.tsx'), /if \(!newsletterActive\(\)\) return null;/);
});

// Visale est la garantie d'Action Logement, et non de l'État. L'app l'a
// présentée comme « caution gratuite de l'État » à six endroits : une erreur
// d'attribution qui aurait pu envoyer un jeune chercher le mauvais guichet.
test('Visale n\'est jamais attribuée à l\'État', () => {
  for (const f of [...fichiers('src/screens'), 'src/data/aidesData.ts', 'src/data/parcours.ts', 'src/utils/parrainAI.ts']) {
    const code = sansCommentaires(lire(f));
    for (const phrase of code.match(/[^.\n]*Visale[^.\n]*/g) || []) {
      assert.doesNotMatch(phrase, /de l\\?'État/, `${f} attribue Visale à l'État : « ${phrase.trim().slice(0, 80)} »`);
    }
  }
  // Le motif lui-même, partout et quelle que soit la casse : la version en
  // majuscules (« Caution GRATUITE de l'État ») avait échappé à un premier test
  // qui ne cherchait que les phrases contenant le mot « Visale ».
  for (const f of [...fichiers('src/screens'), ...fichiers('src/components'),
    'src/data/aidesData.ts', 'src/data/parcours.ts', 'src/data/guides.ts', 'src/utils/parrainAI.ts']) {
    assert.doesNotMatch(sansCommentaires(lire(f)), /caution\s+gratuite\s+de\s+l\\?'État/i,
      `${f} présente une caution gratuite « de l'État »`);
  }
});

// En meublé, le dépôt de garantie peut atteindre deux mois de loyer. L'app
// annonçait « 1 mois (max légal) » sans distinction, alors que beaucoup
// d'étudiants louent meublé.
test('le dépôt de garantie distingue location vide et meublée', () => {
  const parrain = lire('src/utils/parrainAI.ts');
  assert.doesNotMatch(parrain, /1 mois de loyer hors charges \(max légal\)/);
  assert.match(parrain, /2 mois\*\* en meublé/);
});
