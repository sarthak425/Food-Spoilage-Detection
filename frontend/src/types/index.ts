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
  source: 'SIMULATED' | 'REAL' | 'ESP32_REAL' | 'REAL_ESP32' | string;
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
  imageUrl?: string;
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

export interface DetectedItem {
  label: string;
  confidence: number;
  box: number[]; // [x1, y1, x2, y2]
  segmentation_type?: string;
}

export interface SpoilageFeatures {
  surface_browning_percent: number;
  discoloration_score: number;
  texture_variance?: number;
  texture_softening_detected: boolean;
}

export interface ImagePredictionResult {
  success: boolean;
  is_trained_model: boolean;
  model_name: string;
  model_version: string;
  status: string;
  foodCategory: string;
  stored_image_url?: string;
  image_dimensions?: { width: number; height: number };
  detected_items: DetectedItem[];
  spoilage_features: SpoilageFeatures;
  spoilage_stage: 'FRESH' | 'EARLY_SPOILAGE' | 'MODERATE_SPOILAGE' | 'SEVERE_SPOILAGE' | string;
  confidence: number;
  methodology?: string;
  warning?: string;
}

export interface SensorPredictionResult {
  success: boolean;
  is_trained_model: boolean;
  model_name: string;
  model_version: string;
  status: string;
  foodCategory: string;
  spoilage_stage: 'FRESH' | 'EARLY_SPOILAGE' | 'MODERATE_SPOILAGE' | 'SEVERE_SPOILAGE' | string;
  risk_score: number;
  confidence: number;
  probabilities?: Record<string, number>;
  features_extracted?: Record<string, any>;
}

export interface FusionPredictionResult {
  success: boolean;
  is_trained_model: boolean;
  model_name: string;
  model_version: string;
  status: string;
  foodCategory: string;
  overall_stage: 'FRESH' | 'EARLY_SPOILAGE' | 'MODERATE_SPOILAGE' | 'SEVERE_SPOILAGE' | string;
  risk_score: number;
  confidence: number;
  attention_weights: {
    visual_branch: number;
    sensor_branch: number;
  };
  modalities_fused: string[];
  estimated_shelf_life_hours: number;
  shelf_life_details?: {
    estimated_remaining_days: number;
    estimated_remaining_hours: number;
    storage_temperature_c: number;
    kinetic_model: string;
    demonstration_notice: string;
  };
}

export interface ModelStatusItem {
  name: string;
  version?: string;
  type?: string;
  status: string;
  trained?: boolean;
  accuracy?: number;
  architecture?: string;
  notes?: string;
}
