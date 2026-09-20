import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { UserProgress } from '../types';
import { loadProgress } from '../utils/storage';
import { allBadges } from '../data/badges';
import { colors, radius, spacing } from '../theme';

export default function BadgesScreen() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  if (!progress) return null;

  const earned = allBadges.filter((b) => progress.earnedBadges.includes(b.id));
  const locked = allBadges.filter((b) => !progress.earnedBadges.includes(b.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Points & Streak */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji} aria-hidden>⭐</Text>
          <Text style={styles.statValue}>{progress.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji} aria-hidden>🔥</Text>
          <Text style={styles.statValue}>{progress.streak}</Text>
          <Text style={styles.statLabel}>Jours de suite</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji} aria-hidden>🏆</Text>
          <Text style={styles.statValue}>{earned.length}/{allBadges.length}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      {/* Progress stats */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Tes stats</Text>
        <StatRow emoji="📊" label="Transactions enregistrées" value={progress.budgetDaysTracked} />
        <StatRow emoji="🧠" label="Meilleur score au quiz" value={`${progress.quizBestScore}/10`} />
        <StatRow emoji="📖" label="Guides complétés" value={progress.guidesCompleted.length} />
        <StatRow emoji="💬" label="Questions posées au Parrain" value={progress.chatQuestionsAsked} />
        <StatRow emoji="📝" label="Courriers utilisés" value={progress.courriersUsed} />
      </View>

      {/* Earned badges */}
      {earned.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Badges débloqués 🎉</Text>
          <View style={styles.badgeGrid}>
            {earned.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <Text style={styles.badgeEmoji} aria-hidden>{badge.emoji}</Text>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Locked badges */}
      <Text style={styles.sectionTitle}>À débloquer 🔒</Text>
      <View style={styles.badgeGrid}>
        {locked.map((badge) => (
          <View key={badge.id} style={[styles.badgeCard, styles.badgeLocked]}>
            <Text style={[styles.badgeEmoji, { opacity: 0.3 }]}>🔒</Text>
            <Text style={[styles.badgeTitle, { color: colors.textMuted }]}>{badge.title}</Text>
            <Text style={styles.badgeCondition}>{badge.condition}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function StatRow({ emoji, label, value }: { emoji: string; label: string; value: number | string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statRowEmoji} aria-hidden>{emoji}</Text>
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={styles.statRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  progressCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  statRowEmoji: { fontSize: 18, marginRight: 10 },
  statRowLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  statRowValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  badgeCard: {
    width: '48%', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  badgeLocked: { borderColor: colors.border, opacity: 0.7 },
  badgeEmoji: { fontSize: 36, marginBottom: 6 },
  badgeTitle: { fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center' },
  badgeDesc: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  badgeCondition: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
});
