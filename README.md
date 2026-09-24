# 💊 MediBridge — Multilingual Prescription Decoder, Wearable Health Sentinel & Smart Medication Scheduler

[![Live Web App](https://img.shields.io/badge/Live%20Demo-medi--bridge.ai.studio-059669?style=for-the-badge&logo=googlechrome&logoColor=white)](https://medi-bridge.ai.studio)
[![GitHub Repository](https://img.shields.io/badge/GitHub-siva5842%2FMediBridge-181717?style=flat&logo=github)](https://github.com/siva5842/MediBridge)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind%20CSS-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![AI Vision Engine](https://img.shields.io/badge/AI%20Engine-Gemini%201.5%20Flash%20Multimodal-4285F4?style=flat&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Wearables](https://img.shields.io/badge/Hardware-Web%20Bluetooth%20API%20(BLE)-0082FC?style=flat&logo=bluetooth&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Live Application Demo:** [https://urban-pulse-ai.ai.studio/](https://urban-pulse-ai.ai.studio/)

A clinical-grade, accessible healthcare web application designed to eliminate medication errors. **MediBridge** decodes illegible doctor prescriptions and dense diagnostic lab reports, checks for dangerous drug-drug contraindications, translates dosage directions into plain **English and தமிழ் (Tamil) audio**, tracks pharmacy pill inventory, and connects to smartwatches via **Web Bluetooth** for live vitals monitoring.

---

## 🌟 Key Highlights & Features

### 1. 🔍 High-Accuracy Prescription & Lab Report Decoder
* Utilizes **Gemini 1.5 Flash Multimodal Vision** to transcribe handwritten prescriptions and clinical lab reports into structured data.
* **Human-in-the-Loop Review:** Displays a clinical confidence rating and provides full **Edit & Delete (CRUD)** controls so patients or caregivers can verify and tweak drug names, strengths (mg), and timings.

### 2. ⚠️ Drug-to-Drug Contraindication Safety Gatekeeper
* Automatically cross-checks prescribed medications against known clinical interaction databases.
* Flags high-risk combinations with prominent, plain-language patient warnings (e.g., *Aspirin + Ibuprofen concurrent intake increasing gastrointestinal hemorrhage risk*).

### 3. 🔊 Multilingual Spoken Directions (English & தமிழ்)
* Eliminates reading barriers for elderly or semi-urban patients using browser speech synthesis (`window.speechSynthesis`).
* Offers instant voice playback of medicine schedules, meal coordination (*Before/After food*), and safety advisories in both **English** and **Tamil (தமிழ்)**.

### 4. ⏰ Dual-Mode Reminders & Pharmacy Refill Countdown
* **Time-Based Alarms:** Automated alarms synchronized to prescribed timings with sound and device vibration (`navigator.vibrate`).
* **Pill Inventory Sentinel:** Counts down remaining tablets and issues proactive refill warnings (e.g., *"Only 3 tablets left — Refill from pharmacy by Saturday!"*).
* **Manual Reminder Scheduler:** Full caregiver support to add custom medicines, change dosage times, and toggle alarms.

### 5. ⌚ Wearable Health Sentinel (Web Bluetooth & Vitals Correlation)
* **Authentic Web Bluetooth Integration:** Uses `navigator.bluetooth.requestDevice` to scan for real BLE fitness bands and smartwatches, with an on-demand simulation mode for testing.
* **Live Biometric Telemetry:** Monitors Heart Rate (BPM), Blood Pressure (mmHg), and Blood Oxygen (SpO2).
* **Vital-to-Drug Pharmacodynamic Correlation:** Directly correlates live biometrics with prescribed therapy (e.g., *elevated Blood Pressure of 135/88 mmHg correlated with morning dose of Telmisartan 40mg*).

### 6. 📱 Mobile-First Responsive Design (Apple Health Aesthetic)
* Clean, distraction-free aesthetic with soft slate backgrounds, rounded cards, and high-contrast clinical badges.
* Integrated **Fixed Mobile Bottom Navigation Bar** for seamless thumb-friendly navigation across:
  `[ 📄 Scan ]` `[ 💊 Dosage ]` `[ ⏰ Reminders ]` `[ ⌚ Vitals ]`

---

## 🏗️ System Architecture

[Handwritten Prescription / Lab PDF]
│
▼
[Gemini 1.5 Flash Vision]
│
┌──────────────┴──────────────┐
▼                             ▼
[Dosage Schedule Matrix]    [Drug Interaction Gatekeeper]
│                             │
├─> English/Tamil Audio       └─> Red Warning Alert Box
│
▼
[Dual-Mode Reminders & Refill]
├── Time-Based Alarms
└── Inventory Stock Countdown
│
▼
[Web Bluetooth Smartwatch Hub] <─── (BLE Hardware Pairing)
├── Live Vitals: HR, BP, SpO2
└── Vital-to-Pill Correlation Alert


---

## 🚦 Healthcare & Accessibility Impact Matrix

| User Profile | Clinical Need | MediBridge Solution |
| :--- | :--- | :--- |
| 👴 **Elderly Patients** | Cannot read fine print or doctor's handwriting | Multilingual Tamil & English voice readout with clear breakfast/lunch/dinner icons |
| 👨‍👩‍👧 **Family Caregivers** | Managing multiple medicines and tracking refills | Real-time pill inventory countdown alerts before medicines run out |
| 🩺 **Hypertensive / Cardiac Patients** | Missing doses and conflicting painkiller intake | Vitals telemetry correlates elevated BP with medicine schedule and blocks NSAID clashes |
| 🧑‍⚕️ **Pharmacists & Nurses** | Verifying doctor prescription authenticity | Structured review table with full Edit/Delete overrides and confidence scoring |

---

## 🚀 Quick Start (Run 100% Locally)

The entire project is built with clean client-side React and Vite, allowing it to run offline or on a local network with zero external cloud dependencies.

### 1. Clone the Repository
git clone [https://github.com/siva5842/MediBridge.git](https://github.com/siva5842/MediBridge.git)
cd MediBridge
2. Install Dependencies & Launch
Bash
# Install node dependencies
npm install

# Start Vite development server
npm run dev -- --host
Open http://localhost:5173 (or your local network IP http://192.168.x.x:5173 on your smartphone) in your browser.

👥 Contributors & Credits
Sivaprakasham Palanisamy (@siva5842) — System Architecture, Clinical AI Pipelines & Full-Stack Development

Yokesh E (@Yokesh-12) — Co-Author, Wearable Bluetooth Telemetry & UI/UX Workflows

📜 License
This project is open-source under the MIT License.
