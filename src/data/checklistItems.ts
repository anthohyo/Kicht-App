import { ChecklistItem, UserProfile } from '../types';

// Items "Premier mois" — démarches essentielles pour un jeune adulte déjà installé
export const defaultChecklistItems: ChecklistItem[] = [
  { id: 'apl',        label: 'Faire ma demande d\'APL sur caf.fr',                              checked: false },
  { id: 'secu',       label: 'Vérifier que mon numéro de Sécu est actif sur ameli.fr',          checked: false },
  { id: 'mutuelle',   label: 'Souscrire une mutuelle (ou demander la CSS si éligible)',          checked: false },
  { id: 'banque',     label: 'Ouvrir un compte bancaire personnel',                              checked: false },
  { id: 'budget',     label: 'Rentrer mes dépenses dans l\'app pour voir mon reste à vivre',    checked: false },
  { id: 'fiche-paie', label: 'Comprendre ma première fiche de paie',                             checked: false },
  { id: 'caf',        label: 'Créer mon compte CAF sur caf.fr',                                 checked: false },
  { id: 'impots',     label: 'Vérifier si je dois faire une déclaration d\'impôts',             checked: false },
  { id: 'assurance',  label: 'Souscrire une assurance habitation (si logement autonome)',        checked: false },
  { id: 'adresse',    label: 'Mettre à jour mon adresse (banque, Sécu, impôts, La Poste)',      checked: false },
];

/**
 * Séquence "je pars vivre seul" — ordre chronologique réel.
 *
 * L'ordre n'est pas cosmétique, il est la valeur : demander Visale APRÈS avoir visité
 * ne sert à rien (c'est le dossier qui fait la différence face aux autres candidats),
 * et l'APL demandée en retard n'est jamais rattrapée. Un jeune qui découvre ça seul
 * le découvre trop tard.
 */
export const emmenagementChecklistItems: ChecklistItem[] = [
  { id: 'visale',     label: 'Demander ma garantie Visale — AVANT de commencer les visites',    checked: false },
  { id: 'dossier',    label: 'Préparer mon dossier de location (identité, garant, revenus)',    checked: false },
  { id: 'caf',        label: 'Créer mon compte CAF sur caf.fr',                                 checked: false },
  { id: 'crous',      label: 'Faire ma demande de bourse CROUS (DSE)',                          checked: false },
  { id: 'banque',     label: 'Ouvrir un compte bancaire à mon nom',                              checked: false },
  { id: 'assurance',  label: 'Souscrire une assurance habitation — obligatoire pour signer',    checked: false },
  { id: 'etat-lieux', label: 'Faire l\'état des lieux d\'entrée en photographiant tout',        checked: false },
  { id: 'apl',        label: 'Demander l\'APL le mois de l\'emménagement — pas de rattrapage',  checked: false },
  { id: 'secu',       label: 'Vérifier ma couverture santé (Sécu, mutuelle ou CSS)',            checked: false },
  { id: 'budget',     label: 'Rentrer mon budget dans l\'app pour voir mon reste à vivre',      checked: false },
];

/** Renvoie la checklist adaptée au moment de vie de l'utilisateur. */
export function getChecklistItems(profile: UserProfile | null): ChecklistItem[] {
  if (profile?.housingType === 'futur') return emmenagementChecklistItems;
  return defaultChecklistItems;
}
