export interface Colors {
  background: string;
  border: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  success: string;
  danger: string;
}

const light: Colors = {
  background: '#fdfdfd',
  border: '#e5e5e5',
  card: '#F8F8F8',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#c17aff',
  secondary: '#327a88',
  success: '#22c55e',
  danger: '#ef4444',
};

const dark: Colors = {
  // ponytail: dark 팔레트는 실기기 검증 기반 2차 조정값. 더 손볼 필요 있으면 값만 바꾸면 됨(구조 변경 불필요).
  background: '#121212',
  border: '#2c2c2e',
  card: '#1e1e1e',
  text: '#f2f2f2',
  textSecondary: '#a0a0a0',
  primary: '#a855f7',
  secondary: '#2dd4bf',
  success: '#34d399',
  danger: '#f87171',
};

export default {light, dark};
