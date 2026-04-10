import {useEffect, useRef, useState} from 'react';

import {dawonAPI} from '@/api';
import {ChartDataPoint, Device, Target} from '@/api/types';

interface FeeMap {
  [date: string]: number;
}

export function useChartData(selectedDevice: Device | null) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [oldChartData, setOldChartData] = useState<ChartDataPoint[]>([]);
  const [feeMap, setFeeMap] = useState<FeeMap>({});
  const [chartType, setChartType] = useState<Target>('hour');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadChartData = async (device?: Device) => {
    const targetDevice = device || selectedDevice;
    if (!targetDevice) return;

    setIsLoading(true);
    try {
      const [powerResponse, feeResponse] = await Promise.all([dawonAPI.getChartData(targetDevice.device_id, chartType, 'power'), dawonAPI.getChartData(targetDevice.device_id, chartType, 'fee')]);

      setChartData(powerResponse.data || []);
      setOldChartData(powerResponse.old_data || []);

      const newFeeMap: FeeMap = {};
      for (const item of feeResponse.data || []) {
        newFeeMap[item.date] = item.value;
      }
      for (const item of feeResponse.old_data || []) {
        newFeeMap[item.date] = item.value;
      }
      setFeeMap(newFeeMap);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDevice) {
      loadChartData();
    }
  }, [chartType, selectedDevice]);

  return {
    chartData,
    oldChartData,
    feeMap,
    chartType,
    setChartType,
    isLoading,
    loadChartData,
  };
}
