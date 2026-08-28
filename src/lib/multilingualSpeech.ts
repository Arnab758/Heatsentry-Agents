// High-speed, high-reliability multilingual audio and speech engine for HeatSentry
// Handles Arabic (AR / 'ar'), Hindi (HI / 'hi'), and English (EN / 'en') across all browsers and operating systems.

declare global {
  interface Window {
    responsiveVoice?: {
      speak: (
        text: string,
        voice: string,
        parameters?: {
          pitch?: number;
          rate?: number;
          volume?: number;
          onstart?: () => void;
          onend?: () => void;
          onerror?: (e: any) => void;
        }
      ) => void;
      cancel: () => void;
      voiceSupport: () => boolean;
      isPlaying: () => boolean;
      getVoices?: () => Array<{ name: string }>;
    };
  }
}

let activeAudioSource: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentBlobUrl: string | null = null;

// Client-side Blob URL cache for instant repeat playback
const clientAudioCache = new Map<string, string>();

export type SupportedLanguage = 'EN' | 'AR' | 'HI' | 'en' | 'ar' | 'hi' | string;

export interface SpeechPlayOptions {
  lang: SupportedLanguage;
  text: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Normalizes any input language code (e.g., 'ar', 'AR', 'ar-SA', 'arabic', 'العربية')
 * to standard internal key: 'AR', 'HI', or 'EN'.
 */
export function normalizeLanguageCode(lang: SupportedLanguage): 'AR' | 'HI' | 'EN' {
  if (!lang) return 'EN';
  const clean = String(lang).trim().toLowerCase();
  if (
    clean === 'ar' ||
    clean.startsWith('ar-') ||
    clean.startsWith('ar_') ||
    clean.includes('arabic') ||
    clean.includes('عربي') ||
    clean.includes('العربية')
  ) {
    return 'AR';
  }
  if (
    clean === 'hi' ||
    clean.startsWith('hi-') ||
    clean.startsWith('hi_') ||
    clean.includes('hindi') ||
    clean.includes('हिन्दी')
  ) {
    return 'HI';
  }
  return 'EN';
}

/**
 * Explicit Voice Selection Map for ResponsiveVoice
 */
export const RESPONSIVE_VOICE_MAP: Record<'AR' | 'HI' | 'EN', string> = {
  AR: 'Arabic Female',
  HI: 'Hindi Female',
  EN: 'US English Female',
};

export function stopSpeech(): void {
  // 1. Stop active HTML5 audio element
  if (activeAudioSource) {
    try {
      activeAudioSource.pause();
      activeAudioSource.currentTime = 0;
    } catch {}
    activeAudioSource = null;
  }

  // 2. Stop ResponsiveVoice if active
  if (typeof window !== 'undefined' && window.responsiveVoice) {
    try {
      window.responsiveVoice.cancel();
    } catch {}
  }

  // 3. Stop standard SpeechSynthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  activeUtterance = null;
}

/**
 * Pre-warms/caches emergency broadcast audio so playback starts with zero latency
 */
export async function prewarmAudio(lang: SupportedLanguage, text: string): Promise<void> {
  const normalizedLang = normalizeLanguageCode(lang);
  const cacheKey = `${normalizedLang}:${text.trim()}`;
  if (clientAudioCache.has(cacheKey)) return;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), lang: normalizedLang }),
    });
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 100) {
        const url = URL.createObjectURL(blob);
        clientAudioCache.set(cacheKey, url);
      }
    }
  } catch {}
}

/**
 * Instant playback: Checks cached blob -> checks server TTS with short abort timeout -> falls back immediately
 */
export async function playSpeech({ lang, text, onStart, onEnd, onError }: SpeechPlayOptions): Promise<void> {
  stopSpeech();

  const normalizedLang = normalizeLanguageCode(lang);
  const cleanText = text.trim();
  const cacheKey = `${normalizedLang}:${cleanText}`;
  let hasEnded = false;

  const handleEnd = () => {
    if (!hasEnded) {
      hasEnded = true;
      activeAudioSource = null;
      activeUtterance = null;
      if (onEnd) onEnd();
    }
  };

  const handleError = (e: any) => {
    if (!hasEnded) {
      hasEnded = true;
      activeAudioSource = null;
      activeUtterance = null;
      if (onError) onError(e);
      else if (onEnd) onEnd();
    }
  };

  if (onStart) onStart();

  // Instant Check: Already cached in memory
  if (clientAudioCache.has(cacheKey)) {
    const cachedUrl = clientAudioCache.get(cacheKey)!;
    const audio = new Audio(cachedUrl);
    activeAudioSource = audio;
    audio.onended = handleEnd;
    audio.onerror = () => {
      activeAudioSource = null;
      fallbackToClientEngines(normalizedLang, cleanText, handleEnd, handleError);
    };
    try {
      await audio.play();
      return;
    } catch {
      // Fall through to live engine
    }
  }

  // Fast Server-side TTS with an abort controller to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2400); // 2.4s max wait before fast local fallback

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        text: cleanText,
        lang: normalizedLang,
      }),
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const audioBlob = await response.blob();
      if (audioBlob && audioBlob.size > 100) {
        const audioUrl = URL.createObjectURL(audioBlob);
        clientAudioCache.set(cacheKey, audioUrl);
        currentBlobUrl = audioUrl;
        const audio = new Audio(audioUrl);
        activeAudioSource = audio;

        audio.onended = handleEnd;
        audio.onerror = () => {
          activeAudioSource = null;
          fallbackToClientEngines(normalizedLang, cleanText, handleEnd, handleError);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        return;
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Fast server TTS bypassed, switching to immediate client engine:', err);
  }

  // Fast Client-Side Fallback
  fallbackToClientEngines(normalizedLang, cleanText, handleEnd, handleError);
}

function fallbackToClientEngines(
  normalizedLang: 'AR' | 'HI' | 'EN',
  text: string,
  onEnd: () => void,
  onError: (e: any) => void
) {
  // Tier 2: ResponsiveVoice (Zero delay if script is present)
  if (typeof window !== 'undefined' && window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
    const rvVoice = RESPONSIVE_VOICE_MAP[normalizedLang];
    try {
      window.responsiveVoice.speak(text, rvVoice, {
        rate: normalizedLang === 'AR' ? 0.95 : 1.0,
        pitch: 1,
        onend: onEnd,
        onerror: () => {
          fallbackToNativeSpeech(normalizedLang, text, onEnd, onError);
        },
      });
      return;
    } catch {
      // Proceed to Tier 3
    }
  }

  // Tier 3: Native Web Speech API
  fallbackToNativeSpeech(normalizedLang, text, onEnd, onError);
}

function fallbackToNativeSpeech(
  lang: 'AR' | 'HI' | 'EN',
  text: string,
  onEnd: () => void,
  onError: (e: any) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    setTimeout(onEnd, 1000);
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;

    const voices = window.speechSynthesis.getVoices();

    if (lang === 'AR') {
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      const arVoice = voices.find((v) => {
        const l = (v.lang || '').toLowerCase();
        const n = (v.name || '').toLowerCase();
        return (
          l.startsWith('ar') ||
          n.includes('arabic') ||
          n.includes('saudi') ||
          n.includes('maged') ||
          n.includes('tarik') ||
          n.includes('laila') ||
          n.includes('zeina') ||
          n.includes('hoda') ||
          n.includes('naayf') ||
          n.includes('salma') ||
          n.includes('shakir') ||
          n.includes('zayd')
        );
      });
      if (arVoice) {
        utterance.voice = arVoice;
      }
    } else if (lang === 'HI') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      const hiVoice = voices.find((v) => {
        const l = (v.lang || '').toLowerCase();
        const n = (v.name || '').toLowerCase();
        return (
          l.startsWith('hi') ||
          n.includes('hindi') ||
          n.includes('india') ||
          n.includes('kalpana') ||
          n.includes('hemant')
        );
      });
      if (hiVoice) {
        utterance.voice = hiVoice;
      }
    } else {
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      const enVoice = voices.find((v) => {
        const l = (v.lang || '').toLowerCase();
        const n = (v.name || '').toLowerCase();
        return (
          (l.startsWith('en') || n.includes('english')) &&
          (n.includes('natural') || n.includes('google') || n.includes('samantha') || n.includes('daniel') || n.includes('us'))
        );
      }) || voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));

      if (enVoice) {
        utterance.voice = enVoice;
      }
    }

    utterance.onend = () => {
      activeUtterance = null;
      onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        onError(e);
      } else {
        onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Web Speech fallback error:', err);
    onEnd();
  }
}
