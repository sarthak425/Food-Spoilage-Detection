import React, { useEffect, useState } from 'react';
import { actuatorApi } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { ActuatorStatus } from '../types';
import {
  Fan,
  Wind,
  Volume2,
  Lightbulb,
  Box,
  CheckCircle,
  Cpu,
  Power,
  RotateCw,
  Zap,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const Actuators: React.FC = () => {
  const { actuatorStatus: wsStatus } = useWebSocket();
  const [status, setStatus] = useState<ActuatorStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await actuatorApi.getStatus();
      setStatus(data);
    } catch (e) {
      console.error('Failed to load actuator status', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const activeStatus = wsStatus || status;

  const handleToggle = async (actuatorType: string, currentState: string) => {
    const targetState = currentState === 'ON' ? 'OFF' : 'ON';
    setLoading(true);
    try {
      const updated = await actuatorApi.trigger(actuatorType, targetState, 'Manual Cockpit Test Override');
      setStatus(updated);
    } catch (e) {
      console.error('Failed to trigger actuator', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSorter = async (state: string) => {
    setLoading(true);
    try {
      const updated = await actuatorApi.trigger('SERVO_SORTER', state, 'Manual Sorvo Override');
      setStatus(updated);
    } catch (e) {
      console.error('Failed to trigger sorter', e);
    } finally {
      setLoading(false);
    }
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
                <Power className="w-3.5 h-3.5" />
                RELAYS & AUTOMATED INTERVENTION
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-navy-800 text-slate-300 border border-navy-700">
                GPIO CONTROLLER
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Actuator <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-cyan via-spoil-emerald to-spoil-violet">Control Station</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Industrial feedback actuators for environmental regulation. Devices automatically switch ON when telemetry breaches ISO safety bounds or can be commanded manually below.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-navy-900 border border-navy-800 text-xs font-mono text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-spoil-emerald animate-ping" />
            <span>RELAY BUS: ARMED</span>
          </div>
        </div>
      </div>

      {/* Main Actuators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cooling Fan */}
        <div className="p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between hover:border-spoil-cyan/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">CH-01 · RELAY D18</span>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                activeStatus?.coolingFan === 'ON'
                  ? 'bg-spoil-cyan/15 text-spoil-cyan border-spoil-cyan/40 shadow-glow-cyan'
                  : 'bg-navy-900 text-slate-500 border-navy-800'
              }`}>
                {activeStatus?.coolingFan || 'OFF'}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-5">
              <div className={`p-4 rounded-2xl border ${
                activeStatus?.coolingFan === 'ON'
                  ? 'bg-spoil-cyan/20 border-spoil-cyan/40 text-spoil-cyan shadow-glow-cyan'
                  : 'bg-navy-950 border-navy-800 text-slate-600'
              }`}>
                <Fan className={`w-8 h-8 ${activeStatus?.coolingFan === 'ON' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Chamber Cooling Fan</h3>
                <p className="text-xs text-slate-400 mt-1">High-speed brushless 12V DC</p>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-2xl bg-navy-950/80 border border-navy-900 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Autonomous Trigger:</span>
                <span className="text-white font-bold">&gt; 28.0°C</span>
              </div>
              <div className="flex justify-between">
                <span>Duty Cycle:</span>
                <span className="text-spoil-cyan">{activeStatus?.coolingFan === 'ON' ? '100% (Full Flow)' : '0% (Standby)'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleToggle('COOLING_FAN', activeStatus?.coolingFan || 'OFF')}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold font-mono tracking-wider uppercase transition shadow-lg ${
              activeStatus?.coolingFan === 'ON'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 shadow-glow-danger'
                : 'bg-gradient-to-r from-spoil-cyan to-blue-500 text-navy-950 shadow-glow-cyan hover:brightness-110'
            }`}
          >
            {activeStatus?.coolingFan === 'ON' ? 'DISENGAGE COOLING' : 'ENGAGE COOLING FAN'}
          </button>
        </div>

        {/* Ventilation Exhaust */}
        <div className="p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between hover:border-spoil-teal/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">CH-02 · RELAY D19</span>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                activeStatus?.ventilationFan === 'ON'
                  ? 'bg-teal-500/15 text-spoil-teal border-teal-500/40 shadow-glow-emerald'
                  : 'bg-navy-900 text-slate-500 border-navy-800'
              }`}>
                {activeStatus?.ventilationFan || 'OFF'}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-5">
              <div className={`p-4 rounded-2xl border ${
                activeStatus?.ventilationFan === 'ON'
                  ? 'bg-teal-500/20 border-teal-500/40 text-spoil-teal shadow-glow-emerald'
                  : 'bg-navy-950 border-navy-800 text-slate-600'
              }`}>
                <Wind className={`w-8 h-8 ${activeStatus?.ventilationFan === 'ON' ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Exhaust Vent Purge</h3>
                <p className="text-xs text-slate-400 mt-1">Negative pressure extraction</p>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-2xl bg-navy-950/80 border border-navy-900 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Autonomous Trigger:</span>
                <span className="text-white font-bold">&gt; 450 ADC Gas</span>
              </div>
              <div className="flex justify-between">
                <span>Evacuation Rate:</span>
                <span className="text-spoil-teal">{activeStatus?.ventilationFan === 'ON' ? '45 CFM' : '0 CFM'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleToggle('VENTILATION_FAN', activeStatus?.ventilationFan || 'OFF')}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold font-mono tracking-wider uppercase transition shadow-lg ${
              activeStatus?.ventilationFan === 'ON'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 shadow-glow-danger'
                : 'bg-gradient-to-r from-spoil-teal to-emerald-400 text-navy-950 shadow-glow-emerald hover:brightness-110'
            }`}
          >
            {activeStatus?.ventilationFan === 'ON' ? 'DISENGAGE VENT' : 'ENGAGE VENTILATION'}
          </button>
        </div>

        {/* Buzzer Alarm */}
        <div className="p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between hover:border-rose-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">CH-03 · RELAY D21</span>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                activeStatus?.buzzer === 'ON'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-glow-danger'
                  : 'bg-navy-900 text-slate-500 border-navy-800'
              }`}>
                {activeStatus?.buzzer || 'OFF'}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-5">
              <div className={`p-4 rounded-2xl border ${
                activeStatus?.buzzer === 'ON'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-glow-danger'
                  : 'bg-navy-950 border-navy-800 text-slate-600'
              }`}>
                <Volume2 className={`w-8 h-8 ${activeStatus?.buzzer === 'ON' ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Acoustic Bio-Alarm</h3>
                <p className="text-xs text-slate-400 mt-1">Piezo buzzer 85dB @ 2.4kHz</p>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-2xl bg-navy-950/80 border border-navy-900 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Autonomous Trigger:</span>
                <span className="text-white font-bold">&gt; 70% Spoilage Risk</span>
              </div>
              <div className="flex justify-between">
                <span>SPL Output:</span>
                <span className="text-rose-400">{activeStatus?.buzzer === 'ON' ? '85 dB Warning' : 'Silent'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleToggle('BUZZER', activeStatus?.buzzer || 'OFF')}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold font-mono tracking-wider uppercase transition shadow-lg ${
              activeStatus?.buzzer === 'ON'
                ? 'bg-navy-800 text-slate-300 hover:bg-navy-700 border border-navy-700'
                : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-glow-danger hover:brightness-110'
            }`}
          >
            {activeStatus?.buzzer === 'ON' ? 'SILENCE ALARM' : 'TEST ACOUSTIC ALARM'}
          </button>
        </div>
      </div>

      {/* Tri-Color Diode & Servo Sorter Bay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Diode (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">CH-04 · OPTICAL</span>
                <h3 className="font-bold text-white text-lg">Tri-Color Status Beacon</h3>
              </div>
              <Lightbulb className="w-5 h-5 text-amber-300" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Industrial physical RGB beacon visible on exterior chamber face. Reflects classified quality tier instantly:
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border text-center transition ${
                activeStatus?.ledIndicator === 'GREEN'
                  ? 'bg-spoil-emerald/20 border-spoil-emerald text-spoil-emerald shadow-glow-emerald'
                  : 'bg-navy-950 border-navy-800 text-slate-500'
              }`}>
                <div className="text-xs font-mono font-black">GREEN</div>
                <div className="text-[10px] mt-1 text-slate-400">Fresh / Nominal</div>
              </div>

              <div className={`p-4 rounded-2xl border text-center transition ${
                activeStatus?.ledIndicator === 'YELLOW'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-amber'
                  : 'bg-navy-950 border-navy-800 text-slate-500'
              }`}>
                <div className="text-xs font-mono font-black">YELLOW</div>
                <div className="text-[10px] mt-1 text-slate-400">Elevated Gas</div>
              </div>

              <div className={`p-4 rounded-2xl border text-center transition ${
                activeStatus?.ledIndicator === 'RED'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-glow-danger'
                  : 'bg-navy-950 border-navy-800 text-slate-500'
              }`}>
                <div className="text-xs font-mono font-black">RED</div>
                <div className="text-[10px] mt-1 text-slate-400">Critical Decay</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>GPIO Pins: 25, 26, 27</span>
            <span className="text-spoil-emerald">Synchronized</span>
          </div>
        </div>

        {/* Servo Sorter Arm (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-cyan">CH-05 · SERVO SG90</span>
                <h3 className="font-bold text-white text-lg">Automated Conveyor Sorting Arm</h3>
              </div>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                activeStatus?.servoSorter === 'SORTING_FRESH'
                  ? 'bg-spoil-emerald/15 text-spoil-emerald border-spoil-emerald/40 shadow-glow-emerald'
                  : activeStatus?.servoSorter === 'SORTING_SPOILED'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-glow-danger'
                  : 'bg-navy-950 text-slate-400 border-navy-800'
              }`}>
                ARM: {activeStatus?.servoSorter || 'IDLE'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              PWM-driven servo deflector arm (0° to 180°) that mechanically routes food items along conveyor chutes based on AI multimodal fusion verdict.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleSorter('SORTING_FRESH')}
                disabled={loading}
                className={`p-3.5 rounded-2xl text-xs font-mono font-bold tracking-wider transition border ${
                  activeStatus?.servoSorter === 'SORTING_FRESH'
                    ? 'bg-spoil-emerald text-navy-950 border-spoil-emerald shadow-glow-emerald'
                    : 'bg-navy-950 text-slate-300 border-navy-800 hover:border-spoil-emerald/40'
                }`}
              >
                DIVERT FRESH (+45°)
              </button>

              <button
                onClick={() => handleSorter('SORTING_SPOILED')}
                disabled={loading}
                className={`p-3.5 rounded-2xl text-xs font-mono font-bold tracking-wider transition border ${
                  activeStatus?.servoSorter === 'SORTING_SPOILED'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-glow-danger'
                    : 'bg-navy-950 text-slate-300 border-navy-800 hover:border-rose-500/40'
                }`}
              >
                DIVERT REJECT (-45°)
              </button>

              <button
                onClick={() => handleSorter('IDLE')}
                disabled={loading}
                className="p-3.5 rounded-2xl text-xs font-mono font-bold tracking-wider bg-navy-900 text-slate-400 border border-navy-800 hover:bg-navy-800"
              >
                RETURN HOME (0°)
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Angle: {activeStatus?.servoSorter === 'SORTING_FRESH' ? '+45°' : activeStatus?.servoSorter === 'SORTING_SPOILED' ? '-45°' : '0° Center'}</span>
            <span className="text-spoil-cyan">PWM Period: 20ms (50Hz)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
