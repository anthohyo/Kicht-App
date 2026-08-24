import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Loyer: '#EF4444',
  Courses: '#F59E0B',
  Transport: '#3B82F6',
  Sorties: '#A855F7',
  Abonnements: '#EC4899',
  'Électricité': '#10B981',
  'Santé': '#06B6D4',
  Autres: '#6B7280',
};

export default function CategoryChart({ transactions }: Props) {
  // transactions déjà filtrées par mois par le parent
  const depenses = transactions.filter((t) => t.type === 'Dépense');

  const byCategory: Record<string, number> = {};
  depenses.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });

  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Répartition des dépenses</Text>
        <Text style={styles.empty}>Aucune dépense ce mois-ci</Text>
      </View>
    );
  }

  const singleCategory = entries.length === 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Répartition des dépenses</Text>
      <View style={styles.barContainer}>
        {entries.map(([cat, amount]) => (
          <View
            key={cat}
            style={[
              styles.barSegment,
              {
                flex: amount / total,
                backgroundColor: CATEGORY_COLORS[cat] ?? '#6B7280',
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {entries.map(([cat, amount]) => (
          <View key={cat} style={styles.legendItem}>
            <View
              style={[styles.dot, { backgroundColor: CATEGORY_COLORS[cat] ?? '#6B7280' }]}
            />
            <Text style={styles.legendText}>
              {cat} · {amount.toFixed(0)} €{!singleCategory ? ` (${((amount / total) * 100).toFixed(0)}%)` : ''}
            </Text>
          </View>
        ))}
      </View>
      {singleCategory && (
        <Text style={styles.singleNote}>
          Seule dépense enregistrée — ajoute tes autres dépenses pour voir la répartition complète.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  barContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  singleNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
    lineHeight: 17,
  },
});
