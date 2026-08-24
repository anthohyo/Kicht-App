import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabParamList } from '../types';
import { colors } from '../theme';
import BadgeToast from '../components/BadgeToast';

import HomeScreen from '../screens/HomeScreen';
import AidesScreen from '../screens/AidesScreen';
import BudgetScreen from '../screens/BudgetScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TABS = [
  { name: 'Home' as const,   label: 'Accueil',    icon: '🏠' },
  { name: 'Aides' as const,  label: 'Mes aides',  icon: '🎯' },
  { name: 'Budget' as const, label: 'Mon mois',   icon: '💰' },
  { name: 'Chat' as const,   label: 'Aide',       icon: '💬' },
];

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return {
            headerStyle: {
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: 'bold' },
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              height: 60 + (Platform.OS !== 'web' ? insets.bottom : 10),
              paddingTop: 6,
              paddingBottom: Platform.OS !== 'web' ? insets.bottom : 10,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginTop: 2,
            },
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
                {tab?.icon ?? '•'}
              </Text>
            ),
          };
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Accueil',
            // Accès au profil depuis le header
            headerRight: () => (
              <TouchableOpacity
                onPress={() => (navigation as any).navigate('Profile')}
                // Zone tactile portée à 44pt : en dessous, la cible est trop
                // petite pour être atteinte de façon fiable au pouce.
                style={{ marginRight: 12, padding: 12 }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Mon profil"
              >
                <Text style={{ fontSize: 20, opacity: 0.7 }}>👤</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Tab.Screen
          name="Aides"
          component={AidesScreen}
          options={{ title: 'Mes aides' }}
        />
        <Tab.Screen
          name="Budget"
          component={BudgetScreen}
          options={{ title: 'Mon mois' }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'Le Parrain' }}
        />
      </Tab.Navigator>

      {/* Badge achievement toast — flotte au-dessus des onglets */}
      <BadgeToast />
    </View>
  );
}
