import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, User, ArrowRight, ShieldCheck, Sparkles, Key, Check } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      login(res.token, {
        id: res.id,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        role: res.role
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const setDemoProfile = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spoil-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-spoil-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Holographic Logo & System Crest */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-spoil-emerald via-spoil-cyan to-spoil-violet mx-auto flex items-center justify-center shadow-glow-emerald p-0.5">
            <div className="w-full h-full bg-navy-950 rounded-[22px] flex items-center justify-center">
              <Activity className="w-8 h-8 text-spoil-emerald animate-pulse" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-cyan font-bold px-3 py-1 rounded-full bg-spoil-cyan/10 border border-spoil-cyan/30 shadow-glow-cyan">
              BIOMETRIC & CHEMICAL AUDITING
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-3">
              Spoil <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-emerald to-spoil-cyan">AI Cockpit</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Food Intelligence & Spoilage Prevention System
            </p>
          </div>
        </div>

        {/* Login Panel */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block mb-1.5">Operator ID / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-navy-950/90 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-emerald transition"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block mb-1.5">Security Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-navy-950/90 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-emerald transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-spoil-emerald to-emerald-400 hover:brightness-110 text-navy-950 font-bold text-xs font-mono tracking-wider uppercase transition shadow-glow-emerald flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'AUTHENTICATING TOKEN...' : 'ENGAGE COCKPIT SESSION'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Profiles */}
          <div className="pt-4 border-t border-navy-800/80">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2 text-center">
              Quick 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDemoProfile('admin', 'admin123')}
                className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 hover:border-spoil-emerald/40 text-left transition"
              >
                <div className="text-xs font-mono font-bold text-spoil-emerald">Admin Role</div>
                <div className="text-[10px] font-mono text-slate-400">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoProfile('researcher', 'user123')}
                className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 hover:border-spoil-cyan/40 text-left transition"
              >
                <div className="text-xs font-mono font-bold text-spoil-cyan">Researcher</div>
                <div className="text-[10px] font-mono text-slate-400">researcher / user123</div>
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-slate-400">
              Need account provisioning?{' '}
              <Link to="/register" className="text-spoil-cyan hover:underline font-mono">
                Register Operator
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-slate-500">
          AES-256 JWT Authentication · Spring Security 6.3
        </div>
      </div>
    </div>
  );
};
