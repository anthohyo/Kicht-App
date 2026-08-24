import { UserProfile } from '../types';

/**
 * KichtApp est entièrement gratuit.
 *
 * Le produit s'adresse à des jeunes dont il vient lui-même de calculer qu'il leur
 * reste parfois moins de zéro à la fin du mois. Faire payer précisément ceux qu'on
 * cherche à aider est une contradiction : chaque euro demandé retire de l'audience,
 * et en retire d'abord les plus en difficulté.
 *
 * Ces fonctions sont conservées comme point d'accroche unique au cas où un accès
 * différencié reviendrait un jour — mais le financement viendra alors des
 * institutions (CROUS, missions locales, mutuelles), jamais de l'utilisateur.
 */

/** Tout le contenu est accessible à tout le monde. */
export function isPremiumUser(_profile: UserProfile | null): boolean {
  return true;
}

/** Tous les courriers sont libres d'accès. */
export function isCourrierFree(_courrierId: string): boolean {
  return true;
}
