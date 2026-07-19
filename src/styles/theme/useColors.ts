import {useColorScheme} from 'react-native';

import themes, {Colors} from '@/styles/theme/colors';

export default function useColors(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}
