import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, User, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(username, email, password, fullName);
      login(res.token, {
        id: res.id,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        role: res.role
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-spoil-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-spoil-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-spoil-cyan via-spoil-emerald to-spoil-violet mx-auto flex items-center justify-center shadow-glow-cyan p-0.5">
            <div className="w-full h-full bg-navy-950 rounded-[22px] flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-spoil-cyan" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Operator Onboarding</h1>
          <p className="text-xs font-mono text-slate-400">
            Create Authorized Research Personnel Credentials
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-300 block mb-1">Full Name & Title</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Alex Vance"
                className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-300 block mb-1">Username Handle</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="avance"
                className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-300 block mb-1">Research Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.vance@spoil-ai.org"
                className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-300 block mb-1">Passcode</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-spoil-cyan to-blue-500 hover:brightness-110 text-navy-950 font-bold text-xs font-mono tracking-wider uppercase transition shadow-glow-cyan flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'ENROLLING CREDENTIALS...' : 'PROVISION OPERATOR ACCOUNT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-navy-800/80 text-center text-xs text-slate-400">
            Already possess active clearance?{' '}
            <Link to="/login" className="text-spoil-emerald hover:underline font-mono">
              Operator Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
