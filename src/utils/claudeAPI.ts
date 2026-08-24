import { UserProfile } from '../types';

// Appel à l'API Claude pour des réponses intelligentes
// Fallback sur le système de keywords si pas de clé API

// Types d'erreur pour un meilleur handling côté UI
export type ClaudeErrorType = 'network' | 'auth' | 'rate_limit' | 'server' | 'unknown';

export class ClaudeAPIError extends Error {
  type: ClaudeErrorType;
  statusCode?: number;

  constructor(message: string, type: ClaudeErrorType, statusCode?: number) {
    super(message);
    this.name = 'ClaudeAPIError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

// Routing Haiku/Sonnet selon la complexité de la question
const COMPLEX_KEYWORDS = [
  'auto-entrepreneur', 'auto entrepreneur',
  'rupture conventionnelle', 'licenciement', 'contentieux',
  'huissier', 'saisie', 'tribunal', 'mise en demeure',
  'pacs', 'mariage', 'divorce', 'succession', 'héritage',
  'plus-value', 'imposition', 'défiscalisation',
  'cumul', 'en même temps', 'à la fois', 'les deux',
];

function selectModel(message: string): string {
  const lower = message.toLowerCase();
  const isLong = message.length > 150;
  const isComplex = COMPLEX_KEYWORDS.some((kw) => lower.includes(kw));
  return isLong || isComplex ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';
}

export async function askClaude(
  message: string,
  profile: UserProfile | null,
  apiKey: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const systemPrompt = buildSystemPrompt(profile);
  const model = selectModel(message);

  // Garder les 10 derniers messages pour le contexte
  const recentHistory = chatHistory.slice(-10);

  let response: Response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ],
      }),
    });
  } catch {
    // Erreur réseau (pas de connexion, timeout…)
    throw new ClaudeAPIError('Pas de connexion réseau', 'network');
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    if (response.status === 401) {
      throw new ClaudeAPIError('Clé API invalide', 'auth', 401);
    }
    if (response.status === 429) {
      throw new ClaudeAPIError('Limite de requêtes atteinte', 'rate_limit', 429);
    }
    if (response.status >= 500) {
      throw new ClaudeAPIError(`Serveur indisponible (${response.status})`, 'server', response.status);
    }
    throw new ClaudeAPIError(`Erreur API: ${response.status} — ${errBody}`, 'unknown', response.status);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
}

function buildSystemPrompt(profile: UserProfile | null): string {
  const STATUS_FR: Record<string, string> = {
    etudiant: 'étudiant·e',
    apprenti: 'alternant·e / apprenti·e',
    salarie: 'salarié·e',
    auto_entrepreneur: 'auto-entrepreneur·e',
    service_civique: 'en service civique',
    recherche_emploi: 'en recherche d\'emploi',
    autre: 'autre',
  };

  const HOUSING_FR: Record<string, string> = {
    seul: 'seul·e en appartement (locataire)',
    coloc: 'en colocation',
    crous: 'en résidence CROUS',
    parents: 'chez ses parents (pas de loyer)',
    foyer: 'en foyer / hébergement social',
  };

  const SCHOOL_FR: Record<string, string> = {
    public: 'université / IUT / BTS public (bourse CROUS accessible)',
    prive_reconnu: 'école privée reconnue (bourse CROUS à vérifier avec l\'école)',
    prive_non_reconnu: 'école privée non conventionnée CROUS (bourse CROUS NON accessible)',
  };

  let prompt = `Tu es "Le Parrain", le conseiller financier personnel de l'app KichtApp.
Ton rôle : être le grand frère / grande sœur que tout jeune de 18-25 ans devrait avoir — celui qui explique simplement tout ce qu'on n'apprend pas à l'école.

## TON STYLE — IMPÉRATIF
- Tutoiement systématique, ton chaleureux mais direct
- Réponses COURTES et STRUCTURÉES : 3-5 points max, pas de pavés
- Toujours terminer par UNE action concrète à faire maintenant
- Lien officiel quand pertinent (caf.fr, impots.gouv.fr, ameli.fr, messervices.etudiant.gouv.fr...)
- Emojis utiles (structurent la lecture), pas décoratifs
- JAMAIS moralisateur, JAMAIS condescendant
- Si la question est floue, pose UNE question de clarification avant de répondre

## CE QUE TU SAIS FAIRE
- Aides sociales françaises : APL, bourse CROUS, prime d'activité, CSS, Visale, FAJ, RSA, ARE
- Impôts : déclaration, numéro fiscal, avis d'imposition, réductions
- Budget : gestion, épargne, Livret A, PEA, ETF
- Logement : bail, état des lieux, assurance habitation, charges, résiliation
- Emploi : fiche de paie, contrat, droits, rupture conventionnelle, chômage
- Santé : Carte Vitale, médecin traitant, CSS, LMDE, mutuelle
- Démarches admin : CAF, CPAM, impôts, préfecture, banque

## RÈGLES DE PERSONNALISATION
- Si l'utilisateur est chez ses parents → l'APL n'est PAS applicable, orienter vers bourse CROUS + prime d'activité + CSS
- Si école privée non conventionnée → la bourse CROUS n'est PAS accessible, orienter vers bourses internes, régionales, fondations
- Si revenus < 1 000 € → mentionner systématiquement la CSS (mutuelle gratuite)
- Si situation tendue (dépenses > revenus) → pas de conseil épargne, focus urgences et aides`;

  if (profile) {
    const totalExpenses = Object.values(profile.expenses).reduce((a, b) => a + b, 0);
    const reste = profile.monthlySalary - totalExpenses;

    prompt += `\n\n## PROFIL DE L'UTILISATEUR
- Prénom : ${profile.firstName}
- Âge : ${profile.age} ans
- Situation : ${STATUS_FR[profile.status] ?? profile.status}
- Logement : ${profile.housingType ? (HOUSING_FR[profile.housingType] ?? profile.housingType) : 'non renseigné'}`;

    if (profile.status === 'etudiant' && profile.schoolType) {
      prompt += `\n- École : ${SCHOOL_FR[profile.schoolType] ?? profile.schoolType}`;
    }

    if (profile.ville) {
      prompt += `\n- Ville : ${profile.ville}${profile.region ? ` (${profile.region})` : ''}`;
    }

    prompt += `\n- Revenus mensuels : ${profile.monthlySalary} €`;

    if (profile.expenses.loyer > 0) {
      prompt += `\n- Loyer : ${profile.expenses.loyer} €/mois`;
    }

    prompt += `\n- Total dépenses fixes : ${totalExpenses} €/mois`;
    prompt += `\n- Reste disponible : ${reste} € (${reste < 0 ? '⚠️ déficit' : reste < 50 ? '🚨 situation critique' : reste < 200 ? '⚡ serré' : '✅ correct'})`;

    // Aides potentielles selon profil
    const aidesPotentielles: string[] = [];
    if (profile.housingType !== 'parents' && profile.expenses.loyer > 0) {
      aidesPotentielles.push('APL (si pas encore demandée)');
    }
    if (profile.status === 'etudiant' && profile.schoolType !== 'prive_non_reconnu') {
      aidesPotentielles.push('Bourse CROUS');
    }
    if (profile.monthlySalary > 0 && profile.monthlySalary < 1800) {
      aidesPotentielles.push('Prime d\'activité');
    }
    if (profile.monthlySalary < 1000) {
      aidesPotentielles.push('CSS (mutuelle gratuite)');
    }
    if (aidesPotentielles.length > 0) {
      prompt += `\n- Aides potentielles à mentionner en priorité : ${aidesPotentielles.join(', ')}`;
    }

    prompt += `\n\nAdapte TOUTES tes réponses à ce profil. Appelle-le/la ${profile.firstName} naturellement dans la conversation.`;
  }

  return prompt;
}
