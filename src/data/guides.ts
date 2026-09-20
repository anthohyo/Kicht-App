import { Guide } from '../types';
import { premiumGuides } from './premiumGuides';

// Free guides
export const guides: Guide[] = [
  {
    id: 'declaration-impots',
    title: 'Faire sa déclaration d\'impôts',
    emoji: '🏛️',
    category: 'impots',
    summary: 'Le pas-à-pas pour déclarer tes revenus pour la première fois.',
    steps: [
      {
        title: '1. Trouve ton numéro fiscal',
        content:
          'Si c\'est ta première fois : va sur impots.gouv.fr > "Vous n\'avez pas encore de numéro fiscal". Sinon, il est sur le courrier que tu as reçu ou sur l\'avis d\'imposition de tes parents si tu étais rattaché·e.',
      },
      {
        title: '2. Connecte-toi sur impots.gouv.fr',
        content:
          'Utilise ton numéro fiscal + mot de passe. Si tu n\'as pas encore de mot de passe, clique sur "Première connexion" et suis les instructions.',
      },
      {
        title: '3. Vérifie les montants pré-remplis',
        content:
          'L\'administration pré-remplit déjà tes salaires, indemnités, etc. Vérifie que ça correspond à tes fiches de paie. Si tu n\'as rien gagné, les cases seront à 0 — c\'est normal.',
      },
      {
        title: '4. Déclare tes frais si besoin',
        content:
          'Par défaut tu as un abattement de 10% pour frais professionnels. Si tes frais réels (transport, repas…) dépassent 10% de ton salaire, tu peux opter pour les frais réels. Sinon, ne touche à rien.',
      },
      {
        title: '5. Valide et signe',
        content:
          'Relis le récapitulatif, puis clique sur "Signer ma déclaration". Tu recevras un accusé de réception par email. L\'avis d\'imposition arrive en général en août.',
      },
      {
        title: '💡 Astuce importante',
        content:
          'MÊME si tu n\'es pas imposable (revenus faibles), DÉCLARE QUAND MÊME. L\'avis d\'imposition est nécessaire pour l\'APL, la bourse, Visale, et plein d\'autres démarches. Sans avis d\'imposition, pas d\'aide.',
      },
    ],
  },
  {
    id: 'demander-apl',
    title: 'Comment demander l\'APL',
    emoji: '🏠',
    category: 'logement',
    summary: 'Les étapes pour obtenir l\'aide au logement de la CAF.',
    steps: [
      {
        title: '1. Vérifie ton éligibilité',
        content:
          'Tu dois être locataire (avec un bail à ton nom), le logement doit être ta résidence principale, et tu dois avoir des revenus modestes. Presque tous les étudiants y ont droit !',
      },
      {
        title: '2. Crée ton compte sur caf.fr',
        content:
          'Va sur caf.fr > "Créer mon compte". Tu auras besoin de ton numéro de sécurité sociale (il est sur ta carte Vitale).',
      },
      {
        title: '3. Fais ta demande en ligne',
        content:
          'Dans ton espace CAF > "Faire une demande de prestation" > "Aides au logement". Remplis le formulaire en ligne (~15 min).',
      },
      {
        title: '4. Prépare tes documents',
        content:
          'Il te faut : ton bail signé, ton RIB, ton dernier avis d\'imposition (ou celui de tes parents si 1ère année). Scanne-les ou prends-les en photo.',
      },
      {
        title: '5. Patiente (~2 mois)',
        content:
          'Le premier versement prend environ 2 mois. L\'APL est versée directement sur ton compte ou déduite de ton loyer (selon accord avec le proprio).',
      },
      {
        title: '⚠️ Attention',
        content:
          'L\'APL n\'est PAS rétroactive : tu ne toucheras rien pour les mois où tu n\'avais pas encore fait la demande. Fais-la DÈS que tu signes ton bail !',
      },
    ],
  },
  {
    id: 'lire-fiche-paie',
    title: 'Comprendre sa fiche de paie',
    emoji: '💼',
    category: 'travail',
    summary: 'Décrypter toutes les lignes de ton bulletin de salaire.',
    steps: [
      {
        title: 'Salaire brut',
        content:
          'C\'est le montant total avant toutes les déductions. C\'est le chiffre que ton employeur annonce, mais ce n\'est PAS ce que tu touches.',
      },
      {
        title: 'Cotisations salariales (~22%)',
        content:
          'Ce sont tes contributions à la sécu, la retraite, le chômage, etc. Elles sont déduites automatiquement. C\'est obligatoire et ça te donne des droits (maladie, chômage, retraite).',
      },
      {
        title: 'Salaire net',
        content:
          'C\'est ce que tu touches réellement sur ton compte. Salaire net = brut - cotisations. C\'est LE chiffre qui compte pour ton budget.',
      },
      {
        title: 'Net imposable',
        content:
          'C\'est un montant un peu plus élevé que le net (car la CSG non déductible est rajoutée). C\'est ce montant que tu déclares aux impôts. Il est pré-rempli sur ta déclaration.',
      },
      {
        title: 'Congés payés',
        content:
          'Tu cumules 2,5 jours de congés par mois travaillé (= 5 semaines/an). Tu peux voir ton solde sur ta fiche de paie. Tes congés sont payés normalement.',
      },
      {
        title: '💡 Réflexe important',
        content:
          'GARDE toutes tes fiches de paie. Toute ta vie. Elles servent pour la retraite, les prêts bancaires, les dossiers de location… Scanne-les et stocke-les en sécurité.',
      },
    ],
  },
  {
    id: 'premier-appart-demarches',
    title: 'Toutes les démarches premier appart',
    emoji: '🔑',
    category: 'logement',
    summary: 'Tout ce qu\'il faut faire avant, pendant et après l\'emménagement.',
    steps: [
      {
        title: '1. Prépare ton dossier de location',
        content:
          'Pièce d\'identité, 3 dernières fiches de paie (ou attestation de bourse), dernier avis d\'imposition, justificatif de domicile actuel, RIB. Pour le garant : mêmes documents.',
      },
      {
        title: '2. Inscris-toi sur Visale.fr',
        content:
          'Si tu as moins de 30 ans, Visale te sert de caution gratuite. Inscris-toi AVANT de commencer tes visites — le visa est valable 6 mois.',
      },
      {
        title: '3. Souscris une assurance habitation',
        content:
          'Obligatoire AVANT la remise des clés. Compare en ligne : Luko, MAIF, MACIF, ou ta banque. Compte 5 à 15 €/mois.',
      },
      {
        title: '4. Fais l\'état des lieux',
        content:
          'Prends des PHOTOS de tout (murs, sols, équipements). Note chaque défaut sur le formulaire. C\'est ce document qui te protégera quand tu partiras.',
      },
      {
        title: '5. Ouvre tes compteurs',
        content:
          'Électricité : appelle EDF ou un fournisseur alternatif (TotalEnergies, Engie…). Internet : compare les box (Red by SFR, B&You, Free souvent les moins chers).',
      },
      {
        title: '6. Change ton adresse partout',
        content:
          'Impôts, CAF, CPAM (ameli.fr), banque, mutuelle, opérateur mobile, La Poste (réexpédition du courrier ~30 €). Tu peux faire beaucoup en une fois sur service-public.fr > "Je déménage".',
      },
      {
        title: '7. Demande l\'APL immédiatement',
        content:
          'Sur caf.fr, dès le premier jour. N\'attends pas ! Chaque mois sans demande = argent perdu.',
      },
    ],
  },
  {
    id: 'resilier-abonnement',
    title: 'Résilier un abonnement',
    emoji: '✂️',
    category: 'admin',
    summary: 'Comment se désabonner proprement de n\'importe quel service.',
    steps: [
      {
        title: '1. Vérifie les conditions de résiliation',
        content:
          'Depuis la loi Chatel, tu peux résilier à tout moment après la période d\'engagement. Regarde ton contrat pour connaître la durée d\'engagement et le préavis.',
      },
      {
        title: '2. Résiliation en ligne (le plus simple)',
        content:
          'Depuis 2023, tous les services accessibles en ligne doivent proposer un bouton de résiliation en 3 clics maximum. Cherche dans ton espace client > "Gérer mon abonnement".',
      },
      {
        title: '3. Par courrier recommandé (si pas de bouton)',
        content:
          'Envoie une lettre recommandée avec AR. Modèle : "Je soussigné [nom], n° client [xxx], demande la résiliation de mon contrat [nom du service] à compter du [date]."',
      },
      {
        title: '4. Vérifie l\'arrêt des prélèvements',
        content:
          'Après résiliation, surveille tes relevés bancaires pendant 2-3 mois. Si un prélèvement passe encore, contacte ta banque pour le contester.',
      },
      {
        title: '💡 Astuce',
        content:
          'Le site jechange.fr et l\'appli Papernest peuvent t\'aider à comparer et résilier tes abonnements. Pense aussi à lister TOUS tes abonnements (Netflix, Spotify, salle de sport, box internet, forfait mobile…) pour voir où tu peux économiser.',
      },
    ],
  },
  {
    id: 'css-mutuelle-gratuite',
    title: 'Obtenir une mutuelle gratuite (CSS)',
    emoji: '🏥',
    category: 'sante',
    summary: 'La Complémentaire Santé Solidaire couvre ce que la sécu ne rembourse pas.',
    steps: [
      {
        title: '1. Vérifie ton éligibilité',
        content:
          'CSS gratuite si tu gagnes moins de ~800 €/mois (personne seule). CSS à ~1 €/jour si tu gagnes entre 800 € et ~1 100 €/mois. Les étudiants boursiers y ont souvent droit.',
      },
      {
        title: '2. Fais ta demande',
        content:
          'Sur ameli.fr > Mon compte > Mes démarches > Complémentaire Santé Solidaire. Ou directement à l\'accueil de ta CPAM.',
      },
      {
        title: '3. Ce que ça couvre',
        content:
          'Consultations médicales, médicaments, lunettes (forfait), soins dentaires, hospitalisation… En gros, tu ne paies quasiment plus rien en santé.',
      },
      {
        title: '4. Délai',
        content:
          'Réponse sous 2 mois environ. La CSS est attribuée pour 1 an, renouvelable. Pense à renouveler avant la date d\'expiration !',
      },
    ],
  },
  {
    id: 'bourses-alternatives-ecole-privee',
    title: 'Bourses pour écoles non conventionnées CROUS',
    emoji: '🎓',
    category: 'admin',
    summary: "Ton école n'est pas conventionnée CROUS ? Toutes les alternatives pour financer tes études.",
    steps: [
      {
        title: '1. Fonds d\'aide interne à ton école',
        content: 'Beaucoup d\'écoles privées ont un fonds d\'aide sociale interne, souvent méconnu. Contacte ton service de scolarité ou le bureau des étudiants. Certaines écoles (EFAP, ESG, ISEG…) ont des bourses sur critères sociaux ou mérite. Demande explicitement : "Y a-t-il un fonds d\'aide pour les étudiants en difficulté ?"',
      },
      {
        title: '2. Bourses régionales',
        content: 'Plusieurs régions financent les étudiants quelle que soit leur école :\n• Île-de-France : Bourse Île-de-France (iledefrance.fr)\n• Auvergne-Rhône-Alpes : aides pour étudiants en formation professionnelle\n• Occitanie, Bretagne, Pays de la Loire : aides jeunes selon critères sociaux\nCherche sur le site de ta région : "[nom région] bourse étudiante école privée".',
      },
      {
        title: '3. Fondations privées',
        content: 'Des fondations accordent des bourses sans condition d\'école :\n• Fondation de France (fondationdefrance.org) — catalogue de bourses par secteur\n• Fondations d\'entreprises de ton secteur (communication, marketing, mode…)\n• Fondation Société Générale, BNP Paribas, LVMH selon ton domaine\n• Portail de bourses : scholarshipportal.com ou studyrama.com/bourses\nCritère clé : la motivation et le projet professionnel comptent plus que l\'école.',
      },
      {
        title: '4. CSS — mutuelle gratuite',
        content: 'La Complémentaire Santé Solidaire (CSS) est accessible à TOUS les étudiants, quelle que soit l\'école. Si tes revenus sont modestes (moins de ~1 000 €/mois), tu as droit à une mutuelle gratuite ou à moins de 1 €/jour. Fais la demande sur ameli.fr — décision sous 48h.',
      },
      {
        title: '5. FAJ et aides d\'urgence',
        content: 'Si tu as moins de 25 ans et une situation financière difficile :\n• FAJ (Fonds d\'Aide aux Jeunes) — demande à ta mairie ou au Conseil Départemental. Jusqu\'à 800 € en une fois.\n• CCAS de ta mairie — aide d\'urgence, épicerie solidaire\n• Mission locale — accompagnement complet et accès à la Garantie Jeunes',
      },
      {
        title: '💡 La stratégie gagnante',
        content: 'Ne mise pas sur une seule source. Cumule : bourse interne de l\'école + aide régionale + CSS + prime d\'activité si tu travailles. Ces 4 sources ensemble peuvent représenter 300 à 600 €/mois. Commence par l\'interne (le plus rapide) puis la région (souvent méconnu mais accessible).',
      },
    ],
  },
  {
    id: 'ouvrir-compte-bancaire',
    title: 'Choisir et ouvrir un compte bancaire',
    emoji: '🏦',
    category: 'budget',
    summary: 'Comparer les banques et ouvrir ton premier compte.',
    steps: [
      {
        title: '1. Banque en ligne vs classique',
        content:
          'Banque en ligne : souvent sans frais de tenue de compte ni frais de carte, tout se fait depuis l\'application, mais il n\'y a pas d\'agence où se présenter. Banque de réseau : généralement 2 à 5 €/mois, avec un conseiller que tu peux rencontrer. Regarde trois lignes avant de choisir : les frais de tenue de compte, le coût de la carte, et les frais en cas de découvert — c\'est là que les écarts se creusent. Toutes les banques françaises sont couvertes par la même garantie des dépôts (100 000 € par déposant).',
      },
      {
        title: '2. Ce qu\'il te faut pour ouvrir un compte',
        content:
          'Pièce d\'identité, justificatif de domicile de moins de 3 mois, et parfois un premier versement (~10-50 €). C\'est tout !',
      },
      {
        title: '3. L\'ouverture en ligne',
        content:
          'Va sur le site de la banque choisie > "Ouvrir un compte". Remplis le formulaire, envoie tes documents, et tu reçois ta carte en quelques jours.',
      },
      {
        title: '4. Le découvert : attention danger',
        content:
          'Le découvert, c\'est un prêt déguisé avec des intérêts (agios). Utilise-le uniquement en urgence. Négocie le montant autorisé avec ta banque et essaie de ne jamais le dépasser.',
      },
      {
        title: '💡 Conseil',
        content:
          'Tu peux avoir plusieurs comptes sans problème : un compte principal pour ce qui est fixe (salaire, loyer, prélèvements) et un second, souvent dans une néobanque, pour les dépenses courantes et les voyages. Ça évite de piocher sans s\'en rendre compte dans l\'argent du loyer. Vérifie juste que le second est bien agréé en France ou dans l\'Union européenne.',
      },
    ],
  },
];

// All guides (free + premium combined)
export const allGuides: Guide[] = [...guides, ...premiumGuides];

export const GUIDE_CATEGORIES = {
  impots: { label: 'Impôts', emoji: '🏛️' },
  logement: { label: 'Logement', emoji: '🏠' },
  budget: { label: 'Budget', emoji: '💰' },
  travail: { label: 'Travail', emoji: '💼' },
  sante: { label: 'Santé', emoji: '🏥' },
  admin: { label: 'Administratif', emoji: '📋' },
  investissement: { label: 'Investissement', emoji: '📈' },
};
