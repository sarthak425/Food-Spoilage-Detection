import React, { useEffect, useState } from 'react';
import { foodSampleApi } from '../services/api';
import { FoodSample } from '../types';
import {
  Apple,
  Plus,
  Tag,
  Scale,
  Thermometer,
  Layers,
  Sparkles,
  Cpu,
  X,
  Check,
  Calendar,
  Package
} from 'lucide-react';

export const FoodSamples: React.FC = () => {
  const [samples, setSamples] = useState<FoodSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('APPLE');
  const [batch, setBatch] = useState('BATCH-2026-');
  const [storage, setStorage] = useState('AMBIENT');
  const [weight, setWeight] = useState(500);
  const [notes, setNotes] = useState('');

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const data = await foodSampleApi.getAll();
      setSamples(data);
    } catch (e) {
      console.error('Failed to load food samples', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await foodSampleApi.create({
        sampleName: name,
        foodCategory: category,
        batchNumber: batch,
        storageCondition: storage,
        initialWeightGrams: weight,
        notes,
        deviceId: 'VIRTUAL_SENSOR_01'
      });
      setShowModal(false);
      setName('');
      setNotes('');
      fetchSamples();
    } catch (err) {
      console.error('Failed to create sample', err);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'APPLE': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'BANANA': return 'text-amber-300 border-amber-500/30 bg-amber-500/10';
      case 'TOMATO': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'MANGO': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      default: return 'text-spoil-cyan border-spoil-cyan/30 bg-spoil-cyan/10';
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
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-spoil-emerald/10 text-spoil-emerald border border-spoil-emerald/30 shadow-glow-emerald">
                <Package className="w-3.5 h-3.5" />
                SAMPLE INVENTORY REPOSITORY
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-navy-800 text-slate-300 border border-navy-700">
                MONITORED BATCHES: {samples.length}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Food Samples & <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-emerald via-spoil-cyan to-spoil-violet">Batch Registry</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Catalogue of active agricultural produce and food samples monitored in test chambers. Tracks initial mass, storage atmosphere, and real-time degradation status.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-spoil-emerald to-emerald-400 text-navy-950 font-bold text-xs font-mono tracking-wider uppercase transition hover:brightness-110 shadow-glow-emerald hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>ENROLL NEW BATCH</span>
          </button>
        </div>
      </div>

      {/* Grid of Food Batches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {samples.map((s) => (
          <div
            key={s.id}
            className="p-6 rounded-3xl glass-card border border-navy-800 hover:border-spoil-emerald/40 hover:shadow-glow-emerald transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${getCategoryColor(s.foodCategory)}`}>
                    <Apple className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{s.sampleName}</h3>
                    <div className="text-[11px] font-mono text-slate-400">BATCH #{s.batchNumber}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-spoil-emerald/15 text-spoil-emerald border border-spoil-emerald/30 shadow-glow-emerald font-bold">
                  {s.status}
                </span>
              </div>

              {/* Specs Box */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono p-4 rounded-2xl bg-navy-950/80 border border-navy-850">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                  <span className="text-white font-bold">{s.foodCategory}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Storage Atmosphere</span>
                  <span className="text-spoil-cyan font-bold">{s.storageCondition}</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Baseline Mass</span>
                  <span className="text-purple-400 font-bold">{s.initialWeightGrams ?? 500} g</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Telemetry Node</span>
                  <span className="text-amber-300 font-bold">{s.deviceId ?? 'VIRTUAL_01'}</span>
                </div>
              </div>

              {s.notes && (
                <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-300 italic">
                  "{s.notes}"
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Registered: {new Date(s.createdAt).toLocaleDateString()}</span>
              <span className="text-spoil-cyan font-bold">ACTIVE MONITORING</span>
            </div>
          </div>
        ))}
      </div>

      {/* Enroll Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative max-w-lg w-full p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-spoil-emerald">BATCH REGISTRATION</span>
                <h2 className="text-xl font-bold text-white">Enroll Perishable Sample</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-navy-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Sample Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fuji Apples (Grade A)"
                  className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Crop Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-emerald"
                  >
                    <option value="APPLE">Apple</option>
                    <option value="BANANA">Banana</option>
                    <option value="TOMATO">Tomato</option>
                    <option value="MANGO">Mango</option>
                    <option value="MEAT">Meat / Poultry</option>
                    <option value="DAIRY">Dairy / Milk</option>
                    <option value="OTHER">Other Perishable</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Batch Code</label>
                  <input
                    type="text"
                    required
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-emerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Storage Mode</label>
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-emerald"
                  >
                    <option value="AMBIENT">Ambient Room (22°C)</option>
                    <option value="REFRIGERATED">Cold Chain (4°C)</option>
                    <option value="CONTROLLED">Controlled Atmosphere</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Initial Weight (g)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono focus:outline-none focus:border-spoil-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-300 block mb-1.5">Research / Degradation Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Atmosphere details, harvest date, supplier specifications..."
                  className="w-full px-4 py-3 rounded-2xl bg-navy-950 border border-navy-800 text-white text-sm font-mono h-24 focus:outline-none focus:border-spoil-emerald"
                />
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
                  className="px-6 py-2.5 rounded-2xl bg-spoil-emerald text-navy-950 font-bold text-xs font-mono tracking-wider uppercase hover:bg-emerald-400 shadow-glow-emerald"
                >
                  Enroll Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
