import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatMessage, UserProfile, RootStackParamList } from '../types';
import { saveChatMessages, loadChatMessages, loadProfile } from '../utils/storage';
import { getParrainResponse, ParrainResult } from '../utils/parrainAI';
import { askClaude, ClaudeAPIError, ClaudeErrorType } from '../utils/claudeAPI';
import { trackAction } from '../utils/gamification';
import { colors, radius, spacing } from '../theme';
import MarkdownText from '../components/MarkdownText';

function getSuggestedQuestions(profile: UserProfile | null): string[] {
  const questions: string[] = [];

  // APL — non pertinent si chez les parents
  if (profile?.housingType === 'futur') {
    questions.push("Je pars vivre seul, par quoi je commence ?");
  } else if (profile?.housingType !== 'parents') {
    questions.push("Comment demander l'APL ?");
  } else {
    questions.push("Quelles aides puis-je toucher chez mes parents ?");
  }

  // CROUS — non pertinent si école privée non conventionnée
  if (profile?.status === 'etudiant' && profile?.schoolType !== 'prive_non_reconnu') {
    questions.push("Comment demander la bourse CROUS ?");
  }

  // Déclaration impôts — priorité pour première expérience salariés/apprentis
  const isPremiereDéclaration = profile?.status === 'apprenti' || profile?.status === 'salarie' || profile?.status === 'auto_entrepreneur';
  if (isPremiereDéclaration) {
    questions.push("Comment faire ma première déclaration d'impôts ?");
  } else {
    questions.push("J'ai reçu une lettre des impôts");
  }

  // Quatrième question — calée sur la situation réelle.
  // Proposer « c'est quoi un ETF ? » à quelqu'un sans revenu n'est pas neutre :
  // ça signale une app qui ne l'a pas écouté.
  if (profile?.status === 'apprenti' || profile?.status === 'salarie') {
    questions.push("Comment lire ma fiche de paie ?");
  } else if (profile?.status === 'recherche_emploi') {
    questions.push("Je n'ai pas d'emploi, à quoi j'ai droit ?");
  } else {
    // Le critère est le reste à vivre, pas le salaire : quelqu'un qui gagne
    // 400 € et dépense 508 € n'a rien à placer. Lui proposer un ETF signale
    // une app qui n'a pas lu ce qu'il vient de saisir.
    const depenses = profile?.expenses
      ? Object.values(profile.expenses).reduce((a, b) => a + b, 0)
      : 0;
    const reste = (profile?.monthlySalary ?? 0) - depenses;
    questions.push(reste >= 150 ? "C'est quoi un ETF ?" : "Comment faire mon premier budget ?");
  }

  // Prime d'activité — spécifique alternant
  if (profile?.status === 'apprenti') {
    questions.push("Est-ce que j'ai droit à la prime d'activité ?");
  }

  return questions.slice(0, 4);
}

// Réponses urgences hard-codées — jamais routées vers keywords ni IA
// pour garantir une réponse immédiate, concrète et fiable.
const URGENCE_SITUATIONS: {
  emoji: string;
  label: string;
  userMsg: string;
  response: string;
  actionCard?: ChatMessage['actionCard'];
}[] = [
  {
    emoji: '💸',
    label: "Je n'arrive pas à payer mon loyer",
    userMsg: "Je n'arrive pas à payer mon loyer ce mois-ci.",
    response: `Pas de panique. Voilà tes options **maintenant** :

1. 📞 **Appelle ton propriétaire aujourd'hui** — propose un délai de 15 jours par écrit. La plupart acceptent si tu es transparent et proactif. Ne disparais pas dans le silence.

2. 🏛️ **FSL (Fonds de Solidarité Logement)** — demande à la CAF ou à ton département. Aide d'urgence pour payer le loyer, traitement rapide.

3. 🎓 **Si tu es étudiant : Fonds d'urgence CROUS** — jusqu'à 1 000€, demande sur messervices.etudiant.gouv.fr, décision sous 72h.

4. 💶 **FAJ (Fonds d'Aide aux Jeunes)** — ton département intervient rapidement si tu as moins de 25 ans.

**Ce que tu dois faire maintenant :** envoie un message écrit à ton propriétaire aujourd'hui même. J'ai préparé un modèle pour toi →`,
    actionCard: { label: "📝 Ouvrir le courrier 'Demande de délai loyer'", courrierId: 'demande-delai-loyer' },
  },
  {
    emoji: '📬',
    label: "J'ai reçu une mise en demeure",
    userMsg: "J'ai reçu une mise en demeure.",
    response: `Une mise en demeure, c'est sérieux — mais pas une catastrophe si tu réagis vite.

1. ⏱️ **Lis-la attentivement** — elle précise de quoi il s'agit (loyer, dettes, travaux...) et le délai pour réagir (souvent 8 ou 15 jours).

2. 📝 **Réponds par écrit sous 48h** — même pour dire que tu prends note. Ça prouve ta bonne foi et suspend les délais.

3. 🏢 **ADIL** (adil.org) — conseil juridique gratuit sur le logement. Appelle ou prends RDV, c'est rapide et confidentiel.

4. 💬 **Si c'est une dette** — propose un plan d'apurement (remboursement échelonné). La plupart des créanciers acceptent si tu proposes quelque chose de concret.

**Le plus important : ne pas ignorer.** Une mise en demeure ignorée devient une procédure judiciaire.`,
    actionCard: { label: "📝 Ouvrir le courrier 'Réponse mise en demeure'", courrierId: 'reponse-mise-en-demeure' },
  },
  {
    emoji: '🪙',
    label: "Plus d'argent avant la fin du mois",
    userMsg: "Je n'ai plus d'argent avant la fin du mois.",
    response: `Voilà les aides d'urgence accessibles **cette semaine** :

1. 🆘 **Aide d'urgence CROUS** — si tu es étudiant, jusqu'à 600€ débloqués en 48h. Demande sur messervices.etudiant.gouv.fr.

2. 💶 **FAJ (Fonds d'Aide aux Jeunes)** — si tu as moins de 25 ans, ton CCAS ou ton département peut débloquer une aide rapidement.

3. 🛒 **Épiceries solidaires** — Croix-Rouge (lacroix-rouge.fr), banques alimentaires, épiceries CROUS. Courses à -70% ou gratuites.

4. 📱 **CAF — aide exceptionnelle** — si tu touches des allocations, la CAF peut accorder une aide exceptionnelle en ligne sur caf.fr.

5. 💳 **Microcrédit ADIE** — jusqu'à 300€ sans condition en 48h pour faire face à une urgence (adie.org).

Dis-moi ta situation exacte (étudiant, salarié, combien il te reste de jours) pour que je t'oriente plus précisément.`,
    actionCard: { label: "🎯 Voir toutes mes aides disponibles", navigateTo: 'SimulateurAides' },
  },
  {
    emoji: '🏥',
    label: "Je n'ai pas de mutuelle / sécu",
    userMsg: "Je n'ai pas de mutuelle et je dois voir un médecin.",
    response: `Sans mutuelle, voilà comment voir un médecin **sans te ruiner** :

1. 🏥 **Médecin secteur 1** — honoraires encadrés à 26,50€. La Sécu rembourse 70% = tu paies ~8€ de ta poche. Cherche sur doctolib.fr > filtre "secteur 1 / sans dépassement".

2. 💊 **CSS (Complémentaire Santé Solidaire)** — si tes revenus sont modestes, tu as droit à une mutuelle **gratuite**. Demande sur ameli.fr. Tu peux l'obtenir sous 48h.

3. 🏢 **Centre de santé municipal** — consultations gratuites ou à prix libre dans la plupart des grandes villes.

4. 🎓 **LMDE ou SMERRA** — si tu es étudiant, mutuelle étudiante à moins de 10€/mois.

**Si tu n'as pas encore de numéro de Sécu**, c'est urgent — rends-toi à la CPAM de ta ville avec ta pièce d'identité et justificatif de domicile.`,
    actionCard: { label: "📖 Voir la fiche CSS — mutuelle gratuite", guideId: 'css-mutuelle-gratuite' },
  },
  {
    emoji: '⚖️',
    label: "J'ai reçu une amende ou un acte d'huissier",
    userMsg: "J'ai reçu une amende ou un acte d'huissier.",
    response: `**Pour une amende :**

1. 📅 **Vérifie le délai** — tu as 45 jours pour contester ou payer. Passé ce délai, la majoration s'applique automatiquement.
2. 🖥️ **Paiement en ligne** sur amendes.gouv.fr — tu peux aussi demander un paiement en plusieurs fois.
3. ⚖️ **Contestation possible** — si tu penses être dans ton droit, conteste par lettre recommandée dans le délai.

**Pour un acte d'huissier :**

1. 📋 **Lis l'acte immédiatement** — il précise la nature de la dette et le délai pour réagir (souvent 1 mois).
2. 💬 **Contacte l'huissier** — propose un plan de remboursement. Ils préfèrent être remboursés que saisir des biens.
3. 🆘 **CCAS de ta mairie** — peut t'aider à négocier ou trouver un financement d'urgence.

**Important : n'ignore jamais un acte d'huissier.** Réponds dans le délai indiqué, même par courrier simple.`,
    actionCard: { label: "📝 Ouvrir le courrier 'Contestation d'amende'", courrierId: 'contestation-amende' },
  },
];

export default function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [userHasSent, setUserHasSent] = useState(false);
  const [showUrgence, setShowUrgence] = useState(false);
  const [apiErrorType, setApiErrorType] = useState<ClaudeErrorType | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Détecte un message pré-rempli depuis Budget ("C'est serré !") et l'auto-envoie
  useFocusEffect(
    useCallback(() => {
      if (!profile) return; // attend que le profil soit chargé
      AsyncStorage.getItem('@kichtapp_pending_chat').then((pending) => {
        if (!pending) return;
        AsyncStorage.removeItem('@kichtapp_pending_chat');
        handleSuggestedQuestion(pending);
      });
    // handleSuggestedQuestion capture profile via closure — on re-crée quand profile change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile])
  );

  useEffect(() => {
    Promise.all([loadChatMessages(), loadProfile()]).then(([msgs, prof]) => {
      setProfile(prof);
      if (msgs.length === 0) {
        const welcome: ChatMessage = {
          id: 'welcome',
          text: prof
            ? `Salut ${prof.firstName.charAt(0).toUpperCase() + prof.firstName.slice(1)} ! 👋 Je suis Le Parrain, ton guide pour la vie adulte. Pose-moi une question sur le budget, les impôts, les aides, le premier appart… Je suis là pour t'aider !`
            : 'Salut ! 👋 Je suis Le Parrain. Pose-moi une question sur le budget, les impôts, les aides, le premier appart…',
          sender: 'parrain',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcome]);
      } else {
        setMessages(msgs);
        // If there are user messages beyond the welcome, mark as sent
        const hasUserMsg = msgs.some((m) => m.sender === 'user');
        if (hasUserMsg) setUserHasSent(true);
      }
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveChatMessages(messages);
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setUserHasSent(true);

    // Track gamification
    trackAction('chat');

    try {
      let parrainResult: ParrainResult | null = null;
      let aiText: string | null = null;

      // Use Claude if premium AND has API key configured
      if (profile?.claudeApiKey) {
        const history = messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.text,
          }));
        aiText = await askClaude(text, profile, profile.claudeApiKey, history);
        setApiErrorType(null); // succès — on efface l'éventuelle bannière d'erreur
      } else {
        // Sans clé API : moteur de règles. C'est le mode nominal pour la quasi-totalité
        // des utilisateurs — personne dans la cible n'a de clé API Anthropic.
        await new Promise((r) => setTimeout(r, 300));
        parrainResult = getParrainResponse(text, profile);
      }

      const parrainMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiText ?? parrainResult!.text,
        sender: 'parrain',
        timestamp: new Date().toISOString(),
        ...(parrainResult?.actionCard ? { actionCard: parrainResult.actionCard } : {}),
      };
      setMessages((prev) => [...prev, parrainMsg]);
    } catch (error: any) {
      // Affiche la bannière d'erreur avec le type précis
      const errorType: ClaudeErrorType = error instanceof ClaudeAPIError ? error.type : 'unknown';
      setApiErrorType(errorType);

      // Fallback silencieux — le message parrain reste naturel, sans jargon technique
      const fallback = getParrainResponse(text, profile);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: fallback.text,
        sender: 'parrain',
        timestamp: new Date().toISOString(),
        ...(fallback.actionCard ? { actionCard: fallback.actionCard } : {}),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    // Trigger send immediately
    const text = question.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setUserHasSent(true);

    trackAction('chat');

    (async () => {
      try {
        let parrainResult: ParrainResult | null = null;
        let aiText: string | null = null;
        // Use Claude if premium AND has API key configured
        if (profile?.claudeApiKey) {
          const history = messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({
              role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: m.text,
            }));
          aiText = await askClaude(text, profile, profile.claudeApiKey, history);
          setApiErrorType(null);
        } else {
          await new Promise((r) => setTimeout(r, 300));
          parrainResult = getParrainResponse(text, profile);
        }
        const parrainMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText ?? parrainResult!.text,
          sender: 'parrain',
          timestamp: new Date().toISOString(),
          ...(parrainResult?.actionCard ? { actionCard: parrainResult.actionCard } : {}),
        };
        setMessages((prev) => [...prev, parrainMsg]);
      } catch (error: any) {
        const errorType: ClaudeErrorType = error instanceof ClaudeAPIError ? error.type : 'unknown';
        setApiErrorType(errorType);

        const fallback = getParrainResponse(text, profile);
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: fallback.text,
          sender: 'parrain',
          timestamp: new Date().toISOString(),
          ...(fallback.actionCard ? { actionCard: fallback.actionCard } : {}),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setLoading(false);
      }
    })();
  };

  // Bouton header — réinitialise la conversation
  // Utilise useRef pour éviter les closures figées dans setOptions
  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  const doResetConversation = () => {
    const currentProfile = profileRef.current;
    const welcome: ChatMessage = {
      id: 'welcome',
      text: currentProfile
        ? `Salut ${currentProfile.firstName.charAt(0).toUpperCase() + currentProfile.firstName.slice(1)} ! 👋 Je suis Le Parrain, ton guide pour la vie adulte. Pose-moi une question sur le budget, les impôts, les aides, le premier appart… Je suis là pour t'aider !`
        : 'Salut ! 👋 Je suis Le Parrain. Pose-moi une question sur le budget, les impôts, les aides, le premier appart…',
      sender: 'parrain',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    setUserHasSent(false);
    setShowUrgence(false);
    saveChatMessages([]);
  };

  const handleNewConversation = () => {
    if (Platform.OS === 'web') {
      // Alert.alert → window.confirm peut être bloqué dans certains contextes web
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Effacer l'historique et repartir de zéro ?")) {
        doResetConversation();
      }
    } else {
      Alert.alert(
        'Nouvelle conversation',
        "Effacer l'historique et repartir de zéro ?",
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Effacer', style: 'destructive', onPress: doResetConversation },
        ]
      );
    }
  };

  // handleNewConversation dans une ref pour que setOptions ne capture jamais une closure figée
  const handleNewConversationRef = useRef(handleNewConversation);
  useEffect(() => { handleNewConversationRef.current = handleNewConversation; });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity role="button"
          onPress={() => handleNewConversationRef.current()}
          style={{ marginRight: 4 }}
        >
          <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '500' }}>
            🗑️ Nouvelle
          </Text>
        </TouchableOpacity>
      ),
    });
  // setOptions une seule fois au montage — handleNewConversationRef.current reste toujours à jour
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Réponse urgence — bypass total IA/keywords, réponse immédiate hard-codée
  const handleUrgence = (situation: typeof URGENCE_SITUATIONS[0]) => {
    setShowUrgence(false);
    setUserHasSent(true);
    trackAction('chat');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: situation.userMsg,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const parrainMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: situation.response,
      sender: 'parrain',
      timestamp: new Date().toISOString(),
      ...(situation.actionCard ? { actionCard: situation.actionCard } : {}),
    };

    setMessages((prev) => [...prev, userMsg, parrainMsg]);
  };

  // ID du premier message Parrain en réponse à l'utilisateur (pas le welcome)
  const firstParrainReplyId = messages.find((m) => m.sender === 'parrain' && m.id !== 'welcome')?.id ?? null;

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <View>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.parrainBubble]}>
          {!isUser && <Text style={styles.senderLabel}>🎩 Le Parrain</Text>}
          <MarkdownText text={item.text} isUser={isUser} />
        </View>
        {/* Bouton d'action — routing vers courrier, guide, ou écran */}
        {item.actionCard && (
          <TouchableOpacity role="button"
            style={styles.actionCardBtn}
            onPress={() => {
              const card = item.actionCard!;
              if (card.courrierId) {
                navigation.navigate('CourrierDetail', { courrierId: card.courrierId });
              } else if (card.guideId) {
                navigation.navigate('GuideDetail', { guideId: card.guideId });
              } else if (card.navigateTo) {
                navigation.navigate(card.navigateTo as any);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionCardText}>{item.actionCard.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Indicateur IA — affiché UNIQUEMENT quand l'IA tourne réellement.
          Sans clé API, les réponses viennent du moteur de règles : annoncer
          "Mode IA activé" dans ce cas serait faux. */}
      {profile?.claudeApiKey && !apiErrorType && (
        <View style={styles.aiIndicator}>
          <Text style={styles.aiIndicatorText}>🤖 IA activée — clé API personnelle</Text>
        </View>
      )}

      {/* Bannière d'erreur API — s'affiche uniquement si l'IA est indisponible */}
      {apiErrorType && (
        <View style={styles.apiBanner}>
          <Text style={styles.apiBannerText}>
            {apiErrorType === 'network' && '📡 Pas de connexion — Le Parrain répond en mode hors ligne'}
            {apiErrorType === 'auth' && '🔑 Clé API invalide — vérifie tes réglages'}
            {apiErrorType === 'rate_limit' && '⏳ Trop de requêtes — réessaie dans quelques secondes'}
            {(apiErrorType === 'server' || apiErrorType === 'unknown') && '⚠️ Le Parrain est temporairement indisponible — mode hors ligne actif'}
          </Text>
          <TouchableOpacity role="button" aria-label="Fermer ce message" onPress={() => setApiErrorType(null)}>
            <Text style={styles.apiBannerClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Questions rapides — barre persistante horizontale */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickBar}
        contentContainerStyle={styles.quickBarContent}
        keyboardShouldPersistTaps="handled"
      >
        {getSuggestedQuestions(profile).map((q, i) => (
          <TouchableOpacity role="button"
            key={i}
            style={styles.quickChip}
            onPress={() => handleSuggestedQuestion(q)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.typingText}>Le Parrain réfléchit…</Text>
        </View>
      )}

      {/* Mode urgence */}
      <View style={styles.urgenceBar}>
        <TouchableOpacity role="button"
          style={styles.urgenceToggle}
          onPress={() => setShowUrgence(!showUrgence)}
          activeOpacity={0.7}
        >
          <Text style={styles.urgenceToggleText}>🚨 Situation urgente</Text>
          <Text style={styles.urgenceChevron}>{showUrgence ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showUrgence && (
          <View style={styles.urgenceGrid}>
            {URGENCE_SITUATIONS.map((s, i) => (
              <TouchableOpacity role="button"
                key={i}
                style={styles.urgenceBtn}
                onPress={() => handleUrgence(s)}
                activeOpacity={0.7}
              >
                <Text style={styles.urgenceEmoji} aria-hidden>{s.emoji}</Text>
                <Text style={styles.urgenceBtnText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Pose ta question…"
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.3 }]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
          role="button"
          aria-label="Envoyer ma question"
          aria-disabled={!input.trim() || loading}
        >
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  aiIndicator: {
    backgroundColor: colors.successBg, paddingVertical: 6, paddingHorizontal: 12,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(16, 185, 129, 0.2)',
  },
  aiIndicatorText: { fontSize: 12, color: colors.success, fontWeight: '600' },
  apiBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 8, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(239, 68, 68, 0.2)',
  },
  apiBannerText: { fontSize: 12, color: '#f87171', fontWeight: '500', flex: 1 },
  apiBannerClose: { fontSize: 14, color: '#f87171', paddingLeft: 10, fontWeight: '600' },
  list: { padding: spacing.md, paddingBottom: spacing.sm },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: radius.lg, marginBottom: 8 },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  parrainBubble: {
    backgroundColor: colors.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  senderLabel: { fontSize: 11, color: colors.primaryLight, fontWeight: '600', marginBottom: 4 },
  messageText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  userText: { color: colors.white },
  typingIndicator: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    paddingVertical: 8, gap: 8,
  },
  typingText: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : spacing.sm,
    backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.text,
    maxHeight: 100, borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  quickBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    maxHeight: 52,
  },
  quickBarContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickChip: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quickChipText: { fontSize: 13, color: colors.text, textAlign: 'center' },

  urgenceBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  urgenceToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, paddingHorizontal: spacing.md, gap: 6,
  },
  urgenceToggleText: { fontSize: 13, fontWeight: '600', color: colors.dangerText },
  urgenceChevron: { fontSize: 10, color: colors.dangerText },
  urgenceGrid: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, gap: 6 },
  urgenceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: radius.md,
    padding: 10, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  urgenceEmoji: { fontSize: 18 },
  urgenceBtnText: { fontSize: 13, color: colors.text, flex: 1 },
  actionCardBtn: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    maxWidth: '85%',
  },
  actionCardText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  inlineUpsell: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    maxWidth: '85%',
  },
  inlineUpsellText: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '600',
  },
});
