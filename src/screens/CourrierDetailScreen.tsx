import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile } from '../types';
import { courriers } from '../data/courriers';
import { loadProfile } from '../utils/storage';
import { trackAction } from '../utils/gamification';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CourrierDetail'>;

function formatDateFR(date: Date): string {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function CourrierDetailScreen({ route }: Props) {
  const courrier = courriers.find((c) => c.id === route.params.courrierId);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  const getPersonalizedTemplate = (): string => {
    if (!courrier) return '';
    let text = courrier.template;
    if (profile?.firstName) {
      text = text.replace(/\[VOTRE NOM\]/g, profile.firstName);
    }
    text = text.replace(/\[DATE\]/g, formatDateFR(new Date()));
    return text;
  };

  if (!courrier) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted }}>Modèle introuvable</Text>
      </View>
    );
  }

  const handleCopy = async () => {
    const personalizedText = getPersonalizedTemplate();

    if (Platform.OS === 'web') {
      // 1. Clipboard API (nécessite HTTPS ou localhost)
      let success = false;
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(personalizedText);
          success = true;
        }
      } catch { /* fall through */ }

      // 2. Fallback execCommand pour les contextes HTTP (test local via IP)
      if (!success) {
        try {
          const el = document.createElement('textarea');
          el.value = personalizedText;
          el.style.position = 'fixed';
          el.style.opacity = '0';
          document.body.appendChild(el);
          el.focus();
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        } catch { /* ignore — l'utilisateur peut copier manuellement */ }
      }
    }
    // Sur native (iOS/Android), pas de clipboard natif sans module tiers :
    // le bouton donne quand même le feedback visuel et l'user sélectionne manuellement

    setCopied(true);
    trackAction('courrier');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{courrier.emoji}</Text>
        <Text style={styles.title}>{courrier.title}</Text>
        <Text style={styles.desc}>{courrier.description}</Text>
      </View>

      <View style={styles.templateCard}>
        <Text style={styles.templateText}>{getPersonalizedTemplate()}</Text>
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>💡 Comment utiliser ce modèle</Text>
        <Text style={styles.helpText}>
          1. Copie le texte avec le bouton ci-dessous{'\n'}
          2. Colle-le dans un email ou un document Word{'\n'}
          3. Remplace les [ÉLÉMENTS EN MAJUSCULES] par tes infos{'\n'}
          4. Envoie par email ou courrier recommandé (selon le cas)
        </Text>
      </View>

      <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
        <Text style={styles.copyText}>
          {copied ? '✅ Copié !' : '📋 Copier le modèle'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  emoji: { fontSize: 48, marginBottom: spacing.sm },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  desc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  templateCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  templateText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  helpCard: {
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  helpTitle: { fontSize: 14, fontWeight: '600', color: colors.primaryLight, marginBottom: 6 },
  helpText: { fontSize: 13, color: colors.primaryLight, lineHeight: 22 },
  copyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
  },
  copyText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});
