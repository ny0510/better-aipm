import {useRouter} from 'expo-router';
import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Device} from '@/api/types';
import {Colors} from '@/styles/theme/colors';
import useColors from '@/styles/theme/useColors';
import {MaterialIcons} from '@expo/vector-icons';

interface HeaderProps {
  deviceName?: string;
  onDeviceNamePress?: () => void;
}

export default function Header({deviceName, onDeviceNamePress}: HeaderProps) {
  const router = useRouter();
  const colors = useColors();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onDeviceNamePress} activeOpacity={0.7} disabled={!onDeviceNamePress} accessibilityRole="button" accessibilityLabel={onDeviceNamePress ? `${deviceName || 'Better AIPM'} 정보 보기` : undefined}>
        <View style={s.headerTitleRow}>
          <Text style={s.headerTitle}>{deviceName || 'Better AIPM'}</Text>
          {onDeviceNamePress && <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('/setting')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="설정">
        <MaterialIcons name="settings" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 15,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 22,
      fontFamily: 'SuitSemiBold',
      color: colors.text,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });
