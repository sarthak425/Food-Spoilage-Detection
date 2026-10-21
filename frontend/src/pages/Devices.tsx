import React, { useEffect, useState } from 'react';
import { deviceApi } from '../services/api';
import { Device } from '../types';
import {
  Radio,
  Plus,
  Key,
  CheckCircle,
  Wifi,
  Copy,
  Code,
  Cpu,
  X,
  Check,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deviceId, setDeviceId] = useState('ESP32_STATION_BETA');
  const [deviceName, setDeviceName] = useState('ESP32 Food Chamber Beta');
  const [deviceType, setDeviceType] = useState<'ESP32_REAL' | 'VIRTUAL'>('ESP32_REAL');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchDevices = async () => {
    try {
      const data = await deviceApi.getAll();
      setDevices(data);
    } catch (e) {
      console.error('Failed to load devices', e);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await deviceApi.register({ deviceId, deviceName, deviceType });
      if (created.apiKey) {
        setCreatedKey(created.apiKey);
      }
      fetchDevices();
    } catch (err) {
      console.error('Failed to register device', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
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
                <Wifi className="w-3.5 h-3.5" />
                HARDWARE & BROKER TOPOLOGY
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-navy-800 text-slate-300 border border-navy-700">
                REGISTERED NODES: {devices.length}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              IoT Microcontroller <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-cyan via-spoil-emerald to-spoil-violet">Device Registry</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Manage hardware ingestion endpoints. Physical ESP32 microcontrollers authenticate via X-Device-Key headers and stream telemetry alongside the built-in virtual chamber simulator.
            </p>
          </div>

          <button
            onClick={() => { setCreatedKey(null); setShowModal(true); }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-spoil-cyan to-blue-500 text-navy-950 font-bold text-xs font-mono tracking-wider uppercase transition hover:brightness-110 shadow-glow-cyan hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTER ESP32 NODE</span>
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((d) => (
          <div
            key={d.id}
            className="p-6 rounded-3xl glass-card border border-navy-800 hover:border-spoil-cyan/40 transition-all duration-300 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 rounded-2xl bg-spoil-cyan/10 border border-spoil-cyan/20 text-spoil-cyan">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{d.deviceName}</h3>
                  <div className="text-[11px] font-mono text-spoil-cyan font-bold">{d.deviceId}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  d.status === 'ONLINE' ? 'bg-spoil-emerald animate-ping' : 'bg-slate-600'
                }`} />
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${
                  d.status === 'ONLINE'
                    ? 'bg-spoil-emerald/15 text-spoil-emerald border-spoil-emerald/30 shadow-glow-emerald'
                    : 'bg-navy-900 text-slate-500 border-navy-800'
                }`}>
                  {d.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono p-4 rounded-2xl bg-navy-950/80 border border-navy-850">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Node Architecture</span>
                <span className="text-white font-bold">{d.deviceType === 'ESP32_REAL' ? 'ESP32 Xtensa Dual-Core' : 'Software Virtual Node'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Telemetry Protocol</span>
                <span className="text-spoil-cyan font-bold">HTTP POST + WebSocket</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 block text-[10px] uppercase">Heartbeat Status</span>
                <span className="text-emerald-400 font-bold">{d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleTimeString() : 'Awaiting 1st Packet'}</span>
              </div>
              <div className="mt-1">
                <span className="text-slate-400 block text-[10px] uppercase">Firmware Version</span>
                <span className="text-amber-300 font-bold">v2.4.1 (OTA-Ready)</span>
              </div>
            </div>

            {d.apiKey && (
              <div className="p-3 rounded-2xl bg-navy-900/60 border border-navy-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <Key className="w-3.5 h-3.5 text-spoil-cyan" />
                  <span>API Key: <span className="text-slate-200">••••••••••••••••</span></span>
                </div>
                <button
                  onClick={() => copyToClipboard(d.apiKey || '')}
                  className="text-spoil-cyan hover:underline text-[11px]"
                >
                  Copy Key
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-w-lg w-full p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-cyan">DEVICE ONBOARDING</span>
                <h2 className="text-xl font-bold text-white">Provision New IoT Node</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-navy-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdKey ? (
              <div className="p-5 rounded-2xl bg-spoil-emerald/10 border border-spoil-emerald/30 space-y-3">
                <div className="flex items-center gap-2 text-spoil-emerald font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  Node Provisioned Successfully!
                </div>
                <p className="text-xs text-slate-300">
                  Copy this device API key into your ESP32 Arduino sketch header. It will not be shown again:
                </p>
                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between font-mono text-xs text-spoil-emerald break-all">
                  <span>{createdKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdKey)}
                    className="ml-2 p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-spoil-emerald" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 rounded-xl bg-spoil-emerald text-navy-950 font-bold text-xs font-mono uppercase"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Device Identifier (ID)</label>
                  <input
                    type="text"
                    required
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="e.g. ESP32_CHAMBER_03"
                    className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Friendly Node Name</label>
                  <input
                    type="text"
                    required
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g. Cold Room Chamber B - ESP32 Ingestion"
                    className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Node Architecture Type</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan"
                  >
                    <option value="ESP32_REAL">Physical ESP32 Microcontroller (Real Hardware)</option>
                    <option value="VIRTUAL">Virtual Simulator Node (Software Synthetic)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-2xl bg-navy-800 text-slate-300 text-xs font-mono font-bold hover:bg-navy-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-spoil-cyan text-navy-950 font-bold text-xs font-mono tracking-wider uppercase hover:brightness-110 shadow-glow-cyan"
                  >
                    Generate Credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
