/**
 * Application Colors
 *
 * Defines the color palette for the application, including light and dark mode themes.
 */
const tintColorLight = '#10b981';
const tintColorDark = '#34d399';

/**
 * Color configuration object.
 * Contains distinct color schemes for 'light' and 'dark' modes.
 */
export default {
  light: {
    text: '#1f2937',
    background: '#f3f4f6',
    tint: tintColorLight,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f9fafb',
    background: '#111827',
    tint: tintColorDark,
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
  },
};
