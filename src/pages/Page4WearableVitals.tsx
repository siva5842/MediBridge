import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Wind,
  Watch,
  BellRing,
  ArrowLeft,
  Radio,
  Link,
  FlaskConical,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Language,
  WearableTelemetry,
  PrescribedDrug,
} from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';
import { soundAndVoice } from '../services/speechService';
import { wearableService } from '../services/bluetoothService';

interface Page4WearableVitalsProps {
  language: Language;
  telemetry: WearableTelemetry;
  drugs: PrescribedDrug[];
  onNavigateBack: () => void;
}

export const Page4WearableVitals: React.FC<Page4WearableVitalsProps> = ({
  language,
  telemetry,
  drugs,
  onNavigateBack,
}) => {
  const t = TRANSLATIONS[language];
  const [currentTime, setCurrentTime] = useState<string>('08:15 AM');
  const [hapticPulsing, setHapticPulsing] = useState<boolean>(false);
  const [connecting, setConnecting] = useState(false);
  const [bluetoothError, setBluetoothError] = useState<string | null>(null);

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
    setHapticPulsing(true);
    soundAndVoice.playAlertChime();
    soundAndVoice.triggerHaptic([150, 80, 200, 80, 300]);
    setTimeout(() => setHapticPulsing(false), 2000);
  };

  // Real Web Bluetooth Connection Trigger
  const handleConnectWearable = async () => {
    setConnecting(true);
    setBluetoothError(null);
    try {
      const result = await wearableService.requestBluetoothDevice();
      if (!result.success) {
        setBluetoothError(
          result.error ||
            'No Bluetooth device selected. Tap below if you want to use Demo Simulation mode.'
        );
      }
    } finally {
      setConnecting(false);
    }
  };

  // Explicit Demo Simulation Mode Trigger
  const handleStartDemoSimulation = () => {
    setBluetoothError(null);
    wearableService.startDemoSimulation();
  };

  const handleDisconnectWearable = () => {
    setBluetoothError(null);
    wearableService.disconnect();
  };

  const nextActiveDrug = drugs.find((d) => d.morning) || drugs[0];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
            {language === 'ta' ? 'ஸ்மார்ட்வாட்ச் & உடல்நிலை அளவீடுகள்' : 'Wearable Vitals & Smartwatch Sentinel'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            {language === 'ta'
              ? 'நேரலை உடலியல் அளவீடுகள், இரத்த அழுத்தம் மற்றும் மருந்து செயல்திறன் தொடர்பு'
              : 'Real-time telemetry stream correlating vitals with scheduled medication'}
          </p>
        </div>

        {/* Smartwatch Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {telemetry.isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Watch className="w-3.5 h-3.5 text-emerald-600" />
              <span>🟢 {telemetry.deviceName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>⚪ Smartwatch Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* DISCONNECTED STATE CARD (WHEN NOT CONNECTED) */}
      {!telemetry.isConnected && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
            <Watch className="w-8 h-8 stroke-[1.8]" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No Wearable Connected
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Tap below to scan for nearby Bluetooth smartwatches (Heart Rate, BLE bands) or activate demo simulation.
            </p>
          </div>

          {/* Bluetooth Error Banner if cancelled or unsupported */}
          {bluetoothError && (
            <div className="max-w-lg mx-auto bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-xs flex items-start gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-amber-950">Bluetooth Notice:</p>
                <p>{bluetoothError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons: Primary Web Bluetooth + Explicit Secondary Demo Simulation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {/* Primary: Real Web Bluetooth Trigger */}
            <button
              onClick={handleConnectWearable}
              disabled={connecting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Link className="w-4 h-4" />
              <span>{connecting ? 'Scanning BLE Devices...' : '🔗 Connect Smartwatch'}</span>
            </button>

            {/* Explicit Secondary: Demo Simulation Mode */}
            <button
              onClick={handleStartDemoSimulation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition-all cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-teal-600" />
              <span>🧪 Start Demo Simulation Mode</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5" />
            <span>Web Bluetooth works in Chrome, Edge, and Android browsers.</span>
          </div>
        </div>
      )}

      {/* Live Vitals Metrics Grid (Shows real/simulated telemetry when connected, or blank '--' placeholder when disconnected) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Heart Rate Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">HEART RATE</span>
            <div className={`p-2 rounded-xl ${telemetry.isConnected ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
              <Heart className={`w-4 h-4 ${telemetry.isConnected ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              {telemetry.isConnected ? telemetry.heartRate : '--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">BPM</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${telemetry.isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>{telemetry.isConnected ? 'Normal Resting Rhythm' : 'Awaiting sensor connection'}</span>
          </div>
        </div>

        {/* Blood Pressure Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">BLOOD PRESSURE</span>
            <div className={`p-2 rounded-xl ${telemetry.isConnected ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-400'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              {telemetry.isConnected ? `${telemetry.systolicBP}/${telemetry.diastolicBP}` : '--/--'}
            </span>
            <span className="text-xs font-semibold text-slate-500">mmHg</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${telemetry.isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>{telemetry.isConnected ? 'Arterial Pressure Correlated' : 'Awaiting cuff/sensor data'}</span>
          </div>
        </div>

        {/* SpO2 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">OXYGEN SATURATION</span>
            <div className={`p-2 rounded-xl ${telemetry.isConnected ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              {telemetry.isConnected ? `${telemetry.spO2}%` : '--%'}
            </span>
            <span className="text-xs font-semibold text-slate-500">SpO2</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${telemetry.isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>{telemetry.isConnected ? 'Optimal Peripheral Oxygenation' : 'Awaiting sensor placement'}</span>
          </div>
        </div>
      </div>

      {/* Smartwatch Watchface Companion & Haptic Sentinel (Only shown when connected) */}
      {telemetry.isConnected && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left flex-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                <Radio className="w-3.5 h-3.5 text-teal-600" />
                Live Wrist Display & Haptic Sentinel
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Active WearOS & Apple Watch Companion
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                Paired with <strong className="text-slate-800">{telemetry.deviceName}</strong>. Simulates real-time vibration alerts, dose chimes, and wrist reminders.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <button
                  onClick={handleSimulateWatchBuzz}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Wrist Vibration Alert</span>
                </button>

                <button
                  onClick={handleDisconnectWearable}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer border border-rose-200"
                >
                  Disconnect Watch
                </button>
              </div>
            </div>

            {/* Simulated Apple/WearOS Watch Face */}
            <div className="relative shrink-0">
              <div
                className={`w-48 h-56 rounded-[38px] bg-slate-950 p-3 shadow-xl border-4 border-slate-800 flex flex-col justify-between text-white transition-all ${
                  hapticPulsing ? 'ring-4 ring-emerald-500 animate-pulse' : ''
                }`}
              >
                {/* Watch Status Header */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 px-1">
                  <span className="font-mono">{currentTime}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="font-mono text-[9px] text-emerald-300">BLE</span>
                  </div>
                </div>

                {/* Watch Center */}
                <div className="text-center py-2 space-y-1">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                    <Heart className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 leading-tight">
                    {telemetry.heartRate} <span className="text-[10px] text-slate-400">BPM</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    BP {telemetry.systolicBP}/{telemetry.diastolicBP}
                  </div>
                </div>

                {/* Next Medicine Dose Alert on Watch Screen */}
                <div className="bg-slate-900/90 rounded-2xl p-2 border border-slate-800 text-center">
                  <span className="text-[8px] uppercase tracking-wider text-teal-400 font-bold block">
                    Next Dose
                  </span>
                  <div className="text-[10px] font-bold text-white truncate">
                    {nextActiveDrug ? nextActiveDrug.name : 'All doses taken'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Reminders Navigation */}
      <div className="pt-2">
        <button
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'அலாரம் பகுதிக்குத் திரும்ப' : 'Back to Reminders & Refill Tracker'}</span>
        </button>
      </div>
    </div>
  );
};
