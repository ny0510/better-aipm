import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import {useColorScheme} from 'react-native';
import {SafeAreaInsetsContext, SafeAreaProvider, SafeAreaView, initialWindowMetrics, useSafeAreaInsets} from 'react-native-safe-area-context';

import useColors from '@/styles/theme/useColors';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const colors = useColors();
  const scheme = useColorScheme();
  const [loaded, error] = useFonts({
    SuitHeavy: require('@/assets/fonts/SUIT-Heavy.ttf'),
    SuitExtraBold: require('@/assets/fonts/SUIT-ExtraBold.ttf'),
    SuitBold: require('@/assets/fonts/SUIT-Bold.ttf'),
    SuitSemiBold: require('@/assets/fonts/SUIT-SemiBold.ttf'),
    SuitMedium: require('@/assets/fonts/SUIT-Medium.ttf'),
    SuitRegular: require('@/assets/fonts/SUIT-Regular.ttf'),
    SuitLight: require('@/assets/fonts/SUIT-Light.ttf'),
    SuitExtraLight: require('@/assets/fonts/SUIT-ExtraLight.ttf'),
    SuitThin: require('@/assets/fonts/SUIT-Thin.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
        <Stack screenOptions={{contentStyle: {backgroundColor: colors.background}, headerShown: false}}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default RootLayout;
