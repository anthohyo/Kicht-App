import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile } from '../types';
import { courriers, COURRIER_CATEGORIES } from '../data/courriers';
import { colors, radius, spacing } from '../theme';
import { loadProfile } from '../utils/storage';

type CatKey = keyof typeof COURRIER_CATEGORIES;

export default function CourriersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<CatKey | 'all'>('all');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadProfile().then(setProfile);
    }, [])
  );

  const filtered = filter === 'all' ? courriers : courriers.filter((c) => c.category === filter);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Modèles de courriers</Text>
      <Text style={styles.subtitle}>
        Des modèles prêts à copier-coller pour tes démarches.
      </Text>
      <Text style={styles.freeNote}>
        Tous les modèles sont gratuits — copie, complète, envoie.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity role="radio" aria-checked={filter === 'all'}
          style={[styles.chip, filter === 'all' && styles.chipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>📄 Tout</Text>
        </TouchableOpacity>
        {(Object.keys(COURRIER_CATEGORIES) as CatKey[]).map((cat) => (
          <TouchableOpacity role="radio" aria-checked={filter === cat}
            key={cat}
            style={[styles.chip, filter === cat && styles.chipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>
              {COURRIER_CATEGORIES[cat].emoji} {COURRIER_CATEGORIES[cat].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map((c) => {
        return (
          <TouchableOpacity role="button"
            key={c.id}
            style={styles.card}
            onPress={() => navigation.navigate('CourrierDetail', { courrierId: c.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.cardEmoji}>{c.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.description}</Text>
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 4 },
  freeNote: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  filterRow: { marginBottom: spacing.md },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 24, color: colors.textMuted, marginLeft: 8 },
});
