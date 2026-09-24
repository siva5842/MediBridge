import React, { useState, useEffect } from 'react';
import { X, Pill, Clock, Check, Trash2 } from 'lucide-react';
import { Language, PrescribedDrug } from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';

interface EditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  medicine: PrescribedDrug | null; // null means adding a new medicine
  onSave: (drug: PrescribedDrug) => void;
  onDelete?: (id: string) => void;
}

export const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  isOpen,
  onClose,
  language,
  medicine,
  onSave,
  onDelete,
}) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops'>('Tablet');
  const [foodRelation, setFoodRelation] = useState<'after_meal' | 'before_meal' | 'with_meal' | 'empty_stomach'>('after_meal');
  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(false);
  const [night, setNight] = useState(true);
  const [durationDays, setDurationDays] = useState<number>(10);
  const [remainingPills, setRemainingPills] = useState<number>(20);
  const [totalPills, setTotalPills] = useState<number>(20);

  useEffect(() => {
    if (isOpen) {
      if (medicine) {
        setName(medicine.name);
        setStrength(medicine.strength);
        setDosageForm(medicine.dosageForm);
        setFoodRelation(medicine.foodRelation);
        setMorning(medicine.morning);
        setAfternoon(medicine.afternoon);
        setNight(medicine.night);
        setDurationDays(medicine.durationDays || 10);
        setRemainingPills(medicine.remainingPills ?? 20);
        setTotalPills(medicine.totalPillsPrescribed ?? 20);
      } else {
        setName('');
        setStrength('500mg');
        setDosageForm('Tablet');
        setFoodRelation('after_meal');
        setMorning(true);
        setAfternoon(false);
        setNight(true);
        setDurationDays(10);
        setRemainingPills(20);
        setTotalPills(20);
      }
    }
  }, [isOpen, medicine]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedDrug: PrescribedDrug = {
      id: medicine ? medicine.id : `drug-${Date.now()}`,
      name: name.trim(),
      genericName: medicine?.genericName || name.trim(),
      strength: strength.trim() || '500mg',
      dosageForm,
      foodRelation,
      morning,
      afternoon,
      night,
      durationDays: Number(durationDays) || 7,
      totalPillsPrescribed: Number(totalPills) || 20,
      remainingPills: Number(remainingPills) || 20,
      confidenceScore: medicine?.confidenceScore ?? 100,
      clinicalNoteEn: medicine?.clinicalNoteEn || 'Custom entered medication.',
      clinicalNoteTa: medicine?.clinicalNoteTa || 'நேரடியாக உள்ளிடப்பட்ட மருந்து.',
      verifiedByHuman: true,
    };

    onSave(updatedDrug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {medicine ? 'Edit Medicine & Timing' : 'Add Medicine Manually'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure dosage strength, meal relationship & daily dosing slots
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Medicine Name & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol, Metformin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Strength (mg) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500mg, 10mg"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Tablet">Tablet (மாத்திரை)</option>
                <option value="Capsule">Capsule (கேப்சூல்)</option>
                <option value="Syrup">Syrup (மருந்து திரவம்)</option>
                <option value="Injection">Injection (ஊசி)</option>
                <option value="Drops">Drops (சொட்டு மருந்து)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Relation
              </label>
              <select
                value={foodRelation}
                onChange={(e) => setFoodRelation(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="after_meal">🍽️ After Food (உணவுக்குப் பின்)</option>
                <option value="before_meal">🍽️ Before Food (உணவுக்கு முன்)</option>
                <option value="with_meal">🍽️ With Food (உணவோடு)</option>
                <option value="empty_stomach">🍽️ Empty Stomach (வெறும் வயிற்றில்)</option>
              </select>
            </div>
          </div>

          {/* Daily Timing (Morning / Noon / Night) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Daily Timing Slots (Morning / Noon / Night)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMorning(!morning)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  morning
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🌅</span>
                <span>Morning</span>
              </button>

              <button
                type="button"
                onClick={() => setAfternoon(!afternoon)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  afternoon
                    ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>☀️</span>
                <span>Noon</span>
              </button>

              <button
                type="button"
                onClick={() => setNight(!night)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  night
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🌙</span>
                <span>Night</span>
              </button>
            </div>
          </div>

          {/* Inventory & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pills In Stock
              </label>
              <input
                type="number"
                min="0"
                value={remainingPills}
                onChange={(e) => setRemainingPills(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            {medicine && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(medicine.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Medicine</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{medicine ? 'Save Changes' : 'Add Medicine'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
