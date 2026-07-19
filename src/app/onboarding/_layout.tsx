import {Stack} from 'expo-router';

import useColors from '@/styles/theme/useColors';

export default function OnboardingLayout() {
  const colors = useColors();
  return (
    <Stack screenOptions={{contentStyle: {backgroundColor: colors.background}, headerShown: false}}>
      <Stack.Screen name="index" />
      <Stack.Screen name="select-device" />
    </Stack>
  );
}
