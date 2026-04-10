import {router} from 'expo-router';
import {useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';

import ChartCard from '@/components/ChartCard';
import Header from '@/components/Header';
import InfoCard from '@/components/InfoCard';
import PowerCard from '@/components/PowerCard';
import {useChartData} from '@/hooks/useChartData';
import {useDeviceData} from '@/hooks/useDeviceData';
import {useStats} from '@/hooks/useStats';
import gs from '@/styles/global';
import colors from '@/styles/theme/colors';
import {formatDateLabel} from '@/utils/date';

export default function Index() {
  const {selectedDevice, currentData, realtimeChartData, loading, loadCurrentData} = useDeviceData();
  const {chartData, oldChartData, currentFeeMap, oldFeeMap, chartType, setChartType, isLoading: isChartLoading, loadChartData} = useChartData(selectedDevice);
  const {dailyStats, monthlyStats, loadAllStats} = useStats(selectedDevice);
  const [refreshing, setRefreshing] = useState(false);

  const getChartData = () => {
    const labelInterval = chartType === 'hour' ? 4 : chartType === 'day' ? 5 : 2;
    return chartData.map((item, index) => ({
      ...item,
      value: item.value,
      rawDate: item.date,
      date: formatDateLabel(item.date, chartType),
      label: index % labelInterval === 0 ? formatDateLabel(item.date, chartType) : '',
      unit: item.unit.replace('Won', '원'),
    }));
  };

  const getOldChartData = () => {
    const labelInterval = chartType === 'hour' ? 4 : chartType === 'day' ? 5 : 2;
    if (oldChartData.length === 0 && chartData.length > 0) {
      return chartData.map((item, index) => ({
        value: 0,
        rawDate: item.date,
        date: formatDateLabel(item.date, chartType),
        label: index % labelInterval === 0 ? formatDateLabel(item.date, chartType) : '',
        unit: item.unit.replace('Won', '원'),
      }));
    }
    return oldChartData.map((item, index) => ({
      ...item,
      value: item.value,
      rawDate: item.date,
      date: formatDateLabel(item.date, chartType),
      label: index % labelInterval === 0 ? formatDateLabel(item.date, chartType) : '',
      unit: item.unit.replace('Won', '원'),
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedDevice) {
        await Promise.all([loadCurrentData(selectedDevice), loadChartData(selectedDevice), loadAllStats(selectedDevice)]);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[gs.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: colors.text, fontSize: 16}}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  if (!selectedDevice) {
    return (
      <View style={[gs.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: colors.text, fontSize: 16}}>선택된 디바이스가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={gs.container}>
      <Header deviceName={selectedDevice?.device_profile.display_name} onDeviceNamePress={() => router.push('/device-detail')} />

      <ScrollView style={gs.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
        <PowerCard currentWh={currentData.currentWh} data={realtimeChartData} />

        <ChartCard chartData={chartData} oldChartData={oldChartData} chartType={chartType} currentFeeMap={currentFeeMap} oldFeeMap={oldFeeMap} onChartTypeChange={setChartType} formatChartData={getChartData} formatOldChartData={getOldChartData} isLoading={isChartLoading} />

        <View style={s.gridRow}>
          <InfoCard
            title="오늘 사용량"
            value={Math.round(dailyStats.todayUsage * 100) / 100}
            unit="Wh"
            icon="energy-savings-leaf"
            changeValue={Math.round(Math.abs(dailyStats.todayUsage - dailyStats.yesterdayUsage) * 100) / 100}
            changeType={dailyStats.todayUsage >= dailyStats.yesterdayUsage ? 'increase' : 'decrease'}
            changeLabel="전일대비"
          />
          <InfoCard
            title="이번 달 사용량"
            value={Math.round(monthlyStats.thisMonthUsage * 100) / 100}
            unit="kWh"
            icon="energy-savings-leaf"
            changeValue={Math.round(Math.abs(monthlyStats.thisMonthUsage - monthlyStats.lastMonthUsage) * 100) / 100}
            changeType={monthlyStats.thisMonthUsage >= monthlyStats.lastMonthUsage ? 'increase' : 'decrease'}
            changeLabel="전월대비"
          />
        </View>

        <View style={s.gridRow}>
          <InfoCard title="평균 소비전력" value={Math.round(dailyStats.averagePower)} unit="Wh" icon="dynamic-form" />
          <InfoCard title="최대 소비전력" value={Math.round(dailyStats.maxPower)} unit="Wh" icon="flash-on" />
        </View>

        <View style={s.gridRow}>
          <InfoCard title="장치 내부온도" value={Math.round(currentData.temperature)} unit="°C" icon="thermostat" />
          <InfoCard
            title="이번 달 예상 요금"
            value={Math.round(monthlyStats.thisMonthFee)}
            unit="원"
            icon="paid"
            changeValue={Math.round(Math.abs(monthlyStats.thisMonthFee - monthlyStats.lastMonthFee))}
            changeType={monthlyStats.thisMonthFee >= monthlyStats.lastMonthFee ? 'increase' : 'decrease'}
            changeLabel="전월대비"
          />
        </View>

        <View style={s.gridRow}>
          <InfoCard title="디바이스 상태" value={currentData.powered ? '켜짐' : '꺼짐'} unit="" icon="power" />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    gap: 14,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
