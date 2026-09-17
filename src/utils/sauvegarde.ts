/**
 * Sauvegarde et restauration des données, sans serveur.
 *
 * Toutes les données vivent sur l'appareil : changer de téléphone les faisait
 * disparaître. La sauvegarde est un fichier que l'utilisateur garde LUI-MÊME —
 * rien ne transite par un service tiers, la promesse de confidentialité tient.
 *
 * Fonctions pures : la lecture/écriture du stockage reste dans l'écran, pour que
 * la validation — la partie risquée — soit testable.
 */

export const PREFIXE = '@kichtapp_';
export const VERSION_SAUVEGARDE = 1;

/**
 * Clés non sauvegardées :
 * - états passagers de navigation, sans intérêt une fois restaurés ;
 * - réglages propres à l'appareil : l'autorisation de notifier se donne téléphone
 *   par téléphone, la restaurer afficherait à tort « notifications refusées ».
 */
const CLES_TRANSITOIRES = new Set([
  '@kichtapp_pending_chat',
  '@kichtapp_open_budget_form',
  '@kichtapp_rappels_actifs',
]);

export interface FichierSauvegarde {
  app: 'kichtapp';
  version: number;
  exporteLe: string;
  donnees: Record<string, string>;
}

/**
 * Construit le contenu du fichier à partir des paires clé/valeur du stockage.
 *
 * La clé API Anthropic est retirée du profil : un fichier de sauvegarde finit
 * souvent dans un mail, une messagerie ou un cloud — ce n'est pas un endroit
 * pour un secret facturé au nom de l'utilisateur.
 */
export function construireSauvegarde(
  paires: ReadonlyArray<readonly [string, string | null]>,
  maintenant: Date,
): FichierSauvegarde {
  const donnees: Record<string, string> = {};
  for (const [cle, valeur] of paires) {
    if (!cle.startsWith(PREFIXE) || CLES_TRANSITOIRES.has(cle) || valeur == null) continue;
    if (cle === '@kichtapp_profile') {
      try {
        const profil = JSON.parse(valeur);
        delete profil.claudeApiKey;
        donnees[cle] = JSON.stringify(profil);
      } catch {
        continue; // profil illisible : on ne l'exporte pas plutôt que d'exporter du bruit
      }
    } else {
      donnees[cle] = valeur;
    }
  }
  return { app: 'kichtapp', version: VERSION_SAUVEGARDE, exporteLe: maintenant.toISOString(), donnees };
}

export type ResultatLecture =
  | { ok: true; fichier: FichierSauvegarde; profil: { firstName?: string } }
  | { ok: false; erreur: string };

/**
 * Valide un texte de sauvegarde avant toute écriture.
 *
 * Une restauration écrase les données actuelles : on refuse tout ce qui n'est
 * pas manifestement une sauvegarde KichtApp complète, avec un message qui dit
 * quoi faire.
 */
export function lireSauvegarde(texte: string): ResultatLecture {
  let brut: unknown;
  try {
    brut = JSON.parse(texte.trim());
  } catch {
    return { ok: false, erreur: 'Ce texte n\'est pas une sauvegarde KichtApp. Vérifie que tu as copié le fichier en entier.' };
  }
  const f = brut as Partial<FichierSauvegarde>;
  if (!f || typeof f !== 'object' || f.app !== 'kichtapp' || typeof f.donnees !== 'object' || f.donnees === null) {
    return { ok: false, erreur: 'Ce fichier ne vient pas de KichtApp.' };
  }
  if (typeof f.version !== 'number' || f.version > VERSION_SAUVEGARDE) {
    return { ok: false, erreur: 'Cette sauvegarde vient d\'une version plus récente de l\'app. Mets l\'app à jour, puis réessaie.' };
  }
  const entrees = Object.entries(f.donnees);
  if (entrees.some(([cle, valeur]) => !cle.startsWith(PREFIXE) || typeof valeur !== 'string')) {
    return { ok: false, erreur: 'Cette sauvegarde est abîmée : elle contient des données inattendues.' };
  }
  const brutProfil = (f.donnees as Record<string, string>)['@kichtapp_profile'];
  if (!brutProfil) {
    return { ok: false, erreur: 'Cette sauvegarde ne contient pas de profil : il n\'y a rien à restaurer.' };
  }
  let profil: { firstName?: string; onboardingComplete?: boolean };
  try {
    profil = JSON.parse(brutProfil);
  } catch {
    return { ok: false, erreur: 'Le profil contenu dans cette sauvegarde est illisible.' };
  }
  if (!profil.onboardingComplete) {
    return { ok: false, erreur: 'Cette sauvegarde ne contient pas de profil complet.' };
  }
  return { ok: true, fichier: f as FichierSauvegarde, profil };
}

/** Nom de fichier lisible et triable : kichtapp-sauvegarde-2026-09-17.json */
export function nomFichier(maintenant: Date): string {
  const d = maintenant;
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `kichtapp-sauvegarde-${iso}.json`;
}
