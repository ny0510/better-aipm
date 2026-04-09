import React from 'react';
import {View, ViewStyle} from 'react-native';

import colors from '@/styles/theme/colors';

interface SkeletonProps {
  style?: ViewStyle;
  width?: number;
  height?: number;
  borderRadius?: number;
}

export default function Skeleton({style, width = 100, height = 20, borderRadius = 4}: SkeletonProps) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        style,
      ]}
    />
  );
}
