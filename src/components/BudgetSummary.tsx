import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  transactions: Transaction[]; // déjà filtrées par mois par le parent
  selectedDate: Date;
}

export default function BudgetSummary({ transactions, selectedDate }: Props) {
  const revenus = transactions
    .filter((t) => t.type === 'Revenu')
    .reduce((sum, t) => sum + t.amount, 0);

  const depenses = transactions
    .filter((t) => t.type === 'Dépense')
    .reduce((sum, t) => sum + t.amount, 0);

  const solde = revenus - depenses;

  const monthLabel = selectedDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>{monthLabel}</Text>
      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.label}>Revenus</Text>
          <Text style={[styles.amount, { color: colors.success }]}>
            +{revenus.toFixed(0)} €
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.label}>Dépenses</Text>
          <Text style={[styles.amount, { color: colors.dangerText }]}>
            -{depenses.toFixed(0)} €
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.label}>Solde</Text>
          <Text style={[styles.amount, { color: solde >= 0 ? colors.success : colors.danger }]}>
            {solde >= 0 ? '+' : ''}{solde.toFixed(0)} €
          </Text>
        </View>
      </View>
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
  monthLabel: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
