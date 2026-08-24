import { Parcours } from '../types';

export const parcoursList: Parcours[] = [
  {
    id: 'etudiant',
    title: 'Je suis étudiant·e',
    emoji: '🎓',
    description: 'Les démarches et aides essentielles quand on étudie.',
    forStatus: ['etudiant'],
    steps: [
      {
        title: 'Demander la bourse CROUS',
        description: 'Fais ton DSE sur messervices.etudiant.gouv.fr (entre janvier et mai). Le montant dépend des revenus de tes parents.',
        action: { screen: 'Guides', label: 'Voir le guide' },
      },
      {
        title: 'Demander l\'APL',
        description: 'Si tu paies un loyer, fais ta demande sur caf.fr dès ton emménagement.',
        action: { screen: 'Aides', label: 'Simuler mes aides' },
      },
      {
        title: 'Vérifier la CSS (mutuelle gratuite)',
        description: 'Si tu as de petits revenus, tu peux avoir une mutuelle gratuite. Demande sur ameli.fr.',
        action: { screen: 'Guides', label: 'Voir le guide' },
      },
      {
        title: 'Faire sa déclaration d\'impôts',
        description: 'Oui, même étudiant·e ! L\'avis d\'imposition est nécessaire pour les aides.',
        action: { screen: 'Guides', label: 'Voir le guide' },
      },
      {
        title: 'Obtenir la carte étudiante internationale',
        description: 'L\'ISIC te donne des réductions partout dans le monde (~15 €/an).',
      },
      {
        title: 'Mettre en place un budget',
        description: 'Utilise l\'onglet Budget pour suivre tes dépenses et ne pas finir dans le rouge.',
        action: { screen: 'Main', label: 'Aller au budget' },
      },
    ],
  },
  {
    id: 'premier-emploi',
    title: 'Mon premier emploi',
    emoji: '💼',
    description: 'Tout ce qu\'il faut savoir quand on commence à travailler.',
    forStatus: ['salarie', 'apprenti'],
    steps: [
      {
        title: 'Comprendre ta fiche de paie',
        description: 'Brut, net, net imposable… Apprends à lire ton bulletin pour ne pas te faire avoir.',
        action: { screen: 'Guides', label: 'Voir le guide' },
      },
      {
        title: 'Vérifier la prime d\'activité',
        description: 'Si tu gagnes moins de ~1 800 €/mois, tu y as probablement droit. Simule sur caf.fr.',
        action: { screen: 'Aides', label: 'Simuler mes aides' },
      },
      {
        title: 'Demander le remboursement transport',
        description: 'Ton employeur DOIT rembourser 50% de ton abonnement transport (Navigo, etc.). Donne-lui ton justificatif.',
      },
      {
        title: 'Vérifier ta mutuelle d\'entreprise',
        description: 'Ton employeur doit te proposer une mutuelle et payer au moins 50%. Vérifie les garanties et inscris-toi.',
      },
      {
        title: 'Ouvrir un livret A',
        description: 'Mets de côté chaque mois, même un petit montant. L\'objectif : 2-3 mois de dépenses en matelas de sécurité.',
      },
      {
        title: 'Préparer sa déclaration d\'impôts',
        description: 'Tu devras déclarer tes revenus entre avril et juin. C\'est en grande partie pré-rempli.',
        action: { screen: 'Guides', label: 'Voir le guide' },
      },
    ],
  },
  {
    id: 'demenagement',
    title: 'Je déménage',
    emoji: '🏠',
    description: 'La checklist complète pour un emménagement sans galère.',
    forStatus: ['etudiant', 'apprenti', 'salarie', 'recherche_emploi', 'autre'],
    steps: [
      {
        title: 'Préparer ton dossier de location',
        description: 'Pièce d\'identité, fiches de paie, avis d\'imposition, RIB. Prépare tout en avance.',
        action: { screen: 'Guides', label: 'Voir le guide' },
      },
      {
        title: 'S\'inscrire sur Visale.fr',
        description: 'Caution gratuite de l\'État si tu as moins de 30 ans. Fais-le AVANT les visites.',
        action: { screen: 'Aides', label: 'Simuler mes aides' },
      },
      {
        title: 'Souscrire une assurance habitation',
        description: 'Obligatoire AVANT la remise des clés. Compare en ligne : Luko, MAIF, MACIF…',
      },
      {
        title: 'Ouvrir les compteurs',
        description: 'Électricité (EDF ou autre), gaz si besoin, et internet. Compare les offres !',
      },
      {
        title: 'Demander l\'APL',
        description: 'Fais-le DÈS le premier jour sur caf.fr. Chaque mois perdu = argent perdu.',
        action: { screen: 'Aides', label: 'Simuler mes aides' },
      },
      {
        title: 'Changer ton adresse',
        description: 'Impôts, CAF, CPAM, banque, mutuelle, La Poste… Utilise service-public.fr > "Je déménage".',
      },
      {
        title: 'Compléter la checklist premier appart',
        description: 'Utilise la checklist de l\'app pour ne rien oublier !',
        action: { screen: 'Checklist', label: 'Voir la checklist' },
      },
    ],
  },
  {
    id: 'recherche-emploi',
    title: 'Je cherche un emploi',
    emoji: '🔍',
    description: 'Les aides et démarches quand on est en recherche d\'emploi.',
    forStatus: ['recherche_emploi'],
    steps: [
      {
        title: 'S\'inscrire à France Travail (Pôle Emploi)',
        description: 'Inscris-toi sur francetravail.fr dès la fin de ton contrat. C\'est la première étape pour toucher le chômage.',
      },
      {
        title: 'Vérifier tes droits au chômage',
        description: 'Il faut avoir travaillé au moins 6 mois sur les 24 derniers mois. Le montant dépend de ton ancien salaire (~57% du brut).',
      },
      {
        title: 'Contacter la Mission locale',
        description: 'Si tu as moins de 26 ans, la Mission locale t\'accompagne gratuitement : CV, entretiens, formation, aides financières.',
      },
      {
        title: 'Vérifier la prime d\'activité',
        description: 'Même au chômage, tu peux y avoir droit dans certains cas. Simule sur caf.fr.',
        action: { screen: 'Aides', label: 'Simuler mes aides' },
      },
      {
        title: 'Faire sa déclaration d\'impôts',
        description: 'Les allocations chômage sont imposables. Déclare-les pour garder ton avis d\'imposition à jour.',
        action: { screen: 'Guides', label: 'Voir le guide' },
      },
      {
        title: 'Explorer les formations',
        description: 'France Travail propose des formations gratuites. Consulte aussi ton Compte Personnel de Formation (CPF) sur moncompteformation.gouv.fr.',
      },
    ],
  },
];
