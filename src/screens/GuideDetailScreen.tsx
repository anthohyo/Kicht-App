import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { allGuides } from '../data/guides';
import { trackAction } from '../utils/gamification';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GuideDetail'>;

export default function GuideDetailScreen({ route }: Props) {
  const guide = allGuides.find((g) => g.id === route.params.guideId);
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!guide) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted }}>Guide introuvable</Text>
      </View>
    );
  }

  const total = guide.steps.length;
  const isLast = currentStep === total - 1;

  const handleNext = async () => {
    if (isLast) {
      await trackAction('guide', { guideId: guide.id });
      setFinished(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji} aria-hidden>{guide.emoji}</Text>
        <Text style={styles.title}>{guide.title}</Text>
        <Text style={styles.summary}>{guide.summary}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentStep + 1) / total) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.stepLabel}>
        Étape {currentStep + 1} / {total}
      </Text>

      {/* Previous steps as condensed trail */}
      {currentStep > 0 && (
        <View style={styles.trailContainer}>
          {guide.steps.slice(0, currentStep).map((step, idx) => (
            <View key={idx} style={styles.trailItem}>
              <Text style={styles.trailCheck}>✓</Text>
              <Text style={styles.trailTitle}>{step.title}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Current step card */}
      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>{guide.steps[currentStep].title}</Text>
        <Text style={styles.stepText}>{guide.steps[currentStep].content}</Text>

        {finished ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji} aria-hidden>🎉</Text>
            <Text style={styles.doneText}>Bravo, tu as terminé ce guide !</Text>
          </View>
        ) : (
          <TouchableOpacity role="button" style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>
              {isLast ? '✅ Terminer' : 'Étape suivante →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  stepLabel: {
    fontSize: 13,
    color: colors.primaryLight,
    marginBottom: spacing.md,
  },
  trailContainer: {
    marginBottom: spacing.sm,
  },
  trailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    marginBottom: 2,
  },
  trailCheck: {
    fontSize: 13,
    color: colors.success,
    marginRight: 8,
  },
  trailTitle: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  doneCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  doneEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
});
