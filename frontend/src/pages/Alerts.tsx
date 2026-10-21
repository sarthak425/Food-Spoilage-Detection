import React, { useEffect, useState } from 'react';
import { alertApi } from '../services/api';
import { Alert } from '../types';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Filter,
  ShieldAlert,
  AlertOctagon,
  Clock,
  Radio,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNACKNOWLEDGED' | 'CRITICAL'>('ALL');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertApi.getAll(filter === 'UNACKNOWLEDGED');
      setAlerts(data);
    } catch (e) {
      console.error('Failed to load alerts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const handleAcknowledge = async (id: number) => {
    try {
      await alertApi.acknowledge(id);
      fetchAlerts();
    } catch (e) {
      console.error('Failed to acknowledge alert', e);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
  const unackCount = alerts.filter(a => !a.acknowledged).length;

  const filteredAlerts = filter === 'CRITICAL'
    ? alerts.filter(a => a.severity === 'CRITICAL')
    : alerts;

  const getRemediation = (alertType: string) => {
    switch (alertType) {
      case 'HIGH_TEMPERATURE':
        return 'Verify Chamber Peltier/compressor chilling line. Temperature breach accelerates bacterial proliferation.';
      case 'GAS_SURGE':
        return 'Elevated volatile amines detected. Engage exhaust ventilation and inspect sample for surface putrefaction.';
      case 'HIGH_HUMIDITY':
        return 'Moisture saturation exceeds dew point. Engage dehumidifier to prevent mold spore germination.';
      case 'SPOILAGE_RISK':
        return 'Multi-sensor fusion model predicts shelf-life expiration. Route batch to quarantine / reject bin.';
      default:
        return 'Inspect chamber telemetry and sensor calibration.';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-glow-danger">
                <ShieldAlert className="w-3.5 h-3.5" />
                INCIDENT RESPONSE LOG
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-navy-800 text-slate-300 border border-navy-700">
                ACTIVE AUDIT TRAIL
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Threshold Warnings & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-spoil-cyan">Incident Stream</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Automated anomaly detection triggered when environmental values breach critical bio-safety thresholds (temp &gt; 28°C, VOC gas &gt; 450 ADC, humidity &gt; 80%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition ${
                filter === 'ALL'
                  ? 'bg-spoil-cyan text-navy-950 shadow-glow-cyan'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-800'
              }`}
            >
              All Incidents
            </button>
            <button
              onClick={() => setFilter('UNACKNOWLEDGED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition ${
                filter === 'UNACKNOWLEDGED'
                  ? 'bg-amber-500 text-navy-950 shadow-glow-amber'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-800'
              }`}
            >
              Pending ({unackCount})
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition ${
                filter === 'CRITICAL'
                  ? 'bg-rose-500 text-white shadow-glow-danger'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-800'
              }`}
            >
              Critical ({criticalCount})
            </button>
          </div>
        </div>
      </div>

      {/* Incident Metric Pods */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-navy-800">
          <div className="text-xs font-mono uppercase text-slate-400">Total Recorded</div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">{alerts.length}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Chamber telemetry breaches</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-navy-800 hover:border-rose-500/40">
          <div className="text-xs font-mono uppercase text-rose-400">Critical Alarms</div>
          <div className="text-3xl font-extrabold font-mono text-rose-400 mt-2">{criticalCount}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Requiring immediate triage</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-navy-800 hover:border-amber-400/40">
          <div className="text-xs font-mono uppercase text-amber-400">Warnings</div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-2">{warningCount}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Elevated microclimate drift</div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-navy-800 hover:border-spoil-emerald/40">
          <div className="text-xs font-mono uppercase text-spoil-emerald">Unacknowledged</div>
          <div className="text-3xl font-extrabold font-mono text-spoil-emerald mt-2">{unackCount}</div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Awaiting operator sign-off</div>
        </div>
      </div>

      {/* Incident Feed */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl glass-card border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alert.severity === 'CRITICAL'
                  ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50'
                  : alert.severity === 'WARNING'
                  ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                  : 'border-navy-800 bg-navy-950/60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border mt-0.5 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-glow-danger'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber'
                    : 'bg-navy-900 text-slate-400 border-navy-800'
                }`}>
                  {alert.severity === 'CRITICAL' ? <AlertOctagon className="w-6 h-6 animate-pulse" /> : <AlertTriangle className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-500 text-white'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500 text-navy-950 font-black'
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-mono font-semibold text-spoil-cyan">
                      {alert.alertType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Node: {alert.deviceId || 'VIRTUAL_SENSOR_01'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white pt-0.5">{alert.message}</h3>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                    <span className="text-slate-400 font-mono">Remediation:</span>
                    <span>{getRemediation(alert.alertType)}</span>
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 pt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    {alert.acknowledged && (
                      <span className="text-spoil-emerald flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Acknowledged by Operator
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {!alert.acknowledged ? (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-5 py-2.5 rounded-2xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-slate-200 text-xs font-mono font-semibold transition hover:border-spoil-emerald/50 hover:text-white"
                  >
                    ACKNOWLEDGE
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-spoil-emerald/10 border border-spoil-emerald/20 text-spoil-emerald text-xs font-mono">
                    <CheckCircle className="w-4 h-4" /> RESOLVED
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 glass-card rounded-3xl border border-navy-800 text-slate-400">
            <CheckCircle className="w-12 h-12 text-spoil-emerald mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white">All Clear · Zero Active Incidents</h3>
            <p className="text-xs text-slate-400 mt-1">Chamber telemetry operating within optimal quality boundaries.</p>
          </div>
        )}
      </div>
    </div>
  );
};
