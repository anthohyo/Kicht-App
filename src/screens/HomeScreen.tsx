import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile, Transaction, ChecklistItem } from '../types';
import { loadProfile, loadTransactions, loadChecklist, saveChecklist } from '../utils/storage';
import { getChecklistItems } from '../data/checklistItems';
import { colors, radius, spacing } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([loadProfile(), loadTransactions(), loadChecklist()]).then(([p, txs, cl]) => {
        setProfile(p);
        setTransactions(txs);
        // Premier lancement : seed selon le moment de vie (emménagement à venir ou déjà installé)
        if (!cl || cl.length === 0) {
          const seed = getChecklistItems(p);
          saveChecklist(seed);
          setChecklist(seed);
        } else {
          setChecklist(cl);
        }
      });
    }, [])
  );

  // ── Calculs ──
  const now = new Date();
  const income = transactions.filter((t) => t.type === 'Revenu').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'Dépense').reduce((s, t) => s + t.amount, 0);
  const displayIncome = transactions.length > 0 ? income : (profile?.monthlySalary ?? 0);
  const displayExpenses = transactions.length > 0 ? totalExpenses : (profile ? Object.values(profile.expenses).reduce((a, b) => a + b, 0) : 0);
  const reste = displayIncome - displayExpenses;
  /**
   * Sans aucun revenu saisi, "reste à vivre" n'a pas de sens : un lycéen qui vient
   * d'avoir son bac n'est pas en difficulté financière, il n'a simplement rien rempli.
   * Afficher "-142 € — tu es dans le rouge" dans ce cas est faux et alarmant.
   */
  // Le critère est l'absence de REVENU, pas l'absence de transactions : l'app
  // pré-remplit elle-même des dépenses depuis l'onboarding, et sans revenu en
  // face le « reste à vivre » n'est que l'opposé des dépenses — un faux découvert.
  const budgetNonRenseigne = displayIncome === 0;
  const isSerré = !budgetNonRenseigne && reste >= 0 && reste < 100;
  const isDépassé = !budgetNonRenseigne && reste < 0;

  // ── Priorité n°1 — une seule action, la plus utile ──
  type Action = { emoji: string; title: string; sub: string; onPress: () => void };

  const getPrioriteAction = (): Action | null => {
    // Budget critique — priorité absolue, toujours en premier
    if ((isSerré || isDépassé) && displayIncome > 0) {
      return {
        emoji: '🚨',
        title: 'On va trouver de l\'air.',
        sub: 'Ton budget est très serré. On regarde ensemble les aides et solutions possibles pour finir le mois.',
        onPress: handleBudgetAlert,
      };
    }

    // Intention "démarches" → Le Parrain en priorité
    if (profile?.primaryGoal === 'admin') {
      return {
        emoji: '💬',
        title: 'Le Parrain est là pour toi',
        sub: 'Impôts, bail, CAF, contrat, fiche de paie… Pose ta question et il t\'explique simplement.',
        onPress: () => navigation.navigate('Main' as any, { screen: 'Chat' } as any),
      };
    }

    // Intention "budget" → pousser vers Mon mois
    if (profile?.primaryGoal === 'budget') {
      return {
        emoji: '💰',
        title: 'Première priorité : vois clair sur ton mois',
        sub: 'Ajoute tes dépenses principales pour connaître ton vrai reste à vivre.',
        onPress: () => navigation.navigate('Main' as any, { screen: 'Budget' } as any),
      };
    }

    // Emménagement à venir — la priorité est Visale, et elle est datée :
    // demandée après les visites, la garantie ne sert plus à rien.
    if (profile?.housingType === 'futur') {
      return {
        emoji: '📦',
        title: 'Commence par ta garantie Visale',
        sub: 'Caution gratuite d\'Action Logement. À obtenir AVANT de visiter — c\'est ce qui fera accepter ton dossier.',
        onPress: () => navigation.navigate('Aides' as any),
      };
    }

    // APL — si logement éligible (et intention "aides" ou par défaut)
    if (profile?.housingType && ['seul', 'coloc', 'crous'].includes(profile.housingType)) {
      return {
        emoji: '🏠',
        title: 'Première priorité : vérifie ton APL',
        sub: 'Tu y as probablement droit. 5 min pour potentiellement +150 €/mois.',
        onPress: () => navigation.navigate('Aides' as any),
      };
    }

    // Bourse CROUS si étudiant éligible
    if (profile?.status === 'etudiant' && profile?.schoolType !== 'prive_non_reconnu') {
      return {
        emoji: '🎓',
        title: 'Première priorité : la bourse CROUS',
        sub: 'Si tu ne l\'as pas encore vérifiée, ça peut valoir plusieurs centaines par mois.',
        onPress: () => navigation.navigate('Aides' as any),
      };
    }

    // Prime d'activité pour apprentis éligibles
    if (profile?.status === 'apprenti' && (profile?.monthlySalary ?? 0) > 1144) {
      return {
        emoji: '💶',
        title: 'Tu es éligible à la prime d\'activité',
        sub: '~150–200 €/mois directement sur ton compte. 2 min pour la demander.',
        onPress: () => navigation.navigate('Aides' as any),
      };
    }

    // Déclaration impôts
    const month = now.getMonth() + 1;
    if ([3, 4, 5, 6].includes(month) && (profile?.status === 'salarie' || profile?.status === 'apprenti')) {
      return {
        emoji: '📅',
        title: 'Déclaration d\'impôts — ne stresse pas',
        sub: 'Une fiche pas-à-pas pour tout comprendre en 10 min.',
        onPress: () => navigation.navigate('Guides'),
      };
    }

    // Par défaut : simulateur d'aides
    return {
      emoji: '🎯',
      title: 'Première priorité : découvre l\'argent que tu rates',
      sub: 'APL, bourse, prime d\'activité… 2 min pour tout trouver.',
      onPress: () => navigation.navigate('Aides' as any),
    };
  };

  const handleBudgetAlert = async () => {
    const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const joursRestants = fin.getDate() - now.getDate();
    const parJour = joursRestants > 0 ? Math.round(reste / joursRestants) : reste;
    const msg = `Mon budget est vraiment serré ce mois-ci. Il me reste ${reste}€ disponible en tout, soit environ ${parJour}€ par jour sur les ${joursRestants} prochains jours. Qu'est-ce que je peux faire concrètement pour m'en sortir jusqu'à la fin du mois ?`;
    await AsyncStorage.setItem('@kichtapp_pending_chat', msg);
    navigation.navigate('Main' as any, { screen: 'Chat' } as any);
  };

  const firstName = profile?.firstName
    ? profile.firstName.charAt(0).toUpperCase() + profile.firstName.slice(1)
    : null;

  const monthName = now.toLocaleDateString('fr-FR', { month: 'long' });
  const resteColor = isDépassé ? colors.danger : isSerré ? colors.warning : colors.success;
  const priorité = getPrioriteAction();

  // Micro-contexte journalier
  const finDeMois = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const joursRestants = finDeMois.getDate() - now.getDate();
  const parJourStr = joursRestants > 0 && reste > 0
    ? (reste / joursRestants).toFixed(2).replace('.', ',') + ' €'
    : null;

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* ── Greeting ── */}
        <Text style={styles.greeting}>
          {firstName ? `Salut ${firstName} 👋` : 'Salut 👋'}
        </Text>

        {/* ── Reste à vivre ── */}
        <View style={[styles.resteCard, isDépassé && styles.resteCardDanger, isSerré && styles.resteCardWarning]}>
          {budgetNonRenseigne ? (
            <Text style={styles.resteLabel}>Ton budget n'est pas encore rempli</Text>
          ) : (
            <Text style={styles.resteLabel}>
              Il te reste <Text style={[styles.resteLabelAmount, { color: resteColor }]}>{reste} €</Text> ce mois-ci
            </Text>
          )}

          {budgetNonRenseigne && (
            <Text style={styles.resteSubline}>
              Ajoute ce qui rentre et ce qui sort pour savoir où tu en es. Deux minutes suffisent.
            </Text>
          )}

          {isDépassé && (
            <Text style={[styles.resteSubline, { color: colors.dangerText }]}>
              Tu es dans le rouge — il faut agir maintenant
            </Text>
          )}
          {isSerré && parJourStr && (
            <Text style={[styles.resteSubline, { color: colors.warning }]}>
              {joursRestants} {joursRestants > 1 ? 'jours restants' : 'jour restant'}, soit environ {parJourStr} par jour.
            </Text>
          )}
          {isSerré && !parJourStr && (
            <Text style={[styles.resteSubline, { color: colors.warning }]}>
              Il reste peu pour finir le mois.
            </Text>
          )}
          {!isDépassé && !isSerré && displayIncome > 0 && parJourStr && (
            <Text style={styles.resteSubline}>
              {joursRestants} {joursRestants > 1 ? 'jours restants' : 'jour restant'}, soit environ {parJourStr} par jour.
            </Text>
          )}
          {!isDépassé && !isSerré && displayIncome > 0 && !parJourStr && (
            <Text style={styles.resteSubline}>
              Revenus {displayIncome} € · Dépenses {displayExpenses} €
            </Text>
          )}

          <TouchableOpacity role="button"
            onPress={async () => {
              await AsyncStorage.setItem('@kichtapp_open_budget_form', '1');
              navigation.navigate('Main' as any, { screen: 'Budget' } as any);
            }}
            style={styles.addExpenseBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.addExpenseBtnText}>+ Ajouter une dépense</Text>
          </TouchableOpacity>
        </View>

        {/* ── Priorité n°1 ── */}
        {priorité && (
          <TouchableOpacity role="button"
            style={styles.priorityCard}
            onPress={priorité.onPress}
            activeOpacity={0.85}
          >
            <View style={styles.priorityTop}>
              <Text style={styles.priorityEmoji} aria-hidden>{priorité.emoji}</Text>
              <Text style={styles.priorityLabel}>PRIORITÉ N°1</Text>
            </View>
            <Text style={styles.priorityTitle}>{priorité.title}</Text>
            <Text style={styles.prioritySub}>{priorité.sub}</Text>
            <View style={styles.priorityCta}>
              <Text style={styles.priorityCtaText}>Je m'en occupe →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Checklist premier mois ── */}
        {(() => {
          const total = checklist.length;
          const done = checklist.filter((c) => c.checked).length;
          const nextItem = checklist.find((c) => !c.checked);
          if (total === 0 || done === total) return null;
          const pct = Math.round((done / total) * 100);
          return (
            <TouchableOpacity role="button"
              style={styles.checklistCard}
              onPress={() => navigation.navigate('Checklist')}
              activeOpacity={0.8}
            >
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistTitle}>
                  {profile?.housingType === 'futur' ? '📦 Avant d\'emménager' : '🗓 Premier mois'}
                </Text>
                <Text style={styles.checklistProgress}>{done}/{total} faits</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${pct}%` as any }]} />
              </View>
              {nextItem && (
                <Text style={styles.checklistNext} numberOfLines={1}>
                  Prochain : {nextItem.label}
                </Text>
              )}
              <Text style={styles.checklistCta}>Voir la liste →</Text>
            </TouchableOpacity>
          );
        })()}

        {/* ── Agenda ──
            Seule porte d'entrée vers l'agenda : il n'était accessible que depuis
            l'écran Explorer, lui-même inaccessible. Les rappels d'échéances en
            dépendent — un écran introuvable ne rappelle rien à personne. */}
        <TouchableOpacity
          style={[styles.parrainCard, { marginBottom: spacing.sm }]}
          onPress={() => navigation.navigate('Agenda')}
          activeOpacity={0.8}
          role="button"
          aria-label="Mes échéances et rappels"
        >
          <Text style={styles.parrainEmoji} aria-hidden>📅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.parrainTitle}>Mes échéances</Text>
            <Text style={styles.parrainSub}>
              Loyer, prélèvements, dossiers à rendre : note tes dates, l'app te prévient avant.
            </Text>
            <Text style={styles.parrainCta}>Ouvrir mon agenda →</Text>
          </View>
        </TouchableOpacity>

        {/* ── Le Parrain ── */}
        <TouchableOpacity role="button"
          style={styles.parrainCard}
          onPress={() => navigation.navigate('Main' as any, { screen: 'Chat' } as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.parrainEmoji} aria-hidden>🤝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.parrainTitle}>Besoin d'aide ?</Text>
            <Text style={styles.parrainSub}>
              APL, fiche de paie, impôts, CAF, caution, bail… Le Parrain t'explique tout simplement.
            </Text>
            <Text style={styles.parrainCta}>Parler au Parrain →</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 60 },

  // Greeting
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  // Reste à vivre
  resteCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  resteCardDanger: {
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  resteCardWarning: {
    borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: 'rgba(245,158,11,0.05)',
  },
  resteLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 24,
  },
  resteLabelAmount: {
    fontWeight: '800',
    fontSize: 17,
  },
  resteSubline: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  addExpenseBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addExpenseBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Priorité n°1
  priorityCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  priorityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  priorityEmoji: { fontSize: 22 },
  priorityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 1.5,
  },
  priorityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  prioritySub: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  priorityCta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  priorityCtaText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },

  // Checklist premier mois
  checklistCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checklistTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  checklistProgress: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  checklistNext: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  checklistCta: { fontSize: 13, fontWeight: '700', color: colors.primaryLight },

  // Le Parrain
  parrainCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  parrainEmoji: { fontSize: 28 },
  parrainTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  parrainSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 8 },
  parrainCta: { fontSize: 13, fontWeight: '700', color: colors.primaryLight },
});
