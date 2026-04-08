import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';

import colors from '@/styles/theme/colors';

interface CardProps {
  title?: string;
  titleStyle?: object;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({title, titleStyle, children, style}: CardProps) {
  return (
    <View style={[s.container, {...style}]}>
      {title && <Text style={[s.title, {...titleStyle}]}>{title}</Text>}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 26,
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'SuitBold',
    color: colors.text,
    marginBottom: 16,
  },
});
