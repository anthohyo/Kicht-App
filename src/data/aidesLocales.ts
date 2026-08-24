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
    villes: ['paris'],
    departements: ['75'],
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
    nom: 'Abonnement TCL étudiant',
    emoji: '🚌',
    montant: '15 €/mois',
    description: 'Depuis septembre 2026, les étudiants de moins de 28 ans paient 15 €/mois pour circuler sur tout le réseau TCL (métro, tram, bus, funiculaire). Justificatif de scolarité à fournir.',
    demarche: 'tcl.fr',
    eligibilite: 'peut-etre',
    villes: ['lyon'],
    departements: ['69'],
    regions: ['Auvergne-Rhône-Alpes'],
    statuts: ['etudiant'],
    source: 'https://www.tcl.fr/titres-et-tarifs/tous-les-titres-et-abonnements',
    verifieLe: '2026-08-25',
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
    nom: 'Aide logement jeune PACA',
    emoji: '🏠',
    montant: "jusqu'à 300 €",
    description: 'La région Provence-Alpes-Côte d\'Azur propose une aide financière pour les jeunes de 18 à 30 ans afin de faciliter leur accès au logement. Peut couvrir une partie du dépôt de garantie ou du premier loyer.',
    demarche: 'maregionsud.fr',
    eligibilite: 'peut-etre',
    villes: ['marseille', 'nice', 'toulon', 'aix-en-provence'],
    departements: ['13', '06', '83'],
    regions: ['Provence-Alpes-Côte d\'Azur'],
    aVerifier: true,
  },
  {
    id: 'epicerie-crous-marseille',
    nom: 'Épicerie sociale CROUS Marseille',
    emoji: '🛒',
    montant: 'courses à -70%',
    description: 'Le CROUS Aix-Marseille propose une épicerie sociale permettant aux étudiants boursiers de faire leurs courses alimentaires à des prix réduits de 70% par rapport aux prix du marché.',
    demarche: 'crous-aix-marseille.fr',
    eligibilite: 'peut-etre',
    villes: ['marseille', 'aix-en-provence'],
    departements: ['13'],
    regions: ['Provence-Alpes-Côte d\'Azur'],
    statuts: ['etudiant'],
    aVerifier: true,
  },
  {
    id: 'aide-mobilite-paca',
    nom: 'Aide mobilité PACA',
    emoji: '🚌',
    montant: "jusqu'à 200 €",
    description: 'La région Sud Provence-Alpes-Côte d\'Azur finance les déplacements des apprentis et alternants entre leur domicile, leur CFA et leur entreprise. Une aide concrète pour les jeunes en formation professionnelle.',
    demarche: 'maregionsud.fr',
    eligibilite: 'peut-etre',
    regions: ['Provence-Alpes-Côte d\'Azur'],
    statuts: ['apprenti'],
    aVerifier: true,
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
    nom: 'Aide transport étudiant Tisséo',
    emoji: '🚌',
    montant: '16 €/mois (12,80 € si boursier)',
    description: 'Abonnement étudiant sur tout le réseau Tisséo pour les moins de 26 ans, soit 169,60 € à l\'année. Si tu es boursier, le tarif descend à 12,80 €/mois — et la gratuité totale s\'applique à l\'échelon 7.',
    demarche: 'tisseo.fr',
    eligibilite: 'eligible',
    villes: ['toulouse'],
    departements: ['31'],
    regions: ['Occitanie'],
    statuts: ['etudiant'],
    source: 'https://www.tisseo.fr/les-tarifs/la-gamme',
    verifieLe: '2026-08-25',
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
    nom: 'Épicerie solidaire CROUS Montpellier',
    emoji: '🛒',
    montant: 'courses à -70%',
    description: 'Le CROUS de Montpellier propose une épicerie solidaire permettant aux étudiants de faire leurs courses à des prix réduits de 70%. Un soutien alimentaire concret pour les étudiants en difficulté.',
    demarche: 'crous-montpellier.fr',
    eligibilite: 'peut-etre',
    villes: ['montpellier'],
    departements: ['34'],
    regions: ['Occitanie'],
    statuts: ['etudiant'],
    aVerifier: true,
  },
  {
    id: 'tam-etudiant',
    nom: 'TAM tarif étudiant',
    emoji: '🚌',
    montant: 'abonnement transport réduit',
    description: 'Le réseau TAM (Transports de l\'Agglomération de Montpellier) propose des abonnements à tarif réduit pour les étudiants. Accès aux trams et bus de la métropole à prix préférentiel.',
    demarche: 'tam-voyages.fr',
    eligibilite: 'eligible',
    villes: ['montpellier'],
    departements: ['34'],
    regions: ['Occitanie'],
    statuts: ['etudiant'],
    aVerifier: true,
  },

  // --- Hauts-de-France / Lille / Nord ---
  {
    id: 'aide-urgence-hdf',
    nom: 'Aide urgence jeune Hauts-de-France',
    emoji: '🆘',
    montant: "jusqu'à 300 €",
    description: 'La région Hauts-de-France propose une aide d\'urgence pour les jeunes de 18 à 30 ans en situation de précarité. Aide rapide pour faire face à une dépense imprévue ou urgente.',
    demarche: 'hautsdefrance.fr',
    eligibilite: 'peut-etre',
    villes: ['lille', 'amiens'],
    departements: ['59', '80'],
    regions: ['Hauts-de-France'],
    aVerifier: true,
  },
  {
    id: 'carte-avantage-mel',
    nom: 'Carte Avantage Jeune MEL',
    emoji: '💳',
    montant: 'réductions transports + loisirs',
    description: 'La Métropole Européenne de Lille propose une carte avantage jeune offrant des réductions sur les transports en commun et les loisirs (cinéma, musées, piscines, activités culturelles).',
    demarche: 'lillemetropole.fr',
    eligibilite: 'eligible',
    villes: ['lille'],
    departements: ['59'],
    regions: ['Hauts-de-France'],
    aVerifier: true,
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
    nom: 'Bourse régionale Bretagne',
    emoji: '🎓',
    montant: "jusqu'à 800 €/an",
    description: 'La région Bretagne octroie une bourse aux étudiants bretons suivant une formation dans la région sur critères sociaux. Cette aide vient compléter les dispositifs nationaux existants.',
    demarche: 'bretagne.bzh',
    eligibilite: 'peut-etre',
    regions: ['Bretagne'],
    statuts: ['etudiant'],
    aVerifier: true,
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
    nom: 'Bourse régionale Pays de la Loire',
    emoji: '🎓',
    montant: "jusqu'à 600 €/an",
    description: 'La région Pays de la Loire propose une bourse complémentaire aux étudiants ligériens suivant une formation dans la région. Une aide additionnelle sur critères sociaux.',
    demarche: 'paysdelaloire.fr',
    eligibilite: 'peut-etre',
    regions: ['Pays de la Loire'],
    statuts: ['etudiant'],
    aVerifier: true,
  },

  // --- Grand Est / Strasbourg / Bas-Rhin ---
  {
    id: 'aide-jeune-grand-est',
    nom: 'Aide jeune Grand Est',
    emoji: '💶',
    montant: "jusqu'à 300 €",
    description: 'La région Grand Est propose une aide financière aux jeunes en difficulté pour soutenir leur insertion professionnelle et sociale. Accessible aux résidents de la région dans le besoin.',
    demarche: 'grandest.fr',
    eligibilite: 'peut-etre',
    villes: ['strasbourg', 'metz', 'nancy', 'reims'],
    departements: ['67', '57', '54', '51'],
    regions: ['Grand Est'],
    aVerifier: true,
  },
  {
    id: 'cts-etudiant',
    nom: 'Tarif réduit CTS étudiant',
    emoji: '🚌',
    montant: '32,50 €/mois (au lieu de 57,50 €)',
    description: 'Abonnement étudiant sur tout le réseau CTS de Strasbourg. En prenant l\'abonnement à l\'année (292,50 €), tu descends à environ 24 €/mois. L\'Eurométropole applique aussi une tarification solidaire selon le quotient familial — vérifie ton cas, ça peut être moins cher.',
    demarche: 'cts-strasbourg.fr',
    eligibilite: 'eligible',
    villes: ['strasbourg'],
    departements: ['67'],
    regions: ['Grand Est'],
    statuts: ['etudiant'],
    source: 'https://www.cts-strasbourg.eu/fr/Titres-de-transport/tarifs/Abonnements/',
    verifieLe: '2026-08-25',
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
