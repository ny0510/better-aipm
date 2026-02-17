import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import Card from '@/components/Card';
import gs from '@/styles/global';
import colors from '@/styles/theme/colors';
import {MaterialIcons} from '@expo/vector-icons';

export default function Onboarding() {
  const router = useRouter();
  const [serverUrl, setServerUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      return urlPattern.test(url);
    } catch {
      return false;
    }
  };

  const checkServerConnection = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${url}`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleUrlValidation = async () => {
    if (!serverUrl.trim()) {
      setValidationStatus('invalid');
      setErrorMessage('서버 주소를 입력해주세요.');
      return;
    }

    if (!validateUrl(serverUrl)) {
      setValidationStatus('invalid');
      setErrorMessage('올바른 URL 형식이 아닙니다.');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setErrorMessage('');

    try {
      const isConnectable = await checkServerConnection(serverUrl);

      if (isConnectable) {
        setValidationStatus('valid');
        setErrorMessage('');
        router.push(`/onboarding/select-device?serverUrl=${encodeURIComponent(serverUrl)}`);
      } else {
        setValidationStatus('invalid');
        setErrorMessage('서버에 연결할 수 없습니다. URL을 확인해주세요.');
      }
    } catch (error) {
      setValidationStatus('invalid');
      setErrorMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <MaterialIcons name="hourglass-empty" size={20} color={colors.textSecondary} />;
    }

    switch (validationStatus) {
      case 'valid':
        return <MaterialIcons name="check-circle" size={20} color={colors.success} />;
      case 'invalid':
        return <MaterialIcons name="error" size={20} color={colors.danger} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (validationStatus) {
      case 'valid':
        return colors.success;
      case 'invalid':
        return colors.danger;
      default:
        return colors.border;
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View />
      <View style={s.welcomeSection}>
        <MaterialIcons name="electrical-services" size={48} color={colors.primary} />
        <Text style={s.title}>API 서버 설정</Text>
        <Text style={s.subtitle}>
          전력 모니터링 시스템에 연결하기 위해{'\n'}
          API 서버 주소를 입력해주세요.
        </Text>
      </View>

      <Card style={s.inputCard}>
        <View style={s.inputContainer}>
          <Text style={s.inputLabel}>API 서버 주소</Text>
          <View style={[s.inputWrapper, {borderColor: getStatusColor()}]}>
            <TextInput style={s.textInput} value={serverUrl} onChangeText={setServerUrl} placeholder="https://example.com" placeholderTextColor={colors.textSecondary} autoCapitalize="none" autoCorrect={false} keyboardType="url" onSubmitEditing={handleUrlValidation} />
            {getStatusIcon()}
          </View>

          {validationStatus === 'invalid' && errorMessage && (
            <View style={s.errorContainer}>
              <MaterialIcons name="warning" size={16} color={colors.danger} />
              <Text style={s.errorText}>{errorMessage}</Text>
            </View>
          )}

          {validationStatus === 'valid' && (
            <View style={s.successContainer}>
              <MaterialIcons name="check" size={16} color={colors.success} />
              <Text style={s.successText}>서버 연결이 확인되었습니다!</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={[s.button, isValidating && s.buttonDisabled]} onPress={handleUrlValidation} disabled={isValidating} activeOpacity={0.7}>
          {isValidating ? <MaterialIcons name="hourglass-empty" size={20} color={colors.background} /> : <MaterialIcons name="link" size={20} color={colors.background} />}
          <Text style={s.buttonText}>{isValidating ? '연결 확인 중...' : '연결 확인'}</Text>
        </TouchableOpacity>
      </Card>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    marginBottom: 20,
    flex: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'SuitBold',
    letterSpacing: -1,
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SuitRegular',
    letterSpacing: -0.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'SuitSemiBold',
    color: colors.text,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.background,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'SuitRegular',
    color: colors.text,
    padding: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'SuitRegular',
    color: colors.danger,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  successText: {
    fontSize: 14,
    fontFamily: 'SuitRegular',
    color: colors.success,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'SuitSemiBold',
    color: colors.background,
  },
});
