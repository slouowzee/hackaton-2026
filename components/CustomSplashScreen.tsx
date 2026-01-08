/**
 * Custom Splash Screen
 *
 * Implements a custom animated splash screen using Reanimated.
 * Displays a logo and loading text with entrance and exit animations.
 */
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { Image as TamaguiImage } from 'tamagui';

const { width, height } = Dimensions.get('window');

/**
 * CustomSplashScreen Component
 *
 * Renders the animated splash screen.
 * Triggers the onFinish callback when the exit animation completes.
 *
 * @param {object} props - The component props.
 * @param {() => void} props.onFinish - Callback fired when the splash screen animation finishes.
 * @returns {JSX.Element} The rendered splash screen.
 */
export default function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    loadingOpacity.value = withRepeat(
        withSequence(
            withTiming(1, { duration: 800 }),
            withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
    );
    
    scale.value = withRepeat(
        withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, 
        true
    );

    const timeout = setTimeout(() => {
        cancelAnimation(scale);
        scale.value = withTiming(1, { duration: 200 });

        loadingOpacity.value = withTiming(0, { duration: 200 });

        translateX.value = withTiming(-width, {
            duration: 650,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
        }, (finished) => {
            if (finished) {
                runOnJS(onFinish)();
            }
        });
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
             <TamaguiImage 
                source={require('../assets/images/Sporty-full-wo-bg.png')}
                style={{ width: width, height: height }} 
                resizeMode="contain"
            />
        </Animated.View>
        
        <View style={styles.bottomContainer}>
             <Animated.Text style={[styles.loadingText, animatedTextStyle]}>Lancement...</Animated.Text>
        </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    flex: 1, // Take full space to match Native Splash positioning
    alignItems: 'center',
    justifyContent: 'center', 
    width: '100%',
    marginBottom: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#9ca3af',
    letterSpacing: 2,
    textTransform: 'uppercase',
  }
});
