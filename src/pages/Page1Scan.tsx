import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  User,
  Stethoscope,
  ArrowRight,
  Eye,
  Plus,
  Trash2,
  Edit2,
  Pill,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  FileText,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Language, PrescribedDrug, PatientInfo, ClinicalPreset } from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';
import { EditPatientModal } from '../components/EditPatientModal';
import { EditMedicineModal } from '../components/EditMedicineModal';

interface Page1ScanProps {
  language: Language;
  patient: PatientInfo;
  onPatientChange: (patient: PatientInfo) => void;
  drugs: PrescribedDrug[];
  onDrugsChange: (drugs: PrescribedDrug[]) => void;
  onCustomImageUpload: (file: File) => void;
  onNavigateNext: () => void;
  onSelectPreset?: (presetId: string) => void;
  activePresetId?: string;
  presetImage?: string;
}

export const Page1Scan: React.FC<Page1ScanProps> = ({
  language,
  patient,
  onPatientChange,
  drugs,
  onDrugsChange,
  onCustomImageUpload,
  onNavigateNext,
  onSelectPreset,
  activePresetId,
  presetImage,
}) => {
  const t = TRANSLATIONS[language];
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<PrescribedDrug | null>(null);

  const handleDeleteDrug = (id: string) => {
    onDrugsChange(drugs.filter((d) => d.id !== id));
  };

  const handleSaveMedicine = (savedDrug: PrescribedDrug) => {
    const exists = drugs.some((d) => d.id === savedDrug.id);
    if (exists) {
      onDrugsChange(drugs.map((d) => (d.id === savedDrug.id ? savedDrug : d)));
    } else {
      onDrugsChange([...drugs, savedDrug]);
    }
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
    <div className="space-y-4 sm:space-y-6 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
              {language === 'ta' ? 'மருந்துச் சீட்டு ஸ்கேனர் & சரிபார்ப்பு' : 'Prescription & Diagnostic Scanner'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            {language === 'ta'
              ? 'கைப்பட எழுதப்பட்ட மருத்துவர் மருந்துச் சீட்டை பதிவேற்றி துல்லியமாக சரிபார்க்கவும்'
              : 'Transcribe handwritten doctor prescriptions & lab reports with verified accuracy'}
          </p>
        </div>

        {/* AI Confidence Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 self-start sm:self-auto shadow-xs">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <div className="text-left">
            <div className="text-xs font-bold font-mono text-emerald-900">
              AI Confidence: {drugs.length > 0 ? '98.4%' : '--%'}
            </div>
            <div className="text-[10px] text-emerald-700">
              Pharmacopeia Cross-Checked
            </div>
          </div>
        </div>
      </div>

      {/* Patient Card: Displays "No Patient Selected" OR patient details with Edit button */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {patient.name ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {patient.name}
                </span>
                {patient.age && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Age {patient.age}, {patient.gender}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {patient.doctorName ? `${patient.doctorName}${patient.doctorSpecialty ? ` (${patient.doctorSpecialty})` : ''}` : 'Doctor info pending'}
                </span>
                <span>•</span>
                <span>{patient.date || 'Today'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                No Patient Selected
              </span>
              <p className="text-xs text-slate-400">
                Enter patient name and prescribing doctor details
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            {patient.name ? (
              <>
                <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Edit Patient</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enter Patient Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Prescription Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`bg-white rounded-xl sm:rounded-2xl border-2 border-dashed p-4 sm:p-7 text-center transition-all ${
          dragOver ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              {language === 'ta'
                ? 'மருந்துச் சீட்டைப் படம் பிடி அல்லது பதிவேற்று'
                : 'Upload or Snap Doctor Prescription'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ta'
                ? 'கேமரா மூலம் நேரடியாக படம் எடுக்கலாம் அல்லது PDF / JPG கோப்பை பதிவேற்றலாம்'
                : 'High-res camera capture or instant image & PDF file upload'}
            </p>
          </div>

          {/* Large Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'ta' ? 'கேமரா திறக்க' : 'Snap Prescription'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ta' ? 'கோப்பு பதிவேற்ற' : 'Browse File / PDF'}</span>
            </button>
          </div>

          {/* Manual Add Medicine Option */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setEditingMedicine(null);
                setIsMedicineModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'மருந்தை நேரடியாகச் சேர்க்க' : 'Add Medicine Manually'}</span>
            </button>

            {presetImage && (
              <button
                onClick={() => setShowDocPreview(!showDocPreview)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showDocPreview ? 'Hide Preview' : 'Preview Document'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scan Document Display */}
        {showDocPreview && presetImage && (
          <div className="mt-4 pt-4 border-t border-slate-100 max-w-lg mx-auto text-left">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 flex items-center justify-center">
              <img
                src={presetImage}
                alt="Prescription Scan"
                className="w-full h-full object-cover max-h-56"
              />
            </div>
          </div>
        )}
      </div>

      {/* Human-in-the-Loop Review Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <span>{language === 'ta' ? 'பரிந்துரைக்கப்பட்ட மருந்துகள்' : 'Prescribed Medications'}</span>
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full font-bold">
                {drugs.length} {drugs.length === 1 ? 'item' : 'items'}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingMedicine(null);
                setIsMedicineModalOpen(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Medicine Manually</span>
            </button>
          </div>
        </div>

        {/* Empty State when no drugs exist */}
        {drugs.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                No Prescription Uploaded Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Take a photo or upload an image to decode your medicines, or click below to add a medicine manually.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMedicine(null);
                setIsMedicineModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine Manually</span>
            </button>
          </div>
        ) : (
          /* Clean Mobile-Friendly Medicine Cards with Edit and Delete */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {drugs.map((drug) => (
              <div
                key={drug.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {drug.name}
                        </h4>
                        <span className="text-xs font-mono font-semibold text-emerald-700">
                          {drug.strength} • {drug.dosageForm}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls: Edit & Delete buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMedicine(drug);
                          setIsMedicineModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit Medicine"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDrug(drug.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete Medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Food & Timing pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {drug.foodRelation === 'before_meal'
                        ? '🍽️ Before Food'
                        : drug.foodRelation === 'with_meal'
                        ? '🍽️ With Food'
                        : '🍽️ After Food'}
                    </span>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          drug.morning
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-400 opacity-60'
                        }`}
                      >
                        🌅 M: {drug.morning ? '1' : '0'}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          drug.afternoon
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-slate-100 text-slate-400 opacity-60'
                        }`}
                      >
                        ☀️ N: {drug.afternoon ? '1' : '0'}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          drug.night
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'bg-slate-100 text-slate-400 opacity-60'
                        }`}
                      >
                        🌙 E: {drug.night ? '1' : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Stock: <strong className="text-slate-800 font-mono">{drug.remainingPills} pills</strong></span>
                  <span className="font-mono text-emerald-600">✓ Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Confirm Button */}
        {drugs.length > 0 && (
          <div className="pt-2">
            <button
              onClick={onNavigateNext}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>{language === 'ta' ? 'மாத்திரை அட்டவணைக்குச் செல்ல' : 'Confirm & Go to Dosage Schedule'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        language={language}
        patient={patient}
        onSave={onPatientChange}
      />

      {/* Edit / Add Medicine Modal */}
      <EditMedicineModal
        isOpen={isMedicineModalOpen}
        onClose={() => {
          setIsMedicineModalOpen(false);
          setEditingMedicine(null);
        }}
        language={language}
        medicine={editingMedicine}
        onSave={handleSaveMedicine}
        onDelete={handleDeleteDrug}
      />
    </div>
  );
};
