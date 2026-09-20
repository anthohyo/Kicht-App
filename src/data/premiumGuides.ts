import { Guide } from '../types';

/**
 * Fiches avancées (épargne, impôts, investissement).
 *
 * Règles de rédaction, à respecter à chaque modification :
 *
 * 1. Aucun nom de courtier, de banque ou de produit commercial. Citer des
 *    enseignes revient à recommander des produits financiers, ce qui relève du
 *    conseil en investissement, réglementé par l'AMF — et fait planer un doute
 *    sur un éventuel partenariat.
 * 2. Tout taux porte sa date. Le Livret A est passé de 3 % à 1,7 % en trois
 *    révisions : un taux non daté devient faux en quelques mois.
 * 3. Une projection de rendement est présentée comme un exemple de calcul,
 *    jamais comme un résultat attendu.
 *
 * Taux réglementés au 20/09/2026 — Livret A et LDDS 1,7 %, LEP 2,5 % depuis le
 * 1er août 2026 (communiqué du ministère de l'Économie, presse.economie.gouv.fr).
 * Le champ `premium` est un reliquat : tout est gratuit (voir utils/premium.ts).
 */
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
          'Livret A et LDDS : épargne sans risque, disponible à tout moment, 1,7 %/an depuis le 1er août 2026 (taux fixé par l\'État, révisé deux fois par an). LEP : 2,5 %/an, réservé aux revenus modestes — ta banque vérifie ton revenu fiscal de référence. PEA (Plan d\'Épargne en Actions) : pour investir en bourse avec un avantage fiscal après 5 ans. Assurance-vie : enveloppe polyvalente, fiscalité avantageuse après 8 ans. Compte-titres : pour investir librement, mais pas d\'avantage fiscal.',
      },
      {
        title: '3. Les ETF, le meilleur choix pour débuter',
        content:
          'Un ETF (ou tracker) est un fonds qui réplique un indice boursier (ex: le CAC 40 ou le MSCI World). Son intérêt : il répartit ton argent sur des centaines d\'entreprises d\'un coup, et ses frais annuels sont bien plus bas que ceux d\'un fonds géré à la main. Attention quand même : un ETF actions peut perdre 30 à 40 % lors d\'une crise. Diversifié ne veut pas dire sans risque.',
      },
      {
        title: '4. Ouvre un PEA',
        content:
          'Après 5 ans, les gains d\'un PEA sont exonérés d\'impôt sur le revenu : tu ne paies que 17,2 % de prélèvements sociaux, au lieu de 30 % sur un compte-titres. Il se souscrit dans une banque ou chez un courtier en ligne ; compare les frais de courtage et les frais de garde avant de choisir, ce sont eux qui font la différence sur la durée.',
      },
      {
        title: '5. Investis régulièrement (DCA)',
        content:
          'Le DCA (Dollar Cost Averaging) = investir un montant fixe chaque mois, quoi qu\'il arrive. Ex : 50 €/mois sur un ETF World. Tu achètes parfois cher, parfois pas cher, mais en moyenne tu lisses le risque. C\'est la stratégie la plus simple et la plus efficace pour un débutant.',
      },
      {
        title: '6. Les erreurs à éviter',
        content:
          '• Ne pas investir de l\'argent dont tu as besoin à court terme\n• Ne pas essayer de "timer" le marché (personne n\'y arrive)\n• Ne pas vendre en panique quand ça baisse\n• Ne pas mettre tous ses œufs dans le même panier\n• Se méfier des "gourous" qui promettent des rendements miracles : sur les réseaux, un rendement garanti est le signal d\'une arnaque\n• Les cryptomonnaies sont extrêmement volatiles et ne sont garanties par personne : n\'y mets jamais un argent dont tu as besoin',
      },
      {
        title: '⚠️ Ce que cette fiche n\'est pas',
        content:
          'Ce qui est écrit ici explique des règles générales : ce n\'est pas un conseil en investissement personnalisé, et personne à KichtApp ne connaît ta situation complète. Aucun produit, aucune banque et aucun courtier n\'est recommandé, et l\'app ne touche rien de personne. Avant d\'engager de l\'argent, renseigne-toi auprès d\'un professionnel, et rappelle-toi la règle de base : si tu ne comprends pas où va ton argent, n\'y va pas.',
      },
      {
        title: '💡 Le pouvoir du temps',
        content:
          'Un exemple de calcul, pas une promesse : 100 €/mois placés de 20 à 60 ans donneraient environ 264 000 € si le rendement moyen était de 7 %/an ; en commençant à 30 ans, environ 122 000 €. Ce qui change tout, c\'est le temps, pas le montant. Mais personne ne peut garantir un rendement : les marchés montent et descendent, et le passé ne préjuge pas de l\'avenir. Prends ce chiffre comme une illustration de l\'effet du temps, pas comme un objectif.',
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
          'Certains dispositifs permettent de réduire ses impôts en investissant dans l\'immobilier locatif — le Pinel, le plus connu, s\'est arrêté fin 2024 et n\'est plus souscrivable ; le Denormandie, lui, existe toujours pour la rénovation dans certaines villes. C\'est un sujet pour bien plus tard : ces montages supposent un apport, un crédit et des revenus imposables que tu n\'as pas encore. À connaître, pas à faire maintenant.',
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
          'Objectif : y mettre 2-3 mois de dépenses (~2 000-5 000 €). Taux : 1,7 % depuis le 1er août 2026. Plafond : 22 950 €. C\'est ton argent de sécurité, à ne toucher qu\'en cas d\'urgence. Si tes revenus sont modestes, regarde aussi le LEP (2,5 %, sous condition de revenu fiscal de référence) : mieux rémunéré, même sécurité.',
      },
      {
        title: '4. L\'assurance-vie — ta boîte à outils',
        content:
          'Une assurance-vie en ligne a généralement des frais bien plus bas qu\'un contrat souscrit au guichet : regarde les frais sur versement (idéalement 0 %) et les frais de gestion annuels. Tu peux y mettre du fonds euros (capital garanti, rendement modeste) et des unités de compte (plus risqué, capital non garanti). Fiscalité avantageuse après 8 ans.',
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
