import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import Card from '@/components/Card';
import {Colors} from '@/styles/theme/colors';
import useColors from '@/styles/theme/useColors';
import ContentLoader, {Rect} from 'react-content-loader/native';

interface ChartCardProps {
  chartData: any[];
  oldChartData: any[];
  chartType: string;
  currentFeeMap: Record<string, number>;
  oldFeeMap: Record<string, number>;
  onChartTypeChange: (type: any) => void;
  formatChartData: () => any[];
  formatOldChartData: () => any[];
  isLoading?: boolean;
}

const formatFee = (fee: number | undefined) => (fee !== undefined ? `${Math.round(fee).toLocaleString()}원` : '');

export default function ChartCard({chartData, oldChartData, chartType, currentFeeMap, oldFeeMap, onChartTypeChange, formatChartData, formatOldChartData, isLoading = false}: ChartCardProps) {
  const colors = useColors();
  const s = useMemo(() => createStyles(colors), [colors]);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
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

  const withExtremaLabels = (points: any[]) => {
    if (points.length === 0) return points;
    let minIdx = 0,
      maxIdx = 0;
    points.forEach((p, i) => {
      if (p.value < points[minIdx].value) minIdx = i;
      if (p.value > points[maxIdx].value) maxIdx = i;
    });
    return points.map((p, i) => {
      if (i === maxIdx) return {...p, dataPointText: `${p.value.toFixed(1)}${p.unit}`, textShiftY: -16, textColor: colors.text, textFontSize: 11};
      if (i === minIdx && minIdx !== maxIdx) return {...p, dataPointText: `${p.value.toFixed(1)}${p.unit}`, textShiftY: 16, textColor: colors.textSecondary, textFontSize: 11};
      return p;
    });
  };

  const currentData = useMemo(() => withExtremaLabels(formatChartData()), [chartData, chartType, colors]);
  const previousData = useMemo(() => (chartType === 'hour' ? [] : formatOldChartData()), [oldChartData, chartType]);

  const maxValue = useMemo(() => {
    const allValues = [...chartData.map(d => d.value), ...oldChartData.map(d => d.value)];
    return allValues.length > 0 ? Math.max(...allValues) * 1.2 : 100;
  }, [chartData, oldChartData]);

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

      {isLoading ? (
        <ContentLoader speed={1.2} width="100%" height={150} viewBox="0 0 400 150" backgroundColor={colors.border} foregroundColor={colors.card}>
          <Rect x="0" y="0" rx="16" ry="16" width="400" height="150" />
        </ContentLoader>
      ) : (
        <LineChart
          data={currentData}
          data2={previousData}
          hideDataPoints
          hideYAxisText
          hideAxesAndRules
          hideRules
          areaChart
          labelsExtraHeight={25}
          initialSpacing={0}
          endSpacing={0}
          maxValue={maxValue}
          color1={colors.primary}
          startFillColor1={colors.primary}
          startOpacity1={isDark ? 0.2 : 0.4}
          color2={colors.secondary}
          startFillColor2={colors.secondary}
          startOpacity2={isDark ? 0.1 : 0.3}
          endOpacity={0}
          adjustToWidth
          height={150}
          curved
          xAxisLabelTextStyle={{color: colors.textSecondary, fontSize: 12}}
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
              if (!items || items.length === 0 || !items[0]) return null;

              const current = items[0];
              const previous = items.length >= 2 ? items[1] : null;
              const hasPrevious = previous && previous.value > 0;

              const currentFee = formatFee(currentFeeMap[current.rawDate]);
              const previousFee = hasPrevious ? formatFee(oldFeeMap[previous.rawDate]) : '';

              return (
                <View
                  style={{
                    minWidth: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 30,
                    marginLeft: -40,
                    gap: 4,
                  }}>
                  <View style={{paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: colors.card}}>
                    <Text style={{fontWeight: 'bold', color: colors.text, fontSize: 13, textAlign: 'center'}}>{current.date}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.primary}}>
                    <Text style={{fontSize: 12, fontWeight: 'bold', color: colors.background}}>{`${current.value.toFixed(1)} ${current.unit}`}</Text>
                    {currentFee ? <Text style={{fontSize: 11, color: colors.background, opacity: 0.85}}>{currentFee}</Text> : null}
                  </View>
                  {hasPrevious && (
                    <View style={{flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.secondary}}>
                      <Text style={{fontSize: 12, fontWeight: 'bold', color: colors.background}}>{`${previous.value.toFixed(1)} ${previous.unit}`}</Text>
                      {previousFee ? <Text style={{fontSize: 11, color: colors.background, opacity: 0.85}}>{previousFee}</Text> : null}
                    </View>
                  )}
                </View>
              );
            },
          }}
        />
      )}

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

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });
