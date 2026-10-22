import React, { useEffect, useState } from 'react';
import { sensorApi, deviceApi } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { SensorReading, Device } from '../types';
import {
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Scale,
  Sun,
  RefreshCw,
  Cpu,
  Code2,
  CheckCircle,
  Copy,
  Check,
  Radio,
  FileSpreadsheet,
  Filter,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const LiveSensors: React.FC = () => {
  const { latestReading, historyReadings } = useWebSocket();
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const devParam = selectedDevice !== 'ALL' ? selectedDevice : undefined;
      const srcParam = selectedSource !== 'ALL' ? selectedSource : undefined;
      const data = await sensorApi.getHistory(undefined, devParam, srcParam);
      setHistory(data);
    } catch (e) {
      console.error('Failed to load sensor history', e);
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const list = await deviceApi.getAll();
      setDevices(list);
    } catch (e) {
      console.warn('Failed to load devices list', e);
    }
  };

  useEffect(() => {
    loadDevices();
    fetchHistory();
  }, [selectedDevice, selectedSource]);

  const currentTemp = latestReading?.temperatureC ?? 24.5;
  const currentHumidity = latestReading?.humidityPercent ?? 58.0;
  const currentGas = latestReading?.gasValue ?? 320.0;
  const currentWeight = latestReading?.weightGrams ?? 500.0;
  const currentLight = latestReading?.lightLux ?? 120.0;

  // Combine WebSocket live buffer with DB history
  const readingsSource = (historyReadings.length > 0 && selectedDevice === 'ALL' && selectedSource === 'ALL')
    ? historyReadings
    : history;

  const filteredReadings = readingsSource.filter((r) => {
    if (selectedDevice !== 'ALL' && r.deviceId !== selectedDevice) return false;
    if (selectedSource !== 'ALL') {
      const isReal = r.source === 'REAL' || r.source === 'ESP32_REAL' || r.source === 'REAL_ESP32';
      if (selectedSource === 'REAL' && !isReal) return false;
      if (selectedSource === 'SIMULATED' && isReal) return false;
    }
    return true;
  });

  const chartData = filteredReadings.slice(0, 50).reverse().map((r, i) => ({
    time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${i}`,
    temp: r.temperatureC,
    humidity: r.humidityPercent,
    gas: r.gasValue,
    weight: r.weightGrams,
  }));

  const esp32CurlSnippet = `// ESP32 Arduino C++ Authenticated Ingestion
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void postTelemetry(float temp, float hum, int gas, float weight) {
  HTTPClient http;
  http.begin("http://YOUR_BACKEND_IP:8080/api/sensors/readings");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Id", "ESP32_STATION_ALPHA");
  http.addHeader("X-Device-Key", "esp32_secret_alpha_key");

  StaticJsonDocument<256> doc;
  doc["deviceId"] = "ESP32_STATION_ALPHA";
  doc["foodSampleId"] = 1;
  doc["source"] = "REAL";
  doc["temperatureC"] = temp;
  doc["humidityPercent"] = hum;
  doc["gasValue"] = gas;
  doc["weightGrams"] = weight;

  String json;
  serializeJson(doc, json);
  int httpCode = http.POST(json);
  http.end();
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(esp32CurlSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isRealSource = (source?: string) => {
    return source === 'REAL' || source === 'ESP32_REAL' || source === 'REAL_ESP32';
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-spoil-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-spoil-cyan/10 text-spoil-cyan border border-spoil-cyan/30 shadow-glow-cyan">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                HIGH RESOLUTION MULTI-CHANNEL STREAM
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-navy-800 text-slate-300 border border-navy-700">
                AUTHENTICATED ESP32 & VIRTUAL TELEMETRY
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Live Sensor <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-cyan via-spoil-emerald to-spoil-violet">Telemetry Matrix</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time calibration data from DHT22 (temperature/humidity), MQ135 (volatile amines/CO2/ammonia), HX711 24-bit strain-gauge load cell, and optical photoresistor.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-slate-200 text-xs font-mono font-semibold transition hover:border-spoil-cyan/40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-spoil-cyan' : ''}`} />
            <span>SYNC BUFFER</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Distinctly separates Real ESP32 vs Simulated Readings */}
      <div className="p-4 rounded-2xl glass-card border border-navy-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-spoil-cyan" />
          <span className="text-xs font-mono font-bold text-slate-300">TELEMETRY FILTERS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-200 focus:border-spoil-cyan/50 outline-none"
            >
              <option value="ALL">All Sources (Real + Simulated)</option>
              <option value="REAL">Hardware ESP32 Only (Real)</option>
              <option value="SIMULATED">Virtual Simulator Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Device Node:</span>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-200 focus:border-spoil-cyan/50 outline-none"
            >
              <option value="ALL">All Device Nodes</option>
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.deviceId} ({d.deviceType})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 Channel Dials */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-orange-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">DHT22 THERMAL</span>
            <Thermometer className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {currentTemp.toFixed(1)} <span className="text-sm font-normal text-orange-400">°C</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">Precision: ±0.5°C</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">DHT22 HUMIDITY</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {currentHumidity.toFixed(1)} <span className="text-sm font-normal text-sky-400">%</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">Capacitive Sensing</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-spoil-teal/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">MQ135 VOLATILES</span>
            <Wind className="w-4 h-4 text-spoil-teal" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {Math.round(currentGas)} <span className="text-sm font-normal text-spoil-teal">ADC</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">Ethanol / NH3 / VOC</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">HX711 LOAD CELL</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {currentWeight.toFixed(1)} <span className="text-sm font-normal text-purple-400">g</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">24-bit ADC Tare</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-yellow-500/40 transition col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">OPTICAL LUX</span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {Math.round(currentLight)} <span className="text-sm font-normal text-yellow-400">lx</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">Photoresistor Ambient</div>
        </div>
      </div>

      {/* Real-Time Line Charts */}
      <div className="p-6 rounded-3xl glass-card border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-spoil-cyan" />
            <h3 className="font-bold text-white text-base">Multi-Channel Telemetry Wave Stream</h3>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-navy-900 border border-navy-800 text-slate-300">
            {chartData.length} Data Points Plotted
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#fb923c" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="gas" name="Gas Volatiles (ADC)" stroke="#14b8a6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ingestion Table & ESP32 Code Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry Log */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-navy-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-spoil-cyan" />
              <h3 className="font-bold text-white text-base">Ingestion Buffer Log</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-spoil-emerald/10 text-spoil-emerald border border-spoil-emerald/30">
              BUFFER: {filteredReadings.length} FRAMES
            </span>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-navy-950/90 text-slate-400 uppercase text-[10px] border-b border-navy-800 sticky top-0">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Device ID</th>
                  <th className="p-3">Temp</th>
                  <th className="p-3">Humidity</th>
                  <th className="p-3">Gas ADC</th>
                  <th className="p-3">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900">
                {filteredReadings.slice(0, 20).map((r, i) => {
                  const real = isRealSource(r.source);
                  return (
                    <tr key={i} className="hover:bg-navy-900/40 transition">
                      <td className="p-3 text-slate-400">
                        {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : `#${i}`}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          real
                            ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {real ? 'ESP32 REAL' : 'SIMULATED'}
                        </span>
                      </td>
                      <td className="p-3 text-spoil-cyan font-semibold">{r.deviceId}</td>
                      <td className="p-3 text-orange-400">{r.temperatureC?.toFixed(1)}°C</td>
                      <td className="p-3 text-sky-400">{r.humidityPercent?.toFixed(1)}%</td>
                      <td className="p-3 text-teal-400">{Math.round(r.gasValue)}</td>
                      <td className="p-3 text-purple-400">{r.weightGrams?.toFixed(1)}g</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESP32 Arduino Integration Guide */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-spoil-emerald" />
                <h3 className="font-bold text-white text-base">ESP32 Hardware Ingestion</h3>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-mono text-slate-300 border border-navy-700 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-spoil-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              When ready to deploy physical ESP32 microcontrollers, connect DHT22 (Pin D4) and MQ135 (Pin A0), then POST authenticated telemetry to the REST endpoint below:
            </p>

            <pre className="p-3.5 rounded-2xl bg-navy-950 border border-navy-900 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {esp32CurlSnippet}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Auth: X-Device-Id + X-Device-Key</span>
            <span className="text-spoil-emerald font-semibold">Real Hardware Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
