import { ChecklistItem } from '../types';

// Items "Premier mois" — démarches essentielles pour un jeune adulte
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
