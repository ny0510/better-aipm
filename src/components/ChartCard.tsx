import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import colors from '@/styles/theme/colors';

interface ChartCardProps {
  chartData: any[];
  oldChartData: any[];
  chartType: string;
  onChartTypeChange: (type: any) => void;
  formatChartData: () => any[];
  formatOldChartData: () => any[];
  isLoading?: boolean;
}

export default function ChartCard({chartData, oldChartData, chartType, onChartTypeChange, formatChartData, formatOldChartData, isLoading = false}: ChartCardProps) {
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

  const chartDataPrimary = formatChartData();
  const chartDataSecondary = chartType === 'hour' ? [] : formatOldChartData();

  return (
    <Card>
      <View style={{gap: 4, marginBottom: 18}}>
        <View style={s.tabContainer}>
          {isLoading ? (
            <View style={{flex: 1, flexDirection: 'row', gap: 4, padding: 4}}>
              {chartTypeOptions.map(() => (
                <Skeleton key={Math.random()} width={60} height={30} borderRadius={8} />
              ))}
            </View>
          ) : (
            chartTypeOptions.map(type => (
              <TouchableOpacity key={type.key} style={s.tabButton} onPress={() => onChartTypeChange(type.key)} activeOpacity={0.7}>
                <Text style={[s.tabText, chartType === type.key && s.tabTextActive]}>{type.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {isLoading ? (
        <Skeleton width={340} height={150} borderRadius={12} />
      ) : (
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
          maxValue={chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) * 1.2 : 100}
          color1={colors.secondary}
          startFillColor1={colors.secondary}
          startOpacity1={0.3}
          color2={colors.primary}
          startFillColor2={colors.primary}
          startOpacity2={0.4}
          endOpacity={0}
          adjustToWidth
          height={150}
          scrollToEnd
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
              if (!items || items.length < 2 || !items[1]) return null;
              return (
                <View
                  style={{
                    height: 90,
                    minWidth: 100,
                    justifyContent: 'center',
                    marginTop: 30,
                    marginLeft: -40,
                    gap: 6,
                  }}>
                  <View style={{paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.card}}>
                    <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.text}}>{items[1].date}</Text>
                  </View>
                  <View style={{paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.primary}}>
                    <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.background}}>{`${items[1].value.toFixed(1)} ${items[1].unit}`}</Text>
                  </View>
                  {items[0] && (
                    <View style={{paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.secondary}}>
                      <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.background}}>{`${items[0].value.toFixed(1)} ${items[0].unit}`}</Text>
                    </View>
                  )}
                </View>
              );
            },
          }}
        />
      )}

      <View style={s.legendContainer}>
        {isLoading ? (
          <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20}}>
            <Skeleton width={50} height={16} borderRadius={4} />
            {showPreviousLegend && <Skeleton width={50} height={16} borderRadius={4} />}
          </View>
        ) : (
          <>
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
          </>
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
