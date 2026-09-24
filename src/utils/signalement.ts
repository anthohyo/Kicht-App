import { CONTACT_EMAIL } from '../legal';

/**
 * Signalement d'une information erronée, depuis l'aide concernée.
 *
 * Toute la promesse de l'app tient à une chose : les montants affichés sont
 * vrais et datés. Or les barèmes locaux changent en cours d'année, et personne
 * ici ne peut surveiller 31 aides en continu. Ce sont les utilisateurs qui
 * voient l'erreur en premier — encore faut-il qu'ils puissent la dire en un
 * geste, depuis l'écran où ils l'ont vue, et pas via un lien enterré dans les
 * mentions légales.
 *
 * Aucun serveur : le message part par la messagerie de l'appareil, et
 * l'utilisateur voit exactement ce qu'il envoie avant d'appuyer sur envoyer.
 */

export interface Signalement {
  /** Nom de l'aide tel qu'il est affiché à l'écran. */
  aide: string;
  /** Montant affiché, pour comparer sans avoir à redemander. */
  montantAffiche?: string;
  ville?: string;
  departement?: string;
  /** Date de dernière vérification affichée, au format ISO. */
  verifieLe?: string;
}

/**
 * Corps du message. Volontairement limité à ce qui sert à vérifier : l'aide, le
 * montant, la ville. Ni revenus, ni loyer, ni prénom — un signalement ne doit
 * pas obliger quelqu'un à livrer sa situation financière pour rendre service.
 */
export function corpsSignalement(s: Signalement, version: string): string {
  const lignes = [
    'Bonjour,',
    '',
    'Une information de KichtApp me semble fausse.',
    '',
    `Aide : ${s.aide}`,
  ];
  if (s.montantAffiche) lignes.push(`Montant affiché : ${s.montantAffiche}`);
  if (s.ville) lignes.push(`Ville : ${s.ville}${s.departement ? ` (${s.departement})` : ''}`);
  if (s.verifieLe) lignes.push(`Vérifié le : ${s.verifieLe}`);
  lignes.push(
    '',
    '— Ce qui ne va pas (une phrase suffit, même approximative) :',
    '',
    '',
    '— Le lien officiel, si tu l\'as sous la main :',
    '',
    '',
    'Merci : c\'est vérifié à la source, corrigé pour tout le monde, et la date de',
    'vérification est mise à jour.',
    '',
    `KichtApp ${version}`,
  );
  return lignes.join('\n');
}

export function objetSignalement(s: Signalement): string {
  return `KichtApp — information erronée : ${s.aide}`;
}

/** Lien mailto prêt à ouvrir. */
export function lienSignalement(s: Signalement, version: string): string {
  const objet = encodeURIComponent(objetSignalement(s));
  const corps = encodeURIComponent(corpsSignalement(s, version));
  return `mailto:${CONTACT_EMAIL}?subject=${objet}&body=${corps}`;
}
