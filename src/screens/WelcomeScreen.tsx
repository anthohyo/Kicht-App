import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const ENTRY_POINTS = [
  {
    emoji: '🎯',
    title: 'Découvre tes aides',
    desc: 'APL, bourse CROUS, prime d\'activité, Visale… la plupart des jeunes ratent des centaines d\'euros par mois.',
    color: 'rgba(16, 185, 129, 0.10)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  {
    emoji: '📋',
    title: 'Tes prochaines démarches, dans l\'ordre',
    desc: 'Pas besoin de tout savoir. L\'app te dit juste quoi faire maintenant, étape par étape.',
    color: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
  },
  {
    emoji: '💬',
    title: 'Pose tes questions',
    desc: 'Le Parrain répond à tout : impôts, fiche de paie, premier appart, contrat de travail.',
    color: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.25)',
  },
];

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>💸</Text>
          <Text style={styles.appName}>KichtApp</Text>
          <Text style={styles.tagline}>
            Ne passe plus à côté{'\n'}de ton argent
          </Text>
          <Text style={styles.social}>
            Gratuit · 2 minutes · Sans inscription
          </Text>
        </View>

        {/* 3 blocs d'entrée */}
        {ENTRY_POINTS.map((f) => (
          <View
            key={f.title}
            style={[styles.featureCard, { backgroundColor: f.color, borderColor: f.border }]}
          >
            <Text style={styles.featureEmoji} aria-hidden>{f.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}

        {/* Le chiffre qui justifie l'app.
            Ici se trouvait un témoignage inventé (« Inès, 22 ans ») : un avis
            fabriqué présenté comme réel est interdit, et celui-ci citait en plus
            l'aide au permis, supprimée en février 2026. Tant qu'aucun utilisateur
            réel n'a donné son accord pour être cité, on s'en tient à un fait sourcé. */}
        <View style={styles.proofCard}>
          <Text style={styles.proofChiffre}>1 foyer sur 3</Text>
          <Text style={styles.proofText}>
            qui a droit au RSA ne le demande pas. Le premier motif n'est pas l'orgueil :
            c'est qu'on ne sait pas qu'on y a droit. C'est exactement ce que cette app
            cherche à réparer.
          </Text>
          <Text style={styles.proofAuthor}>
            Source : DREES, « Non-recours au RSA », fin 2021 (33 à 37 % des foyers éligibles)
          </Text>
        </View>

      </ScrollView>

      {/* CTA fixe en bas */}
      <View style={styles.footer}>
        <TouchableOpacity role="button"
          style={styles.cta}
          onPress={async () => {
            await AsyncStorage.setItem('@kichtapp_welcomed', '1');
            navigation.replace('Onboarding');
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Trouver l'argent que je rate →</Text>
        </TouchableOpacity>
        <Text style={styles.ctaHint}>2 minutes · 4 questions · 0 inscription</Text>
        {/* Nouveau téléphone : restaurer avant l'onboarding, pas après l'avoir refait. */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Confidentialite')}
          style={styles.restaurerLien}
          role="link"
          aria-label="J'ai déjà une sauvegarde, la restaurer"
        >
          <Text style={styles.restaurerTexte}>J'ai déjà une sauvegarde</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 20 },

  // Hero
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  logo: { fontSize: 64, marginBottom: spacing.sm },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  social: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Feature cards
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  featureEmoji: { fontSize: 28, marginTop: 2 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  featureDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  // Social proof
  proofCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  proofChiffre: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryLight,
    lineHeight: 30,
    marginBottom: 4,
  },
  proofText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  proofAuthor: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },

  // Footer CTA
  footer: {
    padding: spacing.lg,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaText: { color: colors.white, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  ctaHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  restaurerLien: { alignSelf: 'center', marginTop: 10, paddingVertical: 8, paddingHorizontal: 12 },
  restaurerTexte: { fontSize: 13, color: colors.primaryLight, fontWeight: '600', textDecorationLine: 'underline' },
});
