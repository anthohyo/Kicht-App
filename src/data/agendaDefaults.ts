import { AgendaEvent } from '../types';

/**
 * Échéances officielles pré-remplies : volontairement vide.
 *
 * La liste précédente contenait des dates inventées pour 2026 (bourse, impôts,
 * aides régionales), dont une démarche qui n'existe plus : la « réinscription à la
 * sécurité sociale étudiante », supprimée en 2018. Les dates officielles changent
 * chaque année et ne sont publiées que quelques semaines avant l'ouverture. On
 * n'en réintroduit une que datée ET sourcée — jamais « de mémoire ».
 */
export const STUDENT_DEADLINES: AgendaEvent[] = [];

// Événements récurrents par défaut (suggérés, pas encore ajoutés)
export const SUGGESTED_RECURRING: AgendaEvent[] = [
  {
    id: 'loyer-default',
    title: 'Loyer',
    emoji: '🏠',
    dayOfMonth: 1,
    category: 'loyer',
    isRecurring: true,
    isCustom: true,
    color: 'rgba(239, 68, 68, 0.8)',
  },
];

export const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  loyer: { label: 'Loyer', emoji: '🏠', color: 'rgba(239, 68, 68, 0.8)' },
  charges: { label: 'Charges', emoji: '⚡', color: 'rgba(245, 158, 11, 0.8)' },
  abonnement: { label: 'Abonnement', emoji: '📱', color: 'rgba(168, 85, 247, 0.8)' },
  revenu: { label: 'Revenu', emoji: '💰', color: 'rgba(16, 185, 129, 0.8)' },
  deadline: { label: 'Deadline', emoji: '📅', color: 'rgba(59, 130, 246, 0.8)' },
  autre: { label: 'Autre', emoji: '📌', color: 'rgba(107, 114, 128, 0.8)' },
};
