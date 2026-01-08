/**
 * Themed Components
 *
 * Provides themed Text and View components that adapt to light and dark modes.
 * Also includes a hook for retrieving theme colors.
 */
import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

/**
 * useThemeColor Hook
 *
 * Returns the color for a specific component based on the current theme (light or dark).
 * Prioritizes manually provided colors in props.
 *
 * @param {object} props - The props containing manual color overrides.
 * @param {string} colorName - The name of the color key in the theme.
 * @returns {string} The resolved color string.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

/**
 * Text Component
 *
 * A themed Text component that changes color based on the current theme.
 *
 * @param {TextProps} props - The component props including optional color overrides.
 * @returns {JSX.Element} The rendered Text component.
 */
export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

/**
 * View Component
 *
 * A themed View component that changes background color based on the current theme.
 *
 * @param {ViewProps} props - The component props including optional color overrides.
 * @returns {JSX.Element} The rendered View component.
 */
export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
