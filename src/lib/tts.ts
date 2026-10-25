// Web Speech API + Web Audio Synthesizer Engine for 100% reliable sound & voice
export type SupportedLang = 'en' | 'hi' | 'mr';

class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public isSpeaking = false;
  public rate = 1.0;
  public lang: SupportedLang = 'en';
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private audioUnlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }

      // Pre-warm audio unlock on first user interaction
      const unlockAudio = () => {
        this.unlockAudioContext();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);
    }
  }

  private unlockAudioContext() {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.audioUnlocked = true;
    } catch (e) {
      console.warn('AudioContext unlock notice:', e);
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.cachedVoices.length > 0) return this.cachedVoices;
    this.cachedVoices = this.synth.getVoices();
    return this.cachedVoices;
  }

  public checkVoiceAvailability(targetLang: SupportedLang): boolean {
    const voices = this.getAvailableVoices();
    if (targetLang === 'en') return true;
    const prefix = targetLang === 'hi' ? 'hi' : 'mr';
    return voices.some(v => v.lang.toLowerCase().startsWith(prefix));
  }

  /**
   * Generates audible synthesized chime tones using Web Audio API (100% reliable in every browser)
   */
  public playTone(frequency: number = 520, durationMs: number = 200, type: OscillatorType = 'sine') {
    try {
      this.unlockAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Tone play notice:', e);
    }
  }

  /**
   * Pleasant double-ding for waypoint advancement or instruction announcements
   */
  public playWaypointDing() {
    this.playTone(660, 120, 'sine');
    setTimeout(() => this.playTone(880, 180, 'sine'), 130);
  }

  /**
   * Alert warning chime for replanning or route change
   */
  public playAlertChime() {
    this.playTone(440, 160, 'triangle');
    setTimeout(() => this.playTone(550, 220, 'triangle'), 180);
  }

  /**
   * SOS Siren tone
   */
  public playSosSiren() {
    this.playTone(800, 300, 'sawtooth');
    setTimeout(() => this.playTone(600, 300, 'sawtooth'), 320);
  }

  /**
   * Robust multi-tier speech synthesis with automatic language & voice fallback
   */
  public speak(
    text: string,
    options?: {
      lang?: SupportedLang;
      rate?: number;
      chime?: boolean;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!this.synth || !text) return;

    // Optional audio chime before voice
    if (options?.chime !== false) {
      this.playTone(720, 80, 'sine');
    }

    try {
      // 1. Cancel any previous stuck utterance and resume engine
      this.synth.cancel();
      if (this.synth.paused) {
        this.synth.resume();
      }

      const selectedLang = options?.lang || this.lang;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || this.rate;

      const voices = this.getAvailableVoices();

      // Find best matched voice:
      // Priority 1: Native language voice (hi-IN, mr-IN)
      // Priority 2: Indian English voice (en-IN) which pronounces Hindi/Marathi terms accurately
      // Priority 3: Any clear English/system default
      let voice: SpeechSynthesisVoice | undefined;

      if (selectedLang === 'hi') {
        voice = voices.find(v => v.lang.toLowerCase().startsWith('hi')) ||
                voices.find(v => v.lang.toLowerCase().includes('in')) ||
                voices.find(v => v.lang.toLowerCase().startsWith('en'));
        utterance.lang = voice?.lang || 'hi-IN';
      } else if (selectedLang === 'mr') {
        voice = voices.find(v => v.lang.toLowerCase().startsWith('mr')) ||
                voices.find(v => v.lang.toLowerCase().startsWith('hi')) ||
                voices.find(v => v.lang.toLowerCase().includes('in')) ||
                voices.find(v => v.lang.toLowerCase().startsWith('en'));
        utterance.lang = voice?.lang || 'mr-IN';
      } else {
        voice = voices.find(v => v.lang.toLowerCase().startsWith('en-in')) ||
                voices.find(v => v.lang.toLowerCase().startsWith('en'));
        utterance.lang = voice?.lang || 'en-US';
      }

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (options?.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('TTS utterance notice:', e?.error || e);
        this.isSpeaking = false;
        // If speech fails because of language pack absence on Windows, retry immediately with system default
        if (selectedLang !== 'en' && this.synth) {
          try {
            console.info('[TTS] Retrying with universal system default voice.');
            const fallback = new SpeechSynthesisUtterance(text);
            fallback.rate = options?.rate || this.rate;
            fallback.lang = 'en-US';
            fallback.onend = () => {
              this.isSpeaking = false;
              if (options?.onEnd) options.onEnd();
            };
            this.synth.speak(fallback);
            return;
          } catch (_) {}
        }
        if (options?.onError) options.onError();
      };

      this.currentUtterance = utterance;

      // Small 30ms timeout helps Chrome on Windows avoid dropping first words
      setTimeout(() => {
        if (this.synth) {
          this.synth.speak(utterance);
        }
      }, 30);
    } catch (err) {
      console.warn('Speech error fallback:', err);
      if (options?.onError) options.onError();
    }
  }

  public stop() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    } catch (_) {}
  }
}

export const tts = new TextToSpeechService();
