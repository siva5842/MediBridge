import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Volume2,
  Square,
  Clock,
  Sun,
  Sunset,
  Moon,
  Utensils,
  CheckCircle2,
  FileCheck2,
  Info,
  Calendar,
  AlertOctagon,
  Languages,
} from 'lucide-react';
import {
  Language,
  PrescribedDrug,
  DrugInteraction,
  DiagnosticLabItem,
  ClinicalPreset,
} from '../types/clinical';
import { TRANSLATIONS } from '../utils/translations';
import { soundAndVoice } from '../services/speechService';

interface ModuleClinicalInsightsProps {
  language: Language;
  preset: ClinicalPreset;
  drugs: PrescribedDrug[];
  interactions: DrugInteraction[];
  labItems?: DiagnosticLabItem[];
}

export const ModuleClinicalInsights: React.FC<ModuleClinicalInsightsProps> = ({
  language,
  preset,
  drugs,
  interactions,
  labItems,
}) => {
  const t = TRANSLATIONS[language];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechLang, setActiveSpeechLang] = useState<'en' | 'ta' | null>(null);

  useEffect(() => {
    return () => {
      soundAndVoice.stopSpeaking();
    };
  }, [preset]);

  const handlePlayAudio = (lang: 'en' | 'ta') => {
    if (isSpeaking && activeSpeechLang === lang) {
      soundAndVoice.stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeechLang(null);
      return;
    }

    const textToSpeak =
      lang === 'ta' ? preset.audioExplanationTa : preset.audioExplanationEn;

    soundAndVoice.speak(
      textToSpeak,
      lang,
      () => {
        setIsSpeaking(true);
        setActiveSpeechLang(lang);
      },
      () => {
        setIsSpeaking(false);
        setActiveSpeechLang(null);
      },
      (err) => {
        console.warn('Speech synthesis note:', err);
        setIsSpeaking(false);
        setActiveSpeechLang(null);
      }
    );
  };

  const handleStopAudio = () => {
    soundAndVoice.stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeechLang(null);
  };

  const formatFoodRelation = (relation: string) => {
    switch (relation) {
      case 'before_meal':
        return t.beforeMeal;
      case 'after_meal':
        return t.afterMeal;
      case 'with_meal':
        return t.withMeal;
      case 'empty_stomach':
        return t.emptyStomach;
      default:
        return relation;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-teal-950 border border-teal-700/60 text-teal-400 text-xs font-bold flex items-center justify-center">
            2
          </span>
          <div>
            <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              AI Decoded Clinical Insights & Dosage Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Pharmacopeia verified drug schedules, interaction safety, and spoken audio directions
            </p>
          </div>
        </div>
      </div>

      {/* Drug-to-Drug Interaction Red Banner (Safety Gatekeeper) */}
      {interactions.length > 0 && (
        <div className="space-y-3">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className={`rounded-xl border p-4 transition-all shadow-md ${
                interaction.severity === 'critical'
                  ? 'bg-rose-950/70 border-rose-600/90 text-rose-100 shadow-rose-950/40 ring-1 ring-rose-500/40'
                  : 'bg-amber-950/70 border-amber-600/80 text-amber-100 shadow-amber-950/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    interaction.severity === 'critical'
                      ? 'bg-rose-900/80 text-rose-300'
                      : 'bg-amber-900/80 text-amber-300'
                  }`}
                >
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                      <span>
                        {language === 'ta' ? interaction.titleTa : interaction.titleEn}
                      </span>
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        interaction.severity === 'critical'
                          ? 'bg-rose-900/90 border-rose-500 text-rose-200'
                          : 'bg-amber-900/90 border-amber-500 text-amber-200'
                      }`}
                    >
                      {interaction.severity === 'critical' ? 'Level 1 Contraindication' : 'Moderate Caution'}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-200">
                    {language === 'ta' ? interaction.descriptionTa : interaction.descriptionEn}
                  </p>

                  <div className="pt-2 border-t border-rose-800/40 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-200 font-medium">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        <strong>{t.clinicalRecommendation}:</strong>{' '}
                        {language === 'ta' ? interaction.recommendationTa : interaction.recommendationEn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multilingual Audio Explanation Bar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-950 border border-teal-800/60 text-teal-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                {t.audioExplanations}
              </div>
              <div className="text-[11px] text-slate-400">
                Natural Web Speech Synthesis for elderly patients & caregiver listening
              </div>
            </div>
          </div>

          {/* Audio Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handlePlayAudio('en')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSpeaking && activeSpeechLang === 'en'
                  ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.listenEnglish}</span>
            </button>

            <button
              onClick={() => handlePlayAudio('ta')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSpeaking && activeSpeechLang === 'ta'
                  ? 'bg-teal-600 text-white shadow-md animate-pulse'
                  : 'bg-teal-950/80 hover:bg-teal-900 text-teal-200 border border-teal-800/80'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.listenTamil}</span>
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopAudio}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-semibold transition-colors"
              >
                <Square className="w-3 h-3 text-rose-400 fill-current" />
                <span>{t.stopAudio}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Transcript Box */}
        <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center justify-between">
            <span>Spoken Script Preview ({language === 'ta' ? 'தமிழ்' : 'English'})</span>
            {isSpeaking && (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {t.playingAudio}
              </span>
            )}
          </div>
          <p className="italic font-normal">
            "{language === 'ta' ? preset.audioExplanationTa : preset.audioExplanationEn}"
          </p>
        </div>
      </div>

      {/* Diagnostic Lab Report Table (Active if Preset 3) */}
      {labItems && labItems.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t.labReportTitle}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{t.labReportSub}</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Diagnostic Test</th>
                  <th className="py-2.5 px-3">Patient Value</th>
                  <th className="py-2.5 px-3">Reference Range</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Plain-Language Clinical Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {labItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {item.testName}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                      {item.value} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {item.referenceRange}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.status === 'low' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 border border-amber-700 text-amber-300">
                          Low (Deficiency)
                        </span>
                      )}
                      {item.status === 'high' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 border border-rose-700 text-rose-300">
                          High (Elevated)
                        </span>
                      )}
                      {item.status === 'normal' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {language === 'ta' ? item.clinicalMeaningTa : item.clinicalMeaningEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Structured Dosage Matrix */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.dosageMatrix}
            </span>
            <span className="text-[10px] text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/40">
              Validated Pharmacopeia Protocol
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold">
                <th className="py-3 px-3">{t.drugName}</th>
                <th className="py-3 px-2 text-center">{t.strength}</th>
                <th className="py-3 px-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-amber-300 font-medium">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t.morning}</span>
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-orange-300 font-medium">
                    <Sunset className="w-3.5 h-3.5" />
                    <span>{t.afternoon}</span>
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-indigo-300 font-medium">
                    <Moon className="w-3.5 h-3.5" />
                    <span>{t.night}</span>
                  </span>
                </th>
                <th className="py-3 px-3 text-left">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Utensils className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.foodRelation}</span>
                  </span>
                </th>
                <th className="py-3 px-2 text-center">{t.duration}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {drugs.map((drug) => (
                <tr key={drug.id} className="hover:bg-slate-900/40 transition-colors">
                  {/* Name & form */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{drug.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({drug.dosageForm})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {language === 'ta' ? drug.clinicalNoteTa : drug.clinicalNoteEn}
                    </div>
                  </td>

                  {/* Strength */}
                  <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                    {drug.strength}
                  </td>

                  {/* Morning Dose */}
                  <td className="py-3 px-3 text-center">
                    {drug.morning ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold shadow-sm">
                        1
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono">—</span>
                    )}
                  </td>

                  {/* Afternoon Dose */}
                  <td className="py-3 px-3 text-center">
                    {drug.afternoon ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-950/80 border border-orange-700/60 text-orange-300 font-bold shadow-sm">
                        1
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono">—</span>
                    )}
                  </td>

                  {/* Night Dose */}
                  <td className="py-3 px-3 text-center">
                    {drug.night ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-bold shadow-sm">
                        1
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono">—</span>
                    )}
                  </td>

                  {/* Food Relation */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold ${
                        drug.foodRelation === 'before_meal'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      {formatFoodRelation(drug.foodRelation)}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-2 text-center font-mono text-slate-300">
                    {drug.durationDays}d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
