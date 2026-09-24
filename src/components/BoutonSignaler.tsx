import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { UserProfile } from '../types';
import { colors, spacing } from '../theme';
import { lienSignalement } from '../utils/signalement';
import { VERSION_APP } from '../legal';

interface Props {
  /** Nom de l'aide, tel qu'affiché. */
  aide: string;
  montantAffiche?: string;
  verifieLe?: string;
  profile: UserProfile | null;
}

/**
 * « Ce montant est faux ? », posé sur l'aide elle-même.
 *
 * Les barèmes locaux bougent en cours d'année et personne ne peut surveiller
 * 31 aides en continu : ce sont les utilisateurs qui voient l'erreur en
 * premier. Jusqu'ici le seul moyen de la signaler était un lien enterré dans
 * les mentions légales — autant dire aucun.
 *
 * Discret volontairement : c'est un filet de sécurité, pas un appel à l'action
 * qui concurrencerait « faire la démarche ».
 */
export default function BoutonSignaler({ aide, montantAffiche, verifieLe, profile }: Props) {
  const ouvrir = () => {
    Linking.openURL(
      lienSignalement(
        {
          aide,
          montantAffiche,
          verifieLe,
          ville: profile?.ville,
          departement: profile?.departement,
        },
        VERSION_APP,
      ),
    );
  };

  return (
    <TouchableOpacity
      style={styles.bouton}
      onPress={ouvrir}
      activeOpacity={0.6}
      role="button"
      aria-label={`Signaler une information erronée sur : ${aide}`}
    >
      <Text style={styles.texte}>Ce montant est faux ?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bouton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  texte: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
