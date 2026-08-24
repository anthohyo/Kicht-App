import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile, UserProgress } from '../types';
import { loadProfile, loadProgress } from '../utils/storage';
import { colors, radius, spacing } from '../theme';

interface Feature {
  key: string;
  emoji: string;
  title: string;
  desc: string;
  badge?: string;
}

const SECTIONS: { title: string; features: Feature[] }[] = [
  {
    title: '💰 Finances',
    features: [
      { key: 'Aides',            emoji: '🎯', title: 'Simulateur d\'aides',   desc: 'APL, bourse, prime d\'activité, Visale…', badge: '⭐ Star' },
      { key: 'SimulateurEpargne',emoji: '📈', title: 'Simulateur d\'épargne', desc: 'Combien tu auras dans 10 ans ?' },
    ],
  },
  {
    title: '📋 Démarches',
    features: [
      { key: 'Guides',       emoji: '📖', title: 'Fiches pratiques',        desc: 'Guides pas-à-pas pour tes démarches' },
      { key: 'Courriers',    emoji: '📝', title: 'Modèles de courriers',    desc: 'Templates prêts à copier-coller' },
      { key: 'Checklist',    emoji: '🏠', title: 'Checklist premier appart', desc: 'Ne rien oublier pour emménager' },
      { key: 'Agenda',       emoji: '📅', title: 'Mon agenda',              desc: 'Deadlines + tes paiements à venir' },
      { key: 'MesDocuments', emoji: '🗂️', title: 'Mes documents clés',      desc: 'N° fiscal, CAF, IBAN… en un endroit' },
    ],
  },
  {
    title: '🧠 Apprendre',
    features: [
      { key: 'Quiz',     emoji: '🧠', title: 'Quiz impôts & aides',     desc: 'Teste tes connaissances' },
      { key: 'Parcours', emoji: '🗺️', title: 'Parcours thématiques',    desc: 'Un parcours adapté à ta situation' },
      { key: 'Badges',   emoji: '🏆', title: 'Mes badges',              desc: 'Ta progression et tes récompenses' },
    ],
  },
  {
    title: '🤝 Communauté',
    features: [
      { key: 'Parrainage', emoji: '🎁', title: 'Parrainage', desc: 'Invite un ami et gagne 1 mois Premium offert' },
    ],
  },
];

export default function ExplorerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([loadProfile(), loadProgress()]).then(([p, pr]) => {
        setProfile(p);
        setProgress(pr);
      });
    }, [])
  );

  const firstName = profile?.firstName
    ? profile.firstName.charAt(0).toUpperCase() + profile.firstName.slice(1)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header profil */}
      {profile && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{firstName}</Text>
              <Text style={styles.headerSub}>
                {profile.isPremium ? '👑 Premium' : '🆓 Gratuit'}
                {profile.ville ? ` · 📍 ${profile.ville}` : ''}
              </Text>
            </View>
          </View>
          {progress && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsValue}>{progress.points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          )}
        </View>
      )}

      {/* Objectif si défini */}
      {profile?.savingsGoal && (
        <TouchableOpacity
          style={styles.goalCard}
          onPress={() => navigation.navigate('SimulateurEpargne')}
          activeOpacity={0.8}
        >
          <Text style={styles.goalEmoji}>{profile.savingsGoal.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalTitle}>{profile.savingsGoal.label}</Text>
            <Text style={styles.goalSub}>Objectif : {profile.savingsGoal.amount} € — voir la simulation →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Sections features */}
      {SECTIONS.map((section) => (
        <View key={section.title}>
          <Text style={styles.sectionHeader}>{section.title}</Text>
          {section.features.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={styles.card}
              onPress={() => navigation.navigate(f.key as any)}
              activeOpacity={0.7}
            >
              <View style={styles.iconBubble}>
                <Text style={styles.iconText}>{f.emoji}</Text>
              </View>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{f.title}</Text>
                  {f.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{f.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.desc}>{f.desc}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: colors.white },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  pointsBadge: { backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
  pointsValue: { fontSize: 16, fontWeight: '700', color: colors.warning },
  pointsLabel: { fontSize: 10, color: colors.warning },

  // Objectif
  goalCard: { backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  goalEmoji: { fontSize: 28 },
  goalTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  goalSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  // Sections
  sectionHeader: { fontSize: 13, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  iconBubble: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: 'rgba(124,58,237,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  iconText: { fontSize: 22 },
  textContainer: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  badge: { backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  badgeText: { fontSize: 10, fontWeight: '600', color: colors.success },
  desc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 24, color: colors.textMuted, marginLeft: spacing.sm },
});
