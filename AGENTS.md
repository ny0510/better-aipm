# AGENTS.md - Better AIPM Project Guide

**Generated:** 2026-02-17  
**Project:** Dawon Power Manager AI - Unofficial React Native Client  
**Stack:** React Native 0.79 + Expo 53 + TypeScript 5.8 + Expo Router

---

## OVERVIEW

React Native mobile app (Android/iOS/Web) for monitoring Dawon AI smart plugs. Uses Expo managed workflow with file-based routing (Expo Router). Korean language UI with API backend integration.

---

## COMMANDS

### Development

```bash
npm start          # Start Expo dev server with dev client
npm run android    # Build and run on Android emulator/device
npm run ios        # Build and run on iOS simulator/device
npm run web        # Start web development server
```

### Code Quality

```bash
npx prettier --write .              # Format all files
npx prettier --check .              # Check formatting
npx tsc --noEmit                    # Type check without emitting
```

### Testing

**NO TEST INFRASTRUCTURE CONFIGURED.** This project has no test setup (no Jest, Vitest, or testing libraries).

---

## PROJECT STRUCTURE

```
better-aipm/
├── src/                          # All source code (@ alias in tsconfig)
│   ├── app/                      # Expo Router file-based routes
│   │   ├── _layout.tsx          # Root layout (fonts, SafeAreaProvider)
│   │   ├── index.tsx            # Home screen (main dashboard)
│   │   ├── setting.tsx          # Settings screen
│   │   └── onboarding/          # Onboarding flow (server + device setup)
│   ├── api/                     # API integration layer
│   │   ├── index.ts             # DawonAPIClient class + DeviceManager
│   │   ├── config.ts            # APIStorage (AsyncStorage wrapper)
│   │   └── types.ts             # Type definitions + APIError class
│   ├── components/              # Reusable UI components
│   │   ├── Card.tsx             # Base card wrapper
│   │   ├── PowerCard.tsx        # Real-time power display
│   │   ├── InfoCard.tsx         # Metric card with trend indicator
│   │   ├── ChartCard.tsx        # Chart visualization wrapper
│   │   └── Header.tsx           # Screen header component
│   ├── styles/                  # Styling and theming
│   │   ├── global.ts            # Global StyleSheet (gs export)
│   │   └── theme/colors.ts      # Color constants
│   ├── assets/                  # Static assets + mock data
│   │   ├── fonts/               # SUIT font family (Heavy to Thin)
│   │   └── mockupData.ts        # Development mock data
│   └── utils/                   # Helper utilities
│       └── storage.ts           # Storage utilities (currently empty)
├── android/                     # Native Android build files
├── ios/                         # Native iOS build files
├── package.json                 # Dependencies + npm scripts
├── tsconfig.json               # TypeScript config (extends expo/tsconfig.base)
├── .prettierrc.js              # Code formatting rules
├── babel.config.js             # Babel transpiler config
├── metro.config.js             # Metro bundler config
└── app.json                    # Expo app manifest
```

---

## CODE STYLE CONVENTIONS

### 1. IMPORTS

**ALWAYS use @ alias for src/ imports. NEVER use relative paths (../).**

**Pattern:** External libraries → blank line → Internal (@/) imports  
**Sorting:** Alphabetical within groups (enforced by Prettier plugin)

```typescript
// ✅ CORRECT
import {Link, router} from 'expo-router';
import {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';

import {APIStorage, DawonAPIClient, DeviceManager} from '@/api';
import {ChartDataPoint, Device, Metric} from '@/api/types';
import Card from '@/components/Card';
import Header from '@/components/Header';
import gs from '@/styles/global';
import colors from '@/styles/theme/colors';

// ❌ WRONG - relative paths
import Card from '../components/Card';
import colors from '../styles/theme/colors';
```

### 2. PRETTIER CONFIG

```javascript
// .prettierrc.js
{
  arrowParens: 'avoid',           // x => x (not (x) => x)
  bracketSameLine: true,          // <View> (not <View\n  >)
  bracketSpacing: false,          // {foo} (not { foo })
  singleQuote: true,              // 'string' (not "string")
  trailingComma: 'all',           // [1, 2,] (trailing comma everywhere)
  printWidth: 300,                // VERY LONG LINES ALLOWED (not 80)
  importOrderSeparation: true,    // Blank line between import groups
}
```

**Key:** printWidth is 300 characters - do NOT break lines prematurely.

### 3. TYPESCRIPT PATTERNS

#### Interface Naming

```typescript
// Component props: ComponentNameProps (NOT just Props)
interface CardProps {
  title?: string;
  children: React.ReactNode;
}

interface InfoCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof MaterialIcons.glyphMap;
}
```

#### Type Definitions

```typescript
// String literal unions for enums
export type Target = 'hour' | 'day' | 'month' | 'year';
export type Metric = 'power' | 'fee';

// Custom Error classes
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
```

#### Generic Type Parameters

```typescript
// Explicit return types, especially for async functions
private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // ...
}

async getChartData(deviceId: string, target: Target, metric: Metric): Promise<ChartResponse> {
  return this.makeRequest<ChartResponse>(`/devices/${encodeURIComponent(deviceId)}/chart?${params}`);
}
```

### 4. NAMING CONVENTIONS

| Pattern                 | Convention          | Example                                               |
| ----------------------- | ------------------- | ----------------------------------------------------- |
| **Components**          | PascalCase          | `Card`, `PowerCard`, `InfoCard`                       |
| **Variables/Functions** | camelCase           | `selectedDevice`, `currentData`                       |
| **Constants**           | UPPER_SNAKE_CASE    | `API_CONFIG`, `BASE_URL_KEY`, `TIMEOUT`               |
| **Event Handlers**      | `handle` prefix     | `handleDeviceSelect`, `handleUrlValidation`           |
| **Data Loaders**        | `load` prefix       | `loadInitialData`, `loadCurrentData`, `loadChartData` |
| **Getters/Setters**     | `get`/`set` prefix  | `getSelectedDevice`, `setBaseURL`                     |
| **Type Interfaces**     | Suffix with `Props` | `CardProps`, `InfoCardProps`, `DeviceItemProps`       |
| **StyleSheet Variable** | Single letter `s`   | `const s = StyleSheet.create({...})`                  |

```typescript
// ✅ CORRECT naming examples
const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
const loadInitialData = async () => {
  /* ... */
};
const handleDeviceSelect = (device: Device) => {
  /* ... */
};

export const API_CONFIG = {
  TIMEOUT: 10000,
  BASE_URL_KEY: '@dawon_api_base_url',
};

interface CardProps {
  title?: string;
  children: React.ReactNode;
}
```

### 5. ERROR HANDLING

**Pattern:** try-catch with `instanceof` checks, custom APIError class

```typescript
// ✅ CORRECT - API layer error handling
private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {...options});
    if (!response.ok) {
      throw new APIError(`API Error: ${response.status} ${response.statusText}`, response.status, response);
    }
    return response.json();
  } catch (error) {
    // Re-throw known errors
    if (error instanceof APIError) {
      throw error;
    }
    // Wrap Error instances
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout');
      }
      throw new APIError(`Network error: ${error.message}`);
    }
    // Catch-all for unknown errors
    throw new APIError('Unknown error occurred');
  }
}

// ✅ CORRECT - UI layer error handling
const loadCurrentData = async () => {
  try {
    const data = await apiClient.getCurrentData(deviceId);
    setCurrentData({...data});
  } catch (error) {
    console.error('Failed to load current data:', error);
    Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
  }
};

// ✅ CORRECT - Storage with null fallback
async getBaseURL(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(API_CONFIG.BASE_URL_KEY);
  } catch (error) {
    console.warn('Failed to get base URL from AsyncStorage:', error);
    return null; // Safe fallback
  }
}
```

**Logging:**

- `console.error()` for unexpected errors
- `console.log()` for debugging during development
- User-facing messages in Korean via `Alert.alert()`

### 6. COMPONENT PATTERNS

#### Functional Component Template

```typescript
import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';

import colors from '@/styles/theme/colors';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({title, children, style}: CardProps) {
  return (
    <View style={[s.container, style]}>
      {title && <Text style={s.title}>{title}</Text>}
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 26,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 18,
    fontFamily: 'SuitBold',
    color: colors.text,
  },
});
```

**Key Points:**

- Destructure props in function signature
- StyleSheet created AFTER component function (as `s`)
- Conditional rendering with `&&` operator
- Style arrays for merging: `style={[s.base, customStyle]}`
- Default export for components

#### State Management

```typescript
// Group related state into objects
const [currentData, setCurrentData] = useState({
  currentWh: 0,
  monthlyKwh: 0,
  temperature: 0,
  powered: false,
});

// Typed state for complex types
const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

// useEffect with explicit dependencies
useEffect(() => {
  loadInitialData();
  const interval = setInterval(loadCurrentData, 10_000);
  return () => clearInterval(interval);
}, []); // Empty array = run once on mount

useEffect(() => {
  if (selectedDevice) {
    loadChartData();
  }
}, [chartType, dataType, selectedDevice]); // Re-run when these change
```

### 7. API CLIENT PATTERN

**Class-based client with singleton export:**

```typescript
// api/index.ts
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

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Shared request logic
  }

  /**
   * Get chart data for a specific device
   * @param deviceId - The device ID
   * @param target - Chart data unit (hour, day, month, year)
   * @param metric - Chart data metric (power, fee)
   */
  async getChartData(deviceId: string, target: Target, metric: Metric): Promise<ChartResponse> {
    const params = new URLSearchParams({target, metric});
    return this.makeRequest<ChartResponse>(`/devices/${encodeURIComponent(deviceId)}/chart?${params}`);
  }
}

// Singleton export
export const dawonAPI = new DawonAPIClient();

// Class export for custom instances
export {DawonAPIClient};
```

### 8. JSDoc COMMENTS

Use JSDoc for public methods, especially API methods:

```typescript
/**
 * Get the currently selected device information
 */
async getSelectedDevice(): Promise<Device | null> {
  // ...
}

/**
 * Update the base URL and save to AsyncStorage
 */
async setBaseURL(url: string): Promise<void> {
  // ...
}
```

**NO TODO/FIXME comments found in codebase.** Use clear JSDoc instead.

### 9. NUMERIC FORMATTING

```typescript
// Parse API strings (always fallback to 0)
currentWh: parseFloat(data.current_watt) || 0,
temperature: parseFloat(data.temperature) || 0,

// Display formatting
{currentWh.toLocaleString()}        // 1,234
{temperature.toFixed(1)}            // 23.5
{(value / 1000).toFixed(2)} kWh    // 1.23 kWh
```

### 10. STYLING PATTERNS

```typescript
// ✅ Global styles (imported as gs)
import gs from '@/styles/global';
<ScrollView style={gs.scrollView}>

// ✅ Theme colors (imported from colors)
import colors from '@/styles/theme/colors';
const s = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
});

// ✅ Merge styles with arrays
<View style={[s.container, customStyle, {marginTop: 10}]}>
```

**Available Global Styles:**

- `gs.container` - Full screen container with background color
- `gs.scrollView` - ScrollView with consistent padding

**Color Tokens:** `colors.background`, `colors.card`, `colors.border`, `colors.text`, `colors.primary`, `colors.secondary`, `colors.success`, `colors.danger`

---

## ROUTING (Expo Router)

File-based routing - file location = URL path:

| File                               | Route                       |
| ---------------------------------- | --------------------------- |
| `app/index.tsx`                    | `/` (Home screen)           |
| `app/setting.tsx`                  | `/setting`                  |
| `app/onboarding/index.tsx`         | `/onboarding`               |
| `app/onboarding/select-device.tsx` | `/onboarding/select-device` |

**Navigation:**

```typescript
import {router} from 'expo-router';

// Push to route
router.push('/setting');
router.push(`/onboarding/select-device?serverUrl=${encodeURIComponent(url)}`);

// Replace (no back button)
router.replace('/onboarding');
```

**Layouts:**

- `_layout.tsx` files define layout wrappers for routes
- Root layout (`app/_layout.tsx`) loads fonts, sets up SafeAreaProvider

---

## COMMON TASKS

### Add a New Screen

1. Create file in `src/app/your-screen.tsx`
2. Export default functional component
3. Navigate with `router.push('/your-screen')`

### Add a New Component

1. Create file in `src/components/YourComponent.tsx`
2. Define `YourComponentProps` interface
3. Export default function
4. StyleSheet as `const s` after component

### Add API Endpoint

1. Add types to `src/api/types.ts`
2. Add method to `DawonAPIClient` in `src/api/index.ts`
3. Use JSDoc comments for parameters
4. Return typed Promise

### Style Changes

- Global styles: Edit `src/styles/global.ts`
- Theme colors: Edit `src/styles/theme/colors.ts`
- Component styles: Use `StyleSheet.create()` in component file

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ Relative imports instead of @ alias

```typescript
import Card from '../components/Card';  // WRONG
import Card from '@/components/Card';   // CORRECT
```

❌ Generic "Props" interface name

```typescript
interface Props {
  /* ... */
} // WRONG
interface CardProps {
  /* ... */
} // CORRECT
```

❌ Swallowing errors silently

```typescript
catch (error) {
  // Silent failure - WRONG
}
```

❌ Using `any` type

```typescript
const data: any = await fetch();        // WRONG
const data: ResponseType = await fetch(); // CORRECT
```

❌ StyleSheet variable named anything other than `s`

```typescript
const styles = StyleSheet.create({}); // WRONG
const s = StyleSheet.create({}); // CORRECT
```

---

## NOTES

- **Korean UI:** User-facing strings are in Korean (Alert messages, labels)
- **Bun Package Manager:** Project uses Bun (bun.lock), but npm commands work
- **No ESLint:** Only Prettier is configured for code quality
- **No Tests:** No testing infrastructure - manual testing only
- **Expo Managed:** Don't eject - stay in managed workflow
- **Fonts:** SUIT font family loaded in root layout (9 weights available)
- **API Backend:** Requires separate backend server (see README)
