import {requireOptionalNativeModule} from 'expo-modules-core';

export type WidgetConfigModuleType = {
  updateBaseUrl: (url: string | null) => void;
  updateDeviceId: (deviceId: string | null) => void;
};

// ponytail: requireOptionalNativeModule instead of requireNativeModule so the import
// resolves to null on Android / unsupported platforms instead of throwing — callers
// guard with Platform.OS === 'ios' before invoking, so a null here is harmless.
const WidgetConfig = requireOptionalNativeModule<WidgetConfigModuleType>('WidgetConfig');

export default WidgetConfig;
