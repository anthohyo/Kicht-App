import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AgendaEvent } from '../types';
import { planifierRappels } from './rappels';

/**
 * Programmation des rappels d'échéances sur le téléphone.
 *
 * Tout est LOCAL : les notifications sont programmées par le système du
 * téléphone, sans serveur ni service de push. Aucune donnée ne sort de
 * l'appareil — la promesse de l'écran Confidentialité reste vraie.
 *
 * Sur le web, les notifications programmées n'existent pas : chaque fonction
 * répond « indisponible » plutôt que d'échouer.
 */

const CLE_ACTIVATION = '@kichtapp_rappels_actifs';
const CLE_AGENDA = '@kichtapp_agenda_events';

export type EtatRappels = 'actifs' | 'inactifs' | 'refuses' | 'indisponible';

export const rappelsDisponibles = Platform.OS !== 'web';

if (rappelsDisponibles) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function etatRappels(): Promise<EtatRappels> {
  if (!rappelsDisponibles) return 'indisponible';
  try {
    const actif = (await AsyncStorage.getItem(CLE_ACTIVATION)) === 'true';
    if (!actif) return 'inactifs';
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted' ? 'actifs' : 'refuses';
  } catch {
    return 'inactifs';
  }
}

/** Demande l'autorisation, puis programme les rappels. */
export async function activerRappels(): Promise<EtatRappels> {
  if (!rappelsDisponibles) return 'indisponible';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rappels', {
      name: 'Rappels d\'échéances',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const existant = await Notifications.getPermissionsAsync();
  const statut = existant.status === 'granted'
    ? existant.status
    : (await Notifications.requestPermissionsAsync()).status;
  if (statut !== 'granted') {
    await AsyncStorage.setItem(CLE_ACTIVATION, 'false');
    return 'refuses';
  }
  await AsyncStorage.setItem(CLE_ACTIVATION, 'true');
  await resynchroniserRappels();
  return 'actifs';
}

export async function desactiverRappels(): Promise<EtatRappels> {
  if (!rappelsDisponibles) return 'indisponible';
  await AsyncStorage.setItem(CLE_ACTIVATION, 'false');
  await Notifications.cancelAllScheduledNotificationsAsync();
  return 'inactifs';
}

/**
 * Reprogramme tous les rappels depuis l'agenda.
 *
 * À appeler à chaque modification de l'agenda et au lancement de l'app : les
 * rappels couvrent une fenêtre glissante de quelques semaines, qu'il faut
 * prolonger au fil du temps.
 */
export async function resynchroniserRappels(): Promise<number> {
  if ((await etatRappels()) !== 'actifs') return 0;
  let evenements: AgendaEvent[] = [];
  try {
    const brut = await AsyncStorage.getItem(CLE_AGENDA);
    evenements = brut ? JSON.parse(brut) : [];
  } catch {
    evenements = [];
  }
  const rappels = planifierRappels(evenements, new Date());
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const r of rappels) {
    await Notifications.scheduleNotificationAsync({
      identifier: r.id,
      content: { title: r.titre, body: r.corps },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: r.quand,
        ...(Platform.OS === 'android' ? { channelId: 'rappels' } : {}),
      },
    });
  }
  return rappels.length;
}
