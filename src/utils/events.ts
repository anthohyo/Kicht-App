// Minimal event emitter for cross-component communication
// Used to trigger badge toasts from anywhere in the app

type BadgeListener = (badgeId: string) => void;

const badgeListeners: BadgeListener[] = [];

export function onBadgeEarned(fn: BadgeListener): () => void {
  badgeListeners.push(fn);
  return () => {
    const idx = badgeListeners.indexOf(fn);
    if (idx !== -1) badgeListeners.splice(idx, 1);
  };
}

export function emitBadgeEarned(badgeId: string): void {
  badgeListeners.forEach((fn) => fn(badgeId));
}
