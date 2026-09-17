import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { loadProfile } from '../utils/storage';
import { colors } from '../theme';

import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import ConfidentialiteScreen from '../screens/ConfidentialiteScreen';
import ExplorerScreen from '../screens/ExplorerScreen';
import QuizScreen from '../screens/QuizScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import AidesScreen from '../screens/AidesScreen';
import GuidesScreen from '../screens/GuidesScreen';
import GuideDetailScreen from '../screens/GuideDetailScreen';
import ParcoursScreen from '../screens/ParcoursScreen';
import CourriersScreen from '../screens/CourriersScreen';
import CourrierDetailScreen from '../screens/CourrierDetailScreen';
import BadgesScreen from '../screens/BadgesScreen';
import SimulateurEpargneScreen from '../screens/SimulateurEpargneScreen';
import MesDocumentsScreen from '../screens/MesDocumentsScreen';
import AgendaScreen from '../screens/AgendaScreen';
import BadgeToast from '../components/BadgeToast';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    loadProfile().then(async (profile) => {
      if (profile?.onboardingComplete) {
        setInitialRoute('Main');
      } else {
        // Montrer la landing page uniquement si jamais vue
        const welcomed = await AsyncStorage.getItem('@kichtapp_welcomed');
        setInitialRoute(welcomed ? 'Onboarding' : 'Welcome');
      }
    });
  }, []);

  if (!initialRoute) return null;

  const screenOptions = ({ navigation }: { navigation: any }) => ({
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: 'bold' as const },
    // Sur web, le bouton retour natif ne s'affiche pas — on l'ajoute manuellement
    ...(Platform.OS === 'web' && navigation.canGoBack() ? {
      headerLeft: () => (
        <TouchableOpacity role="button"
          onPress={() => navigation.goBack()}
          style={{ paddingRight: 16, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={{ color: colors.text, fontSize: 20, lineHeight: 22 }}>‹</Text>
          <Text style={{ color: colors.text, fontSize: 14, marginLeft: 4 }}>Retour</Text>
        </TouchableOpacity>
      ),
    } : {}),
  });

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={screenOptions}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz Impôts & Aides' }} />
        <Stack.Screen name="Checklist" component={ChecklistScreen} options={{ title: 'Premier Appart' }} />
        <Stack.Screen name="Aides" component={AidesScreen} options={{ title: 'Simulateur d\'aides' }} />
        <Stack.Screen name="Guides" component={GuidesScreen} options={{ title: 'Fiches pratiques' }} />
        <Stack.Screen name="GuideDetail" component={GuideDetailScreen} options={{ title: 'Guide' }} />
        <Stack.Screen name="Parcours" component={ParcoursScreen} options={{ title: 'Parcours' }} />
        <Stack.Screen name="Courriers" component={CourriersScreen} options={{ title: 'Courriers' }} />
        <Stack.Screen name="CourrierDetail" component={CourrierDetailScreen} options={{ title: 'Modèle' }} />
        <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Mes badges' }} />
        <Stack.Screen name="SimulateurEpargne" component={SimulateurEpargneScreen} options={{ title: 'Simulateur d\'épargne' }} />
        <Stack.Screen name="MesDocuments" component={MesDocumentsScreen} options={{ title: 'Mes documents clés' }} />
        <Stack.Screen name="Agenda" component={AgendaScreen} options={{ title: 'Mon agenda' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon profil' }} />
        <Stack.Screen name="Confidentialite" component={ConfidentialiteScreen} options={{ title: 'Confidentialité' }} />
        <Stack.Screen name="Explorer" component={ExplorerScreen} options={{ title: 'Explorer' }} />
      </Stack.Navigator>
      <BadgeToast />
    </View>
  );
}
