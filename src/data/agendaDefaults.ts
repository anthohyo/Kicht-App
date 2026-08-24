import { AgendaEvent } from '../types';

// Deadlines annuelles pré-remplies (toujours en 2026)
export const STUDENT_DEADLINES: AgendaEvent[] = [
  {
    id: 'dse-ouverture',
    title: 'Ouverture dossiers bourses CROUS',
    emoji: '🎓',
    isoDate: '2026-01-15',
    category: 'deadline',
    isRecurring: false,
    isCustom: false,
    color: 'rgba(59, 130, 246, 0.8)',
  },
  {
    id: 'dse-limite',
    title: 'Date limite DSE (dossier social étudiant)',
    emoji: '⚠️',
    isoDate: '2026-02-28',
    category: 'deadline',
    isRecurring: false,
    isCustom: false,
    color: 'rgba(239, 68, 68, 0.8)',
  },
  {
    id: 'impots-ouverture',
    title: "Ouverture déclaration d'impôts",
    emoji: '🏛️',
    isoDate: '2026-04-08',
    category: 'deadline',
    isRecurring: false,
    isCustom: false,
    color: 'rgba(168, 85, 247, 0.8)',
  },
  {
    id: 'impots-limite',
    title: 'Date limite déclaration d\'impôts (zone 1)',
    emoji: '⏰',
    isoDate: '2026-05-20',
    category: 'deadline',
    isRecurring: false,
    isCustom: false,
    color: 'rgba(239, 68, 68, 0.8)',
  },
  {
    id: 'apl-renouvellement',
    title: 'Renouvellement APL — signaler changement CAF',
    emoji: '🏠',
    isoDate: '2026-06-28',
    category: 'deadline',
    isRecurring: false,
    isCustom: false,
    color: 'rgba(16, 185, 129, 0.8)',
  },
  {
    id: 'rentree-caf',
    title: "Rentrée — prévenir CAF changement d'adresse",
    emoji: '📬',
    isoDate: '2026-08-29',
    category: 'deadline',
    isRecurring: false,
    isCustom: false,
    color: 'rgba(245, 158, 11, 0.8)',
  },
  {
    id: 'secu-etudiante',
    title: 'Date limite réinscription sécu étudiante',
    emoji: '🏥',
    isoDate: '2026-11-15',
    category: 'deadline',
    isRecurring: false,
    isCustom: false,
    color: 'rgba(239, 68, 68, 0.8)',
  },
];

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
  {
    id: 'bourse-crous',
    title: 'Virement bourse CROUS',
    emoji: '🎓',
    dayOfMonth: 20,
    category: 'revenu',
    isRecurring: true,
    isCustom: true,
    color: 'rgba(16, 185, 129, 0.8)',
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
