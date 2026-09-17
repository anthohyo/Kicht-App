import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Filet de sécurité global.
 *
 * Sans lui, une exception dans n'importe quel écran laisse un écran blanc :
 * l'utilisateur ne sait pas ce qui se passe, n'a aucun moyen de revenir en
 * arrière, et conclut que l'app est cassée. Ici il obtient un message lisible
 * et un bouton pour repartir — ses données sont intactes, seul l'affichage a
 * échoué, et c'est exactement ce qu'il faut lui dire.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Pas de service de crash pour l'instant — la console reste le seul canal.
    console.error('Erreur non rattrapée :', error, info.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.emoji}>🛠️</Text>
          <Text style={styles.title}>Quelque chose s'est mal passé</Text>
          <Text style={styles.body}>
            L'app a rencontré un problème d'affichage. Ce n'est pas de ta faute et{' '}
            <Text style={styles.strong}>tes données sont intactes</Text> — rien n'a été perdu.
          </Text>

          <TouchableOpacity role="button" style={styles.button} onPress={this.handleReset} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Si ça se reproduit, ferme puis rouvre l'application.
          </Text>

          <View style={styles.detailsBox}>
            <Text style={styles.detailsLabel}>Détail technique</Text>
            <Text style={styles.detailsText} selectable>
              {error.message || String(error)}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  emoji: { fontSize: 44, textAlign: 'center', marginBottom: spacing.xs },
  title: {
    fontSize: 22, fontWeight: 'bold', color: colors.text,
    textAlign: 'center', marginBottom: spacing.xs,
  },
  body: {
    fontSize: 15, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: spacing.md,
  },
  strong: { color: colors.text, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: 14, alignItems: 'center',
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  hint: {
    fontSize: 13, color: colors.textMuted,
    textAlign: 'center', marginTop: spacing.xs,
  },
  detailsBox: {
    marginTop: spacing.lg, padding: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  detailsLabel: {
    fontSize: 10, color: colors.textMuted, fontWeight: '600',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
  },
  detailsText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
});
