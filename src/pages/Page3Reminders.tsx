import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Pill,
  ShoppingBag,
  Plus,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Trash2,
  Edit2,
} from 'lucide-react';
import {
  Language,
  ScheduledAlarm,
  PrescribedDrug,
} from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';
import { EditAlarmModal } from '../components/EditAlarmModal';
import { AlarmTriggerModal } from '../components/AlarmTriggerModal';

interface Page3RemindersProps {
  language: Language;
  alarms: ScheduledAlarm[];
  onToggleAlarm: (id: string) => void;
  onSaveAlarm: (alarm: ScheduledAlarm) => void;
  onDeleteAlarm: (id: string) => void;
  drugs: PrescribedDrug[];
  onUpdateDrugs: (drugs: PrescribedDrug[]) => void;
  onNavigateNext: () => void;
}

export const Page3Reminders: React.FC<Page3RemindersProps> = ({
  language,
  alarms,
  onToggleAlarm,
  onSaveAlarm,
  onDeleteAlarm,
  drugs,
  onUpdateDrugs,
  onNavigateNext,
}) => {
  const t = TRANSLATIONS[language];
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<ScheduledAlarm | null>(null);
  const [activeTriggerAlarm, setActiveTriggerAlarm] = useState<ScheduledAlarm | null>(null);
  const [orderingDrugId, setOrderingDrugId] = useState<string | null>(null);

  const handleTestAlarm = () => {
    const target = alarms.find((a) => a.enabled) || alarms[0];
    if (target) {
      setActiveTriggerAlarm(target);
    }
  };

  const handleMarkTaken = (alarmId: string) => {
    const alarm = alarms.find((a) => a.id === alarmId);
    if (alarm) {
      const updated = drugs.map((drug) => {
        if (drug.id === alarm.drugId || drug.name.toLowerCase().includes(alarm.drugName.toLowerCase().split(' ')[0])) {
          return {
            ...drug,
            remainingPills: Math.max(0, drug.remainingPills - 1),
          };
        }
        return drug;
      });
      onUpdateDrugs(updated);
    }
  };

  const handleReorderPharmacy = (drugId: string) => {
    setOrderingDrugId(drugId);
    setTimeout(() => {
      const updated = drugs.map((d) => {
        if (d.id === drugId) {
          return {
            ...d,
            remainingPills: d.totalPillsPrescribed || 20,
          };
        }
        return d;
      });
      onUpdateDrugs(updated);
      setOrderingDrugId(null);
    }, 1200);
  };

  const getSlotIcon = (slot: string) => {
    switch (slot.toLowerCase()) {
      case 'morning':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'afternoon':
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      default:
        return <Clock className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
            {language === 'ta' ? 'அலாரம் & மாத்திரை இருப்பு மேலாளர்' : 'Reminders & Refill Tracker'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            {language === 'ta'
              ? 'நேரப்படி மாத்திரை அலாரங்கள் மற்றும் மாத்திரை தீரும் முன் ரீஃபில் எச்சரிக்கைகள்'
              : 'Configurable time chimes, caregiver scheduler & automated pill count tracking'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {alarms.length > 0 && (
            <button
              onClick={handleTestAlarm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer border border-slate-200"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test Chime</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingAlarm(null);
              setIsAlarmModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ta' ? 'புதிய அலாரம் சேர்க்க' : 'Add New Alarm'}</span>
          </button>
        </div>
      </div>

      {/* Alarms Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'செயலில் உள்ள அலாரங்கள்' : 'Active Dosage Alarms'}</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full font-bold">
              {alarms.filter((a) => a.enabled).length} Active
            </span>
          </h2>
        </div>

        {/* Empty state when no alarms exist */}
        {alarms.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                No Active Alarms
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You do not have any dosage alarms scheduled yet. Add a medicine reminder to stay on track.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAlarm(null);
                setIsAlarmModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine Reminder</span>
            </button>
          </div>
        ) : (
          /* List of Alarms */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`bg-white rounded-xl border p-3.5 shadow-xs transition-all flex flex-col justify-between gap-3 ${
                  alarm.enabled
                    ? 'border-slate-200 hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      {getSlotIcon(alarm.timeSlot)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          {alarm.time}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {alarm.timeSlot}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                        {alarm.drugName} • <span className="font-mono text-slate-500">{alarm.dosage}</span>
                      </h4>
                    </div>
                  </div>

                  {/* Active Toggle Switch (ON/OFF) */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={() => onToggleAlarm(alarm.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Bottom Row: Food info + Edit & Delete Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {alarm.foodRelation === 'before_meal' ? '🍽️ Before meal' : '🍽️ After meal'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Time Button */}
                    <button
                      onClick={() => {
                        setEditingAlarm(alarm);
                        setIsAlarmModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" />
                      <span>Edit Time</span>
                    </button>

                    {/* Delete Alarm Button */}
                    <button
                      onClick={() => onDeleteAlarm(alarm.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>

                    {/* Quick Mark Taken button */}
                    <button
                      onClick={() => handleMarkTaken(alarm.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Take Dose</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pharmacy Pill Stock & Auto Refill Countdown */}
      {drugs.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'ta' ? 'மருந்து இருப்பு & ரீஃபில் கண்காணிப்பு' : 'Pharmacy Pill Stock & Refill Tracker'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Auto countdown on taken dose
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {drugs.map((drug) => {
              const isLow = drug.remainingPills <= 5;
              return (
                <div
                  key={drug.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                    isLow
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{drug.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{drug.strength}</span>
                    </div>
                    {isLow && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Remaining</span>
                      <span className="font-mono font-bold text-slate-900">
                        {drug.remainingPills} / {drug.totalPillsPrescribed} pills
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              5,
                              ((drug.remainingPills || 0) / (drug.totalPillsPrescribed || 20)) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleReorderPharmacy(drug.id)}
                    disabled={orderingDrugId === drug.id}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    {orderingDrugId === drug.id ? (
                      <>
                        <RotateCw className="w-3 h-3 animate-spin text-emerald-600" />
                        <span>Ordering...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3 h-3 text-emerald-600" />
                        <span>1-Click Refill</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Button */}
      <div className="pt-2">
        <button
          onClick={onNavigateNext}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <span>{language === 'ta' ? 'வாட்ச் அளவீடுகள் பகுதிக்குச் செல்ல' : 'Go to Wearable Vitals Sentinel'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Alarm Modal */}
      <EditAlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => {
          setIsAlarmModalOpen(false);
          setEditingAlarm(null);
        }}
        language={language}
        alarm={editingAlarm}
        onSave={onSaveAlarm}
        onDelete={onDeleteAlarm}
      />

      {/* Alarm Trigger Modal for Test / Scheduled Chimes */}
      <AlarmTriggerModal
        isOpen={!!activeTriggerAlarm}
        onClose={() => setActiveTriggerAlarm(null)}
        language={language}
        alarm={activeTriggerAlarm}
        onMarkTaken={() => {
          if (activeTriggerAlarm) {
            handleMarkTaken(activeTriggerAlarm.id);
          }
          setActiveTriggerAlarm(null);
        }}
      />
    </div>
  );
};
