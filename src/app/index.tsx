import {Link, router} from 'expo-router';
import {useEffect, useState} from 'react';
import {Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import {APIStorage, DawonAPIClient, DeviceManager, dawonAPI} from '@/api';
import {ChartDataPoint, Device, Metric, Target} from '@/api/types';
import Card from '@/components/Card';
import Header from '@/components/Header';
import InfoCard from '@/components/InfoCard';
import PowerCard from '@/components/PowerCard';
import gs from '@/styles/global';
import colors from '@/styles/theme/colors';

export default function Index() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [currentData, setCurrentData] = useState({
    currentWh: 0,
    monthlyKwh: 0,
    temperature: 0,
    powered: false,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [oldChartData, setOldChartData] = useState<ChartDataPoint[]>([]);
  const [realtimeChartData, setRealtimeChartData] = useState([{value: 50}, {value: 50}, {value: 50}, {value: 50}]);
  const [chartType, setChartType] = useState<Target>('hour');
  const [dataType, setDataType] = useState<Metric>('power');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [dailyStats, setDailyStats] = useState({
    todayUsage: 0,
    yesterdayUsage: 0,
    averagePower: 0,
    maxPower: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState({
    thisMonthUsage: 0,
    lastMonthUsage: 0,
    thisMonthFee: 0,
    lastMonthFee: 0,
  });

  // 데이터 로드
  useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadCurrentData, 30_000);
    return () => clearInterval(interval);
  }, []);

  // 차트 타입이나 데이터 타입이 변경될 때 차트 데이터 다시 로드
  useEffect(() => {
    if (selectedDevice) {
      loadChartData();
    }
  }, [chartType, dataType, selectedDevice]);

  const loadInitialData = async () => {
    try {
      // Check if base URL is set first
      const baseUrl = await APIStorage.getBaseURL();
      if (!baseUrl) {
        setLoading(false);
        router.replace('/onboarding');
        return;
      }

      const device = await DeviceManager.getSelectedDevice();
      if (!device) {
        setLoading(false);
        if (!hasShownError) {
          setHasShownError(true);
          Alert.alert('알림', '선택된 디바이스가 없습니다. 설정에서 디바이스를 선택해주세요.');
        }
        router.replace(`/onboarding/select-device?serverUrl=${encodeURIComponent(baseUrl)}`);
        return;
      }

      setSelectedDevice(device);
      await loadCurrentData(device);
      await loadChartData(device);
      await loadDailyStats(device);
      await loadMonthlyStats(device);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      if (!hasShownError) {
        setHasShownError(true);
        Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentData = async (device?: Device) => {
    console.log('Loading current data...');
    try {
      const targetDevice = device || selectedDevice;
      if (!targetDevice) return;

      const apiClient = new DawonAPIClient();
      const data = await apiClient.getCurrentData(targetDevice.device_id);
      console.log('Current data:', data);

      setCurrentData({
        currentWh: data.current_watt ? parseFloat(data.current_watt) : 0,
        monthlyKwh: data.monthly_kwh ? parseFloat(data.monthly_kwh) : 0,
        temperature: data.temperature ? parseFloat(data.temperature) : 0,
        powered: data.powered ? JSON.parse(data.powered) : false,
      });

      // 실시간 차트 데이터 업데이트
      const newValue = data.current_watt ? parseFloat(data.current_watt) : 0;
      setRealtimeChartData(prevData => {
        const newData = [...prevData, {value: newValue}];
        return newData.length > 50 ? newData.slice(1) : newData;
      });
    } catch (error) {
      console.error('Failed to load current data:', error);
    }
  };

  const loadChartData = async (device?: Device) => {
    try {
      const targetDevice = device || selectedDevice;
      if (!targetDevice) return;

      const apiClient = new DawonAPIClient();
      const response = await apiClient.getChartData(targetDevice.device_id, chartType, dataType);

      setChartData(response.data || []);
      setOldChartData(response.old_data || []);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const getPreviousDay = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return {today, yesterday};
  };

  const findDailyUsage = (data: ChartDataPoint[], todayStr: string, yesterdayStr: string) => {
    let todayUsage = 0;
    let yesterdayUsage = 0;

    if (data && data.length > 0) {
      const todayData = data.find(item => item.date.startsWith(todayStr));
      const yesterdayData = data.find(item => item.date.startsWith(yesterdayStr));

      if (todayData) {
        todayUsage = todayData.value;
      }
      if (yesterdayData) {
        yesterdayUsage = yesterdayData.value;
      }
    }

    return {todayUsage, yesterdayUsage};
  };

  const calculateAverageAndMaxPower = (data: ChartDataPoint[], todayStr: string) => {
    let averagePower = 0;
    let maxPower = 0;

    if (data && data.length > 0) {
      const todayHourlyData = data.filter(item => item.date.startsWith(todayStr));

      if (todayHourlyData.length > 0) {
        const todayValues = todayHourlyData.map(item => item.value);
        averagePower = todayValues.reduce((sum, value) => sum + value, 0) / todayValues.length;
        maxPower = Math.max(...todayValues);
      }
    }

    return {averagePower, maxPower};
  };

  const loadDailyStats = async (device?: Device) => {
    try {
      const targetDevice = device || selectedDevice;
      if (!targetDevice) return;

      const apiClient = new DawonAPIClient();

      const dailyResponse = await apiClient.getChartData(targetDevice.device_id, 'day', 'power');
      const hourlyResponse = await apiClient.getChartData(targetDevice.device_id, 'hour', 'power');

      const {today, yesterday} = getPreviousDay();
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const {todayUsage, yesterdayUsage} = findDailyUsage(dailyResponse.data || [], todayStr, yesterdayStr);
      const {averagePower, maxPower} = calculateAverageAndMaxPower(hourlyResponse.data || [], todayStr);

      setDailyStats({
        todayUsage,
        yesterdayUsage,
        averagePower,
        maxPower,
      });
    } catch (error) {
      console.error('Failed to load daily stats:', error);
    }
  };

  const getPreviousMonth = (month: number, year: number) => {
    const lastMonth = month === 0 ? 11 : month - 1;
    const lastMonthYear = month === 0 ? year - 1 : year;
    return {month: lastMonth, year: lastMonthYear};
  };

  const findDataByMonthAndYear = (data: ChartDataPoint[], month: number, year: number) => {
    return data.find(item => {
      const date = new Date(item.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const extractCurrentAndPreviousMonthValues = (data: ChartDataPoint[], thisMonth: number, thisYear: number) => {
    let thisMonthValue = 0;
    let lastMonthValue = 0;

    if (data && data.length > 0) {
      const thisMonthData = findDataByMonthAndYear(data, thisMonth, thisYear);
      if (thisMonthData) {
        thisMonthValue = thisMonthData.value;
      }

      const {month: lastMonth, year: lastMonthYear} = getPreviousMonth(thisMonth, thisYear);
      const lastMonthData = findDataByMonthAndYear(data, lastMonth, lastMonthYear);
      if (lastMonthData) {
        lastMonthValue = lastMonthData.value;
      }
    }

    return {thisMonthValue, lastMonthValue};
  };

  const loadMonthlyStats = async (device?: Device) => {
    try {
      const targetDevice = device || selectedDevice;
      if (!targetDevice) return;

      const apiClient = new DawonAPIClient();

      const powerResponse = await apiClient.getChartData(targetDevice.device_id, 'month', 'power');
      const feeResponse = await apiClient.getChartData(targetDevice.device_id, 'month', 'fee');
      const dailyFeeResponse = await apiClient.getChartData(targetDevice.device_id, 'day', 'fee');

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const {thisMonthValue: thisMonthUsage, lastMonthValue: lastMonthUsage} = extractCurrentAndPreviousMonthValues(powerResponse.data || [], thisMonth, thisYear);
      const {thisMonthValue: thisMonthFeeCumulative, lastMonthValue: lastMonthFee} = extractCurrentAndPreviousMonthValues(feeResponse.data || [], thisMonth, thisYear);

      const currentDay = now.getDate();
      const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();

      const thisMonthDailyFees = (dailyFeeResponse.data || []).filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      let estimatedMonthlyFee = thisMonthFeeCumulative;
      if (thisMonthDailyFees.length > 0) {
        const totalDailyFee = thisMonthDailyFees.reduce((sum, item) => sum + item.value, 0);
        const avgDailyFee = totalDailyFee / thisMonthDailyFees.length;
        estimatedMonthlyFee = avgDailyFee * daysInMonth;
      } else if (currentDay > 0) {
        const avgDailyFee = thisMonthFeeCumulative / currentDay;
        estimatedMonthlyFee = avgDailyFee * daysInMonth;
      }

      setMonthlyStats({
        thisMonthUsage,
        lastMonthUsage,
        thisMonthFee: estimatedMonthlyFee,
        lastMonthFee,
      });
    } catch (error) {
      console.error('Failed to load monthly stats:', error);
    }
  };

  const formatDateLabel = (dateString: string, type: Target) => {
    const date = new Date(dateString);
    switch (type) {
      case 'hour':
        return date.getHours().toString().padStart(2, '0') + ':00';
      case 'day':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      case 'month':
        return `${date.getMonth() + 1}월`;
      default:
        return '';
    }
  };

  const getChartData = () => {
    return chartData.map((item, index) => ({
      ...item,
      value: item.value,
      date: formatDateLabel(item.date, chartType),
      label: index % 5 === 0 ? formatDateLabel(item.date, chartType) : '',
      unit: item.unit.replace('Won', '원'),
    }));
  };

  const getOldChartData = () => {
    return oldChartData.map((item, index) => ({
      ...item,
      value: item.value,
      date: formatDateLabel(item.date, chartType),
      label: index % 5 === 0 ? formatDateLabel(item.date, chartType) : '',
      unit: item.unit.replace('Won', '원'),
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedDevice) {
        await Promise.all([loadCurrentData(selectedDevice), loadChartData(selectedDevice), loadDailyStats(selectedDevice), loadMonthlyStats(selectedDevice)]);
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

        <Card>
          <View style={{gap: 4, marginBottom: 18}}>
            <View style={s.tabContainer}>
              {[
                {key: 'hour' as const, label: '시간별'},
                {key: 'day' as const, label: '일별'},
                {key: 'month' as const, label: '월별'},
              ].map(type => (
                <TouchableOpacity key={type.key} style={s.tabButton} onPress={() => setChartType(type.key)} activeOpacity={0.7}>
                  <Text style={[s.tabText, chartType === type.key && s.tabTextActive]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.tabContainer}>
              {[
                {key: 'power' as const, label: '전력사용량'},
                {key: 'fee' as const, label: '예상요금'},
              ].map(type => (
                <TouchableOpacity key={type.key} style={s.tabButton} onPress={() => setDataType(type.key)} activeOpacity={0.7}>
                  <Text style={[s.tabText, dataType === type.key && s.tabTextActive]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <LineChart
            data={getOldChartData()}
            data2={getChartData()}
            hideDataPoints
            // noOfSections={4}
            // yAxisLabelSuffix="Wh"
            // yAxisColor={colors.border}
            // yAxisLabelWidth={50}
            // yAxisTextStyle={{fontSize: 12, color: colors.textSecondary, fontFamily: 'SuitRegular'}}
            // xAxisThickness={0}
            hideYAxisText
            hideAxesAndRules
            hideRules
            areaChart
            labelsExtraHeight={25}
            initialSpacing={0}
            endSpacing={0}
            // spacing={20}
            maxValue={chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) * 1.2 : 100}
            //
            color1={colors.secondary}
            startFillColor1={colors.secondary}
            // endFillColor1={colors.secondary}
            startOpacity1={0.3}
            //
            color2={colors.primary}
            startFillColor2={colors.primary}
            // endFillColor2={colors.primary}
            startOpacity2={0.4}
            //
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
                    <View style={{paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.secondary}}>
                      <Text style={{fontWeight: 'bold', textAlign: 'center', color: colors.background}}>{`${items[0].value.toFixed(1)} ${items[0].unit}`}</Text>
                    </View>
                  </View>
                );
              },
            }}
          />

          <View style={s.legendContainer}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, {backgroundColor: colors.primary}]} />
              <Text style={s.legendText}>이번달</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, {backgroundColor: colors.secondary}]} />
              <Text style={s.legendText}>전{chartType === 'month' ? '년' : '월'}</Text>
            </View>
          </View>
        </Card>

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
