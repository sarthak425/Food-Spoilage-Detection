import axios from 'axios';
import {
  AuthResponse,
  DashboardSummary,
  Device,
  FoodSample,
  SensorReading,
  SimulatorStatus,
  Alert,
  ActuatorStatus,
  User
} from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('spoil_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/login', { username, password });
    return res.data;
  },
  register: async (username: string, email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/register', { username, email, password, fullName });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await client.get<User>('/auth/me');
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await client.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },
};

export const sensorApi = {
  getLatest: async (sampleId?: number): Promise<SensorReading | null> => {
    const url = sampleId ? `/sensors/latest/${sampleId}` : '/sensors/latest';
    const res = await client.get<SensorReading>(url);
    return res.status === 204 ? null : res.data;
  },
  getHistory: async (sampleId?: number, deviceId?: string, source?: string): Promise<SensorReading[]> => {
    const params: Record<string, any> = {};
    if (sampleId) params.sampleId = sampleId;
    if (deviceId) params.deviceId = deviceId;
    if (source) params.source = source;
    const res = await client.get<SensorReading[]>('/sensors/history', { params });
    return res.data;
  },
  ingestReading: async (reading: any): Promise<SensorReading> => {
    const res = await client.post<SensorReading>('/sensors/readings', reading);
    return res.data;
  },
};

export const simulatorApi = {
  getStatus: async (): Promise<SimulatorStatus> => {
    const res = await client.get<SimulatorStatus>('/simulator/status');
    return res.data;
  },
  start: async (params?: { intervalMs?: number; scenario?: string; foodSampleId?: number }): Promise<SimulatorStatus> => {
    const res = await client.post<SimulatorStatus>('/simulator/start', params || {});
    return res.data;
  },
  stop: async (): Promise<SimulatorStatus> => {
    const res = await client.post<SimulatorStatus>('/simulator/stop');
    return res.data;
  },
  setScenario: async (scenario: string): Promise<SimulatorStatus> => {
    const res = await client.post<SimulatorStatus>('/simulator/scenario', { scenario });
    return res.data;
  },
};

export const foodSampleApi = {
  getAll: async (): Promise<FoodSample[]> => {
    const res = await client.get<FoodSample[]>('/food-samples');
    return res.data;
  },
  getById: async (id: number): Promise<FoodSample> => {
    const res = await client.get<FoodSample>(`/food-samples/${id}`);
    return res.data;
  },
  create: async (sample: Partial<FoodSample>): Promise<FoodSample> => {
    const res = await client.post<FoodSample>('/food-samples', sample);
    return res.data;
  },
};

export const deviceApi = {
  getAll: async (): Promise<Device[]> => {
    const res = await client.get<Device[]>('/devices');
    return res.data;
  },
  register: async (device: Partial<Device>): Promise<Device> => {
    const res = await client.post<Device>('/devices', device);
    return res.data;
  },
};

export const alertApi = {
  getAll: async (unacknowledgedOnly = false): Promise<Alert[]> => {
    const res = await client.get<Alert[]>(`/alerts?unacknowledgedOnly=${unacknowledgedOnly}`);
    return res.data;
  },
  acknowledge: async (id: number): Promise<Alert> => {
    const res = await client.put<Alert>(`/alerts/${id}/acknowledge`);
    return res.data;
  },
};

export const actuatorApi = {
  getStatus: async (): Promise<ActuatorStatus> => {
    const res = await client.get<ActuatorStatus>('/actuators/state');
    return res.data;
  },
  trigger: async (actuatorType: string, targetState: string, reason?: string): Promise<ActuatorStatus> => {
    const res = await client.post<ActuatorStatus>('/actuators/trigger', { actuatorType, targetState, reason });
    return res.data;
  },
};

export const aiApi = {
  getModelsStatus: async (): Promise<any> => {
    const res = await client.get('/ai/models/status');
    return res.data;
  },
  analyzeImage: async (file: File, foodCategory = 'APPLE', sampleId?: number): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('foodCategory', foodCategory);
    if (sampleId) formData.append('sampleId', sampleId.toString());
    const res = await client.post('/ai/predict/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  predictSensor: async (payload: any): Promise<any> => {
    const res = await client.post('/ai/predict/sensor', payload);
    return res.data;
  },
  predictFusion: async (payload: any): Promise<any> => {
    const res = await client.post('/ai/predict/fusion', payload);
    return res.data;
  },
  predictShelfLife: async (foodCategory = 'APPLE', riskScore = 20.0): Promise<any> => {
    const res = await client.post(`/ai/predict/shelf-life?foodCategory=${encodeURIComponent(foodCategory)}&riskScore=${riskScore}`);
    return res.data;
  },
};

export default client;
