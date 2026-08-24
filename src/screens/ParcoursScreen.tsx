import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, UserProfile } from '../types';
import { loadProfile } from '../utils/storage';
import { parcoursList } from '../data/parcours';
import { colors, radius, spacing } from '../theme';

const PARCOURS_STORAGE_KEY = '@kichtapp_parcours_progress';

// Sérialise Record<string, Set<number>> → JSON
function serialize(data: Record<string, Set<number>>): string {
  const plain: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(data)) plain[k] = Array.from(v);
  return JSON.stringify(plain);
}

function deserialize(raw: string): Record<string, Set<number>> {
  const plain: Record<string, number[]> = JSON.parse(raw);
  const result: Record<string, Set<number>> = {};
  for (const [k, v] of Object.entries(plain)) result[k] = new Set(v);
  return result;
}

export default function ParcoursScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedParcours, setSelectedParcours] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

  useFocusEffect(
    useCallback(() => {
      loadProfile().then(setProfile);
      AsyncStorage.getItem(PARCOURS_STORAGE_KEY).then((raw) => {
        if (raw) setCompletedSteps(deserialize(raw));
      });
    }, [])
  );

  // Persiste à chaque changement
  useEffect(() => {
    AsyncStorage.setItem(PARCOURS_STORAGE_KEY, serialize(completedSteps));
  }, [completedSteps]);

  // Sort parcours: recommended first based on user status
  const sorted = [...parcoursList].sort((a, b) => {
    const aMatch = profile ? a.forStatus.includes(profile.status) : false;
    const bMatch = profile ? b.forStatus.includes(profile.status) : false;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const toggleStep = (parcoursId: string, stepIndex: number) => {
    setCompletedSteps((prev) => {
      const current = prev[parcoursId] || new Set();
      const next = new Set(current);
      if (next.has(stepIndex)) next.delete(stepIndex);
      else next.add(stepIndex);
      return { ...prev, [parcoursId]: next };
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Parcours thématiques</Text>
      <Text style={styles.subtitle}>
        Des parcours adaptés à ta situation pour ne rien oublier.
      </Text>

      {sorted.map((parcours) => {
        const isRecommended = profile ? parcours.forStatus.includes(profile.status) : false;
        const isOpen = selectedParcours === parcours.id;
        const done = completedSteps[parcours.id] || new Set();
        const progress = done.size / parcours.steps.length;

        return (
          <View key={parcours.id} style={styles.parcoursContainer}>
            <TouchableOpacity
              style={[styles.parcoursCard, isRecommended && styles.parcoursRecommended]}
              onPress={() => setSelectedParcours(isOpen ? null : parcours.id)}
              activeOpacity={0.7}
            >
              <View style={styles.parcoursHeader}>
                <Text style={styles.parcoursEmoji}>{parcours.emoji}</Text>
                <View style={styles.parcoursHeaderText}>
                  <View style={styles.titleRow}>
                    <Text style={styles.parcoursTitle}>{parcours.title}</Text>
                    {isRecommended && (
                      <View style={styles.recommendBadge}>
                        <Text style={styles.recommendText}>Pour toi</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.parcoursDesc}>{parcours.description}</Text>
                </View>
                <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
              </View>

              {/* Progress bar */}
              {done.size > 0 && (
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{done.size}/{parcours.steps.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Expanded steps */}
            {isOpen && (
              <View style={styles.stepsContainer}>
                {parcours.steps.map((step, index) => {
                  const isDone = done.has(index);
                  return (
                    <View key={index} style={styles.stepRow}>
                      <TouchableOpacity
                        style={[styles.stepCheckbox, isDone && styles.stepCheckboxDone]}
                        onPress={() => toggleStep(parcours.id, index)}
                      >
                        {isDone && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                      <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>
                          {step.title}
                        </Text>
                        <Text style={styles.stepDesc}>{step.description}</Text>
                        {step.action && (
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate(step.action!.screen as any)}
                          >
                            <Text style={styles.actionText}>{step.action.label} →</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  parcoursContainer: {
    marginBottom: spacing.sm,
  },
  parcoursCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  parcoursRecommended: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  parcoursHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  parcoursEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  parcoursHeaderText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  parcoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  recommendBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  recommendText: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  parcoursDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chevron: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 8,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  stepsContainer: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.md,
    marginTop: 2,
    padding: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepCheckboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stepTitleDone: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
});
