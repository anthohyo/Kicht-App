import { UserProgress } from '../types';
import { allBadges, POINTS } from '../data/badges';
import { loadProgress, saveProgress } from './storage';
import { emitBadgeEarned } from './events';

// Check which badges should be earned based on current progress
export function checkBadges(progress: UserProgress): string[] {
  const newBadges: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !progress.earnedBadges.includes(id)) newBadges.push(id);
  };

  check('bienvenue', true); // Always earned if progress exists
  check('premier-budget', progress.budgetDaysTracked >= 1);
  check('curieux', progress.chatQuestionsAsked >= 1);
  check('budgeteur', progress.budgetDaysTracked >= 10);
  check('quiz-debutant', progress.quizBestScore > 0);
  check('quiz-master', progress.quizBestScore >= 10);
  check('lecteur', progress.guidesCompleted.length >= 1);
  check('expert', progress.guidesCompleted.length >= 5);
  check('administrateur', progress.courriersUsed >= 1);
  check('regulier', progress.streak >= 7);
  check('fidele', progress.streak >= 30);
  check('parrain-fan', progress.chatQuestionsAsked >= 20);

  return newBadges;
}

// Add points and check for new badges
export async function trackAction(
  action: 'transaction' | 'quiz' | 'guide' | 'chat' | 'courrier' | 'login',
  extra?: { quizScore?: number; guideId?: string }
): Promise<{ newBadges: string[]; pointsEarned: number }> {
  const progress = await loadProgress();
  let pointsEarned = 0;

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    progress.streak = progress.lastActiveDate === yesterday ? progress.streak + 1 : 1;
    progress.lastActiveDate = today;
    pointsEarned += POINTS.DAILY_LOGIN;
  }

  switch (action) {
    case 'transaction':
      progress.budgetDaysTracked += 1;
      pointsEarned += POINTS.ADD_TRANSACTION;
      break;
    case 'quiz':
      pointsEarned += POINTS.COMPLETE_QUIZ;
      if (extra?.quizScore !== undefined) {
        progress.quizBestScore = Math.max(progress.quizBestScore, extra.quizScore);
        if (extra.quizScore >= 10) pointsEarned += POINTS.PERFECT_QUIZ;
      }
      break;
    case 'guide':
      if (extra?.guideId && !progress.guidesCompleted.includes(extra.guideId)) {
        progress.guidesCompleted.push(extra.guideId);
        pointsEarned += POINTS.COMPLETE_GUIDE;
      }
      break;
    case 'chat':
      progress.chatQuestionsAsked += 1;
      pointsEarned += POINTS.ASK_QUESTION;
      break;
    case 'courrier':
      progress.courriersUsed += 1;
      pointsEarned += POINTS.USE_COURRIER;
      break;
    case 'login':
      break;
  }

  progress.points += pointsEarned;

  // Check for new badges
  const newBadges = checkBadges(progress);
  progress.earnedBadges = [...progress.earnedBadges, ...newBadges];

  await saveProgress(progress);

  // Emit events one by one with a small delay so toasts don't stack instantly
  newBadges.forEach((id, i) => {
    setTimeout(() => emitBadgeEarned(id), i * 1200);
  });

  return { newBadges, pointsEarned };
}
