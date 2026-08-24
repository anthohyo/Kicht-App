import { UserProfile } from '../types';

export interface AideResult {
  id: string;
  name: string;
  emoji: string;
  eligible: 'oui' | 'peut-etre' | 'non';
  montantEstime?: string;        // Label affiché (ex: "~250 €/mois")
  montantMensuelMin?: number;    // Pour calcul du total cumulé (borne basse, en €/mois)
  montantMensuelMax?: number;    // Pour calcul du total cumulé (borne haute, en €/mois)
  description: string;
  conditions: string[];
  commentFaire: string[];
  lien: string;
  lienLabel: string;
}

export function simulerAides(profile: UserProfile): AideResult[] {
  const aides: AideResult[] = [];
  const totalExpenses = Object.values(profile.expenses).reduce((a, b) => a + b, 0);
  const reste = profile.monthlySalary - totalExpenses;

  // --- APL ---
  const loyer = profile.expenses.loyer;
  if (profile.housingType === 'parents') {
    aides.push({
      id: 'apl',
      name: 'APL (Aide au logement)',
      emoji: '🏠',
      eligible: 'non',
      description: 'Tu habites chez tes parents — l\'APL est réservée aux locataires. En revanche, tu peux toujours toucher la bourse CROUS selon les revenus de tes parents.',
      conditions: ['Être locataire avec un bail à ton nom'],
      commentFaire: ['Fais la demande dès que tu signes un bail'],
      lien: 'https://www.caf.fr',
      lienLabel: 'En savoir plus sur caf.fr',
    });
  } else if (profile.housingType === 'crous') {
    aides.push({
      id: 'apl',
      name: 'APL (Aide au logement)',
      emoji: '🏠',
      eligible: 'peut-etre',
      description: 'En résidence CROUS, tu peux toucher l\'APL résidence. Le montant dépend de ton loyer et de tes revenus. Fais ta demande sur caf.fr dès ton entrée en résidence.',
      conditions: [
        'Être locataire (ou colocataire)',
        'Le logement doit être ta résidence principale',
        'Avoir des revenus modestes',
        'Avoir un bail à ton nom',
      ],
      commentFaire: [
        'Crée ton compte sur caf.fr',
        'Va dans "Faire une demande de prestation"',
        'Sélectionne "Aide au logement"',
        'Remplis le formulaire (bail, RIB, revenus)',
        'Délai : environ 2 mois pour le 1er versement',
      ],
      lien: 'https://www.caf.fr',
      lienLabel: 'Faire ma demande sur caf.fr',
    });
  } else {
    // Logement éligible (seul, coloc, foyer) — on a ou pas le montant du loyer
    const CONDITIONS_APL = [
      'Être locataire (ou colocataire)',
      'Le logement doit être ta résidence principale',
      'Avoir des revenus modestes',
      'Avoir un bail à ton nom',
    ];
    const COMMENT_FAIRE_APL = [
      'Crée ton compte sur caf.fr',
      'Va dans "Faire une demande de prestation"',
      'Sélectionne "Aide au logement"',
      'Remplis le formulaire (bail, RIB, revenus)',
      'Délai : environ 2 mois pour le 1er versement',
    ];

    if (loyer > 0) {
      // Estimation précise avec le loyer connu
      let montantAPL = 0;
      if (profile.monthlySalary < 500) montantAPL = Math.min(loyer * 0.6, 300);
      else if (profile.monthlySalary < 1000) montantAPL = Math.min(loyer * 0.45, 250);
      else if (profile.monthlySalary < 1500) montantAPL = Math.min(loyer * 0.3, 200);
      else if (profile.monthlySalary < 2000) montantAPL = Math.min(loyer * 0.15, 100);
      montantAPL = Math.round(montantAPL);

      aides.push({
        id: 'apl',
        name: 'APL (Aide au logement)',
        emoji: '🏠',
        eligible: montantAPL > 0 ? 'oui' : 'peut-etre',
        montantEstime: montantAPL > 0 ? `~${montantAPL} €/mois` : undefined,
        montantMensuelMin: montantAPL > 0 ? montantAPL : undefined,
        montantMensuelMax: montantAPL > 0 ? montantAPL : undefined,
        description: 'Aide mensuelle pour réduire ton loyer, versée par la CAF.',
        conditions: CONDITIONS_APL,
        commentFaire: COMMENT_FAIRE_APL,
        lien: 'https://www.caf.fr',
        lienLabel: 'Faire ma demande sur caf.fr',
      });
    } else {
      // Loyer non renseigné, mais situation éligible — c'est un droit, pas un "peut-être"
      aides.push({
        id: 'apl',
        name: 'APL (Aide au logement)',
        emoji: '🏠',
        eligible: 'oui',
        montantEstime: '~100–300 €/mois',
        montantMensuelMin: 100,
        montantMensuelMax: 300,
        description: 'Tu es locataire — tu as le droit à l\'APL. Renseigne ton loyer dans "Mon mois" → Profil pour calculer le montant exact.',
        conditions: CONDITIONS_APL,
        commentFaire: COMMENT_FAIRE_APL,
        lien: 'https://www.caf.fr',
        lienLabel: 'Faire ma demande sur caf.fr',
      });
    }
  }

  // --- Bourse CROUS ---
  // L'éligibilité dépend du type d'établissement, pas seulement du statut étudiant.
  // Les écoles privées non conventionnées (EFAP, ESG, ISCOM…) ne donnent pas accès à la bourse.
  if (profile.status === 'etudiant') {
    const school = profile.schoolType ?? 'public'; // anciens profils → hypothèse favorable
    const bourseEligible =
      school === 'public' ? 'oui' :
      school === 'prive_reconnu' ? 'peut-etre' :
      'non'; // prive_non_reconnu

    const parentsNote = profile.housingType === 'parents'
      ? ' Les revenus de tes parents sont pris en compte pour le calcul — ce n\'est pas parce que tu vis chez eux que tu n\'y as pas droit.'
      : '';

    const bourseDesc =
      school === 'prive_non_reconnu'
        ? 'Ton école n\'a pas de convention avec le CROUS. La bourse nationale n\'est pas accessible, mais renseigne-toi sur les aides propres à ton établissement.'
        : school === 'prive_reconnu'
        ? 'Certaines écoles privées reconnues ont une convention CROUS — vérifie auprès de ton école ou directement sur messervices.etudiant.gouv.fr.' + parentsNote
        : 'Aide financière pour les étudiants, versée sur 10 mois. Le montant dépend des revenus de tes parents.' + parentsNote;

    aides.push({
      id: 'bourse',
      name: 'Bourse CROUS',
      emoji: '🎓',
      eligible: bourseEligible,
      // Converti en mensuel (versée sur 10 mois) pour cohérence avec les autres aides
      montantEstime: bourseEligible !== 'non' ? '~120 à 630 €/mois (10 mois)' : undefined,
      montantMensuelMin: bourseEligible !== 'non' ? 120 : undefined,
      montantMensuelMax: bourseEligible !== 'non' ? 630 : undefined,
      description: bourseDesc,
      conditions: bourseEligible === 'non'
        ? [
            'Réservée aux établissements conventionnés avec le CROUS',
            'Ton école privée ne fait pas partie de la liste',
            'Renseigne-toi sur les aides internes à ton école',
          ]
        : [
            'Être inscrit·e dans un établissement d\'enseignement supérieur conventionné',
            'Avoir moins de 28 ans',
            'Revenus des parents sous un certain plafond',
            'Être assidu·e en cours et aux examens',
          ],
      commentFaire: bourseEligible === 'non'
        ? [
            'Consulte le service des bourses de ton école',
            'Renseigne-toi sur les aides régionales (certaines régions financent les étudiants en école privée)',
            'Vérifie l\'éligibilité à la CSS (mutuelle gratuite) et au FAJ',
          ]
        : [
            'Va sur messervices.etudiant.gouv.fr',
            'Crée ton compte (ou connecte-toi)',
            'Remplis le DSE (Dossier Social Étudiant)',
            'Période : entre janvier et mai',
            'Prépare : avis d\'imposition des parents, relevé de notes',
          ],
      lien: 'https://www.messervices.etudiant.gouv.fr',
      lienLabel: bourseEligible === 'non' ? 'En savoir plus' : 'Faire mon DSE',
    });
  } else {
    aides.push({
      id: 'bourse',
      name: 'Bourse CROUS',
      emoji: '🎓',
      eligible: 'non',
      description: 'Réservée aux étudiants. Si tu reprends des études, tu pourras en bénéficier.',
      conditions: ['Être étudiant·e inscrit·e dans le supérieur'],
      commentFaire: ['Change ton statut en "Étudiant" si tu reprends des études'],
      lien: 'https://www.messervices.etudiant.gouv.fr',
      lienLabel: 'En savoir plus',
    });
  }

  // --- Prime d'activité ---
  // Requiert un revenu d'ACTIVITÉ PROFESSIONNELLE réelle.
  // Les indemnités service civique, allocs chômage et bourses CROUS ne comptent PAS.
  {
    const SEUIL_APPRENTI = 1070;
    const salary = profile.monthlySalary;
    const COMMENT_FAIRE_PRIME = [
      'Va sur caf.fr',
      'Clique "Simuler mes droits"',
      'Remplis le simulateur prime d\'activité',
      'Si éligible, fais ta demande en ligne',
      'Déclare tes revenus chaque trimestre',
    ];
    const CONDITIONS_PRIME = [
      'Avoir plus de 18 ans',
      'Exercer une activité professionnelle (salarié, apprenti, auto-entrepreneur)',
      'Revenus nets < ~1 800 €/mois (personne seule)',
      'Résider en France de manière stable',
    ];
    const LIEN_PRIME = 'https://www.caf.fr/allocataires/mes-services-en-ligne/faire-une-simulation';

    const calcMontant = (s: number): number => {
      if (s < 1200) return 200;
      if (s < 1500) return 150;
      if (s < 1800) return 80;
      return 0;
    };

    if (profile.status === 'service_civique' || profile.status === 'recherche_emploi') {
      // Ces revenus ne sont pas des revenus d'activité — non éligible
      aides.push({
        id: 'prime-activite',
        name: 'Prime d\'activité',
        emoji: '💶',
        eligible: 'non',
        description: profile.status === 'recherche_emploi'
          ? 'Les allocations chômage (ARE) ne sont pas des revenus d\'activité. Si tu reprends un emploi, tu pourras y avoir droit selon ton salaire.'
          : 'L\'indemnité de service civique ne compte pas comme revenu d\'activité pour la Prime d\'activité.',
        conditions: CONDITIONS_PRIME,
        commentFaire: ['Reviens vérifier si tu reprends une activité professionnelle'],
        lien: LIEN_PRIME,
        lienLabel: 'En savoir plus',
      });
    } else if (profile.status === 'etudiant') {
      // Étudiant : éligible uniquement si le revenu vient d'un job, pas de la bourse CROUS
      // On ne peut pas savoir avec certitude → peut-être si dans la tranche
      const inRange = salary >= SEUIL_APPRENTI && salary <= 1800;
      const montant = inRange ? calcMontant(salary) : 0;
      aides.push({
        id: 'prime-activite',
        name: 'Prime d\'activité',
        emoji: '💶',
        eligible: inRange ? 'peut-etre' : 'non',
        montantEstime: montant > 0 ? `~${montant} €/mois` : undefined,
        montantMensuelMin: montant > 0 ? montant : undefined,
        montantMensuelMax: montant > 0 ? montant : undefined,
        description: inRange
          ? 'Si tes revenus viennent d\'un job étudiant (pas de la bourse CROUS), tu pourrais y avoir droit. La bourse seule ne donne pas accès à cette aide.'
          : 'Accessible uniquement si tu as un job étudiant rapportant plus de ~1 070 €/mois. La bourse CROUS ne compte pas comme revenu d\'activité.',
        conditions: [...CONDITIONS_PRIME, 'Pour les étudiants : revenu issu d\'un emploi (> ~1 070 €/mois), pas de la bourse'],
        commentFaire: COMMENT_FAIRE_PRIME,
        lien: LIEN_PRIME,
        lienLabel: 'Simuler sur caf.fr',
      });
    } else if (
      profile.status === 'salarie' ||
      profile.status === 'apprenti' ||
      profile.status === 'auto_entrepreneur'
    ) {
      // Travailleurs — éligibilité directe selon le salaire
      const seuilMin = profile.status === 'apprenti' ? SEUIL_APPRENTI : 0;
      const eligible = salary > 0 && salary >= seuilMin && salary <= 1800;
      const montant = eligible ? calcMontant(salary) : 0;
      aides.push({
        id: 'prime-activite',
        name: 'Prime d\'activité',
        emoji: '💶',
        eligible: eligible ? 'oui' : 'non',
        montantEstime: montant > 0 ? `~${montant} €/mois` : undefined,
        montantMensuelMin: montant > 0 ? montant : undefined,
        montantMensuelMax: montant > 0 ? montant : undefined,
        description: 'Complément de revenus pour les travailleurs à revenus modestes. Versée par la CAF tous les mois.',
        conditions: CONDITIONS_PRIME,
        commentFaire: COMMENT_FAIRE_PRIME,
        lien: LIEN_PRIME,
        lienLabel: 'Simuler sur caf.fr',
      });
    } else {
      // Statut 'autre' ou inconnu — on oriente vers le simulateur
      const probablyEligible = salary >= 600 && salary <= 1800;
      const montant = probablyEligible ? calcMontant(salary) : 0;
      aides.push({
        id: 'prime-activite',
        name: 'Prime d\'activité',
        emoji: '💶',
        eligible: probablyEligible ? 'peut-etre' : 'non',
        montantEstime: montant > 0 ? `~${montant} €/mois` : undefined,
        montantMensuelMin: montant > 0 ? montant : undefined,
        montantMensuelMax: montant > 0 ? montant : undefined,
        description: 'Si tu exerces une activité professionnelle (salarié, auto-entrepreneur...), tu pourrais y avoir droit selon tes revenus.',
        conditions: CONDITIONS_PRIME,
        commentFaire: COMMENT_FAIRE_PRIME,
        lien: LIEN_PRIME,
        lienLabel: 'Simuler sur caf.fr',
      });
    }
  }

  // --- CSS (Complémentaire Santé Solidaire) ---
  const cssEligible = profile.monthlySalary < 1000;
  aides.push({
    id: 'css',
    name: 'CSS (Mutuelle gratuite)',
    emoji: '🏥',
    eligible: cssEligible ? 'oui' : profile.monthlySalary < 1500 ? 'peut-etre' : 'non',
    montantEstime: cssEligible ? 'Gratuit (0 €/mois)' : undefined,
    description: 'Complémentaire santé gratuite ou à moins de 1 €/jour. Couvre ce que la sécu ne rembourse pas.',
    conditions: [
      'Résider en France depuis plus de 3 mois',
      'Revenus sous un plafond (~800 €/mois pour 1 personne pour la gratuite)',
      'Jusqu\'à ~1 100 €/mois pour la version à 1 €/jour',
    ],
    commentFaire: [
      'Va sur ameli.fr > Mon compte',
      'Ou passe par caf.fr si tu es allocataire',
      'Remplis le formulaire de demande CSS',
      'Fournis tes justificatifs de revenus',
      'Réponse sous 2 mois environ',
    ],
    lien: 'https://www.ameli.fr/assure/droits-demarches/difficultes-acces-droits-soins/complementaire-sante-solidaire',
    lienLabel: 'Demander la CSS sur ameli.fr',
  });

  // --- Garantie Visale ---
  if (profile.age < 31) {
    aides.push({
      id: 'visale',
      name: 'Garantie Visale',
      emoji: '🛡️',
      eligible: 'oui',
      montantEstime: 'Caution gratuite',
      description: 'Caution GRATUITE de l\'État pour ton logement. Remplace le garant parental.',
      conditions: [
        'Avoir entre 18 et 30 ans',
        'Chercher un logement dans le parc privé',
        'Loyer < 1 500 € (ou 1 300 € en Île-de-France)',
      ],
      commentFaire: [
        'Inscris-toi sur visale.fr',
        'Remplis ta demande en ligne (10 min)',
        'Tu reçois un visa certifié',
        'Transmets-le à ton futur propriétaire',
        'C\'est GRATUIT et accepté par la majorité des proprios',
      ],
      lien: 'https://www.visale.fr',
      lienLabel: 'S\'inscrire sur Visale.fr',
    });
  }

  // --- Aide au permis ---
  if (profile.age >= 18 && profile.age <= 25) {
    aides.push({
      id: 'permis',
      name: 'Aide au permis de conduire',
      emoji: '🚗',
      eligible: 'peut-etre',
      montantEstime: profile.status === 'apprenti' ? '500 € (automatique)' : 'Jusqu\'à 500 €',
      description: 'Plusieurs dispositifs existent pour financer ton permis : aide de 500 € pour les apprentis, permis à 1 €/jour, aide Pôle Emploi...',
      conditions: [
        'Apprentis : aide de 500 € automatique',
        'Permis à 1 €/jour : prêt à taux zéro pour les 15-25 ans',
        'Pôle Emploi : aide si le permis est nécessaire pour un emploi',
        'Certaines régions/départements ont des aides supplémentaires',
      ],
      commentFaire: [
        'Apprenti ? Demande à ton CFA les 500 €',
        'Permis à 1 €/jour : demande à ton auto-école partenaire',
        'Pôle Emploi : parles-en à ton conseiller',
        'Vérifie les aides de ta région sur 1jeune1solution.gouv.fr',
      ],
      lien: 'https://www.1jeune1solution.gouv.fr',
      lienLabel: 'Voir sur 1jeune1solution.gouv.fr',
    });
  }

  // --- Aide au transport ---
  aides.push({
    id: 'transport',
    name: 'Aides au transport',
    emoji: '🚌',
    eligible: 'peut-etre',
    montantEstime: '50% de ton abonnement',
    description: 'Ton employeur doit rembourser 50% de ton abonnement transport en commun. Des réductions jeunes existent aussi selon ta ville.',
    conditions: [
      'Salarié : remboursement 50% obligatoire par l\'employeur',
      'Étudiant : tarifs réduits sur les abonnements',
      'Île-de-France : Imagine R à tarif réduit',
      'Régions : des cartes jeunes existent (TER, car...)',
    ],
    commentFaire: [
      'Salarié : donne ton justificatif d\'abonnement à ton employeur',
      'Étudiant : renseigne-toi auprès de ton réseau de transport local',
      'Vérifie les aides de ta région',
    ],
    lien: 'https://www.1jeune1solution.gouv.fr',
    lienLabel: 'Voir les aides transport',
  });

  return aides;
}
