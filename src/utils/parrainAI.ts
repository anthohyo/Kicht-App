import { UserProfile } from '../types';
import { ChatMessage } from '../types';

export interface ParrainResult {
  text: string;
  actionCard?: ChatMessage['actionCard'];
}

// Réponses contextuelles du Parrain — beaucoup plus détaillées et pédagogiques
// À terme, connecter à Claude API pour des réponses vraiment dynamiques

interface Rule {
  keywords: string[];
  response: string | ((profile: UserProfile | null) => string | ParrainResult);
}

const rules: Rule[] = [
  // --- IMPÔTS & DÉCLARATION ---
  {
    keywords: ['impôt', 'impots', 'déclaration', 'déclarer', 'fiscal', 'revenus', 'taux'],
    response: (profile) => {
      const age = profile?.age || 20;
      let text = `🏛️ **Les impôts, c'est moins compliqué qu'on croit.**\n\n`;

      if (age < 21) {
        text += `À ${age} ans, tu as 2 options :\n`;
        text += `• Rester rattaché·e au foyer fiscal de tes parents (plus simple)\n`;
        text += `• Faire ta propre déclaration (ça te donne ton propre avis d'imposition)\n\n`;
        text += `👉 Mon conseil : fais ta propre déclaration si tu veux demander l'APL ou d'autres aides, car beaucoup demandent un avis d'imposition à ton nom.\n\n`;
      } else {
        text += `À ${age} ans, tu dois normalement faire ta propre déclaration.\n\n`;
      }

      text += `**Concrètement :**\n`;
      text += `1. Va sur impots.gouv.fr entre avril et juin\n`;
      text += `2. Connecte-toi avec tes identifiants (numéro fiscal + mot de passe)\n`;
      text += `3. Vérifie les montants pré-remplis (salaires, etc.)\n`;
      text += `4. Valide ta déclaration\n\n`;
      text += `💡 Même si tu gagnes 0 €, déclare quand même. L'avis d'imposition est INDISPENSABLE pour l'APL, la bourse, Visale…`;
      return text;
    },
  },
  {
    keywords: ['numéro fiscal', 'numero fiscal', 'identifiant fiscal', 'première fois impôts'],
    response: `📋 **Tu n'as pas encore de numéro fiscal ?**\n\nSi c'est ta toute première déclaration :\n1. Va sur impots.gouv.fr > "Vous n'avez pas encore de numéro fiscal"\n2. Remplis le formulaire en ligne\n3. Tu recevras un courrier avec ton numéro fiscal et ton mot de passe\n\nSi tes parents t'avaient déjà déclaré, tu as peut-être déjà un numéro sans le savoir. Demande-leur ou contacte ton centre des impôts.\n\n💡 Garde précieusement ce numéro, tu en auras besoin toute ta vie !`,
  },

  // --- APL / LOGEMENT ---
  {
    keywords: ['apl', 'aide logement', 'aide au logement'],
    response: (profile) => {
      // Emménagement à venir → le sujet n'est pas l'éligibilité, c'est le calendrier.
      // L'APL n'étant pas rétroactive, chaque mois de retard est définitivement perdu.
      if (profile?.housingType === 'futur') {
        const text = `🏠 **L'APL quand tu emménages**\n\nTu y auras droit dès que tu auras un bail à ton nom. Le point important, c'est **quand** tu la demandes.\n\n**La règle qui coûte cher :** l'APL n'est **jamais versée rétroactivement**. Si tu emménages en septembre et que tu fais ta demande en novembre, les deux mois sont perdus pour toujours.\n\n**Dans l'ordre :**\n• 🛡️ **Maintenant** — demande ta garantie **Visale** sur visale.fr. C'est gratuit, ça remplace un garant, et c'est ce qui fait accepter ton dossier face aux autres candidats. À faire **avant** les visites.\n• 💻 **Maintenant aussi** — crée ton compte sur caf.fr, ça prend 10 minutes et ça t'évite de le faire dans l'urgence.\n• 📄 **Le mois de l'emménagement** — fais ta demande d'aide au logement avec ton bail et ton RIB.\n• ⏳ **Prévois 2 mois** avant le premier versement. Il faut pouvoir avancer le loyer en attendant.\n\n💡 Dis-moi le loyer que tu vises, je te dirai ce qu'il te restera vraiment à payer une fois l'APL déduite.`;
        return { text, actionCard: { label: '🎯 Voir toutes mes aides', navigateTo: 'SimulateurAides' } };
      }

      // Chez les parents → pas d'APL
      if (profile?.housingType === 'parents') {
        // La bourse CROUS est inaccessible si école privée non conventionnée
        const bourseItem = profile?.schoolType === 'prive_non_reconnu'
          ? `• 🏫 **Bourses alternatives** — bourse interne de ton école ou bourses régionales (bourse CROUS non accessible pour ton établissement)`
          : `• 🎓 **Bourse CROUS** — calculée sur les revenus de tes parents, même sans loyer`;
        const text = `🏠 **APL et logement chez tes parents**\n\nTu vis chez tes parents, donc tu n'es **pas éligible à l'APL** — elle est réservée aux personnes qui paient un loyer.\n\n**Ce que tu peux toucher quand même :**\n${bourseItem}\n• 💊 **CSS** — mutuelle gratuite si tes revenus sont modestes\n• 💶 **Prime d'activité** — si tu travailles à côté\n• 🎯 **FAJ** — si tu as moins de 25 ans et un projet d'autonomie\n\n💡 Si tu envisages de déménager, simule ton futur APL sur caf.fr pour voir ce que tu toucherais dès le premier mois.`;
        if (profile?.schoolType === 'prive_non_reconnu') {
          return { text, actionCard: { label: '📋 Trouver une bourse pour mon école', guideId: 'bourses-alternatives-ecole-privee' } };
        }
        return text;
      }

      // Résidence CROUS → APL spécifique
      if (profile?.housingType === 'crous') {
        return `🏠 **APL en résidence CROUS**\n\nBonne nouvelle : l'APL existe aussi pour les résidences CROUS !\n\n**Particularité CROUS :**\n• La demande se fait sur caf.fr avec un justificatif CROUS\n• Le montant est souvent plus faible (le loyer CROUS est déjà subventionné)\n• Elle peut s'appeler ALS selon ta situation\n\n**Pour la demander :**\n1. Va sur caf.fr\n2. Crée ton compte avec ton numéro de sécu\n3. Fournis : contrat CROUS, RIB, avis d'imposition\n\n⚠️ Fais la demande dès ton arrivée — l'APL n'est pas rétroactive !`;
      }

      // Standard
      let text = `🏠 **L'APL (Aide Personnalisée au Logement)**\n\nC'est une aide mensuelle de la CAF qui réduit ton loyer.\n\n`;

      if (profile?.housingType === 'coloc') {
        text += `En colocation, l'APL est calculée sur **ta part individuelle du loyer** — pas sur le loyer total. Chaque colocataire fait sa demande séparément.\n\n`;
      } else if (profile?.status === 'etudiant') {
        text += `En tant qu'étudiant·e, tu y as droit dès que tu loues un logement !\n\n`;
      }

      text += `**Comment ça marche :**\n• Le montant dépend de ton loyer, ta ville et tes revenus\n• En général : entre 50 € et 300 €/mois\n• C'est versé directement à ton proprio ou sur ton compte\n\n`;
      text += `**Pour la demander :**\n1. Va sur caf.fr\n2. Crée ton compte\n3. Fais ta demande en ligne (10 min)\n4. Fournis : bail, RIB, avis d'imposition\n\n`;
      text += `⚠️ IMPORTANT : fais-le DÈS que tu emménages ! L'APL n'est pas rétroactive.`;

      if (profile?.expenses?.loyer && profile.expenses.loyer > 0) {
        text += `\n\n💡 Avec un loyer de ${profile.expenses.loyer} €, tu pourrais toucher un montant intéressant. Simule sur caf.fr !`;
      }
      return text;
    },
  },
  {
    keywords: ['caf'],
    response: `🏛️ **La CAF (Caisse d'Allocations Familiales)**\n\nC'est l'organisme qui verse la plupart des aides :\n• APL (aide au logement)\n• Prime d'activité\n• RSA (si tu as + de 25 ans)\n• Allocations familiales\n\n**Première étape :** crée ton compte sur caf.fr avec ton numéro de sécu. Ensuite tu peux simuler tes droits et faire tes demandes en ligne.\n\n💡 Pense à mettre à jour ta situation dès qu'elle change (déménagement, nouveau travail, etc.) sinon tu risques des trop-perçus à rembourser.`,
  },

  // --- ETF / INVESTISSEMENT ---
  {
    keywords: ['etf', 'investir', 'investissement', 'pea', 'tracker', 'actions', 'placements'],
    response: `📈 **C'est quoi un ETF ?**\n\nUn ETF (Exchange Traded Fund), c'est un panier d'actions que tu achètes en une seule fois. Par exemple, un ETF "CAC 40" te donne une part de chacune des 40 plus grandes entreprises françaises.\n\n**Pourquoi c'est intéressant pour un jeune ?**\n• Tu investis avec peu d'argent (à partir de 10 €)\n• Tu es diversifié automatiquement — pas de risque de tout perdre sur une seule action\n• Les frais sont très faibles (0,1 à 0,5% par an)\n• Sur le long terme, la bourse rapporte en moyenne 7-8% par an\n\n**Par où commencer ?**\n1. Ouvre un PEA (Plan d'Épargne en Actions) dans ta banque — avantage fiscal après 5 ans\n2. Investis régulièrement un petit montant chaque mois (même 20 €)\n3. Ne touche pas à l'argent pendant plusieurs années\n\n💡 L'ETF le plus populaire chez les jeunes : le MSCI World, qui regroupe les 1 500 plus grandes entreprises mondiales.\n\n👉 Utilise le simulateur d'épargne de l'app pour voir combien tu pourrais gagner !`,
  },

  // --- BOURSE CROUS ---
  {
    keywords: ['crous', 'dse', 'dossier social', 'bourse etudiante', 'bourse crous'],
    response: (profile) => {
      // École privée non conventionnée → bourse inaccessible
      if (profile?.status === 'etudiant' && profile?.schoolType === 'prive_non_reconnu') {
        return {
          text: `🎓 **Bourse CROUS — non accessible pour ton école**\n\nTon école n'a pas de convention avec le CROUS, donc la bourse nationale n'est **pas accessible** dans ta situation. Mais des alternatives existent :\n\n**Ce que tu peux faire à la place :**\n• 🏫 **Bourse interne de ton école** — beaucoup d'écoles privées ont un fonds d'aide sociale. Renseigne-toi auprès de ton administration ou du bureau des étudiants.\n• 🗺️ **Bourse régionale** — certaines régions financent les étudiants quelle que soit leur école (renseigne-toi sur le site de ta région)\n• 💊 **CSS** — mutuelle gratuite selon tes revenus, accessible à tous les étudiants\n• 💶 **Prime d'activité** — si tu travailles à côté (salaire > ~1 070 €/mois)\n• 🎯 **FAJ** — si tu as moins de 25 ans et une situation difficile\n\n💡 Renseigne-toi aussi sur les fondations et bourses privées : Fondation de France, fondations d'entreprises de ton secteur, bourses de ta ville.`,
          actionCard: { label: '📋 Trouver une bourse pour mon école', guideId: 'bourses-alternatives-ecole-privee' },
        };
      }

      // École privée reconnue → incertitude
      if (profile?.status === 'etudiant' && profile?.schoolType === 'prive_reconnu') {
        return `🎓 **Bourse CROUS — à vérifier pour ton école**\n\nCertaines écoles privées reconnues ont une convention avec le CROUS, d'autres non.\n\n**Ce que tu dois faire :**\n1. Demande à ton administration ou service scolarité si l'école est conventionnée CROUS\n2. Si oui : fais ton DSE sur messervices.etudiant.gouv.fr entre janvier et mai\n3. Si non : renseigne-toi sur les aides internes à ton école et les bourses régionales\n\n**Les critères si tu es éligible :**\n• Revenus de tes parents (avis d'imposition N-2)\n• Distance domicile ↔ lieu d'études\n• Nombre de frères/sœurs étudiants\n\n💡 En cas de doute, fais quand même la demande sur messervices.etudiant.gouv.fr — le système te dira si ton école est éligible.`;
      }

      // Standard (école publique ou non étudiant)
      let text = `🎓 **La bourse du CROUS**\n\nC'est une aide mensuelle pour les étudiants, versée sur 10 mois.\n\n`;
      text += `**Les montants (2025-2026) :**\n• Échelon 0bis : ~1 200 €/an\n• Échelon 7 (max) : ~6 300 €/an\n• + exonération des frais de scolarité !\n\n`;
      text += `**Les critères :**\n• Revenus de tes parents (avis d'imposition N-2)\n• Distance domicile familial ↔ lieu d'études\n• Nombre de frères/sœurs étudiants\n\n`;
      text += `**Comment la demander :**\n1. Va sur messervices.etudiant.gouv.fr\n2. Fais ton DSE (Dossier Social Étudiant) entre janvier et mai\n3. Tu recevras une réponse en quelques semaines\n\n`;
      text += `⚠️ Même si tu penses ne pas y avoir droit, fais la demande ! Beaucoup d'étudiants passent à côté.`;

      if (profile?.status !== 'etudiant') {
        text += `\n\n💡 Tu n'es pas étudiant·e d'après ton profil, mais si tu reprends des études, pense à la bourse !`;
      }
      return text;
    },
  },

  // --- PRIME D'ACTIVITÉ ---
  {
    keywords: ['prime activité', 'prime d\'activité', 'prime activite'],
    response: (profile) => {
      let text = `💶 **La prime d'activité**\n\n`;
      text += `C'est une aide mensuelle de la CAF pour les travailleurs à revenus modestes.\n\n`;

      text += `**Qui y a droit ?**\n`;
      text += `• Les salariés gagnant jusqu'à ~1 800 € net/mois (environ)\n`;
      text += `• Les apprentis et étudiants salariés (si salaire > ~1 070 €/mois)\n`;
      text += `• Avoir + de 18 ans\n\n`;

      text += `**Combien ?**\n`;
      text += `• En moyenne 150 à 250 €/mois, ça dépend de ta situation\n\n`;

      text += `**Comment la demander :**\n`;
      text += `1. Simule tes droits sur caf.fr > "Simuler mes droits"\n`;
      text += `2. Si tu es éligible, fais ta demande en ligne\n`;
      text += `3. Il faut déclarer tes revenus chaque trimestre sur le site\n\n`;

      if (profile?.monthlySalary && profile.monthlySalary > 0) {
        const sal = profile.monthlySalary;
        const isApprentietEtudiant = profile.status === 'apprenti' || profile.status === 'etudiant';
        const SEUIL_APPRENTI = 1070;

        if (sal >= 1800) {
          text += `💡 Avec ${sal} €/mois, tu dépasses le plafond (1 800 €). Tu n'es probablement pas éligible, mais simule quand même — ça dépend de ta situation familiale.`;
        } else if (isApprentietEtudiant && sal < SEUIL_APPRENTI) {
          text += `💡 Avec ${sal} €/mois, tu es **en dessous du seuil minimum pour les apprentis et étudiants** (1 070 €/mois). Tu n'es malheureusement pas éligible à la prime d'activité dans ta situation actuelle.`;
        } else {
          text += `💡 Avec ${sal} €/mois, tu rentres dans la fourchette éligible ! Fais vite la simulation sur caf.fr — ça prend 5 minutes.`;
        }
      } else {
        text += `💡 Fais la simulation même si tu doutes, ça prend 5 minutes !`;
      }
      return text;
    },
  },

  // --- BUDGET & ARGENT ---
  {
    keywords: ['budget', 'gérer mon argent', 'gestion argent'],
    response: (profile) => {
      let text = `📊 **Gérer son budget, la base de la base**\n\n`;

      if (profile?.expenses) {
        const total = Object.values(profile.expenses).reduce((a, b) => a + b, 0);
        const reste = (profile.monthlySalary || 0) - total;

        text += `D'après ton profil :\n`;
        text += `• Revenus : ${profile.monthlySalary || 0} €/mois\n`;
        text += `• Dépenses fixes : ${total} €/mois\n`;
        text += `• Reste : ${reste} €/mois\n\n`;

        if (reste < 0) {
          text += `🚨 Tu es dans le rouge de ${Math.abs(reste)} €. Priorité : stopper la fuite.\n`;
          text += `• Coupe tout ce qui n'est pas vital ce mois-ci (sorties, abos, achats non urgents)\n`;
          text += `• Vérifie si tu as des aides non réclamées — l'APL ou la prime d'activité peuvent changer la situation\n`;
          text += `• Si tu as un découvert prévu, préviens ta banque avant — ça évite des frais en plus\n\n`;
        } else if (reste <= 20) {
          text += `🚨 ${reste} €, c'est vraiment très peu. L'objectif n°1 ce mois-ci : ne pas descendre en dessous de zéro.\n`;
          text += `• Ne fais aucune dépense non vitale\n`;
          text += `• Vérifie si tu as des aides qui peuvent débloquer de l'argent maintenant (APL, prime d'activité)\n`;
          text += `• Si tu as une dépense urgente à venir, pense à contacter le CCAS de ta mairie — ils ont des fonds d'urgence\n\n`;
        } else if (reste < 100) {
          text += `⚡ ${reste} €, c'est très serré. L'objectif : tenir jusqu'à la fin du mois sans imprévus.\n`;
          text += `• Évite toute dépense non prévue ce mois-ci\n`;
          text += `• Regarde si tu as des aides non réclamées dans l'onglet "Mes aides"\n\n`;
        } else {
          text += `✅ Tu as ${reste} € de marge, c'est bien ! Essaie d'en mettre un peu de côté chaque mois.\n\n`;
        }
      }

      const resteLocal = profile?.expenses
        ? (profile.monthlySalary || 0) - Object.values(profile.expenses).reduce((a, b) => a + b, 0)
        : 999;

      if (resteLocal < 50) {
        text += `**Ce mois-ci, une seule règle :**\n`;
        text += `→ Ne dépense que le strict nécessaire (nourriture, transport).\n`;
        text += `→ Vérifie tes aides dans l'onglet "Mes aides" — l'APL ou la prime d'activité peuvent débloquer de l'argent rapidement.\n\n`;
        text += `💡 La méthode 50/30/20 et l'épargne, c'est pour le mois prochain — une fois que tu respires à nouveau.`;
      } else {
        text += `**La méthode simple :**\n`;
        text += `1. Note TOUT ce que tu dépenses pendant 1 mois (utilise l'onglet Budget !)\n`;
        text += `2. Identifie tes dépenses fixes (loyer, abo, transport)\n`;
        text += `3. Le reste = ton budget variable (courses, sorties, plaisir)\n`;
        text += `4. Essaie la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne\n\n`;
        text += `💡 Le plus important : ne pas dépenser plus qu'on gagne. Ça a l'air bête, mais c'est la règle n°1.`;
      }
      return text;
    },
  },
  {
    keywords: ['économiser', 'économies', 'épargne', 'épargner', 'livret', 'placement'],
    response: `💰 **Épargner quand on est jeune**\n\n**Par où commencer :**\n• Ouvre un Livret A (0 € de frais, dispo immédiatement, 3% d'intérêts)\n• Si tu peux, ouvre aussi un LDDS (même principe)\n• Mets-y un montant fixe chaque mois, même 20 €\n\n**Le matelas de sécurité :**\nL'objectif = avoir 2-3 mois de dépenses de côté pour les urgences (panne, perte d'emploi, santé…). Ça prend du temps, mais c'est vital.\n\n**L'astuce :** mets en place un virement automatique le jour où tu reçois ton salaire. Ce que tu ne vois pas, tu ne le dépenses pas !\n\n💡 Le Livret A est GRATUIT et sans risque. C'est le meilleur premier réflexe.`,
  },
  {
    keywords: ['dépense', 'dépenses', 'réduire', 'trop cher', 'fin de mois'],
    response: (profile) => {
      let text = `📉 **Réduire ses dépenses — les astuces concrètes**\n\n`;

      text += `**Les quick wins :**\n`;
      text += `• Fais la liste de TOUS tes abonnements (Netflix, Spotify, salle de sport…). Supprime ceux que tu n'utilises pas vraiment\n`;
      text += `• Compare ton forfait téléphone (tu paies peut-être trop cher)\n`;
      text += `• Utilise des applis de cashback (iGraal, Poulpeo)\n`;
      text += `• Cuisiner au lieu de commander (on économise 100-200 €/mois facilement)\n\n`;

      text += `**Les courses :**\n`;
      text += `• Fais une liste AVANT d'aller au supermarché\n`;
      text += `• Regarde les promos et compare les prix au kilo\n`;
      text += `• Too Good To Go pour des repas pas chers\n\n`;

      text += `**Les sorties :**\n`;
      text += `• Happy hours plutôt que prix plein\n`;
      text += `• Soirées chez des potes plutôt qu'en bar\n`;
      text += `• Profite des réducs étudiants si tu en es un·e\n\n`;

      text += `💡 L'idée c'est pas de se priver de tout, mais de dépenser malin.`;
      return text;
    },
  },

  // --- PREMIER APPART ---
  {
    keywords: ['appart', 'appartement', 'déménager', 'louer', 'location', 'bail', 'premier appart'],
    response: `🏠 **Ton premier appart — le guide complet**\n\n**Avant de chercher :**\n• Définis ton budget MAX (loyer = max 1/3 de tes revenus)\n• Prépare ton dossier : pièce d'identité, 3 derniers bulletins de salaire, avis d'imposition, RIB\n• Si tu n'as pas de garant, inscris-toi sur Visale.fr (caution gratuite de l'État)\n\n**La visite :**\n• Vérifie l'état (murs, plomberie, électricité, humidité)\n• Note le DPE (étiquette énergie) — ça impacte ta facture\n• Regarde le quartier à différentes heures\n\n**Le jour J :**\n• Fais un état des lieux DÉTAILLÉ avec photos (c'est ce qui te protège)\n• Souscris ton assurance habitation AVANT la remise des clés\n• Ouvre tes compteurs (électricité, gaz, internet)\n\n**Les démarches :**\n• Signale ton changement d'adresse (impôts, sécu, banque, La Poste)\n• Demande l'APL immédiatement sur caf.fr\n\n💡 Utilise la checklist "Premier appart" dans l'app pour ne rien oublier !`,
  },
  {
    keywords: ['garant', 'caution', 'visale', 'dépôt de garantie'],
    response: `🛡️ **Garant et caution — comment faire ?**\n\n**Le garant :** c'est quelqu'un qui s'engage à payer ton loyer si tu ne peux plus. En général, les parents.\n\n**Si tu n'as pas de garant :**\n• **Visale** (visale.fr) : caution gratuite de l'État, pour les jeunes < 30 ans. Acceptée par la plupart des proprios.\n• **Garantme** ou **Cautioneo** : services payants de cautionnement (~3-4% du loyer/an)\n\n**Le dépôt de garantie :**\n• C'est 1 mois de loyer hors charges (max légal)\n• Versé à la signature du bail\n• Rendu dans les 2 mois après ton départ (si pas de dégâts)\n\n💡 Visale est GRATUIT et super rapide à mettre en place. Fais-le avant de commencer tes visites !`,
  },

  // --- ASSURANCE ---
  {
    keywords: ['assurance', 'habitation', 'mutuelle', 'responsabilité civile'],
    response: `🛡️ **Les assurances quand on est jeune**\n\n**L'assurance habitation (OBLIGATOIRE) :**\n• Obligatoire pour tout locataire\n• À partir de 5-10 €/mois\n• Compare en ligne : Luko, MAIF, MACIF, ta banque…\n• Souscris AVANT la remise des clés\n\n**La responsabilité civile :**\n• Souvent incluse dans l'assurance habitation\n• Te couvre si tu causes un dommage à quelqu'un\n• Demandée par les écoles/universités\n\n**La mutuelle santé :**\n• Si tu es étudiant·e : tu es couvert·e par la Sécurité sociale étudiante\n• Si tu travailles : ton employeur doit te proposer une mutuelle (obligatoire)\n• La Complémentaire Santé Solidaire (CSS) est gratuite si tu as de petits revenus\n\n💡 L'assurance habitation, c'est le seul truc vraiment obligatoire. Le reste, adapte selon ta situation.`,
  },

  // --- BANQUE ---
  {
    keywords: ['banque', 'compte', 'carte', 'découvert', 'frais bancaires'],
    response: `🏦 **Choisir sa banque quand on est jeune**\n\n**Banque en ligne vs banque classique :**\n• En ligne (Boursorama, Fortuneo, Hello Bank) : souvent GRATUIT, bonne appli\n• Néobanque (Revolut, N26, Lydia) : pratique mais pas toujours un vrai compte français\n• Classique (BNP, Crédit Agricole, etc.) : utile si tu as besoin d'un conseiller en personne\n\n**Ce qu'il faut vérifier :**\n• Frais de tenue de compte (0 € en ligne, 2-5 €/mois en classique)\n• Prix de la carte bancaire\n• Découvert autorisé (attention aux agios !)\n• Qualité de l'appli mobile\n\n**Le découvert :**\n• C'est un prêt déguisé, ça coûte cher en intérêts\n• Ne l'utilise qu'en urgence\n• Négocie le montant avec ta banque\n\n💡 Les banques en ligne sont souvent le meilleur choix pour un jeune : 0 frais et bonnes applis.`,
  },

  // --- TRAVAIL / SALAIRE ---
  {
    keywords: ['salaire', 'fiche de paie', 'contrat', 'travail', 'emploi', 'cdi', 'cdd', 'intérim'],
    response: `💼 **Comprendre ton salaire et tes droits**\n\n**Fiche de paie :**\n• Salaire brut : ce que ton employeur paie\n• Salaire net : ce que tu touches (brut - ~22% de cotisations)\n• Net imposable : ce que tu déclares aux impôts (un peu plus que le net)\n\n**Tes droits :**\n• SMIC 2025 : ~1 398 € net/mois (temps plein)\n• 5 semaines de congés payés minimum\n• Mutuelle obligatoire payée au moins à 50% par l'employeur\n• Période d'essai : 2 mois (CDI) ou variable (CDD)\n\n**Les pièges à éviter :**\n• Garde TOUTES tes fiches de paie (à vie !)\n• Vérifie que tes heures sup sont payées\n• En CDD, tu as droit à une prime de précarité (10% du salaire total)\n\n💡 Tu peux vérifier ta fiche de paie sur service-public.fr > simulateur de fiche de paie.`,
  },

  // --- SANTÉ ---
  {
    keywords: ['santé', 'médecin', 'sécu', 'sécurité sociale', 'carte vitale', 'ameli'],
    response: `🏥 **La santé quand on est jeune**\n\n**Carte Vitale :**\n• Dès 16 ans, tu as ta propre carte Vitale\n• Si tu ne l'as pas, demande-la sur ameli.fr\n• Elle te rembourse ~70% des frais médicaux\n\n**Médecin traitant :**\n• Déclare un médecin traitant sur ameli.fr (c'est gratuit)\n• Sinon tu es moins bien remboursé·e\n\n**La CSS (Complémentaire Santé Solidaire) :**\n• C'est une mutuelle GRATUITE si tu as de petits revenus\n• Demande sur ameli.fr\n• Elle couvre ce que la sécu ne rembourse pas\n\n💡 La santé c'est important : déclare un médecin traitant et vérifie tes droits à la CSS !`,
  },

  // --- ARNAQUE ---
  {
    keywords: ['arnaque', 'scam', 'phishing', 'faux', 'escroquerie'],
    response: `⚠️ **Attention aux arnaques — les plus courantes**\n\n**Par email/SMS :**\n• "La CAF vous doit de l'argent" → FAUX, la CAF ne contacte jamais par SMS\n• "Votre colis est bloqué" → arnaque classique\n• "Les impôts vous remboursent" → toujours vérifier l'adresse de l'expéditeur\n\n**Logement :**\n• Ne paie JAMAIS avant d'avoir visité\n• Méfie-toi des loyers trop bas\n• Vérifie que le propriétaire est bien propriétaire\n\n**Règles d'or :**\n• Ne donne jamais ton RIB ou numéro de carte par email\n• Vérifie toujours l'URL des sites (impots.gouv.fr, pas impots-gouv.com)\n• En cas de doute, appelle directement l'organisme concerné\n\n💡 Si tu t'es fait arnaquer : porte plainte et signale sur internet-signalement.gouv.fr`,
  },

  // --- GREETINGS ---
  {
    keywords: ['bonjour', 'salut', 'hello', 'yo', 'coucou', 'hey', 'bonsoir'],
    response: (profile) => {
      const name = profile?.firstName
        ? ` ${profile.firstName.charAt(0).toUpperCase() + profile.firstName.slice(1)}`
        : '';
      return `Salut${name} ! 👋\n\nJe suis Le Parrain, ton guide de survie pour la vie adulte.\n\nJe peux t'aider sur :\n• 💶 Budget et épargne\n• 🏛️ Impôts et déclaration\n• 🏠 APL, bourse, prime d'activité\n• 🏠 Premier appartement\n• 🏦 Banque et assurance\n• 💼 Travail et salaire\n• 🏥 Santé et sécu\n\nPose-moi ta question !`;
    },
  },
  {
    keywords: ['merci', 'thanks', 'cool', 'top', 'parfait', 'génial', 'super'],
    response: 'De rien ! C\'est le rôle du Parrain 😎\n\nSi tu as d\'autres questions, n\'hésite pas. Aucune question n\'est bête, on est tous passés par là !',
  },
  {
    keywords: ['aide', 'aides', 'quelles aides', 'droits'],
    response: (profile) => {
      let text = `📋 **Les aides auxquelles tu pourrais avoir droit**\n\n`;

      // Logement — adapter si chez les parents
      text += `**Logement :**\n`;
      if (profile?.housingType === 'parents') {
        text += `• APL → non accessible chez les parents, mais dès que tu loues tu y as droit\n`;
      } else {
        text += `• APL → si tu paies un loyer (caf.fr)\n`;
      }
      text += `• Visale → caution gratuite si < 30 ans\n`;
      text += `• Loca-Pass → aide au dépôt de garantie\n\n`;

      // Études — adapter si école non conventionnée
      text += `**Études :**\n`;
      if (profile?.status === 'etudiant' && profile?.schoolType === 'prive_non_reconnu') {
        text += `• Bourse CROUS → ❌ non accessible (école non conventionnée)\n`;
        text += `• Bourses alternatives → école, région, fondations privées\n`;
      } else {
        text += `• Bourse CROUS → selon revenus des parents\n`;
      }
      text += `• Aide au mérite → si mention TB au bac\n`;
      text += `• Aide à la mobilité → si tu changes d'académie\n\n`;

      text += `**Travail :**\n`;
      text += `• Prime d'activité → si tu travailles à petit salaire\n`;
      text += `• Garantie jeunes → si tu es en difficulté (Mission locale)\n\n`;

      text += `**Santé :**\n`;
      text += `• CSS → mutuelle gratuite si petits revenus\n\n`;

      if (profile?.status === 'etudiant') {
        const aplTip = profile?.housingType === 'parents' ? 'APL dès que tu auras ton propre logement' : 'APL';
        const bourseTip = profile?.schoolType === 'prive_non_reconnu' ? 'bourses alternatives (école/région)' : 'bourse CROUS';
        text += `💡 En tant qu'étudiant·e, vérifie en priorité : ${bourseTip} + ${aplTip} + CSS.`;
      } else if (profile?.status === 'salarie' || profile?.status === 'apprenti') {
        text += `💡 En tant que ${profile.status === 'apprenti' ? 'apprenti·e' : 'salarié·e'}, vérifie : prime d'activité + APL.`;
      } else {
        text += `💡 Va faire un tour à la Mission locale de ta ville, ils peuvent t'aider gratuitement !`;
      }
      // Retourner avec actionCard si école privée non conventionnée
      if (profile?.status === 'etudiant' && profile?.schoolType === 'prive_non_reconnu') {
        return { text, actionCard: { label: '📋 Trouver une bourse pour mon école', guideId: 'bourses-alternatives-ecole-privee' } };
      }
      return text;
    },
  },

  // --- QUESTIONS SUR LE PARRAIN ---
  {
    keywords: ['qui es tu', 'qui es-tu', 'tu es qui', 'qu\'est-ce que'],
    response: `🎩 **Je suis Le Parrain !**\n\nTon guide de survie pour la vie adulte. Je suis là pour t'expliquer simplement tout ce qu'on n'apprend pas à l'école :\n\n• Comment gérer ton argent\n• Comment faire ta déclaration d'impôts\n• Quelles aides existent pour toi\n• Comment t'installer dans ton premier appart\n• Et plein d'autres trucs utiles !\n\nJe ne suis pas un conseiller officiel, mais je te donne les bonnes infos et les bons liens. Pose-moi ta question ! 💪`,
  },
];

// Réponse par défaut plus utile
const defaultResponse = `Bonne question ! Tu peux me poser des questions sur ton budget, tes impôts, les aides (APL, bourse, prime d'activité), ton premier appart, ta banque, ta santé et tes droits au travail. C'est quoi ta situation ?`;

export function getParrainResponse(message: string, profile: UserProfile | null): ParrainResult {
  // Normaliser le message (retirer accents pour matching)
  const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const rule of rules) {
    const match = rule.keywords.some((kw) => {
      const normalizedKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return lower.includes(normalizedKw);
    });
    if (match) {
      const result = typeof rule.response === 'function' ? rule.response(profile) : rule.response;
      if (typeof result === 'string') return { text: result };
      return result;
    }
  }

  return { text: defaultResponse };
}
