import React, { useEffect, useState } from 'react';
import { simulatorApi, foodSampleApi } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { SimulatorStatus, FoodSample } from '../types';
import {
  Play,
  Square,
  Cpu,
  Thermometer,
  Droplets,
  Wind,
  Scale,
  Sun,
  Radio,
  Sliders,
  Check,
  Zap,
  Activity,
  Terminal,
  Layers,
  Sparkles,
  RefreshCw,
  Box
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'NORMAL',
    title: 'Optimal Storage (Fresh)',
    description: 'Chilled baseline chamber maintaining cold chain stability. Low microbial activity & minimal VOC emission.',
    glowColor: 'emerald',
    badge: 'OPTIMAL PRESERVATION',
    tempRange: '21.0 - 24.0°C',
    humidityRange: '52 - 60% RH',
    gasRange: '290 - 330 ADC'
  },
  {
    id: 'WARMING',
    title: 'Thermal Abuse & Respiration',
    description: 'Ambient warming accelerates cellular respiration, ethylene release, and accelerates enzymatic softening.',
    glowColor: 'amber',
    badge: 'ACCELERATED AGING',
    tempRange: '28.5 - 32.0°C',
    humidityRange: '64 - 72% RH',
    gasRange: '360 - 420 ADC'
  },
  {
    id: 'HIGH_HUMIDITY',
    title: 'Moisture Saturation & Mold',
    description: 'High relative humidity triggers micro-condensation on skin, multiplying fungal spores and bacterial surface rot.',
    glowColor: 'cyan',
    badge: 'CONDENSATION HAZARD',
    tempRange: '25.0 - 28.0°C',
    humidityRange: '84 - 95% RH',
    gasRange: '390 - 450 ADC'
  },
  {
    id: 'SPOILAGE_PRONE',
    title: 'Acute Microbial Decay',
    description: 'Severe bacterial putrefaction with intense volatile amine and sulfur compound emission. Immediate discard.',
    glowColor: 'danger',
    badge: 'BIO-DECOMPOSITION',
    tempRange: '33.0 - 37.0°C',
    humidityRange: '88 - 98% RH',
    gasRange: '520 - 720 ADC'
  }
];

export const SensorSimulator: React.FC = () => {
  const { latestReading } = useWebSocket();
  const [status, setStatus] = useState<SimulatorStatus | null>(null);
  const [samples, setSamples] = useState<FoodSample[]>([]);
  const [selectedSample, setSelectedSample] = useState<number>(1);
  const [selectedScenario, setSelectedScenario] = useState<string>('NORMAL');
  const [intervalMs, setIntervalMs] = useState<number>(3000);
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const fetchState = async () => {
    try {
      const [simStatus, foodList] = await Promise.all([
        simulatorApi.getStatus(),
        foodSampleApi.getAll()
      ]);
      setStatus(simStatus);
      setSelectedScenario(simStatus.scenario || 'NORMAL');
      setIntervalMs(simStatus.intervalMs || 3000);
      setSelectedSample(simStatus.foodSampleId || 1);
      setSamples(foodList);
    } catch (e) {
      console.error('Failed to load simulator state', e);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Update telemetry log terminal when latest reading changes
  useEffect(() => {
    if (latestReading) {
      const logLine = `[${new Date().toLocaleTimeString()}] T:${latestReading.temperatureC.toFixed(1)}°C | H:${latestReading.humidityPercent.toFixed(1)}% | Gas:${Math.round(latestReading.gasValue)} ADC | W:${latestReading.weightGrams?.toFixed(1) ?? '500.0'}g -> Broadcast to STOMP /topic/sensors/latest`;
      setConsoleLogs((prev) => [logLine, ...prev.slice(0, 5)]);
    }
  }, [latestReading]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const updated = await simulatorApi.start({
        scenario: selectedScenario,
        intervalMs,
        foodSampleId: selectedSample
      });
      setStatus(updated);
    } catch (e) {
      console.error('Failed to start simulator', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const updated = await simulatorApi.stop();
      setStatus(updated);
    } catch (e) {
      console.error('Failed to stop simulator', e);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    if (status?.running) {
      try {
        const updated = await simulatorApi.setScenario(scenarioId);
        setStatus(updated);
      } catch (e) {
        console.error('Failed to update scenario', e);
      }
    }
  };

  const currentTemp = latestReading?.temperatureC ?? status?.latestReading?.temperatureC ?? 24.5;
  const currentHumidity = latestReading?.humidityPercent ?? status?.latestReading?.humidityPercent ?? 58;
  const currentGas = latestReading?.gasValue ?? status?.latestReading?.gasValue ?? 320;
  const currentWeight = latestReading?.weightGrams ?? status?.latestReading?.weightGrams ?? 500;
  const currentLight = latestReading?.lightLux ?? status?.latestReading?.lightLux ?? 120;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Simulation Command Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-spoil-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-spoil-cyan/10 text-spoil-cyan border border-spoil-cyan/30 shadow-glow-cyan">
                <Cpu className="w-3.5 h-3.5" />
                VIRTUAL SENSOR GENERATOR
              </span>
              <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
                status?.running
                  ? 'bg-spoil-emerald/15 text-spoil-emerald border-spoil-emerald/30 shadow-glow-emerald animate-pulse'
                  : 'bg-navy-800 text-slate-400 border-navy-700'
              }`}>
                {status?.running ? 'ENGINE RUNNING (STREAMING)' : 'ENGINE IDLE'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Chamber Environment <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-cyan via-spoil-emerald to-spoil-violet">Simulation Engine</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Synthesizes physics-grounded stochastic sensor streams for DHT22, MQ135, and HX711 load cell. Allows verifying automated actuation rules without hardware plugged in.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {status?.running ? (
              <button
                onClick={handleStop}
                disabled={loading}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-glow-danger"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
                <span>TERMINATE ENGINE</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-spoil-emerald to-emerald-400 text-navy-950 text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-glow-emerald hover:brightness-110 hover:scale-[1.02]"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>INITIATE STREAM</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Synthesized Telemetry Readout */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-spoil-emerald animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Live Synthesized Readings
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Total Telemetry Frames: <span className="text-spoil-cyan font-bold">{status?.readingsGenerated ?? 0}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Temperature Pod */}
          <div className="p-5 rounded-2xl glass-card border border-navy-800 hover:border-orange-500/40 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">DHT22 · THERMAL</span>
              <Thermometer className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{currentTemp.toFixed(1)}</span>
              <span className="text-sm font-semibold text-orange-400 font-mono">°C</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Target: 22.0°C</span>
              <span className={currentTemp > 28 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {currentTemp > 28 ? 'OVERHEAT' : 'STABLE'}
              </span>
            </div>
          </div>

          {/* Humidity Pod */}
          <div className="p-5 rounded-2xl glass-card border border-navy-800 hover:border-blue-400/40 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">DHT22 · HUMIDITY</span>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{currentHumidity.toFixed(1)}</span>
              <span className="text-sm font-semibold text-blue-400 font-mono">% RH</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Target: 55.0%</span>
              <span className={currentHumidity > 80 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {currentHumidity > 80 ? 'SATURATION' : 'OPTIMAL'}
              </span>
            </div>
          </div>

          {/* Gas Pod */}
          <div className="p-5 rounded-2xl glass-card border border-navy-800 hover:border-spoil-teal/40 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">MQ135 · VOLATILES</span>
              <Wind className="w-4 h-4 text-spoil-teal" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{Math.round(currentGas)}</span>
              <span className="text-sm font-semibold text-spoil-teal font-mono">ADC</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Limit: 450 ADC</span>
              <span className={currentGas > 450 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {currentGas > 450 ? 'ETHYLENE SPIKE' : 'CLEAN'}
              </span>
            </div>
          </div>

          {/* Weight Pod */}
          <div className="p-5 rounded-2xl glass-card border border-navy-800 hover:border-purple-400/40 transition">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">HX711 · MASS</span>
              <Scale className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{currentWeight.toFixed(1)}</span>
              <span className="text-sm font-semibold text-purple-400 font-mono">g</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Base: 500.0g</span>
              <span className="text-slate-300">
                -{(500.0 - currentWeight).toFixed(1)}g lost
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Presets Deck */}
      <div className="p-6 md:p-8 rounded-3xl glass-card border border-navy-800 space-y-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-cyan">MICROCLIMATE SCENARIOS</span>
          <h2 className="text-xl font-bold text-white mt-1">Select Active Environmental Condition</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Clicking a scenario instantaneously modulates the physics engine telemetry generator. Test how the cooling fan auto-starts when temperature spikes or how the exhaust vent engages during gas surges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleScenarioChange(sc.id)}
                className={`cursor-pointer p-5 rounded-2xl text-left border transition-all duration-300 relative flex flex-col justify-between ${
                  isSelected
                    ? sc.glowColor === 'emerald'
                      ? 'bg-spoil-emerald/10 border-spoil-emerald shadow-glow-emerald'
                      : sc.glowColor === 'amber'
                      ? 'bg-amber-500/10 border-amber-500 shadow-glow-amber'
                      : sc.glowColor === 'cyan'
                      ? 'bg-spoil-cyan/10 border-spoil-cyan shadow-glow-cyan'
                      : 'bg-rose-500/10 border-rose-500 shadow-glow-danger'
                    : 'bg-navy-950/70 border-navy-800 hover:border-navy-700 hover:bg-navy-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-navy-800 text-slate-400'
                    }`}>
                      {sc.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-spoil-emerald flex items-center justify-center shadow-glow-emerald">
                        <Check className="w-3.5 h-3.5 text-navy-950 font-black" />
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{sc.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{sc.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temp:</span>
                    <span className="text-white font-bold">{sc.tempRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Humidity:</span>
                    <span className="text-white font-bold">{sc.humidityRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gas Volatiles:</span>
                    <span className="text-white font-bold">{sc.gasRange}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration & Terminal Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Controls (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-navy-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-teal">SAMPLING FREQUENCY</span>
              <h3 className="font-bold text-white text-base">Telemetry Ingestion Rate</h3>
            </div>
            <Sliders className="w-5 h-5 text-spoil-teal" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
              <span>Interval</span>
              <span className="text-spoil-emerald font-bold px-2 py-0.5 rounded bg-spoil-emerald/10 border border-spoil-emerald/30">
                {intervalMs / 1000}s ({intervalMs}ms)
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={10000}
              step={500}
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              className="w-full h-2.5 bg-navy-950 rounded-lg appearance-none cursor-pointer accent-spoil-emerald border border-navy-800"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
              <span>1.0s (High-rate ESP32)</span>
              <span>3.0s (Balanced)</span>
              <span>10.0s (Battery Save)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-navy-800">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 block">
              Bind Target Food Batch
            </label>
            <select
              value={selectedSample}
              onChange={(e) => setSelectedSample(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan transition"
            >
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  Batch #{s.id} · {s.sampleName} ({s.foodCategory})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Broker Packet Console (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-spoil-cyan" />
                <h3 className="font-bold text-white text-base">Live MQTT / WebSocket Packet Terminal</h3>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-spoil-cyan/10 text-spoil-cyan border border-spoil-cyan/20">
                STOMP /ws-sensor
              </span>
            </div>

            <div className="bg-navy-950 rounded-2xl p-4 border border-navy-900 font-mono text-xs space-y-2 h-44 overflow-y-auto">
              {consoleLogs.length > 0 ? (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-spoil-emerald font-bold">&gt;</span>
                    <span className={idx === 0 ? 'text-spoil-cyan font-semibold' : 'text-slate-400'}>{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 py-12 text-center">
                  Waiting for telemetry frames... Start simulator above to generate readings.
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-navy-800">
            <span>Protocol: WebSocket STOMP v1.2</span>
            <span className="text-spoil-emerald">Zero packet loss</span>
          </div>
        </div>
      </div>
    </div>
  );
};
