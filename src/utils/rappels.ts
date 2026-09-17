import { AgendaEvent } from '../types';

/**
 * Calcul des rappels d'échéances — fonctions pures, sans dépendance native.
 *
 * Séparé de la programmation des notifications pour pouvoir être testé sans
 * téléphone : c'est ici que se décide QUAND on prévient et QUOI on dit. Une
 * erreur de date dans un rappel est pire que pas de rappel.
 */

export interface Rappel {
  /** Identifiant stable : l'événement + la date visée. */
  id: string;
  /** Moment où la notification doit s'afficher. */
  quand: Date;
  titre: string;
  corps: string;
}

/** iOS n'accepte que 64 notifications programmées ; on garde de la marge. */
export const MAX_RAPPELS = 50;
/** Au-delà, un rappel est trop lointain pour être utile et trop sujet à changement. */
export const HORIZON_JOURS = 45;

function joursDansLeMois(annee: number, mois: number): number {
  return new Date(annee, mois + 1, 0).getDate();
}

/**
 * Prochaine date correspondant à un jour du mois, à partir d'aujourd'hui inclus.
 *
 * Un événement « le 31 » tombe le dernier jour des mois plus courts, au lieu de
 * déborder sur le mois suivant comme le ferait `new Date(annee, mois, 31)`.
 */
export function prochaineOccurrence(jourDuMois: number, depuis: Date): Date {
  const base = new Date(depuis.getFullYear(), depuis.getMonth(), depuis.getDate());
  for (let decalage = 0; decalage < 2; decalage++) {
    const annee = base.getFullYear();
    const mois = base.getMonth() + decalage;
    const a = new Date(annee, mois, 1).getFullYear();
    const m = new Date(annee, mois, 1).getMonth();
    const jour = Math.min(jourDuMois, joursDansLeMois(a, m));
    const candidat = new Date(a, m, jour);
    if (candidat >= base) return candidat;
  }
  // Inatteignable : le mois suivant est toujours après aujourd'hui.
  return base;
}

function a(date: Date, heure: number, decalageJours = 0): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + decalageJours);
  d.setHours(heure, 0, 0, 0);
  return d;
}

function iso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function montant(e: AgendaEvent): string {
  return e.amount ? ` (${e.amount} €)` : '';
}

/**
 * Liste des rappels à programmer pour les événements de l'agenda.
 *
 * - Prélèvement récurrent : la veille à 18 h, pour laisser le temps d'alimenter le compte.
 * - Enveloppe budgétaire (courses, transport) : aucun rappel, ce n'est pas une échéance.
 * - Échéance datée : 2 jours avant à 9 h, puis le jour même à 9 h.
 * - Autre événement récurrent : la veille à 18 h.
 *
 * Seuls les rappels strictement futurs et dans l'horizon sont retournés.
 */
export function planifierRappels(evenements: AgendaEvent[], maintenant: Date): Rappel[] {
  const limite = new Date(maintenant.getTime() + HORIZON_JOURS * 24 * 3600 * 1000);
  const rappels: Rappel[] = [];
  const ajouter = (r: Rappel) => {
    if (r.quand > maintenant && r.quand <= limite) rappels.push(r);
  };

  for (const e of evenements) {
    if (e.isPayment && e.paymentType === 'budget') continue;

    if (e.isRecurring && e.dayOfMonth != null) {
      // Deux occurrences : la prochaine peut être trop proche pour la veille.
      let depuis = maintenant;
      for (let i = 0; i < 2; i++) {
        const date = prochaineOccurrence(e.dayOfMonth, depuis);
        const veille = a(date, 18, -1);
        ajouter({
          id: `${e.id}@${iso(date)}`,
          quand: veille,
          titre: e.isPayment ? `Demain : prélèvement ${e.title}` : `Demain : ${e.title}`,
          corps: e.isPayment
            ? `${e.title}${montant(e)} est prélevé demain. Vérifie que ton compte est approvisionné.`
            : `${e.emoji} ${e.title}${montant(e)}, c'est demain.`,
        });
        depuis = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      }
    } else if (e.isoDate && !e.isRecurring) {
      const [y, m, d] = e.isoDate.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      ajouter({
        id: `${e.id}@${e.isoDate}@J-2`,
        quand: a(date, 9, -2),
        titre: `Dans 2 jours : ${e.title}`,
        corps: `${e.emoji} ${e.title}${montant(e)} — plus que 2 jours.`,
      });
      ajouter({
        id: `${e.id}@${e.isoDate}@J`,
        quand: a(date, 9, 0),
        titre: `Aujourd'hui : ${e.title}`,
        corps: `${e.emoji} ${e.title}${montant(e)}, c'est aujourd'hui.`,
      });
    }
  }

  rappels.sort((x, y) => x.quand.getTime() - y.quand.getTime());
  return rappels.slice(0, MAX_RAPPELS);
}
