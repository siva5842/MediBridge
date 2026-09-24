import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Wind,
  Zap,
  Watch,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  BellRing,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Language,
  WearableTelemetry,
  ClinicalPreset,
  PrescribedDrug,
} from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';
import { soundAndVoice } from '../services/speechService';

interface ModuleWearableVitalsProps {
  language: Language;
  preset: ClinicalPreset;
  telemetry: WearableTelemetry;
  drugs: PrescribedDrug[];
  onTriggerTestAlarm: () => void;
}

export const ModuleWearableVitals: React.FC<ModuleWearableVitalsProps> = ({
  language,
  preset,
  telemetry,
  drugs,
  onTriggerTestAlarm,
}) => {
  const t = TRANSLATIONS[language];
  const [currentTime, setCurrentTime] = useState<string>('08:15 AM');
  const [watchHapticPulsing, setWatchHapticPulsing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateWatchBuzz = () => {
    setWatchHapticPulsing(true);
    soundAndVoice.playAlertChime();
    soundAndVoice.triggerHaptic([150, 80, 200, 80, 300]);
    setTimeout(() => setWatchHapticPulsing(false), 2000);
  };

  const nextActiveDrug = drugs.find((d) => d.morning) || drugs[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-teal-950 border border-teal-700/60 text-teal-400 text-xs font-bold flex items-center justify-center">
            4
          </span>
          <div>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              Wearable Health Sentinel & Biometric Correlation
            </h2>
            <p className="text-xs text-slate-400">
              Live vitals stream via BLE band with pharmacodynamic correlation & wrist alert simulator
            </p>
          </div>
        </div>
      </div>

      {/* Vital-to-Medication Correlation Alert (Key Clinical Feature) */}
      <div className="bg-gradient-to-r from-teal-950/70 via-slate-900 to-emerald-950/70 border border-teal-500/60 rounded-xl p-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-teal-900/80 text-teal-300 shrink-0 mt-0.5">
            <TrendingUp className="w-5 h-5 text-teal-300" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                📈 {t.clinicalCorrelation}
              </span>
              <span className="text-[10px] text-teal-400 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-700/60 font-mono">
                Pharmacodynamics Active
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-100 leading-relaxed">
              {language === 'ta' ? preset.correlationNoteTa : preset.correlationNoteEn}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Biometric Cards (Left) + Smartwatch Screen Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Side: Vitals Metrics 3-card Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Heart Rate */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                  {t.heartRate}
                </span>
                <span className="text-[10px] text-slate-500">Resting</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-white">
                  {telemetry.heartRate}
                </span>
                <span className="text-xs text-slate-400 font-mono">BPM</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Normal Sinus Rhythm</span>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  {t.bloodPressure}
                </span>
                <span className="text-[10px] text-amber-400 font-medium">Stage 1</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-white">
                  {telemetry.systolicBP}/{telemetry.diastolicBP}
                </span>
                <span className="text-xs text-slate-400 font-mono">mmHg</span>
              </div>
              <div className="mt-2 text-[10px] text-amber-300 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Pre-hypertensive marker</span>
              </div>
            </div>

            {/* Blood Oxygen SpO2 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  {t.spo2}
                </span>
                <span className="text-[10px] text-slate-500">Pulse Ox</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {telemetry.spO2}%
                </span>
                <span className="text-xs text-slate-400 font-mono">SpO2</span>
              </div>
              <div className="mt-2 text-[10px] text-teal-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Optimal Saturation</span>
              </div>
            </div>
          </div>

          {/* Real-time ECG Trace / Waveform visualizer */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Continuous Photoplethysmography (PPG) Lead-I
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Sync: {telemetry.lastSyncTime} · Battery: {telemetry.batteryLevel}%
              </span>
            </div>

            {/* Simulated ECG SVG Waveform */}
            <div className="h-14 w-full bg-slate-900/90 rounded border border-slate-800/80 overflow-hidden relative flex items-center px-2">
              <svg
                viewBox="0 0 500 50"
                className="w-full h-full stroke-emerald-400 fill-none stroke-[2]"
                preserveAspectRatio="none"
              >
                <path d="M 0 25 L 50 25 L 60 25 L 70 10 L 80 40 L 90 5 L 100 35 L 110 25 L 170 25 L 180 25 L 190 10 L 200 40 L 210 5 L 220 35 L 230 25 L 290 25 L 300 25 L 310 10 L 320 40 L 330 5 L 340 35 L 350 25 L 410 25 L 420 25 L 430 10 L 440 40 L 450 5 L 460 35 L 470 25 L 500 25" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/60 pointer-events-none" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>HRV (Heart Rate Variability): <strong className="text-slate-300 font-mono">{telemetry.hrv} ms</strong></span>
              <span>Body Temp: <strong className="text-slate-300 font-mono">{telemetry.bodyTemp}°C (98.4°F)</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: Smartwatch Screen Simulator (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="text-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Watch className="w-3.5 h-3.5 text-teal-400" />
              {t.watchSimulator}
            </span>
          </div>

          {/* Physical Watch Chassis */}
          <div className="relative">
            {/* Outer Watch Case */}
            <div
              className={`w-64 h-64 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 p-3 shadow-2xl border-4 border-slate-600 transition-all ${
                watchHapticPulsing ? 'ring-8 ring-emerald-500/50 scale-[1.03]' : ''
              }`}
            >
              {/* Rotating Crown button */}
              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-10 bg-slate-600 border border-slate-500 rounded-r-md shadow-md" />

              {/* Inner OLED Watch Face Screen */}
              <div className="w-full h-full rounded-full bg-black border-2 border-slate-800 flex flex-col items-center justify-between p-4 text-center select-none overflow-hidden relative">
                {/* Watch Top Status Bar */}
                <div className="w-full flex items-center justify-between px-2 pt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    BLE
                  </span>
                  <span className="font-mono text-slate-300">{currentTime}</span>
                  <span className="text-teal-400 font-mono">92%</span>
                </div>

                {/* Middle Next Dose Alert Card */}
                <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-2.5 w-full mx-1 space-y-1 shadow-inner">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    <BellRing className="w-3 h-3 animate-bounce" />
                    <span>{t.nextDose}</span>
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {nextActiveDrug ? nextActiveDrug.name : 'Telmisartan 40mg'}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold bg-amber-950/80 px-1 rounded inline-block">
                    {nextActiveDrug?.foodRelation === 'before_meal' ? 'Before Breakfast' : 'After Breakfast'}
                  </div>
                </div>

                {/* Bottom Vitals readout on watch */}
                <div className="w-full flex items-center justify-around px-2 pb-1 text-[11px] font-mono border-t border-slate-900 pt-1">
                  <div className="flex items-center gap-1 text-rose-400">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span>{telemetry.heartRate}</span>
                  </div>
                  <div className="text-slate-400">·</div>
                  <div className="text-teal-300">
                    <span>{telemetry.spO2}% O2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Haptic Buzz Button */}
            <div className="mt-3 text-center">
              <button
                onClick={handleSimulateWatchBuzz}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-emerald-400 border border-slate-700 transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Wrist Haptic Pulse</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
