import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, radius, spacing } from '../theme';
import { CONTACT_EMAIL, EDITEUR, HEBERGEUR, DERNIERE_MAJ_LEGAL, mailto } from '../legal';

/**
 * Mentions légales et conditions d'utilisation.
 *
 * Obligatoire en France (LCEN art. 6 III) dès lors qu'un service est mis à
 * disposition du public en ligne, et exigé par Google Play et l'App Store.
 *
 * Le texte dit ce que l'app fait réellement. En particulier : elle est gratuite,
 * elle n'a aucun lien avec la CAF ou le CROUS, et une estimation n'est pas une
 * décision. Ces trois points sont ceux qui peuvent faire du tort à un jeune
 * s'ils sont mal compris.
 */

interface Bloc {
  titre: string;
  paragraphes: string[];
}

const BLOCS: Bloc[] = [
  {
    titre: 'Ce que KichtApp est',
    paragraphes: [
      "Un outil d'information et d'estimation, gratuit, qui réunit au même endroit les aides auxquelles tu peux avoir droit et les démarches à faire quand tu quittes le domicile familial.",
      "KichtApp est indépendante. Elle n'est affiliée à aucune administration : ni la CAF, ni le CROUS, ni Action Logement, ni une mairie, ni une région. Les noms cités le sont à titre d'information, et appartiennent à leurs propriétaires.",
    ],
  },
  {
    titre: "Ce qu'elle n'est pas",
    paragraphes: [
      "Les montants affichés sont des estimations, calculées à partir des barèmes publics à la date indiquée sur chaque aide. Seul l'organisme concerné décide de ce que tu touches vraiment : une estimation ne vaut ni décision, ni promesse, ni droit acquis.",
      "KichtApp ne remplace ni un conseiller CAF, ni une assistante sociale, ni un avocat, ni un conseiller en investissement. Les fiches expliquent des règles générales ; elles ne tiennent pas compte de toute ta situation.",
      "Avant toute démarche qui t'engage, vérifie auprès de l'organisme. L'éditeur ne peut pas être tenu responsable d'une décision prise sur la seule base d'une estimation affichée ici.",
    ],
  },
  {
    titre: "C'est gratuit, et ça le reste",
    paragraphes: [
      "Tout le contenu est accessible à tout le monde : aucun abonnement, aucune option payante, aucun achat intégré, aucune publicité, aucune revente de données.",
      "Comme rien n'est vendu, il n'y a ni facture, ni paiement, ni remboursement possible — la question ne se pose pas. Si un financement devient nécessaire un jour, il viendra d'institutions (CROUS, missions locales, mutuelles), pas de toi, et cette page le dira avant tout changement.",
    ],
  },
  {
    titre: 'Fiabilité des informations',
    paragraphes: [
      "Chaque aide locale affichée porte sa source officielle et la date à laquelle elle a été vérifiée. Une aide dont le montant n'a pas pu être vérifié n'est pas affichée du tout, plutôt que de l'être avec un chiffre incertain.",
      "Les barèmes changent souvent, parfois en cours d'année. Si tu vois une information fausse ou périmée, signale-la : c'est corrigé et la date de vérification est mise à jour.",
    ],
  },
  {
    titre: 'Utilisation',
    paragraphes: [
      "Tu peux utiliser KichtApp librement, pour toi, autant que tu veux, sans créer de compte.",
      "Ne sont pas autorisés : détourner le service de son usage, tenter d'en perturber le fonctionnement, ou réutiliser commercialement les fiches et contenus sans accord de l'éditeur. Les données publiques citées restent soumises à leurs propres licences de réutilisation.",
      "L'app s'adresse à des jeunes à partir de 16 ans. Elle ne collecte aucune donnée personnelle, donc aucun consentement parental n'est requis ; en dessous de cet âge, parles-en quand même à un adulte autour de toi.",
    ],
  },
  {
    titre: 'Liens vers des sites extérieurs',
    paragraphes: [
      "L'app renvoie vers des sites publics (caf.fr, ameli.fr, impots.gouv.fr, visale.fr, messervices.etudiant.gouv.fr et d'autres). Une fois là-bas, tu quittes KichtApp : leur contenu et leurs règles ne dépendent pas de nous.",
    ],
  },
  {
    titre: 'Disponibilité',
    paragraphes: [
      "Le service est fourni tel quel, sans garantie de disponibilité permanente. Il peut être interrompu, modifié ou arrêté. Tes données étant stockées sur ton appareil, elles ne disparaissent pas si le site est indisponible — et tu peux en faire une sauvegarde à tout moment depuis la page Confidentialité.",
    ],
  },
  {
    titre: 'Droit applicable',
    paragraphes: [
      "Ces conditions sont soumises au droit français. En cas de difficulté, écris d'abord à l'éditeur : c'est plus rapide que n'importe quelle procédure. À défaut d'accord, les tribunaux français sont compétents.",
    ],
  },
];

export default function MentionsLegalesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Identité de l'éditeur ── */}
      <Text style={styles.sectionTitle}>Qui édite KichtApp</Text>
      <View style={styles.card}>
        <View style={styles.ligne}>
          <Text style={styles.cle}>Éditeur</Text>
          <Text style={styles.valeur}>{EDITEUR}</Text>
        </View>
        <View style={[styles.ligne, styles.ligneBordee]}>
          <Text style={styles.cle}>Directeur de la publication</Text>
          <Text style={styles.valeur}>{EDITEUR}</Text>
        </View>
        <View style={[styles.ligne, styles.ligneBordee]}>
          <Text style={styles.cle}>Statut</Text>
          <Text style={styles.valeur}>Particulier — service gratuit et non commercial</Text>
        </View>
        <View style={[styles.ligne, styles.ligneBordee]}>
          <Text style={styles.cle}>Contact</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(mailto('Question'))}
            role="link"
            aria-label={`Écrire à ${CONTACT_EMAIL}`}
          >
            <Text style={[styles.valeur, styles.lien]}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Hébergeur</Text>
      <View style={styles.card}>
        <Text style={styles.texte}>
          {HEBERGEUR.nom}
          {'\n'}
          {HEBERGEUR.adresse}
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(HEBERGEUR.site)}
          role="link"
          aria-label="Ouvrir le site de l'hébergeur"
        >
          <Text style={[styles.texte, styles.lien, { marginTop: 6 }]}>netlify.com</Text>
        </TouchableOpacity>
      </View>

      {/* ── Conditions ── */}
      {BLOCS.map((bloc) => (
        <View key={bloc.titre}>
          <Text style={styles.sectionTitle}>{bloc.titre}</Text>
          <View style={styles.card}>
            {bloc.paragraphes.map((p, i) => (
              <Text key={p.slice(0, 20)} style={[styles.texte, i > 0 && styles.texteSuivant]}>
                {p}
              </Text>
            ))}
          </View>
        </View>
      ))}

      {/* ── Signalement, mis en avant : c'est ce qui garde les données justes ── */}
      <View style={styles.encart}>
        <Text style={styles.encartTitre}>Une information te semble fausse ?</Text>
        <Text style={styles.encartTexte}>
          C'est le meilleur service que tu puisses rendre aux autres jeunes qui utilisent l'app.
          Dis-nous quelle aide et quel montant : c'est vérifié à la source et corrigé.
        </Text>
        <TouchableOpacity
          style={styles.bouton}
          onPress={() => Linking.openURL(mailto('Signaler une information erronée'))}
          activeOpacity={0.85}
          role="button"
          aria-label="Signaler une information erronée par e-mail"
        >
          <Text style={styles.boutonTexte}>Signaler une erreur</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.lienInterne}
        onPress={() => navigation.navigate('Confidentialite')}
        activeOpacity={0.8}
        role="link"
        aria-label="Ouvrir la politique de confidentialité"
      >
        <Text style={styles.lienInterneTexte}>Politique de confidentialité et tes données</Text>
        <Text style={styles.chevron} aria-hidden>›</Text>
      </TouchableOpacity>

      <Text style={styles.maj}>Dernière mise à jour : {DERNIERE_MAJ_LEGAL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },

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

  ligne: { paddingVertical: 9 },
  ligneBordee: { borderTopWidth: 1, borderTopColor: colors.border },
  cle: { fontSize: 12, color: colors.textMuted, marginBottom: 3 },
  valeur: { fontSize: 15, color: colors.text, fontWeight: '500', lineHeight: 21 },
  lien: { color: colors.primaryLight, fontWeight: '600' },

  texte: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  texteSuivant: { marginTop: 12 },

  encart: {
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
    borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.35)',
    padding: spacing.md, marginBottom: spacing.lg,
  },
  encartTitre: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  encartTexte: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  bouton: {
    marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 13, alignItems: 'center',
  },
  boutonTexte: { color: colors.white, fontWeight: '700', fontSize: 14 },

  lienInterne: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  lienInterneTexte: { fontSize: 15, color: colors.text, fontWeight: '500', flex: 1 },
  chevron: { fontSize: 22, color: colors.textMuted },

  maj: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
