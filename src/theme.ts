// Charte graphique dark/violet
export const colors = {
  // Backgrounds
  bg: '#0A0A0F',
  card: '#14141F',
  cardLight: '#1C1C2E',
  surface: '#22223A',

  // Primary (violet)
  // `primary` ne passe qu'à 3.21 sur fond sombre : réservé aux FONDS de bouton
  // (blanc dessus = 5.7, conforme). Pour du texte violet, utiliser `primaryLight`.
  primary: '#7C3AED',
  primaryLight: '#A78BFA', // 6.7 — c'est la variante à utiliser pour le texte
  primaryDark: '#5B21B6',
  primaryGlow: 'rgba(124, 58, 237, 0.15)',

  // Accent
  accent: '#C084FC',

  // Text
  // Contrastes mesurés sur `card` (#14141F). Seuil WCAG AA texte courant : 4.5.
  text: '#F1F1F6',          // 16.2 — titres et contenu principal
  textSecondary: '#9CA3AF', //  7.2 — texte de soutien
  textMuted: '#868D99',     //  5.5 — mentions discrètes. L'ancien #6B7280 tombait
                            //  à 3.78 : illisible pour beaucoup, et c'est cette
                            //  couleur qui portait les montants des aides.

  // Status
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  danger: '#EF4444',
  // `danger` sur son propre fond teinté ne donne que 4.33 : sous le seuil, et c'est
  // précisément la couleur des boutons « Effacer toutes mes données ». Pour du TEXTE
  // rouge, utiliser `dangerText` (5.9 sur ce même fond) ; `danger` reste pour les
  // bordures, les fonds et les icônes, où le seuil ne s'applique pas.
  dangerText: '#F87171',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  warning: '#F59E0B',

  // Borders
  border: '#2A2A40',
  borderLight: '#3A3A55',

  // Others
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
