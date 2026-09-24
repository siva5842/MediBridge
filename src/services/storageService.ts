/**
 * MediBridge Persistent Storage Service
 * Manages automatic localStorage synchronization for patients, prescriptions,
 * reminders, pill inventory, and wearable telemetry with zero data loss on refresh.
 */

import {
  PatientInfo,
  PrescribedDrug,
  ScheduledAlarm,
  WearableTelemetry,
  Language,
} from '../types/clinical';

export const STORAGE_KEYS = {
  PATIENT: 'medibridge_patient_data',
  PRESCRIPTIONS: 'medibridge_prescriptions',
  REMINDERS: 'medibridge_reminders',
  INVENTORY: 'medibridge_inventory',
  WEARABLE: 'medibridge_wearable',
  LANGUAGE: 'medibridge_language',
  PAGE: 'medibridge_active_page',
} as const;

export interface PillInventoryData {
  [drugId: string]: {
    remainingPills: number;
    totalPillsPrescribed: number;
    durationDays: number;
    daysLeft: number;
    updatedAt: string;
  };
}

export interface SavedWearableState {
  isConnected: boolean;
  isSimulated: boolean;
  deviceName: string;
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spO2: number;
  batteryLevel: number;
  lastSyncTime: string;
}

const safeJsonParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (err) {
    console.warn('Storage parsing error for payload:', err);
    return fallback;
  }
};

export const storageService = {
  // Patient & Doctor Details
  loadPatient(): PatientInfo | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENT);
    return safeJsonParse<PatientInfo | null>(raw, null);
  },

  savePatient(patient: PatientInfo): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));
    } catch (e) {
      console.error('Failed to save patient to localStorage:', e);
    }
  },

  // Prescriptions & Medicines
  loadPrescriptions(): PrescribedDrug[] | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    return safeJsonParse<PrescribedDrug[] | null>(raw, null);
  },

  savePrescriptions(drugs: PrescribedDrug[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(drugs));
      // Simultaneously sync inventory counts
      this.syncInventoryFromDrugs(drugs);
    } catch (e) {
      console.error('Failed to save prescriptions to localStorage:', e);
    }
  },

  // Scheduled Reminders & Dose Alarms
  loadReminders(): ScheduledAlarm[] | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return safeJsonParse<ScheduledAlarm[] | null>(raw, null);
  },

  saveReminders(alarms: ScheduledAlarm[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(alarms));
    } catch (e) {
      console.error('Failed to save reminders to localStorage:', e);
    }
  },

  // Pill Inventory Counts
  loadInventory(): PillInventoryData {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return safeJsonParse<PillInventoryData>(raw, {});
  },

  saveInventory(inventory: PillInventoryData): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('Failed to save inventory to localStorage:', e);
    }
  },

  syncInventoryFromDrugs(drugs: PrescribedDrug[]): void {
    const currentInventory = this.loadInventory();
    const updatedInventory: PillInventoryData = { ...currentInventory };

    drugs.forEach((drug) => {
      const dailyDoses =
        (drug.morning ? 1 : 0) + (drug.afternoon ? 1 : 0) + (drug.night ? 1 : 0) || 1;
      const daysLeft = Math.ceil(drug.remainingPills / dailyDoses);

      updatedInventory[drug.id] = {
        remainingPills: drug.remainingPills,
        totalPillsPrescribed: drug.totalPillsPrescribed,
        durationDays: drug.durationDays,
        daysLeft,
        updatedAt: new Date().toISOString(),
      };
    });

    this.saveInventory(updatedInventory);
  },

  // Smartwatch Connection & Telemetry
  loadWearableState(): SavedWearableState | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.WEARABLE);
    return safeJsonParse<SavedWearableState | null>(raw, null);
  },

  saveWearableState(state: SavedWearableState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.WEARABLE, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save wearable state to localStorage:', e);
    }
  },

  // Language & Active Page
  loadLanguage(): Language | null {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || null;
  },

  saveLanguage(lang: Language): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  loadActivePage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.PAGE) || null;
  },

  saveActivePage(page: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PAGE, page);
  },

  // Clear all MediBridge keys for clean slate reset
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
