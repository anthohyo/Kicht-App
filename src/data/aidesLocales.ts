export interface AideLocale {
  id: string;
  nom: string;
  emoji: string;
  montant: string;
  description: string;
  demarche: string;
  eligibilite: 'eligible' | 'peut-etre' | 'non-eligible';
  /**
   * Provenance du montant. Sans ces deux champs, l'app ne doit PAS présenter
   * le chiffre comme un fait : les tarifs et barèmes locaux changent chaque
   * année, et un montant périmé affiché avec assurance fait plus de dégâts
   * qu'un montant absent.
   */
  source?: string;      // URL de la page officielle consultée
  verifieLe?: string;   // date ISO de la dernière vérification (AAAA-MM-JJ)
  /**
   * Aide jamais confrontée à une source officielle. Elle n'est PAS affichée.
   * Ces entrées ont été rédigées de mémoire : sur 7 contrôlées, 7 étaient
   * fausses — montant périmé, ou public cible erroné (bourses réservées à
   * une filière présentées comme générales). Envoyer un jeune réclamer une
   * aide à laquelle il n'a pas droit lui coûte du temps et de la confiance.
   * Retirer le drapeau uniquement après vérification, en remplissant
   * `source` et `verifieLe`.
   */
  aVerifier?: boolean;
  villes?: string[];
  departements?: string[];
  regions?: string[];
  statuts?: string[];
}

export const AIDES_LOCALES: AideLocale[] = [
  // --- Pays de la Loire / Nantes ---
  {
    id: 'naolib-jeune',
    nom: 'Abonnement Naolib moins de 26 ans',
    emoji: '🚊',
    montant: '255 €/an, gratuit selon ton quotient familial',
    description: 'Réseau tram, bus et navibus de Nantes Métropole pour les moins de 26 ans. La formule illimitée est un abonnement sur 12 mois à 255 € — environ 21 € par mois, contre 40 € au mois par mois. Et regarde absolument la tarification solidaire, calculée sur ton quotient familial : GRATUIT sous 350 €, 25,50 € de 351 à 500 €, 127,50 € de 501 à 600 €. Beaucoup de jeunes paient plein tarif sans l\'avoir demandée.',
    demarche: 'naolib.fr',
    eligibilite: 'eligible',
    villes: ['nantes'],
    departements: ['44'],
    regions: ['Pays de la Loire'],
    source: 'https://data.nantesmetropole.fr/explore/dataset/244400404_transports-en-commun-naolib-tarifs-01072026/',
    verifieLe: '2026-09-17',
  },

  {
    id: 'faj-bouches-du-rhone',
    nom: 'FAJ Bouches-du-Rhône',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Aide de dernier recours de ton département pour les 18-25 ans en difficulté : alimentation, logement, transport, formation. Le montant est fixé par chaque département et varie fortement — de quelques dizaines d\'euros à plus de 2 000 €/an selon les territoires. Point important : tu ne peux pas la demander seul·e en ligne. Le dossier doit être monté par un travailleur social, en pratique via ta MISSION LOCALE. Une procédure d\'urgence existe, traitée en 48 h pour les besoins vitaux.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['marseille', 'aix-en-provence'],
    departements: ['13'],
    regions: ['Provence-Alpes-Côte d\'Azur'],
    source: 'https://departement13.fr/en-actions/education-jeunesse/jeunes-de-provence/le-fonds-daide-aux-jeunes-faj',
    verifieLe: '2026-08-25',
  },

  {
    id: 'faj-alpes-maritimes',
    nom: 'FAJ Alpes-Maritimes',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Aide de dernier recours de ton département pour les 18-25 ans en difficulté : alimentation, logement, transport, formation. Le montant est fixé par chaque département et varie fortement — de quelques dizaines d\'euros à plus de 2 000 €/an selon les territoires. Point important : tu ne peux pas la demander seul·e en ligne. Le dossier doit être monté par un travailleur social, en pratique via ta MISSION LOCALE. Une procédure d\'urgence existe, traitée en 48 h pour les besoins vitaux.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['nice'],
    departements: ['06'],
    regions: ['Provence-Alpes-Côte d\'Azur'],
    source: 'https://www.departement06.fr/aides-et-services/fonds-d-aide-aux-jeunes-faj-2632.html',
    verifieLe: '2026-08-25',
  },

  // --- Nouvelle-Aquitaine / Bordeaux ---
  {
    id: 'tbm-pass-jeune',
    nom: 'Pass Jeune TBM 11-27 ans',
    emoji: '🚊',
    montant: 'Tarif réduit — prix sur la boutique TBM',
    description: 'Bordeaux Métropole propose un Pass Jeune à tarif réduit de 11 à 27 ans, en formule mensuelle ou annuelle, sur le tram, le bus et le Bato. C\'est l\'âge qui compte, pas le statut étudiant. Le prix a évolué au 1er juillet et nous n\'avons pas pu le confirmer sur une source officielle : vérifie-le sur la boutique TBM avant de souscrire.',
    demarche: 'infotbm.com',
    eligibilite: 'eligible',
    villes: ['bordeaux'],
    departements: ['33'],
    regions: ['Nouvelle-Aquitaine'],
    source: 'https://www.infotbm.com/fr/media/pass-jeune-11-27ans',
    verifieLe: '2026-09-17',
  },

  {
    id: 'faj-paris',
    nom: 'FAJ Paris',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Aide de dernier recours de ton département pour les 18-25 ans en difficulté : alimentation, logement, transport, formation. Le montant est fixé par chaque département et varie fortement — de quelques dizaines d\'euros à plus de 2 000 €/an selon les territoires. Point important : tu ne peux pas la demander seul·e en ligne. Le dossier doit être monté par un travailleur social, en pratique via ta MISSION LOCALE. Une procédure d\'urgence existe, traitée en 48 h pour les besoins vitaux.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['paris'],
    departements: ['75'],
    regions: ['Île-de-France'],
    source: 'https://www.paris.fr/pages/aides-aux-jeunes-2895',
    verifieLe: '2026-08-25',
  },

  // --- Provence-Alpes-Côte d'Azur / Marseille ---
  {
    id: 'rtm-pass-etudiant',
    nom: 'Pass Annuel Étudiant RTM',
    emoji: '🚋',
    montant: '220 €/an',
    description: 'Trajets illimités pendant 12 mois sur le réseau RTM (métro, tram, bus) en zone bleue. Accessible jusqu\'à 25 ans inclus, sur justificatif de scolarité. Soit environ 18 € par mois — à comparer au prix des tickets à l\'unité si tu te déplaces tous les jours.',
    demarche: 'rtm.fr',
    eligibilite: 'eligible',
    villes: ['marseille'],
    departements: ['13'],
    regions: ['Provence-Alpes-Côte d\'Azur'],
    statuts: ['etudiant'],
    source: 'https://www.rtm.fr/tarifs/pass-annuel-etudiant',
    verifieLe: '2026-08-25',
  },

  // --- Île-de-France / Paris ---
  {
    id: 'navigo-imagine-r',
    nom: 'Pass Navigo Imagine R',
    emoji: '🚇',
    montant: '401,30 €/an (au lieu de 1 090 €)',
    description: 'Trajets illimités sur toute l\'Île-de-France pendant l\'année scolaire. Attention : c\'est un engagement à l\'année, payable en 9 mensualités d\'environ 45 € ou en une fois — ce n\'est pas un abonnement mensuel qu\'on arrête quand on veut. Face aux 90,80 €/mois du forfait Navigo Mois, tu économises environ 688 € sur l\'année. En stage ou en alternance, ton employeur doit t\'en rembourser au moins la moitié.',
    demarche: 'iledefrance-mobilites.fr',
    eligibilite: 'eligible',
    source: 'https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/forfait-imagine-r-etudiant',
    verifieLe: '2026-08-25',
    // Portée RÉGIONALE et non parisienne : le forfait couvre toutes les zones
    // d'Île-de-France. Restreint à Paris, il disparaissait pour un étudiant de
    // Gentilly, de Montreuil ou de Cergy — soit la grande majorité des 12 millions
    // de Franciliens, qui y ont pourtant droit.
    regions: ['Île-de-France'],
    statuts: ['etudiant'],
  },
  {
    id: 'aide-urgence-crous-paris',
    nom: 'Aide d\'urgence CROUS Paris',
    emoji: '🆘',
    montant: 'de 1 454 € à 6 335 €/an',
    description: 'Deux formes existent. L\'aide PONCTUELLE, pour un coup dur passager, va jusqu\'à 3 071 € par versement (6 142 € maximum). L\'aide ANNUELLE, pour une situation durable d\'autonomie ou de rupture familiale, équivaut à une bourse : de 1 454 € à 6 335 € sur l\'année. Boursier ou pas, tu peux demander. Le passage se fait par le service social du CROUS, qui monte ton dossier avant la commission.',
    demarche: 'crous-paris.fr',
    eligibilite: 'peut-etre',
    villes: ['paris'],
    departements: ['75'],
    regions: ['Île-de-France'],
    statuts: ['etudiant'],
    source: 'https://www.crous-paris.fr/social-et-accompagnement/le-service-social-du-crous-de-paris/lallocation-annuelle/',
    verifieLe: '2026-08-25',
  },
  {
    id: 'resto-u-paris',
    nom: 'Resto U Paris',
    emoji: '🍽️',
    montant: '1 € le repas',
    description: 'Depuis mai 2026, le repas complet (entrée, plat, dessert) est à 1 € pour TOUS les étudiants dans les restaurants universitaires du CROUS — plus besoin d\'être boursier. C\'est le repas le moins cher que tu trouveras.',
    demarche: 'crous-paris.fr',
    eligibilite: 'eligible',
    villes: ['paris'],
    departements: ['75'],
    regions: ['Île-de-France'],
    statuts: ['etudiant'],
    source: 'https://www.etudiant.gouv.fr/fr/la-rentree-les-crous-proposeront-un-repas-1-euro-706',
    verifieLe: '2026-08-25',
  },
  {
    id: 'aide-logement-paris-habitat',
    nom: 'Aide au logement Paris Habitat',
    emoji: '🏠',
    montant: 'Aide à la caution',
    description: 'Paris Habitat propose une aide à la caution locative pour faciliter l\'accès au logement des jeunes actifs et étudiants. Permet de couvrir tout ou partie du dépôt de garantie.',
    demarche: 'parishabitat.fr',
    eligibilite: 'peut-etre',
    villes: ['paris'],
    departements: ['75'],
    regions: ['Île-de-France'],
    aVerifier: true,
  },

  // --- Auvergne-Rhône-Alpes / Lyon / Rhône ---
  {
    id: 'faj-rhone',
    nom: 'FAJ Rhône (Fonds d\'Aide aux Jeunes)',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Le Fonds d\'Aide aux Jeunes du Rhône permet d\'aider les jeunes de 18 à 25 ans en difficulté à financer un projet d\'insertion ou à faire face à une dépense urgente (loyer, permis, formation, matériel).',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['lyon'],
    departements: ['69'],
    regions: ['Auvergne-Rhône-Alpes'],
    source: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2021-09/Fiche%2031%20-%20Le%20fonds%20d%E2%80%99aide%20aux%20jeunes%20(FAJ).pdf',
    verifieLe: '2026-08-25',
  },
  {
    id: 'aide-mobilite-aura',
    nom: 'Aide mobilité région AURA',
    emoji: '🚗',
    montant: "jusqu'à 200 €",
    description: 'La région Auvergne-Rhône-Alpes finance une aide à la mobilité pour les apprentis et alternants qui doivent se déplacer entre leur domicile et leur lieu de formation ou d\'entreprise.',
    demarche: 'auvergnerhonealpes.fr',
    eligibilite: 'peut-etre',
    regions: ['Auvergne-Rhône-Alpes'],
    statuts: ['apprenti'],
    aVerifier: true,
  },
  {
    id: 'tcl-tarif-reduit',
    nom: 'Abonnement TCL 18-25 ans',
    emoji: '🚌',
    montant: '26 €/mois (zones 1-2), ou 260 €/an',
    description: 'À Lyon, le tarif réduit dépend de ton âge, pas de ton statut : de 18 à 25 ans, l\'abonnement est à 26 €/mois pour les zones 1 et 2, 35 € toutes zones. En formule 12 mois payée d\'un coup, c\'est 260 € (zones 1-2), soit environ 21,70 € par mois. Tu peux aussi payer par prélèvement mensuel sans engagement, avec 2 mois offerts chaque année. Étudiant de 26 ou 27 ans : une offre dédiée existe.',
    demarche: 'tcl.fr',
    eligibilite: 'peut-etre',
    villes: ['lyon'],
    departements: ['69'],
    regions: ['Auvergne-Rhône-Alpes'],
    source: 'https://www.tcl.fr/titres-et-tarifs/tous-les-titres-et-abonnements',
    verifieLe: '2026-09-17',
  },
  {
    id: 'aide-permis-aura',
    nom: 'Aide permis de conduire apprentis AURA',
    emoji: '🚗',
    montant: '150 € à 17 ans, ou jusqu’à 500 € via le PASS’Région',
    description: 'La région Auvergne-Rhône-Alpes finance une aide spécifique pour passer le permis de conduire, réservée aux apprentis en contrat d\'apprentissage. Indispensable pour faciliter l\'accès à l\'emploi.',
    demarche: 'auvergnerhonealpes.fr',
    eligibilite: 'peut-etre',
    regions: ['Auvergne-Rhône-Alpes'],
    statuts: ['apprenti'],
    source: 'https://www.auvergnerhonealpes.fr/aides',
    verifieLe: '2026-08-25',
  },
  {
    id: 'bourse-aura',
    nom: 'Bourse régionale AURA sur critères sociaux',
    emoji: '🎓',
    montant: "jusqu'à 1 800 €/an",
    description: 'Bourse complémentaire accordée par la région Auvergne-Rhône-Alpes aux étudiants en formation dans la région, sur critères sociaux. Vient compléter les aides nationales type bourse CROUS.',
    demarche: 'auvergnerhonealpes.fr',
    eligibilite: 'peut-etre',
    regions: ['Auvergne-Rhône-Alpes'],
    statuts: ['etudiant'],
    aVerifier: true,
  },

  // --- PACA / Marseille / Bouches-du-Rhône ---
  {
    id: 'aide-logement-paca',
    nom: 'Aide à l’hébergement Région Sud',
    emoji: '🏠',
    montant: '45 €/nuit, jusqu’à 1 500 €/an',
    description: 'Réservée aux élèves et étudiants inscrits dans une formation financée par la Région Sud, et seulement si ton domicile est à 40 km ou plus du lieu de formation, de stage ou d\'examen. Prise en charge des frais d\'hébergement jusqu\'à 45 € la nuit, dans la limite de 1 500 € par année de formation. Si tu n\'es pas dans une formation financée par la Région, cette aide ne te concerne pas.',
    demarche: 'aidesformation.maregionsud.fr',
    eligibilite: 'peut-etre',
    villes: ['marseille', 'nice', 'toulon', 'aix-en-provence'],
    departements: ['13', '06', '83'],
    regions: ['Provence-Alpes-Côte d\'Azur'],
    source: 'https://www.maregionsud.fr/vos-aides',
    verifieLe: '2026-08-25',
    statuts: ['etudiant', 'apprenti'],
  },
  {
    id: 'epicerie-crous-marseille',
    nom: 'Épicerie solidaire étudiante',
    emoji: '🛒',
    montant: 'Produits à 10-20 % du prix normal',
    description: 'Les épiceries solidaires étudiantes (AGORAé, épiceries du CROUS) vendent produits alimentaires et d\'hygiène à environ 10 à 20 % du prix du marché — un paquet de pâtes à 1 € en supermarché y est à quelques centimes. L\'accès n\'est pas libre : il faut déposer un dossier, examiné de façon anonyme en commission, sur la base de ton reste à vivre journalier (revenus moins dépenses, divisé par 30). Prends rendez-vous avec un assistant social du CROUS pour le monter.',
    demarche: 'mesrdv.lescrous.fr',
    eligibilite: 'peut-etre',
    villes: ['marseille', 'aix-en-provence'],
    departements: ['13'],
    regions: ['Provence-Alpes-Côte d\'Azur'],
    statuts: ['etudiant'],
    source: 'https://www.crous-nantes.fr/social-et-accompagnement/accompagnement-au-quotidien/epiceries-solidaires/',
    verifieLe: '2026-08-25',
  },
  {
    id: 'aide-mobilite-paca',
    nom: 'PRAME — mobilité étudiante à l’étranger',
    emoji: '🚌',
    montant: '125 €/semaine, jusqu’à 2 500 €/an',
    description: 'Attention, ce n\'est pas une aide aux transports du quotidien : la PRAME finance un séjour d\'études ou un stage à l\'étranger dans le cadre de ton cursus. 125 € par semaine complète, plafonné à 2 500 € par année universitaire. Le budget d\'une campagne peut être épuisé avant la fin de l\'année — surveille la réouverture de la plateforme pour l\'année suivante.',
    demarche: 'maregionsud.fr',
    eligibilite: 'peut-etre',
    regions: ['Provence-Alpes-Côte d\'Azur'],
    statuts: ['apprenti'],
    source: 'https://www.maregionsud.fr/vos-aides/detail/aide-a-la-mobilite-etudiante-prame-enseignement-superieur',
    verifieLe: '2026-08-25',
  },

  // --- Nouvelle-Aquitaine / Bordeaux / Gironde ---
  {
    id: 'aide-jeune-actif-na',
    nom: 'Aide jeune actif Nouvelle-Aquitaine',
    emoji: '💼',
    montant: "jusqu'à 400 €",
    description: 'La région Nouvelle-Aquitaine propose une aide financière aux jeunes en emploi ou en formation pour couvrir des frais liés à leur insertion professionnelle (équipement, transport, logement).',
    demarche: 'nouvelle-aquitaine.fr',
    eligibilite: 'peut-etre',
    regions: ['Nouvelle-Aquitaine'],
    statuts: ['apprenti', 'salarie'],
    aVerifier: true,
  },
  {
    id: 'pass-sport-bordeaux',
    nom: 'Pass\'Sport Bordeaux Métropole',
    emoji: '⚽',
    montant: 'tarif réduit',
    description: 'Bordeaux Métropole propose un Pass\'Sport permettant aux jeunes résidents d\'accéder à des activités sportives à tarif fortement réduit. Idéal pour pratiquer une activité physique sans se ruiner.',
    demarche: 'bordeaux-metropole.fr',
    eligibilite: 'peut-etre',
    villes: ['bordeaux'],
    departements: ['33'],
    regions: ['Nouvelle-Aquitaine'],
    aVerifier: true,
  },
  {
    id: 'faj-gironde',
    nom: 'FAJ Gironde',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Le Fonds d\'Aide aux Jeunes de la Gironde accompagne les jeunes de 18 à 25 ans en difficulté dans leur démarche d\'insertion sociale et professionnelle. Aide pour financer des besoins urgents et essentiels.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['bordeaux'],
    departements: ['33'],
    regions: ['Nouvelle-Aquitaine'],
    source: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2021-09/Fiche%2031%20-%20Le%20fonds%20d%E2%80%99aide%20aux%20jeunes%20(FAJ).pdf',
    verifieLe: '2026-08-25',
  },

  // --- Occitanie / Toulouse / Haute-Garonne ---
  {
    id: 'bourse-occitanie',
    nom: 'Bourse complémentaire région Occitanie',
    emoji: '🎓',
    montant: 'Réservée aux filières sanitaires et sociales',
    description: 'La région Occitanie verse une bourse complémentaire aux étudiants boursiers suivant une formation dans la région. Cette aide s\'ajoute aux aides nationales pour améliorer le pouvoir d\'achat des étudiants.',
    demarche: 'laregion.fr',
    eligibilite: 'peut-etre',
    regions: ['Occitanie'],
    statuts: ['etudiant'],
    source: 'https://www.laregion.fr/bourses-etudes-sanitaires-sociales',
    verifieLe: '2026-08-25',
  },
  {
    id: 'tisseo-etudiant',
    nom: 'Abonnement Tisséo jeunes',
    emoji: '🚌',
    montant: '16 €/mois, ou 169,60 €/an étudiant',
    description: 'Sur le réseau Tisséo, un étudiant de 20 à 25 ans paie 16 € les 31 jours ou 169,60 € à l\'année, au lieu de 59 € et 625,40 € au plein tarif. Boursier de 11 à 25 ans : 12,80 € les 31 jours. Jusqu\'à 19 ans, le tarif jeune est le même que le tarif étudiant. Et si tu as entre 20 et 25 ans sans être étudiant, l\'abonnement annuel reste réduit, à 198,20 €.',
    demarche: 'tisseo.fr',
    eligibilite: 'eligible',
    villes: ['toulouse'],
    departements: ['31'],
    regions: ['Occitanie'],
    source: 'https://eboutique.tisseo.fr/fr/produits/annuel-niveau-3-etudiants-20-25ans',
    verifieLe: '2026-09-17',
  },
  {
    id: 'faj-haute-garonne',
    nom: 'FAJ Haute-Garonne',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Le Fonds d\'Aide aux Jeunes de Haute-Garonne soutient les jeunes de 18 à 25 ans en situation précaire. L\'aide finance des projets d\'insertion : formation, emploi, logement, mobilité.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['toulouse'],
    departements: ['31'],
    regions: ['Occitanie'],
    source: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2021-09/Fiche%2031%20-%20Le%20fonds%20d%E2%80%99aide%20aux%20jeunes%20(FAJ).pdf',
    verifieLe: '2026-08-25',
  },

  // --- Occitanie / Montpellier / Hérault ---
  {
    id: 'aide-logement-herault',
    nom: 'Aide logement jeune Hérault',
    emoji: '🏠',
    montant: "jusqu'à 300 €",
    description: 'Le département de l\'Hérault propose une aide financière aux jeunes pour faciliter leur accès à un logement autonome. Peut couvrir une partie du dépôt de garantie ou des frais de premier mois.',
    demarche: 'herault.fr',
    eligibilite: 'peut-etre',
    villes: ['montpellier'],
    departements: ['34'],
    regions: ['Occitanie'],
    aVerifier: true,
  },
  {
    id: 'epicerie-crous-montpellier',
    nom: 'Épicerie solidaire étudiante',
    emoji: '🛒',
    montant: 'Produits à 10-20 % du prix normal',
    description: 'Les épiceries solidaires étudiantes (AGORAé, épiceries du CROUS) vendent produits alimentaires et d\'hygiène à environ 10 à 20 % du prix du marché — un paquet de pâtes à 1 € en supermarché y est à quelques centimes. L\'accès n\'est pas libre : il faut déposer un dossier, examiné de façon anonyme en commission, sur la base de ton reste à vivre journalier (revenus moins dépenses, divisé par 30). Prends rendez-vous avec un assistant social du CROUS pour le monter.',
    demarche: 'mesrdv.lescrous.fr',
    eligibilite: 'peut-etre',
    villes: ['montpellier'],
    departements: ['34'],
    regions: ['Occitanie'],
    statuts: ['etudiant'],
    source: 'https://www.crous-nantes.fr/social-et-accompagnement/accompagnement-au-quotidien/epiceries-solidaires/',
    verifieLe: '2026-08-25',
  },
  {
    id: 'tam-etudiant',
    nom: 'Transports TaM — gratuits',
    emoji: '🚊',
    montant: 'Gratuit si tu habites la métropole',
    description: 'Le réseau TaM (tram + bus) est entièrement gratuit pour tous les habitants des 31 communes de Montpellier Méditerranée Métropole, depuis décembre 2023. Il te faut juste demander le Pass gratuité nominatif : pièce d\'identité, photo et justificatif de domicile à ton nom, via l\'appli M\'Ticket, la boutique TaM ou un Espace Mobilité. À renouveler chaque année. Si tu n\'habites pas la métropole, il existe des abonnements réduits pour les moins de 26 ans.',
    demarche: 'montpellier-mobilite.fr',
    eligibilite: 'eligible',
    villes: ['montpellier'],
    departements: ['34'],
    regions: ['Occitanie'],
    source: 'https://montpellier-mobilite.fr/tarifs-de-transport',
    verifieLe: '2026-08-25',
  },

  // --- Hauts-de-France / Lille / Nord ---
  {
    id: 'aide-urgence-hdf',
    nom: 'FRAU — Fonds régional d’aide d’urgence',
    emoji: '🆘',
    montant: '500 € non renouvelables',
    description: 'Aide d\'urgence de la Région Hauts-de-France, versée rapidement. Important : elle est réservée aux élèves et étudiants des filières SANITAIRES ET SOCIALES (infirmier, aide-soignant, éducateur…), boursiers comme non-boursiers. 500 € une seule fois dans l\'année scolaire. Si tu es dans une autre filière, tourne-toi vers le fonds d\'urgence du CROUS.',
    demarche: 'guide-aides.hautsdefrance.fr',
    eligibilite: 'peut-etre',
    villes: ['lille', 'amiens'],
    departements: ['59', '80'],
    regions: ['Hauts-de-France'],
    source: 'https://guide-aides.hautsdefrance.fr/dispositif341',
    verifieLe: '2026-08-25',
  },
  {
    id: 'carte-avantage-mel',
    nom: 'Abonnement ilévia 4-25 ans',
    emoji: '🚇',
    montant: 'de 3,60 € à 33,40 €/mois selon ton quotient familial',
    description: 'À Lille, l\'abonnement des 4-25 ans dépend de ton quotient familial CAF. Au tarif standard : 33,40 € au mois, ou 28,65 €/mois en formule 10 mois ou annuelle. Avec un QF sous 810 €, les tarifs sociaux descendent à 14,32 €/mois (QF de 608 à 810 €), 8,54 € (457 à 607 €) et 3,60 € (jusqu\'à 456 €) en formule annuelle. L\'écart atteint environ 300 € sur l\'année pour le même service — fais calculer ton quotient avant de souscrire. Les abonnements à l\'année incluent V\'lille gratuitement.',
    demarche: 'ilevia.fr',
    eligibilite: 'eligible',
    villes: ['lille'],
    departements: ['59'],
    regions: ['Hauts-de-France'],
    source: 'https://www.ilevia.fr/cms/institutionnel/les-offres-4-25-ans',
    verifieLe: '2026-09-17',
  },
  {
    id: 'faj-nord',
    nom: 'FAJ Nord',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Le Fonds d\'Aide aux Jeunes du Nord aide les jeunes de 18 à 25 ans en difficulté à financer un projet d\'insertion professionnelle ou à couvrir une dépense urgente et nécessaire.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['lille'],
    departements: ['59'],
    regions: ['Hauts-de-France'],
    source: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2021-09/Fiche%2031%20-%20Le%20fonds%20d%E2%80%99aide%20aux%20jeunes%20(FAJ).pdf',
    verifieLe: '2026-08-25',
  },

  // --- Bretagne / Rennes / Ille-et-Vilaine ---
  {
    id: 'aide-mobilite-bretagne',
    nom: 'Aide mobilité Bretagne',
    emoji: '🚗',
    montant: "jusqu'à 200 €/an",
    description: 'La région Bretagne finance les déplacements des apprentis dans le cadre de leur formation. Cette aide couvre une partie des frais de transport entre le domicile, l\'entreprise et le CFA.',
    demarche: 'bretagne.bzh',
    eligibilite: 'peut-etre',
    regions: ['Bretagne'],
    statuts: ['apprenti'],
    aVerifier: true,
  },
  {
    id: 'bourse-bretagne',
    nom: 'B-Monde — mobilité internationale',
    emoji: '🌍',
    montant: 'Variable selon durée et destination',
    description: 'La Région Bretagne ne verse pas de bourse d\'études générale : son dispositif B-Monde finance un séjour d\'études ou un stage à l\'étranger, à partir de 26 jours. Le montant dépend de ta situation (boursier, situation de handicap), de la durée et de la destination. Condition d\'accès : quotient familial du foyer inférieur à 30 000 €. Avec Erasmus+, la Région ajoute 200 € pour les destinations qu\'elle a définies comme prioritaires.',
    demarche: 'bretagne.bzh',
    eligibilite: 'peut-etre',
    regions: ['Bretagne'],
    statuts: ['etudiant'],
    source: 'https://www.bretagne.bzh/aides/fiches/b-monde-mobilite-individuelle/',
    verifieLe: '2026-08-25',
  },
  {
    id: 'faj-ille-et-vilaine',
    nom: 'FAJ Ille-et-Vilaine',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Le Fonds d\'Aide aux Jeunes d\'Ille-et-Vilaine soutient les jeunes de 18 à 25 ans résidant dans le département pour financer un projet d\'insertion ou faire face à une situation de précarité.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['rennes'],
    departements: ['35'],
    regions: ['Bretagne'],
    source: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2021-09/Fiche%2031%20-%20Le%20fonds%20d%E2%80%99aide%20aux%20jeunes%20(FAJ).pdf',
    verifieLe: '2026-08-25',
  },

  // --- Pays de la Loire / Nantes / Loire-Atlantique ---
  {
    id: 'faj-loire-atlantique',
    nom: 'FAJ Loire-Atlantique',
    emoji: '💶',
    montant: 'jusqu\'à 1 600 €/an',
    description: 'Le Fonds d\'Aide aux Jeunes de Loire-Atlantique accompagne les jeunes de 18 à 25 ans en insertion sociale et professionnelle. Aide financière pour des besoins essentiels ou un projet d\'avenir.',
    demarche: 'loire-atlantique.fr',
    eligibilite: 'peut-etre',
    villes: ['nantes'],
    departements: ['44'],
    regions: ['Pays de la Loire'],
    source: 'https://www.loire-atlantique.fr/44/jeunesse/le-fonds-d-aide-aux-jeunes-faj-individuel/c_1277824',
    verifieLe: '2026-08-25',
  },
  {
    id: 'aide-logement-nantes',
    nom: 'Aide logement jeune Nantes Métropole',
    emoji: '🏠',
    montant: "jusqu'à 200 €",
    description: 'Nantes Métropole propose une aide financière pour faciliter l\'accès au logement des jeunes. Cette aide peut couvrir une partie des frais d\'installation dans un premier logement autonome.',
    demarche: 'nantesmetropole.fr',
    eligibilite: 'peut-etre',
    villes: ['nantes'],
    departements: ['44'],
    regions: ['Pays de la Loire'],
    aVerifier: true,
  },
  {
    id: 'bourse-pays-de-la-loire',
    nom: 'Bourse régionale sanitaire et sociale',
    emoji: '🎓',
    montant: 'de 1 454 € à 6 335 €/an',
    description: 'Réservée aux élèves et étudiants en formation sociale, paramédicale ou de sage-femme (infirmier, aide-soignant, éducateur spécialisé…). Le montant suit le même barème que la bourse CROUS, par échelon, de 1 454 à 6 335 € par an. Pour une autre filière, cette bourse ne te concerne pas — vise la bourse CROUS. La Région propose par ailleurs Envoléo, de 500 à 1 000 €, pour un séjour d\'études à l\'étranger.',
    demarche: 'paysdelaloire.fr',
    eligibilite: 'peut-etre',
    regions: ['Pays de la Loire'],
    statuts: ['etudiant'],
    source: 'https://www.paysdelaloire.fr/les-aides/bourses-regionales-pour-les-eleves-et-etudiants-en-formation-initiale-sociale-paramedicale-et-de',
    verifieLe: '2026-08-25',
  },

  // --- Grand Est / Strasbourg / Bas-Rhin ---
  {
    id: 'aide-jeune-grand-est',
    nom: 'Jeun’Est — avantages 15-29 ans',
    emoji: '🎟️',
    montant: 'Avantages culture, sport et loisirs',
    description: 'Jeun\'Est n\'est pas une aide en argent mais un ensemble d\'avantages pour les 15-29 ans du Grand Est : culture, sport, tourisme, selon ton statut. La Région finance par ailleurs des projets de jeunes — engagement citoyen ou insertion professionnelle — jusqu\'à 2 000 €, et jusqu\'à 5 000 € pour un projet de création d\'entreprise. Ce sont des dossiers de projet, pas des aides automatiques.',
    demarche: 'jeunest.fr',
    eligibilite: 'peut-etre',
    villes: ['strasbourg', 'metz', 'nancy', 'reims'],
    departements: ['67', '57', '54', '51'],
    regions: ['Grand Est'],
    source: 'https://www.grandest.fr/vos-aides-regionales/',
    verifieLe: '2026-08-25',
  },
  {
    id: 'cts-etudiant',
    nom: 'Abonnement CTS 18-25 ans',
    emoji: '🚌',
    montant: '28 €/mois, dès 3,40 € selon ta situation',
    description: 'À Strasbourg, le tarif dépend de ton âge, pas de ton statut : de 18 à 25 ans, l\'abonnement est à 28 €/mois ou 280 €/an, contre 56 € à partir de 26 ans. Surtout, la tarification solidaire de l\'Eurométropole le fait tomber à 13,60 €/mois pour un boursier échelon 1-2, 7,30 € échelon 3-4 et 3,40 € échelon 5-7 — même chose selon ton quotient familial CAF s\'il est sous 795 €. Elle ne s\'applique pas d\'office : il faut la demander. En stage ou en alternance, ton employeur prend en charge au moins la moitié.',
    demarche: 'cts-strasbourg.fr',
    eligibilite: 'eligible',
    villes: ['strasbourg'],
    departements: ['67'],
    regions: ['Grand Est'],
    source: 'https://www.cts-strasbourg.eu/en/buy/our-tickets/regular-tickets/reduced-fare-subscription/',
    verifieLe: '2026-09-17',
  },
  {
    id: 'faj-bas-rhin',
    nom: 'FAJ Bas-Rhin',
    emoji: '💶',
    montant: 'Montant fixé par ton département',
    description: 'Le Fonds d\'Aide aux Jeunes du Bas-Rhin accompagne les jeunes de 18 à 25 ans dans leur parcours d\'insertion. Aide financière pour financer un projet professionnel ou couvrir des besoins urgents.',
    demarche: 'mission-locale.fr',
    eligibilite: 'peut-etre',
    villes: ['strasbourg'],
    departements: ['67'],
    regions: ['Grand Est'],
    source: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2021-09/Fiche%2031%20-%20Le%20fonds%20d%E2%80%99aide%20aux%20jeunes%20(FAJ).pdf',
    verifieLe: '2026-08-25',
  },
];

/**
 * Extrait le montant maximum en € depuis une chaîne comme "jusqu'à 500 €" ou "38 €/mois".
 * Retourne 0 si aucun nombre trouvé.
 */
export function extractMaxAmount(montant: string): number {
  const nums = montant.match(/\d+/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

/**
 * Calcule le potentiel total estimé (somme des montants max des aides éligibles/peut-être).
 */
export function getTotalPotentiel(aides: AideLocale[]): number {
  return aides
    .filter((a) => a.eligibilite !== 'non-eligible')
    .reduce((sum, a) => sum + extractMaxAmount(a.montant), 0);
}

export function getAidesLocales(
  ville?: string,
  departement?: string,
  region?: string,
  statut?: string,
): AideLocale[] {
  if (!ville && !departement && !region) return [];

  const villeLower = ville?.toLowerCase();

  const result: AideLocale[] = [];
  const seen = new Set<string>();

  for (const aide of AIDES_LOCALES) {
    // Jamais d'aide non vérifiée à l'écran : mieux vaut ne rien proposer
    // que d'envoyer quelqu'un réclamer un droit qu'il n'a pas.
    if (aide.aVerifier) continue;

    // Filtre par statut
    if (statut && aide.statuts && aide.statuts.length > 0) {
      if (!aide.statuts.includes(statut)) continue;
    }

    const hasVilleScope = !!aide.villes?.length;
    const hasDeptScope = !!aide.departements?.length;

    const matchesVille = villeLower && hasVilleScope && aide.villes!.includes(villeLower);
    const matchesDept = departement && hasDeptScope && aide.departements!.includes(departement);

    // Une aide région-wide ne doit matcher que si elle n'a PAS de restriction ville/dept.
    // Cela évite d'afficher "Tisséo Toulouse" pour un utilisateur à Montpellier
    // simplement parce que les deux sont en Occitanie.
    const isRegionWide = !hasVilleScope && !hasDeptScope;
    const matchesRegion = region && isRegionWide && aide.regions?.includes(region);

    if (matchesVille || matchesDept || matchesRegion) {
      if (!seen.has(aide.id)) {
        seen.add(aide.id);
        result.push(aide);
      }
    }
  }

  // Tri : éligible > peut-etre > autres ; puis par ville > dept > region
  result.sort((a, b) => {
    const scoreElig = (e: AideLocale['eligibilite']) =>
      e === 'eligible' ? 0 : e === 'peut-etre' ? 1 : 2;
    return scoreElig(a.eligibilite) - scoreElig(b.eligibilite);
  });

  return result;
}
