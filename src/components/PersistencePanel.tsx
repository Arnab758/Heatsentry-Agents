import React from 'react';
import { Clock, Thermometer, Timer, AlertTriangle } from 'lucide-react';

interface PersistenceData {
  name: string;
  exceedance_hours: number | null;
  persistence_hours: number | null;
  persistence_max_hours: number | null;
  peak_hour_utc: number | null;
  peak_hour_local: number | null;
}

interface PersistencePanelProps {
  zones: Record<string, any>;
}

const formatHour = (h: number | null): string => {
  if (h === null) return '--';
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${min.toString().padStart(2, '0')} ${ampm}`;
};

export const PersistencePanel: React.FC<PersistencePanelProps> = ({ zones }) => {
  const zoneEntries = Object.entries(zones) as [string, PersistenceData][];
  if (zoneEntries.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-slate-400 text-sm">
        No persistence data available yet. Sync with FortyGuard API first.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Timer className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Heat Persistence & Peak Timing</h3>
          <p className="text-[11px] text-slate-400">How long does the heat LAST? When does each zone peak? From FortyGuard heatmap analytics.</p>
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {zoneEntries.map(([zid, zdata]) => {
          const isDangerous = (zdata.persistence_max_hours ?? 0) >= 5;
          return (
            <div key={zid} className={`bg-slate-950/80 rounded-lg border p-3 ${isDangerous ? 'border-amber-500/40' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{zdata.name}</span>
                {isDangerous && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/50">
                    LONG UNBROKEN HEAT
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Exceedance vs Persistence */}
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    Total Exceedance
                  </div>
                  <div className="text-sm font-mono font-black text-rose-400">
                    {zdata.exceedance_hours !== null ? `${zdata.exceedance_hours}h` : '--'}
                  </div>
                  <div className="text-[9px] text-slate-500">above 105°F total</div>
                </div>

                <div className={`bg-slate-900/80 p-2 rounded border ${isDangerous ? 'border-amber-500/40' : 'border-slate-800'}`}>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Longest Stretch
                  </div>
                  <div className={`text-sm font-mono font-black ${isDangerous ? 'text-amber-400' : 'text-amber-300'}`}>
                    {zdata.persistence_max_hours !== null ? `${zdata.persistence_max_hours}h` : '--'}
                  </div>
                  <div className="text-[9px] text-slate-500">unbroken max</div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Peak Time (Local)
                  </div>
                  <div className="text-sm font-mono font-black text-cyan-300">
                    {formatHour(zdata.peak_hour_local)}
                  </div>
                  <div className="text-[9px] text-slate-500">hottest moment</div>
                </div>
              </div>

              {/* Insight text */}
              <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800/50">
                {zdata.persistence_max_hours !== null && zdata.persistence_max_hours >= 6 ? (
                  <span className="text-amber-400">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {zdata.persistence_max_hours}h unbroken heat — far more dangerous than intermittent exposure. Prioritize cooling.
                  </span>
                ) : zdata.peak_hour_local !== null && zdata.peak_hour_local >= 20 ? (
                  <span className="text-purple-400">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Nighttime heat island — peaks at {formatHour(zdata.peak_hour_local)}. Elderly without AC at highest risk.
                  </span>
                ) : zdata.peak_hour_local !== null && zdata.peak_hour_local >= 14 && zdata.peak_hour_local <= 17 ? (
                  <span className="text-rose-400">
                    <Thermometer className="w-3 h-3 inline mr-1" />
                    Afternoon peak at {formatHour(zdata.peak_hour_local)} — outdoor workers at maximum exposure.
                  </span>
                ) : (
                  <span>
                    Exceedance: {zdata.exceedance_hours}h | Longest stretch: {zdata.persistence_max_hours}h | Peak: {formatHour(zdata.peak_hour_local)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
