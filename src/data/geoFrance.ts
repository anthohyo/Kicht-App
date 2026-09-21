import { COMMUNES_BRUT, REGION_PAR_DEPARTEMENT } from './communes';

export interface GeoEntry {
  ville: string;
  codePostal: string[];
  departement: string;
  region: string;
}

export const GEO_FRANCE: GeoEntry[] = [
  {
    ville: 'Paris',
    codePostal: ['75000','75001','75002','75003','75004','75005','75006','75007','75008','75009','75010','75011','75012','75013','75014','75015','75016','75017','75018','75019','75020'],
    departement: '75',
    region: 'Île-de-France',
  },
  {
    ville: 'Lyon',
    codePostal: ['69001','69002','69003','69004','69005','69006','69007','69008','69009'],
    departement: '69',
    region: 'Auvergne-Rhône-Alpes',
  },
  {
    ville: 'Marseille',
    codePostal: ['13001','13002','13003','13004','13005','13006','13007','13008','13009','13010','13011','13012','13013','13014','13015','13016'],
    departement: '13',
    region: 'Provence-Alpes-Côte d\'Azur',
  },
  {
    ville: 'Bordeaux',
    codePostal: ['33000'],
    departement: '33',
    region: 'Nouvelle-Aquitaine',
  },
  {
    ville: 'Toulouse',
    codePostal: ['31000','31100','31200','31300','31400','31500'],
    departement: '31',
    region: 'Occitanie',
  },
  {
    ville: 'Lille',
    codePostal: ['59000','59800'],
    departement: '59',
    region: 'Hauts-de-France',
  },
  {
    ville: 'Rennes',
    codePostal: ['35000','35200'],
    departement: '35',
    region: 'Bretagne',
  },
  {
    ville: 'Nantes',
    codePostal: ['44000','44100','44200','44300'],
    departement: '44',
    region: 'Pays de la Loire',
  },
  {
    ville: 'Strasbourg',
    codePostal: ['67000','67100','67200'],
    departement: '67',
    region: 'Grand Est',
  },
  {
    ville: 'Montpellier',
    codePostal: ['34000','34070','34080','34090'],
    departement: '34',
    region: 'Occitanie',
  },
  {
    ville: 'Nice',
    codePostal: ['06000','06100','06200','06300'],
    departement: '06',
    region: 'Provence-Alpes-Côte d\'Azur',
  },
  {
    ville: 'Grenoble',
    codePostal: ['38000','38100'],
    departement: '38',
    region: 'Auvergne-Rhône-Alpes',
  },
  {
    ville: 'Toulon',
    codePostal: ['83000','83100','83200'],
    departement: '83',
    region: 'Provence-Alpes-Côte d\'Azur',
  },
  {
    ville: 'Dijon',
    codePostal: ['21000'],
    departement: '21',
    region: 'Bourgogne-Franche-Comté',
  },
  {
    ville: 'Angers',
    codePostal: ['49000','49100'],
    departement: '49',
    region: 'Pays de la Loire',
  },
  {
    ville: 'Nîmes',
    codePostal: ['30000','30900'],
    departement: '30',
    region: 'Occitanie',
  },
  {
    ville: 'Clermont-Ferrand',
    codePostal: ['63000','63100'],
    departement: '63',
    region: 'Auvergne-Rhône-Alpes',
  },
  {
    ville: 'Reims',
    codePostal: ['51100'],
    departement: '51',
    region: 'Grand Est',
  },
  {
    ville: 'Le Havre',
    codePostal: ['76600'],
    departement: '76',
    region: 'Normandie',
  },
  {
    ville: 'Rouen',
    codePostal: ['76000','76100'],
    departement: '76',
    region: 'Normandie',
  },
  {
    ville: 'Saint-Étienne',
    codePostal: ['42000','42100'],
    departement: '42',
    region: 'Auvergne-Rhône-Alpes',
  },
  {
    ville: 'Metz',
    codePostal: ['57000'],
    departement: '57',
    region: 'Grand Est',
  },
  {
    ville: 'Nancy',
    codePostal: ['54000'],
    departement: '54',
    region: 'Grand Est',
  },
  {
    ville: 'Amiens',
    codePostal: ['80000','80080','80090'],
    departement: '80',
    region: 'Hauts-de-France',
  },
  {
    ville: 'Caen',
    codePostal: ['14000'],
    departement: '14',
    region: 'Normandie',
  },
  {
    ville: 'Orléans',
    codePostal: ['45000','45100'],
    departement: '45',
    region: 'Centre-Val de Loire',
  },
  {
    ville: 'Tours',
    codePostal: ['37000','37100','37200'],
    departement: '37',
    region: 'Centre-Val de Loire',
  },
  {
    ville: 'Besançon',
    codePostal: ['25000'],
    departement: '25',
    region: 'Bourgogne-Franche-Comté',
  },
  {
    ville: 'Perpignan',
    codePostal: ['66000','66100'],
    departement: '66',
    region: 'Occitanie',
  },
  {
    ville: 'Brest',
    codePostal: ['29200'],
    departement: '29',
    region: 'Bretagne',
  },
  {
    ville: 'Limoges',
    codePostal: ['87000','87100'],
    departement: '87',
    region: 'Nouvelle-Aquitaine',
  },
  {
    ville: 'Poitiers',
    codePostal: ['86000'],
    departement: '86',
    region: 'Nouvelle-Aquitaine',
  },
  {
    ville: 'Pau',
    codePostal: ['64000'],
    departement: '64',
    region: 'Nouvelle-Aquitaine',
  },
  {
    ville: 'Bayonne',
    codePostal: ['64100'],
    departement: '64',
    region: 'Nouvelle-Aquitaine',
  },
  {
    ville: 'Aix-en-Provence',
    codePostal: ['13090','13100'],
    departement: '13',
    region: 'Provence-Alpes-Côte d\'Azur',
  },
];

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalize(str: string): string {
  // Les tirets et apostrophes sautent aussi : personne ne tape « L'Haÿ-les-Roses »
  // exactement comme l'INSEE l'écrit.
  return removeAccents(str.trim().toLowerCase())
    .replace(/[-'\u2019.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface Commune {
  ville: string;
  departement: string;
  region: string;
  /**
   * Code de l'intercommunalité, renseigné uniquement pour les métropoles dont
   * l'app suit une aide. C'est le bon territoire pour un réseau de transport :
   * l'abonnement TCL vaut dans toute la Métropole de Lyon — Villeurbanne,
   * Vénissieux, Bron — mais pas à Villefranche-sur-Saône, pourtant dans le 69.
   */
  epci?: string;
  /** Nombre de communes françaises portant le même nom, celle-ci comprise. */
  homonymes?: number;
}

/**
 * Index construit à la première recherche, pas au chargement de l'app :
 * parcourir 35 000 communes au démarrage retarderait le premier écran pour
 * un utilisateur qui ne saisira peut-être jamais sa ville.
 */
interface Entree { nom: string; dept: string; pop: number; epci: string }

let parNom: Map<string, Entree[]> | null = null;
let parCodePostal: Map<string, Entree> | null = null;

function construireIndex(): void {
  if (parNom) return;
  parNom = new Map();
  parCodePostal = new Map();
  for (const ligne of COMMUNES_BRUT.split('~')) {
    const [nom, cp, dept, pop, epci] = ligne.split('|');
    if (!nom || !dept) continue;
    const entree: Entree = { nom, dept, pop: parseInt(pop, 10) || 0, epci: epci || '' };
    const cle = normalize(nom);
    const liste = parNom.get(cle);
    if (liste) liste.push(entree);
    else parNom.set(cle, [entree]);
    // Un code postal couvre parfois plusieurs communes : la plus peuplée gagne,
    // c'est celle que l'utilisateur a le plus de chances de désigner.
    const dejaLa = parCodePostal.get(cp);
    if (!dejaLa || entree.pop > dejaLa.pop) parCodePostal.set(cp, entree);
  }
}

function versCommune(e: Entree, homonymes: number): Commune | null {
  const region = REGION_PAR_DEPARTEMENT[e.dept];
  if (!region) return null;
  return { ville: e.nom, departement: e.dept, region, homonymes, epci: e.epci || undefined };
}

/**
 * Intercommunalité d'une commune déjà enregistrée dans un profil.
 *
 * Passe par le nom et le département plutôt que par un champ stocké : les
 * profils créés avant l'ajout des intercommunalités continuent ainsi de
 * bénéficier du bon périmètre, sans migration ni nouvelle question.
 */
export function epciDe(ville?: string, departement?: string): string | undefined {
  if (!ville || !departement) return undefined;
  construireIndex();
  const candidats = parNom!.get(normalize(ville));
  if (!candidats) return undefined;
  const exact = candidats.find((c) => c.dept === departement);
  return exact && exact.epci ? exact.epci : undefined;
}

/**
 * Résout une saisie libre (nom de commune ou code postal) en commune, département
 * et région.
 *
 * L'app ne connaissait que 41 grandes villes : un jeune de Gentilly, commune de
 * 20 000 habitants collée à Paris, tombait sur « Aucune ville trouvée » et perdait
 * du même coup les aides du Val-de-Marne ET celles de toute l'Île-de-France,
 * auxquelles il a pourtant droit. Rattacher automatiquement une petite commune à
 * la grande ville voisine aurait été pire : Gentilly n'est pas dans le 75, et les
 * aides propres à la Ville de Paris ne s'y appliquent pas.
 */
export function detectGeo(input: string): Commune | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  // 1. Table curatée d'abord : elle porte les arrondissements de Paris, Lyon et
  // Marseille, et garantit l'orthographe attendue par les aides locales.
  const depuisTableCuratee = (entry: GeoEntry): Commune => ({
    ville: entry.ville,
    departement: entry.departement,
    region: entry.region,
    epci: epciDe(entry.ville, entry.departement),
  });

  if (/^\d{5}$/.test(normalized)) {
    for (const entry of GEO_FRANCE) {
      if (entry.codePostal.includes(normalized)) return depuisTableCuratee(entry);
    }
  } else {
    for (const entry of GEO_FRANCE) {
      if (normalize(entry.ville) === normalized) return depuisTableCuratee(entry);
    }
  }

  construireIndex();

  // 2. Code postal exact.
  if (/^\d{5}$/.test(normalized)) {
    const e = parCodePostal!.get(normalized);
    return e ? versCommune(e, 1) : null;
  }

  // 3. Nom exact, puis début de nom. On ne descend PAS jusqu'à « contient » :
  // taper « ville » renverrait Villeurbanne, ce qui fausserait tout sans que
  // l'utilisateur comprenne pourquoi.
  const exact = parNom!.get(normalized);
  if (exact) {
    const trie = [...exact].sort((a, b) => b.pop - a.pop);
    return versCommune(trie[0], trie.length);
  }

  if (normalized.length < 3) return null;

  let meilleur: Entree | null = null;
  for (const liste of parNom!.values()) {
    for (const e of liste) {
      if (!normalize(e.nom).startsWith(normalized)) continue;
      if (!meilleur || e.pop > meilleur.pop) meilleur = e;
    }
  }
  return meilleur ? versCommune(meilleur, 1) : null;
}
