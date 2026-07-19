import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import Card from '@/components/Card';
import {Colors} from '@/styles/theme/colors';
import useColors from '@/styles/theme/useColors';
import {MaterialIcons} from '@expo/vector-icons';
import ContentLoader, {Rect} from 'react-content-loader/native';

interface InfoCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  changeValue?: number;
  changeType?: 'increase' | 'decrease';
  changeLabel?: string;
  loading?: boolean;
}

export default function InfoCard({title, value, unit, icon, changeValue, changeType, changeLabel, loading = false}: InfoCardProps) {
  const colors = useColors();
  const s = useMemo(() => createStyles(colors), [colors]);

  if (loading) {
    return (
      <Card style={s.infoCard}>
        <ContentLoader speed={1.2} width="100%" height={60} viewBox="0 0 200 60" backgroundColor={colors.border} foregroundColor={colors.card}>
          <Rect x="0" y="0" rx="4" ry="4" width="120" height="14" />
          <Rect x="0" y="26" rx="6" ry="6" width="90" height="26" />
        </ContentLoader>
      </Card>
    );
  }

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

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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
