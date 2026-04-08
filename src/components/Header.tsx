import {useRouter} from 'expo-router';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Device} from '@/api/types';
import colors from '@/styles/theme/colors';
import {MaterialIcons} from '@expo/vector-icons';

interface HeaderProps {
  deviceName?: string;
  onDeviceNamePress?: () => void;
}

export default function Header({deviceName, onDeviceNamePress}: HeaderProps) {
  const router = useRouter();

  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onDeviceNamePress} activeOpacity={0.7} disabled={!onDeviceNamePress}>
        <Text style={s.headerTitle}>{deviceName || 'Better AIPM'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('/setting')} activeOpacity={0.7}>
        <MaterialIcons name="settings" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
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
});
