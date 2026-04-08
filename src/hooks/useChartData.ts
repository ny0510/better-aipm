import {useEffect, useState} from 'react';

import {dawonAPI} from '@/api';
import {ChartDataPoint, Device, Metric, Target} from '@/api/types';

export function useChartData(selectedDevice: Device | null) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [oldChartData, setOldChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<Target>('hour');
  const [dataType, setDataType] = useState<Metric>('power');

  const loadChartData = async (device?: Device) => {
    const targetDevice = device || selectedDevice;
    if (!targetDevice) return;

    try {
      const response = await dawonAPI.getChartData(targetDevice.device_id, chartType, dataType);

      setChartData(response.data || []);
      setOldChartData(response.old_data || []);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  useEffect(() => {
    if (selectedDevice) {
      loadChartData();
    }
  }, [chartType, dataType, selectedDevice]);

  return {
    chartData,
    oldChartData,
    chartType,
    dataType,
    setChartType,
    setDataType,
    loadChartData,
  };
}
