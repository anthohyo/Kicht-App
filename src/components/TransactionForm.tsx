import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Transaction, TransactionType, Category } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
}

const EXPENSE_CATEGORIES: Category[] = ['Loyer', 'Courses', 'Transport', 'Sorties', 'Abonnements', 'Électricité', 'Santé', 'Autres'];
const INCOME_CATEGORIES: Category[] = ['Salaire', 'Aides', 'Autres'];

export default function TransactionForm({ visible, onClose, onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<TransactionType>('Dépense');
  const [category, setCategory] = useState<Category>('Autres');
  const [error, setError] = useState('');

  const categories = type === 'Dépense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = () => {
    setError('');

    // Validation du montant
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!amount.trim()) {
      setError('Entre un montant');
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Le montant doit être un nombre positif');
      return;
    }

    onAdd({
      id: Date.now().toString(),
      amount: parsed,
      label: label.trim() || category, // Fallback sur la catégorie si pas de label
      type,
      category,
      date: new Date().toISOString(),
    });

    // Reset du formulaire
    setAmount('');
    setLabel('');
    setType('Dépense');
    setCategory('Autres');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setError('');
    setAmount('');
    setLabel('');
    onClose();
  };

  const isValid = amount.trim() && !isNaN(parseFloat(amount.replace(',', '.'))) && parseFloat(amount.replace(',', '.')) > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        {/* Backdrop */}
        <Pressable role="button" aria-label="Fermer sans enregistrer" style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>Nouvelle transaction</Text>

          {/* Type toggle */}
          <View style={styles.typeRow}>
            {(['Dépense', 'Revenu'] as TransactionType[]).map((t) => (
              <TouchableOpacity role="radio" aria-checked={type === t}
                key={t}
                style={[
                  styles.typeButton,
                  type === t && (t === 'Dépense' ? styles.typeExpense : styles.typeIncome),
                ]}
                onPress={() => {
                  setType(t);
                  setCategory('Autres');
                }}
              >
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                  {t === 'Dépense' ? '📉 Dépense' : '📈 Revenu'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Label / description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Courses Carrefour, loyer mars…"
            placeholderTextColor={colors.textMuted}
            value={label}
            onChangeText={setLabel}
          />

          {/* Montant */}
          <Text style={styles.label}>Montant (€)</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(text) => {
              // N'autoriser que chiffres, virgule et point
              const cleaned = text.replace(/[^0-9.,]/g, '');
              setAmount(cleaned);
              if (error) setError('');
            }}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Catégorie */}
          <Text style={styles.label}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories.map((c) => (
              <TouchableOpacity role="radio" aria-checked={category === c}
                key={c}
                style={[styles.catChip, category === c && styles.catChipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.catText, category === c && styles.catTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity role="button" style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity role="button"
              style={[styles.addBtn, !isValid && { opacity: 0.4 }]}
              onPress={handleSubmit}
            >
              <Text style={styles.addText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeExpense: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
  },
  typeIncome: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  typeText: {
    fontWeight: '600',
    color: colors.textMuted,
    fontSize: 14,
  },
  typeTextActive: {
    color: colors.text,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
    marginBottom: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  catScroll: {
    marginBottom: spacing.lg,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  catTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: 16,
  },
  addBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  addText: {
    fontWeight: 'bold',
    color: colors.white,
    fontSize: 16,
  },
});
