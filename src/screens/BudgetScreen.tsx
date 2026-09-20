import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Transaction, UserProfile } from '../types';
import { saveTransactions, loadTransactions, loadProfile, saveProfile } from '../utils/storage';
import { trackAction } from '../utils/gamification';
import BudgetSummary from '../components/BudgetSummary';
import CategoryChart from '../components/CategoryChart';
import TransactionForm from '../components/TransactionForm';
import { colors, radius, spacing } from '../theme';

// ─── Clé mensuelle type "2026-06" ──────────────────────────────────────────
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Map profil → catégories transactions ──────────────────────────────────
const EXPENSE_MAP: { key: keyof UserProfile['expenses']; label: string; category: Transaction['category'] }[] = [
  { key: 'loyer',        label: 'Loyer',            category: 'Loyer' },
  { key: 'abonnements',  label: 'Abonnements',      category: 'Abonnements' },
  { key: 'electricite',  label: 'Électricité / gaz', category: 'Électricité' },
  { key: 'courses',      label: 'Courses',          category: 'Courses' },
  { key: 'transport',    label: 'Transport',        category: 'Transport' },
  { key: 'sorties',      label: 'Sorties / loisirs', category: 'Sorties' },
];

// ─── Seed initial (premier lancement) ──────────────────────────────────────
function seedTransactions(profile: UserProfile): Transaction[] {
  const today = new Date().toISOString();
  const txs: Transaction[] = [];
  if (profile.monthlySalary > 0) {
    txs.push({ id: 'seed-salaire', amount: profile.monthlySalary, label: 'Salaire / revenus mensuels', type: 'Revenu', category: 'Salaire', date: today });
  }
  EXPENSE_MAP.forEach(({ key, label, category }) => {
    const amount = profile.expenses[key];
    // Emménagement à venir : le loyer saisi est un loyer VISÉ, pas une dépense
    // en cours. L'inscrire au budget ferait apparaître un découvert imaginaire
    // sur un logement que l'utilisateur n'a pas encore.
    if (key === 'loyer' && profile.housingType === 'futur') return;
    if (amount > 0) txs.push({ id: `seed-${key}`, amount, label, type: 'Dépense', category, date: today });
  });
  return txs;
}

// ─── Transactions récurrentes mensuelles ───────────────────────────────────
export function createMonthlyTransactions(profile: UserProfile, date: Date): Transaction[] {
  const mk = monthKey(date);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const txs: Transaction[] = [];
  if (profile.monthlySalary > 0) {
    txs.push({ id: `recurrent-salaire-${mk}`, amount: profile.monthlySalary, label: 'Salaire / revenus mensuels', type: 'Revenu', category: 'Salaire', date: firstDay });
  }
  EXPENSE_MAP.forEach(({ key, label, category }) => {
    const amount = profile.expenses[key];
    if (amount > 0) txs.push({ id: `recurrent-${key}-${mk}`, amount, label, type: 'Dépense', category, date: firstDay });
  });
  return txs;
}

const SEEDED_MONTHS_KEY = '@kichtapp_seeded_months';

// ─── Reste à vivre ─────────────────────────────────────────────────────────
function ResteAVivre({ transactions, isCurrentMonth }: { transactions: Transaction[]; isCurrentMonth: boolean }) {
  const navigation = useNavigation<any>();
  const income   = transactions.filter((t) => t.type === 'Revenu').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'Dépense').reduce((s, t) => s + t.amount, 0);
  const reste = income - expenses;
  if (income === 0) return null;

  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const joursRestants = lastDay - now.getDate() + 1;
  const parJour = isCurrentMonth && joursRestants > 0 ? Math.round(reste / joursRestants) : null;

  const isRouge  = parJour !== null && parJour < 10;
  const isOrange = parJour !== null && parJour >= 10 && parJour < 20;
  const couleur  = parJour === null ? colors.success : parJour >= 20 ? colors.success : isOrange ? colors.warning : colors.danger;
  const emoji    = parJour === null ? '' : parJour >= 20 ? '✅' : isOrange ? '⚠️' : '🚨';

  return (
    <View style={ravStyles.card}>
      <View style={ravStyles.header}>
        <Text style={ravStyles.title}>💡 Reste à vivre</Text>
        {isCurrentMonth && <Text style={ravStyles.sub}>{joursRestants} jours restants</Text>}
      </View>
      <View style={ravStyles.row}>
        <View style={ravStyles.stat}>
          <Text style={[ravStyles.amount, { color: reste >= 0 ? colors.success : colors.danger }]}>
            {reste >= 0 ? '+' : ''}{reste} €
          </Text>
          <Text style={ravStyles.statLabel}>disponible</Text>
        </View>
        {parJour !== null && (
          <>
            <View style={ravStyles.divider} />
            <View style={ravStyles.stat}>
              <Text style={[ravStyles.amount, { color: couleur }]}>
                {emoji} {parJour} €
              </Text>
              <Text style={ravStyles.statLabel}>par jour</Text>
            </View>
          </>
        )}
      </View>
      {isRouge && (
        <TouchableOpacity role="button"
          style={ravStyles.alertRow}
          onPress={async () => {
            const msg = `Mon budget est vraiment serré ce mois-ci. Il me reste ${reste}€ disponible en tout, soit ${parJour}€ par jour sur les ${joursRestants} prochains jours. Qu'est-ce que je peux faire concrètement pour m'en sortir jusqu'à la fin du mois ?`;
            await AsyncStorage.setItem('@kichtapp_pending_chat', msg);
            navigation.navigate('Main', { screen: 'Chat' });
          }}
          activeOpacity={0.7}
        >
          <Text style={ravStyles.alertText}>C'est serré ! Demande conseil au Parrain</Text>
          <Text style={ravStyles.alertArrow}> →</Text>
        </TouchableOpacity>
      )}
      {isOrange && !isRouge && (
        <Text style={ravStyles.tipOrange}>Surveille tes dépenses ces {joursRestants} prochains jours.</Text>
      )}
    </View>
  );
}

const ravStyles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  amount: { fontSize: 26, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: colors.border, marginHorizontal: 8 },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: radius.md, padding: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  alertText: { fontSize: 13, color: colors.dangerText, fontWeight: '600' },
  alertArrow: { fontSize: 14, color: colors.dangerText, fontWeight: 'bold' },
  tipOrange: { fontSize: 12, color: colors.warning, marginTop: spacing.sm, textAlign: 'center' },
});

// ─── Alerte budget ─────────────────────────────────────────────────────────
function BudgetAlert({ transactions }: { transactions: Transaction[] }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const income   = transactions.filter((t) => t.type === 'Revenu').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'Dépense').reduce((s, t) => s + t.amount, 0);
  if (income === 0 || expenses === 0) return null;

  const ratio = expenses / income;
  const pct = Math.round(ratio * 100);

  const askParrain = async (question: string) => {
    await AsyncStorage.setItem('@kichtapp_pending_chat', question);
    (navigation as any).navigate('Main', { screen: 'Chat' });
  };

  if (ratio < 0.7) {
    return (
      <View style={[alertStyles.box, alertStyles.green]}>
        <Text style={alertStyles.icon} aria-hidden>✅</Text>
        <Text style={alertStyles.text}>Tu dépenses {pct}% de tes revenus. Bonne gestion — pense à faire fructifier le reste !</Text>
      </View>
    );
  }
  if (ratio < 0.9) {
    return (
      <View style={[alertStyles.box, alertStyles.yellow]}>
        <View style={{ flex: 1 }}>
          <Text style={alertStyles.icon} aria-hidden>⚠️</Text>
          <Text style={alertStyles.text}>Tu dépenses {pct}% de tes revenus. C'est serré — regarde les abonnements et les sorties.</Text>
          <TouchableOpacity role="button" onPress={() => askParrain(`Je dépense ${pct}% de mes revenus ce mois-ci. Comment je peux réduire mes sorties et mes abonnements concrètement ?`)} style={alertStyles.cta}>
            <Text style={alertStyles.ctaText}>💬 Comment réduire mes sorties ? →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={[alertStyles.box, alertStyles.red]}>
      <View style={{ flex: 1 }}>
        <Text style={alertStyles.icon} aria-hidden>🚨</Text>
        <Text style={alertStyles.text}>Tu dépenses {pct}% de tes revenus ! Essaie de réduire une dépense dès ce mois-ci.</Text>
        <TouchableOpacity role="button" onPress={() => askParrain(`Je dépense ${pct}% de mes revenus ce mois-ci, c'est trop. Qu'est-ce que je peux réduire en priorité pour retrouver de la marge ?`)} style={alertStyles.cta}>
          <Text style={[alertStyles.ctaText, { color: colors.dangerText }]}>💬 Que réduire en priorité ? →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const alertStyles = StyleSheet.create({
  box: { flexDirection: 'row', borderRadius: radius.md, padding: 12, marginBottom: spacing.md, alignItems: 'center', gap: 10 },
  green: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.25)' },
  yellow: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.25)' },
  red: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  icon: { fontSize: 18 },
  text: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  cta: { marginTop: 8, alignSelf: 'flex-start' },
  ctaText: { fontSize: 13, fontWeight: '600', color: colors.warning },
});

// ─── Navigation de mois ────────────────────────────────────────────────────
function MonthNav({ selectedDate, onChange }: { selectedDate: Date; onChange: (dir: -1 | 1) => void }) {
  const now = new Date();
  const isCurrentMonth = selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear();
  const label = selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <View style={navStyles.row}>
      <TouchableOpacity role="button" aria-label="Mois précédent" onPress={() => onChange(-1)} style={navStyles.btn} activeOpacity={0.7}>
        <Text style={navStyles.arrow}>←</Text>
      </TouchableOpacity>
      <Text style={navStyles.label}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>
      <TouchableOpacity role="button" aria-label="Mois suivant" aria-disabled={isCurrentMonth} onPress={() => onChange(1)} style={[navStyles.btn, isCurrentMonth && navStyles.btnDisabled]} disabled={isCurrentMonth} activeOpacity={0.7}>
        <Text style={[navStyles.arrow, isCurrentMonth && navStyles.arrowDisabled]}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const navStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, paddingHorizontal: 4 },
  btn: { padding: 8 },
  btnDisabled: { opacity: 0.3 },
  arrow: { fontSize: 20, color: colors.text, fontWeight: '600' },
  arrowDisabled: { color: colors.textMuted },
  label: { fontSize: 16, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
});

// ─── Écran principal ───────────────────────────────────────────────────────
export default function BudgetScreen() {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [seeded, setSeeded]             = useState(false);
  const [initialized, setInitialized]   = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ── Export CSV — logique dans une ref pour éviter les closures figées ──
  const exportCSV = useCallback(() => {
    const header = 'Date,Label,Catégorie,Type,Montant\n';
    const rows = transactions
      .map((t) => `${new Date(t.date).toLocaleDateString('fr-FR')},${t.label},${t.category},${t.type},${t.type === 'Dépense' ? '-' : '+'}${t.amount}`)
      .join('\n');
    const csv = header + rows;
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-kichtapp-${monthKey(new Date())}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Export', 'Fonctionnalité disponible sur web pour le moment.');
    }
  }, [transactions]);

  const exportCSVRef = useRef(exportCSV);
  useEffect(() => { exportCSVRef.current = exportCSV; }, [exportCSV]);

  // Met à jour le header right quand le nombre de transactions change
  useEffect(() => {
    navigation.setOptions({
      headerRight: transactions.length > 0
        ? () => (
            <TouchableOpacity role="button"
              onPress={() => exportCSVRef.current()}
              style={{ marginRight: 4, paddingHorizontal: 8, paddingVertical: 4 }}
            >
              <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '500' }}>⬇ CSV</Text>
            </TouchableOpacity>
          )
        : undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length]);

  // Auto-ouvre le formulaire si déclenché depuis le FAB de l'Accueil
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@kichtapp_open_budget_form').then((val) => {
        if (val) {
          AsyncStorage.removeItem('@kichtapp_open_budget_form');
          setShowForm(true);
        }
      });
    }, [])
  );

  useEffect(() => {
    const init = async () => {
      const [existing, profile] = await Promise.all([loadTransactions(), loadProfile()]);

      // Premier lancement : seed depuis le profil
      if (existing.length === 0 && profile && !profile.budgetSeeded) {
        const seededTxs = seedTransactions(profile);
        if (seededTxs.length > 0) {
          await saveTransactions(seededTxs);
          await saveProfile({ ...profile, budgetSeeded: true });
          // Marquer le mois courant comme seedé
          const mk = monthKey(new Date());
          await AsyncStorage.setItem(SEEDED_MONTHS_KEY, JSON.stringify([mk]));
          setTransactions(seededTxs);
          setSeeded(true);
          setInitialized(true);
          return;
        }
      }

      // Reset mensuel : créer les transactions récurrentes si nouveau mois
      if (profile?.budgetSeeded) {
        const mk = monthKey(new Date());
        const raw = await AsyncStorage.getItem(SEEDED_MONTHS_KEY);
        const seededMonths: string[] = raw ? JSON.parse(raw) : [];

        if (!seededMonths.includes(mk)) {
          const newRecurrents = createMonthlyTransactions(profile, new Date());
          const updatedTxs = [...existing, ...newRecurrents];
          await saveTransactions(updatedTxs);
          await AsyncStorage.setItem(SEEDED_MONTHS_KEY, JSON.stringify([...seededMonths, mk]));
          setTransactions(updatedTxs);
          setInitialized(true);
          return;
        }
      }

      setTransactions(existing);
      setInitialized(true);
    };
    init();
  }, []);

  // Persiste après chaque changement
  useEffect(() => {
    if (initialized && !seeded) saveTransactions(transactions);
  }, [transactions, seeded, initialized]);

  // ── Navigation mois ──
  const handleMonthChange = useCallback((dir: -1 | 1) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  }, []);

  // ── Transactions filtrées pour le mois sélectionné ──
  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
  });

  const now = new Date();
  const isCurrentMonth = selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear();

  const handleAdd = useCallback((t: Transaction) => {
    setTransactions((prev) => [t, ...prev]);
    trackAction('transaction');
  }, []);

  const handleDelete = useCallback((id: string) => {
    const doDelete = () => setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer cette transaction ?')) doDelete();
    } else {
      Alert.alert('Supprimer', 'Supprimer cette transaction ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>

        <MonthNav selectedDate={selectedDate} onChange={handleMonthChange} />
        <BudgetSummary transactions={filteredTransactions} selectedDate={selectedDate} />
        <ResteAVivre transactions={filteredTransactions} isCurrentMonth={isCurrentMonth} />
        {isCurrentMonth && <BudgetAlert transactions={filteredTransactions} />}
        <CategoryChart transactions={filteredTransactions} />

        <Text style={styles.sectionTitle}>Transactions</Text>

        {seeded && isCurrentMonth && (
          <View style={styles.seededBanner}>
            <Text style={styles.seededText}>
              ✨ Tes dépenses de l'onboarding ont été importées automatiquement. Appuie longuement pour supprimer.
            </Text>
          </View>
        )}

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji} aria-hidden>📝</Text>
            <Text style={styles.emptyText}>
              Aucune transaction ce mois-ci.{'\n'}Appuie sur + pour en ajouter une.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((item) => {
            const isExpense  = item.type === 'Dépense';
            const isRecurring = item.id.startsWith('seed-') || item.id.startsWith('recurrent-');
            return (
              <TouchableOpacity role="button"
                key={item.id}
                style={[styles.transactionRow, isRecurring && styles.transactionRowSeeded]}
                onLongPress={() => handleDelete(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.typeDot, { backgroundColor: isExpense ? colors.danger : colors.success }]} />
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionLabel}>{item.label || item.category}</Text>
                  <Text style={styles.transactionDate}>
                    {item.category} · {new Date(item.date).toLocaleDateString('fr-FR')}
                    {isRecurring ? ' · récurrent' : ''}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: isExpense ? colors.danger : colors.success }]}>
                  {isExpense ? '-' : '+'}{item.amount.toFixed(0)} €
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity role="button" aria-label="Ajouter une dépense ou un revenu" style={styles.fab} onPress={() => setShowForm(true)} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TransactionForm visible={showForm} onClose={() => setShowForm(false)} onAdd={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.md, paddingBottom: 80 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  seededBanner: { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: radius.md, padding: 10, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' },
  seededText: { fontSize: 12, color: colors.primaryLight, lineHeight: 18 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 14, borderRadius: radius.md, marginBottom: 6, borderWidth: 1, borderColor: colors.border },
  transactionRowSeeded: { borderColor: 'rgba(124, 58, 237, 0.2)' },
  typeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  transactionLeft: { flex: 1 },
  transactionLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
  transactionDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.sm },
  emptyText: { textAlign: 'center', color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  exportBtn: { marginHorizontal: spacing.md, marginBottom: spacing.sm, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.card },
  exportText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  fab: { position: 'absolute', bottom: 16, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, zIndex: 10 },
  fabText: { color: colors.white, fontSize: 28, lineHeight: 30 },
});
