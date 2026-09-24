import React, { useState, useEffect, useRef } from 'react';
import { X, Pill, Clock, Check, Trash2, Search, Zap, CheckCircle2 } from 'lucide-react';
import { Language, PrescribedDrug } from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';

interface PopularMedicinePreset {
  name: string;
  genericName: string;
  strength: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops';
  foodRelation: 'after_meal' | 'before_meal' | 'with_meal' | 'empty_stomach';
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  durationDays: number;
  totalPills: number;
  remainingPills: number;
  category: string;
}

export const POPULAR_MEDICINES: PopularMedicinePreset[] = [
  {
    name: 'Dolo 650',
    genericName: 'Paracetamol',
    strength: '650mg',
    dosageForm: 'Tablet',
    foodRelation: 'after_meal',
    morning: true,
    afternoon: false,
    night: true,
    durationDays: 5,
    totalPills: 10,
    remainingPills: 10,
    category: 'Fever & Pain',
  },
  {
    name: 'Azithral 500',
    genericName: 'Azithromycin',
    strength: '500mg',
    dosageForm: 'Tablet',
    foodRelation: 'before_meal',
    morning: true,
    afternoon: false,
    night: false,
    durationDays: 5,
    totalPills: 5,
    remainingPills: 5,
    category: 'Antibiotic',
  },
  {
    name: 'Metformin 500',
    genericName: 'Metformin Hydrochloride',
    strength: '500mg',
    dosageForm: 'Tablet',
    foodRelation: 'after_meal',
    morning: true,
    afternoon: false,
    night: true,
    durationDays: 30,
    totalPills: 60,
    remainingPills: 60,
    category: 'Diabetes',
  },
  {
    name: 'Telma 40',
    genericName: 'Telmisartan',
    strength: '40mg',
    dosageForm: 'Tablet',
    foodRelation: 'before_meal',
    morning: true,
    afternoon: false,
    night: false,
    durationDays: 30,
    totalPills: 30,
    remainingPills: 30,
    category: 'Blood Pressure',
  },
  {
    name: 'Pantocid 40',
    genericName: 'Pantoprazole',
    strength: '40mg',
    dosageForm: 'Tablet',
    foodRelation: 'before_meal',
    morning: true,
    afternoon: false,
    night: false,
    durationDays: 15,
    totalPills: 15,
    remainingPills: 15,
    category: 'Acidity / Antacid',
  },
  {
    name: 'Cetirizine 10',
    genericName: 'Cetirizine HCl',
    strength: '10mg',
    dosageForm: 'Tablet',
    foodRelation: 'after_meal',
    morning: false,
    afternoon: false,
    night: true,
    durationDays: 7,
    totalPills: 7,
    remainingPills: 7,
    category: 'Antihistamine / Allergy',
  },
  {
    name: 'Augmentin 625',
    genericName: 'Amoxicillin + Clavulanic Acid',
    strength: '625mg',
    dosageForm: 'Tablet',
    foodRelation: 'after_meal',
    morning: true,
    afternoon: false,
    night: true,
    durationDays: 7,
    totalPills: 14,
    remainingPills: 14,
    category: 'Antibiotic',
  },
  {
    name: 'Montair-LC',
    genericName: 'Montelukast + Levocetirizine',
    strength: '10mg / 5mg',
    dosageForm: 'Tablet',
    foodRelation: 'after_meal',
    morning: false,
    afternoon: false,
    night: true,
    durationDays: 10,
    totalPills: 10,
    remainingPills: 10,
    category: 'Asthma & Cold',
  },
];

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
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops'>('Tablet');
  const [foodRelation, setFoodRelation] = useState<'after_meal' | 'before_meal' | 'with_meal' | 'empty_stomach'>('after_meal');
  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(false);
  const [night, setNight] = useState(true);
  const [durationDays, setDurationDays] = useState<number>(10);
  const [remainingPills, setRemainingPills] = useState<number>(20);
  const [totalPills, setTotalPills] = useState<number>(20);

  // Autocomplete state
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (medicine) {
        setName(medicine.name);
        setGenericName(medicine.genericName || medicine.name);
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
        setGenericName('');
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
      setShowDropdown(false);
    }
  }, [isOpen, medicine]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: PopularMedicinePreset) => {
    setName(preset.name);
    setGenericName(preset.genericName);
    setStrength(preset.strength);
    setDosageForm(preset.dosageForm);
    setFoodRelation(preset.foodRelation);
    setMorning(preset.morning);
    setAfternoon(preset.afternoon);
    setNight(preset.night);
    setDurationDays(preset.durationDays);
    setRemainingPills(preset.remainingPills);
    setTotalPills(preset.totalPills);
    setShowDropdown(false);
  };

  const filteredMedicines = POPULAR_MEDICINES.filter(
    (m) =>
      m.name.toLowerCase().includes(name.toLowerCase()) ||
      m.genericName.toLowerCase().includes(name.toLowerCase()) ||
      m.category.toLowerCase().includes(name.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedDrug: PrescribedDrug = {
      id: medicine ? medicine.id : `drug-${Date.now()}`,
      name: name.trim(),
      genericName: genericName.trim() || name.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {medicine ? 'Edit Medicine & Timing' : 'Add Medicine Manually'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                1-tap quick pick or custom enter drug dosage & schedules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Pick Pill Carousel Bar */}
        <div className="bg-emerald-50/60 border-b border-emerald-100 px-5 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>1-Tap Quick-Pick Common Medicines:</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Auto-fills all fields</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {POPULAR_MEDICINES.slice(0, 6).map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-600 hover:text-white text-slate-800 border border-emerald-200 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>💊</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Medicine Name with Autocomplete Search Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Medicine / Brand Name *</span>
                  <span className="text-[10px] font-normal text-slate-400">Type for suggestions</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dolo 650, Metformin, Telma 40"
                    value={name}
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => {
                      setName(e.target.value);
                      setShowDropdown(true);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Strength (mg) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500mg, 650mg"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* Fast Autocomplete Dropdown */}
            {showDropdown && filteredMedicines.length > 0 && (
              <div className="absolute left-0 right-0 sm:right-1/3 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Popular Common Medicines
                </div>
                {filteredMedicines.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => handleSelectPreset(m)}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{m.name}</span>
                        <span className="text-[10px] font-normal text-slate-500">({m.genericName})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.strength} • {m.dosageForm} • {m.category}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Pick
                    </span>
                  </button>
                ))}
              </div>
            )}
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Daily Dosing Schedule (Tap to toggle)
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
