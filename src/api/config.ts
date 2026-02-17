import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_CONFIG = {
  BASE_URL_KEY: 'dawon_api_base_url',
  SELECTED_DEVICE_ID_KEY: 'dawon_selected_device_id',
  TIMEOUT: 10_000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1_000,
};

export const APIStorage = {
  /**
   * Get base URL from AsyncStorage
   */
  async getBaseURL(): Promise<string | null> {
    try {
      const storedURL = await AsyncStorage.getItem(API_CONFIG.BASE_URL_KEY);
      return storedURL;
    } catch (error) {
      console.warn('Failed to get base URL from AsyncStorage:', error);
      return null;
    }
  },

  /**
   * Set base URL in AsyncStorage
   */
  async setBaseURL(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.BASE_URL_KEY, url);
    } catch (error) {
      console.error('Failed to save base URL to AsyncStorage:', error);
      throw error;
    }
  },

  /**
   * Remove base URL from AsyncStorage (will use default)
   */
  async removeBaseURL(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.BASE_URL_KEY);
    } catch (error) {
      console.error('Failed to remove base URL from AsyncStorage:', error);
      throw error;
    }
  },

  /**
   * Get selected device ID from AsyncStorage
   */
  async getSelectedDeviceId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.SELECTED_DEVICE_ID_KEY);
    } catch (error) {
      console.warn('Failed to get selected device ID from AsyncStorage:', error);
      return null;
    }
  },

  /**
   * Set selected device ID in AsyncStorage
   */
  async setSelectedDeviceId(deviceId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.SELECTED_DEVICE_ID_KEY, deviceId);
    } catch (error) {
      console.error('Failed to save selected device ID to AsyncStorage:', error);
      throw error;
    }
  },

  /**
   * Remove selected device ID from AsyncStorage
   */
  async removeSelectedDeviceId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.SELECTED_DEVICE_ID_KEY);
    } catch (error) {
      console.error('Failed to remove selected device ID from AsyncStorage:', error);
      throw error;
    }
  },
};
