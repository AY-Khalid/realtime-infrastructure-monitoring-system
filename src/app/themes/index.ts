/**
 * Themes are driven entirely from CSS custom properties on `:root.light` and
 * `:root.dark` (see `src/assets/styles.css`). This file exists for symmetry
 * and as a future extension point if multiple themes are introduced.
 */
export const THEMES = ['light', 'dark'] as const;
export type ThemeName = (typeof THEMES)[number];
