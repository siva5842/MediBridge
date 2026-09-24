import React, { useEffect } from 'react';
import { Bell, Watch, Check, Clock, ShieldCheck, X } from 'lucide-react';
import { Language, ScheduledAlarm } from '../types/clinical';
import { soundAndVoice } from '../services/speechService';

interface AlarmTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  alarm: ScheduledAlarm | null;
  onMarkTaken: (alarmId: string) => void;
}

export const AlarmTriggerModal: React.FC<AlarmTriggerModalProps> = ({
  isOpen,
  onClose,
  language,
  alarm,
  onMarkTaken,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundAndVoice.playAlertChime();
      soundAndVoice.triggerHaptic([200, 100, 200, 100, 400]);
    }
  }, [isOpen]);

  if (!isOpen || !alarm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Animated Alarm Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-6 text-center text-white relative">
          <div className="absolute top-3 right-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="inline-flex p-3 rounded-2xl bg-white/20 text-white ring-8 ring-white/10 mb-2 animate-bounce">
            <Bell className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-100 uppercase tracking-widest">
            <Watch className="w-3.5 h-3.5" />
            <span>Wearable Haptic Sentinel Alert</span>
          </div>

          <h2 className="text-xl font-extrabold text-white mt-1">
            Time for Scheduled Medication!
          </h2>
          <p className="text-xs text-emerald-100 font-mono mt-0.5">
            Slot: {alarm.time} · {alarm.timeSlot}
          </p>
        </div>

        {/* Alarm Medication Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
            <div className="text-lg font-bold text-slate-900">
              {alarm.drugName}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
              <span>Dosage: {alarm.dosage}</span>
              <span>·</span>
              <span className="capitalize">{alarm.foodRelation.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Please take with a full glass of water. Smartwatch haptic buzzer activated.
            </p>
          </div>

          {/* Biometric reminder confirmation */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Correlated with live resting vitals: Heart Rate 72 BPM, BP 135/88.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => {
                onMarkTaken(alarm.id);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm Dose Taken (Sync to Watch)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Snooze for 10 Minutes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
