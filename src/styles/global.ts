import {StyleSheet} from 'react-native';

import useColors from '@/styles/theme/useColors';

export default function useGlobalStyles() {
  const colors = useColors();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      paddingVertical: 4,
      paddingHorizontal: 20,
      flex: 1,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
