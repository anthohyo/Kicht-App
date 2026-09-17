import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList, UserProfile, UserProgress } from '../types';
import { loadProfile, loadProgress } from '../utils/storage';
import { colors, radius, spacing } from '../theme';

interface WeeklyTask {
  id: string;
  emoji: string;
  text: string;
  screen?: keyof RootStackParamList; // écran stack (Guides, Aides…)
  tab?: keyof TabParamList;          // onglet tab (Chat, Budget…)
  urgent?: boolean;
}

function computeTasks(profile: UserProfile | null, progress: UserProgress): WeeklyTask[] {
  const month = new Date().getMonth(); // 0=jan, 3=avr, etc.
  const pool: WeeklyTask[] = [];

  // Mois 2 (mars) ou 3 (avril) : déclaration impôts ouvre bientôt
  if (month === 2 || month === 3) {
    pool.push({
      id: 'impots-bientot',
      emoji: '📅',
      text: "La déclaration d'impôts ouvre bientôt — prépare-toi",
      screen: 'Guides',
      urgent: true,
    });
  }

  // Mois 3 (avril) ou 4 (mai) : déclaration impôts ouverte
  if (month === 3 || month === 4) {
    pool.push({
      id: 'impots-ouvert',
      emoji: '🏛️',
      text: "La déclaration d'impôts est ouverte !",
      screen: 'Guides',
      urgent: true,
    });
  }

  // Si étudiant et pas le badge 'lecteur'
  // Bourse CROUS — masquée si école privée non conventionnée (pas éligible)
  if (
    profile?.status === 'etudiant' &&
    profile.schoolType !== 'prive_non_reconnu' &&
    !progress.earnedBadges.includes('lecteur')
  ) {
    pool.push({
      id: 'bourse-crous',
      emoji: '🎓',
      text: 'Vérifie si tu as droit à la bourse CROUS',
      screen: 'Aides',
    });
  }

  // APL — masquée si chez les parents (non éligible) ou loyer déjà renseigné
  if (profile && profile.expenses.loyer === 0 && profile.housingType !== 'parents' && profile.housingType !== 'futur') {
    pool.push({
      id: 'apl',
      emoji: '🏠',
      text: "As-tu demandé l'APL ? Ça peut te faire économiser 100-300€/mois",
      screen: 'Aides',
      urgent: true,
    });
  }

  // Emménagement à venir → la garantie Visale d'abord, elle conditionne le reste
  if (profile?.housingType === 'futur') {
    pool.push({
      id: 'visale-avant-visites',
      emoji: '📦',
      text: 'Demande ta garantie Visale avant de visiter — c\'est gratuit et ça fait accepter ton dossier',
      screen: 'Aides',
      urgent: true,
    });
  }

  // Chez les parents → suggestion déménagement / simulation loyer
  if (profile?.housingType === 'parents') {
    pool.push({
      id: 'depart-parents',
      emoji: '🏠',
      text: 'Tu penses déménager ? Simule tes aides logement avant de te lancer',
      screen: 'Aides',
    });
  }

  // Parrain — navigue vers l'onglet Chat directement
  if (progress.chatQuestionsAsked === 0) {
    pool.push({
      id: 'premiere-question',
      emoji: '🎩',
      text: 'Pose ta première question au Parrain — c\'est gratuit !',
      tab: 'Chat',
    });
  }

  // Si aucun guide complété
  if (progress.guidesCompleted.length === 0) {
    pool.push({
      id: 'premier-guide',
      emoji: '📖',
      text: 'Lis ta première fiche pratique — 5 minutes suffisent',
      screen: 'Guides',
    });
  }

  // Toujours présent
  pool.push({
    id: 'depenses-semaine',
    emoji: '💰',
    text: 'Enregistre tes dépenses de la semaine',
  });

  // Sélectionner max 3 : priorité aux urgent
  const urgent = pool.filter((t) => t.urgent);
  const nonUrgent = pool.filter((t) => !t.urgent);
  const selected: WeeklyTask[] = [];

  for (const t of urgent) {
    if (selected.length >= 3) break;
    selected.push(t);
  }
  for (const t of nonUrgent) {
    if (selected.length >= 3) break;
    selected.push(t);
  }

  return selected;
}

export default function WeeklyTasksWidget() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadProfile(), loadProgress()]).then(([profile, progress]) => {
        setTasks(computeTasks(profile, progress));
      });
    }, [])
  );

  if (tasks.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓️ Cette semaine</Text>
      {tasks.map((task) => (
        <TouchableOpacity role="button"
          key={task.id}
          style={[styles.taskRow, task.urgent ? styles.taskRowUrgent : styles.taskRowNormal]}
          onPress={() => {
            if (task.screen) navigation.navigate(task.screen as any);
            else if (task.tab) navigation.navigate(task.tab as any);
          }}
          activeOpacity={task.screen || task.tab ? 0.7 : 1}
          disabled={!task.screen && !task.tab}
        >
          <Text style={styles.taskEmoji}>{task.emoji}</Text>
          <Text style={styles.taskText}>{task.text}</Text>
          {(task.screen || task.tab) && <Text style={styles.arrow}>›</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  taskRowUrgent: {
    borderColor: colors.primary,
    borderLeftColor: colors.primary,
  },
  taskRowNormal: {
    borderColor: colors.border,
    borderLeftColor: colors.border,
  },
  taskEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  arrow: {
    fontSize: 22,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});
