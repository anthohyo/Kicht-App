// --- Profil utilisateur ---
export type HousingType =
  | 'seul'       // loue seul
  | 'coloc'      // colocation
  | 'crous'      // résidence CROUS
  | 'parents'    // chez les parents, sans projet de déménagement
  | 'futur'      // chez les parents MAIS emménage bientôt — droits à préparer, pas à exclure
  | 'foyer';     // foyer / hébergement social

export type UserStatus =
  | 'etudiant'
  | 'apprenti'
  | 'salarie'
  | 'auto_entrepreneur'
  | 'service_civique'
  | 'recherche_emploi'
  | 'autre';

export type SchoolType = 'public' | 'prive_reconnu' | 'prive_non_reconnu';

export type PrimaryGoal = 'aides' | 'budget' | 'admin';

export interface UserProfile {
  firstName: string;
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  status: UserStatus;
  /** Type d'établissement — uniquement pour les étudiants, détermine l'éligibilité CROUS */
  schoolType?: SchoolType;
  housingType?: HousingType;
  monthlySalary: number;
  expenses: {
    loyer: number;
    abonnements: number;
    electricite: number;
    courses: number;
    transport: number;
    sorties: number;
  };
  onboardingComplete: boolean;
  savingsGoal?: { label: string; amount: number; emoji: string };
  /** @deprecated L'app est entièrement gratuite. Conservé pour lire les anciens profils. */
  isPremium?: boolean;
  claudeApiKey?: string;
  budgetSeeded?: boolean;
  photoUri?: string;
  ville?: string;
  departement?: string;
  region?: string;
  /** Intention principale — personnalise la home et l'onglet d'atterrissage */
  primaryGoal?: PrimaryGoal;
  /** Aides déjà obtenues — ne remontent plus comme vedette */
  claimedAids?: string[];
}

// --- Transactions budget ---
export type TransactionType = 'Revenu' | 'Dépense';

export type Category =
  | 'Loyer'
  | 'Courses'
  | 'Transport'
  | 'Sorties'
  | 'Abonnements'
  | 'Électricité'
  | 'Santé'
  | 'Salaire'
  | 'Aides'
  | 'Autres';

export interface Transaction {
  id: string;
  amount: number;
  label: string;
  type: TransactionType;
  category: Category;
  date: string;
}

// --- Quiz ---
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// --- Checklist ---
export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'parrain';
  timestamp: string;
  /** Bouton d'action affiché sous le message — supporte 3 destinations */
  actionCard?: {
    label: string;
    courrierId?: string;   // → CourrierDetail
    guideId?: string;      // → GuideDetail
    navigateTo?: 'SimulateurAides' | 'Aides'; // → écran stack
  };
}

// --- Fiches pratiques ---
export type GuideCategory = 'impots' | 'logement' | 'budget' | 'travail' | 'sante' | 'admin' | 'investissement';

export interface Guide {
  id: string;
  title: string;
  emoji: string;
  category: GuideCategory;
  summary: string;
  steps: GuideStep[];
  premium?: boolean;
}

export interface GuideStep {
  title: string;
  content: string;
}

// --- Parcours ---
export interface Parcours {
  id: string;
  title: string;
  emoji: string;
  description: string;
  forStatus: UserStatus[];
  steps: ParcoursStep[];
}

export interface ParcoursStep {
  title: string;
  description: string;
  action?: { screen: keyof RootStackParamList; label: string };
  done?: boolean;
}

// --- Courriers ---
export interface CourrierTemplate {
  id: string;
  title: string;
  emoji: string;
  category: 'logement' | 'emploi' | 'admin' | 'banque' | 'resiliation';
  description: string;
  template: string; // Le texte du modèle avec des [PLACEHOLDERS]
}

// --- Gamification ---
export interface Badge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  condition: string; // description humaine de la condition
}

export interface UserProgress {
  points: number;
  earnedBadges: string[]; // badge IDs
  guidesCompleted: string[];
  quizBestScore: number;
  budgetDaysTracked: number;
  chatQuestionsAsked: number;
  courriersUsed: number;
  streak: number; // jours consécutifs d'utilisation
  lastActiveDate: string;
}

// --- Agenda ---
export type AgendaCategory = 'loyer' | 'charges' | 'abonnement' | 'revenu' | 'deadline' | 'autre';

export interface AgendaEvent {
  id: string;
  title: string;
  emoji: string;
  dayOfMonth?: number;      // pour événements récurrents (1-31)
  isoDate?: string;         // pour événements one-shot (ex: "2026-06-01")
  amount?: number;
  category: AgendaCategory;
  isRecurring: boolean;
  isCustom: boolean;        // false = pré-rempli, true = créé par l'utilisateur
  isPayment?: boolean;      // true = dépense récurrente
  paymentType?: 'prelevement' | 'budget'; // prelevement = date fixe, budget = enveloppe mensuelle
  color?: string;
  /** URL officielle — obligatoire pour une échéance officielle pré-remplie. */
  source?: string;
}

// --- Navigation ---
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Main: undefined;
  Quiz: undefined;
  Checklist: undefined;
  Aides: undefined;
  Guides: undefined;
  GuideDetail: { guideId: string };
  Parcours: undefined;
  Courriers: undefined;
  CourrierDetail: { courrierId: string };
  Badges: undefined;
  Settings: undefined;
  SimulateurEpargne: undefined;
  MesDocuments: undefined;
  Agenda: undefined;
  Profile: undefined;
  Confidentialite: undefined;
  Explorer: undefined;
};

export type TabParamList = {
  Home: undefined;
  Aides: undefined;
  Budget: undefined;
  Chat: undefined;
};
