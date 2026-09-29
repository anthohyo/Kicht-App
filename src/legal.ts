/**
 * Identité de l'éditeur, contact et hébergeur.
 *
 * Tout est réuni ici parce que ces valeurs apparaissent à trois endroits
 * (mentions légales, conditions, confidentialité) : en cas de changement,
 * il ne doit y avoir qu'un seul fichier à corriger, sinon une des trois
 * pages finit par mentir.
 *
 * Note : l'ancienne adresse contact@kichtapp.fr a été retirée le 20/09/2026 —
 * le domaine kichtapp.fr n'est pas enregistré (AFNIC : « NOT FOUND »), donc
 * les messages envoyés à cette adresse n'arrivaient nulle part. Une politique
 * de confidentialité dont le contact ne répond pas n'est pas une politique.
 */

/** Adresse de contact réelle, vérifiée fonctionnelle par l'éditeur. */
export const CONTACT_EMAIL = 'anthony.bayard69@gmail.com';

/** Éditeur et directeur de la publication (LCEN art. 6 III). */
export const EDITEUR = 'Anthony Bayard';

/** Hébergeur — source : conditions d'utilisation de Netlify, section 14. */
export const HEBERGEUR = {
  nom: 'Netlify, Inc.',
  adresse: '101 2nd Street, San Francisco, CA 94105-2239, États-Unis',
  site: 'https://www.netlify.com',
};

export const SITE_URL = 'https://kichtappv2.netlify.app';

/**
 * Version affichée dans les signalements d'erreur, pour savoir à quelle version
 * correspond un montant contesté. Doit rester alignée sur app.json — un test
 * échoue sinon.
 */
export const VERSION_APP = '1.0.0';

/**
 * Formulaire d'inscription à « La lettre du Parrain », hébergé par Brevo.
 *
 * VIDE tant que le formulaire n'existe pas. Dans ce cas l'app n'affiche aucun
 * point d'inscription, et la politique de confidentialité continue d'affirmer —
 * à juste titre — qu'aucune adresse e-mail n'est demandée. Dès qu'une adresse
 * est renseignée ici, le bouton apparaît et les textes légaux changent avec lui.
 *
 * N'y mettre QUE l'adresse publique du formulaire, jamais une clé d'API : tout
 * ce qui est dans l'app peut en être extrait, et une clé Brevo permettrait
 * d'écrire à toute la liste. Un test refuse tout ce qui ressemble à une clé.
 */
export const NEWSLETTER_URL = '';

export function newsletterActive(): boolean {
  return NEWSLETTER_URL.startsWith('https://');
}

/** Date de la dernière révision des textes légaux, affichée en bas de chaque page. */
export const DERNIERE_MAJ_LEGAL = '20 septembre 2026';

/** Lien « écrire à l'éditeur » avec un objet pré-rempli. */
export function mailto(objet: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`KichtApp — ${objet}`)}`;
}
