import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChecklistItem } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  item: ChecklistItem;
  onToggle: (id: string) => void;
}

export default function ChecklistItemRow({ item, onToggle }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onToggle(item.id)}
      activeOpacity={0.7}
      // La coche est purement visuelle : sans ces attributs, un lecteur d'écran
      // annonce le texte de l'étape sans jamais dire si elle est faite ou non.
      role="checkbox"
      aria-checked={item.checked}
      aria-label={item.label}
      accessibilityHint={item.checked ? 'Appuie pour marquer comme à faire' : 'Appuie pour marquer comme fait'}
    >
      <View style={[styles.checkbox, item.checked && styles.checked]} aria-hidden>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.label, item.checked && styles.labelChecked]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  labelChecked: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
});
