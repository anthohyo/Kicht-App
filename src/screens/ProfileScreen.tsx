import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, TextInput, Image,
} from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile, UserProgress, UserStatus, SchoolType, HousingType } from '../types';
import { loadProfile, saveProfile, loadProgress, loadTransactions, saveTransactions } from '../utils/storage';
import { createMonthlyTransactions, monthKey } from './BudgetScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing } from '../theme';
import { detectGeo, Commune } from '../data/geoFrance';

const STATUS_LABELS: Record<string, string> = {
  etudiant: '🎓 Étudiant·e',
  apprenti: '🔧 Apprenti·e',
  salarie: '💼 Salarié·e',
  auto_entrepreneur: '🚀 Auto-entrepreneur·e',
  service_civique: '🤝 Service civique',
  recherche_emploi: '🔍 En recherche d\'emploi',
  autre: '🌀 Autre',
};

const HOUSING_TYPE_LABELS: Record<HousingType, string> = {
  futur: '📦 J\'emménage bientôt',
  seul: '🏠 Seul·e en appartement',
  coloc: '🏘️ En colocation',
  crous: '🏫 Résidence CROUS',
  parents: '👨‍👩‍👧 Chez mes parents',
  foyer: '🏢 Foyer / hébergement social',
};

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'etudiant', label: '🎓 Étudiant·e' },
  { value: 'apprenti', label: '🔧 Alternant·e / Apprenti·e' },
  { value: 'salarie', label: '💼 Salarié·e' },
  { value: 'auto_entrepreneur', label: '🚀 Auto-entrepreneur·e' },
  { value: 'service_civique', label: '🤝 Service civique' },
  { value: 'recherche_emploi', label: '🔍 En recherche d\'emploi' },
  { value: 'autre', label: '🌀 Autre' },
];

const HOUSING_OPTIONS: { value: HousingType; label: string; hint: string }[] = [
  { value: 'futur',   label: '📦 Je vais emménager bientôt', hint: 'Des choses sont à faire AVANT de signer' },
  { value: 'seul',    label: '🏠 Seul·e en appartement', hint: 'APL possible, loyer complet' },
  { value: 'coloc',   label: '🏘️ En colocation',         hint: 'APL sur ta part du loyer' },
  { value: 'crous',   label: '🏫 Résidence CROUS',        hint: 'Loyer réduit, APL spécifique' },
  { value: 'parents', label: '👨‍👩‍👧 Chez mes parents',     hint: 'Pas d\'APL, bourse quand même possible' },
  { value: 'foyer',   label: '🏢 Foyer / hébergement social', hint: 'Aides d\'urgence prioritaires' },
];

const SCHOOL_TYPE_OPTIONS: { value: SchoolType; label: string; hint: string }[] = [
  { value: 'public', label: '🏛️ Université / BTS public', hint: 'Université, IUT, BTS en lycée public' },
  { value: 'prive_reconnu', label: '🏢 Grande école reconnue', hint: 'École sous contrat, CPGE, école de commerce/ingénieur reconnue par l\'État' },
  { value: 'prive_non_reconnu', label: '🏫 École privée non conventionnée', hint: 'École hors contrat, formation privée sans reconnaissance État' },
];

const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  public: '🏛️ Université / BTS public',
  prive_reconnu: '🏢 Grande école reconnue',
  prive_non_reconnu: '🏫 École privée non conventionnée',
};

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showVilleInput, setShowVilleInput] = useState(false);
  const [villeInput, setVilleInput] = useState('');
  const [detectedGeo, setDetectedGeo] = useState<Commune | null>(null);

  // Edit situation states
  const [showEditSituation, setShowEditSituation] = useState(false);
  const [editAge, setEditAge] = useState('');
  const [editStatus, setEditStatus] = useState<UserStatus>('etudiant');
  const [editSchoolType, setEditSchoolType] = useState<SchoolType>('public');
  const [editHousingType, setEditHousingType] = useState<HousingType>('seul');

  // Edit finances states
  const [showEditFinances, setShowEditFinances] = useState(false);
  const [editSalary, setEditSalary] = useState('');
  const [editLoyer, setEditLoyer] = useState('');
  const [editAbonnements, setEditAbonnements] = useState('');
  const [editElectricite, setEditElectricite] = useState('');
  const [editCourses, setEditCourses] = useState('');
  const [editTransport, setEditTransport] = useState('');
  const [editSorties, setEditSorties] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadProfile().then((p) => {
        setProfile(p);
        setApiKey(p?.claudeApiKey || '');
        setVilleInput(p?.ville || '');
        if (p?.ville && p?.departement && p?.region) {
          setDetectedGeo({ ville: p.ville, departement: p.departement, region: p.region });
        }
      });
      loadProgress().then(setProgress);
    }, [])
  );

  // Sync edit states when profile changes
  useEffect(() => {
    if (profile) {
      setEditAge(String(profile.age ?? ''));
      setEditStatus(profile.status);
      setEditSchoolType(profile.schoolType ?? 'public');
      setEditHousingType(profile.housingType ?? 'seul');
      setEditSalary(String(profile.monthlySalary));
      setEditLoyer(String(profile.expenses.loyer));
      setEditAbonnements(String(profile.expenses.abonnements));
      setEditElectricite(String(profile.expenses.electricite));
      setEditCourses(String(profile.expenses.courses));
      setEditTransport(String(profile.expenses.transport));
      setEditSorties(String(profile.expenses.sorties));
    }
  }, [profile]);

  const doReset = async () => {
    await AsyncStorage.clear();
    // ProfileScreen est maintenant un écran root stack — on dispatch directement
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
    );
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Ça va supprimer toutes tes données. Tu es sûr·e ?')) doReset();
    } else {
      Alert.alert('Recommencer', 'Ça va supprimer toutes tes données. Tu es sûr·e ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', style: 'destructive', onPress: doReset },
      ]);
    }
  };

  const handleSaveApiKey = async () => {
    if (profile) {
      const updated = { ...profile, claudeApiKey: apiKey.trim() || undefined };
      await saveProfile(updated);
      setProfile(updated);
      setShowApiInput(false);
    }
  };

  const handleVilleChange = (text: string) => {
    setVilleInput(text);
    const result = detectGeo(text);
    setDetectedGeo(result);
  };

  const handleSaveVille = async () => {
    if (profile) {
      const updated: UserProfile = {
        ...profile,
        ville: detectedGeo?.ville,
        departement: detectedGeo?.departement,
        region: detectedGeo?.region,
      };
      await saveProfile(updated);
      setProfile(updated);
      setShowVilleInput(false);
    }
  };

  const handleSaveSituation = async () => {
    if (profile) {
      const updated: UserProfile = {
        ...profile,
        age: (() => {
          const n = parseInt(editAge, 10);
          return Number.isFinite(n) && n >= 14 && n <= 99 ? n : profile.age;
        })(),
        status: editStatus,
        schoolType: editStatus === 'etudiant' ? editSchoolType : undefined,
        housingType: editHousingType,
      };
      await saveProfile(updated);
      setProfile(updated);
      setShowEditSituation(false);
    }
  };

  const handleSaveFinances = async () => {
    if (profile) {
      const updated: UserProfile = {
        ...profile,
        monthlySalary: parseFloat(editSalary) || 0,
        expenses: {
          loyer: parseFloat(editLoyer) || 0,
          abonnements: parseFloat(editAbonnements) || 0,
          electricite: parseFloat(editElectricite) || 0,
          courses: parseFloat(editCourses) || 0,
          transport: parseFloat(editTransport) || 0,
          sorties: parseFloat(editSorties) || 0,
        },
      };
      await saveProfile(updated);

      // Sync : mettre à jour les transactions récurrentes du mois courant
      const now = new Date();
      const mk = monthKey(now);
      const allTxs = await loadTransactions();
      // Supprimer les anciens récurrents de ce mois ET les seeds initiaux
      const withoutRecurrents = allTxs.filter(
        (t) => !(t.id.startsWith('recurrent-') && t.id.endsWith(mk)) && !t.id.startsWith('seed-')
      );
      const newRecurrents = createMonthlyTransactions(updated, now);
      await saveTransactions([...withoutRecurrents, ...newRecurrents]);

      setProfile(updated);
      setShowEditFinances(false);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file || !profile) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const uri = ev.target?.result as string;
          if (uri) {
            const updated = { ...profile, photoUri: uri };
            await saveProfile(updated);
            setProfile(updated);
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } else {
      Alert.alert('Photo de profil', 'Fonctionnalité disponible prochainement');
    }
  };

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Chargement…</Text>
      </View>
    );
  }

  const totalExpenses = Object.values(profile.expenses).reduce((a, b) => a + b, 0);
  const reste = profile.monthlySalary - totalExpenses;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar + Name */}
      <View style={styles.avatarSection}>
        <TouchableOpacity role="button" aria-label="Changer ma photo de profil" onPress={handleAvatarPress} activeOpacity={0.8} style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} alt="Ta photo de profil" />
            ) : (
              <Text style={styles.avatarText}>{profile.firstName.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.avatarOverlay}>
            <Text style={styles.avatarOverlayIcon} aria-hidden>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{profile.firstName}</Text>
        <Text style={styles.statusBadge}>{STATUS_LABELS[profile.status]}</Text>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity role="button" style={styles.actionBtn} onPress={() => navigation.navigate('Badges')}>
          <Text style={styles.actionEmoji} aria-hidden>🏆</Text>
          <Text style={styles.actionLabel}>Badges</Text>
          {progress && <Text style={styles.actionValue}>{progress.points} pts</Text>}
        </TouchableOpacity>
        <TouchableOpacity role="button" style={styles.actionBtn} onPress={() => navigation.navigate('MesDocuments')}>
          <Text style={styles.actionEmoji} aria-hidden>🗂️</Text>
          <Text style={styles.actionLabel}>Mes docs</Text>
          <Text style={styles.actionValue}>N° clés</Text>
        </TouchableOpacity>
        <TouchableOpacity role="button" style={styles.actionBtn} onPress={() => navigation.navigate('Checklist')}>
          <Text style={styles.actionEmoji} aria-hidden>✅</Text>
          <Text style={styles.actionLabel}>Mes démarches</Text>
          <Text style={styles.actionValue}>Étape par étape</Text>
        </TouchableOpacity>
      </View>

      {/* Aller plus loin */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aller plus loin</Text>
        <TouchableOpacity role="button" style={styles.goFurtherRow} onPress={() => navigation.navigate('Courriers')} activeOpacity={0.7}>
          <Text style={styles.goFurtherEmoji} aria-hidden>✉️</Text>
          <View style={styles.goFurtherText}>
            <Text style={styles.goFurtherLabel}>Modèles de courriers</Text>
            <Text style={styles.goFurtherValue}>Prêts à envoyer</Text>
          </View>
          <Text style={styles.goFurtherChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity role="button" style={styles.goFurtherRow} onPress={() => navigation.navigate('Guides')} activeOpacity={0.7}>
          <Text style={styles.goFurtherEmoji} aria-hidden>📖</Text>
          <View style={styles.goFurtherText}>
            <Text style={styles.goFurtherLabel}>Fiches pratiques</Text>
            <Text style={styles.goFurtherValue}>Tout expliqué simplement</Text>
          </View>
          <Text style={styles.goFurtherChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity role="button" style={styles.goFurtherRow} onPress={() => navigation.navigate('Explorer')} activeOpacity={0.7}>
          <Text style={styles.goFurtherEmoji} aria-hidden>🧰</Text>
          <View style={styles.goFurtherText}>
            <Text style={styles.goFurtherLabel}>Tous les outils</Text>
            <Text style={styles.goFurtherValue}>Parcours, agenda, quiz, simulateur d'épargne</Text>
          </View>
          <Text style={styles.goFurtherChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations</Text>
        <InfoRow label="Âge" value={`${profile.age} ans`} />
        <InfoRow label="Situation" value={STATUS_LABELS[profile.status]} />
        <InfoRow label="Logement" value={profile.housingType ? HOUSING_TYPE_LABELS[profile.housingType] : 'Non renseigné'} />
        {profile.status === 'etudiant' && (
          <InfoRow label="Type d'école" value={profile.schoolType ? SCHOOL_TYPE_LABELS[profile.schoolType] : '—'} />
        )}
        <InfoRow label="📍 Ville" value={profile.ville || 'Non renseignée'} />

        {/* Modifier ma ville */}
        <TouchableOpacity role="button"
          style={styles.modifyVilleBtn}
          onPress={() => setShowVilleInput(!showVilleInput)}
        >
          <Text style={styles.modifyVilleText}>✏️ Modifier ma ville</Text>
        </TouchableOpacity>

        {showVilleInput && (
          <View style={styles.villeInputContainer}>
            <TextInput
              style={styles.apiInput}
              placeholder="Ta ville ou code postal (ex: Lyon, 69001)"
              placeholderTextColor={colors.textMuted}
              value={villeInput}
              onChangeText={handleVilleChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {detectedGeo ? (
              <>
                <Text style={styles.geoDetected}>
                  {'✅ ' + detectedGeo.ville + ' · ' + detectedGeo.departement + ' · ' + detectedGeo.region}
                </Text>
                {(detectedGeo.homonymes ?? 1) > 1 && (
                  <Text style={styles.geoAmbigu}>
                    {detectedGeo.homonymes} communes portent ce nom. Si ce n'est pas la tienne,
                    tape plutôt ton code postal.
                  </Text>
                )}
              </>
            ) : (
              villeInput.length >= 3 && (
                <Text style={styles.geoNotFound}>Aucune ville trouvée pour cette recherche</Text>
              )
            )}
            <TouchableOpacity role="button"
              style={[styles.apiSaveBtn, !detectedGeo && { opacity: 0.5 }]}
              onPress={handleSaveVille}
              disabled={!detectedGeo}
            >
              <Text style={styles.apiSaveText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modifier ma situation */}
        <TouchableOpacity role="button"
          style={styles.modifyVilleBtn}
          onPress={() => setShowEditSituation(!showEditSituation)}
        >
          <Text style={styles.modifyVilleText}>✏️ Modifier ma situation</Text>
        </TouchableOpacity>

        {showEditSituation && (
          <View style={styles.editContainer}>
            {/* L'âge fait basculer l'éligibilité de plusieurs aides : il doit rester corrigeable. */}
            <Text style={styles.editFieldLabel}>Ton âge</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ton âge"
              placeholderTextColor={colors.textMuted}
              value={editAge}
              onChangeText={(t) => setEditAge(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              inputMode="numeric"
              aria-label="Ton âge en années"
            />
            <Text style={styles.editFieldLabel}>Ta situation</Text>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity role="radio" aria-checked={editStatus === s.value}
                key={s.value}
                style={[styles.statusOption, editStatus === s.value && styles.statusActive]}
                onPress={() => setEditStatus(s.value)}
              >
                <Text style={[styles.statusText, editStatus === s.value && styles.statusTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}

            {editStatus === 'etudiant' && (
              <View style={styles.schoolTypeContainer}>
                {SCHOOL_TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity role="radio" aria-checked={editSchoolType === opt.value}
                    key={opt.value}
                    style={[styles.statusOption, editSchoolType === opt.value && styles.statusActive]}
                    onPress={() => setEditSchoolType(opt.value)}
                  >
                    <Text style={[styles.statusText, editSchoolType === opt.value && styles.statusTextActive]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.schoolTypeHint}>{opt.hint}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.schoolTypeContainer}>
              <Text style={styles.editFieldLabel}>🏠 Logement</Text>
              {HOUSING_OPTIONS.map((opt) => (
                <TouchableOpacity role="radio" aria-checked={editHousingType === opt.value}
                  key={opt.value}
                  style={[styles.statusOption, editHousingType === opt.value && styles.statusActive]}
                  onPress={() => setEditHousingType(opt.value)}
                >
                  <Text style={[styles.statusText, editHousingType === opt.value && styles.statusTextActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.schoolTypeHint}>{opt.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity role="button" style={styles.apiSaveBtn} onPress={handleSaveSituation}>
              <Text style={styles.apiSaveText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Finance card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Finances mensuelles</Text>
        <InfoRow label="Revenus" value={`${profile.monthlySalary} €`} valueColor={colors.success} />
        <View style={styles.separator} />
        <InfoRow label="🏠 Loyer" value={`${profile.expenses.loyer} €`} />
        <InfoRow label="📱 Abonnements" value={`${profile.expenses.abonnements} €`} />
        <InfoRow label="⚡ Électricité" value={`${profile.expenses.electricite} €`} />
        <InfoRow label="🛒 Courses" value={`${profile.expenses.courses} €`} />
        <InfoRow label="🚌 Transport" value={`${profile.expenses.transport} €`} />
        <InfoRow label="🎉 Sorties" value={`${profile.expenses.sorties} €`} />
        <View style={styles.separator} />
        <InfoRow label="Total dépenses" value={`${totalExpenses} €`} valueColor={colors.danger} />
        <InfoRow label="Reste disponible" value={`${reste} €`} valueColor={reste >= 0 ? colors.success : colors.danger} />

        {/* Modifier mes finances */}
        <TouchableOpacity role="button"
          style={styles.modifyVilleBtn}
          onPress={() => setShowEditFinances(!showEditFinances)}
        >
          <Text style={styles.modifyVilleText}>✏️ Modifier mes finances</Text>
        </TouchableOpacity>

        {showEditFinances && (
          <View style={styles.editContainer}>
            <Text style={styles.editFieldLabel}>Revenus mensuels (€)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ex: 1200"
              placeholderTextColor={colors.textMuted}
              value={editSalary}
              onChangeText={setEditSalary}
              keyboardType="numeric"
            />

            <Text style={styles.editFieldLabel}>🏠 Loyer (€)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ex: 500"
              placeholderTextColor={colors.textMuted}
              value={editLoyer}
              onChangeText={setEditLoyer}
              keyboardType="numeric"
            />

            <Text style={styles.editFieldLabel}>📱 Abonnements (€)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ex: 50"
              placeholderTextColor={colors.textMuted}
              value={editAbonnements}
              onChangeText={setEditAbonnements}
              keyboardType="numeric"
            />

            <Text style={styles.editFieldLabel}>⚡ Électricité (€)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ex: 40"
              placeholderTextColor={colors.textMuted}
              value={editElectricite}
              onChangeText={setEditElectricite}
              keyboardType="numeric"
            />

            <Text style={styles.editFieldLabel}>🛒 Courses (€)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ex: 200"
              placeholderTextColor={colors.textMuted}
              value={editCourses}
              onChangeText={setEditCourses}
              keyboardType="numeric"
            />

            <Text style={styles.editFieldLabel}>🚌 Transport (€)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ex: 80"
              placeholderTextColor={colors.textMuted}
              value={editTransport}
              onChangeText={setEditTransport}
              keyboardType="numeric"
            />

            <Text style={styles.editFieldLabel}>🎉 Sorties (€)</Text>
            <TextInput
              style={styles.apiInput}
              placeholder="Ex: 100"
              placeholderTextColor={colors.textMuted}
              value={editSorties}
              onChangeText={setEditSorties}
              keyboardType="numeric"
            />

            <TouchableOpacity role="button" style={styles.apiSaveBtn} onPress={handleSaveFinances}>
              <Text style={styles.apiSaveText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Settings card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Réglages</Text>

        {/* Claude API Key */}
        <TouchableOpacity role="button" style={styles.settingRow} onPress={() => setShowApiInput(!showApiInput)}>
          <Text style={styles.settingEmoji} aria-hidden>🤖</Text>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Chat IA (Claude API)</Text>
            <Text style={styles.settingDesc}>
              {profile.claudeApiKey ? '✅ Clé configurée' : 'Ajoute ta clé pour des réponses IA'}
            </Text>
          </View>
          <Text style={styles.chevron}>{showApiInput ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showApiInput && (
          <View style={styles.apiInputContainer}>
            <Text style={styles.apiHint}>
              Obtiens ta clé sur console.anthropic.com{'\n'}
              La clé reste stockée localement sur ton appareil.
            </Text>
            <TextInput
              style={styles.apiInput}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.textMuted}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <TouchableOpacity role="button" style={styles.apiSaveBtn} onPress={handleSaveApiKey}>
              <Text style={styles.apiSaveText}>
                {apiKey.trim() ? 'Sauvegarder' : 'Supprimer la clé'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Confidentialité — mise en avant : c'est un argument de confiance,
          pas une mention légale à enterrer en bas de page. */}
      <TouchableOpacity
        style={styles.privacyRow}
        onPress={() => navigation.navigate('Confidentialite')}
        activeOpacity={0.7}
        role="button"
        aria-label="Confidentialité et gestion de mes données"
      >
        <Text style={styles.privacyEmoji} aria-hidden>🔒</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.privacyTitle}>Confidentialité</Text>
          <Text style={styles.privacyDesc}>Tes données restent sur ton appareil</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Mentions légales : obligatoires (LCEN), et exigées par les stores. */}
      <TouchableOpacity
        style={styles.legalRow}
        onPress={() => navigation.navigate('MentionsLegales')}
        activeOpacity={0.7}
        role="button"
        aria-label="Mentions légales et conditions d'utilisation"
      >
        <Text style={styles.legalText}>Mentions légales et conditions d'utilisation</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Reset */}
      <TouchableOpacity role="button" style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetText}>Recommencer l'onboarding</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  privacyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.07)',
    borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingVertical: 14, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  privacyEmoji: { fontSize: 20 },
  privacyTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  privacyDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  legalRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  legalText: { flex: 1, fontSize: 14, color: colors.textSecondary },
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  avatarWrapper: { position: 'relative', marginBottom: spacing.sm },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarOverlayIcon: { fontSize: 12 },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: colors.white },
  name: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  statusBadge: { fontSize: 14, color: colors.primaryLight, marginTop: 4 },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: radius.full, marginTop: 8, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  premiumBadgeText: { fontSize: 13, fontWeight: '600', color: colors.warning },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  actionBtn: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  actionEmoji: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  actionValue: { fontSize: 12, color: colors.primaryLight, marginTop: 2 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
  },
  settingEmoji: { fontSize: 20, marginRight: 12 },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  settingDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  chevron: { fontSize: 12, color: colors.textMuted },
  apiInputContainer: { paddingTop: spacing.sm },
  apiHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 18 },
  apiInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 12, fontSize: 14, color: colors.text, marginBottom: spacing.sm,
  },
  apiSaveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, padding: 12, alignItems: 'center',
  },
  apiSaveText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  goFurtherRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  goFurtherEmoji: { fontSize: 22, marginRight: 12 },
  goFurtherText: { flex: 1 },
  goFurtherLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  goFurtherValue: { fontSize: 12, color: colors.primaryLight, marginTop: 1 },
  goFurtherChevron: { fontSize: 20, color: colors.textMuted },
  resetBtn: {
    paddingVertical: 16, borderRadius: radius.md, backgroundColor: colors.dangerBg,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', marginTop: spacing.sm,
  },
  resetText: { color: colors.dangerText, fontWeight: '600', fontSize: 15 },
  modifyVilleBtn: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    alignSelf: 'flex-start',
  },
  modifyVilleText: { color: colors.primaryLight, fontWeight: '600', fontSize: 13 },
  villeInputContainer: { paddingTop: spacing.sm },
  geoDetected: { marginTop: spacing.sm, fontSize: 13, color: '#22c55e', fontWeight: '500' },
  geoAmbigu: { marginTop: 4, fontSize: 12, color: colors.warning, lineHeight: 17 },
  geoNotFound: { marginTop: spacing.sm, fontSize: 12, color: colors.textMuted },
  editContainer: { paddingTop: spacing.sm },
  statusOption: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  statusActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  statusText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  statusTextActive: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  schoolTypeContainer: { marginTop: spacing.sm },
  schoolTypeHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
  },
  editFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 4,
  },
});

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 14, color: colors.textSecondary },
  value: { fontSize: 14, fontWeight: '600', color: colors.text },
});
