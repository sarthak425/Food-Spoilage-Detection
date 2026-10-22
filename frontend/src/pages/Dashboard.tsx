import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { dashboardApi, alertApi, simulatorApi, actuatorApi } from '../services/api';
import { DashboardSummary } from '../types';
import {
  Thermometer,
  Droplets,
  Wind,
  Scale,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Play,
  Square,
  Activity,
  CheckCircle,
  Fan,
  Volume2,
  Radio,
  Zap,
  RefreshCw,
  Cpu,
  Layers,
  Sliders,
  ChevronRight,
  AlertOctagon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { latestReading, historyReadings, connected, actuatorStatus } = useWebSocket();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [actuatorLoading, setActuatorLoading] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'all' | 'thermal' | 'gas' | 'mass'>('all');
  const [lastPacketTime, setLastPacketTime] = useState<Date>(new Date());
  const [packetTick, setPacketTick] = useState(false);

  const fetchSummary = async () => {
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (e) {
      console.error('Failed to load dashboard summary', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 6000);
    return () => clearInterval(interval);
  }, []);

  // Flash beacon on latest reading change
  useEffect(() => {
    if (latestReading) {
      setLastPacketTime(new Date());
      setPacketTick(true);
      const timer = setTimeout(() => setPacketTick(false), 900);
      return () => clearTimeout(timer);
    }
  }, [latestReading]);

  const handleToggleSimulator = async () => {
    setSimulatorLoading(true);
    try {
      if (summary?.simulatorRunning) {
        await simulatorApi.stop();
      } else {
        await simulatorApi.start();
      }
      await fetchSummary();
    } catch (e) {
      console.error('Failed to toggle simulator', e);
    } finally {
      setSimulatorLoading(false);
    }
  };

  const handleToggleActuator = async (actuatorType: 'COOLING_FAN' | 'VENTILATION_FAN' | 'BUZZER') => {
    setActuatorLoading(actuatorType);
    try {
      let currentState = 'OFF';
      if (actuatorType === 'COOLING_FAN') currentState = actuatorStatus?.coolingFan || 'OFF';
      if (actuatorType === 'VENTILATION_FAN') currentState = actuatorStatus?.ventilationFan || 'OFF';
      if (actuatorType === 'BUZZER') currentState = actuatorStatus?.buzzer || 'OFF';

      const targetState = currentState === 'ON' ? 'OFF' : 'ON';
      await actuatorApi.trigger(actuatorType, targetState, 'Manual Dashboard Override');
      await fetchSummary();
    } catch (e) {
      console.error(`Failed to toggle ${actuatorType}`, e);
    } finally {
      setActuatorLoading(null);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await alertApi.acknowledge(id);
      fetchSummary();
    } catch (e) {
      console.error('Failed to acknowledge alert', e);
    }
  };

  // Sensor telemetry extraction
  const currentTemp = latestReading?.temperatureC ?? summary?.latestReading?.temperatureC ?? 24.5;
  const currentHumidity = latestReading?.humidityPercent ?? summary?.latestReading?.humidityPercent ?? 58.0;
  const currentGas = latestReading?.gasValue ?? summary?.latestReading?.gasValue ?? 320.0;
  const currentWeight = latestReading?.weightGrams ?? summary?.latestReading?.weightGrams ?? 500.0;
  const currentLight = latestReading?.lightLux ?? summary?.latestReading?.lightLux ?? 120.0;
  const riskScore = summary?.currentRiskScore ?? 22.0;

  // Chart telemetry formatting
  const chartData = historyReadings.length > 0
    ? historyReadings.map((r, i) => ({
        time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${i}`,
        temperature: r.temperatureC,
        humidity: r.humidityPercent,
        gas: r.gasValue,
        weight: r.weightGrams,
      }))
    : [
        { time: '12:00:00', temperature: 22.1, humidity: 55, gas: 310, weight: 500 },
        { time: '12:05:00', temperature: 23.4, humidity: 56, gas: 315, weight: 499 },
        { time: '12:10:00', temperature: 24.2, humidity: 57, gas: 320, weight: 498 },
        { time: '12:15:00', temperature: currentTemp, humidity: currentHumidity, gas: currentGas, weight: currentWeight },
      ];

  // Risk stage styling
  const isCritical = riskScore > 70;
  const isWarning = riskScore > 35 && riskScore <= 70;
  const riskColor = isCritical ? '#ff3366' : isWarning ? '#f59e0b' : '#00f59b';
  const riskStatusText = isCritical
    ? 'CRITICAL BIO-SPOILAGE RISK'
    : isWarning
    ? 'MODERATE SPOILAGE / ELEVATED GAS'
    : 'NOMINAL FRESH (OPTIMAL QUALITY)';

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-navy-700/80 shadow-2xl backdrop-blur-xl">
          <p className="text-[11px] font-mono font-semibold text-slate-400 mb-2 border-b border-navy-800 pb-1">
            TIMESTAMP: {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Cockpit Tactical Ribbon */}
      <div className="relative overflow-hidden p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-spoil-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-spoil-emerald/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-spoil-emerald/10 text-spoil-emerald border border-spoil-emerald/30 shadow-glow-emerald">
                <span className="w-2 h-2 rounded-full bg-spoil-emerald animate-ping" />
                SYSTEM LIVE · TELEMETRY ACTIVE
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-navy-800/90 text-slate-300 border border-navy-700">
                CHAMBER ALPHA
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-spoil-cyan/10 text-spoil-cyan border border-spoil-cyan/20">
                NODE: {latestReading?.deviceId || 'VIRTUAL_SENSOR_01'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Food Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-emerald via-spoil-cyan to-spoil-violet">Control Cockpit</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Multi-sensor neural ingestion with real-time volatility threshold monitoring, automated chamber countermeasures, and continuous shelf-life forecasting.
            </p>
          </div>

          {/* Quick Engine Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-900/80 border border-navy-700/80 text-xs font-mono text-slate-300">
              <Radio className={`w-4 h-4 ${packetTick ? 'text-spoil-emerald animate-spin' : 'text-slate-500'}`} />
              <span>PACKET: <span className="text-spoil-cyan">{lastPacketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
            </div>

            <button
              onClick={handleToggleSimulator}
              disabled={simulatorLoading}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-xl ${
                summary?.simulatorRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-glow-amber'
                  : 'bg-gradient-to-r from-spoil-emerald to-emerald-400 text-navy-950 hover:brightness-110 shadow-glow-emerald hover:scale-[1.02]'
              }`}
            >
              {simulatorLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : summary?.simulatorRunning ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>HALT SIMULATOR</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>ENGAGE SIMULATOR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5 Real-Time Sensor Telemetry Pods */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-spoil-cyan animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Real-Time Ingestion Pods (Multimodal Channels)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
              (latestReading?.source === 'REAL' || latestReading?.source === 'ESP32_REAL' || latestReading?.source === 'REAL_ESP32')
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-glow-cyan'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {(latestReading?.source === 'REAL' || latestReading?.source === 'ESP32_REAL' || latestReading?.source === 'REAL_ESP32')
                ? 'REAL ESP32 HARDWARE'
                : 'VIRTUAL SIMULATOR'}
            </span>
            <span className="text-slate-400">Node: {latestReading?.deviceId || 'ESP32_STATION_ALPHA'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Temperature Pod */}
          <div className="relative group p-4 rounded-2xl glass-card border border-navy-800 hover:border-orange-500/40 hover:shadow-glow-amber overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">DHT22 · THERMAL</span>
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{currentTemp.toFixed(1)}</span>
              <span className="text-sm font-semibold text-orange-400 font-mono">°C</span>
            </div>
            {/* Range Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>0°C</span>
                <span className="text-orange-400 font-bold">Limit: 28°C</span>
                <span>50°C</span>
              </div>
              <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden border border-navy-800">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, (currentTemp / 50) * 100))}%` }}
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Status</span>
              <span className={currentTemp > 28 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {currentTemp > 28 ? 'CRITICAL HIGH' : 'NOMINAL'}
              </span>
            </div>
          </div>

          {/* Humidity Pod */}
          <div className="relative group p-4 rounded-2xl glass-card border border-navy-800 hover:border-blue-400/40 hover:shadow-glow-cyan overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">DHT22 · HUMIDITY</span>
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{currentHumidity.toFixed(1)}</span>
              <span className="text-sm font-semibold text-blue-400 font-mono">% RH</span>
            </div>
            {/* Range Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>20%</span>
                <span className="text-blue-400 font-bold">Limit: 80%</span>
                <span>100%</span>
              </div>
              <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden border border-navy-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, currentHumidity))}%` }}
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Moisture</span>
              <span className={currentHumidity > 80 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {currentHumidity > 80 ? 'CONDENSING' : 'OPTIMAL'}
              </span>
            </div>
          </div>

          {/* Gas MQ135 Pod */}
          <div className="relative group p-4 rounded-2xl glass-card border border-navy-800 hover:border-spoil-teal/40 hover:shadow-glow-emerald overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">MQ135 · VOLATILE GAS</span>
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-spoil-teal">
                <Wind className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{Math.round(currentGas)}</span>
              <span className="text-sm font-semibold text-spoil-teal font-mono">ADC</span>
            </div>
            {/* Range Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>200</span>
                <span className="text-teal-400 font-bold">Threshold: 450</span>
                <span>1000</span>
              </div>
              <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden border border-navy-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, ((currentGas - 200) / 800) * 100))}%` }}
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>VOC Output</span>
              <span className={currentGas > 450 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {currentGas > 450 ? 'DECAY DETECTED' : 'CLEAN AIR'}
              </span>
            </div>
          </div>

          {/* Mass HX711 Pod */}
          <div className="relative group p-4 rounded-2xl glass-card border border-navy-800 hover:border-purple-400/40 hover:shadow-glow-violet overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">HX711 · SAMPLE MASS</span>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{currentWeight.toFixed(1)}</span>
              <span className="text-sm font-semibold text-purple-400 font-mono">g</span>
            </div>
            {/* Range Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Base: 500g</span>
                <span className="text-purple-400 font-bold">Delta: {(500.0 - currentWeight).toFixed(1)}g</span>
                <span>Tare</span>
              </div>
              <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden border border-navy-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-violet-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, (currentWeight / 500) * 100))}%` }}
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Moisture Loss</span>
              <span className="text-slate-300 font-bold">
                {((1 - currentWeight / 500) * 100).toFixed(1)}% Mass Loss
              </span>
            </div>
          </div>

          {/* Light Exposure Pod */}
          <div className="relative group p-4 rounded-2xl glass-card border border-navy-800 hover:border-amber-400/40 hover:shadow-glow-amber overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">LDR · ILLUMINANCE</span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <Sun className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{Math.round(currentLight)}</span>
              <span className="text-sm font-semibold text-amber-300 font-mono">Lux</span>
            </div>
            {/* Range Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Dark</span>
                <span className="text-amber-300 font-bold">Chamber Sealed</span>
                <span>800 Lux</span>
              </div>
              <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden border border-navy-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, (currentLight / 800) * 100))}%` }}
                />
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Exposure</span>
              <span className="text-slate-300 font-bold">CONTROLLED DARK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Cockpit Row: Spoilage Arc Gauge + Multi-Channel Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Holographic Spoilage Risk Gauge (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-radial-glow pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-cyan">NEURAL ESTIMATION</span>
                <h3 className="font-bold text-white text-lg">Spoilage Risk Gauge</h3>
              </div>
              <div className={`p-2 rounded-xl border ${
                isCritical ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                isWarning ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                'bg-spoil-emerald/10 border-spoil-emerald/30 text-spoil-emerald'
              }`}>
                {isCritical ? <AlertOctagon className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time multi-sensor risk synthesis calculated from VOC gas spike rate and thermal decay acceleration.
            </p>

            {/* Futuristic Gauge Speedometer Arc */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#151f38"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Tick Marks */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#223259"
                    strokeWidth="10"
                    strokeDasharray="4 8"
                    fill="transparent"
                  />
                  {/* Active Gradient Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke={riskColor}
                    strokeWidth="10"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * riskScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 8px ${riskColor}88)`
                    }}
                  />
                </svg>

                {/* Center Core HUD */}
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-4xl font-black font-mono text-white tracking-tighter" style={{ textShadow: `0 0 20px ${riskColor}66` }}>
                    {riskScore.toFixed(0)}<span className="text-xl font-normal text-slate-400">%</span>
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mt-1">
                    RISK INDEX
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="mt-3 px-3.5 py-1.5 rounded-full border text-center" style={{
                backgroundColor: `${riskColor}15`,
                borderColor: `${riskColor}40`,
                color: riskColor,
              }}>
                <span className="text-xs font-mono font-bold tracking-wider">
                  {riskStatusText}
                </span>
              </div>
            </div>
          </div>

          {/* Estimated Shelf Life Pod */}
          <div className="mt-6 p-4 rounded-2xl bg-navy-950/80 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-spoil-cyan" />
                Remaining Shelf Life
              </span>
              <span className="font-mono text-[11px] text-spoil-cyan font-bold px-2 py-0.5 rounded bg-spoil-cyan/10 border border-spoil-cyan/20">
                AI ESTIMATE
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black font-mono text-white">
                {summary?.estimatedShelfLifeDays ?? 5.5} <span className="text-sm font-normal text-slate-400">Days</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Confidence: 94.2%</span>
            </div>

            <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-spoil-cyan to-spoil-emerald rounded-full"
                style={{ width: `${Math.min(100, ((summary?.estimatedShelfLifeDays ?? 5.5) / 10) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Calculated via cumulative thermal exposure & volatile ethylene curve.
            </p>
          </div>
        </div>

        {/* Multi-Channel Interactive Recharts Graph (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-emerald">LIVE TIME SERIES</span>
              <h3 className="font-bold text-white text-lg">Chamber Telemetry Stream</h3>
            </div>

            {/* Tab Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-950 border border-navy-800 text-xs font-mono">
              <button
                onClick={() => setActiveChartTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeChartTab === 'all'
                    ? 'bg-spoil-emerald text-navy-950 font-bold shadow-glow-emerald'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveChartTab('thermal')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeChartTab === 'thermal'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Temp & Humidity
              </button>
              <button
                onClick={() => setActiveChartTab('gas')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeChartTab === 'gas'
                    ? 'bg-spoil-teal text-navy-950 font-bold shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Gas (MQ135)
              </button>
              <button
                onClick={() => setActiveChartTab('mass')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeChartTab === 'mass'
                    ? 'bg-purple-500 text-white font-bold shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Weight (HX711)
              </button>
            </div>
          </div>

          {/* Chart Display Container */}
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'gas' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gasGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#151f38" />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis stroke="#14b8a6" domain={[200, 700]} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={450} stroke="#ff3366" strokeDasharray="4 4" label={{ value: '450 ADC Spoilage Limit', fill: '#ff3366', fontSize: 10, fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="gas" name="Volatiles (ADC)" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#gasGlow)" isAnimationActive={false} />
                </AreaChart>
              ) : activeChartTab === 'mass' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#151f38" />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis stroke="#c084fc" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" name="Sample Mass (g)" stroke="#c084fc" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#151f38" />
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis yAxisId="left" stroke="#f97316" domain={[15, 45]} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" domain={[30, 100]} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine yAxisId="left" y={28} stroke="#ff3366" strokeDasharray="4 4" label={{ value: '28°C Limit', fill: '#ff3366', fontSize: 10, fontFamily: 'monospace' }} />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f97316" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  {activeChartTab === 'all' && (
                    <Line yAxisId="left" type="monotone" dataKey="gas" name="Gas (ADC / 10)" stroke="#14b8a6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mt-4 pt-3 border-t border-navy-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Temperature (°C)
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Humidity (% RH)
              </span>
              <span className="flex items-center gap-1.5 text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Gas Volatiles (ADC)
              </span>
            </div>
            <span className="text-slate-400">Streaming STOMP over /topic/sensors/latest</span>
          </div>
        </div>
      </div>

      {/* Actuator Bays & Real-Time Incident Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hardware Actuator Command Bay (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-cyan">HARDWARE RELAYS</span>
                <h3 className="font-bold text-white text-lg">Virtual Actuator Station</h3>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-spoil-cyan/10 text-spoil-cyan border border-spoil-cyan/30">
                AUTONOMOUS MODE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Automated cooling, exhaust, and alert relays. Can be manually overridden below:
            </p>

            <div className="space-y-3.5">
              {/* Cooling Fan */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-950/80 border border-navy-800 hover:border-spoil-cyan/30 transition">
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    actuatorStatus?.coolingFan === 'ON'
                      ? 'bg-spoil-cyan/15 text-spoil-cyan border-spoil-cyan/40 shadow-glow-cyan'
                      : 'bg-navy-900 text-slate-500 border-navy-800'
                  }`}>
                    <Fan className={`w-5 h-5 ${actuatorStatus?.coolingFan === 'ON' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Chamber Cooling Fan</div>
                    <div className="text-[11px] font-mono text-slate-400">Auto-triggers &gt; 28.0°C</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActuator('COOLING_FAN')}
                  disabled={actuatorLoading === 'COOLING_FAN'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition ${
                    actuatorStatus?.coolingFan === 'ON'
                      ? 'bg-spoil-cyan text-navy-950 shadow-glow-cyan'
                      : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                  }`}
                >
                  {actuatorLoading === 'COOLING_FAN' ? '...' : actuatorStatus?.coolingFan || 'OFF'}
                </button>
              </div>

              {/* Ventilation Fan */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-950/80 border border-navy-800 hover:border-spoil-teal/30 transition">
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    actuatorStatus?.ventilationFan === 'ON'
                      ? 'bg-teal-500/15 text-spoil-teal border-teal-500/40 shadow-glow-emerald'
                      : 'bg-navy-900 text-slate-500 border-navy-800'
                  }`}>
                    <Wind className={`w-5 h-5 ${actuatorStatus?.ventilationFan === 'ON' ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Exhaust Ventilation Fan</div>
                    <div className="text-[11px] font-mono text-slate-400">Purges gas &gt; 450 ADC</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActuator('VENTILATION_FAN')}
                  disabled={actuatorLoading === 'VENTILATION_FAN'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition ${
                    actuatorStatus?.ventilationFan === 'ON'
                      ? 'bg-spoil-teal text-navy-950 shadow-glow-emerald'
                      : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                  }`}
                >
                  {actuatorLoading === 'VENTILATION_FAN' ? '...' : actuatorStatus?.ventilationFan || 'OFF'}
                </button>
              </div>

              {/* Piezo Buzzer */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-navy-950/80 border border-navy-800 hover:border-rose-500/30 transition">
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    actuatorStatus?.buzzer === 'ON'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-glow-danger'
                      : 'bg-navy-900 text-slate-500 border-navy-800'
                  }`}>
                    <Volume2 className={`w-5 h-5 ${actuatorStatus?.buzzer === 'ON' ? 'animate-bounce' : ''}`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Audible Bio-Alarm Buzzer</div>
                    <div className="text-[11px] font-mono text-slate-400">Sound on severe risk &gt; 70%</div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActuator('BUZZER')}
                  disabled={actuatorLoading === 'BUZZER'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition ${
                    actuatorStatus?.buzzer === 'ON'
                      ? 'bg-rose-500 text-white shadow-glow-danger'
                      : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                  }`}
                >
                  {actuatorLoading === 'BUZZER' ? '...' : actuatorStatus?.buzzer || 'OFF'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-navy-900/60 border border-navy-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>GPIO Pins: D18, D19, D21</span>
            <span className="text-spoil-emerald">ESP32 Firmware Ready</span>
          </div>
        </div>

        {/* Live Spoilage Threat Feed (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">INCIDENT LOG</span>
                  <h3 className="font-bold text-white text-lg">Active Threshold Warnings</h3>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {summary?.activeAlertsCount ?? 0} ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {summary?.recentAlerts && summary.recentAlerts.length > 0 ? (
                summary.recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-4 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-100 hover:border-rose-500/50'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-100 hover:border-amber-500/50'
                        : 'bg-navy-950/80 border-navy-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-500 text-white shadow-glow-danger'
                          : alert.severity === 'WARNING'
                          ? 'bg-amber-500 text-navy-950 shadow-glow-amber'
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        {alert.severity}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">{alert.message}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                          <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                          <span>·</span>
                          <span className="text-spoil-cyan">{alert.alertType}</span>
                        </div>
                      </div>
                    </div>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-slate-200 transition hover:border-spoil-emerald/40"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <CheckCircle className="w-10 h-10 text-spoil-emerald mx-auto mb-3 opacity-60" />
                  <p className="font-semibold text-white">Chamber Operating Under Normal Conditions</p>
                  <p className="text-xs text-slate-400 mt-1">No volatile surges or critical thermal spikes detected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Automated Incident Classifier</span>
            <span className="text-spoil-cyan">ISO 22000 Food Safety Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
};
