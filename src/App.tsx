/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, AppPage } from './components/Header';
import { Page1Scan } from './pages/Page1Scan';
import { Page2DosageSafety } from './pages/Page2DosageSafety';
import { Page3Reminders } from './pages/Page3Reminders';
import { Page4WearableVitals } from './pages/Page4WearableVitals';
import { AlarmTriggerModal } from './components/AlarmTriggerModal';
import { DEMO_PRESETS } from './data/demoPresets';
import {
  Language,
  PrescribedDrug,
  ScheduledAlarm,
  WearableTelemetry,
  PatientInfo,
  DrugInteraction,
} from './types/clinical';
import { wearableService } from './services/bluetoothService';
import { storageService } from './services/storageService';
import { soundAndVoice } from './services/speechService';
import {
  decodePrescriptionWithGemini,
  generateAlarmsFromDrugs,
} from './services/prescriptionDecoderService';
import { HeartPulse } from 'lucide-react';

export default function App() {
  // 1. Language State (persisted to localStorage)
  const [language, setLanguage] = useState<Language>(() => {
    return storageService.loadLanguage() || 'en';
  });

  // 2. 4 Dedicated Pages Navigation State (persisted to localStorage)
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    return (storageService.loadActivePage() as AppPage) || 'scan';
  });

  // 3. Patient & Doctor Details (persisted to 'medibridge_patient_data')
  const [patient, setPatient] = useState<PatientInfo>(() => {
    return (
      storageService.loadPatient() || {
        name: '',
        age: '',
        gender: 'Male',
        doctorName: '',
        doctorSpecialty: '',
        date: '',
      }
    );
  });

  // 4. Decoded & Added Prescriptions (persisted to 'medibridge_prescriptions' and 'medibridge_inventory')
  const [drugs, setDrugs] = useState<PrescribedDrug[]>(() => {
    return storageService.loadPrescriptions() || [];
  });

  // 5. Scheduled Reminders & Dose Alarms (persisted to 'medibridge_reminders')
  const [alarms, setAlarms] = useState<ScheduledAlarm[]>(() => {
    return storageService.loadReminders() || [];
  });

  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [prescriptionImage, setPrescriptionImage] = useState<string | undefined>(undefined);
  const [activePresetId, setActivePresetId] = useState<string | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // 6. Wearable Telemetry (persisted to 'medibridge_wearable' via wearableService)
  const [telemetry, setTelemetry] = useState<WearableTelemetry>(() =>
    wearableService.getTelemetry()
  );
  const [activeTestAlarm, setActiveTestAlarm] = useState<ScheduledAlarm | null>(null);

  // Subscribe to live BLE telemetry
  useEffect(() => {
    const unsub = wearableService.subscribe((t) => {
      setTelemetry(t);
    });
    return unsub;
  }, []);

  // --- AUTOMATIC LOCALSTORAGE SYNCHRONIZATION ---

  // Auto-save Patient & Doctor Details
  useEffect(() => {
    storageService.savePatient(patient);
  }, [patient]);

  // Auto-save Prescriptions & Pill Inventory Counts
  useEffect(() => {
    storageService.savePrescriptions(drugs);
  }, [drugs]);

  // Auto-save Scheduled Reminders & Dose Alarms
  useEffect(() => {
    storageService.saveReminders(alarms);
  }, [alarms]);

  // Auto-save Language Preference
  useEffect(() => {
    storageService.saveLanguage(language);
  }, [language]);

  // Auto-save Active Navigation Page
  useEffect(() => {
    storageService.saveActivePage(currentPage);
  }, [currentPage]);

  // --- DRUG INTERACTIONS CHECK ---
  useEffect(() => {
    const detectedInteractions: DrugInteraction[] = [];
    const hasAspirin = drugs.some((d) => d.name.toLowerCase().includes('aspirin'));
    const hasIbuprofen = drugs.some((d) => d.name.toLowerCase().includes('ibuprofen'));

    if (hasAspirin && hasIbuprofen) {
      detectedInteractions.push({
        id: 'interaction-asp-ibu',
        drugA: 'Aspirin',
        drugB: 'Ibuprofen',
        severity: 'critical',
        titleEn: 'Severe Gastrointestinal & Renal Hazard',
        titleTa: 'வயிற்றுப் புண் மற்றும் இரைப்பை ரத்தப்போக்கு அபாயம்',
        descriptionEn:
          'Taking Aspirin and Ibuprofen together can cause stomach irritation or internal bleeding. Consult your doctor.',
        descriptionTa:
          'ஆஸ்பிரின் மற்றும் இப்யூபுரூஃபன் ஆகியவற்றை ஒன்றாக எடுத்துக்கொள்வது வயிற்று எரிச்சல் அல்லது ரத்தப்போக்கை ஏற்படுத்தக்கூடும். உங்கள் மருத்துவரை அணுகவும்.',
        recommendationEn: 'Consult physician for safer pain relief alternatives.',
        recommendationTa: 'பாதுகாப்பான மாற்று வலி நிவாரணிக்கு மருத்துவரை அணுகவும்.',
      });
    }

    setInteractions(detectedInteractions);
  }, [drugs]);

  // Handle Prescription Image / Camera Upload (Live Gemini 1.5 Flash Vision Decoding)
  const handleCustomImageUpload = async (file: File) => {
    try {
      const objectUrl = URL.createObjectURL(file);
      setPrescriptionImage(objectUrl);
      setIsScanning(true);
      setScanError(null);

      const result = await decodePrescriptionWithGemini(file);

      if (result.success && result.medications.length > 0) {
        setDrugs(result.medications);
        setScanError(null);

        // Update patient demographics if detected in the document
        if (result.patient && result.patient.name) {
          setPatient((prev) => ({
            ...prev,
            name: result.patient?.name || prev.name,
            age: result.patient?.age || prev.age,
            gender: (result.patient?.gender as any) || prev.gender,
            doctorName: result.patient?.doctorName || prev.doctorName,
            doctorSpecialty: result.patient?.doctorSpecialty || prev.doctorSpecialty,
            date: result.patient?.date || prev.date,
          }));
        } else if (!patient.name) {
          setPatient({
            name: 'Patient (Decoded Rx)',
            age: '45',
            gender: 'Male',
            doctorName: 'Attending Physician, MD',
            doctorSpecialty: 'General Medicine',
            date: new Date().toLocaleDateString(),
          });
        }

        // Auto-generate dose alarms from the decoded drugs
        const generatedAlarms = generateAlarmsFromDrugs(result.medications);
        if (generatedAlarms.length > 0) {
          setAlarms(generatedAlarms);
        }
      } else {
        // Fallback when not readable or no medications found:
        // Do NOT return Amoxicillin! Show friendly alert banner
        setScanError(
          result.error ||
            '⚠️ Could not clearly detect medicine text. Please hold the camera closer or tap "+ Add Medicine Manually" to type the name.'
        );
      }
    } catch (err: any) {
      console.error('Prescription processing error:', err);
      setScanError(
        '⚠️ Could not clearly detect medicine text. Please hold the camera closer or tap "+ Add Medicine Manually" to type the name.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Optional preset loader for quick testing
  const handleSelectPreset = (presetId: string) => {
    const found = DEMO_PRESETS.find((p) => p.id === presetId);
    if (found) {
      soundAndVoice.stopSpeaking();
      setActivePresetId(presetId);
      setPatient({
        name: found.patientName,
        age: '64',
        gender: 'Male',
        doctorName: found.doctorName,
        doctorSpecialty: found.doctorSpecialty,
        date: found.date,
      });
      setDrugs(found.drugs);
      setPrescriptionImage(found.prescriptionImage);
      setInteractions(found.interactions);

      // Populate alarms from preset drugs
      const newAlarms: ScheduledAlarm[] = [];
      found.drugs.forEach((drug) => {
        if (drug.morning) {
          newAlarms.push({
            id: `alarm-${drug.id}-morning`,
            drugId: drug.id,
            drugName: drug.name,
            dosage: drug.strength,
            timeSlot: 'Morning',
            time: drug.foodRelation === 'before_meal' ? '07:30 AM' : '08:00 AM',
            foodRelation: drug.foodRelation as any,
            enabled: true,
          });
        }
        if (drug.night) {
          newAlarms.push({
            id: `alarm-${drug.id}-night`,
            drugId: drug.id,
            drugName: drug.name,
            dosage: drug.strength,
            timeSlot: 'Night',
            time: '08:30 PM',
            foodRelation: drug.foodRelation as any,
            enabled: true,
          });
        }
      });
      setAlarms(newAlarms);
    }
  };

  // Alarm CRUD Handlers
  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleSaveAlarm = (savedAlarm: ScheduledAlarm) => {
    setAlarms((prev) => {
      const exists = prev.some((a) => a.id === savedAlarm.id);
      if (exists) {
        return prev.map((a) => (a.id === savedAlarm.id ? savedAlarm : a));
      }
      return [savedAlarm, ...prev];
    });
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  // Reset All Local Data to start fresh
  const handleResetAllData = () => {
    storageService.clearAllData();
    wearableService.disconnect();
    setIsScanning(false);
    setScanError(null);
    setPatient({
      name: '',
      age: '',
      gender: 'Male',
      doctorName: '',
      doctorSpecialty: '',
      date: '',
    });
    setDrugs([]);
    setAlarms([]);
    setInteractions([]);
    setPrescriptionImage(undefined);
    setActivePresetId(undefined);
    setCurrentPage('scan');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans'] antialiased">
      {/* Clean Pinned Top Navigation Bar & Database Status */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        telemetry={telemetry}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onResetAllData={handleResetAllData}
      />

      {/* Main Single Page Workspace (Displays ONLY the active page) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-28 md:pb-12">
        {currentPage === 'scan' && (
          <Page1Scan
            language={language}
            patient={patient}
            onPatientChange={setPatient}
            drugs={drugs}
            onDrugsChange={setDrugs}
            onCustomImageUpload={handleCustomImageUpload}
            onNavigateNext={() => setCurrentPage('dosage')}
            onSelectPreset={handleSelectPreset}
            activePresetId={activePresetId}
            presetImage={prescriptionImage}
            isScanning={isScanning}
            scanError={scanError}
            onClearScanError={() => setScanError(null)}
          />
        )}

        {currentPage === 'dosage' && (
          <Page2DosageSafety
            language={language}
            drugs={drugs}
            interactions={interactions}
            onNavigateNext={() => setCurrentPage('reminders')}
            onNavigateBackToScan={() => setCurrentPage('scan')}
          />
        )}

        {currentPage === 'reminders' && (
          <Page3Reminders
            language={language}
            alarms={alarms}
            onToggleAlarm={handleToggleAlarm}
            onSaveAlarm={handleSaveAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            drugs={drugs}
            onUpdateDrugs={setDrugs}
            onNavigateNext={() => setCurrentPage('vitals')}
          />
        )}

        {currentPage === 'vitals' && (
          <Page4WearableVitals
            language={language}
            telemetry={telemetry}
            drugs={drugs}
            onNavigateBack={() => setCurrentPage('reminders')}
          />
        )}
      </main>

      {/* Modern Light Medical Footer (Desktop only, hidden behind mobile bottom nav) */}
      <footer className="hidden sm:block border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            <span>MediBridge Clinical Multilingual Sentinel</span>
            <span>·</span>
            <span>Persistent Local Storage Synchronized</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Web Bluetooth BLE</span>
            <span>·</span>
            <span>SpeechSynthesis English & தமிழ்</span>
            <span>·</span>
            <span>Offline-Ready Local Database</span>
          </div>
        </div>
      </footer>

      {/* Alarm Trigger Modal for Test / Scheduled Chimes */}
      <AlarmTriggerModal
        isOpen={!!activeTestAlarm}
        onClose={() => setActiveTestAlarm(null)}
        language={language}
        alarm={activeTestAlarm}
        onMarkTaken={() => setActiveTestAlarm(null)}
      />
    </div>
  );
}
