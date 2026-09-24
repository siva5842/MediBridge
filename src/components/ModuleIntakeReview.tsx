import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  Eye,
  FileText,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { Language, PrescribedDrug, ClinicalPreset } from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';

interface ModuleIntakeReviewProps {
  language: Language;
  preset: ClinicalPreset;
  drugs: PrescribedDrug[];
  onDrugsChange: (drugs: PrescribedDrug[]) => void;
  onCustomImageUpload: (file: File) => void;
}

export const ModuleIntakeReview: React.FC<ModuleIntakeReviewProps> = ({
  language,
  preset,
  drugs,
  onDrugsChange,
  onCustomImageUpload,
}) => {
  const t = TRANSLATIONS[language];
  const [isLocked, setIsLocked] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (id: string, field: keyof PrescribedDrug, value: any) => {
    const updated = drugs.map((drug) => {
      if (drug.id === id) {
        return {
          ...drug,
          [field]: value,
          verifiedByHuman: true,
        };
      }
      return drug;
    });
    onDrugsChange(updated);
  };

  const handleAddDrug = () => {
    const newDrug: PrescribedDrug = {
      id: `custom-drug-${Date.now()}`,
      name: 'New Medication',
      genericName: 'Salt / Active Ingredient',
      strength: '500mg',
      dosageForm: 'Tablet',
      morning: true,
      afternoon: false,
      night: true,
      foodRelation: 'after_meal',
      durationDays: 7,
      totalPillsPrescribed: 14,
      remainingPills: 14,
      confidenceScore: 100.0,
      clinicalNoteEn: 'Caregiver added medication.',
      clinicalNoteTa: 'பராமரிப்பாளர் சேர்த்த மருந்து.',
      verifiedByHuman: true,
    };
    onDrugsChange([...drugs, newDrug]);
  };

  const handleDeleteDrug = (id: string) => {
    onDrugsChange(drugs.filter((d) => d.id !== id));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onCustomImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onCustomImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              {t.humanInTheLoop}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.humanInTheLoopSub}
          </p>
        </div>

        {/* View Document thumbnail button */}
        <button
          onClick={() => setShowImagePreview(!showImagePreview)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-300 transition-colors self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showImagePreview ? 'Hide Original Document' : 'View Original Prescription'}</span>
        </button>
      </div>

      {/* Accuracy & Confidence Clinical Bar */}
      <div className="bg-slate-950/70 border border-emerald-900/40 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">
                {t.confidenceScore}:
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {preset.confidenceScore.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-500">· High Clinical Reliability</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-teal-400" />
              <span>{preset.pharmacopeiaSource}</span>
            </p>
          </div>
        </div>

        {/* Patient & Doctor metadata */}
        <div className="text-left md:text-right border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
          <div className="text-xs font-semibold text-slate-200">
            {preset.patientName}
          </div>
          <div className="text-[11px] text-slate-400">
            {preset.doctorName} ({preset.doctorSpecialty})
          </div>
        </div>
      </div>

      {/* Expanded Document Image Preview (if toggled) */}
      {showImagePreview && (
        <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              Prescription OCR Scan (with detected bounding boxes)
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              98.4% Optical Character Matching
            </span>
          </div>

          <div className="relative max-h-56 overflow-hidden rounded border border-slate-800 bg-slate-900 flex items-center justify-center">
            <img
              src={preset.prescriptionImage}
              alt="Prescription Scan"
              className="object-cover w-full h-full max-h-56 opacity-85 hover:opacity-100 transition-opacity"
            />
            {/* Visual overlay bounding box simulation */}
            <div className="absolute top-4 left-6 border border-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
              [Rx: Aspirin 81mg tab - Conf 99.1%]
            </div>
            <div className="absolute top-16 left-6 border border-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
              [Rx: Ibuprofen 400mg tab - Conf 98.7%]
            </div>
            <div className="absolute bottom-6 left-6 border border-teal-400/80 bg-teal-500/10 px-2 py-0.5 rounded text-[10px] font-mono text-teal-300">
              [Dr. Signature Verified · Cardiology Registry]
            </div>
          </div>
        </div>
      )}

      {/* Intake Dropzone & Camera Controls */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`border-2 border-dashed rounded-lg p-3.5 text-center transition-all ${
          dragOver
            ? 'border-emerald-500 bg-emerald-950/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Handwritten Rx / Lab PDF</span>
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-950/90 hover:bg-teal-900 border border-teal-800/60 text-teal-200 text-xs font-semibold transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.useCamera}</span>
          </button>

          <span className="text-[11px] text-slate-500">
            or drag & drop prescription photo here
          </span>
        </div>
      </div>

      {/* Human-in-the-Loop Review Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Extracted Medications ({drugs.length})
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              Pharmacist Editable
            </span>
          </div>

          <button
            onClick={handleAddDrug}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-emerald-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addDrug}</span>
          </button>
        </div>

        {/* Responsive Table / Card Grid */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">{t.drugName}</th>
                <th className="py-2.5 px-2">{t.strength}</th>
                <th className="py-2.5 px-2 text-center">{t.morning}</th>
                <th className="py-2.5 px-2 text-center">{t.afternoon}</th>
                <th className="py-2.5 px-2 text-center">{t.night}</th>
                <th className="py-2.5 px-3">{t.foodRelation}</th>
                <th className="py-2.5 px-2 text-center">{t.confidenceScore}</th>
                <th className="py-2.5 px-2 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {drugs.map((drug) => (
                <tr key={drug.id} className="hover:bg-slate-900/50 transition-colors">
                  {/* Medicine Name & Salt */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      disabled={isLocked}
                      value={drug.name}
                      onChange={(e) => handleFieldChange(drug.id, 'name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-medium focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Salt: {drug.genericName}
                    </div>
                  </td>

                  {/* Strength */}
                  <td className="py-2 px-2 w-24">
                    <input
                      type="text"
                      disabled={isLocked}
                      value={drug.strength}
                      onChange={(e) => handleFieldChange(drug.id, 'strength', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center focus:border-emerald-500 focus:outline-none"
                    />
                  </td>

                  {/* Morning Toggle */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="checkbox"
                      disabled={isLocked}
                      checked={drug.morning}
                      onChange={(e) => handleFieldChange(drug.id, 'morning', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  {/* Afternoon Toggle */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="checkbox"
                      disabled={isLocked}
                      checked={drug.afternoon}
                      onChange={(e) => handleFieldChange(drug.id, 'afternoon', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  {/* Night Toggle */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="checkbox"
                      disabled={isLocked}
                      checked={drug.night}
                      onChange={(e) => handleFieldChange(drug.id, 'night', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  {/* Food Relation */}
                  <td className="py-2 px-3">
                    <select
                      disabled={isLocked}
                      value={drug.foodRelation}
                      onChange={(e) => handleFieldChange(drug.id, 'foodRelation', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="after_meal">{t.afterMeal}</option>
                      <option value="before_meal">{t.beforeMeal}</option>
                      <option value="with_meal">{t.withMeal}</option>
                      <option value="empty_stomach">{t.emptyStomach}</option>
                    </select>
                  </td>

                  {/* Confidence */}
                  <td className="py-2 px-2 text-center">
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      {drug.confidenceScore}%
                    </span>
                  </td>

                  {/* Delete / Actions */}
                  <td className="py-2 px-2 text-right">
                    <button
                      disabled={isLocked}
                      onClick={() => handleDeleteDrug(drug.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-40"
                      title="Remove Medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lock / Save Verified Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              {isLocked
                ? 'Clinical regimen locked and synced to alarm dispatch engine.'
                : 'All fields are editable for human oversight and pharmacist compliance.'}
            </span>
          </div>

          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLocked
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isLocked ? 'Unlocked for Edits' : t.saveVerified}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
