import React from 'react';
import { Wind, AlertTriangle, Shield, Activity } from 'lucide-react';

interface AirQualityData {
  aqi_hourly: number[] | null;
  aqi_avg: number | null;
  aqi_peak: number | null;
  aqi_category: string | null;
  humidity_avg_pct: number | null;
  humidity_peak_pct: number | null;
  health_warning: boolean;
}

interface ZoneAirQuality {
  name: string;
  air_quality: AirQualityData;
}

interface AirQualityPanelProps {
  zones: Record<string, any>;
}

const getAQIColor = (aqi: number | null): string => {
  if (aqi === null) return 'text-slate-400';
  if (aqi <= 50) return 'text-emerald-400';
  if (aqi <= 100) return 'text-amber-400';
  if (aqi <= 150) return 'text-orange-400';
  if (aqi <= 200) return 'text-red-400';
  return 'text-purple-400';
};

const getAQIBg = (aqi: number | null): string => {
  if (aqi === null) return 'bg-slate-800 border-slate-700';
  if (aqi <= 50) return 'bg-emerald-950 border-emerald-500/40';
  if (aqi <= 100) return 'bg-amber-950 border-amber-500/40';
  if (aqi <= 150) return 'bg-orange-950 border-orange-500/40';
  if (aqi <= 200) return 'bg-red-950 border-red-500/40';
  return 'bg-purple-950 border-purple-500/40';
};

export const AirQualityPanel: React.FC<AirQualityPanelProps> = ({ zones }) => {
  const zoneEntries = Object.entries(zones) as [string, ZoneAirQuality][];
  if (zoneEntries.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-slate-400 text-sm">
        No air quality data available yet. Sync with FortyGuard API first.
      </div>
    );
  }

  const warningZones = zoneEntries.filter(([, z]) => z.air_quality.health_warning);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Air Quality & Environmental Profile</h3>
            <p className="text-[11px] text-slate-400">AQI, humidity, and health risk from FortyGuard env_params.</p>
          </div>
        </div>
        {warningZones.length > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-500/50 text-[10px] font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            {warningZones.length} zone{warningZones.length > 1 ? 's' : ''} with health warnings
          </span>
        )}
      </div>

      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {zoneEntries.map(([zid, zdata]) => {
          const aq = zdata.air_quality;
          if (aq.aqi_avg === null) return null;

          return (
            <div key={zid} className={`bg-slate-950/80 rounded-lg border p-3 ${getAQIBg(aq.aqi_avg)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{zdata.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getAQIColor(aq.aqi_avg)} bg-slate-900/80 border border-slate-700`}>
                  {aq.aqi_category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">AQI Average</div>
                  <div className={`text-sm font-mono font-black ${getAQIColor(aq.aqi_avg)}`}>
                    {aq.aqi_avg}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">AQI Peak</div>
                  <div className={`text-sm font-mono font-black ${getAQIColor(aq.aqi_peak)}`}>
                    {aq.aqi_peak}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Humidity Avg</div>
                  <div className="text-sm font-mono font-bold text-cyan-300">
                    {aq.humidity_avg_pct}%
                  </div>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Humidity Peak</div>
                  <div className="text-sm font-mono font-bold text-cyan-300">
                    {aq.humidity_peak_pct}%
                  </div>
                </div>
              </div>

              {/* AQI hourly mini-chart (sparkline) */}
              {aq.aqi_hourly && aq.aqi_hourly.length > 0 && (
                <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/50 mb-2">
                  <div className="text-[9px] text-slate-500 mb-1">24-Hour AQI Curve</div>
                  <div className="flex items-end gap-px h-6">
                    {aq.aqi_hourly.slice(0, 24).map((v, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${v > 150 ? 'bg-red-500' : v > 100 ? 'bg-orange-500' : v > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ height: `${Math.max(4, (v / 300) * 24)}px` }}
                        title={`${i}:00 — AQI ${v}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {aq.health_warning && (
                <div className="flex items-center gap-1.5 text-[11px] text-orange-400 bg-orange-950/50 p-1.5 rounded border border-orange-500/30">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Health advisory active — vulnerable populations at risk
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
