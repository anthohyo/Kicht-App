import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserProfile, RootStackParamList } from '../types';
import { loadProfile, saveProfile } from '../utils/storage';
import { simulerAides, AideResult, DERNIERE_MAJ_BAREMES, baremesPerimes } from '../data/aidesData';
import { getAidesLocales, AideLocale } from '../data/aidesLocales';
import BoutonSignaler from '../components/BoutonSignaler';
import { colors, radius, spacing } from '../theme';

// Mapping aide nationale ID → guide ID
const AIDE_TO_GUIDE: Record<string, string> = {
  apl: 'demander-apl',
  css: 'css-mutuelle-gratuite',
  visale: 'premier-appart-demarches',
  bourse: 'declaration-impots',
};

// Extrait le montant principal d'une string "~150 €/mois" → 150
function parseMontant(str?: string): number {
  if (!str) return 0;
  const m = str.match(/(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

// Élision française : "de APL" → "d'APL", "de Bourse" reste "de Bourse"
function deElision(name: string): string {
  const firstChar = name.charAt(0).toUpperCase();
  return ['A', 'E', 'I', 'O', 'U'].includes(firstChar) ? `d'${name}` : `de ${name}`;
}

// Documents courants par aide
const AIDE_DOCS: Record<string, string[]> = {
  apl: ['Bail signé', 'RIB', 'Revenus N-1 (avis d\'imposition ou attestation)'],
  bourse: ['Avis fiscal des parents', 'Certificat de scolarité'],
  prime_activite: ['Bulletins de salaire (3 derniers)', 'RIB', 'Justificatif de domicile'],
  visale: ['Pièce d\'identité', 'Contrat de travail ou convention de stage', 'Bail à signer'],
};

export default function AidesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aides, setAides] = useState<AideResult[]>([]);
  const [aidesLocales, setAidesLocales] = useState<AideLocale[]>([]);
  const [vedetteExpanded, setVedetteExpanded] = useState(false);
  const [expandedSecondaryId, setExpandedSecondaryId] = useState<string | null>(null);
  const [showAllAides, setShowAllAides] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile().then((p) => {
        if (p) {
          setProfile(p);
          const results = simulerAides(p);
          const sorted = [...results].sort((a, b) => {
            const order = { oui: 0, 'peut-etre': 1, non: 2 };
            if (order[a.eligible] !== order[b.eligible]) return order[a.eligible] - order[b.eligible];
            return parseMontant(b.montantEstime) - parseMontant(a.montantEstime);
          });
          setAides(sorted);
          setAidesLocales(getAidesLocales(p.ville, p.departement, p.region, p.status));
        }
      });
    }, [])
  );

  const handleClaim = async (aideId: string) => {
    if (!profile) return;
    const updated = { ...profile, claimedAids: [...(profile.claimedAids ?? []), aideId] };
    await saveProfile(updated);
    setProfile(updated);
    setVedetteExpanded(false);
    const results = simulerAides(updated);
    const sorted = [...results].sort((a, b) => {
      const order = { oui: 0, 'peut-etre': 1, non: 2 };
      if (order[a.eligible] !== order[b.eligible]) return order[a.eligible] - order[b.eligible];
      return parseMontant(b.montantEstime) - parseMontant(a.montantEstime);
    });
    setAides(sorted);
  };

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>Chargement…</Text>
      </View>
    );
  }

  const claimedAids = profile.claimedAids ?? [];
  const actionables = aides
    .filter((a) => a.eligible !== 'non')
    .filter((a) => !claimedAids.includes(a.id));
  const nonEligible = aides.filter((a) => a.eligible === 'non');
  const [vedette, ...secondaires] = actionables;

  // Total mensuel cumulé des aides secondaires (borne basse et haute)
  const totalSecondairesMin = secondaires.reduce((sum, a) => sum + (a.montantMensuelMin ?? 0), 0);
  const totalSecondairesMax = secondaires.reduce((sum, a) => sum + (a.montantMensuelMax ?? 0), 0);

  // Intro centrée sur la vedette
  const firstName = profile.firstName
    ? profile.firstName.charAt(0).toUpperCase() + profile.firstName.slice(1)
    : null;
  const shortVedetteName = vedette?.name.split(' (')[0] ?? '';
  const isEstimated = vedette?.montantEstime?.startsWith('~');
  const friendlyAmount = isEstimated
    ? vedette!.montantEstime!.replace('~', 'environ ')
    : null;
  const introLine = vedette
    ? friendlyAmount
      ? `Tu pourrais toucher ${friendlyAmount} ${deElision(shortVedetteName)}.`
      : `Ta première priorité : ${shortVedetteName}.`
    : 'On n\'a pas trouvé d\'aide évidente — mais ça vaut toujours le coup de vérifier.';

  const ELIGIBLE_BADGE = { label: '✅ Éligible', color: colors.success, bg: colors.successBg };
  const MAYBE_BADGE = { label: '🤔 À vérifier', color: colors.warning, bg: 'rgba(245,158,11,0.12)' };
  const getBadge = (eligible: AideResult['eligible']) =>
    eligible === 'oui' ? ELIGIBLE_BADGE : MAYBE_BADGE;

  const localAides = aidesLocales.filter((a) => a.eligibilite !== 'non-eligible');
  const allHiddenCount = nonEligible.length + localAides.length;

  // Fraîcheur des barèmes — affichée pour que l'utilisateur sache sur quoi il s'appuie
  const majFr = new Date(DERNIERE_MAJ_BAREMES).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Niveau 1 : Une seule promesse ── */}
      <View style={styles.intro}>
        <Text style={styles.introTitle}>
          {vedette
            ? `Bonne nouvelle${firstName ? ` ${firstName}` : ''} !`
            : `Voilà ta situation${firstName ? `, ${firstName}` : ''}.`}
        </Text>
        <Text style={styles.introSub}>{introLine}</Text>
        {vedette && (
          <Text style={styles.introCue}>
            C'est l'aide la plus probable dans ta situation.
          </Text>
        )}
      </View>

      {/* ── Niveau 2 : Une seule action — vedette collapsée par défaut ── */}
      {vedette && (
        <View style={styles.vedetteCard}>
          {/* Header de la carte */}
          <View style={styles.vedetteTop}>
            <Text style={styles.vedetteEmoji} aria-hidden>{vedette.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.vedetteName}>{vedette.name}</Text>
              <View style={styles.vedetteBadgeRow}>
                <View style={[styles.badge, { backgroundColor: getBadge(vedette.eligible).bg }]}>
                  <Text style={[styles.badgeText, { color: getBadge(vedette.eligible).color }]}>
                    {getBadge(vedette.eligible).label}
                  </Text>
                </View>
                {vedette.montantEstime && (
                  <Text style={styles.vedetteMontant}>{vedette.montantEstime}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Description — tronquée si fermé */}
          <Text style={styles.vedetteDesc} numberOfLines={vedetteExpanded ? undefined : 2}>
            {vedette.description}
          </Text>

          {/* Détails — uniquement si ouvert */}
          {vedetteExpanded && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>🚀 Comment l'obtenir</Text>
                {vedette.commentFaire.map((step, i) => (
                  <Text key={i} style={styles.step}>{i + 1}. {step}</Text>
                ))}
              </View>
              {AIDE_DOCS[vedette.id] && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>📎 Documents à préparer</Text>
                  {AIDE_DOCS[vedette.id].map((doc, i) => (
                    <Text key={i} style={styles.step}>• {doc}</Text>
                  ))}
                </View>
              )}
              <View style={styles.vedetteActions}>
                <TouchableOpacity role="link"
                  style={styles.ctaPrimary}
                  onPress={() => Linking.openURL(vedette.lien)}
                >
                  <Text style={styles.ctaPrimaryText}>🔗 {vedette.lienLabel}</Text>
                </TouchableOpacity>
                {AIDE_TO_GUIDE[vedette.id] && (
                  <TouchableOpacity role="button"
                    style={styles.ctaSecondary}
                    onPress={() => navigation.navigate('GuideDetail', { guideId: AIDE_TO_GUIDE[vedette.id] })}
                  >
                    <Text style={styles.ctaSecondaryText}>📖 Fiche pratique</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* CTA principal — expand/collapse */}
          <TouchableOpacity
            style={styles.ctaExpand}
            onPress={() => setVedetteExpanded(!vedetteExpanded)}
            activeOpacity={0.85}
            role="button"
            aria-expanded={vedetteExpanded}
            aria-label={`Voir comment obtenir ${vedette.name}`}
          >
            <Text style={styles.ctaExpandText}>
              {vedetteExpanded ? '▲ Masquer' : 'Voir comment l\'obtenir →'}
            </Text>
          </TouchableOpacity>

          {/* CTA secondaire — déjà obtenue */}
          <TouchableOpacity role="button"
            style={styles.ctaClaimed}
            onPress={() => handleClaim(vedette.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.ctaClaimedText}>✓ Je l'ai déjà</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── CTA chat contextuel ── */}
      {vedette && (
        <TouchableOpacity role="button"
          style={styles.chatCtaCard}
          onPress={async () => {
            await AsyncStorage.setItem(
              '@kichtapp_pending_chat',
              `Je veux m'occuper ${deElision(shortVedetteName)}. Par où je commence concrètement ?`,
            );
            navigation.navigate('Main' as any, { screen: 'Chat' } as any);
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.chatCtaText}>
            💬 On commence par {shortVedetteName} ?
          </Text>
          <Text style={styles.chatCtaArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* ── Niveau 3 : Autres aides — compactes ── */}
      {secondaires.length > 0 && (
        <>
          <View style={styles.totalBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalBannerLabel}>
                TU PEUX AUSSI VÉRIFIER {secondaires.length} AUTRE{secondaires.length > 1 ? 'S' : ''} AIDE{secondaires.length > 1 ? 'S' : ''}
              </Text>
              {totalSecondairesMin > 0 && (
                <Text style={styles.totalBannerAmount}>
                  Potentiel cumulé :{' '}
                  {totalSecondairesMin === totalSecondairesMax
                    ? `~${totalSecondairesMin} €/mois`
                    : `~${totalSecondairesMin} à ${totalSecondairesMax} €/mois`}
                </Text>
              )}
            </View>
          </View>
          {secondaires.map((aide) => {
            const badge = getBadge(aide.eligible);
            const isOpen = expandedSecondaryId === aide.id;
            return (
              // Le bouton de signalement est rendu HORS de la carte : imbriqué
              // dans la zone qui déplie, un appui dessus refermait la carte —
              // et le comportement des touchables imbriqués diffère entre le web
              // et le natif, donc autant ne pas en dépendre.
              <View key={aide.id}>
              <TouchableOpacity role="button"
                style={styles.secondaryCard}
                onPress={() => setExpandedSecondaryId(isOpen ? null : aide.id)}
                activeOpacity={0.8}
              >
                <View style={styles.secondaryTop}>
                  <Text style={styles.secondaryEmoji} aria-hidden>{aide.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.secondaryName}>{aide.name}</Text>
                    {!isOpen && aide.montantEstime && (
                      <Text style={styles.secondaryMontantLine}>{aide.montantEstime}</Text>
                    )}
                  </View>
                  {isOpen && (
                    <View style={[styles.badge, { backgroundColor: badge.bg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  )}
                  <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                </View>

                {isOpen && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.secondaryDesc}>{aide.description}</Text>
                    <Text style={[styles.sectionLabel, { marginTop: 12 }]}>🚀 Comment faire</Text>
                    {aide.commentFaire.map((step, i) => (
                      <Text key={i} style={styles.step}>{i + 1}. {step}</Text>
                    ))}
                    <View style={styles.vedetteActions}>
                      <TouchableOpacity role="link"
                        style={styles.ctaPrimary}
                        onPress={() => Linking.openURL(aide.lien)}
                      >
                        <Text style={styles.ctaPrimaryText}>🔗 {aide.lienLabel}</Text>
                      </TouchableOpacity>
                      {AIDE_TO_GUIDE[aide.id] && (
                        <TouchableOpacity role="button"
                          style={styles.ctaSecondary}
                          onPress={() => navigation.navigate('GuideDetail', { guideId: AIDE_TO_GUIDE[aide.id] })}
                        >
                          <Text style={styles.ctaSecondaryText}>📖 Fiche</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              {isOpen && (
                <BoutonSignaler
                  aide={aide.name}
                  montantAffiche={aide.montantEstime}
                  profile={profile}
                />
              )}
              </View>
            );
          })}
        </>
      )}

      {/* ── Tout le reste derrière un toggle ── */}
      {allHiddenCount > 0 && (
        <TouchableOpacity role="button"
          style={styles.showMoreBtn}
          onPress={() => setShowAllAides(!showAllAides)}
          activeOpacity={0.7}
        >
          <Text style={styles.showMoreText}>
            {showAllAides
              ? '▲ Réduire'
              : `▼ Voir toutes mes aides (+${allHiddenCount})`}
          </Text>
        </TouchableOpacity>
      )}

      {showAllAides && (
        <>
          {/* Aides locales */}
          {localAides.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>📍 Aides dans ta ville</Text>
              {localAides.slice(0, 3).map((aide) => (
                <View key={aide.id}>
                <TouchableOpacity role="link"
                  style={styles.secondaryCard}
                  onPress={() => {
                    const url = aide.demarche.startsWith('http') ? aide.demarche : 'https://' + aide.demarche;
                    Linking.openURL(url);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.secondaryTop}>
                    <Text style={styles.secondaryEmoji} aria-hidden>{aide.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.secondaryName}>{aide.nom}</Text>
                      <Text style={styles.secondaryMontantLine}>{aide.montant}</Text>
                      {/* Un montant sans source vérifiée ne doit pas être présenté
                          comme un fait : les tarifs locaux changent chaque année. */}
                      <Text style={aide.verifieLe ? styles.verifOk : styles.verifTodo}>
                        {aide.verifieLe
                          ? `Vérifié le ${new Date(aide.verifieLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : 'Montant indicatif — confirme sur le site'}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>→</Text>
                  </View>
                </TouchableOpacity>
                <BoutonSignaler
                  aide={aide.nom}
                  montantAffiche={aide.montant}
                  verifieLe={aide.verifieLe}
                  profile={profile}
                />
                </View>
              ))}
            </>
          )}

          {/* Non éligibles */}
          {nonEligible.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Non éligible</Text>
              {nonEligible.map((aide) => (
                <View key={aide.id} style={[styles.secondaryCard, { opacity: 0.5 }]}>
                  <View style={styles.secondaryTop}>
                    <Text style={styles.secondaryEmoji} aria-hidden>{aide.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.secondaryName}>{aide.name}</Text>
                      <Text style={styles.secondaryDesc} numberOfLines={1}>{aide.description}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: 'rgba(107,114,128,0.12)' }]}>
                      <Text style={[styles.badgeText, { color: colors.textMuted }]}>❌</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </>
      )}

      {/* ── Disclaimer + fraîcheur des barèmes ── */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Ce sont des estimations, pas tes droits définitifs : le montant réel dépend aussi de ta ville
          et de ta situation exacte. Le chiffre officiel se calcule sur caf.fr ou mesdroitssociaux.gouv.fr.
        </Text>
        <Text style={[styles.disclaimerText, { marginTop: 6 }]}>
          {baremesPerimes()
            ? `⚠️ Barèmes vérifiés le ${majFr} — ils ont plus d'un an et peuvent avoir changé. Vérifie sur le site officiel.`
            : `Barèmes vérifiés le ${majFr}.`}
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },

  // Niveau 1 — intro
  intro: { marginBottom: spacing.lg },
  // La salutation n'est pas le message — le montant l'est. Elle passe en amorce
  // discrète pour que la promesse chiffrée porte seule le haut de l'écran.
  introTitle: { fontSize: 15, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  introSub: { fontSize: 24, fontWeight: '800', color: colors.text, lineHeight: 31, marginBottom: 6 },
  introCue: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 4 },

  // Niveau 2 — vedette
  vedetteCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    marginBottom: spacing.md,
  },
  vedetteTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: spacing.sm },
  vedetteEmoji: { fontSize: 26, marginTop: 2 },
  vedetteName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  vedetteBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Blanc plutôt que vert : la bordure et le badge portent déjà le signal
  // « éligible ». Trois verts empilés ne hiérarchisent plus rien.
  vedetteMontant: { fontSize: 17, fontWeight: '800', color: colors.text },
  vedetteDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.sm },
  vedetteActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },

  // Sections internes (détails dépliés)
  section: { marginTop: spacing.md },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
  step: { fontSize: 13, color: colors.textSecondary, lineHeight: 22, paddingLeft: 2 },

  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },

  // CTA vedette
  ctaExpand: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaExpandText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  ctaClaimed: { marginTop: spacing.sm, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  ctaClaimedText: { fontSize: 13, color: colors.textMuted, fontWeight: '500', textDecorationLine: 'underline' },

  // CTA liens (dépliés)
  ctaPrimary: {
    flex: 1, backgroundColor: colors.primaryGlow, borderRadius: radius.md, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)',
  },
  ctaPrimaryText: { color: colors.primaryLight, fontWeight: '600', fontSize: 13 },
  ctaSecondary: {
    flex: 1, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: radius.md, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  ctaSecondaryText: { color: colors.success, fontWeight: '600', fontSize: 13 },

  // CTA chat
  chatCtaCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, paddingVertical: 14, paddingHorizontal: spacing.md,
    // Pas de marge basse ici : `totalBanner` porte déjà l'écart de section.
    // Les marges ne fusionnent pas en React Native — les deux cumulaient 48px.
  },
  chatCtaText: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  chatCtaArrow: { fontSize: 16, color: colors.primaryLight, fontWeight: '700', marginLeft: 8 },

  // Bandeau total secondaires
  totalBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.07)',
    borderRadius: radius.lg, borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    paddingVertical: 12, paddingHorizontal: spacing.md,
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  totalBannerLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3,
  },
  totalBannerAmount: {
    fontSize: 15, fontWeight: '800', color: colors.primaryLight,
  },

  // Niveau 3 — secondaires
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  secondaryCard: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  secondaryTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  secondaryEmoji: { fontSize: 22 },
  secondaryName: { fontSize: 15, fontWeight: '600', color: colors.text },
  secondaryMontantLine: { fontSize: 13, color: colors.primaryLight, fontWeight: '600', marginTop: 3 },
  verifOk:   { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  verifTodo: { fontSize: 11, color: colors.warning, marginTop: 3, fontWeight: '500' },
  secondaryDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginTop: 6 },
  chevron: { fontSize: 12, color: colors.textMuted, marginLeft: 4 },
  expandedContent: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },

  // Toggle "Voir toutes mes aides"
  showMoreBtn: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  showMoreText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },

  // Disclaimer
  disclaimer: {
    backgroundColor: colors.cardLight, borderRadius: radius.md,
    padding: spacing.sm, marginTop: spacing.lg,
  },
  disclaimerText: { fontSize: 11, color: colors.textMuted, lineHeight: 16, textAlign: 'center' },
});
