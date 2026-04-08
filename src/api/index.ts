import {APIStorage, API_CONFIG} from './config';
import {APIError, ChartResponse, CurrentDataResponse, Device, DevicesResponse, Metric, Target} from './types';

class DawonAPIClient {
  private baseURL: string | null = null;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL?: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL ? baseURL.replace(/\/$/, '') : null;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Get the current base URL, loading from AsyncStorage if not set
   */
  async getBaseURL(): Promise<string> {
    if (this.baseURL) {
      return this.baseURL;
    }

    // Load from AsyncStorage
    const storedURL = await APIStorage.getBaseURL();
    this.baseURL = storedURL.replace(/\/$/, ''); // Cache it and remove trailing slash
    return this.baseURL;
  }

  /**
   * Update the base URL and save to AsyncStorage
   */
  async setBaseURL(url: string): Promise<void> {
    this.baseURL = url.replace(/\/$/, '');
    await APIStorage.setBaseURL(this.baseURL);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseURL = await this.getBaseURL();
    const url = `${baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(`API Error: ${response.status} ${response.statusText}`, response.status, response);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout');
        }
        throw new APIError(`Network error: ${error.message}`);
      }

      throw new APIError('Unknown error occurred');
    }
  }

  /**
   * Update default headers (e.g., for authentication)
   */
  setHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = {...this.defaultHeaders, ...headers};
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.setHeaders({Authorization: `Bearer ${token}`});
  }

  /**
   * Root endpoint
   */
  async getRoot(): Promise<any> {
    return this.makeRequest('/');
  }

  /**
   * Get all devices
   */
  async getDevices(): Promise<DevicesResponse> {
    return this.makeRequest<DevicesResponse>('/devices');
  }

  /**
   * Get chart data for a specific device
   * @param deviceId - The device ID
   * @param target - Chart data unit (hour, day, month, year)
   * @param metric - Chart data metric (power, fee)
   */
  async getChartData(deviceId: string, target: Target, metric: Metric): Promise<ChartResponse> {
    const params = new URLSearchParams({
      target,
      metric,
    });

    return this.makeRequest<ChartResponse>(`/devices/${encodeURIComponent(deviceId)}/chart?${params}`);
  }

  /**
   * Get current data for a specific device
   * @param deviceId - The device ID
   */
  async getCurrentData(deviceId: string): Promise<CurrentDataResponse> {
    return this.makeRequest<CurrentDataResponse>(`/devices/${encodeURIComponent(deviceId)}/current`);
  }
}

// Create and export API client instance
export const dawonAPI = new DawonAPIClient();

// Export the class for custom instances
export {DawonAPIClient};

// Utility functions
export const createDawonAPIClient = (baseURL?: string, defaultHeaders?: Record<string, string>) => {
  return new DawonAPIClient(baseURL, defaultHeaders);
};

// Export APIStorage for managing base URL and device selection
export {APIStorage};

// Utility functions for device management
export const DeviceManager = {
  /**
   * Get the currently selected device information
   */
  async getSelectedDevice(): Promise<Device | null> {
    try {
      const deviceId = await APIStorage.getSelectedDeviceId();
      if (!deviceId) {
        return null;
      }

      const devices = await dawonAPI.getDevices();
      const device = devices.find(d => d.device_id === deviceId);

      return device || null;
    } catch (error) {
      console.error('Failed to get selected device:', error);
      return null;
    }
  },

  /**
   * Check if a device is currently selected
   */
  async hasSelectedDevice(): Promise<boolean> {
    try {
      const deviceId = await APIStorage.getSelectedDeviceId();
      return !!deviceId;
    } catch (error) {
      console.error('Failed to check selected device:', error);
      return false;
    }
  },

  /**
   * Clear the selected device
   */
  async clearSelectedDevice(): Promise<void> {
    return APIStorage.removeSelectedDeviceId();
  },
};
