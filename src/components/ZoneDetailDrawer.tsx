import React from 'react';
import {
  X,
  Flame,
  Trees,
  Users,
  Shield,
  Droplets,
  Tent,
  Truck,
  Building2,
  AlertTriangle,
  Zap,
  Timer,
  Clock,
  Wind,
  BarChart3,
} from 'lucide-react';
import { ZoneState } from '../types/heatsentry';

interface ZoneDetailDrawerProps {
  zone: ZoneState | null;
  onClose: () => void;
  onInjectHeatSpike: (zoneId: string, deltaF: number) => void;
}

export const ZoneDetailDrawer: React.FC<ZoneDetailDrawerProps> = ({
  zone,
  onClose,
  onInjectHeatSpike,
}) => {
  if (!zone) return null;

  const deployed = zone.deployed_resources;
  const totalAssets = deployed.misting_trailers + deployed.mobile_shelters + deployed.hydration_vans;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{zone.metadata.name}</h3>
            <span className="text-xs text-slate-400 font-mono">Zone ID: {zone.metadata.id}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar text-xs">
        {/* Real-Time Risk Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Current Hazard Tier
            </span>
            <span
              className={`px-2 py-0.5 rounded font-black text-[11px] ${
                zone.risk.hazard_level === 'EXTREME'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500 animate-pulse'
                  : zone.risk.hazard_level === 'HIGH'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500'
                  : 'bg-amber-950 text-amber-300 border border-amber-500'
              }`}
            >
              {zone.risk.hazard_level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 font-mono">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">Heat Index (Rothfusz)</div>
              <div className="text-base font-bold text-rose-400">{zone.risk.heat_index}°F</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">WBGT Stull Eq.</div>
              <div className="text-base font-bold text-amber-400">{zone.risk.wbgt}°F</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">Composite Risk Score</div>
              <div className="text-base font-bold text-cyan-300">{zone.risk.risk_score} / 100</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">Surface Temp (Blacktop)</div>
              <div className="text-base font-bold text-orange-400">
                {zone.current_telemetry.surface_temperature_f}°F
              </div>
            </div>
          </div>
        </div>

        {/* Demographics & Vulnerability Breakdown */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Vulnerability Profile & Demographics
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Outdoor Workforce</div>
                <div className="font-mono font-bold text-slate-200">
                  {zone.metadata.outdoor_workers.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800">
              <Trees className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Tree Canopy Cover</div>
                <div className="font-mono font-bold text-slate-200">{zone.metadata.tree_canopy_pct}%</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] space-y-1">
            <div className="text-amber-400 font-bold">Primary Neighborhood Risks:</div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside">
              {zone.metadata.primary_risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Deployed Interventions */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <span>Active Asset Deployments</span>
            <span className="text-emerald-400 font-mono">{totalAssets} Assets Onsite</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-500">Misting</div>
              <div className="font-mono font-bold text-cyan-300">{deployed.misting_trailers}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <Tent className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-500">Shelters</div>
              <div className="font-mono font-bold text-amber-300">{deployed.mobile_shelters}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <Truck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] text-slate-500">Hydration</div>
              <div className="font-mono font-bold text-emerald-300">{deployed.hydration_vans}</div>
            </div>
          </div>
        </div>

        {/* OSHA Work-Rest Guideline */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            OSHA Work-Rest Mandate
          </div>
          <p className="text-[11px] leading-relaxed">{zone.risk.osha_work_rest_cycle}</p>
        </div>

        {/* Persistence & Timing (if available) */}
        {(zone as any).persistence_hours !== undefined && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              Heat Persistence & Timing
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">Total Exceedance</div>
                <div className="text-sm font-mono font-bold text-rose-400">
                  {(zone as any).exceedance_hours_f105 ?? (zone as any).forecast?.duration_hours ?? '--'}h
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">Longest Unbroken</div>
                <div className="text-sm font-mono font-bold text-amber-400">
                  {(zone as any).persistence_max_hours ?? '--'}h
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">Peak Time (Local)</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {(zone as any).peak_hour_local !== null && (zone as any).peak_hour_local !== undefined
                    ? `${Math.floor((zone as any).peak_hour_local)}:${String(Math.round(((zone as any).peak_hour_local % 1) * 60)).padStart(2, '0')}`
                    : '--'}
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">Peak Time (UTC)</div>
                <div className="text-sm font-mono font-bold text-slate-300">
                  {(zone as any).peak_hour_utc ?? '--'}h
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Land Cover (if available) */}
        {(zone as any).land_cover?.available && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              Satellite Land-Cover
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-slate-800">
              {(zone as any).land_cover.segments && Object.entries((zone as any).land_cover.segments)
                .filter(([, v]: [string, any]) => v > 0)
                .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
                .map(([key, pct]: [string, any]) => (
                  <div
                    key={key}
                    className={`${key === 'tree' || key === 'grass' ? 'bg-emerald-600' : key === 'building' ? 'bg-slate-500' : key === 'road' || key === 'pavement' ? 'bg-zinc-600' : 'bg-slate-600'}`}
                    style={{ width: `${pct}%` }}
                    title={`${key}: ${pct}%`}
                  />
                ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Impervious: <strong className="text-rose-400">{(zone as any).land_cover.impervious_pct}%</strong></span>
              <span>Green: <strong className="text-emerald-400">{(zone as any).land_cover.green_pct}%</strong></span>
              <span>Canopy: <strong className="text-emerald-300">{(zone as any).land_cover.tree_canopy_pct}%</strong></span>
            </div>
          </div>
        )}

        {/* Air Quality (if available) */}
        {(zone as any).air_quality?.aqi_avg !== null && (zone as any).air_quality?.aqi_avg !== undefined && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              Air Quality Profile
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">AQI Average</div>
                <div className={`text-sm font-mono font-bold ${(zone as any).air_quality.aqi_avg <= 50 ? 'text-emerald-400' : (zone as any).air_quality.aqi_avg <= 100 ? 'text-amber-400' : 'text-orange-400'}`}>
                  {(zone as any).air_quality.aqi_avg}
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">Category</div>
                <div className="text-xs font-bold text-slate-200">
                  {(zone as any).air_quality.aqi_category}
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">Humidity Avg</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {(zone as any).air_quality.humidity_avg_pct}%
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-500">Humidity Peak</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {(zone as any).air_quality.humidity_peak_pct}%
                </div>
              </div>
            </div>
            {(zone as any).air_quality.health_warning && (
              <div className="flex items-center gap-1.5 text-[11px] text-orange-400 bg-orange-950/50 p-1.5 rounded border border-orange-500/30">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Health advisory active — vulnerable populations at risk
              </div>
            )}
          </div>
        )}

        {/* Microclimate Stress Test Button */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
            Autonomous Agent Stress Test
          </div>
          <button
            onClick={() => onInjectHeatSpike(zone.metadata.id, 5.0)}
            className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Inject +5°F Thermal Spike into {zone.metadata.name}
          </button>
        </div>
      </div>
    </div>
  );
};
