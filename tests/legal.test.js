// Les pages légales existent maintenant à deux endroits : les écrans de l'app
// (src/screens/*Screen.tsx) et des pages statiques atteignables par URL, parce
// qu'App Store Connect réclame une adresse qui s'ouvre seule — un écran enfoui
// dans une application monopage n'en est pas une.
//
// Dupliquer un texte légal, c'est programmer son mensonge : le jour où l'adresse
// de contact ou l'éditeur change dans src/legal.ts, les pages statiques gardent
// l'ancienne valeur sans que personne ne s'en aperçoive. Ces tests font échouer
// le build à ce moment-là, pas six mois plus tard.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');

const PAGES = ['public/confidentialite.html', 'public/mentions-legales.html'];

/** Valeur d'une constante exportée de src/legal.ts, lue à la source. */
function constanteLegale(nom) {
  const legal = lire('src/legal.ts');
  const m = legal.match(new RegExp(`export const ${nom}\\s*=\\s*'([^']+)'`));
  assert.ok(m, `${nom} introuvable dans src/legal.ts`);
  return m[1];
}

test('les pages statiques publient le même contact que src/legal.ts', () => {
  const email = constanteLegale('CONTACT_EMAIL');
  for (const page of PAGES) {
    const html = lire(page);
    assert.ok(html.includes(email), `${page} ne publie pas ${email}`);
    // Une adresse périmée qui traîne est pire qu'une absence : elle donne
    // l'illusion d'un contact joignable. Le domaine kichtapp.fr n'existe pas.
    const mortes = html.match(/[\w.]+@(?!gmail\.com)[\w.]+\.\w+/g) || [];
    const etrangeres = mortes.filter((a) => a !== email);
    assert.deepEqual(etrangeres, [], `${page} publie une autre adresse : ${etrangeres[0]}`);
  }
});

test('les pages statiques nomment le même éditeur que src/legal.ts', () => {
  const editeur = constanteLegale('EDITEUR');
  for (const page of PAGES) {
    assert.ok(lire(page).includes(editeur), `${page} ne nomme pas ${editeur} comme éditeur`);
  }
});

test('les pages statiques portent la date de mise à jour de src/legal.ts', () => {
  const maj = constanteLegale('DERNIERE_MAJ_LEGAL');
  for (const page of PAGES) {
    assert.match(
      lire(page),
      new RegExp(`Dernière mise à jour\\s*:\\s*${maj}`),
      `${page} n'affiche pas « Dernière mise à jour : ${maj} »`,
    );
  }
});

test('les mentions légales statiques déclarent le bon hébergeur', () => {
  // LCEN art. 6 III : le nom et l'adresse de l'hébergeur doivent figurer sur
  // la page publique, pas seulement dans l'app.
  const legal = lire('src/legal.ts');
  const html = lire('public/mentions-legales.html');
  for (const champ of ['nom', 'adresse']) {
    const m = legal.match(new RegExp(`${champ}:\\s*'([^']+)'`));
    assert.ok(m, `HEBERGEUR.${champ} introuvable dans src/legal.ts`);
    assert.ok(html.includes(m[1]), `les mentions légales n'indiquent pas « ${m[1]} »`);
  }
});

test('les pages légales ne chargent rien depuis le réseau', () => {
  // Promettre l'absence de traceur sur une page qui appelle une police ou un
  // script tiers se verrait au premier coup d'œil sur l'onglet Réseau. Ces pages
  // doivent aussi s'afficher intégralement sans JavaScript : c'est ce que
  // vérifie un relecteur App Store qui ouvre l'URL.
  for (const page of PAGES) {
    const html = lire(page);
    assert.doesNotMatch(html, /<script/i, `${page} contient un script`);
    assert.doesNotMatch(html, /\ssrc=/i, `${page} charge une ressource externe`);
    assert.doesNotMatch(html, /@import|url\(/i, `${page} importe une ressource dans son CSS`);
    const liens = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const nonCanoniques = liens.filter((l) => !/rel="canonical"/.test(l));
    assert.deepEqual(nonCanoniques, [], `${page} déclare un <link> autre que canonical`);
  }
});

test('les pages légales sont lisibles et indexables telles quelles', () => {
  for (const page of PAGES) {
    const html = lire(page);
    assert.match(html, /<html lang="fr">/, `${page} ne déclare pas lang="fr"`);
    assert.match(html, /<title>[^<]{10,}<\/title>/, `${page} n'a pas de titre`);
    assert.match(html, /<meta\s+name="description"/, `${page} n'a pas de méta description`);
    assert.match(html, /href="\/"/, `${page} n'a pas de lien de retour vers l'app`);
  }
});

test('le sitemap et robots.txt exposent les deux pages légales', () => {
  // Une page absente du sitemap reste atteignable, mais personne ne la trouve —
  // et c'est l'URL qu'on donne à App Store Connect.
  const sitemap = lire('public/sitemap.xml');
  const robots = lire('public/robots.txt');
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, 'robots.txt interdit tout le site');
  for (const page of PAGES) {
    const nom = path.basename(page);
    assert.ok(sitemap.includes(`/${nom}`), `sitemap.xml ne liste pas ${nom}`);
    assert.ok(robots.includes(`/${nom}`), `robots.txt ne mentionne pas ${nom}`);
  }
});
