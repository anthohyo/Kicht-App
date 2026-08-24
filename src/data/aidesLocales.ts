export interface AideLocale {
  id: string;
  nom: string;
  emoji: string;
  montant: string;
  description: string;
  demarche: string;
  eligibilite: 'eligible' | 'peut-etre' | 'non-eligible';
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
    montant: '38 €/mois (au lieu de 86 €)',
    description: 'Abonnement mensuel illimité sur toute la zone Île-de-France à tarif réduit pour les étudiants. Économise jusqu\'à 576 € par an sur tes trajets quotidiens.',
    demarche: 'navigo.fr',
    eligibilite: 'eligible',
    villes: ['paris'],
    departements: ['75'],
    regions: ['Île-de-France'],
    statuts: ['etudiant'],
  },
  {
    id: 'aide-urgence-crous-paris',
    nom: 'Aide d\'urgence CROUS Paris',
    emoji: '🆘',
    montant: "jusqu'à 600 €",
    description: 'Aide financière exceptionnelle accordée par le CROUS Paris aux étudiants en difficulté passagère. Accessible aux boursiers comme aux non-boursiers sur critères sociaux.',
    demarche: 'crous-paris.fr',
    eligibilite: 'peut-etre',
    villes: ['paris'],
    departements: ['75'],
    regions: ['Île-de-France'],
    statuts: ['etudiant'],
  },
  {
    id: 'resto-u-paris',
    nom: 'Resto U Paris',
    emoji: '🍽️',
    montant: '3,30 € le repas',
    description: 'Repas complet équilibré (entrée + plat + dessert) à 3,30 € dans les restaurants universitaires du CROUS Paris. Accessible à tout étudiant muni d\'une carte étudiante valide.',
    demarche: 'crous-paris.fr',
    eligibilite: 'eligible',
    villes: ['paris'],
    departements: ['75'],
    regions: ['Île-de-France'],
    statuts: ['etudiant'],
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
  },

  // --- Auvergne-Rhône-Alpes / Lyon / Rhône ---
  {
    id: 'faj-rhone',
    nom: 'FAJ Rhône (Fonds d\'Aide aux Jeunes)',
    emoji: '💶',
    montant: "jusqu'à 500 €",
    description: 'Le Fonds d\'Aide aux Jeunes du Rhône permet d\'aider les jeunes de 18 à 25 ans en difficulté à financer un projet d\'insertion ou à faire face à une dépense urgente (loyer, permis, formation, matériel).',
    demarche: 'mda69.fr',
    eligibilite: 'peut-etre',
    villes: ['lyon'],
    departements: ['69'],
    regions: ['Auvergne-Rhône-Alpes'],
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
  },
  {
    id: 'tcl-tarif-reduit',
    nom: 'TCL tarif réduit boursier',
    emoji: '🚌',
    montant: '-75% sur abonnement TCL',
    description: 'Les étudiants boursiers d\'état bénéficient d\'une réduction de 75% sur leur abonnement mensuel TCL (Transports en Commun Lyonnais). Une économie significative sur tes déplacements quotidiens.',
    demarche: 'tcl.fr',
    eligibilite: 'peut-etre',
    villes: ['lyon'],
    departements: ['69'],
    regions: ['Auvergne-Rhône-Alpes'],
    statuts: ['etudiant'],
  },
  {
    id: 'aide-permis-aura',
    nom: 'Aide permis de conduire apprentis AURA',
    emoji: '🚗',
    montant: "jusqu'à 500 €",
    description: 'La région Auvergne-Rhône-Alpes finance une aide spécifique pour passer le permis de conduire, réservée aux apprentis en contrat d\'apprentissage. Indispensable pour faciliter l\'accès à l\'emploi.',
    demarche: 'auvergnerhonealpes.fr',
    eligibilite: 'peut-etre',
    regions: ['Auvergne-Rhône-Alpes'],
    statuts: ['apprenti'],
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
  },
  {
    id: 'faj-gironde',
    nom: 'FAJ Gironde',
    emoji: '💶',
    montant: "jusqu'à 400 €",
    description: 'Le Fonds d\'Aide aux Jeunes de la Gironde accompagne les jeunes de 18 à 25 ans en difficulté dans leur démarche d\'insertion sociale et professionnelle. Aide pour financer des besoins urgents et essentiels.',
    demarche: 'gironde.fr',
    eligibilite: 'peut-etre',
    villes: ['bordeaux'],
    departements: ['33'],
    regions: ['Nouvelle-Aquitaine'],
  },

  // --- Occitanie / Toulouse / Haute-Garonne ---
  {
    id: 'bourse-occitanie',
    nom: 'Bourse complémentaire région Occitanie',
    emoji: '🎓',
    montant: "jusqu'à 1 000 €/an",
    description: 'La région Occitanie verse une bourse complémentaire aux étudiants boursiers suivant une formation dans la région. Cette aide s\'ajoute aux aides nationales pour améliorer le pouvoir d\'achat des étudiants.',
    demarche: 'laregion.fr',
    eligibilite: 'peut-etre',
    regions: ['Occitanie'],
    statuts: ['etudiant'],
  },
  {
    id: 'tisseo-etudiant',
    nom: 'Aide transport étudiant Tisséo',
    emoji: '🚌',
    montant: 'abonnement étudiant réduit',
    description: 'Tisséo (réseau de transport toulousain) propose des abonnements à tarif réduit pour les étudiants. Accès illimité aux bus, métro et tramway de Toulouse à prix préférentiel.',
    demarche: 'tisseo.fr',
    eligibilite: 'eligible',
    villes: ['toulouse'],
    departements: ['31'],
    regions: ['Occitanie'],
    statuts: ['etudiant'],
  },
  {
    id: 'faj-haute-garonne',
    nom: 'FAJ Haute-Garonne',
    emoji: '💶',
    montant: "jusqu'à 500 €",
    description: 'Le Fonds d\'Aide aux Jeunes de Haute-Garonne soutient les jeunes de 18 à 25 ans en situation précaire. L\'aide finance des projets d\'insertion : formation, emploi, logement, mobilité.',
    demarche: 'haute-garonne.fr',
    eligibilite: 'peut-etre',
    villes: ['toulouse'],
    departements: ['31'],
    regions: ['Occitanie'],
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
  },
  {
    id: 'faj-nord',
    nom: 'FAJ Nord',
    emoji: '💶',
    montant: "jusqu'à 400 €",
    description: 'Le Fonds d\'Aide aux Jeunes du Nord aide les jeunes de 18 à 25 ans en difficulté à financer un projet d\'insertion professionnelle ou à couvrir une dépense urgente et nécessaire.',
    demarche: 'nord.fr',
    eligibilite: 'peut-etre',
    villes: ['lille'],
    departements: ['59'],
    regions: ['Hauts-de-France'],
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
  },
  {
    id: 'faj-ille-et-vilaine',
    nom: 'FAJ Ille-et-Vilaine',
    emoji: '💶',
    montant: "jusqu'à 500 €",
    description: 'Le Fonds d\'Aide aux Jeunes d\'Ille-et-Vilaine soutient les jeunes de 18 à 25 ans résidant dans le département pour financer un projet d\'insertion ou faire face à une situation de précarité.',
    demarche: 'ille-et-vilaine.fr',
    eligibilite: 'peut-etre',
    villes: ['rennes'],
    departements: ['35'],
    regions: ['Bretagne'],
  },

  // --- Pays de la Loire / Nantes / Loire-Atlantique ---
  {
    id: 'faj-loire-atlantique',
    nom: 'FAJ Loire-Atlantique',
    emoji: '💶',
    montant: "jusqu'à 500 €",
    description: 'Le Fonds d\'Aide aux Jeunes de Loire-Atlantique accompagne les jeunes de 18 à 25 ans en insertion sociale et professionnelle. Aide financière pour des besoins essentiels ou un projet d\'avenir.',
    demarche: 'loire-atlantique.fr',
    eligibilite: 'peut-etre',
    villes: ['nantes'],
    departements: ['44'],
    regions: ['Pays de la Loire'],
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
  },
  {
    id: 'cts-etudiant',
    nom: 'Tarif réduit CTS étudiant',
    emoji: '🚌',
    montant: '-50% sur transports strasbourgeois',
    description: 'La Compagnie des Transports Strasbourgeois (CTS) propose un abonnement mensuel à tarif réduit de 50% pour les étudiants. Accès illimité aux trams et bus du réseau strasbourgeois.',
    demarche: 'cts-strasbourg.fr',
    eligibilite: 'eligible',
    villes: ['strasbourg'],
    departements: ['67'],
    regions: ['Grand Est'],
    statuts: ['etudiant'],
  },
  {
    id: 'faj-bas-rhin',
    nom: 'FAJ Bas-Rhin',
    emoji: '💶',
    montant: "jusqu'à 400 €",
    description: 'Le Fonds d\'Aide aux Jeunes du Bas-Rhin accompagne les jeunes de 18 à 25 ans dans leur parcours d\'insertion. Aide financière pour financer un projet professionnel ou couvrir des besoins urgents.',
    demarche: 'bas-rhin.fr',
    eligibilite: 'peut-etre',
    villes: ['strasbourg'],
    departements: ['67'],
    regions: ['Grand Est'],
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
