/**
 * Root Layout
 *
 * Tests the root layout structure, theme configuration, and global providers.
 * Manages the splash screen and font loading.
 */
import CustomSplashScreen from '@/components/CustomSplashScreen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { TamaguiProvider, Theme, View } from 'tamagui';
import tamaguiConfig from '../tamagui.config';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoritesProvider } from '../context/FavoritesContext';

const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: '#e5e7eb',
    notification: Colors.light.tint,
  },
};

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: '#374151',
    notification: Colors.dark.tint,
  },
};

export {
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

/**
 * RootLayout Component
 *
 * Handles font loading and splash screen visibility.
 * Wraps the application in the TamaguiProvider.
 *
 * @returns {JSX.Element | null} The rendered root layout component.
 */
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Montserrat: require('../assets/fonts/Montserrat.ttf'), 
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setAppIsReady(true);
    }
  }, [loaded]);

  const colorScheme = useColorScheme();

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <Theme name="green">
        <RootLayoutNav />
        {(!appIsReady || !splashAnimationFinished) && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
                <CustomSplashScreen onFinish={() => setSplashAnimationFinished(true)} />
            </View>
        )}
      </Theme>
    </TamaguiProvider>
  );
}

const queryClient = new QueryClient();

/**
 * RootLayoutNav Component
 *
 * Configures the global providers including QueryClient and ThemeProvider.
 *
 * @returns {JSX.Element} The rendered navigation layout component.
 */
function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <ThemeProvider value={colorScheme === 'dark' ? MyDarkTheme : MyLightTheme}>
          <StackScreen />
        </ThemeProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  );
}

/**
 * StackScreen Component
 *
 * Defines the main stack navigator hierarchy.
 *
 * @returns {JSX.Element} The rendered stack screen component.
 */
function StackScreen() {
    return (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/step1" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    )
}
