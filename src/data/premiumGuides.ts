import { Guide } from '../types';

// Guides premium — contenu avancé pour les abonnés
export const premiumGuides: Guide[] = [
  {
    id: 'investir-debutant',
    title: 'Commencer à investir',
    emoji: '📈',
    category: 'investissement',
    summary: 'Les bases de l\'investissement quand on est jeune et qu\'on part de zéro.',
    premium: true,
    steps: [
      {
        title: '1. Construis ton matelas de sécurité d\'abord',
        content:
          'Avant d\'investir un seul euro, assure-toi d\'avoir 2 à 3 mois de dépenses sur un Livret A. C\'est ta protection en cas de coup dur. Sans ça, si tu as un imprévu, tu seras obligé·e de vendre tes investissements au pire moment.',
      },
      {
        title: '2. Comprends les supports d\'investissement',
        content:
          'Livret A / LDDS : épargne sans risque, ~3%/an. PEA (Plan d\'Épargne en Actions) : pour investir en bourse avec un avantage fiscal après 5 ans. Assurance-vie : enveloppe polyvalente, fiscalité avantageuse après 8 ans. Compte-titres : pour investir librement, mais pas d\'avantage fiscal.',
      },
      {
        title: '3. Les ETF, le meilleur choix pour débuter',
        content:
          'Un ETF (ou tracker) est un fonds qui réplique un indice boursier (ex: le CAC 40 ou le MSCI World). Avantages : très diversifié, frais très faibles (~0,2%/an), pas besoin de choisir des actions individuelles. L\'ETF MSCI World suit 1 600 entreprises dans 23 pays — c\'est le choix n°1 des débutants.',
      },
      {
        title: '4. Ouvre un PEA',
        content:
          'Le PEA est le meilleur outil pour un jeune investisseur français. Après 5 ans, les gains sont exonérés d\'impôt sur le revenu (tu ne paies que 17,2% de prélèvements sociaux au lieu de 30%). Ouvre-le chez un courtier en ligne (Boursorama, Fortuneo, Bourse Direct) pour avoir des frais réduits.',
      },
      {
        title: '5. Investis régulièrement (DCA)',
        content:
          'Le DCA (Dollar Cost Averaging) = investir un montant fixe chaque mois, quoi qu\'il arrive. Ex : 50 €/mois sur un ETF World. Tu achètes parfois cher, parfois pas cher, mais en moyenne tu lisses le risque. C\'est la stratégie la plus simple et la plus efficace pour un débutant.',
      },
      {
        title: '6. Les erreurs à éviter',
        content:
          '• Ne pas investir de l\'argent dont tu as besoin à court terme\n• Ne pas essayer de "timer" le marché (personne n\'y arrive)\n• Ne pas vendre en panique quand ça baisse\n• Ne pas mettre tous ses œufs dans le même panier\n• Se méfier des "gourous" qui promettent des rendements miracles\n• Les cryptos ne sont PAS un investissement, c\'est de la spéculation',
      },
      {
        title: '💡 Le pouvoir du temps',
        content:
          'Si tu investis 100 €/mois à partir de 20 ans avec un rendement moyen de 7%/an, à 60 ans tu auras ~264 000 € (dont 216 000 € de gains !). Si tu commences à 30 ans avec le même montant, tu n\'auras que ~122 000 €. La différence ? 10 ans de temps en plus. Commencer tôt, c\'est ton plus gros avantage.',
      },
    ],
  },
  {
    id: 'optimiser-impots',
    title: 'Optimiser ses impôts légalement',
    emoji: '🏛️',
    category: 'impots',
    summary: 'Les mécanismes légaux pour réduire tes impôts (déductions, crédits, niches).',
    premium: true,
    steps: [
      {
        title: '1. Comprends la différence déduction / réduction / crédit',
        content:
          'Déduction : réduit ton revenu imposable (ex: frais réels). Réduction d\'impôt : réduit directement le montant de l\'impôt (ex: don à une asso). Crédit d\'impôt : comme une réduction, mais si tu ne paies pas d\'impôt, on te REMBOURSE la différence (ex: frais de garde).',
      },
      {
        title: '2. Les frais réels',
        content:
          'Par défaut, l\'État applique un abattement de 10% sur ton salaire pour les frais professionnels. Si tes frais réels dépassent ces 10%, tu peux les déduire : transport domicile-travail (barème kilométrique), repas (si tu ne peux pas manger chez toi), double résidence (si tu travailles loin). Garde bien tous les justificatifs !',
      },
      {
        title: '3. Le PER (Plan Épargne Retraite)',
        content:
          'Les versements sur un PER sont déductibles de ton revenu imposable. Ex : si tu verses 1 000 € et que tu es imposé à 30%, tu économises 300 € d\'impôts. Attention : l\'argent est bloqué jusqu\'à la retraite (sauf achat résidence principale). Intéressant surtout si tu as un taux marginal élevé.',
      },
      {
        title: '4. Les dons aux associations',
        content:
          'Don à un organisme d\'intérêt général : réduction de 66% du montant (dans la limite de 20% de tes revenus). Don à un organisme d\'aide aux personnes en difficulté : réduction de 75% (jusqu\'à 1 000 €). Ex : tu donnes 100 € → tu récupères 66 ou 75 € sur tes impôts.',
      },
      {
        title: '5. L\'investissement locatif (pour plus tard)',
        content:
          'Le dispositif Pinel (fin 2024) et le Denormandie permettent de réduire ses impôts en investissant dans l\'immobilier locatif. C\'est pour plus tard, mais c\'est bon à savoir : investir dans un logement à louer peut réduire tes impôts de 12 à 21% du prix d\'achat.',
      },
      {
        title: '💡 Le conseil du Parrain',
        content:
          'À ton âge, la meilleure "optimisation fiscale" c\'est de bien connaître tes droits : vérifier que ta déclaration est correcte, déduire tes frais réels si ça vaut le coup, et ne pas oublier de déclarer tes dons. Le PER et l\'immobilier, c\'est pour quand tu gagneras mieux ta vie.',
      },
    ],
  },
  {
    id: 'epargne-strategique',
    title: 'Stratégie d\'épargne intelligente',
    emoji: '🎯',
    category: 'budget',
    summary: 'Comment organiser ton épargne selon tes objectifs à court, moyen et long terme.',
    premium: true,
    steps: [
      {
        title: '1. Les 3 horizons d\'épargne',
        content:
          'Court terme (< 1 an) : Livret A — pour les urgences et projets immédiats. Moyen terme (1-5 ans) : Assurance-vie fonds euros — pour un projet (voyage, voiture, apport). Long terme (> 5 ans) : PEA + ETF — pour faire fructifier ton argent.',
      },
      {
        title: '2. La méthode des enveloppes',
        content:
          'Dès que tu reçois ton salaire, répartis automatiquement :\n• 50% → besoins essentiels (loyer, courses, transport)\n• 30% → envies (sorties, shopping, loisirs)\n• 20% → épargne et investissement\nMets en place des virements automatiques le jour de la paie.',
      },
      {
        title: '3. Le Livret A — ton bouclier',
        content:
          'Objectif : y mettre 2-3 mois de dépenses (~2 000-5 000 €). Taux : 3% (2025). Plafond : 22 950 €. C\'est ton argent de sécurité, à ne toucher qu\'en cas d\'urgence. Une fois ce matelas constitué, l\'excédent va sur des supports plus rentables.',
      },
      {
        title: '4. L\'assurance-vie — ta boîte à outils',
        content:
          'Ouvre une assurance-vie en ligne (Linxea, Boursorama Vie, Yomoni). Les frais sont beaucoup plus bas qu\'en banque classique. Tu peux y mettre du fonds euros (sûr, ~2-3%) et des unités de compte (ETF, plus risqué mais plus rentable). Fiscalité avantageuse après 8 ans.',
      },
      {
        title: '5. Automatise tout',
        content:
          'L\'ennemi n°1 de l\'épargne, c\'est la procrastination. Mets en place des virements automatiques :\n• J+1 après le salaire → virement vers le Livret A\n• J+1 après le salaire → virement vers le PEA/assurance-vie\nCe que tu ne vois pas sur ton compte courant, tu ne le dépenses pas.',
      },
      {
        title: '💡 L\'astuce du Parrain',
        content:
          'Commence PETIT. 20 €/mois d\'épargne, c\'est déjà bien. L\'important c\'est la régularité, pas le montant. Dans 5 ans, tu te remercieras d\'avoir commencé aujourd\'hui plutôt que d\'avoir attendu d\'avoir "assez d\'argent pour épargner".',
      },
    ],
  },
  {
    id: 'negocier-salaire',
    title: 'Négocier son salaire',
    emoji: '💰',
    category: 'travail',
    summary: 'Comment demander une augmentation ou négocier son salaire d\'embauche.',
    premium: true,
    steps: [
      {
        title: '1. Prépare tes arguments',
        content:
          'Avant la négo, rassemble : tes réalisations concrètes (chiffres, projets menés, résultats), les salaires du marché pour ton poste (Glassdoor, LinkedIn Salary, APEC), et ce que tu apportes de plus que le minimum attendu.',
      },
      {
        title: '2. Connaître les fourchettes du marché',
        content:
          'Va sur Glassdoor, LinkedIn Salary, ou l\'outil de l\'APEC pour connaître la fourchette de salaire pour ton poste, ton expérience et ta ville. Demande dans le haut de la fourchette — on te proposera probablement le milieu.',
      },
      {
        title: '3. Timing',
        content:
          'Les meilleurs moments pour négocier : à l\'embauche (tu as le plus de pouvoir), à la fin de ta période d\'essai, lors de l\'entretien annuel, après un gros succès/projet. Évite : les périodes de crise de l\'entreprise, juste après une erreur.',
      },
      {
        title: '4. La technique',
        content:
          'Annonce un chiffre précis (38 500 € plutôt que "entre 35 et 40K"). Justifie par tes compétences et le marché, pas par tes besoins personnels. Si on te dit non, demande : "Qu\'est-ce qu\'il faudrait pour y arriver ?" ou négocie d\'autres avantages (télétravail, formation, titre).',
      },
      {
        title: '5. Les avantages à négocier aussi',
        content:
          'Le salaire n\'est pas tout ! Tu peux aussi négocier : jours de télétravail, formation payée, tickets restaurant, prime de transport, mutuelle améliorée, jours de congés supplémentaires, participation/intéressement.',
      },
      {
        title: '💡 Le conseil du Parrain',
        content:
          'Ne négocie JAMAIS à la baisse. Si on te propose 32K et que tu voulais 35K, ne dis pas "bon, 33K ça ira". Dis "Je comprends, mais au vu de [arguments], je pense que 35K reflète mieux la valeur que j\'apporte. Est-ce qu\'on peut trouver un terrain d\'entente ?"',
      },
    ],
  },
];
