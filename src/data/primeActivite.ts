/**
 * Prime d'activité — calcul officiel pour une personne seule sans enfant.
 *
 * Remplace une grille maison à trois paliers (200, 150 ou 80 €) qui n'avait
 * aucune source et ignorait la réforme d'avril 2026. Le montant affiché dans
 * l'app — et tout chiffre qu'on en tirerait ensuite — mesurait la grille, pas
 * les droits réels.
 *
 * Formule (service-public.gouv.fr) :
 *   montant forfaitaire
 *   + 59,85 % des revenus professionnels
 *   + bonification individuelle
 *   − ressources du foyer, forfait logement compris (au minimum le montant forfaitaire)
 * Versée seulement si le résultat atteint 15 €.
 *
 * Limites assumées, à garder en tête :
 * - personne seule sans enfant uniquement : c'est le profil de l'app ;
 * - les revenus saisis sont traités comme des revenus d'activité, alors qu'ils
 *   peuvent inclure une bourse ou une aide des parents — d'où le « peut-être »
 *   affiché aux étudiants ;
 * - le forfait logement est toujours déduit (APL perçue ou hébergement gratuit) :
 *   l'estimation penche vers le bas plutôt que de promettre trop.
 */

export const BAREME_PRIME_ACTIVITE = {
  source: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2882',
  /** Paramètres en vigueur depuis le 1er avril 2026 (page mise à jour le 1er juin 2026). */
  enVigueurDepuis: '2026-04-01',
  verifieLe: '2026-09-29',
  montantForfaitaire: 638.28,
  tauxRevenusProfessionnels: 0.5985,
  bonification: {
    /** En dessous, pas de bonification. */
    seuil: 726.29,
    /** Au-dessus, bonification maximale. */
    plafond: 1698.78,
    maximum: 240.63,
  },
  /**
   * 12 % du montant forfaitaire pour une personne seule. Déduit quand on
   * perçoit une aide au logement ou qu'on est hébergé gratuitement.
   */
  forfaitLogement: 76.59,
  versementMinimum: 15,
} as const;

/** Bonification individuelle, croissante entre le seuil et le plafond. */
export function bonificationIndividuelle(revenusActivite: number): number {
  const { seuil, plafond, maximum } = BAREME_PRIME_ACTIVITE.bonification;
  if (revenusActivite <= seuil) return 0;
  if (revenusActivite >= plafond) return maximum;
  return (maximum * (revenusActivite - seuil)) / (plafond - seuil);
}

/**
 * Montant mensuel estimé, arrondi à l'euro. Renvoie 0 si la prime ne serait pas
 * versée (résultat inférieur au minimum de versement).
 */
export function montantPrimeActivite(revenusActivite: number): number {
  const b = BAREME_PRIME_ACTIVITE;
  if (revenusActivite <= 0) return 0;
  const ressources = revenusActivite + b.forfaitLogement;
  const montant =
    b.montantForfaitaire +
    b.tauxRevenusProfessionnels * revenusActivite +
    bonificationIndividuelle(revenusActivite) -
    Math.max(b.montantForfaitaire, ressources);
  return montant >= b.versementMinimum ? Math.round(montant) : 0;
}

/**
 * Revenu mensuel au-delà duquel la prime n'est plus versée, déduit du barème
 * plutôt qu'écrit à la main : l'ancienne condition « moins de ~1 800 € » était
 * fausse, et le serait redevenue à chaque revalorisation.
 */
export function plafondRevenusPrimeActivite(): number {
  let revenu = BAREME_PRIME_ACTIVITE.bonification.plafond;
  while (montantPrimeActivite(revenu + 10) > 0) revenu += 10;
  return revenu;
}
