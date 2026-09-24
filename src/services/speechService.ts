/**
 * Audio Synthesizer and Speech Service
 * Provides realistic medical alert chimes, haptic feedback, and bilingual speech (English & Tamil).
 */

class AudioSpeechService {
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a distinct 3-tone clinical alert chime
   */
  public playAlertChime(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Note sequence: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz)
      const frequencies = [659.25, 830.61, 987.77];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        // Envelope
        gain.gain.setValueAtTime(0, now + idx * 0.16);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.16 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.38);
      });
    } catch {
      // AudioContext may require user gesture on some strict browsers
    }
  }

  /**
   * Triggers device haptic feedback if supported
   */
  public triggerHaptic(pattern: number[] = [200, 100, 200, 100, 400]): boolean {
    if (typeof window !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        return navigator.vibrate(pattern);
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Speaks text using window.speechSynthesis in English or Tamil
   */
  public speak(
    text: string,
    lang: 'en' | 'ta',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: unknown) => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError?.(new Error('Speech synthesis not supported in this browser.'));
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Find best voice
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'ta') {
        utterance.lang = 'ta-IN';
        const tamilVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('ta') || v.name.toLowerCase().includes('tamil')
        );
        if (tamilVoice) {
          utterance.voice = tamilVoice;
        }
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
      } else {
        utterance.lang = 'en-US';
        const engVoice = voices.find(
          (v) => (v.lang === 'en-US' || v.lang === 'en-GB') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.default)
        );
        if (engVoice) {
          utterance.voice = engVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        onError?.(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      onError?.(err);
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
}

export const soundAndVoice = new AudioSpeechService();
