import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Linking, Share, TextInput,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile } from '../types';
import { loadProfile } from '../utils/storage';
import { colors, radius, spacing } from '../theme';
import { construireSauvegarde, lireSauvegarde, nomFichier, PREFIXE, FichierSauvegarde } from '../utils/sauvegarde';
import { resynchroniserRappels } from '../utils/notifications';

/**
 * Écran de confidentialité.
 *
 * Le contenu décrit ce que l'app fait RÉELLEMENT, vérifié dans le code :
 * aucune requête réseau hors API Claude (et seulement si l'utilisateur a
 * collé sa propre clé), aucun analytics, aucun serveur, aucun cookie tiers.
 * Si l'un de ces points change un jour, cet écran doit changer avec lui —
 * une promesse de confidentialité fausse est pire que pas de promesse.
 */

const DONNEES_STOCKEES = [
  { emoji: '👤', titre: 'Ton profil', detail: 'Prénom, âge, situation, ville, logement, revenus et dépenses.' },
  { emoji: '💰', titre: 'Ton budget', detail: 'Les revenus et dépenses que tu saisis, mois par mois.' },
  { emoji: '✅', titre: 'Tes démarches', detail: 'Les étapes que tu coches et ta progression.' },
  { emoji: '💬', titre: 'Tes conversations', detail: 'L\'historique de ce que tu as demandé au Parrain.' },
  { emoji: '🗓️', titre: 'Ton agenda', detail: 'Les échéances et rappels que tu ajoutes.' },
];

export default function ConfidentialiteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(useCallback(() => { loadProfile().then(setProfile); }, []));

  const [messageSauvegarde, setMessageSauvegarde] = useState<{ ok: boolean; texte: string } | null>(null);
  const [collage, setCollage] = useState('');
  const [modeCollage, setModeCollage] = useState(false);

  const creerSauvegarde = async () => {
    const cles = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIXE));
    const paires = await AsyncStorage.multiGet(cles);
    const fichier = construireSauvegarde(paires, new Date());
    const contenu = JSON.stringify(fichier, null, 2);
    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([contenu], { type: 'application/json' }));
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = nomFichier(new Date());
      lien.click();
      URL.revokeObjectURL(url);
      setMessageSauvegarde({ ok: true, texte: 'Sauvegarde téléchargée. Garde ce fichier en lieu sûr.' });
    } else {
      await Share.share({ title: nomFichier(new Date()), message: contenu });
      setMessageSauvegarde({ ok: true, texte: 'Envoie-la-toi par mail ou enregistre-la dans tes notes : c\'est ce texte qu\'il faudra coller pour restaurer.' });
    }
  };

  const restaurer = async (fichier: FichierSauvegarde) => {
    const actuelles = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIXE));
    await AsyncStorage.multiRemove(actuelles);
    await AsyncStorage.multiSet(Object.entries(fichier.donnees));
    await resynchroniserRappels();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
  };

  const confirmerRestauration = (texte: string) => {
    const lu = lireSauvegarde(texte);
    if (!lu.ok) {
      setMessageSauvegarde({ ok: false, texte: lu.erreur });
      return;
    }
    const date = new Date(lu.fichier.exporteLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const titre = 'Restaurer cette sauvegarde ?';
    const message = `Sauvegarde de ${lu.profil.firstName ?? 'ton profil'} du ${date}. Elle remplacera toutes les données actuelles de cet appareil.`;
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`${titre}\n\n${message}`)) restaurer(lu.fichier);
    } else {
      Alert.alert(titre, message, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Restaurer', style: 'destructive', onPress: () => restaurer(lu.fichier) },
      ]);
    }
  };

  const choisirSauvegarde = async () => {
    setMessageSauvegarde(null);
    if (Platform.OS === 'web') {
      const champ = document.createElement('input');
      champ.type = 'file';
      champ.accept = 'application/json,.json';
      champ.onchange = async () => {
        const fichier = champ.files?.[0];
        if (fichier) confirmerRestauration(await fichier.text());
      };
      champ.click();
    } else {
      setModeCollage(true);
    }
  };

  const effacerTout = async () => {
    await AsyncStorage.clear();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }));
  };

  const confirmerEffacement = () => {
    const titre = 'Effacer toutes mes données';
    const message =
      'Tout sera supprimé définitivement de cet appareil : profil, budget, démarches cochées, conversations. Cette action est irréversible.';
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`${titre}\n\n${message}`)) effacerTout();
    } else {
      Alert.alert(titre, message, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Tout effacer', style: 'destructive', onPress: effacerTout },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── La promesse, en premier ── */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🔒</Text>
        <Text style={styles.heroTitle}>Tes données ne quittent pas ton appareil</Text>
        <Text style={styles.heroBody}>
          KichtApp n'a pas de serveur. Tout ce que tu saisis — ton salaire, ton loyer, ta situation —
          reste enregistré sur ce téléphone. Nous n'y avons pas accès, et personne d'autre non plus.
        </Text>
      </View>

      {/* ── Ce qui est enregistré ── */}
      <Text style={styles.sectionTitle}>Ce qui est enregistré ici</Text>
      <View style={styles.card}>
        {DONNEES_STOCKEES.map((d, i) => (
          <View key={d.titre} style={[styles.row, i > 0 && styles.rowBordered]}>
            <Text style={styles.rowEmoji}>{d.emoji}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{d.titre}</Text>
              <Text style={styles.rowDetail}>{d.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Ce qu'on ne fait pas ── */}
      <Text style={styles.sectionTitle}>Ce que l'app ne fait pas</Text>
      <View style={styles.card}>
        {[
          'Aucun compte, aucune inscription, aucune adresse e-mail demandée.',
          'Aucun traceur, aucune statistique d\'usage, aucun cookie publicitaire.',
          'Aucune revente ni partage de tes données — il n\'y a rien à vendre, rien ne sort d\'ici.',
          'Aucune publicité.',
          'Aucun service de notification extérieur : tes rappels d\'échéances sont programmés par ton téléphone lui-même.',
        ].map((t) => (
          <View key={t} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>✓</Text>
            <Text style={styles.bulletText}>{t}</Text>
          </View>
        ))}
      </View>

      {/* ── La seule exception, dite franchement ── */}
      <Text style={styles.sectionTitle}>La seule exception</Text>
      <View style={[styles.card, styles.cardWarn]}>
        <Text style={styles.warnTitle}>Si tu actives le Parrain IA</Text>
        <Text style={styles.warnBody}>
          Par défaut, Le Parrain répond hors ligne : ses réponses sont écrites à l'avance dans l'app,
          rien n'est envoyé nulle part.
          {'\n\n'}
          Si tu ajoutes ta propre clé API dans les réglages, alors — et seulement alors — tes questions
          et ton profil (situation, revenus, logement) sont envoyés à Anthropic pour générer la réponse.
          Cela relève de leurs conditions d'utilisation, pas des nôtres.
        </Text>
        <Text style={styles.warnStatus}>
          {profile?.claudeApiKey
            ? '⚠️ Actuellement activé sur cet appareil.'
            : '✅ Actuellement désactivé — aucune donnée n\'est envoyée.'}
        </Text>
      </View>

      {/* ── Liens sortants ── */}
      <Text style={styles.sectionTitle}>Liens vers les sites officiels</Text>
      <View style={styles.card}>
        <Text style={styles.plainText}>
          L'app te renvoie vers caf.fr, ameli.fr, impots.gouv.fr, visale.fr et d'autres sites publics.
          Une fois là-bas, tu quittes KichtApp : ce sont leurs propres règles de confidentialité qui
          s'appliquent. Nous ne leur transmettons rien à ton sujet.
        </Text>
      </View>

      {/* ── Contrôle ── */}
      <Text style={styles.sectionTitle}>Changer de téléphone sans rien perdre</Text>
      <View style={styles.card}>
        <Text style={styles.plainText}>
          Tes données n'existent que sur cet appareil. Pour les retrouver ailleurs, crée une sauvegarde et
          garde-la toi-même — dans un mail à ton adresse, tes notes ou ton cloud. Elle ne passe par aucun
          serveur, et ta clé API n'y figure jamais.
        </Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={creerSauvegarde} activeOpacity={0.85}
          role="button" aria-label="Créer une sauvegarde de mes données">
          <Text style={styles.secondaryBtnText}>Créer une sauvegarde</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={choisirSauvegarde} activeOpacity={0.85}
          role="button" aria-label="Restaurer une sauvegarde">
          <Text style={styles.secondaryBtnText}>Restaurer une sauvegarde</Text>
        </TouchableOpacity>
        {modeCollage && (
          <View style={{ marginTop: spacing.sm }}>
            <TextInput
              style={styles.collage}
              value={collage}
              onChangeText={setCollage}
              placeholder="Colle ici le texte de ta sauvegarde"
              placeholderTextColor={colors.textMuted}
              multiline
              aria-label="Texte de la sauvegarde"
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} activeOpacity={0.85}
                onPress={async () => setCollage(await Clipboard.getStringAsync())}
                role="button" aria-label="Coller depuis le presse-papiers">
                <Text style={styles.secondaryBtnText}>Coller</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} activeOpacity={0.85}
                onPress={() => confirmerRestauration(collage)}
                role="button" aria-label="Restaurer ce texte">
                <Text style={styles.secondaryBtnText}>Restaurer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {messageSauvegarde && (
          <Text style={[styles.messageSauvegarde, { color: messageSauvegarde.ok ? colors.success : colors.danger }]}
            aria-live="polite">
            {messageSauvegarde.texte}
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Tu gardes le contrôle</Text>
      <View style={styles.card}>
        <Text style={styles.plainText}>
          Tu peux effacer l'intégralité de tes données à tout moment, sans demander l'autorisation à
          personne. La suppression est immédiate et définitive — il n'existe aucune copie ailleurs.
        </Text>
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={confirmerEffacement}
          activeOpacity={0.85}
          role="button"
          aria-label="Effacer toutes mes données"
        >
          <Text style={styles.dangerBtnText}>Effacer toutes mes données</Text>
        </TouchableOpacity>
      </View>

      {/* ── Contact ── */}
      <View style={styles.contactBox}>
        <Text style={styles.contactTitle}>Une question sur tes données ?</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:contact@kichtapp.fr?subject=Confidentialit%C3%A9')}
          role="link"
          aria-label="Écrire à contact@kichtapp.fr"
        >
          <Text style={styles.contactLink}>contact@kichtapp.fr</Text>
        </TouchableOpacity>
        <Text style={styles.updated}>Dernière mise à jour : 17 septembre 2026</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  secondaryBtn: {
    marginTop: spacing.sm, backgroundColor: colors.cardLight, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.borderLight, paddingVertical: 12, alignItems: 'center',
  },
  secondaryBtnText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  collage: {
    minHeight: 90, maxHeight: 180, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 12, fontSize: 12,
    textAlignVertical: 'top',
  },
  messageSauvegarde: { marginTop: spacing.sm, fontSize: 13, lineHeight: 19 },
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },

  hero: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroEmoji: { fontSize: 30, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.text, lineHeight: 29, marginBottom: 10 },
  heroBody: { fontSize: 15, color: colors.textSecondary, lineHeight: 23 },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.9,
    marginBottom: spacing.sm, marginTop: spacing.xs,
  },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  cardWarn: { borderColor: 'rgba(245, 158, 11, 0.35)' },

  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  rowBordered: { borderTopWidth: 1, borderTopColor: colors.border },
  rowEmoji: { fontSize: 19, marginTop: 1 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  rowDetail: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 7 },
  bulletMark: { fontSize: 14, color: colors.success, fontWeight: '800', marginTop: 1 },
  bulletText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 21 },

  warnTitle: { fontSize: 15, fontWeight: '700', color: colors.warning, marginBottom: 8 },
  warnBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  warnStatus: {
    fontSize: 13, fontWeight: '600', color: colors.text,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
  },

  plainText: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },

  dangerBtn: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 13, alignItems: 'center',
  },
  dangerBtnText: { color: colors.danger, fontWeight: '700', fontSize: 14 },

  contactBox: { alignItems: 'center', paddingTop: spacing.sm },
  contactTitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
  contactLink: { fontSize: 15, color: colors.primaryLight, fontWeight: '600' },
  updated: { fontSize: 12, color: colors.textMuted, marginTop: spacing.md },
});
