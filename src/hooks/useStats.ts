import {useEffect, useState} from 'react';

import {dawonAPI} from '@/api';
import {Device} from '@/api/types';
import {calculateAverageAndMaxPower, extractCurrentAndPreviousMonthValues, findDailyUsage, getPreviousDay} from '@/utils/date';

interface DailyStats {
  todayUsage: number;
  yesterdayUsage: number;
  averagePower: number;
  maxPower: number;
}

interface MonthlyStats {
  thisMonthUsage: number;
  lastMonthUsage: number;
  thisMonthFee: number;
  lastMonthFee: number;
}

export function useStats(selectedDevice: Device | null) {
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    todayUsage: 0,
    yesterdayUsage: 0,
    averagePower: 0,
    maxPower: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    thisMonthUsage: 0,
    lastMonthUsage: 0,
    thisMonthFee: 0,
    lastMonthFee: 0,
  });

  const loadDailyStats = async (device?: Device) => {
    const targetDevice = device || selectedDevice;
    if (!targetDevice) return;

    try {
      const dailyResponse = await dawonAPI.getChartData(targetDevice.device_id, 'day', 'power');
      const hourlyResponse = await dawonAPI.getChartData(targetDevice.device_id, 'hour', 'power');

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

  const loadMonthlyStats = async (device?: Device) => {
    const targetDevice = device || selectedDevice;
    if (!targetDevice) return;

    try {
      const powerResponse = await dawonAPI.getChartData(targetDevice.device_id, 'month', 'power');
      const feeResponse = await dawonAPI.getChartData(targetDevice.device_id, 'month', 'fee');
      const dailyFeeResponse = await dawonAPI.getChartData(targetDevice.device_id, 'day', 'fee');

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

  const loadAllStats = async (device?: Device) => {
    await Promise.all([loadDailyStats(device), loadMonthlyStats(device)]);
  };

  useEffect(() => {
    if (selectedDevice) {
      loadAllStats(selectedDevice);
    }
  }, [selectedDevice]);

  return {
    dailyStats,
    monthlyStats,
    loadDailyStats,
    loadMonthlyStats,
    loadAllStats,
  };
}
