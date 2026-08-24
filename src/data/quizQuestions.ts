import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'À partir de quel âge dois-tu faire ta propre déclaration de revenus ?',
    options: ['16 ans', '18 ans', '21 ans', '25 ans'],
    correctIndex: 1,
    explanation:
      'Dès 18 ans, tu peux (et souvent tu dois) faire ta propre déclaration. Tu peux aussi rester rattaché au foyer fiscal de tes parents jusqu\'à 21 ans (ou 25 ans si étudiant).',
  },
  {
    id: 2,
    question: 'Dois-tu déclarer tes revenus même si tu n\'es pas imposable ?',
    options: [
      'Non, ça ne sert à rien',
      'Oui, c\'est obligatoire',
      'Seulement si tu gagnes plus de 10 000 €',
    ],
    correctIndex: 1,
    explanation:
      'Oui ! Même si tu ne paies pas d\'impôt, la déclaration te donne un avis d\'imposition, indispensable pour toucher des aides (APL, bourse…).',
  },
  {
    id: 3,
    question: 'Qu\'est-ce que le numéro fiscal ?',
    options: [
      'Le numéro de ta carte bancaire',
      'Un identifiant unique pour les impôts',
      'Ton numéro de sécurité sociale',
    ],
    correctIndex: 1,
    explanation:
      'C\'est un numéro à 13 chiffres qui t\'identifie auprès des impôts. Tu le trouves sur ton premier courrier des impôts ou sur impots.gouv.fr.',
  },
  {
    id: 4,
    question: 'L\'APL (aide personnalisée au logement), c\'est pour qui ?',
    options: [
      'Uniquement les étudiants',
      'Uniquement les salariés',
      'Toute personne qui loue un logement et a des revenus modestes',
    ],
    correctIndex: 2,
    explanation:
      'L\'APL est accessible à tous les locataires sous conditions de ressources, pas seulement les étudiants. Il faut faire la demande sur le site de la CAF.',
  },
  {
    id: 5,
    question: 'Où fais-tu ta demande d\'APL ?',
    options: [
      'À la mairie',
      'Sur le site de la CAF (caf.fr)',
      'Chez ton propriétaire',
    ],
    correctIndex: 1,
    explanation:
      'La demande se fait en ligne sur caf.fr. Pense à la faire dès ton entrée dans le logement, car l\'aide n\'est pas rétroactive.',
  },
  {
    id: 6,
    question: 'La bourse étudiante sur critères sociaux, c\'est versé par qui ?',
    options: ['La banque', 'Le CROUS', 'L\'université directement'],
    correctIndex: 1,
    explanation:
      'C\'est le CROUS qui gère les bourses étudiantes. La demande se fait via le DSE (Dossier Social Étudiant) entre janvier et mai pour la rentrée suivante.',
  },
  {
    id: 7,
    question: 'Qu\'est-ce que la prime d\'activité ?',
    options: [
      'Un bonus versé par ton employeur',
      'Une aide de la CAF pour les travailleurs à revenus modestes',
      'Une prime pour les chômeurs',
    ],
    correctIndex: 1,
    explanation:
      'La prime d\'activité est versée par la CAF aux travailleurs (y compris apprentis et étudiants salariés) dont les revenus sont modestes. Il faut la demander sur caf.fr.',
  },
  {
    id: 8,
    question: 'Quand déclarer ses revenus en ligne pour la première fois ?',
    options: [
      'En janvier',
      'Entre avril et juin (selon ton département)',
      'En septembre',
    ],
    correctIndex: 1,
    explanation:
      'La campagne de déclaration a lieu chaque année entre avril et juin. Les dates exactes varient selon ton département. Tout se fait sur impots.gouv.fr.',
  },
  {
    id: 9,
    question: 'Un job étudiant de moins de 5 318 € par an (3 SMIC) est-il imposable ?',
    options: [
      'Oui, toujours',
      'Non, il est exonéré si tu as moins de 26 ans',
      'Ça dépend de ton signe astrologique',
    ],
    correctIndex: 1,
    explanation:
      'Les revenus d\'un job étudiant sont exonérés jusqu\'à un certain plafond (environ 3 SMIC) si tu as moins de 26 ans au 1er janvier de l\'année. Tu n\'as pas besoin de les déclarer.',
  },
  {
    id: 10,
    question: 'Quelle est la première chose à faire quand tu emménages dans ton premier appart ?',
    options: [
      'Acheter un canapé',
      'Souscrire une assurance habitation',
      'Inviter les potes pour la crémaillère',
    ],
    correctIndex: 1,
    explanation:
      'L\'assurance habitation est OBLIGATOIRE pour tout locataire. Ton propriétaire peut te la demander dès la remise des clés. Fais-le avant même de déménager !',
  },
];
