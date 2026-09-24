import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Pill,
  ShoppingBag,
  Plus,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sun,
  Sunset,
  Moon,
  Truck,
} from 'lucide-react';
import {
  Language,
  ScheduledAlarm,
  PrescribedDrug,
} from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';
import { soundAndVoice } from '../services/speechService';
import { CustomReminderModal } from './CustomReminderModal';
import { AlarmTriggerModal } from './AlarmTriggerModal';

interface ModuleRemindersInventoryProps {
  language: Language;
  alarms: ScheduledAlarm[];
  onToggleAlarm: (id: string) => void;
  drugs: PrescribedDrug[];
  onUpdateDrugs: (drugs: PrescribedDrug[]) => void;
  onAddCustomReminder: (drug: PrescribedDrug, alarmTimes: string[]) => void;
}

export const ModuleRemindersInventory: React.FC<ModuleRemindersInventoryProps> = ({
  language,
  alarms,
  onToggleAlarm,
  drugs,
  onUpdateDrugs,
  onAddCustomReminder,
}) => {
  const t = TRANSLATIONS[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTriggerAlarm, setActiveTriggerAlarm] = useState<ScheduledAlarm | null>(null);
  const [orderedRefillDrugId, setOrderedRefillDrugId] = useState<string | null>(null);

  const handleTestAlarm = () => {
    // Select the first active alarm or construct a representative one
    const target = alarms.find((a) => a.enabled) || alarms[0] || {
      id: 'test-alarm',
      drugId: drugs[0]?.id || '1',
      drugName: drugs[0]?.name || 'Telmisartan 40mg',
      dosage: drugs[0]?.strength || '40mg',
      timeSlot: 'Morning',
      time: '08:00 AM',
      foodRelation: 'after_meal',
      enabled: true,
    };

    setActiveTriggerAlarm(target);
  };

  const handleMarkTaken = (alarmId: string) => {
    // Decrement pill count for associated drug
    const alarm = alarms.find((a) => a.id === alarmId);
    if (alarm) {
      const updatedDrugs = drugs.map((drug) => {
        if (drug.id === alarm.drugId || drug.name.includes(alarm.drugName.split(' ')[0])) {
          return {
            ...drug,
            remainingPills: Math.max(0, drug.remainingPills - 1),
          };
        }
        return drug;
      });
      onUpdateDrugs(updatedDrugs);
    }
  };

  const handleOrderPharmacyRefill = (drugId: string) => {
    setOrderedRefillDrugId(drugId);
    setTimeout(() => {
      // simulate 1-click refill delivered + restocked
      const updated = drugs.map((d) => {
        if (d.id === drugId) {
          return {
            ...d,
            remainingPills: d.totalPillsPrescribed,
          };
        }
        return d;
      });
      onUpdateDrugs(updated);
      setOrderedRefillDrugId(null);
    }, 1800);
  };

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'Morning':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'Afternoon':
        return <Sunset className="w-3.5 h-3.5 text-orange-400" />;
      case 'Night':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-xs font-bold flex items-center justify-center">
            3
          </span>
          <div>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              Dual-Mode Reminders & Pill Inventory Sentinel
            </h2>
            <p className="text-xs text-slate-400">
              Synchronized smart alarms, wearable haptic alerts, and pharmacy refill countdown
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Test Alarm & Wearable Haptic Button */}
          <button
            onClick={handleTestAlarm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02]"
          >
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>{t.testAlarmHaptic}</span>
          </button>

          {/* Add / Edit Custom Medicine Reminder */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.addCustomReminder}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Alarms List + Inventory Tracker) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Time-Based Alarms */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.timeAlarms} ({alarms.filter((a) => a.enabled).length} Active)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-syncs to BLE Band
            </span>
          </div>

          <div className="space-y-2">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  alarm.enabled
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getSlotIcon(alarm.timeSlot)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {alarm.drugName}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40 font-mono">
                        {alarm.dosage}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-slate-300 font-semibold">{alarm.time}</span>
                      <span>·</span>
                      <span className="capitalize">{alarm.foodRelation.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className="text-slate-500">{alarm.timeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* ON / OFF Switch */}
                <button
                  onClick={() => onToggleAlarm(alarm.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    alarm.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={alarm.enabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pill Inventory & Refill Alert Engine */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.pillInventory}</span>
            </span>
            <span className="text-[11px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
              Low Stock Countdown
            </span>
          </div>

          <div className="space-y-2.5">
            {drugs.map((drug) => {
              const dailyCount =
                (drug.morning ? 1 : 0) +
                (drug.afternoon ? 1 : 0) +
                (drug.night ? 1 : 0) || 1;
              const daysLeft = Math.floor(drug.remainingPills / dailyCount);
              const percentage = Math.min(
                100,
                Math.round((drug.remainingPills / drug.totalPillsPrescribed) * 100)
              );
              const isUrgent = daysLeft <= 3;
              const isOrdering = orderedRefillDrugId === drug.id;

              return (
                <div
                  key={drug.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isUrgent
                      ? 'bg-amber-950/30 border-amber-700/60 shadow-sm'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {drug.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {drug.strength}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-200">
                          {drug.remainingPills} {t.tabletsRemaining}
                        </span>{' '}
                        ({daysLeft} {t.daysRemaining})
                      </div>
                    </div>

                    {/* Refill Action Button */}
                    {isUrgent && (
                      <button
                        onClick={() => handleOrderPharmacyRefill(drug.id)}
                        disabled={isOrdering}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-all"
                      >
                        {isOrdering ? (
                          <>
                            <RotateCw className="w-3 h-3 animate-spin" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>{t.orderRefill}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUrgent ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {isUrgent && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-300 font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>
                          🛒 {t.refillWarning}: Only {daysLeft} days supply remaining. Refill by Saturday!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
        onSave={onAddCustomReminder}
      />

      <AlarmTriggerModal
        isOpen={!!activeTriggerAlarm}
        onClose={() => setActiveTriggerAlarm(null)}
        language={language}
        alarm={activeTriggerAlarm}
        onMarkTaken={handleMarkTaken}
      />
    </div>
  );
};
