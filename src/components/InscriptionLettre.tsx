import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { NEWSLETTER_URL, newsletterActive } from '../legal';

/**
 * Proposition d'abonnement à « La lettre du Parrain ».
 *
 * Placée juste après les aides : c'est le moment où la personne vient de voir
 * ce que l'app lui apporte, et où « tes aides changent chaque année » prend
 * tout son sens.
 *
 * Aucune adresse n'est saisie dans l'app. Le bouton ouvre le formulaire hébergé
 * par Brevo, qui gère la double confirmation et la désinscription : l'app ne
 * voit jamais l'email, donc ne peut pas le relier aux réponses de la personne.
 *
 * Ne s'affiche pas du tout tant que le formulaire n'existe pas.
 */
export default function InscriptionLettre() {
  if (!newsletterActive()) return null;

  return (
    <View style={styles.carte}>
      <Text style={styles.titre}>Tes aides changent chaque année</Text>
      <Text style={styles.texte}>
        L'APL est revalorisée en octobre, la prime d'activité en avril. La lettre du Parrain te
        prévient de ce qui change, avec ses sources, une fois par mois.
      </Text>
      <TouchableOpacity
        style={styles.bouton}
        onPress={() => Linking.openURL(NEWSLETTER_URL)}
        activeOpacity={0.85}
        role="link"
        aria-label="S'abonner à la lettre du Parrain, sur une page extérieure"
      >
        <Text style={styles.boutonTexte}>Recevoir la lettre du Parrain</Text>
      </TouchableOpacity>
      <Text style={styles.mention}>
        Gratuit, désinscription en un clic. Ton adresse n'est jamais reliée à tes réponses dans l'app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  titre: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  texte: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  bouton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  boutonTexte: { color: colors.white, fontWeight: '700', fontSize: 14 },
  mention: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 17 },
});
