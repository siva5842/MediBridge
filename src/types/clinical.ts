export type Language = 'en' | 'ta';

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
}

export interface PrescribedDrug {
  id: string;
  name: string;
  genericName: string;
  strength: string; // e.g. "400mg"
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops';
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  foodRelation: 'before_meal' | 'after_meal' | 'with_meal' | 'empty_stomach';
  durationDays: number;
  totalPillsPrescribed: number;
  remainingPills: number;
  confidenceScore: number; // e.g. 98.4
  clinicalNoteEn: string;
  clinicalNoteTa: string;
  verifiedByHuman?: boolean;
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'critical' | 'moderate' | 'minor';
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  recommendationEn: string;
  recommendationTa: string;
}

export interface DiagnosticLabItem {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  clinicalMeaningEn: string;
  clinicalMeaningTa: string;
}

export interface ScheduledAlarm {
  id: string;
  drugId: string;
  drugName: string;
  dosage: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Night' | 'Custom';
  time: string; // "08:00 AM"
  foodRelation: 'before_meal' | 'after_meal' | 'with_meal';
  enabled: boolean;
  takenToday?: boolean;
}

export interface WearableTelemetry {
  heartRate: number; // BPM
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  spO2: number; // %
  hrv: number; // ms
  bodyTemp: number; // °C
  isConnected: boolean;
  deviceName: string;
  batteryLevel: number; // %
  lastSyncTime: string;
  hapticActive: boolean;
}

export interface ClinicalPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  prescriptionImage: string;
  prescriptionType: 'rx' | 'lab';
  confidenceScore: number;
  pharmacopeiaSource: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  drugs: PrescribedDrug[];
  interactions: DrugInteraction[];
  labItems?: DiagnosticLabItem[];
  vitals: WearableTelemetry;
  correlationNoteEn: string;
  correlationNoteTa: string;
  audioExplanationEn: string;
  audioExplanationTa: string;
}
