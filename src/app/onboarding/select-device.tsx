import {useLocalSearchParams, useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {APIStorage, DawonAPIClient, DeviceManager} from '@/api';
import {Device} from '@/api/types';
import Card from '@/components/Card';
import gs from '@/styles/global';
import colors from '@/styles/theme/colors';

interface DeviceItemProps {
  device: Device;
  onSelect: (device: Device) => void;
}

function DeviceItem({device, onSelect}: DeviceItemProps) {
  return (
    <TouchableOpacity onPress={() => onSelect(device)} style={s.deviceItem} activeOpacity={0.7}>
      <Card style={s.deviceCard}>
        <View style={s.deviceHeader}>
          <Text style={s.deviceName}>{device.device_profile.display_name}</Text>
          <View style={[s.statusBadge, device.conn_status === '1' ? s.online : s.offline]}>
            <Text style={s.statusText}>{device.conn_status === '1' ? '온라인' : '오프라인'}</Text>
          </View>
        </View>
        <Text style={s.deviceDetail}>
          {device.model_id} / {device.device_profile.device_ip} / {device.device_profile.device_version}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

export default function SelectDevice() {
  const {serverUrl} = useLocalSearchParams<{serverUrl: string}>();
  const router = useRouter();
  console.log('Server URL:', serverUrl);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Set the base URL if provided
      if (serverUrl) {
        await APIStorage.setBaseURL(serverUrl);
      }

      const apiClient = new DawonAPIClient();
      const response = await apiClient.getDevices();
      setDevices(response || []);
    } catch (err) {
      console.error('Failed to load devices:', err);
      setError('디바이스 목록을 불러오는데 실패했습니다.');
      Alert.alert('오류', '디바이스 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSelect = (device: Device) => {
    Alert.alert('디바이스 선택', `${device.device_profile.display_name}을(를) 선택하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '선택',
        onPress: async () => {
          try {
            await APIStorage.setSelectedDeviceId(device.device_id);
            // Verify the device ID was saved before navigating
            const savedDeviceId = await APIStorage.getSelectedDeviceId();
            if (savedDeviceId === device.device_id) {
              router.replace('/');
            } else {
              throw new Error('Device ID verification failed');
            }
          } catch (error) {
            console.error('Failed to save selected device:', error);
            Alert.alert('오류', '디바이스 선택을 저장하는데 실패했습니다.');
          }
        },
      },
    ]);
  };

  const renderDevice = ({item}: {item: Device}) => <DeviceItem device={item} onSelect={handleDeviceSelect} />;

  if (loading) {
    return (
      <View style={[gs.container, s.centerContent]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={s.loadingText}>디바이스 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[gs.container, s.centerContent]}>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadDevices} style={s.retryButton}>
          <Text style={s.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={gs.container}>
      <View style={gs.scrollView}>
        <Text style={s.title}>디바이스 선택</Text>
        <Text style={s.subtitle}>관리할 디바이스를 선택해주세요.</Text>

        {(devices || []).length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>등록된 디바이스가 없습니다.</Text>
          </View>
        ) : (
          <FlatList data={devices || []} renderItem={renderDevice} keyExtractor={item => item.device_id} showsVerticalScrollIndicator={false} contentContainerStyle={s.listContainer} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  title: {
    fontSize: 28,
    fontFamily: 'SuitBold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SuitRegular',
    color: colors.textSecondary,
    marginBottom: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'SuitRegular',
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'SuitRegular',
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'SuitMedium',
    color: colors.text,
  },
  listContainer: {
    paddingBottom: 20,
  },
  deviceItem: {
    marginBottom: 12,
  },
  deviceCard: {
    padding: 0,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 18,
    fontFamily: 'SuitBold',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  online: {
    backgroundColor: colors.success,
  },
  offline: {
    backgroundColor: colors.textSecondary,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'SuitMedium',
    color: 'white',
  },
  deviceDetail: {
    fontSize: 14,
    fontFamily: 'SuitRegular',
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'SuitRegular',
    color: colors.textSecondary,
  },
});
