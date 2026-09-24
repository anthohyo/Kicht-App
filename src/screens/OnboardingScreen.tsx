import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserProfile, UserStatus, SchoolType, HousingType, PrimaryGoal } from '../types';
import { saveProfile } from '../utils/storage';
import { colors, radius, spacing } from '../theme';
import { detectGeo, Commune } from '../data/geoFrance';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

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

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);

  // Étape 0 — identité + statut
  const [firstName, setFirstName] = useState('');
  // L'âge conditionne six aides (CEJ 16-25, Mobili-Jeune < 30, Visale < 31,
  // transports < 26…). Tant qu'il n'était pas demandé, tout le monde était
  // réputé avoir 20 ans : un jeune de 28 ans se voyait proposer des aides
  // auxquelles il n'a pas droit.
  const [age, setAge] = useState('');
  const [status, setStatus] = useState<UserStatus>('etudiant');

  // Étape 1 — logement + loyer + école + ville
  const [housingType, setHousingType] = useState<HousingType>('seul');
  const [loyer, setLoyer] = useState('');
  const [schoolType, setSchoolType] = useState<SchoolType>('public');
  const [villeInput, setVilleInput] = useState('');
  const [detectedGeo, setDetectedGeo] = useState<Commune | null>(null);
  // Beaucoup de jeunes dorment dans une commune et étudient dans une autre.
  // Le découpage administratif ne permet pas de le deviner : on le demande,
  // plutôt que de rattacher d'office à la grande ville voisine — ce qui
  // attribuerait des aides municipales auxquelles ils n'ont pas droit.
  const [etudieAilleurs, setEtudieAilleurs] = useState(false);
  const [villeEtudesInput, setVilleEtudesInput] = useState('');
  const [geoEtudes, setGeoEtudes] = useState<Commune | null>(null);

  // Étape 2 — revenus
  const [salary, setSalary] = useState('');

  // Étape 3 — intention principale
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>('aides');

  const totalSteps = 4;

  const handleVilleChange = (text: string) => {
    setVilleInput(text);
    const result = detectGeo(text);
    setDetectedGeo(result);
  };

  const handleFinish = async () => {
    const profile: UserProfile = {
      firstName: firstName.trim(),
      age: parseInt(age, 10),
      status,
      monthlySalary: parseFloat(salary) || 0,
      expenses: {
        loyer: parseFloat(loyer) || 0,
        abonnements: 0,
        electricite: 0,
        courses: 0,
        transport: 0,
        sorties: 0,
      },
      onboardingComplete: true,
      housingType,
      primaryGoal,
      ...(status === 'etudiant' ? { schoolType } : {}),
      ...(detectedGeo ? {
        ville: detectedGeo.ville,
        departement: detectedGeo.departement,
        region: detectedGeo.region,
      } : {}),
      ...(etudieAilleurs && geoEtudes ? {
        villeEtudes: geoEtudes.ville,
        departementEtudes: geoEtudes.departement,
        regionEtudes: geoEtudes.region,
      } : {}),
    };
    await saveProfile(profile);
    // Atterrissage adapté à l'intention : "gérer mon mois" → Budget, sinon → Mes aides
    const landingIndex = primaryGoal === 'budget' ? 2 : 1;
    navigation.reset({
      index: 0,
      routes: [{
        name: 'Main',
        state: {
          index: landingIndex,
          routes: [
            { name: 'Home' },
            { name: 'Aides' },
            { name: 'Budget' },
            { name: 'Chat' },
          ],
        },
      }],
    });
  };

  const ageValide = () => {
    const n = parseInt(age, 10);
    return Number.isFinite(n) && n >= 14 && n <= 99;
  };

  const canNext = () => {
    if (step === 0) return firstName.trim().length > 0 && ageValide();
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else handleFinish();
  };

  const renderStep = () => {
    switch (step) {

      /* ── ÉTAPE 0 : Identité + Statut ── */
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.emoji} aria-hidden>👋</Text>
            <Text style={styles.stepTitle}>Comment tu t'appelles ?</Text>
            <Text style={styles.stepDesc}>
              Ton prénom et ton âge, c'est tout ce qu'on demande. L'âge sert à savoir quelles
              aides te concernent : beaucoup s'arrêtent à 25, 26 ou 30 ans.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ton prénom"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              autoFocus
              aria-label="Ton prénom"
            />
            <TextInput
              style={styles.input}
              placeholder="Ton âge"
              placeholderTextColor={colors.textMuted}
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="number-pad"
              inputMode="numeric"
              aria-label="Ton âge en années"
            />
            {age.length > 0 && !ageValide() && (
              <Text style={styles.ageErreur} aria-live="polite">
                Indique un âge entre 14 et 99 ans.
              </Text>
            )}

            <Text style={styles.label}>Et tu es… ?</Text>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity role="radio" aria-checked={status === s.value}
                key={s.value}
                style={[styles.statusOption, status === s.value && styles.statusActive]}
                onPress={() => setStatus(s.value)}
              >
                <Text style={[styles.statusText, status === s.value && styles.statusTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      /* ── ÉTAPE 1 : Logement + Ville ── */
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.emoji} aria-hidden>🏠</Text>
            <Text style={styles.stepTitle}>Ta situation logement</Text>
            <Text style={styles.stepDesc}>
              Ça nous permet de calculer tes droits à l'APL et aux aides logement.
            </Text>

            {HOUSING_OPTIONS.map((opt) => (
              <TouchableOpacity role="radio" aria-checked={housingType === opt.value}
                key={opt.value}
                style={[styles.statusOption, housingType === opt.value && styles.statusActive]}
                onPress={() => setHousingType(opt.value)}
              >
                <Text style={[styles.statusText, housingType === opt.value && styles.statusTextActive]}>
                  {opt.label}
                </Text>
                <Text style={{ fontSize: 11, color: housingType === opt.value ? colors.primaryLight : colors.textMuted, marginTop: 2 }}>
                  {opt.hint}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Loyer — réel si déjà logé, visé si emménagement à venir */}
            {housingType !== 'parents' && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.label}>
                  {housingType === 'futur' ? '🎯 Le loyer que tu vises' : '💸 Ton loyer mensuel'}{' '}
                  <Text style={{ color: colors.textMuted, fontWeight: 'normal' }}>(charges comprises)</Text>
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                  {housingType === 'futur'
                    ? 'Même approximatif — on te dira ce que ça te coûtera vraiment une fois l\'APL déduite'
                    : 'Nécessaire pour calculer ton reste à vivre et ton APL estimée'}
                </Text>
                <TextInput
                  style={[styles.input, { fontSize: 20, fontWeight: '600' }]}
                  placeholder="Ex : 550"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={loyer}
                  onChangeText={setLoyer}
                />
              </View>
            )}

            {/* École — uniquement pour les étudiants */}
            {status === 'etudiant' && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.label}>🏫 Ton type d'établissement</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                  Détermine si tu as accès à la bourse CROUS
                </Text>
                {([
                  { value: 'public' as SchoolType, label: '🏛️ Université / IUT / BTS public', hint: 'Bourse CROUS accessible' },
                  { value: 'prive_reconnu' as SchoolType, label: '🏢 Grande école / école privée reconnue', hint: 'Vérifier avec ton école' },
                  { value: 'prive_non_reconnu' as SchoolType, label: '🏫 École privée non conventionnée', hint: 'EFAP, ESG, ISCOM…' },
                ] as { value: SchoolType; label: string; hint: string }[]).map((opt) => (
                  <TouchableOpacity role="radio" aria-checked={schoolType === opt.value}
                    key={opt.value}
                    style={[styles.statusOption, schoolType === opt.value && styles.statusActive]}
                    onPress={() => setSchoolType(opt.value)}
                  >
                    <Text style={[styles.statusText, schoolType === opt.value && styles.statusTextActive]}>
                      {opt.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: schoolType === opt.value ? colors.primaryLight : colors.textMuted, marginTop: 2 }}>
                      {opt.hint}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Ville — optionnelle */}
            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.label}>📍 Ta ville</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                Certaines mairies offrent des aides directes aux jeunes — renseigne ta ville pour ne rien rater.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Lyon, Marseille, 75001…"
                placeholderTextColor={colors.textMuted}
                value={villeInput}
                onChangeText={handleVilleChange}
              />
              {detectedGeo ? (
                <>
                  <Text style={styles.geoDetected}>
                    {'✅ ' + detectedGeo.ville + ' · ' + detectedGeo.departement + ' · ' + detectedGeo.region}
                  </Text>
                  {/* Neuf communes s'appellent Sainte-Marie : sans cet avertissement,
                      on attribuerait silencieusement le mauvais département, donc les
                      mauvaises aides. */}
                  {(detectedGeo.homonymes ?? 1) > 1 && (
                    <Text style={styles.geoAmbigu}>
                      {detectedGeo.homonymes} communes portent ce nom. Si ce n'est pas la tienne,
                      tape plutôt ton code postal.
                    </Text>
                  )}
                </>
              ) : (
                villeInput.length >= 3 && (
                  <Text style={styles.geoNotFound}>Aucune ville trouvée — pas de souci, tu pourras la renseigner plus tard</Text>
                )
              )}

              <TouchableOpacity
                style={styles.caseAcocher}
                onPress={() => setEtudieAilleurs(!etudieAilleurs)}
                activeOpacity={0.7}
                role="checkbox"
                aria-checked={etudieAilleurs}
                aria-label="J'étudie ou je travaille dans une autre ville"
              >
                <View style={[styles.caseCarre, etudieAilleurs && styles.caseCochee]}>
                  {etudieAilleurs && <Text style={styles.caseMarque} aria-hidden>✓</Text>}
                </View>
                <Text style={styles.caseTexte}>J'étudie ou je travaille dans une autre ville</Text>
              </TouchableOpacity>

              {etudieAilleurs && (
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                    Le réseau de transport et le CROUS dépendent de là où tu étudies, pas de là où tu dors.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ville de tes études ou de ton travail"
                    placeholderTextColor={colors.textMuted}
                    value={villeEtudesInput}
                    onChangeText={(v) => { setVilleEtudesInput(v); setGeoEtudes(detectGeo(v)); }}
                    aria-label="Ville de tes études ou de ton travail"
                  />
                  {geoEtudes ? (
                    <Text style={styles.geoDetected}>
                      {'✅ ' + geoEtudes.ville + ' · ' + geoEtudes.departement + ' · ' + geoEtudes.region}
                    </Text>
                  ) : (
                    villeEtudesInput.length >= 3 && (
                      <Text style={styles.geoNotFound}>Aucune ville trouvée</Text>
                    )
                  )}
                </View>
              )}
            </View>
          </View>
        );

      /* ── ÉTAPE 2 : Revenus ── */
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.emoji} aria-hidden>💰</Text>
            <Text style={styles.stepTitle}>
              {firstName ? `${firstName}, combien tu gagnes ?` : 'Tes revenus'}
            </Text>
            <Text style={styles.stepDesc}>
              On calcule aussitôt les aides que tu rates peut-être.
            </Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Revenu mensuel en €"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={salary}
              onChangeText={setSalary}
              autoFocus
            />
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 19 }}>
              💡 Inclus tout : bourse CROUS, salaire, job étudiant, aide de tes parents, APL si tu la touches déjà.
            </Text>

            {/* Exemple contextualisé */}
            <View style={styles.exampleCard}>
              <Text style={styles.exampleTitle}>
                {status === 'etudiant' ? '🎓 Étudiant·e moyen·ne en France' :
                 status === 'apprenti' ? '🔧 Alternant·e au SMIC' :
                 '💼 Premier emploi'}
              </Text>
              <Text style={styles.exampleText}>
                {status === 'etudiant' ? 'Bourse CROUS + job étudiant ≈ 600–800 €/mois. APL possible en plus.' :
                 status === 'apprenti' ? 'Salaire net ≈ 800–1 200 €/mois selon ton niveau. Prime d\'activité peut s\'y ajouter.' :
                 'SMIC net ≈ 1 400 €/mois. Prime d\'activité si tu es sous 1 800 €.'}
              </Text>
            </View>
          </View>
        );

      /* ── ÉTAPE 3 : Intention principale ── */
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.emoji} aria-hidden>🎯</Text>
            <Text style={styles.stepTitle}>Qu'est-ce qui t'aiderait le plus maintenant ?</Text>
            <Text style={styles.stepDesc}>
              On personnalise ton accueil selon ta priorité.
            </Text>
            {([
              {
                value: 'aides' as PrimaryGoal,
                label: '🎯 Trouver les aides que je peux avoir',
                hint: 'APL, bourse, prime d\'activité, aides locales…',
              },
              {
                value: 'budget' as PrimaryGoal,
                label: '💰 Gérer mon mois',
                hint: 'Voir clair sur mes dépenses et mon reste à vivre',
              },
              {
                value: 'admin' as PrimaryGoal,
                label: '📋 Comprendre mes démarches',
                hint: 'Impôts, bail, CAF, contrat, fiche de paie…',
              },
            ]).map((opt) => (
              <TouchableOpacity role="radio" aria-checked={primaryGoal === opt.value}
                key={opt.value}
                style={[styles.statusOption, primaryGoal === opt.value && styles.statusActive]}
                onPress={() => setPrimaryGoal(opt.value)}
              >
                <Text style={[styles.statusText, primaryGoal === opt.value && styles.statusTextActive]}>
                  {opt.label}
                </Text>
                <Text style={{ fontSize: 11, color: primaryGoal === opt.value ? colors.primaryLight : colors.textMuted, marginTop: 2 }}>
                  {opt.hint}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        {renderStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity role="button" style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
        )}
        {/* Passer — uniquement sur l'étape logement/ville et revenus */}
        {step >= 1 && (
          <TouchableOpacity role="button" style={styles.skipBtn} onPress={handleNext}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity role="button"
          style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext()}
        >
          <Text style={styles.nextText}>
            {step < totalSteps - 1
              ? 'Suivant →'
              : primaryGoal === 'budget'
                ? '💰 Voir mon mois'
                : primaryGoal === 'admin'
                  ? '💬 Parler au Parrain'
                  : '🎯 Voir mes aides'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 60,
  },

  // Progress dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },

  stepContent: {
    flex: 1,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  caseAcocher: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: spacing.md, paddingVertical: 8,
  },
  caseCarre: {
    width: 20, height: 20, borderRadius: radius.sm,
    borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  caseCochee: { backgroundColor: colors.primary, borderColor: colors.primary },
  caseMarque: { color: colors.white, fontSize: 12, fontWeight: 'bold' },
  caseTexte: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 19 },
  ageErreur: {
    fontSize: 13,
    color: colors.dangerText,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputLarge: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
  },
  geoDetected: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  geoAmbigu: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 4,
    lineHeight: 17,
  },
  geoNotFound: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textMuted,
  },
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

  // Exemple card (étape 2)
  exampleCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  backText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  skipBtn: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipText: {
    color: colors.textMuted,
    fontWeight: '500',
    fontSize: 14,
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
