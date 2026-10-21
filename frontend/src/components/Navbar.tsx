import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Cpu,
  Wifi,
  WifiOff,
  LogOut,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { connected, latestReading, actuatorStatus } = useWebSocket();
  const [currentTime, setCurrentTime] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isSimulated = latestReading?.source === 'SIMULATED';

  // Format active path
  const currentPathName = location.pathname === '/' ? 'Mission Control' :
    location.pathname.replace('/', '').replace('-', ' ').toUpperCase();

  return (
    <header className="h-18 border-b border-white/[0.08] bg-navy-900/80 backdrop-blur-2xl px-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-spoil-emerald animate-pulse" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-spoil-emerald rounded-full border-2 border-navy-950"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-spoil-emerald bg-clip-text text-transparent">
                SPOIL AI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-spoil-emerald/10 text-spoil-emerald border border-spoil-emerald/30 font-bold tracking-wider">
                PRO v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Food Intelligence & IoT Telemetry
            </p>
          </div>
        </Link>

        {/* Tactical Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-white/[0.08] text-xs font-mono text-slate-400">
          <Layers className="w-3.5 h-3.5 text-spoil-cyan" />
          <span>PORTAL</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-white font-semibold tracking-wide">{currentPathName}</span>
        </div>
      </div>

      {/* Real-time telemetry indicators & actions */}
      <div className="flex items-center gap-4">
        {/* UTC / System Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950/80 border border-white/[0.07] text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-spoil-cyan" />
          <span>{currentTime || '00:00:00'}</span>
          <span className="text-[10px] text-slate-500 font-bold">LOCAL</span>
        </div>

        {/* STOMP WebSocket Live Beacon */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-950/90 border border-white/[0.08] text-xs font-mono shadow-inner">
          {connected ? (
            <>
              <div className="relative flex items-center justify-center">
                <span className="absolute w-3 h-3 rounded-full bg-spoil-emerald/40 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-spoil-emerald shadow-glow-emerald"></span>
              </div>
              <Wifi className="w-3.5 h-3.5 text-spoil-emerald" />
              <span className="text-spoil-emerald font-bold tracking-wider text-[11px]">WEBSOCKET LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 font-medium text-[11px]">CONNECTING</span>
            </>
          )}
        </div>

        {/* Telemetry Data Source Pill */}
        {latestReading && (
          <div className={`hidden sm:flex items-center gap-2 text-[11px] font-mono px-3 py-1 rounded-full border shadow-sm ${
            isSimulated
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulated ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span>ORIGIN: {latestReading.source}</span>
          </div>
        )}

        {/* Actuator Diode Mirror */}
        {actuatorStatus && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-navy-950/80 border border-white/[0.07] text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
              actuatorStatus.ledIndicator === 'GREEN' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(0,245,155,0.7)]' :
              actuatorStatus.ledIndicator === 'YELLOW' ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]' :
              'bg-red-500 shadow-[0_0_12px_rgba(255,51,102,0.8)]'
            }`} />
            <span className="text-[11px] text-slate-300 font-medium">LED: {actuatorStatus.ledIndicator}</span>
          </div>
        )}

        {/* Quick Simulator Launch Button */}
        <Link
          to="/simulator"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-navy-800 to-navy-750 hover:from-navy-700 hover:to-navy-650 text-slate-200 hover:text-white text-xs font-mono font-medium border border-white/[0.08] transition hover:border-spoil-cyan/40 hover:shadow-glow-cyan"
        >
          <Cpu className="w-3.5 h-3.5 text-spoil-cyan" />
          <span>Simulator Cockpit</span>
        </Link>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-navy-800 to-navy-700 border border-white/[0.1] flex items-center justify-center font-display font-bold text-sm text-spoil-emerald shadow-inner">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-white leading-tight font-display">{user?.fullName || user?.username}</div>
            <div className="text-[10px] text-spoil-emerald font-mono font-semibold">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            title="Sign out of platform"
            className="p-2 rounded-xl bg-navy-950/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 transition shadow-sm"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
