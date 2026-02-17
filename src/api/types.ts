export interface ChartDataPoint {
  date: string; // ISO date-time string
  value: number;
  unit: string;
}

export interface ChartResponse {
  data: ChartDataPoint[];
  old_data: ChartDataPoint[];
}

export interface CurrentDataResponse {
  powered?: string;
  current_watt?: string;
  monthly_kwh?: string;
  temperature?: string;
}

export interface DeviceSchedules {
  enable: string;
  setting_id: string | null;
}

export interface DeviceSunupDown {
  enable: string;
  setting_id: string | null;
}

export interface DeviceCaution {
  enable: string;
  setting_id: string | null;
}

export interface DeviceProfile {
  display_icon: string;
  display_name: string;
  display_icon_name: string;
  icon_use_premiere: string;
  icon_use_care: string;
  extra: string;
  schedules: DeviceSchedules;
  sunupdown: DeviceSunupDown;
  caution: DeviceCaution;
  power: string;
  device_ip: string;
  timer_enable: string;
  alarm_enable: string;
  wait_enable: string;
  echo_enable: string;
  fee_date: string;
  fee_stand: string;
  fee_kwh: string;
  over_cnt: string;
  short_cnt: string;
  disconnect_cnt: string;
  ssid_info: string;
  use_fee_base: string;
  max_version: string;
  device_version: string;
  fac_count: number;
  connect_status_alarm: string;
  user_group_id: string | null;
  trespass_id: string;
  ecs_status: string;
  ecs_check_log: string | null;
  ecs_adjust: string | null;
  gateway_id: string | null;
  gateway_display_name: string;
  gateway_end_count: number;
  service_no: string;
  kt_related: string | null;
  peak_use: string | null;
  peak_value: string | null;
  peak_stand: string | null;
  gateway_conn_status: string;
  predicted_icon: string | null;
  product_hold: string | null;
  ai_status: string;
  operate: string | null;
  ecs_ai_check_log: string | null;
  status_type: string | null;
}

export interface UserProfile {
  push_alarm: string;
  overuse: string;
  user_group_id: string;
  control_fail_alarm: string;
}

export interface ProdInfo {
  prod_manu_name: string | null;
  prod_year: string | null;
  prod_model_no: string | null;
  prod_power: string | null;
  prod_name: string;
  prod_energy_grade: string | null;
  label_file_name: string | null;
  label_datauri: string | null;
  energyInfo: string | null;
}

export interface IRInfo {
  last_status: string;
  std_delay: string;
}

export interface Device {
  device_id: string;
  ir_device_id: string | null;
  ir_device_name: string | null;
  registed_time: string;
  system_id: string;
  model_id: string;
  is_shared: string;
  conn_status: string;
  group: string;
  low_group_id: string | null;
  device_profile: DeviceProfile;
  user_profile: UserProfile;
  prod_info: ProdInfo;
  ir_info: IRInfo;
  control_confirm: string;
  ai_active: string | null;
  display_icon: string | null;
}
export type DevicesResponse = Device[];

export type Target = 'hour' | 'day' | 'month' | 'year';
export type Metric = 'power' | 'fee';

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
  ) {
    super(message);
    this.name = 'APIError';
  }
}
