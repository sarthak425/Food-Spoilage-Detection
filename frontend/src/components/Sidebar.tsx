import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  Apple,
  Sliders,
  Bell,
  Radio,
  Sparkles,
  Terminal
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  tagColor?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Live Telemetry', path: '/sensors', icon: Activity },
  { name: 'Sensor Simulator', path: '/simulator', icon: Cpu, tag: 'Engine', tagColor: 'emerald' },
  { name: 'Food Batches', path: '/samples', icon: Apple },
  { name: 'Actuator Control', path: '/actuators', icon: Sliders },
  { name: 'Smart Alerts', path: '/alerts', icon: Bell },
  { name: 'IoT Hardware', path: '/devices', icon: Radio, tag: 'ESP32', tagColor: 'cyan' },
  { name: 'Multimodal AI', path: '/ai-analysis', icon: Sparkles, tag: 'Vision', tagColor: 'violet' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-68 border-r border-white/[0.08] bg-navy-950/70 backdrop-blur-2xl flex flex-col justify-between shrink-0 h-[calc(100vh-4.5rem)] select-none">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase text-slate-400 font-bold tracking-widest flex items-center justify-between">
            <span>Navigation Modules</span>
            <Terminal className="w-3 h-3 text-slate-400" />
          </div>

          <nav className="space-y-1">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/15 via-spoil-emerald/10 to-transparent text-white border-l-2 border-spoil-emerald shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-7 h-7 rounded-lg bg-navy-900 border border-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-spoil-emerald transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-display font-medium text-sm">{item.name}</span>
                  </div>

                  {item.tag && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      item.tagColor === 'emerald' ? 'bg-spoil-emerald/10 text-spoil-emerald border-spoil-emerald/30' :
                      item.tagColor === 'cyan' ? 'bg-spoil-cyan/10 text-spoil-cyan border-spoil-cyan/30' :
                      'bg-purple-500/10 text-purple-300 border-purple-500/30'
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Hardware Readiness Badge */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-850 border border-white/[0.08] relative overflow-hidden group shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-spoil-emerald/5 rounded-full blur-xl group-hover:bg-spoil-emerald/15 transition-all duration-500" />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-spoil-emerald/15 border border-spoil-emerald/30 flex items-center justify-center text-spoil-emerald">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold font-display text-white">ESP32 Ready</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          REST API ingestion pipeline active. Physical IoT microcontrollers can stream directly to port 8080.
        </p>
      </div>
    </aside>
  );
};
