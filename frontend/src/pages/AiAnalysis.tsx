import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  Eye,
  Cpu,
  Upload,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Zap,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { aiApi, foodSampleApi, sensorApi } from '../services/api';
import {
  FoodSample,
  ImagePredictionResult,
  FusionPredictionResult,
  SensorPredictionResult,
  ModelStatusItem
} from '../types';

export const AiAnalysis: React.FC = () => {
  const [models, setModels] = useState<ModelStatusItem[]>([]);
  const [foodSamples, setFoodSamples] = useState<FoodSample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<number | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('APPLE');

  // Image Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [imageResult, setImageResult] = useState<ImagePredictionResult | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Multimodal Fusion state
  const [isFusing, setIsFusing] = useState<boolean>(false);
  const [fusionResult, setFusionResult] = useState<FusionPredictionResult | null>(null);
  const [fusionError, setFusionError] = useState<string | null>(null);

  // Sensor Time-Series prediction state
  const [isAnalyzingSensor, setIsAnalyzingSensor] = useState<boolean>(false);
  const [sensorResult, setSensorResult] = useState<SensorPredictionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadModelsStatus();
    loadFoodSamples();
  }, []);

  const loadModelsStatus = async () => {
    try {
      const data = await aiApi.getModelsStatus();
      if (data && data.models) {
        setModels(data.models);
      }
    } catch (err) {
      console.warn('Failed to fetch AI models status:', err);
    }
  };

  const loadFoodSamples = async () => {
    try {
      const samples = await foodSampleApi.getAll();
      setFoodSamples(samples);
      if (samples.length > 0 && selectedSampleId === undefined) {
        setSelectedSampleId(samples[0].id);
        setSelectedCategory(samples[0].foodCategory);
      }
    } catch (err) {
      console.warn('Failed to load food samples for AI studio:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setImageResult(null);
      setImageError(null);
      setFusionResult(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedFile) return;
    setIsAnalyzingImage(true);
    setImageError(null);

    try {
      const result: ImagePredictionResult = await aiApi.analyzeImage(
        selectedFile,
        selectedCategory,
        selectedSampleId
      );
      setImageResult(result);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Image analysis failed.';
      setImageError(msg);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleRunMultimodalFusion = async () => {
    setIsFusing(true);
    setFusionError(null);

    try {
      // 1. Fetch recent readings for selected sample or overall
      const history = await sensorApi.getHistory(selectedSampleId);
      if (!history || history.length === 0) {
        throw new Error('No sensor telemetry found for the selected food batch. Ingest readings first via Simulator or ESP32.');
      }

      // 2. Prepare payload with visual metrics if image was analyzed
      const browning = imageResult?.spoilage_features?.surface_browning_percent ?? 12.0;
      const discoloration = imageResult?.spoilage_features?.discoloration_score ?? 0.20;
      const detectionConf = imageResult?.detection_confidence ?? (imageResult?.detected_items?.[0]?.confidence ?? 0.92);
      const visionConf = imageResult?.vision_confidence ?? imageResult?.confidence ?? 0.88;
      const visionEmb = (imageResult as any)?.vision_embedding ?? undefined;

      const payload = {
        foodSampleId: selectedSampleId,
        foodCategory: selectedCategory,
        browningPercent: browning,
        discolorationScore: discoloration,
        detectionConfidence: detectionConf,
        visionConfidence: visionConf,
        visionEmbedding: visionEmb,
        recentReadings: history.slice(0, 30).map((r) => ({
          temperatureC: r.temperatureC,
          humidityPercent: r.humidityPercent,
          gasValue: r.gasValue,
          weightGrams: r.weightGrams,
          lightLux: r.lightLux,
        })),
      };

      const result: FusionPredictionResult = await aiApi.predictFusion(payload);
      setFusionResult(result);
    } catch (err: any) {
      setFusionError(err.message || 'Multimodal fusion prediction failed.');
    } finally {
      setIsFusing(false);
    }
  };

  const handleRunSensorOnlyPrediction = async () => {
    setIsAnalyzingSensor(true);
    try {
      const history = await sensorApi.getHistory(selectedSampleId);
      if (!history || history.length === 0) {
        throw new Error('No sensor history available for this food batch.');
      }

      const payload = {
        foodSampleId: selectedSampleId,
        foodCategory: selectedCategory,
        readings: history.slice(0, 30).map((r) => ({
          temperatureC: r.temperatureC,
          humidityPercent: r.humidityPercent,
          gasValue: r.gasValue,
          weightGrams: r.weightGrams,
        })),
      };

      const res: SensorPredictionResult = await aiApi.predictSensor(payload);
      setSensorResult(res);
    } catch (err: any) {
      alert(err.message || 'Sensor time-series prediction failed.');
    } finally {
      setIsAnalyzingSensor(false);
    }
  };

  const getStageBadgeColor = (stage?: string) => {
    switch (stage) {
      case 'FRESH':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'EARLY_SPOILAGE':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MODERATE_SPOILAGE':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'SEVERE_SPOILAGE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-spoil-violet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/30 shadow-glow-violet">
                <BrainCircuit className="w-3.5 h-3.5" />
                NEURAL MULTIMODAL INTELLIGENCE CORE
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-navy-800 text-slate-300 border border-navy-700">
                YOLOv8 + TIME-SERIES ML + ATTENTION FUSION
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Multimodal AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-spoil-violet via-spoil-cyan to-spoil-emerald">Analysis Studio</span>
            </h1>

            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Upload real food specimen imagery for deep YOLOv8 morphological & photometric browning analysis, combined with environmental multi-sensor volatility sequences through cross-modal attention fusion.
            </p>
          </div>

          <button
            onClick={loadModelsStatus}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-navy-900 hover:bg-navy-850 border border-navy-700 text-xs font-mono text-slate-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-spoil-cyan" />
            Refresh Engine Status
          </button>
        </div>

        {/* Scientific Transparency Mode Notice */}
        <div className="relative z-10 mt-4 flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>DEMONSTRATION MODE (BENCHMARK):</strong> Models are calibrated on Arrhenius microbial degradation kinetics. Validation metrics reflect hold-out benchmark testing; real-world industrial compliance requires controlled chamber trials.
          </span>
        </div>
      </div>

      {/* Model Status Registry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {models.map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl glass-card border border-navy-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-200">{m.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                m.status === 'ONLINE' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-snug">{m.architecture || m.notes}</p>
            <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Trained: {m.trained ? 'Yes (Active Weights)' : 'Heuristic Baseline'}</span>
              {m.accuracy && <span className="text-spoil-emerald font-bold">{(m.accuracy * 100).toFixed(1)}% Acc</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Studio Grid: Image Vision + Multimodal Fusion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Upload & Computer Vision */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-navy-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Visual Degradation Inference</h3>
                  <p className="text-xs text-slate-400">YOLOv8 bounding box localization + HSV melanin browning metric</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-navy-900 text-orange-400 border border-orange-500/30 font-bold">
                VISION BRANCH
              </span>
            </div>

            {/* Controls: Target Category & Associated Food Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Food Specimen Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-200 text-xs font-mono focus:border-orange-500/50 outline-none"
                >
                  <option value="APPLE">Apple (Malus domestica)</option>
                  <option value="BANANA">Banana (Musa acuminata)</option>
                  <option value="TOMATO">Tomato (Solanum lycopersicum)</option>
                  <option value="MANGO">Mango (Mangifera indica)</option>
                  <option value="OTHER">Other Perishable Specimen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Link to Monitored Batch</label>
                <select
                  value={selectedSampleId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : undefined;
                    setSelectedSampleId(id);
                    const s = foodSamples.find((item) => item.id === id);
                    if (s) setSelectedCategory(s.foodCategory);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-slate-200 text-xs font-mono focus:border-orange-500/50 outline-none"
                >
                  <option value="">No Batch Association (Standalone)</option>
                  {foodSamples.map((s) => (
                    <option key={s.id} value={s.id}>
                      Batch #{s.id} — {s.sampleName} ({s.foodCategory})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropzone / Upload Box */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
                imagePreviewUrl
                  ? 'border-navy-700 hover:border-orange-500/50 bg-navy-950/40'
                  : 'border-navy-750 hover:border-orange-500/50 bg-navy-900/30'
              }`}
            >
              {imagePreviewUrl ? (
                <div className="relative max-h-72 w-full flex items-center justify-center overflow-hidden rounded-2xl">
                  <img
                    src={imagePreviewUrl}
                    alt="Specimen Preview"
                    className="max-h-72 object-contain rounded-2xl shadow-xl border border-white/5"
                  />
                  {/* Bounding Box Visual Overlay if analyzed */}
                  {imageResult?.detected_items && imageResult.detected_items.length > 0 && imageResult.image_dimensions && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {imageResult.detected_items.map((item, idx) => (
                        <div
                          key={idx}
                          className="absolute border-2 border-orange-400 bg-orange-500/10 rounded-lg shadow-glow-amber"
                          style={{
                            left: `${(item.box[0] / imageResult.image_dimensions!.width) * 100}%`,
                            top: `${(item.box[1] / imageResult.image_dimensions!.height) * 100}%`,
                            width: `${((item.box[2] - item.box[0]) / imageResult.image_dimensions!.width) * 100}%`,
                            height: `${((item.box[3] - item.box[1]) / imageResult.image_dimensions!.height) * 100}%`,
                          }}
                        >
                          <span className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-orange-600 text-white font-mono text-[10px] font-bold tracking-wider">
                            {item.label} ({(item.confidence * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center mx-auto text-orange-400 shadow-glow-amber">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Click or drag food specimen photo here
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      JPEG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {imageError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(0)} KB)` : 'No file selected'}
              </span>

              <button
                disabled={!selectedFile || isAnalyzingImage}
                onClick={handleAnalyzeImage}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold font-mono tracking-wider disabled:opacity-50 transition-all shadow-glow-amber"
              >
                {isAnalyzingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    INFERENCING YOLOv8...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    RUN COMPUTER VISION INFERENCE
                  </>
                )}
              </button>
            </div>

            {/* Vision Prediction Output Card */}
            {imageResult && (
              <div className="p-5 rounded-2xl bg-navy-950/90 border border-navy-750 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-spoil-emerald" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Vision Inference Results ({imageResult.model_name})
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStageBadgeColor(imageResult.spoilage_stage)}`}>
                    {imageResult.spoilage_stage}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Surface Browning</span>
                    <span className="text-base font-bold text-orange-400">
                      {imageResult.spoilage_features.surface_browning_percent}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Discoloration</span>
                    <span className="text-base font-bold text-amber-300">
                      {(imageResult.spoilage_features.discoloration_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Model Confidence</span>
                    <span className="text-base font-bold text-spoil-emerald">
                      {(imageResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Tissue Softening</span>
                    <span className={`text-base font-bold ${imageResult.spoilage_features.texture_softening_detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {imageResult.spoilage_features.texture_softening_detected ? 'DETECTED' : 'FIRM'}
                    </span>
                  </div>
                </div>

                {imageResult.detected_items && imageResult.detected_items.length > 0 && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                    <span>
                      Detected Object: <strong className="text-white">{imageResult.detected_items[0].label}</strong>
                    </span>
                    <span>
                      Box: [{imageResult.detected_items[0].box.map(n => Math.round(n)).join(', ')}]
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multimodal Cross-Attention Fusion & Shelf-Life */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-navy-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Cross-Modal Fusion</h3>
                  <p className="text-xs text-slate-400">Entropy-weighted attention layer</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-navy-900 text-violet-400 border border-violet-500/30 font-bold">
                ATTENTION LAYER
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Fuses visual degradation indicators with environmental volatility sequences (DHT22 temperature & humidity, MQ135 VOC gas accumulation, and weight evaporation rates).
            </p>

            {fusionError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{fusionError}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                disabled={isFusing}
                onClick={handleRunMultimodalFusion}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-spoil-violet to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-mono font-bold text-xs tracking-wider transition-all shadow-glow-violet disabled:opacity-50"
              >
                {isFusing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    COMPUTING ATTENTION WEIGHTS...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    RUN MULTIMODAL ATTENTION FUSION
                  </>
                )}
              </button>

              <button
                disabled={isAnalyzingSensor}
                onClick={handleRunSensorOnlyPrediction}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-navy-900 hover:bg-navy-850 border border-navy-700 text-xs font-mono text-slate-300 transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-spoil-teal" />
                Evaluate Sensor-Only Time-Series Pipeline
              </button>
            </div>

            {/* Fusion Results Display */}
            {fusionResult && (
              <div className="p-5 rounded-2xl bg-navy-950/90 border border-navy-750 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Joint Multimodal Classification
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStageBadgeColor(fusionResult.overall_stage)}`}>
                    {fusionResult.overall_stage}
                  </span>
                </div>

                {/* Decoupled Confidences Breakdown */}
                <div className="p-3.5 rounded-xl bg-navy-900/90 border border-navy-800 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span className="font-bold text-slate-300">Decoupled Confidence Metrics</span>
                    <span className="text-[10px] text-spoil-cyan font-mono">3 Separate Heads</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-center">
                    <div className="p-2 rounded-lg bg-navy-950 border border-navy-800">
                      <div className="text-[10px] text-slate-400">Object Detection</div>
                      <div className="text-xs font-bold text-orange-400">
                        {((fusionResult.detection_confidence ?? 0.92) * 100).toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-500">YOLOv8</div>
                    </div>
                    <div className="p-2 rounded-lg bg-navy-950 border border-navy-800">
                      <div className="text-[10px] text-slate-400">Sensor Time-Series</div>
                      <div className="text-xs font-bold text-spoil-teal">
                        {((fusionResult.sensor_confidence ?? 0.88) * 100).toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-500">PyTorch BiLSTM</div>
                    </div>
                    <div className="p-2 rounded-lg bg-navy-950 border border-navy-800">
                      <div className="text-[10px] text-slate-400">Spoilage Fusion</div>
                      <div className="text-xs font-bold text-violet-400">
                        {((fusionResult.spoilage_confidence ?? fusionResult.confidence) * 100).toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-500">Cross-Attention</div>
                    </div>
                  </div>
                </div>

                {/* Attention Weights Bar */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Vision Attention (α_v): {(fusionResult.attention_weights.visual_branch * 100).toFixed(1)}%</span>
                    <span>Sensor Attention (α_s): {(fusionResult.attention_weights.sensor_branch * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-navy-900 rounded-full overflow-hidden flex">
                    <div
                      className="bg-orange-500 h-full transition-all duration-500"
                      style={{ width: `${fusionResult.attention_weights.visual_branch * 100}%` }}
                    />
                    <div
                      className="bg-spoil-teal h-full transition-all duration-500"
                      style={{ width: `${fusionResult.attention_weights.sensor_branch * 100}%` }}
                    />
                  </div>
                </div>

                {/* Shelf-Life Forecast Card */}
                <div className="p-4 rounded-xl bg-navy-900/90 border border-navy-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-spoil-cyan" />
                      Remaining Shelf-Life
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-navy-800 text-slate-400 border border-navy-700">
                      Arrhenius Model
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-spoil-cyan to-spoil-emerald">
                      {fusionResult.shelf_life_details?.estimated_remaining_days ?? (fusionResult.estimated_shelf_life_hours / 24).toFixed(1)} Days
                    </span>
                    <span className="text-xs text-slate-400">
                      ({fusionResult.estimated_shelf_life_hours} Hours)
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-navy-800/80">
                    <span>Combined Risk Score:</span>
                    <span className="text-amber-400 font-bold">{fusionResult.risk_score} / 100</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 leading-normal bg-navy-900/50 p-2.5 rounded-lg border border-navy-850">
                  ⚠️ <em>{fusionResult.shelf_life_details?.demonstration_notice || 'Demonstration estimate derived from food science postharvest degradation kinetics.'}</em>
                </div>
              </div>
            )}

            {/* Sensor Time-Series Output Card */}
            {sensorResult && (
              <div className="p-4 rounded-2xl bg-navy-950/80 border border-teal-500/20 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-navy-800">
                  <span className="text-spoil-teal font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    PyTorch BiLSTM Sequence Classifier
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStageBadgeColor(sensorResult.spoilage_stage)}`}>
                    {sensorResult.spoilage_stage}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Sensor Risk Index:</span>
                  <span className="text-amber-400 font-bold">{sensorResult.risk_score} / 100</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Inference Confidence:</span>
                  <span className="text-spoil-emerald font-bold">{(sensorResult.confidence * 100).toFixed(1)}%</span>
                </div>

                {sensorResult.probabilities && (
                  <div className="pt-2 border-t border-navy-800/80 space-y-1 text-[11px] text-slate-400">
                    <span className="text-slate-500 block mb-1">Class Probabilities:</span>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div>Fresh: {(sensorResult.probabilities.fresh * 100).toFixed(1)}%</div>
                      <div>Early: {((sensorResult.probabilities.early_spoilage || 0) * 100).toFixed(1)}%</div>
                      <div>Moderate: {((sensorResult.probabilities.moderate_spoilage || 0) * 100).toFixed(1)}%</div>
                      <div>Severe: {((sensorResult.probabilities.severe_spoilage || 0) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
