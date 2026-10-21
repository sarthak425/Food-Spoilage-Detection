import React, { useEffect, useState } from 'react';
import { sensorApi } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { SensorReading } from '../types';
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
  FileSpreadsheet
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
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await sensorApi.getHistory();
      setHistory(data);
    } catch (e) {
      console.error('Failed to load sensor history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const currentTemp = latestReading?.temperatureC ?? 24.5;
  const currentHumidity = latestReading?.humidityPercent ?? 58.0;
  const currentGas = latestReading?.gasValue ?? 320.0;
  const currentWeight = latestReading?.weightGrams ?? 500.0;
  const currentLight = latestReading?.lightLux ?? 120.0;

  const readingsSource = historyReadings.length > 0 ? historyReadings : history;
  const chartData = readingsSource.map((r, i) => ({
    time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${i}`,
    temp: r.temperatureC,
    humidity: r.humidityPercent,
    gas: r.gasValue,
    weight: r.weightGrams,
  }));

  const esp32CurlSnippet = `// ESP32 Arduino HTTP Ingestion Example
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void postTelemetry(float temp, float hum, int gas, float weight) {
  HTTPClient http;
  http.begin("http://YOUR_SERVER_IP:8080/api/sensors/readings");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", "esp32-alpha-secret-key-2026");

  StaticJsonDocument<256> doc;
  doc["deviceId"] = "ESP32_STATION_ALPHA";
  doc["foodSampleId"] = 1;
  doc["source"] = "REAL_ESP32";
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
                RAW ADC & SI CONVERSION
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

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-blue-400/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">DHT22 MOISTURE</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {currentHumidity.toFixed(1)} <span className="text-sm font-normal text-blue-400">%</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">Precision: ±2% RH</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-spoil-teal/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">MQ135 VOLATILES</span>
            <Wind className="w-4 h-4 text-spoil-teal" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {Math.round(currentGas)} <span className="text-sm font-normal text-spoil-teal">ADC</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">Chemiresistor (SnO2)</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-purple-400/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">HX711 LOAD CELL</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {currentWeight.toFixed(1)} <span className="text-sm font-normal text-purple-400">g</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">24-Bit ADC (Strain Gauge)</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-navy-800 hover:border-amber-400/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">OPTICAL LDR</span>
            <Sun className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {Math.round(currentLight)} <span className="text-sm font-normal text-amber-300">Lux</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">Photoresistor CdS</div>
        </div>
      </div>

      {/* High-Resolution Chart */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-navy-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-emerald">SPECTRAL STREAM</span>
            <h3 className="font-bold text-white text-lg">Continuous Physical Telemetry Waveform</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Displaying last {chartData.length} records
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#151f38" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#1e293b', borderRadius: '16px', color: '#fff', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: 12, paddingTop: 12 }} />
              <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f97316" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="gas" name="Gas Volatiles (ADC)" stroke="#14b8a6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ingestion Table & ESP32 Code Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry Log (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-navy-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-spoil-cyan" />
              <h3 className="font-bold text-white text-base">Ingestion Buffer Log</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-spoil-emerald/10 text-spoil-emerald border border-spoil-emerald/30">
              BUFFER: 100 FRAMES
            </span>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-navy-950/90 text-slate-400 uppercase text-[10px] border-b border-navy-800 sticky top-0">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Temp</th>
                  <th className="p-3">Humidity</th>
                  <th className="p-3">Gas ADC</th>
                  <th className="p-3">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900">
                {readingsSource.slice(0, 15).map((r, i) => (
                  <tr key={i} className="hover:bg-navy-900/40 transition">
                    <td className="p-3 text-slate-400">
                      {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : `#${i}`}
                    </td>
                    <td className="p-3 text-spoil-cyan font-semibold">{r.deviceId}</td>
                    <td className="p-3 text-orange-400">{r.temperatureC?.toFixed(1)}°C</td>
                    <td className="p-3 text-sky-400">{r.humidityPercent?.toFixed(1)}%</td>
                    <td className="p-3 text-teal-400">{Math.round(r.gasValue)}</td>
                    <td className="p-3 text-purple-400">{r.weightGrams?.toFixed(1)}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESP32 Arduino Integration Guide (5 cols) */}
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
              When ready to deploy physical ESP32 microcontrollers, connect DHT22 (Pin D4) and MQ135 (Pin A0), then POST telemetry to the REST endpoint below:
            </p>

            <pre className="p-3.5 rounded-2xl bg-navy-950 border border-navy-900 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {esp32CurlSnippet}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Auth: X-Device-Key Header</span>
            <span className="text-spoil-emerald">Zero-rebuild plug & play</span>
          </div>
        </div>
      </div>
    </div>
  );
};
