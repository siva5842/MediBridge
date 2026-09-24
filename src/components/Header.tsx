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
  RotateCcw,
  Database,
  Trash2,
  AlertTriangle,
  X,
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
  onResetAllData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  telemetry,
  currentPage,
  onPageChange,
  onResetAllData,
}) => {
  const t = TRANSLATIONS[language];
  const [connecting, setConnecting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    if (onResetAllData) {
      onResetAllData();
      setStatusMessage({
        text: 'Database cleared: All data reset to clean state.',
        type: 'success',
      });
      setTimeout(() => setStatusMessage(null), 4000);
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

        {/* Main Top Header Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* MediBridge Brand Logo & Tagline */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400 border-2 border-white"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                    MediBridge
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Clinical Grade
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden md:block">
                  Clinical Multilingual Prescription Decoder & Vitals Sentinel
                </p>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Database Synchronized Status Badge */}
              <div
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium select-none"
                title="All changes are automatically saved to persistent localStorage"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>💾 Database: Synchronized (Local)</span>
              </div>

              {/* Mobile Compact Sync Badge */}
              <div
                className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-medium"
                title="Saved to Local Storage"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>💾 Synced</span>
              </div>

              {/* Reset All Data Button */}
              {onResetAllData && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 border border-slate-200 text-xs text-slate-600 font-medium transition-colors cursor-pointer"
                  title="Clear all local data and reset to clean slate"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset All Data</span>
                  <span className="md:hidden">Reset</span>
                </button>
              )}

              {/* Smartwatch Status / Connect Button */}
              {telemetry.isConnected ? (
                <div
                  onClick={() => onPageChange('vitals')}
                  className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700 shadow-xs cursor-pointer hover:bg-emerald-100 transition-colors"
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
                  <span className="hidden xs:inline">{connecting ? 'Searching...' : 'Connect Watch'}</span>
                  <span className="xs:hidden">{connecting ? '...' : 'Watch'}</span>
                </button>
              )}

              {/* Language Selector ([English] | [தமிழ்]) */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
                  className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
          <div className="mt-2.5 pt-2 border-t border-slate-100 hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer ${
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {language === 'ta' ? 'அனைத்து தரவுகளையும் அழிக்கவா?' : 'Reset All Local Data?'}
                </h3>
              </div>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'ta'
                ? 'உங்கள் உலாவியில் சேமிக்கப்பட்ட நோயாளி விபரங்கள், பரிந்துரைக்கப்பட்ட மருந்துகள், அலாரங்கள் மற்றும் ஸ்மார்ட்வாட்ச் இணைப்புகள் அனைத்தும் முழுமையாக நீக்கப்படும். இதை மீட்டெடுக்க முடியாது.'
                : 'This will permanently erase all saved patient details, decoded prescriptions, reminder alarms, pill inventory, and smartwatch connections from your browser local storage.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {language === 'ta' ? 'ரத்து செய்க' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'ta' ? 'ஆம், அனைத்தையும் அழி' : 'Yes, Reset All Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
