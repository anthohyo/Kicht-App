import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Platform, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing } from '../theme';

const STORAGE_KEY = '@kichtapp_documents';

interface DocField {
  id: string;
  label: string;
  emoji: string;
  placeholder: string;
  hint?: string;
}

const DOC_SECTIONS: { title: string; emoji: string; fields: DocField[] }[] = [
  {
    title: 'Impôts',
    emoji: '🏛️',
    fields: [
      { id: 'num_fiscal', label: 'Numéro fiscal', emoji: '🔢', placeholder: '13 chiffres', hint: 'Sur ta déclaration ou ton avis d\'imposition' },
      { id: 'num_declaration', label: 'Numéro de déclaration en ligne', emoji: '🖥️', placeholder: 'Sur impots.gouv.fr' },
    ],
  },
  {
    title: 'Sécurité sociale',
    emoji: '🏥',
    fields: [
      { id: 'num_secu', label: 'N° de sécurité sociale', emoji: '💳', placeholder: '15 chiffres — sur ta carte vitale' },
      { id: 'cpam', label: 'CPAM rattachement', emoji: '🏢', placeholder: 'Ex : CPAM de Paris' },
      { id: 'num_ameli', label: 'N° dossier Ameli', emoji: '📋', placeholder: 'Sur ameli.fr' },
    ],
  },
  {
    title: 'CAF / Aides',
    emoji: '🤝',
    fields: [
      { id: 'num_caf', label: 'N° allocataire CAF', emoji: '🔑', placeholder: '7 chiffres', hint: 'Sur caf.fr ou ton attestation CAF' },
      { id: 'num_crous', label: 'N° dossier CROUS', emoji: '🎓', placeholder: 'Pour la bourse' },
    ],
  },
  {
    title: 'Banque & Logement',
    emoji: '🏦',
    fields: [
      { id: 'iban', label: 'IBAN', emoji: '💳', placeholder: 'FR76 xxxx xxxx…', hint: 'Sur ton RIB — nécessaire pour les virements aides' },
      { id: 'bic', label: 'BIC', emoji: '🌐', placeholder: 'Ex : BNPAFRPP' },
      { id: 'ref_bail', label: 'Référence bail / contrat', emoji: '🏠', placeholder: 'Chez ton propriétaire' },
      { id: 'ref_visale', label: 'N° garantie Visale', emoji: '🔐', placeholder: 'Si tu as une garantie Visale' },
    ],
  },
  {
    title: 'Notes libres',
    emoji: '📝',
    fields: [
      { id: 'notes', label: 'Notes diverses', emoji: '✏️', placeholder: 'Numéros de référence, contacts utiles…' },
    ],
  },
];

// Tous les champs aplatis pour calcul des compteurs
const ALL_FIELDS: DocField[] = DOC_SECTIONS.flatMap((s) => s.fields);

export default function MesDocumentsScreen() {
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setDocs(JSON.parse(raw));
    });
  }, []);

  const handleChange = (id: string, val: string) => {
    setDocs((prev) => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Compteur de champs remplis
  const filledCount = ALL_FIELDS.filter((f) => docs[f.id]?.trim()).length;
  const totalCount = ALL_FIELDS.length;

  // Export
  const buildExportText = (): string => {
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const sep = '═══════════════════════════════';
    const lines: string[] = [
      sep,
      'MES DOCUMENTS CLÉS — KichtApp',
      `Exporté le ${today}`,
      sep,
      '',
    ];

    for (const section of DOC_SECTIONS) {
      lines.push(section.title.toUpperCase());
      for (const field of section.fields) {
        const val = docs[field.id]?.trim() || 'non renseigné';
        lines.push(`• ${field.label} : ${val}`);
      }
      lines.push('');
    }

    lines.push(sep);
    lines.push('⚠️ Document confidentiel — ne pas partager');
    lines.push(sep);

    return lines.join('\n');
  };

  const handleExport = () => {
    const text = buildExportText();
    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mes-documents-kichtapp.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        Alert.alert('Export', text);
      }
    } else {
      Alert.alert('Mes documents', text);
    }
  };

  // Effacer tout
  const doClear = async () => {
    setDocs({});
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSaved(false);
  };

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Effacer tous les champs ? Cette action est irréversible.')) doClear();
    } else {
      Alert.alert('Tout effacer', 'Effacer tous les champs ? Cette action est irréversible.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: doClear },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mes documents clés</Text>
      <Text style={styles.subtitle}>
        Tes numéros importants en un seul endroit. Stocké uniquement sur ton téléphone.
      </Text>
      <Text style={styles.fieldCounter}>
        {filledCount} / {totalCount} champs remplis
      </Text>

      <View style={styles.warningCard}>
        <Text style={styles.warningIcon}>🔒</Text>
        <Text style={styles.warningText}>
          Ne stocke pas tes mots de passe ici. Ces infos restent sur ton appareil et ne sont jamais envoyées en ligne.
        </Text>
      </View>

      {DOC_SECTIONS.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.sectionTitle}>{section.emoji} {section.title}</Text>
          {section.fields.map((field) => (
            <View key={field.id} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{field.emoji} {field.label}</Text>
              {field.hint && <Text style={styles.fieldHint}>{field.hint}</Text>}
              <TextInput
                style={[styles.fieldInput, field.id === 'notes' && styles.fieldInputMulti]}
                value={docs[field.id] || ''}
                onChangeText={(v) => handleChange(field.id, v)}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                multiline={field.id === 'notes'}
                numberOfLines={field.id === 'notes' ? 4 : 1}
              />
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>{saved ? '✅ Sauvegardé !' : '💾 Sauvegarder'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.8}>
        <Text style={styles.exportBtnText}>📤 Exporter mes documents</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll} activeOpacity={0.8}>
        <Text style={styles.clearBtnText}>🔄 Tout effacer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 4 },
  fieldCounter: { fontSize: 12, color: colors.primaryLight, marginBottom: spacing.md, fontWeight: '600' },

  warningCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: radius.md, padding: spacing.sm,
    marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  warningIcon: { fontSize: 20 },
  warningText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  fieldWrap: { marginBottom: spacing.sm },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 2 },
  fieldHint: { fontSize: 11, color: colors.textMuted, marginBottom: 4, fontStyle: 'italic' },
  fieldInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 10, fontSize: 14, color: colors.text,
  },
  fieldInputMulti: {
    minHeight: 80, textAlignVertical: 'top',
  },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, padding: 16,
    alignItems: 'center', marginBottom: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  saveBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },

  exportBtn: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 16,
    alignItems: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  exportBtnText: { color: colors.text, fontWeight: '600', fontSize: 15 },

  clearBtn: {
    backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: 16,
    alignItems: 'center', marginBottom: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearBtnText: { color: colors.danger, fontWeight: '600', fontSize: 15 },
});
