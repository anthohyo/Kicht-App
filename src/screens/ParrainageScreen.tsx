import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Share, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing } from '../theme';
import { loadProfile } from '../utils/storage';

const REFERRAL_CODE_KEY = '@kichtapp_referral_code';
const REFERRAL_COUNT_KEY = '@kichtapp_referral_count';

const PALIERS = [
  { count: 1, reward: '1 mois Premium', months: 1 },
  { count: 3, reward: '3 mois Premium', months: 3 },
  { count: 5, reward: '6 mois Premium + badge Parrain·e d\'élite 🎩', months: 6 },
];

export default function ParrainageScreen() {
  const [code, setCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    initCode();
    loadCount();
  }, []);

  const initCode = async () => {
    const existing = await AsyncStorage.getItem(REFERRAL_CODE_KEY);
    if (existing) {
      setCode(existing);
      return;
    }
    const profile = await loadProfile();
    const firstName = profile?.firstName ?? 'USER';
    const prefix = firstName.toUpperCase().slice(0, 4);
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const generated = `PARRAIN-${prefix}-${suffix}`;
    await AsyncStorage.setItem(REFERRAL_CODE_KEY, generated);
    setCode(generated);
  };

  const loadCount = async () => {
    const raw = await AsyncStorage.getItem(REFERRAL_COUNT_KEY);
    setReferralCount(raw ? parseInt(raw, 10) : 0);
  };

  const handleCopy = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        // fallback silent
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareText = () =>
    `Salut ! J'utilise KichtApp pour gérer mon budget et mes démarches admin. C'est vraiment utile pour les jeunes 🎯\n\nUtilise mon code ${code} pour avoir 1 mois Premium gratuit !\n\nTélécharge l'app : https://kichtapp.fr`;

  const handleShare = async () => {
    const text = getShareText();
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'KichtApp — Parrainage', text });
          return;
        } catch {
          // fallback to clipboard
        }
      }
      try {
        await navigator.clipboard.writeText(text);
        Alert.alert('Copié !', 'Le texte de partage a été copié dans le presse-papier.');
      } catch {
        Alert.alert('Partage', text);
      }
    } else {
      try {
        await Share.share({ message: text });
      } catch {
        // user cancelled
      }
    }
  };

  const handleSimulate = async () => {
    const newCount = referralCount + 1;
    setReferralCount(newCount);
    await AsyncStorage.setItem(REFERRAL_COUNT_KEY, String(newCount));
  };

  // Calcul de la progression vers le prochain palier
  const nextPalier = PALIERS.find((p) => p.count > referralCount);
  const prevPalierCount = PALIERS.filter((p) => p.count <= referralCount).slice(-1)[0]?.count ?? 0;
  const progressMax = nextPalier ? nextPalier.count : PALIERS[PALIERS.length - 1].count;
  const progressVal = Math.min(referralCount, progressMax);
  const progressRatio = progressMax > 0 ? progressVal / progressMax : 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🤝</Text>
        <Text style={styles.headerTitle}>Parraine tes amis</Text>
        <Text style={styles.headerSubtitle}>
          Toi et ton ami obtenez 1 mois Premium offert chacun
        </Text>
      </View>

      {/* Card Ton code */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ton code de parrainage</Text>
        {code ? (
          <Text style={styles.codeText}>{code}</Text>
        ) : (
          <Text style={styles.codeLoading}>Génération en cours…</Text>
        )}
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleCopy} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>{copied ? '✅ Copié !' : '📋 Copier le code'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleShare} activeOpacity={0.8}>
            <Text style={styles.btnSecondaryText}>📤 Partager</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Comment ça marche */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comment ça marche ?</Text>
        <Step number="1️⃣" text="Tu partages ton code à un ami" />
        <Step number="2️⃣" text="Il l'utilise à l'inscription → il reçoit 1 mois Premium" />
        <Step number="3️⃣" text="Toi aussi tu reçois 1 mois Premium offert" />
      </View>

      {/* Card Tes filleuls */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tes filleuls</Text>
        <Text style={styles.filleulCount}>
          {referralCount} ami{referralCount > 1 ? 's' : ''} parrainé{referralCount > 1 ? 's' : ''}
        </Text>

        {/* Barre de progression */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{prevPalierCount}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { flex: progressRatio }]} />
          </View>
          <Text style={styles.progressLabel}>{progressMax}</Text>
        </View>
        {nextPalier ? (
          <Text style={styles.progressHint}>
            Encore {nextPalier.count - referralCount} filleul{nextPalier.count - referralCount > 1 ? 's' : ''} pour{' '}
            {nextPalier.reward}
          </Text>
        ) : (
          <Text style={styles.progressHint}>🎉 Tu as atteint le palier maximum !</Text>
        )}

        {/* Bouton de test / démo */}
        <TouchableOpacity style={[styles.btn, styles.btnDemo]} onPress={handleSimulate} activeOpacity={0.8}>
          <Text style={styles.btnDemoText}>Simuler un parrainage +</Text>
        </TouchableOpacity>
      </View>

      {/* Card Avantages */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Récompenses</Text>
        {PALIERS.map((palier) => (
          <View key={palier.count} style={styles.palierRow}>
            <View style={[
              styles.palierBadge,
              referralCount >= palier.count && styles.palierBadgeActive,
            ]}>
              <Text style={styles.palierBadgeText}>{palier.count}</Text>
            </View>
            <View style={styles.palierInfo}>
              <Text style={styles.palierCountText}>
                {palier.count} filleul{palier.count > 1 ? 's' : ''}
              </Text>
              <Text style={styles.palierReward}>{palier.reward}</Text>
            </View>
            {referralCount >= palier.count && (
              <Text style={styles.palierCheck}>✅</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <View style={stepStyles.row}>
      <Text style={stepStyles.number}>{number}</Text>
      <Text style={stepStyles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  headerEmoji: { fontSize: 56, marginBottom: spacing.sm },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },

  codeText: {
    fontSize: 28, fontWeight: 'bold', letterSpacing: 4, color: colors.primary,
    textAlign: 'center', marginVertical: spacing.md,
  },
  codeLoading: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: spacing.xs },
  btn: { flex: 1, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  btnSecondary: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  btnSecondaryText: { color: colors.text, fontWeight: '600', fontSize: 14 },

  filleulCount: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  progressLabel: { fontSize: 12, color: colors.textMuted, width: 20, textAlign: 'center' },
  progressBarBg: {
    flex: 1, height: 8, backgroundColor: colors.surface, borderRadius: radius.full, overflow: 'hidden',
    flexDirection: 'row',
  },
  progressBarFill: { backgroundColor: colors.primary, borderRadius: radius.full },
  progressHint: { fontSize: 12, color: colors.primaryLight, marginBottom: spacing.sm },

  btnDemo: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, marginTop: spacing.xs },
  btnDemoText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },

  palierRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  palierBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  palierBadgeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  palierBadgeText: { fontSize: 12, fontWeight: 'bold', color: colors.text },
  palierInfo: { flex: 1 },
  palierCountText: { fontSize: 13, fontWeight: '600', color: colors.text },
  palierReward: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  palierCheck: { fontSize: 18 },
});

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: 12 },
  number: { fontSize: 22 },
  text: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20, paddingTop: 2 },
});
