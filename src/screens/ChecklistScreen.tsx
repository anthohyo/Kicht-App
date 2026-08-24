import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ChecklistItem } from '../types';
import { getChecklistItems } from '../data/checklistItems';
import { saveChecklist, loadChecklist, loadProfile } from '../utils/storage';
import ChecklistItemRow from '../components/ChecklistItemRow';
import { colors, radius, spacing } from '../theme';

export default function ChecklistScreen() {
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    Promise.all([loadChecklist(), loadProfile()]).then(([saved, profile]) => {
      // La liste sauvegardée prime — elle porte la progression de l'utilisateur.
      setItems(saved && saved.length > 0 ? saved : getChecklistItems(profile));
    });
  }, []);

  useEffect(() => {
    // Ne jamais écraser la liste sauvegardée par le tableau vide du premier rendu.
    if (items.length > 0) saveChecklist(items);
  }, [items]);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const doneCount = items.filter((i) => i.checked).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChecklistItemRow item={item} onToggle={handleToggle} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mon premier appart</Text>
            <Text style={styles.headerSub}>
              {doneCount} / {items.length} étapes complétées
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` },
                ]}
              />
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 32,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
});
