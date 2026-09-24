import React, { useState } from 'react';
import { X, Bell, Clock, Pill, Plus } from 'lucide-react';
import { Language, PrescribedDrug } from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';

interface CustomReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSave: (drug: PrescribedDrug, alarmTimes: string[]) => void;
}

export const CustomReminderModal: React.FC<CustomReminderModalProps> = ({
  isOpen,
  onClose,
  language,
  onSave,
}) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<'Tablet' | 'Capsule' | 'Syrup' | 'Injection'>('Tablet');
  const [foodRelation, setFoodRelation] = useState<'after_meal' | 'before_meal' | 'with_meal'>('after_meal');
  const [totalPills, setTotalPills] = useState<number>(30);
  const [remainingPills, setRemainingPills] = useState<number>(30);
  const [durationDays, setDurationDays] = useState<number>(15);

  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(false);
  const [night, setNight] = useState(true);

  const [morningTime, setMorningTime] = useState('08:00 AM');
  const [afternoonTime, setAfternoonTime] = useState('02:00 PM');
  const [nightTime, setNightTime] = useState('08:30 PM');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDrug: PrescribedDrug = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      genericName: 'Custom Rx',
      strength: strength.trim() || '500mg',
      dosageForm: dosageForm as any,
      morning,
      afternoon,
      night,
      foodRelation,
      durationDays: Number(durationDays) || 10,
      totalPillsPrescribed: Number(totalPills) || 30,
      remainingPills: Number(remainingPills) || 30,
      confidenceScore: 100,
      clinicalNoteEn: 'Caregiver customized reminder.',
      clinicalNoteTa: 'பராமரிப்பாளர் அமைத்த நினைவூட்டல்.',
      verifiedByHuman: true,
    };

    const times: string[] = [];
    if (morning) times.push(morningTime);
    if (afternoon) times.push(afternoonTime);
    if (night) times.push(nightTime);

    onSave(newDrug, times);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {t.addCustomReminder}
              </h3>
              <p className="text-xs text-slate-500">
                Configure patient dose schedules, alarm slots & refill alert triggers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Drug Name & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.drugName} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metoprolol, Vitamin D3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.strength} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 50mg, 500mg"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Form & Food Relation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dosage Form
              </label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.foodRelation}
              </label>
              <select
                value={foodRelation}
                onChange={(e) => setFoodRelation(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="after_meal">{t.afterMeal}</option>
                <option value="before_meal">{t.beforeMeal}</option>
                <option value="with_meal">{t.withMeal}</option>
                <option value="empty_stomach">{t.emptyStomach}</option>
              </select>
            </div>
          </div>

          {/* Schedule Slots & Time Pickers */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Dose Time Slots & Alarms
            </span>

            <div className="space-y-2.5">
              {/* Morning */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={morning}
                    onChange={(e) => setMorning(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🌅 {t.morning} Dose</span>
                </label>
                {morning && (
                  <input
                    type="text"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono w-28 text-center"
                    placeholder="08:00 AM"
                  />
                )}
              </div>

              {/* Afternoon */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={afternoon}
                    onChange={(e) => setAfternoon(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>☀️ {t.afternoon} Dose</span>
                </label>
                {afternoon && (
                  <input
                    type="text"
                    value={afternoonTime}
                    onChange={(e) => setAfternoonTime(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono w-28 text-center"
                    placeholder="02:00 PM"
                  />
                )}
              </div>

              {/* Night */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={night}
                    onChange={(e) => setNight(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🌙 {t.night} Dose</span>
                </label>
                {night && (
                  <input
                    type="text"
                    value={nightTime}
                    onChange={(e) => setNightTime(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono w-28 text-center"
                    placeholder="08:30 PM"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Inventory Tracking */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pills In Stock
              </label>
              <input
                type="number"
                min="1"
                value={remainingPills}
                onChange={(e) => setRemainingPills(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Prescribed
              </label>
              <input
                type="number"
                min="1"
                value={totalPills}
                onChange={(e) => setTotalPills(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Schedule & Alarm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
