import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, ChecklistItem, UserProfile, ChatMessage, UserProgress } from '../types';

const KEYS = {
  TRANSACTIONS: '@kichtapp_transactions',
  CHECKLIST: '@kichtapp_checklist',
  PROFILE: '@kichtapp_profile',
  CHAT: '@kichtapp_chat',
  PROGRESS: '@kichtapp_progress',
} as const;

async function save<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

async function load<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

// Transactions
export const saveTransactions = (t: Transaction[]) => save(KEYS.TRANSACTIONS, t);
export const loadTransactions = async (): Promise<Transaction[]> =>
  (await load<Transaction[]>(KEYS.TRANSACTIONS)) ?? [];

// Checklist
export const saveChecklist = (items: ChecklistItem[]) => save(KEYS.CHECKLIST, items);
export const loadChecklist = () => load<ChecklistItem[]>(KEYS.CHECKLIST);

// Profil
export const saveProfile = (p: UserProfile) => save(KEYS.PROFILE, p);
export const loadProfile = () => load<UserProfile>(KEYS.PROFILE);

// Chat
export const saveChatMessages = (m: ChatMessage[]) => save(KEYS.CHAT, m);
export const loadChatMessages = async (): Promise<ChatMessage[]> =>
  (await load<ChatMessage[]>(KEYS.CHAT)) ?? [];

// Gamification
const DEFAULT_PROGRESS: UserProgress = {
  points: 0,
  earnedBadges: [],
  guidesCompleted: [],
  quizBestScore: 0,
  budgetDaysTracked: 0,
  chatQuestionsAsked: 0,
  courriersUsed: 0,
  streak: 0,
  lastActiveDate: '',
};

export const saveProgress = (p: UserProgress) => save(KEYS.PROGRESS, p);
export const loadProgress = async (): Promise<UserProgress> =>
  (await load<UserProgress>(KEYS.PROGRESS)) ?? { ...DEFAULT_PROGRESS };
