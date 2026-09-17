import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaEvent, AgendaCategory } from '../types';
import { STUDENT_DEADLINES, CATEGORY_CONFIG } from '../data/agendaDefaults';
import { EtatRappels, etatRappels, activerRappels, desactiverRappels, resynchroniserRappels } from '../utils/notifications';
import { loadProfile } from '../utils/storage';
import { colors, spacing, radius } from '../theme';

const STORAGE_KEY = '@kichtapp_agenda_events';
const AGENDA_SEEDED_KEY = '@kichtapp_agenda_seeded_v3';

// Dépenses du profil → événements récurrents par défaut
const EXPENSE_SEED_MAP: {
  key: string; label: string; emoji: string; category: AgendaCategory;
  dayOfMonth: number; paymentType: 'prelevement' | 'budget';
}[] = [
  { key: 'loyer',       label: 'Loyer',            emoji: '🏠', category: 'loyer',      dayOfMonth: 1,  paymentType: 'prelevement' },
  { key: 'abonnements', label: 'Abonnements',       emoji: '📱', category: 'abonnement', dayOfMonth: 5,  paymentType: 'prelevement' },
  { key: 'electricite', label: 'Électricité / gaz', emoji: '⚡', category: 'charges',    dayOfMonth: 10, paymentType: 'prelevement' },
  { key: 'courses',     label: 'Budget courses',    emoji: '🛒', category: 'autre',      dayOfMonth: 1,  paymentType: 'budget'      },
  { key: 'transport',   label: 'Transport',         emoji: '🚌', category: 'charges',    dayOfMonth: 1,  paymentType: 'budget'      },
];

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];
const MONTHS_LONG = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const EMOJI_OPTIONS = ['📌', '🏠', '⚡', '📱', '💰', '🎓'];
const CATEGORY_OPTIONS: AgendaCategory[] = ['loyer', 'charges', 'abonnement', 'revenu', 'autre'];

interface UpcomingItem {
  event: AgendaEvent;
  date: Date;
  daysUntil: number;
}

// Badge par type d'événement
function getEventBadge(event: AgendaEvent): { label: string; textColor: string; bgColor: string; borderColor: string } | null {
  if (event.category === 'deadline') {
    return { label: '🟣 Deadline', textColor: '#a78bfa', bgColor: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.3)' };
  }
  if (event.isPayment) {
    if (event.paymentType === 'budget') {
      return { label: '🟡 Budget', textColor: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' };
    }
    return { label: '🔴 Prélèvement', textColor: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)' };
  }
  return null;
}

// Formate une date en "1er avril", "15 mai", etc.
function formatDateLabel(date: Date): string {
  const day = date.getDate();
  const month = MONTHS_LONG[date.getMonth()];
  return `${day === 1 ? '1er' : day} ${month}`;
}

function getNextOccurrence(dayOfMonth: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
  if (candidate < today) {
    // Move to next month
    candidate.setMonth(candidate.getMonth() + 1);
  }
  return candidate;
}

function getUpcomingEvents(customEvents: AgendaEvent[], extraDeadlines: AgendaEvent[] = []): UpcomingItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(today.getDate() + 60);

  const allEvents = [...STUDENT_DEADLINES, ...extraDeadlines, ...customEvents];
  const results: UpcomingItem[] = [];

  for (const event of allEvents) {
    if (event.isoDate && !event.isRecurring) {
      const date = new Date(event.isoDate + 'T00:00:00');
      if (date >= today && date <= limit) {
        const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        results.push({ event, date, daysUntil });
      }
    } else if (event.isRecurring && event.dayOfMonth != null) {
      const date = getNextOccurrence(event.dayOfMonth);
      if (date >= today && date <= limit) {
        const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        results.push({ event, date, daysUntil });
      }
    }
  }

  results.sort((a, b) => a.daysUntil - b.daysUntil);
  return results;
}

function groupByMonth(events: AgendaEvent[]): Map<number, AgendaEvent[]> {
  const map = new Map<number, AgendaEvent[]>();
  for (const event of events) {
    if (event.isoDate) {
      const month = new Date(event.isoDate + 'T00:00:00').getMonth();
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(event);
    }
  }
  return map;
}

export default function AgendaScreen() {
  const [tab, setTab] = useState<'upcoming' | 'annual'>('upcoming');
  const [customEvents, setCustomEvents] = useState<AgendaEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('📌');
  const [newCategory, setNewCategory] = useState<AgendaCategory>('autre');
  const [newIsRecurring, setNewIsRecurring] = useState(true);
  const [newDayOfMonth, setNewDayOfMonth] = useState('1');
  const [newIsoDate, setNewIsoDate] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    const init = async () => {
      // 1. Charger les événements custom existants
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let existing: AgendaEvent[] = [];
      if (raw) {
        try { existing = JSON.parse(raw); } catch { /* ignore */ }
      }

      // 2. Feature 3 — pré-remplir depuis le profil (une seule fois)
      const alreadySeeded = await AsyncStorage.getItem(AGENDA_SEEDED_KEY);
      const profile = await loadProfile();

      if (!alreadySeeded && profile) {
        const seeded: AgendaEvent[] = [];
        for (const map of EXPENSE_SEED_MAP) {
          const amount = (profile.expenses as Record<string, number>)[map.key];
          if (amount && amount > 0) {
            const isBudget = map.paymentType === 'budget';
            seeded.push({
              id: `seed-expense-${map.key}`,
              title: map.label,
              emoji: map.emoji,
              dayOfMonth: map.dayOfMonth,
              amount,
              category: map.category,
              isRecurring: true,
              isCustom: true,
              isPayment: true,
              paymentType: map.paymentType,
              color: isBudget ? 'rgba(245, 158, 11, 0.7)' : 'rgba(239, 68, 68, 0.6)',
            });
          }
        }
        if (seeded.length > 0) {
          const merged = [...seeded, ...existing.filter(e => !e.id.startsWith('seed-expense-'))];
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          await AsyncStorage.setItem(AGENDA_SEEDED_KEY, 'true');
          existing = merged;
        }
      }

      setCustomEvents(existing);
      resynchroniserRappels();
      setRappels(await etatRappels());

    };
    init();
  }, []);

  const [rappels, setRappels] = useState<EtatRappels>('inactifs');
  const basculerRappels = async () => {
    setRappels(rappels === 'actifs' ? await desactiverRappels() : await activerRappels());
  };

  const saveEvents = useCallback(async (events: AgendaEvent[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    resynchroniserRappels(); // un rappel doit suivre l'agenda, pas une version passée de l'agenda
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCustomEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const resetForm = () => {
    setNewTitle('');
    setNewEmoji('📌');
    setNewCategory('autre');
    setNewIsRecurring(true);
    setNewDayOfMonth('1');
    setNewIsoDate('');
    setNewAmount('');
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;

    let isoDate: string | undefined;
    let dayOfMonth: number | undefined;

    if (newIsRecurring) {
      const day = parseInt(newDayOfMonth, 10);
      dayOfMonth = isNaN(day) ? 1 : Math.max(1, Math.min(31, day));
    } else {
      // Parse "JJ/MM/AAAA"
      const parts = newIsoDate.split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        isoDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
    }

    const categoryColor = CATEGORY_CONFIG[newCategory]?.color ?? 'rgba(107, 114, 128, 0.8)';

    const event: AgendaEvent = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      emoji: newEmoji,
      category: newCategory,
      isRecurring: newIsRecurring,
      isCustom: true,
      color: categoryColor,
      ...(dayOfMonth != null ? { dayOfMonth } : {}),
      ...(isoDate ? { isoDate } : {}),
      ...(newAmount.trim() ? { amount: parseFloat(newAmount) } : {}),
    };

    setCustomEvents((prev) => {
      const updated = [...prev, event];
      saveEvents(updated);
      return updated;
    });
    resetForm();
    setShowAddModal(false);
  };

  const upcomingItems = getUpcomingEvents(customEvents);
  // Vue annuelle : uniquement les échéances datées que l'utilisateur a lui-même ajoutées.
  const groupedAnnual = groupByMonth(customEvents.filter((e) => !!e.isoDate && !e.isRecurring));
  const sortedMonths = Array.from(groupedAnnual.keys()).sort((a, b) => a - b);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Mon agenda</Text>
        <Text style={styles.headerSubtitle}>Tes deadlines et paiements en un coup d'oeil</Text>
        {rappels === 'indisponible' ? (
          <Text style={styles.rappelsInfo}>🔔 Les rappels d'échéances fonctionnent dans l'app mobile.</Text>
        ) : rappels === 'refuses' ? (
          <Text style={styles.rappelsInfo}>🔕 Notifications refusées — autorise-les dans les réglages du téléphone.</Text>
        ) : (
          <TouchableOpacity
            style={[styles.rappelsBtn, rappels === 'actifs' && styles.rappelsBtnActif]}
            onPress={basculerRappels}
            accessibilityRole="switch"
            accessibilityState={{ checked: rappels === 'actifs' }}
            accessibilityLabel="Rappels des échéances"
          >
            <Text style={styles.rappelsBtnText}>
              {rappels === 'actifs' ? '🔔 Rappels activés — appuie pour désactiver' : '🔔 Me rappeler mes échéances'}
            </Text>
          </TouchableOpacity>
        )}
        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === 'upcoming' && styles.tabActive]}
            onPress={() => setTab('upcoming')}
          >
            <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>À venir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'annual' && styles.tabActive]}
            onPress={() => setTab('annual')}
          >
            <Text style={[styles.tabText, tab === 'annual' && styles.tabTextActive]}>Annuel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {tab === 'upcoming' && (
          <>
            {upcomingItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>🎉 Rien à venir dans les 60 prochains jours</Text>
              </View>
            ) : (() => {
              // Grouper par date
              const groups = new Map<string, UpcomingItem[]>();
              upcomingItems.forEach((item) => {
                const key = item.date.toDateString();
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(item);
              });

              return Array.from(groups.entries()).map(([dateKey, items]) => {
                const firstDate = items[0].date;
                const daysUntil = items[0].daysUntil;
                // Total des prélèvements + budgets du jour
                const totalAmount = items
                  .filter((i) => i.event.isPayment && i.event.amount != null)
                  .reduce((sum, i) => sum + (i.event.amount ?? 0), 0);

                return (
                  <View key={dateKey}>
                    {/* En-tête de date */}
                    <View style={styles.dateGroupHeader}>
                      <View style={styles.dateGroupLeft}>
                        <Text style={styles.dateGroupDay}>
                          {daysUntil === 0 ? "Aujourd'hui" : daysUntil === 1 ? 'Demain' : formatDateLabel(firstDate)}
                        </Text>
                        {daysUntil > 1 && (
                          <Text style={styles.dateGroupCountdown}>dans {daysUntil} jours</Text>
                        )}
                      </View>
                      {totalAmount > 0 && (
                        <Text style={styles.dateGroupTotal}>{totalAmount} € prévus</Text>
                      )}
                    </View>

                    {/* Cartes du jour */}
                    {items.map(({ event, date }) => {
                      const badge = getEventBadge(event);
                      const isBudgetEnvelope = event.isPayment && event.paymentType === 'budget';
                      return (
                        <View
                          key={event.id + date.getTime()}
                          style={[styles.eventCard, isBudgetEnvelope && styles.eventCardBudget]}
                        >
                          <View style={[styles.dateBadge, { backgroundColor: event.color ?? colors.primary }]}>
                            <Text style={styles.dateBadgeDay}>{date.getDate()}</Text>
                            <Text style={styles.dateBadgeMon}>{MONTHS_SHORT[date.getMonth()]}</Text>
                          </View>
                          <View style={styles.eventInfo}>
                            <View style={styles.eventTitleRow}>
                              <Text style={[styles.eventTitle, isBudgetEnvelope && styles.eventTitleMuted]}>
                                {event.emoji} {event.title}
                              </Text>
                              {badge && (
                                <View style={[styles.typeBadge, { backgroundColor: badge.bgColor, borderColor: badge.borderColor }]}>
                                  <Text style={[styles.typeBadgeText, { color: badge.textColor }]}>{badge.label}</Text>
                                </View>
                              )}
                            </View>
                            {event.amount != null && (
                              <Text style={[styles.eventAmount, isBudgetEnvelope && styles.eventAmountBudget]}>
                                {event.amount} €
                              </Text>
                            )}
                          </View>
                          {event.isCustom && (
                            <TouchableOpacity onPress={() => handleDelete(event.id)} style={styles.deleteBtnContainer}>
                              <Text style={styles.deleteBtn}>✕</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              });
            })()}
          </>
        )}

        {tab === 'annual' && (
          <>
            {sortedMonths.length === 0 && (
              <View style={styles.annualEmpty}>
                <Text style={styles.annualEmptyTitle}>Aucune échéance datée pour l'instant</Text>
                <Text style={styles.annualEmptyText}>
                  Les dates officielles — ouverture des demandes de bourse, déclaration d'impôts — changent
                  chaque année et sont publiées quelques semaines avant. On ne les invente pas : ajoute les
                  tiennes avec le bouton +, et l'app te les rappellera.
                </Text>
              </View>
            )}
            {sortedMonths.map((month) => {
              const monthEvents = groupedAnnual.get(month) ?? [];
              return (
                <View key={month} style={styles.monthGroup}>
                  <Text style={styles.monthHeader}>{MONTHS_LONG[month]}</Text>
                  {monthEvents.map((event) => {
                    const d = new Date(event.isoDate! + 'T00:00:00');
                    return (
                      <View key={event.id} style={styles.annualItem}>
                        <Text style={styles.annualEmoji}>{event.emoji}</Text>
                        <Text style={styles.annualTitle}>{event.title}</Text>
                        <Text style={styles.annualDate}>
                          {d.getDate()} {MONTHS_SHORT[d.getMonth()]}.
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ajouter un événement</Text>

            {/* Emoji picker */}
            <Text style={styles.fieldLabel}>Emoji</Text>
            <View style={styles.emojiRow}>
              {EMOJI_OPTIONS.map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[styles.emojiOption, newEmoji === em && styles.emojiOptionSelected]}
                  onPress={() => setNewEmoji(em)}
                >
                  <Text style={styles.emojiOptionText}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <Text style={styles.fieldLabel}>Nom de l'événement</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Ex: Netflix, loyer..."
              placeholderTextColor={colors.textMuted}
            />

            {/* Category */}
            <Text style={styles.fieldLabel}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <View style={styles.chipsRow}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, newCategory === cat && styles.chipActive]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text style={[styles.chipText, newCategory === cat && styles.chipTextActive]}>
                      {CATEGORY_CONFIG[cat]?.emoji} {CATEGORY_CONFIG[cat]?.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Recurring toggle */}
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, newIsRecurring && styles.toggleBtnActive]}
                onPress={() => setNewIsRecurring(true)}
              >
                <Text style={[styles.toggleBtnText, newIsRecurring && styles.toggleBtnTextActive]}>
                  Récurrent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !newIsRecurring && styles.toggleBtnActive]}
                onPress={() => setNewIsRecurring(false)}
              >
                <Text style={[styles.toggleBtnText, !newIsRecurring && styles.toggleBtnTextActive]}>
                  Ponctuel
                </Text>
              </TouchableOpacity>
            </View>

            {/* Day of month or date */}
            {newIsRecurring ? (
              <>
                <Text style={styles.fieldLabel}>Jour du mois (1-31)</Text>
                <TextInput
                  style={styles.input}
                  value={newDayOfMonth}
                  onChangeText={setNewDayOfMonth}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Date (JJ/MM/AAAA)</Text>
                <TextInput
                  style={styles.input}
                  value={newIsoDate}
                  onChangeText={setNewIsoDate}
                  placeholder="01/06/2026"
                  placeholderTextColor={colors.textMuted}
                />
              </>
            )}

            {/* Amount */}
            <Text style={styles.fieldLabel}>Montant (optionnel)</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.euroSign}>€</Text>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { resetForm(); setShowAddModal(false); }}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rappelsInfo: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
  rappelsBtn: {
    alignSelf: 'flex-start', marginTop: 10, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
  rappelsBtnActif: { borderColor: 'rgba(16, 185, 129, 0.45)', backgroundColor: colors.successBg },
  rappelsBtnText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  annualEmpty: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginTop: spacing.sm,
  },
  annualEmptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 },
  annualEmptyText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Date group header
  dateGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  dateGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateGroupDay: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  dateGroupCountdown: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dateGroupTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },

  eventCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventCardBudget: {
    opacity: 0.72,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  dateBadge: {
    width: 48,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dateBadgeDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 22,
  },
  dateBadgeMon: {
    fontSize: 11,
    color: colors.white,
    opacity: 0.85,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2,
  },
  typeBadge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '600' },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  eventTitleMuted: {
    color: colors.textSecondary,
  },
  eventAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 2,
  },
  eventAmountBudget: {
    color: '#f59e0b',
  },
  deleteBtnContainer: {
    padding: spacing.sm,
  },
  deleteBtn: {
    fontSize: 16,
    color: colors.textMuted,
  },
  monthGroup: {
    marginBottom: spacing.lg,
  },
  monthHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  annualItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  annualEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  annualTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  annualDate: {
    fontSize: 12,
    color: colors.textMuted,
    minWidth: 50,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  emojiOptionText: {
    fontSize: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipsScroll: {
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  toggleBtnText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  toggleBtnTextActive: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountInput: {
    flex: 1,
  },
  euroSign: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '700',
  },
});
