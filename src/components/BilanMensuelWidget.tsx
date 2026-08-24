import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadTransactions } from '../utils/storage';
import { Transaction } from '../types';
import { colors, radius, spacing } from '../theme';

function getMonthName(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function generateTips(
  totalRevenu: number,
  totalDepenses: number,
  byCategory: Record<string, number>,
  txCount: number
): string[] {
  if (txCount === 0) {
    return ["Commence à tracker tes dépenses dans l'onglet Budget pour voir ton bilan ici."];
  }
  const tips: string[] = [];
  const reste = totalRevenu - totalDepenses;

  if (totalRevenu > 0 && totalDepenses > totalRevenu) {
    tips.push(`⚠️ Ce mois-ci tu dépenses ${totalDepenses - totalRevenu}€ de plus que tu ne gagnes. Identifie ce que tu peux réduire.`);
  } else if (reste > 0 && totalRevenu > 0) {
    const epargne = Math.round(reste * 0.5);
    tips.push(`💰 Tu as ${reste}€ de reste. Mets au moins ${epargne}€ de côté avant de les dépenser.`);
  }

  const sorties = byCategory['Sorties'] ?? 0;
  if (totalRevenu > 0 && sorties / totalRevenu > 0.2) {
    tips.push(`🎉 Tes sorties (${sorties}€) = ${Math.round((sorties / totalRevenu) * 100)}% de tes revenus. Fixe-toi une enveloppe max.`);
  }

  const courses = byCategory['Courses'] ?? 0;
  if (courses > 250) {
    tips.push(`🛒 ${courses}€ en courses ce mois-ci. Les marques distributeur et les épiceries discount permettent d'économiser 20-30%.`);
  }

  if (tips.length === 0) {
    tips.push('✅ Bonne gestion ce mois-ci ! Continue à tracker tes dépenses pour progresser.');
  }

  return tips.slice(0, 3);
}

export default function BilanMensuelWidget() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expanded, setExpanded] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions().then(setTransactions);
    }, [])
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthTxs = transactions.filter((t) => t.date >= monthStart);

  const totalRevenu = monthTxs.filter((t) => t.type === 'Revenu').reduce((s, t) => s + t.amount, 0);
  const totalDepenses = monthTxs.filter((t) => t.type === 'Dépense').reduce((s, t) => s + t.amount, 0);
  const reste = totalRevenu - totalDepenses;

  const byCategory = monthTxs
    .filter((t) => t.type === 'Dépense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const topCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const tips = generateTips(totalRevenu, totalDepenses, byCategory, monthTxs.length);
  const monthName = getMonthName(now);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7} accessibilityRole="button">
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>📊 Bilan de {monthName}</Text>
          <Text style={styles.subtitle}>
            {monthTxs.length === 0
              ? 'Aucune transaction enregistrée'
              : `${monthTxs.length} opération${monthTxs.length > 1 ? 's' : ''} · ${totalDepenses}€ dépensés`}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: colors.success }]}>+{totalRevenu}€</Text>
              <Text style={styles.statLbl}>Revenus</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: colors.danger }]}>-{totalDepenses}€</Text>
              <Text style={styles.statLbl}>Dépenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: reste >= 0 ? colors.success : colors.danger }]}>
                {reste >= 0 ? '+' : ''}{reste}€
              </Text>
              <Text style={styles.statLbl}>Solde</Text>
            </View>
          </View>

          {/* Top catégories */}
          {topCats.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Top dépenses</Text>
              {topCats.map(([cat, amount]) => (
                <View key={cat} style={styles.catRow}>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catAmount}>{amount}€</Text>
                </View>
              ))}
            </View>
          )}

          {/* Conseils */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>💡 Conseils du Parrain</Text>
            {tips.map((tip, i) => (
              <Text key={i} style={styles.tip}>{tip}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 11, color: colors.textMuted, marginLeft: spacing.sm },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: 'bold' },
  statLbl: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  section: { gap: 6 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  catName: { fontSize: 13, color: colors.textSecondary },
  catAmount: { fontSize: 13, fontWeight: '600', color: colors.text },
  tip: { fontSize: 13, color: colors.text, lineHeight: 19, paddingVertical: 2 },
});
