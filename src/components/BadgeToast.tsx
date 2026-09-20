import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { onBadgeEarned } from '../utils/events';
import { allBadges } from '../data/badges';
import { colors, radius, spacing } from '../theme';

// Xbox/PlayStation-style achievement toast
// Listens to the global badge event emitter and animates in/out

export default function BadgeToast() {
  const [badge, setBadge] = useState<{ emoji: string; title: string } | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = onBadgeEarned((badgeId) => {
      const found = allBadges.find((b) => b.id === badgeId);
      if (!found) return;

      // Cancel any pending hide timer
      if (timerRef.current) clearTimeout(timerRef.current);

      setBadge({ emoji: found.emoji, title: found.title });

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 9 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      // Auto-hide after 3.5s
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -120, duration: 350, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start(() => setBadge(null));
      }, 3500);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!badge) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity }]}>
      <View style={styles.iconWrap}>
        <Text style={styles.emoji} aria-hidden>{badge.emoji}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>Badge débloqué !</Text>
        <Text style={styles.title}>{badge.title}</Text>
      </View>
      <Text style={styles.xp}>+🏆</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 56,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    backgroundColor: '#1a1a2e',
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.6)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  emoji: { fontSize: 22 },
  textWrap: { flex: 1 },
  label: { fontSize: 11, color: colors.primaryLight, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { fontSize: 15, color: colors.white, fontWeight: 'bold', marginTop: 1 },
  xp: { fontSize: 18 },
});
