import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Pill,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  Language,
  PrescribedDrug,
  DrugInteraction,
} from '../types/clinical';
import { soundAndVoice } from '../services/speechService';

interface Page2DosageSafetyProps {
  language: Language;
  drugs: PrescribedDrug[];
  interactions: DrugInteraction[];
  onNavigateNext: () => void;
  onNavigateBackToScan: () => void;
}

export const Page2DosageSafety: React.FC<Page2DosageSafetyProps> = ({
  language,
  drugs,
  interactions,
  onNavigateNext,
  onNavigateBackToScan,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechLang, setActiveSpeechLang] = useState<'en' | 'ta' | null>(null);

  useEffect(() => {
    return () => {
      soundAndVoice.stopSpeaking();
    };
  }, []);

  // Determine if there is an interaction warning
  const hasInteraction =
    interactions.length > 0 ||
    (drugs.some((d) => d.name.toLowerCase().includes('aspirin')) &&
      drugs.some((d) => d.name.toLowerCase().includes('ibuprofen')));

  const handlePlayAudio = (lang: 'en' | 'ta') => {
    if (isSpeaking && activeSpeechLang === lang) {
      soundAndVoice.stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeechLang(null);
      return;
    }

    let speechText = '';
    if (lang === 'en') {
      if (drugs.length === 0) {
        speechText = 'No medications currently scheduled. Please upload or add your prescription first.';
      } else {
        const drugSummary = drugs
          .map(
            (d) =>
              `${d.name} ${d.strength}, take ${
                d.foodRelation === 'before_meal' ? 'before meals' : 'after meals'
              }${d.morning ? ' in the morning' : ''}${d.night ? ' and at night' : ''}.`
          )
          .join(' ');
        const warning = hasInteraction
          ? ' Warning: Taking these medicines together can cause stomach irritation. Please consult your doctor.'
          : ' All scheduled medicines are safe to take.';
        speechText = `Your dosage schedule: ${drugSummary}${warning}`;
      }
    } else {
      if (drugs.length === 0) {
        speechText = 'தற்போது மருந்துகள் எதுவும் அட்டவணையில் இல்லை. முதலில் உங்கள் மருந்துச் சீட்டைப் பதிவேற்றவும்.';
      } else {
        const drugSummary = drugs
          .map(
            (d) =>
              `${d.name}, ${
                d.foodRelation === 'before_meal' ? 'உணவுக்கு முன்' : 'உணவுக்குப் பின்'
              }${d.morning ? ' காலையிலும்' : ''}${d.night ? ' இரவிலும்' : ''} எடுத்துக்கொள்ளவும்.`
          )
          .join(' ');
        const warning = hasInteraction
          ? ' எச்சரிக்கை: இந்த மருந்துகளை ஒன்றாக உட்கொள்வது வயிற்று எரிச்சலை ஏற்படுத்தலாம். உங்கள் மருத்துவரிடம் சரிபார்க்கவும்.'
          : ' அட்டவணைப்படி மருந்துகளை எடுத்துக் கொள்ளலாம்.';
        speechText = `உங்கள் மருந்து அட்டவணை: ${drugSummary}${warning}`;
      }
    }

    soundAndVoice.speak(
      speechText,
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
        console.warn('Speech error:', err);
        setIsSpeaking(false);
        setActiveSpeechLang(null);
      }
    );
  };

  const getFoodTimingBadge = (drug: PrescribedDrug) => {
    if (drug.foodRelation === 'before_meal') {
      return language === 'ta' ? '🍽️ காலை உணவுக்கு முன்' : '🍽️ Before Breakfast';
    }
    if (drug.foodRelation === 'with_meal') {
      return language === 'ta' ? '🍽️ உணவோடு சேர்த்து' : '🍽️ With Meals';
    }
    if (drug.foodRelation === 'empty_stomach') {
      return language === 'ta' ? '🍽️ வெறும் வயிற்றில்' : '🍽️ Empty Stomach';
    }
    if (drug.afternoon && !drug.morning) {
      return language === 'ta' ? '🍽️ மதிய உணவுக்குப் பின்' : '🍽️ After Lunch';
    }
    return language === 'ta' ? '🍽️ உணவுக்குப் பின்' : '🍽️ After Food';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
            {language === 'ta' ? 'மாத்திரை அட்டவணை & பாதுகாப்பு' : 'Dosage Schedule & Safety'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            {language === 'ta'
              ? 'மருந்து உட்கொள்ளும் நேரங்கள் மற்றும் எளிய பாதுகாப்பு எச்சரிக்கைகள்'
              : 'Clear timing schedule, food relations & simplified safety checks'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Clinical Safety Filter</span>
        </div>
      </div>

      {/* Empty State when no drugs are in prescription */}
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
              Take a photo or upload an image to decode your medicines, or enter them on the scan page.
            </p>
          </div>
          <button
            onClick={onNavigateBackToScan}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Go to Prescription Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* SIMPLIFIED 2-SENTENCE PATIENT ALERT (NO JARGON) */}
          {hasInteraction ? (
            <div className="rounded-xl sm:rounded-2xl border border-rose-300 bg-rose-50 p-3.5 sm:p-5 shadow-xs text-rose-950">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-200 text-rose-900">
                    {language === 'ta' ? 'முக்கிய எச்சரிக்கை' : 'Safety Alert'}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-rose-900 leading-snug">
                    {language === 'ta'
                      ? '⚠️ மருந்து முரண்பாடு எச்சரிக்கை: இந்த மருந்துகளை ஒன்றாக உட்கொள்வது வயிற்று எரிச்சல் அல்லது இரத்தப்போக்கை ஏற்படுத்தக்கூடும். உங்கள் மருத்துவரை அணுகவும்.'
                      : '⚠️ Drug Interaction Warning: Taking these medicines together can cause stomach irritation or bleeding. Consult your doctor.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-2.5 text-emerald-900 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                {language === 'ta'
                  ? '✓ மருந்து முரண்பாடுகள் எதுவும் இல்லை. அட்டவணைப்படி உட்கொள்ளலாம்.'
                  : '✓ No dangerous drug interactions detected. Safe to take as scheduled.'}
              </span>
            </div>
          )}

          {/* Multilingual Voice Explanation Buttons */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  {language === 'ta' ? 'குரல் வழிகாட்டுதல்' : 'Spoken Directions for Patients'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Clear audio readout in English or தமிழ்
                </p>
              </div>
            </div>

            {/* Two Large Voice Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <button
                onClick={() => handlePlayAudio('en')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSpeaking && activeSpeechLang === 'en'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking && activeSpeechLang === 'en' ? 'Stop' : '🔊 Listen in English'}</span>
              </button>

              <button
                onClick={() => handlePlayAudio('ta')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSpeaking && activeSpeechLang === 'ta'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/30'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking && activeSpeechLang === 'ta' ? 'நிறுத்து' : '🔊 தமிழில் கேட்க'}</span>
              </button>
            </div>
          </div>

          {/* Clean, Compact Medicine Cards */}
          <div className="space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 px-1">
              {language === 'ta' ? 'மருந்து அட்டவணை விபரம்:' : 'Scheduled Daily Medications:'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {drugs.map((drug) => (
                <div
                  key={drug.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5"
                >
                  {/* Medicine Name (bold) + Dosage */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                        {drug.name}
                      </h4>
                      <span className="text-xs font-bold font-mono text-emerald-700">
                        {drug.strength}
                      </span>
                    </div>

                    {/* Timing Badge */}
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {getFoodTimingBadge(drug)}
                    </span>
                  </div>

                  {/* Visual Dose Pills: [ 🌅 Morning: 1 ] [ ☀️ Noon: 0 ] [ 🌙 Night: 1 ] */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div
                      className={`text-center py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                        drug.morning
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      🌅 Morning: {drug.morning ? '1' : '0'}
                    </div>

                    <div
                      className={`text-center py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                        drug.afternoon
                          ? 'bg-orange-100 text-orange-900 border border-orange-300'
                          : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      ☀️ Noon: {drug.afternoon ? '1' : '0'}
                    </div>

                    <div
                      className={`text-center py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                        drug.night
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          : 'bg-slate-50 text-slate-400 border border-slate-200'
                      }`}
                    >
                      🌙 Night: {drug.night ? '1' : '0'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Button */}
          <div className="pt-2">
            <button
              onClick={onNavigateNext}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>{language === 'ta' ? 'அலாரம் மற்றும் ரீஃபில் பகுதிக்குச் செல்ல' : 'Go to Reminders & Refill Tracker'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
