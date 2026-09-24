import React, { useState, useEffect } from 'react';
import { X, Clock, Bell, Check, Trash2 } from 'lucide-react';
import { Language, ScheduledAlarm } from '../types/clinical';

interface EditAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  alarm: ScheduledAlarm | null; // null means adding a new alarm
  onSave: (alarm: ScheduledAlarm) => void;
  onDelete?: (id: string) => void;
}

export const EditAlarmModal: React.FC<EditAlarmModalProps> = ({
  isOpen,
  onClose,
  language,
  alarm,
  onSave,
  onDelete,
}) => {
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Night' | 'Custom'>('Morning');
  const [foodRelation, setFoodRelation] = useState<'before_meal' | 'after_meal' | 'with_meal'>('after_meal');

  useEffect(() => {
    if (isOpen) {
      if (alarm) {
        setDrugName(alarm.drugName);
        setDosage(alarm.dosage);
        setTime(alarm.time);
        setTimeSlot(alarm.timeSlot);
        setFoodRelation(alarm.foodRelation);
      } else {
        setDrugName('');
        setDosage('1 Tablet');
        setTime('08:00 AM');
        setTimeSlot('Morning');
        setFoodRelation('after_meal');
      }
    }
  }, [isOpen, alarm]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    const updatedAlarm: ScheduledAlarm = {
      id: alarm ? alarm.id : `alarm-${Date.now()}`,
      drugId: alarm?.drugId || `custom-${Date.now()}`,
      drugName: drugName.trim(),
      dosage: dosage.trim() || '1 Tablet',
      timeSlot,
      time: time.trim() || '08:00 AM',
      foodRelation,
      enabled: alarm ? alarm.enabled : true,
    };

    onSave(updatedAlarm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {alarm ? 'Edit Dose Alarm Time' : 'Add New Dose Alarm'}
              </h3>
              <p className="text-xs text-slate-500">
                Set alarm time, timing slot & smartwatch chime triggers
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Paracetamol, Metformin"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dosage / Strength
              </label>
              <input
                type="text"
                placeholder="e.g. 500mg, 1 Tab"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alarm Time *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 08:00 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono text-center focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Morning">🌅 Morning</option>
                <option value="Afternoon">☀️ Afternoon / Noon</option>
                <option value="Night">🌙 Night</option>
                <option value="Custom">⏰ Custom Slot</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Food Instruction
              </label>
              <select
                value={foodRelation}
                onChange={(e) => setFoodRelation(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="after_meal">After Meal</option>
                <option value="before_meal">Before Meal</option>
                <option value="with_meal">With Meal</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            {alarm && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(alarm.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
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
                <span>{alarm ? 'Save Alarm' : 'Add Alarm'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
