import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import colors from '@/styles/theme/colors';

interface ChartCardProps {
  chartData: any[];
  oldChartData: any[];
  chartType: string;
  feeMap: Record<string, number>;
  onChartTypeChange: (type: any) => void;
  formatChartData: () => any[];
  formatOldChartData: () => any[];
  isLoading?: boolean;
}

export default function ChartCard({chartData, oldChartData, chartType, feeMap, onChartTypeChange, formatChartData, formatOldChartData, isLoading = false}: ChartCardProps) {
  const chartTypeOptions = [
    {key: 'hour', label: '시간별'},
    {key: 'day', label: '일별'},
    {key: 'month', label: '월별'},
  ];

  const getLegendText = () => {
    switch (chartType) {
      case 'hour':
        return {current: '오늘', previous: ''};
      case 'day':
        return {current: '이번달', previous: '전월'};
      case 'month':
        return {current: '올해', previous: '전년'};
      default:
        return {current: '이번달', previous: '전월'};
    }
  };

  const legendText = getLegendText();
  const showPreviousLegend = chartType !== 'hour';

  const chartDataPrimary = useMemo(() => formatChartData(), [chartData, chartType]);
  const chartDataSecondary = useMemo(() => (chartType === 'hour' ? [] : formatOldChartData()), [oldChartData, chartType]);

  const maxValue = useMemo(() => (chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) * 1.2 : 100), [chartData]);

  const getFeeForDate = (rawDate: string): string => {
    const fee = feeMap[rawDate];
    if (fee === undefined) return '';
    return `${Math.round(fee).toLocaleString()}원`;
  };

  return (
    <Card>
      <View style={{marginBottom: 18}}>
        <View style={s.tabContainer}>
          {chartTypeOptions.map(type => (
            <TouchableOpacity key={type.key} style={s.tabButton} onPress={() => onChartTypeChange(type.key)} activeOpacity={0.7}>
              <Text style={[s.tabText, chartType === type.key && s.tabTextActive]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <LineChart
        data={chartDataPrimary}
        data2={chartDataSecondary}
        hideDataPoints
        hideYAxisText
        hideAxesAndRules
        hideRules
        areaChart
        labelsExtraHeight={25}
        initialSpacing={0}
        endSpacing={0}
        maxValue={maxValue}
        color1={colors.secondary}
        startFillColor1={colors.secondary}
        startOpacity1={0.3}
        color2={colors.primary}
        startFillColor2={colors.primary}
        startOpacity2={0.4}
        endOpacity={0}
        adjustToWidth
        height={150}
        curved
        pointerConfig={{
          activatePointersOnLongPress: true,
          activatePointersDelay: 300,
          autoAdjustPointerLabelPosition: true,
          pointerStripUptoDataPoint: true,
          pointerStripColor: colors.primary,
          pointerStripWidth: 2,
          stripOverPointer: true,
          hidePointers: true,
          pointerColor: colors.textSecondary,
          pointerLabelComponent: items => {
            if (!items || items.length === 0) return null;

            const hasSecondary = items.length >= 2 && items[1]?.value !== undefined;
            const secondary = hasSecondary ? items[1] : null;
            const primary = secondary ? items[0] : items[0];

            if (!primary) return null;

            const feeText = getFeeForDate(primary.rawDate || '');

            return (
              <View
                style={{
                  minWidth: 100,
                  justifyContent: 'center',
                  marginTop: 30,
                  marginLeft: -40,
                  gap: 4,
                }}>
                <View style={{paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.card}}>
                  <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.text, fontSize: 13}}>{primary.date}</Text>
                </View>
                {secondary && (
                  <View style={{paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.primary}}>
                    <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.background, fontSize: 12}}>{`${secondary.value.toFixed(1)} ${secondary.unit}`}</Text>
                  </View>
                )}
                <View style={{paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.secondary}}>
                  <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.background, fontSize: 12}}>{`${primary.value.toFixed(1)} ${primary.unit}`}</Text>
                </View>
                {feeText ? (
                  <View style={{paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.textSecondary}}>
                    <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.background, fontSize: 12}}>{feeText}</Text>
                  </View>
                ) : null}
              </View>
            );
          },
        }}
      />

      <View style={s.legendContainer}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, {backgroundColor: colors.primary}]} />
          <Text style={s.legendText}>{legendText.current}</Text>
        </View>
        {showPreviousLegend && (
          <View style={s.legendItem}>
            <View style={[s.legendDot, {backgroundColor: colors.secondary}]} />
            <Text style={s.legendText}>{legendText.previous}</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
    marginVertical: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontFamily: 'SuitRegular',
  },
  tabTextActive: {
    color: colors.text,
    backgroundColor: colors.border,
    fontFamily: 'SuitBold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
