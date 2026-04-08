import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import Card from '@/components/Card';
import colors from '@/styles/theme/colors';
import {MaterialIcons} from '@expo/vector-icons';

export default function PowerCard({currentWh, data}: {currentWh: number; data: {value: number}[]}) {
  return (
    <Card style={s.powerCard}>
      <View style={s.powerContent}>
        <View style={s.powerHeader}>
          <MaterialIcons name="power" size={24} color={colors.text} />
          <Text style={s.powerTitle}>실시간 소비전력</Text>
        </View>
        <View style={s.powerValue}>
          <Text style={s.powerNumber}>{currentWh}</Text>
          <Text style={s.powerUnit}>Wh</Text>
        </View>
      </View>

      <View style={s.chartContainer}>
        <LineChart data={data} areaChart hideDataPoints spacing={20} hideYAxisText hideAxesAndRules hideRules color={colors.primary} startFillColor={colors.primary} startOpacity={0.4} endOpacity={0} adjustToWidth height={90} scrollToEnd disableScroll curved />
        <LinearGradient colors={[colors.card, `${colors.card}00`]} start={{x: 0, y: 0}} end={{x: 1.5, y: 0}} locations={[0.1, 0.5]} style={s.chartGradient} />
      </View>

      <LinearGradient colors={[colors.card, `${colors.card}00`]} start={{x: 0, y: 0}} end={{x: 1.5, y: 0}} locations={[0.1, 0.5]} style={s.backgroundGradient} />
    </Card>
  );
}

const s = StyleSheet.create({
  powerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    flex: 0,
  },
  powerContent: {
    flex: 1,
    gap: 14,
  },
  powerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  powerTitle: {
    fontSize: 18,
    fontFamily: 'SuitBold',
    color: colors.text,
  },
  powerValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  powerNumber: {
    fontSize: 52,
    fontVariant: ['tabular-nums'],
    fontFamily: 'SuitExtraBold',
    color: colors.text,
  },
  powerUnit: {
    fontSize: 32,
    fontFamily: 'SuitRegular',
    color: colors.text,
  },
  chartContainer: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    zIndex: -1,
    elevation: -1,
  },
  chartGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    elevation: -1,
  },
});
