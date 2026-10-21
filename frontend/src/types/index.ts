export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

export interface GasReading {
  sensor: string;
  value: number;
  unit: string;
  calibrated: boolean;
}

export interface SensorReading {
  id?: number;
  deviceId: string;
  foodSampleId?: number;
  source: 'SIMULATED' | 'REAL_ESP32';
  timestamp: string;
  temperatureC: number;
  humidityPercent: number;
  gasSensor?: string;
  gasValue: number;
  gasUnit?: string;
  gasCalibrated?: boolean;
  weightGrams?: number;
  lightLux?: number;
}

export interface FoodSample {
  id: number;
  sampleName: string;
  foodCategory: 'APPLE' | 'BANANA' | 'TOMATO' | 'MANGO' | 'OTHER' | string;
  batchNumber: string;
  storageCondition: 'AMBIENT' | 'REFRIGERATED' | 'CONTROLLED' | string;
  initialWeightGrams?: number;
  notes?: string;
  deviceId?: string;
  status: string;
  createdAt: string;
  latestReading?: SensorReading;
}

export interface Device {
  id: number;
  deviceId: string;
  deviceName: string;
  apiKey?: string;
  deviceType: 'VIRTUAL' | 'ESP32_REAL';
  status: 'ONLINE' | 'OFFLINE';
  lastSeenAt?: string;
  calibrationMetadata?: string;
}

export interface SimulatorStatus {
  running: boolean;
  intervalMs: number;
  scenario: 'NORMAL' | 'WARMING' | 'HIGH_HUMIDITY' | 'SPOILAGE_PRONE' | string;
  foodSampleId: number;
  deviceId: string;
  readingsGenerated: number;
  latestReading?: SensorReading;
}

export interface Alert {
  id: number;
  foodSampleId?: number;
  deviceId?: string;
  alertType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface ActuatorStatus {
  coolingFan: 'ON' | 'OFF';
  ventilationFan: 'ON' | 'OFF';
  buzzer: 'ON' | 'OFF';
  ledIndicator: 'GREEN' | 'YELLOW' | 'RED';
  servoSorter: 'IDLE' | 'SORTING_FRESH' | 'SORTING_SPOILED';
  lastUpdated: string;
}

export interface DashboardSummary {
  totalMonitoredSamples: number;
  freshCount: number;
  earlySpoilageCount: number;
  moderateSpoilageCount: number;
  severeSpoilageCount: number;
  currentRiskScore: number;
  estimatedShelfLifeDays: number;
  activeAlertsCount: number;
  sensorsConnected: boolean;
  simulatorRunning: boolean;
  latestReading?: SensorReading;
  recentAlerts: Alert[];
}
