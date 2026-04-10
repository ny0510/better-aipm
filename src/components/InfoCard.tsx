import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Card from '@/components/Card';
import colors from '@/styles/theme/colors';
import {MaterialIcons} from '@expo/vector-icons';

interface InfoCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  changeValue?: number;
  changeType?: 'increase' | 'decrease';
  changeLabel?: string;
}

export default function InfoCard({title, value, unit, icon, changeValue, changeType, changeLabel}: InfoCardProps) {
  return (
    <Card style={s.infoCard}>
      <View style={s.infoHeader}>
        {icon && <MaterialIcons name={icon} size={18} color={colors.text} />}
        <Text style={s.infoTitle}>{title}</Text>
      </View>
      <View style={s.infoContent}>
        <Text style={s.infoValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
        {unit && <Text style={s.infoUnit}>{unit}</Text>}
      </View>
      {changeValue && changeType && (
        <View style={s.changeContainer}>
          <MaterialIcons name={changeType === 'increase' ? 'trending-up' : 'trending-down'} size={16} color={changeType === 'increase' ? colors.danger : colors.success} />
          <Text style={[s.changeText, {color: changeType === 'increase' ? colors.danger : colors.success}]}>
            {changeType === 'increase' ? '+' : '-'}
            {Math.abs(changeValue).toLocaleString()}
            {unit}
          </Text>
          <Text style={s.changeLabel}>{changeLabel}</Text>
        </View>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  infoTitle: {
    fontSize: 16,
    fontFamily: 'SuitSemiBold',
    color: colors.text,
  },
  infoCard: {
    justifyContent: 'space-between',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 1,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 2,
  },
  infoValue: {
    fontSize: 30,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
    fontFamily: 'SuitBold',
    color: colors.text,
  },
  infoUnit: {
    fontSize: 20,
    fontFamily: 'SuitRegular',
    color: colors.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    fontFamily: 'SuitSemiBold',
    fontWeight: '600',
  },
  changeLabel: {
    fontSize: 12,
    fontFamily: 'SuitRegular',
    color: colors.textSecondary,
  },
});
