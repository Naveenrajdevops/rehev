/**
 * Web Speech API synthesizer for Nova Audio Coaching
 */
export class AudioCoach {
  private enabled = true;
  private volume = 0.85;
  private rate = 1.05;
  private pitch = 1.0;
  private lastSpokenTime = 0;
  private minIntervalMs = 2200; // Prevent spamming

  constructor() {
    // Check if SpeechSynthesis is available in browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up voices
      window.speechSynthesis.getVoices();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public speak(text: string, priority = false) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const now = Date.now();
    if (!priority && now - this.lastSpokenTime < this.minIntervalMs) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any trailing utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      // Prefer a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Samantha') || v.name.includes('Victoria')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
      if (preferred) {
        utterance.voice = preferred;
      }

      this.lastSpokenTime = now;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis notice:", e);
    }
  }

  public speakRepCount(repNumber: number) {
    const encouragement = repNumber % 5 === 0 ? `, great form!` : "";
    this.speak(`${repNumber}${encouragement}`, true);
  }

  public speakFeedback(message: string) {
    this.speak(message, false);
  }

  public speakCompletion() {
    this.speak("Target repetitions completed! Outstanding effort.", true);
  }
}

export const audioCoach = new AudioCoach();
