import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import useGlobalStyles from '@/styles/global';
import {Colors} from '@/styles/theme/colors';
import useColors from '@/styles/theme/useColors';

interface RetryStateProps {
  message: string;
  onRetry: () => void;
}

export default function RetryState({message, onRetry}: RetryStateProps) {
  const colors = useColors();
  const gs = useGlobalStyles();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[gs.container, gs.centerContent]}>
      <Text style={s.errorText}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={s.retryButton} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="다시 시도">
        <Text style={s.retryButtonText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    errorText: {
      fontSize: 16,
      fontFamily: 'SuitRegular',
      color: colors.danger,
      textAlign: 'center',
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    retryButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: 'SuitMedium',
      color: colors.text,
    },
  });
