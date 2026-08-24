import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { quizQuestions } from '../data/quizQuestions';
import { trackAction } from '../utils/gamification';
import { colors, radius, spacing } from '../theme';

const QUIZ_BEST_KEY = '@kichtapp_quiz_best';

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(QUIZ_BEST_KEY).then((v) => {
      if (v !== null) setBestScore(parseInt(v));
    });
  }, []);

  const question = quizQuestions[currentIndex];

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= quizQuestions.length) {
      setFinished(true);
      // Persiste le meilleur score et donne des points
      const newBest = bestScore === null || score + 1 > bestScore ? score + 1 : bestScore;
      AsyncStorage.setItem(QUIZ_BEST_KEY, String(newBest));
      setBestScore(newBest);
      trackAction('quiz');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedIndex(null);
    setFinished(false);
  };

  if (finished) {
    const ratio = score / quizQuestions.length;
    let message: string;
    let emoji: string;
    if (ratio >= 0.8) {
      message = 'Tu maîtrises les bases de la vie adulte !';
      emoji = '🏆';
    } else if (ratio >= 0.5) {
      message = 'Pas mal ! Continue à apprendre.';
      emoji = '👍';
    } else {
      message = 'Pas grave, c\'est en apprenant qu\'on progresse !';
      emoji = '💪';
    }

    return (
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultScore}>
          {score} / {quizQuestions.length}
        </Text>
        <Text style={styles.resultMessage}>{message}</Text>
        {bestScore !== null && bestScore >= score && bestScore > 0 && (
          <Text style={styles.bestScore}>🏆 Ton record : {bestScore}/{quizQuestions.length}</Text>
        )}
        {bestScore !== null && score > (bestScore ?? 0) && (
          <Text style={styles.newRecord}>🎉 Nouveau record !</Text>
        )}
        <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
          <Text style={styles.restartText}>Recommencer le quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.progress}>
        Question {currentIndex + 1} / {quizQuestions.length}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` },
          ]}
        />
      </View>

      <Text style={styles.question}>{question.question}</Text>

      {question.options.map((opt, i) => {
        let bg = colors.card;
        let border = colors.border;
        if (selectedIndex !== null) {
          if (i === question.correctIndex) {
            bg = colors.successBg;
            border = colors.success;
          } else if (i === selectedIndex) {
            bg = colors.dangerBg;
            border = colors.danger;
          }
        }

        return (
          <TouchableOpacity
            key={i}
            style={[styles.option, { backgroundColor: bg, borderColor: border }]}
            onPress={() => handleSelect(i)}
            disabled={selectedIndex !== null}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        );
      })}

      {selectedIndex !== null && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>
            {selectedIndex === question.correctIndex ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}
          </Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}

      {selectedIndex !== null && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex + 1 >= quizQuestions.length ? 'Voir le résultat' : 'Question suivante →'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  progress: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 28,
  },
  option: {
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  explanationBox: {
    backgroundColor: colors.cardLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.bg,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  resultMessage: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  bestScore: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md },
  newRecord: { fontSize: 16, fontWeight: '700', color: colors.success, marginBottom: spacing.md },
  restartBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.md,
  },
  restartText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
