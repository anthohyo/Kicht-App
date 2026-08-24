import { UserProfile } from '../types';

/** Courriers gratuits (les 3 plus importants en situation d'urgence) */
export const FREE_COURRIER_IDS = [
  'demande-delai-loyer',
  'reponse-mise-en-demeure',
  'preavis-logement',
];

/** L'user est premium s'il a payé OU s'il a une clé API (beta testeurs) */
export function isPremiumUser(profile: UserProfile | null): boolean {
  return !!(profile?.isPremium || profile?.claudeApiKey);
}

/** Ce courrier est-il accessible gratuitement ? */
export function isCourrierFree(courrierId: string): boolean {
  return FREE_COURRIER_IDS.includes(courrierId);
}
