import React, { useState } from 'react';
import {
  Activity,
  Watch,
  Pill,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  HeartPulse,
} from 'lucide-react';
import { Language, WearableTelemetry } from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';
import { wearableService } from '../services/bluetoothService';

export type AppPage = 'scan' | 'dosage' | 'reminders' | 'vitals';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  telemetry: WearableTelemetry;
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  telemetry,
  currentPage,
  onPageChange,
}) => {
  const t = TRANSLATIONS[language];
  const [connecting, setConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'warning';
  } | null>(null);

  const handleConnectWearable = async () => {
    setConnecting(true);
    setStatusMessage(null);
    try {
      const res = await wearableService.requestBluetoothDevice();
      if (res.success) {
        setStatusMessage({
          text: `🟢 ${res.message || 'Connected to Smartwatch'}`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: res.error || 'No Bluetooth device selected.',
          type: 'warning',
        });
        // If not connected, give user the option to see Vitals page where demo simulation button is
        if (currentPage !== 'vitals') {
          setTimeout(() => {
            onPageChange('vitals');
          }, 1200);
        }
      }
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setConnecting(false);
    }
  };

  const navItems: {
    id: AppPage;
    labelEn: string;
    labelTa: string;
    shortEn: string;
    shortTa: string;
    icon: React.ReactNode;
    mobileIcon: React.ReactNode;
  }[] = [
    {
      id: 'scan',
      labelEn: '1. Scan Prescription',
      labelTa: '1. மருந்துச் சீட்டு ஸ்கேன்',
      shortEn: 'Scan',
      shortTa: 'ஸ்கேன்',
      icon: <Camera className="w-4 h-4" />,
      mobileIcon: <Camera className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: 'dosage',
      labelEn: '2. Dosage & Safety',
      labelTa: '2. அளவு & பாதுகாப்பு',
      shortEn: 'Dosage',
      shortTa: 'அளவு',
      icon: <Pill className="w-4 h-4" />,
      mobileIcon: <Pill className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: 'reminders',
      labelEn: '3. Reminders & Refill',
      labelTa: '3. அலாரம் & ரீஃபில்',
      shortEn: 'Reminders',
      shortTa: 'அலாரம்',
      icon: <Clock className="w-4 h-4" />,
      mobileIcon: <Clock className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      id: 'vitals',
      labelEn: '4. Wearable Vitals',
      labelTa: '4. வாட்ச் அளவீடுகள்',
      shortEn: 'Vitals',
      shortTa: 'வாட்ச்',
      icon: <Watch className="w-4 h-4" />,
      mobileIcon: <Watch className="w-5 h-5 stroke-[2.2]" />,
    },
  ];

  return (
    <>
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        {/* Connection / Status Message Bar */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs flex items-center justify-center gap-2 font-medium border-b transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="text-center">{statusMessage.text}</span>
          </div>
        )}

        {/* Main Top Header Bar (Clean, uncluttered on both mobile and desktop) */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* MediBridge Brand Logo & Tagline */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400 border-2 border-white"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                    MediBridge
                  </span>
                  <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Clinical Grade
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden xs:block">
                  Clinical Multilingual Prescription Decoder & Vitals Sentinel
                </p>
              </div>
            </div>

            {/* Top Right Controls: Smartwatch Indicator + Language Selector */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Smartwatch Status / Connect Button */}
              {telemetry.isConnected ? (
                <div
                  onClick={() => onPageChange('vitals')}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700 shadow-xs cursor-pointer hover:bg-emerald-100 transition-colors"
                  title="Click to view full vitals telemetry"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px] sm:text-xs">
                    <Watch className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Paired:</span>
                    <span className="font-mono text-slate-900">{telemetry.heartRate} BPM</span>
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleConnectWearable}
                  disabled={connecting}
                  className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Watch className="w-3.5 h-3.5" />
                  <span>{connecting ? 'Searching...' : 'Connect Watch'}</span>
                </button>
              )}

              {/* Language Selector ([English] | [தமிழ்]) */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Switch to English"
                >
                  <span>🇬🇧</span>
                  <span className="hidden xs:inline">En</span>
                </button>
                <button
                  onClick={() => onLanguageChange('ta')}
                  className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === 'ta'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Switch to Tamil"
                >
                  <span>🇮🇳</span>
                  <span>தமிழ்</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Bar (md:flex only - REMOVED on mobile screens) */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{language === 'ta' ? item.labelTa : item.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Modern Fixed Mobile Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center py-2 shadow-lg">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-600/20' : 'text-slate-500'
                }`}
              >
                {item.mobileIcon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">
                {language === 'ta' ? item.shortTa : item.shortEn}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
