import {useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {DeviceManager} from '@/api';
import {Device} from '@/api/types';
import Card from '@/components/Card';
import gs from '@/styles/global';
import colors from '@/styles/theme/colors';
import {MaterialIcons} from '@expo/vector-icons';

export default function DeviceDetail() {
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeviceData();
  }, []);

  const loadDeviceData = async () => {
    try {
      const selectedDevice = await DeviceManager.getSelectedDevice();
      if (!selectedDevice) {
        Alert.alert('오류', '선택된 디바이스가 없습니다.');
        router.back();
        return;
      }
      setDevice(selectedDevice);
    } catch (error) {
      console.error('Failed to load device data:', error);
      Alert.alert('오류', '디바이스 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const selectedDevice = await DeviceManager.getSelectedDevice();
      if (selectedDevice) {
        setDevice(selectedDevice);
      }
    } catch (error) {
      console.error('Failed to refresh device data:', error);
      Alert.alert('오류', '데이터 새로고침에 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
  };

  const formatBoolean = (value: string) => {
    return value === 'true' || value === '1' ? '예' : '아니오';
  };

  if (loading) {
    return (
      <View style={[gs.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: colors.text, fontSize: 16}}>디바이스 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[gs.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: colors.text, fontSize: 16}}>디바이스 정보가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={gs.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>디바이스 상세정보</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={gs.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
        <Card title="기본 정보">
          <View style={s.infoSection}>
            <InfoRow label="디바이스 이름" value={device.device_profile.display_name} icon="devices" />
            <View style={s.separator} />
            <InfoRow label="디바이스 ID" value={device.device_id} icon="fingerprint" expandable />
            <View style={s.separator} />
            <InfoRow label="시스템 ID" value={device.system_id} icon="memory" expandable />
            <View style={s.separator} />
            <InfoRow label="모델 ID" value={device.model_id} icon="router" />
            <View style={s.separator} />
            <InfoRow label="등록일시" value={formatDate(device.registed_time)} icon="event" />
            <View style={s.separator} />
            <InfoRow label="연결 상태" value={device.conn_status === '1' ? '연결됨' : '연결 안됨'} icon="wifi" iconColor={device.conn_status === '1' ? colors.success : colors.danger} />
            <View style={s.separator} />
            <InfoRow label="공유 여부" value={formatBoolean(device.is_shared)} icon="share" />
          </View>
        </Card>

        <Card title="네트워크 정보">
          <View style={s.infoSection}>
            <InfoRow label="IP 주소" value={device.device_profile.device_ip} icon="lan" expandable />
            <View style={s.separator} />
            <InfoRow label="Wi-Fi SSID" value={device.device_profile.ssid_info} icon="wifi" expandable />
            <View style={s.separator} />
            <InfoRow label="서비스 번호" value={device.device_profile.service_no} icon="tag" expandable />
          </View>
        </Card>

        <Card title="펌웨어 정보">
          <View style={s.infoSection}>
            <InfoRow label="현재 버전" value={device.device_profile.device_version} icon="system-update" />
            <View style={s.separator} />
            <InfoRow label="최신 버전" value={device.device_profile.max_version} icon="system-update-alt" />
          </View>
        </Card>

        <Card title="전원 및 제어">
          <View style={s.infoSection}>
            <InfoRow label="전원 상태" value={formatBoolean(device.device_profile.power)} icon="power-settings-new" iconColor={device.device_profile.power === 'true' ? colors.success : colors.danger} />
            <View style={s.separator} />
            <InfoRow label="제어 확인" value={device.control_confirm === 'Y' ? '예' : '아니오'} icon="check-circle" />
            <View style={s.separator} />
            <InfoRow label="타이머 활성화" value={formatBoolean(device.device_profile.timer_enable)} icon="timer" />
            <View style={s.separator} />
            <InfoRow label="알람 활성화" value={formatBoolean(device.device_profile.alarm_enable)} icon="notifications" />
          </View>
        </Card>

        <Card title="스케줄 및 자동화">
          <View style={s.infoSection}>
            <InfoRow label="스케줄" value={formatBoolean(device.device_profile.schedules.enable)} icon="schedule" />
            <View style={s.separator} />
            <InfoRow label="일출/일몰 자동화" value={formatBoolean(device.device_profile.sunupdown.enable)} icon="wb-sunny" />
            <View style={s.separator} />
            <InfoRow label="주의 알림" value={formatBoolean(device.device_profile.caution.enable)} icon="warning" />
            <View style={s.separator} />
            <InfoRow label="대기 모드" value={formatBoolean(device.device_profile.wait_enable)} icon="hourglass-empty" />
            <View style={s.separator} />
            <InfoRow label="Echo 연동" value={formatBoolean(device.device_profile.echo_enable)} icon="speaker" />
          </View>
        </Card>

        <Card title="전기 요금 설정">
          <View style={s.infoSection}>
            <InfoRow label="요금 기준일" value={`매월 ${device.device_profile.fee_date}일`} icon="calendar-today" />
            <View style={s.separator} />
            <InfoRow label="요금 기준" value={device.device_profile.fee_stand} icon="attach-money" />
            <View style={s.separator} />
            <InfoRow label="kWh당 요금" value={`${device.device_profile.fee_kwh}원`} icon="paid" />
            <View style={s.separator} />
            <InfoRow label="기본 요금 사용" value={device.device_profile.use_fee_base === 'Y' ? '예' : '아니오'} icon="receipt" />
          </View>
        </Card>

        <Card title="이상 감지 통계">
          <View style={s.infoSection}>
            <InfoRow label="과전류 감지 횟수" value={`${device.device_profile.over_cnt}회`} icon="error" iconColor={parseInt(device.device_profile.over_cnt || '0') > 0 ? colors.danger : colors.text} />
            <View style={s.separator} />
            <InfoRow label="단락 감지 횟수" value={`${device.device_profile.short_cnt}회`} icon="bolt" iconColor={parseInt(device.device_profile.short_cnt || '0') > 0 ? colors.danger : colors.text} />
            <View style={s.separator} />
            <InfoRow label="연결 끊김 횟수" value={`${device.device_profile.disconnect_cnt}회`} icon="link-off" iconColor={parseInt(device.device_profile.disconnect_cnt || '0') > 0 ? colors.danger : colors.text} />
            <View style={s.separator} />
            <InfoRow label="공장 초기화 횟수" value={`${device.device_profile.fac_count}회`} icon="restore" />
          </View>
        </Card>

        {device.prod_info.prod_name && (
          <Card title="제품 정보">
            <View style={s.infoSection}>
              <InfoRow label="제품명" value={device.prod_info.prod_name} icon="devices-other" />
              {device.prod_info.prod_manu_name && (
                <>
                  <View style={s.separator} />
                  <InfoRow label="제조사" value={device.prod_info.prod_manu_name} icon="business" />
                </>
              )}
              {device.prod_info.prod_model_no && (
                <>
                  <View style={s.separator} />
                  <InfoRow label="모델 번호" value={device.prod_info.prod_model_no} icon="tag" />
                </>
              )}
              {device.prod_info.prod_year && (
                <>
                  <View style={s.separator} />
                  <InfoRow label="제조 연도" value={device.prod_info.prod_year} icon="date-range" />
                </>
              )}
              {device.prod_info.prod_power && (
                <>
                  <View style={s.separator} />
                  <InfoRow label="정격 전력" value={device.prod_info.prod_power} icon="bolt" />
                </>
              )}
              {device.prod_info.prod_energy_grade && (
                <>
                  <View style={s.separator} />
                  <InfoRow label="에너지 등급" value={device.prod_info.prod_energy_grade} icon="energy-savings-leaf" />
                </>
              )}
            </View>
          </Card>
        )}

        <Card title="사용자 알림 설정">
          <View style={s.infoSection}>
            <InfoRow label="푸시 알림" value={formatBoolean(device.user_profile.push_alarm)} icon="notifications-active" />
            <View style={s.separator} />
            <InfoRow label="과다 사용 알림" value={formatBoolean(device.user_profile.overuse)} icon="warning" />
            <View style={s.separator} />
            <InfoRow label="제어 실패 알림" value={device.user_profile.control_fail_alarm === 'Y' ? '예' : '아니오'} icon="error-outline" />
            <View style={s.separator} />
            <InfoRow label="연결 상태 알림" value={device.device_profile.connect_status_alarm === 'Y' ? '예' : '아니오'} icon="signal-wifi-statusbar-connected-no-internet-4" />
          </View>
        </Card>

        {device.device_profile.gateway_id && (
          <Card title="게이트웨이 정보">
            <View style={s.infoSection}>
              <InfoRow label="게이트웨이 ID" value={device.device_profile.gateway_id} icon="router" expandable />
              <View style={s.separator} />
              <InfoRow label="게이트웨이 이름" value={device.device_profile.gateway_display_name || '-'} icon="label" />
              <View style={s.separator} />
              <InfoRow label="연결 상태" value={device.device_profile.gateway_conn_status === '1' ? '연결됨' : '연결 안됨'} icon="wifi" iconColor={device.device_profile.gateway_conn_status === '1' ? colors.success : colors.danger} />
            </View>
          </Card>
        )}

        <Card title="AI 및 ECS 상태">
          <View style={s.infoSection}>
            <InfoRow label="AI 상태" value={device.device_profile.ai_status === '1' ? '활성화' : '비활성화'} icon="psychology" />
            <View style={s.separator} />
            <InfoRow label="ECS 상태" value={device.device_profile.ecs_status === '1' ? '활성화' : '비활성화'} icon="eco" />
          </View>
        </Card>

        {device.ir_device_id && (
          <Card title="IR 정보">
            <View style={s.infoSection}>
              <InfoRow label="IR 디바이스 ID" value={device.ir_device_id} icon="sensors" expandable />
              {device.ir_device_name && (
                <>
                  <View style={s.separator} />
                  <InfoRow label="IR 디바이스 이름" value={device.ir_device_name} icon="label" />
                </>
              )}
              <View style={s.separator} />
              <InfoRow label="마지막 상태" value={device.ir_info.last_status} icon="history" />
              <View style={s.separator} />
              <InfoRow label="표준 지연시간" value={`${device.ir_info.std_delay}ms`} icon="timer" />
            </View>
          </Card>
        )}

        <Card title="그룹 정보">
          <View style={s.infoSection}>
            <InfoRow label="그룹" value={device.group} icon="folder" />
            {device.low_group_id && (
              <>
                <View style={s.separator} />
                <InfoRow label="하위 그룹 ID" value={device.low_group_id} icon="folder-open" />
              </>
            )}
            <View style={s.separator} />
            <InfoRow label="사용자 그룹" value={device.user_profile.user_group_id || '-'} icon="group" />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  expandable?: boolean;
}

function InfoRow({label, value, icon, iconColor, expandable = false}: InfoRowProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  const RowContent = (
    <>
      <View style={s.infoRowLeft}>
        {icon && <MaterialIcons name={icon} size={20} color={iconColor || colors.textSecondary} />}
        <Text style={s.infoLabel}>{label}</Text>
      </View>
      <Text style={[s.infoValue, expanded && s.infoValueExpanded]} numberOfLines={expanded ? undefined : 1} ellipsizeMode="tail">
        {value}
      </Text>
    </>
  );

  if (expandable) {
    return (
      <TouchableOpacity style={[s.infoRow, expanded && s.infoRowExpanded]} onPress={toggleExpanded} activeOpacity={0.7}>
        {RowContent}
      </TouchableOpacity>
    );
  }

  return <View style={s.infoRow}>{RowContent}</View>;
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'SuitSemiBold',
    color: colors.text,
  },
  scrollContent: {
    gap: 14,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  infoRowExpanded: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'SuitMedium',
    color: colors.text,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'SuitRegular',
    color: colors.textSecondary,
    textAlign: 'right',
    flex: 1,
  },
  infoValueExpanded: {
    textAlign: 'left',
    flex: 0,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});
