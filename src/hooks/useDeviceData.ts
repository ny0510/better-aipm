import {router} from 'expo-router';
import {useEffect, useState} from 'react';
import {Alert} from 'react-native';

import {APIStorage, DeviceManager, dawonAPI} from '@/api';
import {Device} from '@/api/types';

interface CurrentData {
  currentWh: number;
  monthlyKwh: number;
  temperature: number;
  powered: boolean;
}

interface RealtimeDataPoint {
  value: number;
}

export function useDeviceData() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [currentData, setCurrentData] = useState<CurrentData>({
    currentWh: 0,
    monthlyKwh: 0,
    temperature: 0,
    powered: false,
  });
  const [realtimeChartData, setRealtimeChartData] = useState<RealtimeDataPoint[]>([{value: 50}, {value: 50}, {value: 50}, {value: 50}]);
  const [loading, setLoading] = useState(true);
  const [hasShownError, setHasShownError] = useState(false);

  const loadCurrentData = async (device?: Device) => {
    const targetDevice = device || selectedDevice;
    if (!targetDevice) return;

    try {
      const data = await dawonAPI.getCurrentData(targetDevice.device_id);

      setCurrentData({
        currentWh: data.current_watt ? parseFloat(data.current_watt) : 0,
        monthlyKwh: data.monthly_kwh ? parseFloat(data.monthly_kwh) : 0,
        temperature: data.temperature ? parseFloat(data.temperature) : 0,
        powered: data.powered ? JSON.parse(data.powered) : false,
      });

      const newValue = data.current_watt ? parseFloat(data.current_watt) : 0;
      setRealtimeChartData(prevData => {
        const newData = [...prevData, {value: newValue}];
        return newData.length > 50 ? newData.slice(1) : newData;
      });
    } catch (error) {
      console.error('Failed to load current data:', error);
    }
  };

  const loadInitialData = async () => {
    try {
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

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadCurrentData, 30_000);
    return () => clearInterval(interval);
  }, []);

  return {
    selectedDevice,
    currentData,
    realtimeChartData,
    loading,
    loadCurrentData,
  };
}
