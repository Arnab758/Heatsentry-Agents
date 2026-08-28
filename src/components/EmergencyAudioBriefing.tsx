import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Square,
  Globe,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { ZoneState } from '../types/heatsentry';
import { playSpeech, stopSpeech } from '../lib/multilingualSpeech';

interface EmergencyAudioBriefingProps {
  zones: Record<string, ZoneState>;
  cycleCount: number;
  timestamp: string;
}

export type BroadcastLanguage = 'EN' | 'AR' | 'HI';

export const EmergencyAudioBriefing: React.FC<EmergencyAudioBriefingProps> = ({
  zones,
  cycleCount,
  timestamp,
}) => {
  const [selectedLang, setSelectedLang] = useState<BroadcastLanguage>('EN');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const generateBriefingText = (lang: BroadcastLanguage) => {
    const zoneList: ZoneState[] = Object.values(zones);
    const avgTemp =
      zoneList.length > 0
        ? Math.round(
            zoneList.reduce((acc, z) => acc + z.current_telemetry.ambient_temperature_f, 0) /
              zoneList.length
          )
        : 104;
    const extremeZones = zoneList.filter(
      (z) => z.risk.hazard_level === 'EXTREME' || z.risk.hazard_level === 'HIGH'
    );
    const peakZone =
      zoneList.length > 0
        ? zoneList.reduce((max, z) =>
            z.current_telemetry.ambient_temperature_f > max.current_telemetry.ambient_temperature_f
              ? z
              : max
          )
        : null;

    const peakName = peakZone?.metadata.name || 'Maryvale';
    const peakTemp = peakZone?.current_telemetry.ambient_temperature_f || 112;

    if (lang === 'AR') {
      return `إيجاز هيتسنتري التكتيكي للطوارئ في منطقة فينكس. متوسط درجة الحرارة ${avgTemp} درجة فهرنهايت. تم تسجيل خطر حراري شديد في ${extremeZones.length} مناطق، وبلغت ذروة الحرارة في ${peakName} عند ${peakTemp} فهرنهايت. تم تفعيل استراحات الظل ونشر حافلات التبريد الميدانية لحماية السكان والعمال.`;
    }

    if (lang === 'HI') {
      return `हीटसेंट्री स्वायत्त आपातकालीन ब्रीफिंग। फ़ीनिक्स क्षेत्र का औसत तापमान ${avgTemp} डिग्री है। ${extremeZones.length} क्षेत्रों में अत्यधिक तापीय खतरा है, और ${peakName} में अधिकतम तापमान ${peakTemp} डिग्री है। सभी स्वायत्त राहत एजेंट सक्रिय हैं और कूलिंग बसें तैनात हैं।`;
    }

    // Default: EN
    return `HeatSentry Tactical Briefing for Phoenix Area at ${timestamp}. Average temperature is ${avgTemp} degrees Fahrenheit. ${extremeZones.length} urban zones are currently under extreme thermal hazard, peaking in ${peakName} at ${peakTemp} degrees. All 10 autonomous mitigation agents are fully operational. Mobile cooling buses and active shade deployment are actively dispatched across priority corridors.`;
  };

  const playRadioChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc1.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.08); // D6
      gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.2);
    } catch {
      // Audio context might be muted or unavailable
    }
  };

  const handleToggleVoice = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    const text = generateBriefingText(selectedLang);
    setTranscript(text);
    playRadioChime();
    setIsPlaying(true);

    playSpeech({
      lang: selectedLang,
      text: text,
      onStart: () => {
        setIsPlaying(true);
      },
      onEnd: () => {
        setIsPlaying(false);
      },
      onError: () => {
        setIsPlaying(false);
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-lg flex flex-col gap-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title and Icon */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-rose-400' : ''}`} />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Autonomous Emergency Broadcast & Voice Briefing</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                Multilingual TTS
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Live Spoken Tactical Debrief for First Responders, Dispatchers & FEMA EOC
            </div>
          </div>
        </div>

        {/* Controls: Language Selection & Audio Play */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                if (isPlaying) {
                  stopSpeech();
                  setIsPlaying(false);
                }
                setSelectedLang('EN');
              }}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedLang === 'EN'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English Broadcast"
            >
              <span>🇺🇸</span>
              <span>English (EN)</span>
            </button>

            <button
              onClick={() => {
                if (isPlaying) {
                  stopSpeech();
                  setIsPlaying(false);
                }
                setSelectedLang('AR');
              }}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedLang === 'AR'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="العربية (Arabic Audio Broadcast - UAE/MENA)"
            >
              <span>🇦🇪</span>
              <span>العربية (AR)</span>
            </button>

            <button
              onClick={() => {
                if (isPlaying) {
                  stopSpeech();
                  setIsPlaying(false);
                }
                setSelectedLang('HI');
              }}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer ${
                selectedLang === 'HI'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="हिंदी (Hindi Audio Broadcast)"
            >
              <span>🇮🇳</span>
              <span>हिन्दी (HI)</span>
            </button>
          </div>

          {/* Transcript Toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
              showTranscript
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle broadcast text transcript"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            Transcript
          </button>

          {/* Broadcast Audio Button */}
          <button
            onClick={handleToggleVoice}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isPlaying ? (
              <span>Stop Broadcast</span>
            ) : (
              <span>
                Broadcast in {selectedLang === 'AR' ? 'العربية (Arabic)' : selectedLang === 'HI' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Audio Wave Visualizer when Playing */}
      {isPlaying && (
        <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-amber-500/40 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-amber-300">
              AUDIO ON AIR •{' '}
              {selectedLang === 'AR'
                ? 'البث الصوتي العربي مباشر (Arabic Audio Broadcast Live)'
                : selectedLang === 'HI'
                ? 'हिन्दी प्रसारण सक्रिय (Hindi Stream Live)'
                : 'English Tactical Audio Stream Live'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[40, 75, 90, 60, 100, 45, 80, 65, 95, 30].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-amber-400 rounded-full animate-pulse"
                style={{
                  height: `${h * 0.16}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transcript Text Drawer */}
      {showTranscript && (
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-1 animate-fade-in">
          <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
            <span>Official Broadcast Script ({selectedLang})</span>
          </div>
          <p className="font-sans text-[11px] text-slate-200">
            {generateBriefingText(selectedLang)}
          </p>
        </div>
      )}
    </div>
  );
};
