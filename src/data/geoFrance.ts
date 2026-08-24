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
  return removeAccents(str.trim().toLowerCase());
}

export function detectGeo(input: string): { ville: string; departement: string; region: string } | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  // Try exact postal code match (5 digits)
  if (/^\d{5}$/.test(normalized)) {
    for (const entry of GEO_FRANCE) {
      if (entry.codePostal.includes(normalized)) {
        return { ville: entry.ville, departement: entry.departement, region: entry.region };
      }
    }
    // Also try 2-digit department prefix for partial matches
    const dept = normalized.slice(0, 2);
    for (const entry of GEO_FRANCE) {
      if (entry.departement === dept) {
        return { ville: entry.ville, departement: entry.departement, region: entry.region };
      }
    }
    return null;
  }

  // Try by city name — startsWith first
  for (const entry of GEO_FRANCE) {
    if (normalize(entry.ville).startsWith(normalized)) {
      return { ville: entry.ville, departement: entry.departement, region: entry.region };
    }
  }

  // Then includes
  for (const entry of GEO_FRANCE) {
    if (normalize(entry.ville).includes(normalized)) {
      return { ville: entry.ville, departement: entry.departement, region: entry.region };
    }
  }

  return null;
}
