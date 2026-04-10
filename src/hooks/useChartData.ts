import {useEffect, useRef, useState} from 'react';

import {dawonAPI} from '@/api';
import {ChartDataPoint, Device, Target} from '@/api/types';

interface FeeMap {
  [date: string]: number;
}

export function useChartData(selectedDevice: Device | null) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [oldChartData, setOldChartData] = useState<ChartDataPoint[]>([]);
  const [currentFeeMap, setCurrentFeeMap] = useState<FeeMap>({});
  const [oldFeeMap, setOldFeeMap] = useState<FeeMap>({});
  const [chartType, setChartType] = useState<Target>('hour');
  const [isLoading, setIsLoading] = useState(false);

  const loadChartData = async (device?: Device) => {
    const targetDevice = device || selectedDevice;
    if (!targetDevice) return;

    setIsLoading(true);
    try {
      const [powerResponse, feeResponse] = await Promise.all([dawonAPI.getChartData(targetDevice.device_id, chartType, 'power'), dawonAPI.getChartData(targetDevice.device_id, chartType, 'fee')]);

      setChartData(powerResponse.data || []);
      setOldChartData(powerResponse.old_data || []);

      const buildMap = (items: ChartDataPoint[]) => {
        const map: FeeMap = {};
        for (const item of items) {
          map[item.date] = item.value;
        }
        return map;
      };
      setCurrentFeeMap(buildMap(feeResponse.data || []));
      setOldFeeMap(buildMap(feeResponse.old_data || []));
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
    currentFeeMap,
    oldFeeMap,
    chartType,
    setChartType,
    isLoading,
    loadChartData,
  };
}
