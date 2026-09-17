import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { allGuides, GUIDE_CATEGORIES } from '../data/guides';
import { colors, radius, spacing } from '../theme';

type CategoryKey = keyof typeof GUIDE_CATEGORIES;
const ALL_CATEGORIES: (CategoryKey | 'all')[] = ['all', 'impots', 'logement', 'budget', 'travail', 'sante', 'admin', 'investissement'];

export default function GuidesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<CategoryKey | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = allGuides
    .filter((g) => filter === 'all' || g.category === filter)
    .filter((g) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q);
    });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Fiches pratiques</Text>
      <Text style={styles.subtitle}>
        Des guides pas-à-pas pour tes démarches du quotidien.
      </Text>

      {/* Barre de recherche */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍  Rechercher une fiche…"
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {ALL_CATEGORIES.map((cat) => {
          const isActive = filter === cat;
          const label = cat === 'all' ? '📚 Tout' : `${GUIDE_CATEGORIES[cat].emoji} ${GUIDE_CATEGORIES[cat].label}`;
          return (
            <TouchableOpacity role="radio" aria-checked={isActive}
              key={cat}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(cat)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filtered.map((guide) => {
        return (
          <TouchableOpacity role="button"
            key={guide.id}
            style={styles.guideCard}
            onPress={() => navigation.navigate('GuideDetail', { guideId: guide.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.guideEmoji}>{guide.emoji}</Text>
            <View style={styles.guideText}>
              <View style={styles.titleRow}>
                <Text style={styles.guideTitle}>{guide.title}</Text>
              </View>
              <Text style={styles.guideSummary}>{guide.summary}</Text>
              <Text style={styles.guideSteps}>{guide.steps.length} étapes</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  searchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterRow: { marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: colors.white, fontWeight: '600' },
  guideCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  guideEmoji: { fontSize: 32, marginRight: 14 },
  guideText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  guideTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  guideSummary: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  guideSteps: { fontSize: 11, color: colors.primaryLight, marginTop: 4, fontWeight: '600' },
  arrow: { fontSize: 24, color: colors.textMuted, marginLeft: 8 },
});
