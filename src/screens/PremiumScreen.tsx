import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadProfile, saveProfile } from '../utils/storage';
import { colors, radius, spacing } from '../theme';

const PREMIUM_FEATURES = [
  {
    emoji: '🤖',
    title: 'Parrain IA — réponses intelligentes',
    desc: 'Pose n\'importe quelle question, reçois une réponse personnalisée à ta situation exacte. Pas de réponse générique.',
  },
  {
    emoji: '📝',
    title: 'Tous les modèles de courriers',
    desc: '9 modèles au total : résiliation, contestation, préavis, quittance… prêts à copier-coller.',
  },
  {
    emoji: '📖',
    title: 'Tous les guides pratiques',
    desc: 'Guides avancés : investissement, optimisation fiscale, négociation de salaire…',
  },
  {
    emoji: '🔔',
    title: 'Alertes deadlines personnalisées',
    desc: 'Rappels intelligents : bourse CROUS, déclaration d\'impôts, renouvellement APL… selon ton profil.',
  },
  {
    emoji: '📊',
    title: 'Bilan mensuel détaillé',
    desc: 'Analyse complète de tes dépenses avec conseils personnalisés chaque mois.',
  },
];

export default function PremiumScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // MVP : accès premium immédiat (Stripe arrive dans une prochaine version)
    const msg = 'Le paiement arrive bientôt ! Pour l\'instant, on t\'offre l\'accès Premium gratuitement pour tester 🎉';
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Bientôt disponible', msg);
    }
    const profile = await loadProfile();
    if (profile) {
      await saveProfile({ ...profile, isPremium: true });
    }
    setLoading(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.crown}>✨</Text>
        <Text style={styles.title}>KichtApp Premium</Text>
        <Text style={styles.subtitle}>
          Le Parrain qui te connaît vraiment — et qui répond à tout.
        </Text>
      </View>

      {/* Price */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>2,99 €</Text>
          <Text style={styles.priceUnit}>/mois</Text>
        </View>
        <Text style={styles.priceContext}>Moins qu'un café. Plus utile qu'un rendez-vous à la banque.</Text>
      </View>

      {/* Features */}
      <Text style={styles.sectionTitle}>Ce que tu débloque</Text>
      {PREMIUM_FEATURES.map((f, i) => (
        <View key={i} style={styles.featureRow}>
          <Text style={styles.featureEmoji}>{f.emoji}</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        </View>
      ))}

      {/* Comparison table */}
      <View style={styles.compCard}>
        <Text style={styles.compTitle}>Gratuit vs Premium</Text>
        <View style={styles.compHeader}>
          <Text style={[styles.compLabel, { flex: 3 }]} />
          <Text style={styles.compHead}>Gratuit</Text>
          <Text style={styles.compHead}>Premium</Text>
        </View>
        {[
          { label: 'Budget & transactions', free: true, premium: true },
          { label: 'Simulateur d\'aides', free: true, premium: true },
          { label: 'Parrain (réponses guides)', free: true, premium: true },
          { label: '3 courriers essentiels', free: true, premium: true },
          { label: 'Guides de base', free: true, premium: true },
          { label: '🤖 Parrain IA', free: false, premium: true },
          { label: 'Tous les courriers', free: false, premium: true },
          { label: 'Tous les guides', free: false, premium: true },
          { label: 'Alertes deadlines', free: false, premium: true },
          { label: 'Bilan mensuel détaillé', free: false, premium: true },
        ].map((row, i) => (
          <View key={i} style={styles.compRow}>
            <Text style={styles.compLabel}>{row.label}</Text>
            <Text style={[styles.compVal, !row.free && styles.compValLocked]}>{row.free ? '✅' : '🔒'}</Text>
            <Text style={styles.compVal}>✅</Text>
          </View>
        ))}
      </View>

      {/* Social proof */}
      <View style={styles.proofCard}>
        <Text style={styles.proofText}>
          💬 "J'ai trouvé 180€ d'APL que je touchais pas — l'app s'est rentabilisée en 2 minutes."
        </Text>
        <Text style={styles.proofAuthor}>— Lucas, 19 ans, étudiant à Lyon</Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaBtn, loading && { opacity: 0.7 }]}
        onPress={handleSubscribe}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>{loading ? 'Chargement…' : 'Passer Premium — 2,99€/mois'}</Text>
      </TouchableOpacity>
      <Text style={styles.legal}>Annulable à tout moment · Paiement sécurisé</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  crown: { fontSize: 52, marginBottom: spacing.sm },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  priceCard: {
    backgroundColor: colors.primaryGlow, borderRadius: radius.xl, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.lg,
    borderWidth: 2, borderColor: colors.primary,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 40, fontWeight: 'bold', color: colors.primary },
  priceUnit: { fontSize: 16, color: colors.primaryLight, marginLeft: 4 },
  priceContext: { fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center', fontStyle: 'italic' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card,
    borderRadius: radius.md, padding: 14, marginBottom: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  featureEmoji: { fontSize: 24, marginRight: 12, marginTop: 1 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  featureDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
  compCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    marginTop: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  compTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  compHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4 },
  compHead: { flex: 1, fontSize: 12, fontWeight: '700', color: colors.textMuted, textAlign: 'center' },
  compRow: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  compLabel: { flex: 3, fontSize: 13, color: colors.textSecondary },
  compVal: { flex: 1, fontSize: 14, textAlign: 'center' },
  compValLocked: { opacity: 0.5 },
  proofCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  proofText: { fontSize: 14, color: colors.text, fontStyle: 'italic', lineHeight: 21 },
  proofAuthor: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  ctaBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: 18,
    alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  ctaText: { color: colors.white, fontWeight: 'bold', fontSize: 17 },
  legal: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
