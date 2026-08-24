import { CourrierTemplate } from '../types';

export const courriers: CourrierTemplate[] = [
  {
    id: 'resiliation-abonnement',
    title: 'Résilier un abonnement',
    emoji: '✂️',
    category: 'resiliation',
    description: 'Modèle universel pour résilier n\'importe quel abonnement (téléphone, streaming, salle de sport…).',
    template: `Objet : Demande de résiliation

Madame, Monsieur,

Je soussigné(e) [VOTRE NOM], titulaire du contrat n° [NUMÉRO DE CONTRAT], vous informe par la présente de ma décision de résilier mon abonnement [NOM DU SERVICE] à compter de la date de réception de ce courrier.

Conformément aux dispositions légales en vigueur, je vous demande de bien vouloir procéder à la résiliation effective de mon contrat et de cesser tout prélèvement sur mon compte bancaire.

Je vous prie de m'adresser une confirmation écrite de la prise en compte de cette résiliation.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[VOTRE NOM]
[VOTRE ADRESSE]
[DATE]`,
  },
  {
    id: 'quittance-loyer',
    title: 'Demander une quittance de loyer',
    emoji: '🏠',
    category: 'logement',
    description: 'Ton propriétaire doit te fournir une quittance si tu la demandes. C\'est un droit.',
    template: `Objet : Demande de quittance de loyer

Madame, Monsieur,

En qualité de locataire du logement situé au [ADRESSE DU LOGEMENT], je me permets de vous demander de bien vouloir me fournir une quittance de loyer pour le(s) mois de [MOIS CONCERNÉS].

Conformément à l'article 21 de la loi du 6 juillet 1989, le bailleur est tenu de transmettre gratuitement une quittance au locataire qui en fait la demande.

Cette quittance m'est nécessaire pour [mes démarches administratives / ma demande d'aide au logement auprès de la CAF].

Je vous remercie par avance et reste à votre disposition.

Cordialement,

[VOTRE NOM]
[DATE]`,
  },
  {
    id: 'contestation-facture',
    title: 'Contester une facture',
    emoji: '⚠️',
    category: 'admin',
    description: 'Pour contester un montant anormal sur une facture (téléphone, énergie, etc.).',
    template: `Objet : Contestation de facture n° [NUMÉRO DE FACTURE]

Madame, Monsieur,

Je me permets de contester la facture n° [NUMÉRO] d'un montant de [MONTANT] € datée du [DATE DE LA FACTURE].

En effet, [EXPLIQUER LA RAISON : montant anormalement élevé / service non fourni / erreur de facturation / double prélèvement].

Je vous demande de bien vouloir procéder à la vérification de cette facture et, le cas échéant, à l'établissement d'un avoir ou d'une facture rectificative.

Dans l'attente de votre réponse, je suspends le paiement de la somme contestée conformément à mes droits.

Je vous prie d'agréer, Madame, Monsieur, mes salutations distinguées.

[VOTRE NOM]
[NUMÉRO CLIENT]
[DATE]`,
  },
  {
    id: 'preavis-logement',
    title: 'Donner son préavis de logement',
    emoji: '📦',
    category: 'logement',
    description: 'Lettre officielle pour informer ton propriétaire que tu quittes le logement.',
    template: `Objet : Congé du logement situé au [ADRESSE]

Madame, Monsieur,

Par la présente, je vous notifie ma décision de quitter le logement que j'occupe au [ADRESSE COMPLÈTE DU LOGEMENT], conformément aux dispositions de la loi du 6 juillet 1989.

Mon préavis prendra effet à compter de la réception de ce courrier. La durée du préavis applicable est de [1 MOIS si zone tendue / meublé / mutation / perte d'emploi / RSA — sinon 3 MOIS].

Motif du préavis réduit (le cas échéant) : [MOTIF — ex : le logement est situé en zone tendue / j'ai obtenu un premier emploi / j'ai perdu mon emploi].

Je me tiens à votre disposition pour convenir d'une date pour l'état des lieux de sortie et la remise des clés.

Je vous rappelle que le dépôt de garantie devra m'être restitué dans un délai d'un mois si l'état des lieux de sortie est conforme à l'état des lieux d'entrée.

Cordialement,

[VOTRE NOM]
[DATE]`,
  },
  {
    id: 'demande-stage',
    title: 'Candidature spontanée (stage/emploi)',
    emoji: '💼',
    category: 'emploi',
    description: 'Modèle de lettre de motivation pour une candidature spontanée.',
    template: `Objet : Candidature spontanée pour un [stage / emploi] en [DOMAINE]

Madame, Monsieur,

Actuellement [étudiant(e) en [FORMATION] à [ÉTABLISSEMENT] / en recherche d'emploi dans le domaine de [DOMAINE]], je me permets de vous adresser ma candidature spontanée pour un [stage / poste] au sein de votre entreprise.

[PARAGRAPHE SUR VOTRE PARCOURS : Votre parcours, vos compétences clés, ce que vous avez appris…]

[PARAGRAPHE SUR L'ENTREPRISE : Pourquoi cette entreprise vous intéresse, ce que vous pouvez apporter…]

Je serais ravi(e) de pouvoir échanger avec vous lors d'un entretien afin de vous présenter plus en détail mon parcours et ma motivation.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[VOTRE NOM]
[TÉLÉPHONE]
[EMAIL]
[DATE]`,
  },
  {
    id: 'signalement-probleme-logement',
    title: 'Signaler un problème au propriétaire',
    emoji: '🔧',
    category: 'logement',
    description: 'Pour signaler un problème (fuite, chauffage, moisissure…) et demander une réparation.',
    template: `Objet : Signalement de désordres dans le logement — demande de réparation

Madame, Monsieur,

Je me permets de vous signaler le(s) problème(s) suivant(s) constaté(s) dans le logement que j'occupe au [ADRESSE] :

- [DESCRIPTION DU PROBLÈME 1 : ex. fuite d'eau dans la salle de bain]
- [DESCRIPTION DU PROBLÈME 2 : ex. chauffage défaillant]

Conformément à l'article 6 de la loi du 6 juillet 1989, le bailleur est tenu de maintenir le logement en bon état et d'effectuer les réparations nécessaires qui ne sont pas locatives.

Je vous demande de bien vouloir faire procéder aux réparations dans les meilleurs délais. À défaut de réponse sous 15 jours, je me verrai dans l'obligation de saisir la Commission départementale de conciliation.

[Des photos des désordres sont jointes à ce courrier.]

Cordialement,

[VOTRE NOM]
[DATE]`,
  },
  {
    id: 'demande-delai-loyer',
    title: 'Demande de délai de paiement — loyer',
    emoji: '🏠',
    category: 'logement',
    description: 'Courrier à envoyer à ton propriétaire quand tu ne peux pas payer le loyer ce mois-ci.',
    template: `Objet : Demande de délai exceptionnel de paiement du loyer

Madame, Monsieur,

Je me permets de vous contacter au sujet du paiement de mon loyer du mois de [MOIS] pour le logement situé au [ADRESSE].

En raison de [EXPLIQUER BRIÈVEMENT : difficultés financières passagères / dépense imprévue / retard de virement...], je me trouve dans l'impossibilité de vous régler la somme de [MONTANT] € à la date habituelle.

Je vous sollicite donc pour un délai exceptionnel jusqu'au [DATE PROPOSÉE — ex: 15 jours plus tard]. Je m'engage à vous régler l'intégralité du loyer à cette date et à reprendre le paiement normal le mois suivant.

Je reste bien entendu disponible par téléphone ou par email pour en discuter avec vous.

Je vous remercie par avance de votre compréhension.

Cordialement,

[VOTRE NOM]
[DATE]`,
  },
  {
    id: 'reponse-mise-en-demeure',
    title: 'Réponse à une mise en demeure',
    emoji: '📬',
    category: 'admin',
    description: 'Répondre par écrit à une mise en demeure pour prouver ta bonne foi et éviter la procédure judiciaire.',
    template: `Objet : Réponse à votre mise en demeure du [DATE DE LA MISE EN DEMEURE]

Madame, Monsieur,

J'ai bien reçu votre courrier en date du [DATE] par lequel vous me mettez en demeure de [OBJET DE LA MISE EN DEMEURE].

Je prends bonne note de votre demande et souhaite vous apporter les précisions suivantes :

[EXPLIQUER TA SITUATION : reconnaître la dette si elle est réelle / contester si ce n'est pas justifié / proposer un plan de règlement]

[SI TU RECONNAIS LA DETTE :] Je m'engage à régulariser cette situation dans les meilleurs délais et vous propose un règlement de [MODALITÉS : somme en une fois / échéancier].

[SI TU CONTESTES :] Je conteste formellement le bien-fondé de cette mise en demeure pour les raisons suivantes : [MOTIFS].

Je reste à votre disposition pour trouver une solution amiable et vous adresse mes coordonnées : [TÉLÉPHONE / EMAIL].

Cordialement,

[VOTRE NOM]
[ADRESSE]
[DATE]`,
  },
  {
    id: 'contestation-amende',
    title: "Contestation d'amende",
    emoji: '⚖️',
    category: 'admin',
    description: "Contester une amende (contravention, amende administrative) par lettre recommandée.",
    template: `Objet : Contestation de l'avis de contravention n° [NUMÉRO DE L'AMENDE]

Madame, Monsieur,

Je soussigné(e) [VOTRE NOM], né(e) le [DATE DE NAISSANCE], demeurant au [ADRESSE], conteste par la présente l'avis de contravention n° [NUMÉRO] reçu le [DATE] pour [MOTIF INDIQUÉ SUR L'AMENDE].

Les motifs de ma contestation sont les suivants :

[EXPLIQUER CLAIREMENT : ex. — je n'étais pas au volant du véhicule / le panneau était masqué / l'infraction n'a pas été commise / j'ai bien respecté les règles...]

[JOINDRE LES PREUVES DISPONIBLES : photos, témoignages, justificatifs...]

Je vous demande donc de bien vouloir annuler cette contravention et vous en remercie par avance.

Je reste à votre disposition pour tout renseignement complémentaire.

Cordialement,

[VOTRE NOM]
[ADRESSE]
[DATE]`,
  },
  {
    id: 'demande-echeancier',
    title: 'Demander un échéancier de paiement',
    emoji: '💳',
    category: 'banque',
    description: 'Si tu as du mal à payer une facture, tu peux demander à étaler le paiement.',
    template: `Objet : Demande d'échéancier de paiement

Madame, Monsieur,

Je fais suite à [la facture / le relevé] n° [NUMÉRO] d'un montant de [MONTANT] € que je ne suis malheureusement pas en mesure de régler en une seule fois.

En effet, [EXPLIQUER BRIÈVEMENT LA SITUATION : perte d'emploi / dépense imprévue / baisse de revenus temporaire].

Je vous serais reconnaissant(e) de bien vouloir m'accorder un échéancier de paiement afin de régler cette somme en [NOMBRE] mensualités de [MONTANT PAR MOIS] €.

Je m'engage à respecter scrupuleusement cet échéancier et à reprendre le paiement normal de mes factures dès que ma situation financière le permettra.

Je vous remercie par avance de votre compréhension.

Cordialement,

[VOTRE NOM]
[NUMÉRO CLIENT]
[DATE]`,
  },
];

export const COURRIER_CATEGORIES = {
  resiliation: { label: 'Résiliation', emoji: '✂️' },
  logement: { label: 'Logement', emoji: '🏠' },
  emploi: { label: 'Emploi', emoji: '💼' },
  admin: { label: 'Administratif', emoji: '📋' },
  banque: { label: 'Banque', emoji: '🏦' },
};
