import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radius, spacing } from '../theme';
import { loadProfile, loadTransactions } from '../utils/storage';
import { UserProfile, Transaction } from '../types';

// ─── Calculs financiers ────────────────────────────────────────────────────
// Valeur future : FV = PMT * ((1+r)^n - 1) / r
function computeFV(monthly: number, years: number, annualRate: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

// Mois nécessaires pour atteindre un objectif : n = log(1 + FV*r/PMT) / log(1+r)
function monthsToGoal(target: number, monthly: number, annualRate: number): number | null {
  if (monthly <= 0) return null;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.ceil(target / monthly);
  const ratio = (target * r) / monthly + 1;
  if (ratio <= 0) return null;
  return Math.ceil(Math.log(ratio) / Math.log(1 + r));
}

// Valeur réelle après inflation
function computeRealValue(nominalFV: number, years: number, inflationRate: number): number {
  return nominalFV / Math.pow(1 + inflationRate / 100, years);
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

function fmtDuration(months: number): string {
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} an${y > 1 ? 's' : ''} et ${m} mois` : `${y} an${y > 1 ? 's' : ''}`;
}

const PRESETS = [
  { label: 'Livret A',       emoji: '🏦', rate: 3 },
  { label: 'Assurance-vie',  emoji: '📋', rate: 4.5 },
  { label: 'ETF World',      emoji: '📈', rate: 7 },
];

const DURATIONS       = [5, 10, 20, 30];
const INFLATION_CHIPS = [1, 2, 3];

// ─── Écran ────────────────────────────────────────────────────────────────
export default function SimulateurEpargneScreen() {
  const [monthly,         setMonthly]         = useState('100');
  const [years,           setYears]           = useState(10);
  const [rate,            setRate]            = useState(7);
  const [customRate,      setCustomRate]      = useState('');
  const [selectedPreset,  setSelectedPreset]  = useState<number>(2); // ETF World
  const [showInflation,   setShowInflation]   = useState(false);
  const [inflationRate,   setInflationRate]   = useState(2);
  const [profile,         setProfile]         = useState<UserProfile | null>(null);
  const [goalSuggested,   setGoalSuggested]   = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([loadProfile(), loadTransactions()]).then(([p, txs]) => {
        setProfile(p);

        // Pré-remplir une seule fois si un objectif est défini
        if (p?.savingsGoal?.amount && p.savingsGoal.amount > 0 && !goalSuggested) {
          // Suggérer un montant basé sur le reste disponible du profil
          const income   = txs.filter((t: Transaction) => t.type === 'Revenu').reduce((s, t) => s + t.amount, 0);
          const expenses = txs.filter((t: Transaction) => t.type === 'Dépense').reduce((s, t) => s + t.amount, 0);
          const reste    = income > 0 ? income - expenses : p.monthlySalary - Object.values(p.expenses).reduce((a, b) => a + b, 0);

          // Suggérer 20-30% du reste, arrondi à la dizaine, min 10€, max 500€
          if (reste > 30) {
            const suggested = Math.min(500, Math.max(10, Math.round(reste * 0.25 / 10) * 10));
            setMonthly(String(suggested));
          }
          setGoalSuggested(true);
        }
      });
    }, [goalSuggested])
  );

  const effectiveRate = customRate ? parseFloat(customRate) || 0 : rate;
  const monthlyNum    = parseFloat(monthly) || 0;

  const totalInvested = monthlyNum * years * 12;
  const finalAmount   = useMemo(() => computeFV(monthlyNum, years, effectiveRate),       [monthlyNum, years, effectiveRate]);
  const gains         = finalAmount - totalInvested;
  const gainRatio     = finalAmount > 0 ? totalInvested / finalAmount : 1;
  const realValue     = useMemo(() => computeRealValue(finalAmount, years, inflationRate), [finalAmount, years, inflationRate]);

  // Calcul objectif
  const goal            = profile?.savingsGoal;
  const monthsNeeded    = goal && goal.amount > 0 ? monthsToGoal(goal.amount, monthlyNum, effectiveRate) : null;
  const goalAlreadyHit  = monthsNeeded !== null && monthsNeeded <= 0;

  const handlePreset = (idx: number) => {
    setSelectedPreset(idx);
    setRate(PRESETS[idx].rate);
    setCustomRate('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Simulateur d'épargne</Text>
      <Text style={styles.subtitle}>Combien tu auras si tu épargnes régulièrement ?</Text>

      {/* ── Carte objectif profil ── */}
      {goal && goal.amount > 0 && (
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji} aria-hidden>{goal.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalTitle}>{goal.label}</Text>
              <Text style={styles.goalTarget}>Objectif : {fmt(goal.amount)}</Text>
            </View>
            {monthsNeeded !== null && !goalAlreadyHit && (
              <View style={styles.goalBadge}>
                <Text style={styles.goalBadgeValue}>{fmtDuration(monthsNeeded)}</Text>
                <Text style={styles.goalBadgeLabel}>pour y arriver</Text>
              </View>
            )}
          </View>

          {/* Barre de progression vers l'objectif */}
          {monthsNeeded !== null && !goalAlreadyHit && (
            <View style={styles.goalProgressWrap}>
              <View style={styles.goalProgressBg}>
                <View style={[styles.goalProgressFill, {
                  width: `${Math.min(100, (monthlyNum / (goal.amount / Math.max(monthsNeeded, 1))) * 100)}%`
                }]} />
              </View>
              <Text style={styles.goalProgressText}>
                {monthlyNum > 0
                  ? `À {${monthly} €/mois} — atteint en ${fmtDuration(monthsNeeded)}`
                  : 'Définis un montant mensuel ci-dessous'}
              </Text>
            </View>
          )}

          {goalAlreadyHit && (
            <Text style={styles.goalDone}>✅ Objectif déjà atteint avec ce plan !</Text>
          )}
        </View>
      )}

      {/* ── Montant mensuel ── */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Je mets de côté chaque mois</Text>
        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={monthly}
            onChangeText={setMonthly}
            keyboardType="numeric"
            selectTextOnFocus
          />
          <Text style={styles.amountUnit}>€ / mois</Text>
        </View>
        <View style={styles.quickRow}>
          {[50, 100, 200, 500].map((v) => (
            <TouchableOpacity role="radio" aria-checked={monthly === String(v)}
              key={v}
              style={[styles.quickBtn, monthly === String(v) && styles.quickBtnActive]}
              onPress={() => setMonthly(String(v))}
            >
              <Text style={[styles.quickText, monthly === String(v) && styles.quickTextActive]}>
                {v} €
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Suggestion personnalisée */}
        {goalSuggested && goal && (
          <Text style={styles.suggestionHint}>
            💡 Montant suggéré basé sur ton reste disponible
          </Text>
        )}
      </View>

      {/* ── Durée ── */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Pendant combien de temps ?</Text>
        <View style={styles.quickRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity role="radio" aria-checked={years === d}
              key={d}
              style={[styles.quickBtn, years === d && styles.quickBtnActive]}
              onPress={() => setYears(d)}
            >
              <Text style={[styles.quickText, years === d && styles.quickTextActive]}>
                {d} ans
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Support ── */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Sur quel support ?</Text>
        <View style={styles.presetRow}>
          {PRESETS.map((p, i) => (
            <TouchableOpacity role="radio" aria-checked={selectedPreset === i}
              key={i}
              style={[styles.presetBtn, selectedPreset === i && styles.presetBtnActive]}
              onPress={() => handlePreset(i)}
            >
              <Text style={styles.presetEmoji} aria-hidden>{p.emoji}</Text>
              <Text style={[styles.presetLabel, selectedPreset === i && styles.presetLabelActive]}>{p.label}</Text>
              <Text style={[styles.presetRate,  selectedPreset === i && styles.presetRateActive]}>{p.rate} %/an</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.customRateRow}>
          <Text style={styles.customRateLabel}>Ou taux personnalisé :</Text>
          <TextInput
            style={styles.customRateInput}
            value={customRate}
            onChangeText={(v) => { setCustomRate(v); setSelectedPreset(-1); }}
            keyboardType="numeric"
            placeholder="ex: 5"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.customRateUnit}>%/an</Text>
        </View>
      </View>

      {/* ── Résultat ── */}
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Dans {years} ans, tu auras</Text>
        <Text style={styles.resultAmount}>{fmt(Math.round(finalAmount))}</Text>

        <TouchableOpacity role="button" onPress={() => setShowInflation(!showInflation)} style={styles.inflationToggle}>
          <Text style={styles.inflationToggleText}>
            {showInflation ? '📈 Voir en valeur nominale' : '📉 Voir en €uros d\'aujourd\'hui'}
          </Text>
        </TouchableOpacity>

        {showInflation && (
          <View style={styles.inflationSection}>
            <Text style={styles.realValueText}>≈ {fmt(Math.round(realValue))} en euros d'aujourd'hui</Text>
            <Text style={styles.inflationExplain}>
              Avec {inflationRate}% d'inflation/an, ton argent perd de la valeur. C'est pourquoi investir bat l'épargne classique.
            </Text>
            <View style={styles.inflationChips}>
              {INFLATION_CHIPS.map((chip) => (
                <TouchableOpacity role="radio" aria-checked={inflationRate === chip}
                  key={chip}
                  style={[styles.inflationChip, inflationRate === chip && styles.inflationChipActive]}
                  onPress={() => setInflationRate(chip)}
                >
                  <Text style={[styles.inflationChipText, inflationRate === chip && styles.inflationChipTextActive]}>
                    {chip}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.barWrap}>
          <View style={[styles.barSegment, { flex: gainRatio,     backgroundColor: colors.primaryLight }]} />
          <View style={[styles.barSegment, { flex: 1 - gainRatio, backgroundColor: colors.success }]} />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primaryLight }]} />
            <Text style={styles.legendLabel}>Ton argent</Text>
            <Text style={styles.legendValue}>{fmt(Math.round(totalInvested))}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendLabel}>Tes gains</Text>
            <Text style={[styles.legendValue, { color: colors.success }]}>+{fmt(Math.round(gains))}</Text>
          </View>
        </View>

        <View style={styles.multiplierBadge}>
          <Text style={styles.multiplierText}>
            ×{finalAmount > 0 ? (finalAmount / Math.max(totalInvested, 1)).toFixed(1) : '1'} ton argent de départ
          </Text>
        </View>
      </View>

      {/* ── Progression par étape ── */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Ta progression dans le temps</Text>
        {[1, 5, 10, 20, years].filter((y, i, arr) => y <= years && arr.indexOf(y) === i).map((y) => {
          const fv = computeFV(monthlyNum, y, effectiveRate);
          const rv = computeRealValue(fv, y, inflationRate);
          const hitGoal = goal && goal.amount > 0 && fv >= goal.amount;
          return (
            <View key={y} style={styles.progressRow}>
              <Text style={styles.progressYear}>Dans {y} an{y > 1 ? 's' : ''}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min((fv / finalAmount) * 100, 100)}%` }]} />
                {/* Marqueur objectif */}
                {goal && goal.amount > 0 && finalAmount > 0 && (
                  <View style={[styles.goalMarker, { left: `${Math.min((goal.amount / finalAmount) * 100, 100)}%` as any }]} />
                )}
              </View>
              <View style={styles.progressAmounts}>
                <Text style={[styles.progressAmount, hitGoal && { color: colors.success }]}>
                  {fmt(Math.round(fv))}{hitGoal ? ' ✅' : ''}
                </Text>
                {showInflation && <Text style={styles.progressRealAmount}>{fmt(Math.round(rv))}</Text>}
              </View>
            </View>
          );
        })}
        {goal && goal.amount > 0 && (
          <Text style={styles.goalLegend}>✅ = objectif {goal.label} atteint ({fmt(goal.amount)})</Text>
        )}
      </View>

      {/* ── Disclaimer ── */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Ces projections sont indicatives et basées sur un taux constant. Les rendements passés ne préjugent pas des rendements futurs. Ce n'est pas un conseil en investissement.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { padding: spacing.md, paddingBottom: 40 },
  title:    { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },

  // Carte objectif
  goalCard: {
    backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.3)',
  },
  goalHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  goalEmoji:     { fontSize: 28 },
  goalTitle:     { fontSize: 15, fontWeight: '700', color: colors.text },
  goalTarget:    { fontSize: 13, color: colors.textMuted, marginTop: 1 },
  goalBadge:     { alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: radius.md, padding: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  goalBadgeValue: { fontSize: 14, fontWeight: '700', color: colors.success },
  goalBadgeLabel: { fontSize: 10, color: colors.success },
  goalProgressWrap: { marginTop: 4 },
  goalProgressBg:   { height: 8, backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  goalProgressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  goalProgressText: { fontSize: 11, color: colors.textMuted },
  goalDone:         { fontSize: 13, fontWeight: '600', color: colors.success, textAlign: 'center', marginTop: 4 },

  suggestionHint: { fontSize: 11, color: colors.primaryLight, marginTop: 8, fontStyle: 'italic' },

  card:       { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },

  amountRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  amountInput: {
    fontSize: 32, fontWeight: 'bold', color: colors.text,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: 12, minWidth: 120, textAlign: 'center',
  },
  amountUnit: { fontSize: 16, color: colors.textSecondary, marginLeft: 10 },

  quickRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickBtn:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  quickBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  quickText:      { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  quickTextActive:{ color: colors.white, fontWeight: '700' },

  presetRow:         { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  presetBtn:         { flex: 1, alignItems: 'center', padding: 10, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  presetBtnActive:   { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: colors.primary },
  presetEmoji:       { fontSize: 20, marginBottom: 4 },
  presetLabel:       { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  presetLabelActive: { color: colors.primaryLight },
  presetRate:        { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  presetRateActive:  { color: colors.primaryLight, fontWeight: '700' },

  customRateRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  customRateLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  customRateInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 8, width: 64, textAlign: 'center', fontSize: 14, color: colors.text },
  customRateUnit:  { fontSize: 13, color: colors.textSecondary },

  resultCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)', borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1.5, borderColor: 'rgba(124, 58, 237, 0.3)', alignItems: 'center',
  },
  resultTitle:  { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  resultAmount: { fontSize: 40, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },

  inflationToggle:     { marginBottom: spacing.sm },
  inflationToggleText: { fontSize: 12, color: colors.textMuted, textDecorationLine: 'underline' },
  inflationSection:    { width: '100%', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.25)', padding: spacing.sm, marginBottom: spacing.sm, alignItems: 'center' },
  realValueText:       { fontSize: 15, color: colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  inflationExplain:    { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 8, lineHeight: 15 },
  inflationChips:      { flexDirection: 'row', gap: 8 },
  inflationChip:       { paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  inflationChipActive: { backgroundColor: colors.warning, borderColor: colors.warning },
  inflationChipText:   { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  inflationChipTextActive: { color: colors.white },

  barWrap:    { flexDirection: 'row', width: '100%', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: spacing.sm },
  barSegment: { height: '100%' },
  legendRow:  { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: spacing.sm },
  legendItem: { alignItems: 'center', gap: 4 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendLabel:{ fontSize: 12, color: colors.textSecondary },
  legendValue:{ fontSize: 14, fontWeight: '700', color: colors.text },

  multiplierBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  multiplierText:  { fontSize: 13, fontWeight: '700', color: colors.success },

  progressRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  progressYear:      { fontSize: 12, color: colors.textMuted, width: 72 },
  progressBar:       { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surface, overflow: 'hidden', position: 'relative' },
  progressFill:      { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  goalMarker:        { position: 'absolute', top: -2, width: 2, height: 10, backgroundColor: colors.success, borderRadius: 1 },
  progressAmounts:   { alignItems: 'flex-end', width: 90 },
  progressAmount:    { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'right' },
  progressRealAmount:{ fontSize: 10, color: colors.textMuted, textAlign: 'right' },
  goalLegend:        { fontSize: 11, color: colors.success, marginTop: 4, fontStyle: 'italic' },

  disclaimer:     { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  disclaimerText: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },
});
