import React from 'react';
import {
  Sparkles,
  Eye,
  Cpu,
  Network,
  ShieldCheck,
  BrainCircuit,
  Zap,
  ArrowRight,
  Layers,
  Activity
} from 'lucide-react';

export const AiAnalysis: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-spoil-violet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/30 shadow-glow-violet">
                <BrainCircuit className="w-3.5 h-3.5" />
                NEURAL ARCHITECTURE PIPELINE
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-navy-800 text-slate-300 border border-navy-700">
                MULTIMODAL FUSION SPECIFICATION
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Multimodal AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-violet via-spoil-cyan to-spoil-emerald">Intelligence Core</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Academic multimodal fusion engine synthesizing spatial visual features (YOLOv8) with temporal environmental volatility sequences (LSTM/1D-CNN) through cross-attention weighting.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-navy-900 border border-navy-800 text-xs font-mono text-violet-400">
            <span>FastAPI Inference Bridge Ready</span>
          </div>
        </div>
      </div>

      {/* 3 Pipeline Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vision Branch */}
        <div className="p-6 rounded-3xl glass-card border border-navy-800 hover:border-orange-500/40 hover:shadow-glow-amber transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                PHASE 3 VISION
              </span>
            </div>

            <h3 className="font-bold text-white text-lg">YOLOv8 Computer Vision</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deep convolutional object detection & segmentation pipeline. Detects crop morphology, skin browning pixel percentage, fungal mycotoxin spots, and surface wrinkle index.
            </p>

            <div className="p-3.5 rounded-2xl bg-navy-950/80 border border-navy-850 font-mono text-xs space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Model Backbone:</span>
                <span className="text-white font-bold">YOLOv8-Small</span>
              </div>
              <div className="flex justify-between">
                <span>Input Shape:</span>
                <span className="text-orange-400">640 × 640 × 3</span>
              </div>
              <div className="flex justify-between">
                <span>Inference Latency:</span>
                <span className="text-spoil-emerald">&lt; 18ms (CUDA)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-400">
            Output: 256-D Visual Embedding Vector
          </div>
        </div>

        {/* Sensor Temporal Branch */}
        <div className="p-6 rounded-3xl glass-card border border-navy-800 hover:border-spoil-teal/40 hover:shadow-glow-emerald transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-spoil-teal">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-teal-500/15 text-spoil-teal border border-teal-500/30">
                PHASE 4 TEMPORAL
              </span>
            </div>

            <h3 className="font-bold text-white text-lg">Bi-LSTM / 1D-CNN Sensor Model</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Temporal time-series neural network capturing rate-of-change dynamics across temperature, humidity, volatile organic gas, and weight degradation trajectories.
            </p>

            <div className="p-3.5 rounded-2xl bg-navy-950/80 border border-navy-850 font-mono text-xs space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Architecture:</span>
                <span className="text-white font-bold">2-Layer Bi-LSTM</span>
              </div>
              <div className="flex justify-between">
                <span>Sliding Window:</span>
                <span className="text-spoil-teal">48 Time Steps</span>
              </div>
              <div className="flex justify-between">
                <span>Features:</span>
                <span className="text-spoil-emerald">T, RH, VOC, Mass, Lux</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-400">
            Output: 128-D Temporal State Vector
          </div>
        </div>

        {/* Cross-Attention Multimodal Fusion */}
        <div className="p-6 rounded-3xl glass-card border border-navy-800 hover:border-violet-500/40 hover:shadow-glow-violet transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Network className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30">
                PHASE 4 ATTENTION
              </span>
            </div>

            <h3 className="font-bold text-white text-lg">Attention-Based Multimodal Fusion</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-head cross-attention mechanism weighting image visual evidence against gas/temperature curves to eliminate false positives (e.g. skin bruising vs real putrefaction).
            </p>

            <div className="p-3.5 rounded-2xl bg-navy-950/80 border border-navy-850 font-mono text-xs space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Attention Heads:</span>
                <span className="text-white font-bold">4 Multi-Head Cross</span>
              </div>
              <div className="flex justify-between">
                <span>Output Heads:</span>
                <span className="text-violet-400">Freshness Class + Days Left</span>
              </div>
              <div className="flex justify-between">
                <span>Evaluation Metric:</span>
                <span className="text-spoil-emerald">F1-Score 97.4%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-400">
            Final Verdict: Fresh | Early | Moderate | Severe
          </div>
        </div>
      </div>
    </div>
  );
};
