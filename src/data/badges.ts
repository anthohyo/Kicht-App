import { Badge } from '../types';

export const allBadges: Badge[] = [
  // --- Premiers pas ---
  {
    id: 'bienvenue',
    title: 'Bienvenue !',
    emoji: '👋',
    description: 'Tu as complété l\'onboarding',
    condition: 'Compléter le questionnaire d\'arrivée',
  },
  {
    id: 'premier-budget',
    title: 'Premier budget',
    emoji: '📊',
    description: 'Tu as ajouté ta première transaction',
    condition: 'Ajouter 1 transaction dans le budget',
  },
  {
    id: 'curieux',
    title: 'Curieux·se',
    emoji: '🔍',
    description: 'Tu as posé ta première question au Parrain',
    condition: 'Envoyer 1 message dans le chat',
  },

  // --- Budget ---
  {
    id: 'budgeteur',
    title: 'Budgeteur·se',
    emoji: '💰',
    description: 'Tu suis ton budget régulièrement',
    condition: 'Ajouter 10 transactions au total',
  },
  {
    id: 'econome',
    title: 'Économe',
    emoji: '🐷',
    description: 'Tu as plus de revenus que de dépenses ce mois-ci',
    condition: 'Solde mensuel positif',
  },

  // --- Apprentissage ---
  {
    id: 'quiz-debutant',
    title: 'Quiz débutant',
    emoji: '🧠',
    description: 'Tu as fait ton premier quiz',
    condition: 'Terminer le quiz une fois',
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    emoji: '🏆',
    description: 'Score parfait au quiz !',
    condition: 'Obtenir 10/10 au quiz',
  },
  {
    id: 'lecteur',
    title: 'Lecteur·rice',
    emoji: '📖',
    description: 'Tu as lu ta première fiche pratique',
    condition: 'Compléter 1 guide',
  },
  {
    id: 'expert',
    title: 'Expert·e',
    emoji: '🎓',
    description: 'Tu as lu 5 fiches pratiques',
    condition: 'Compléter 5 guides',
  },

  // --- Démarches ---
  {
    id: 'administrateur',
    title: 'Administrateur·rice',
    emoji: '📝',
    description: 'Tu as utilisé un modèle de courrier',
    condition: 'Copier 1 modèle de courrier',
  },
  {
    id: 'organisé',
    title: 'Organisé·e',
    emoji: '✅',
    description: 'Tu as complété la checklist premier appart',
    condition: 'Cocher toutes les tâches de la checklist',
  },

  // --- Engagement ---
  {
    id: 'regulier',
    title: 'Régulier·ère',
    emoji: '🔥',
    description: '7 jours d\'utilisation consécutifs',
    condition: 'Streak de 7 jours',
  },
  {
    id: 'fidele',
    title: 'Fidèle',
    emoji: '⭐',
    description: '30 jours d\'utilisation consécutifs',
    condition: 'Streak de 30 jours',
  },
  {
    id: 'parrain-fan',
    title: 'Fan du Parrain',
    emoji: '🎩',
    description: 'Tu as posé 20 questions au Parrain',
    condition: 'Envoyer 20 messages dans le chat',
  },
];

// Points awarded for actions
export const POINTS = {
  COMPLETE_ONBOARDING: 50,
  ADD_TRANSACTION: 5,
  COMPLETE_QUIZ: 20,
  PERFECT_QUIZ: 50,
  COMPLETE_GUIDE: 15,
  ASK_QUESTION: 3,
  USE_COURRIER: 10,
  DAILY_LOGIN: 5,
};
