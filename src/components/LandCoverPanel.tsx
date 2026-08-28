import React from 'react';
import { Trees, Building2, Droplets, Waves, Fence } from 'lucide-react';

interface LandCoverData {
  available: boolean;
  segments: Record<string, number>;
  impervious_pct: number;
  green_pct: number;
  tree_canopy_pct: number;
}

interface ZoneLandCover {
  name: string;
  land_cover: LandCoverData;
}

interface LandCoverPanelProps {
  zones: Record<string, any>;
}

const SEGMENT_COLORS: Record<string, { bg: string; label: string; icon: React.ReactNode }> = {
  building: { bg: 'bg-slate-500', label: 'Buildings', icon: <Building2 className="w-3 h-3" /> },
  road: { bg: 'bg-zinc-600', label: 'Roads', icon: <Fence className="w-3 h-3" /> },
  pavement: { bg: 'bg-zinc-500', label: 'Pavement', icon: <Fence className="w-3 h-3" /> },
  tree: { bg: 'bg-emerald-600', label: 'Trees', icon: <Trees className="w-3 h-3" /> },
  grass: { bg: 'bg-green-500', label: 'Grass', icon: <Droplets className="w-3 h-3" /> },
  soil: { bg: 'bg-amber-700', label: 'Soil', icon: <Waves className="w-3 h-3" /> },
  water: { bg: 'bg-blue-500', label: 'Water', icon: <Droplets className="w-3 h-3" /> },
  sky: { bg: 'bg-cyan-400', label: 'Sky', icon: <Waves className="w-3 h-3" /> },
};

export const LandCoverPanel: React.FC<LandCoverPanelProps> = ({ zones }) => {
  const zoneEntries = Object.entries(zones) as [string, ZoneLandCover][];
  if (zoneEntries.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-slate-400 text-sm">
        No satellite land-cover data available yet. Sync with FortyGuard API first.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Trees className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Satellite Land-Cover Diagnosis</h3>
          <p className="text-[11px] text-slate-400">Why is this zone hot? Surface composition from FortyGuard satellite segmentation.</p>
        </div>
      </div>

      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {zoneEntries.map(([zid, zdata]) => {
          const lc = zdata.land_cover;
          if (!lc.available) return null;
          const total = Object.values(lc.segments).reduce((a, b) => a + b, 0) || 1;

          return (
            <div key={zid} className="bg-slate-950/80 rounded-lg border border-slate-800 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{zdata.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${lc.impervious_pct > 60 ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'}`}>
                  {lc.impervious_pct}% Impervious
                </span>
              </div>

              {/* Stacked bar chart */}
              <div className="flex h-5 rounded-full overflow-hidden mb-2 bg-slate-800">
                {Object.entries(lc.segments)
                  .filter(([, v]) => v > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, pct]) => (
                    <div
                      key={key}
                      className={`${SEGMENT_COLORS[key]?.bg || 'bg-slate-600'} transition-all`}
                      style={{ width: `${(pct / total) * 100}%` }}
                      title={`${SEGMENT_COLORS[key]?.label || key}: ${pct}%`}
                    />
                  ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                {Object.entries(lc.segments)
                  .filter(([, v]) => v > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, pct]) => (
                    <span key={key} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-sm ${SEGMENT_COLORS[key]?.bg || 'bg-slate-600'} inline-block`} />
                      {SEGMENT_COLORS[key]?.label || key}: {pct}%
                    </span>
                  ))}
              </div>

              {/* Key insight */}
              <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800/50">
                {lc.tree_canopy_pct < 10 ? (
                  <span className="text-amber-400">
                    <Trees className="w-3 h-3 inline mr-1" />
                    Critically low canopy ({lc.tree_canopy_pct}%) — tree planting recommended
                  </span>
                ) : lc.green_pct > 30 ? (
                  <span className="text-emerald-400">
                    <Trees className="w-3 h-3 inline mr-1" />
                    Good vegetation cover ({lc.green_pct}%) — natural cooling present
                  </span>
                ) : (
                  <span>
                    Impervious: {lc.impervious_pct}% | Green: {lc.green_pct}% | Canopy: {lc.tree_canopy_pct}%
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
