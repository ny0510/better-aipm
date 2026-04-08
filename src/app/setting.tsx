import {useRouter} from 'expo-router';
import React from 'react';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {dawonAPI} from '@/api';
import {APIStorage, API_CONFIG} from '@/api/config';
import Card from '@/components/Card';
import gs from '@/styles/global';
import colors from '@/styles/theme/colors';
import {MaterialIcons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Setting() {
  const router = useRouter();

  const handleResetDevice = () => {
    Alert.alert('디바이스 재선택', '디바이스를 재선택하시겠습니까? 현재 선택된 디바이스 정보가 초기화되고, 디바이스 선택 화면으로 돌아갑니다.', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '재선택',
        style: 'destructive',
        onPress: async () => {
          try {
            await APIStorage.removeSelectedDeviceId();
            router.replace(`/onboarding/select-device?serverUrl=${encodeURIComponent(await dawonAPI.getBaseURL())}`);
          } catch (error) {
            console.error('Failed to reset device:', error);
            Alert.alert('오류', '디바이스 재선택에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <View style={gs.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>설정</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={gs.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Card title="디바이스 관리">
          <TouchableOpacity style={s.settingItem} onPress={handleResetDevice} activeOpacity={0.7}>
            <View style={s.settingItemLeft}>
              <MaterialIcons name="device-hub" size={24} color={colors.text} />
              <View style={{flexShrink: 1}}>
                <Text style={s.settingItemTitle}>디바이스 재선택</Text>
                <Text style={s.settingItemSubtitle}>디바이스 선택 화면으로 돌아갑니다</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={s.separator} />

          <TouchableOpacity
            style={s.settingItem}
            onPress={() => {
              Alert.alert('모든 데이터 초기화', '모든 앱 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
                {
                  text: '취소',
                  style: 'cancel',
                },
                {
                  text: '초기화',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.clear();
                      router.replace('/onboarding');
                    } catch (error) {
                      console.error('Failed to reset all data:', error);
                      Alert.alert('오류', '데이터 초기화에 실패했습니다.');
                    }
                  },
                },
              ]);
            }}
            activeOpacity={0.7}>
            <View style={s.settingItemLeft}>
              <MaterialIcons name="delete-forever" size={24} color={colors.text} />
              <View style={{flexShrink: 1}}>
                <Text style={s.settingItemTitle}>모든 데이터 초기화</Text>
                <Text style={s.settingItemSubtitle}>앱의 모든 데이터를 초기화합니다</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Card title="앱 정보">
          <View style={s.infoItem}>
            <View style={s.settingItemLeft}>
              <MaterialIcons name="info" size={24} color={colors.text} />
              <View>
                <Text style={s.settingItemTitle}>버전</Text>
                <Text style={s.settingItemSubtitle}>1.0.0</Text>
              </View>
            </View>
          </View>

          {/* <View style={s.separator} /> */}
        </Card>
      </ScrollView>
    </View>
  );
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontFamily: 'SuitMedium',
    color: colors.text,
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    fontFamily: 'SuitRegular',
    color: colors.textSecondary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
});
