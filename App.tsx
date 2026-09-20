import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { colors } from './src/theme';
import { resynchroniserRappels } from './src/utils/notifications';

// Thème sombre pour React Navigation
const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

// Onglet du navigateur : sans ça, la page s'appelait simplement « Accueil » —
// indéchiffrable parmi vingt onglets, et c'est ce texte que Google affiche.
const TITRE_PAR_DEFAUT = 'KichtApp — tes aides et tes démarches quand tu pars vivre seul';
const documentTitle = {
  formatter: (options?: { title?: string }) =>
    options?.title ? `${options.title} — KichtApp` : TITRE_PAR_DEFAUT,
};

export default function App() {
  // Les rappels couvrent quelques semaines : on prolonge la fenêtre à chaque ouverture.
  useEffect(() => { resynchroniserRappels(); }, []);

  return (
    <SafeAreaProvider>
      {/* Sur un écran d'ordinateur, l'app s'étirait sur toute la largeur : des lignes
          de 1 400 px, illisibles. On la garde dans une colonne de largeur de téléphone. */}
      <View style={styles.cadreWeb}>
        <ErrorBoundary>
          <NavigationContainer theme={DarkTheme} documentTitle={documentTitle}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  cadreWeb: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bg,
    ...Platform.select({
      web: {
        maxWidth: 520,
        alignSelf: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.border,
      },
      default: {},
    }),
  },
});
