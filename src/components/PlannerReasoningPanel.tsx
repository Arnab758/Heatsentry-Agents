import React from 'react';
import {
  Brain,
  Sparkles,
  Terminal,
  Layers,
  CheckCircle2,
  Droplets,
  Tent,
  Truck,
  Shield,
  Clock,
} from 'lucide-react';
import { ResourceAllocation, DeployedResources, PlannerType } from '../types/heatsentry';

interface PlannerReasoningPanelProps {
  plannerReasoning: string;
  reasoningSteps: string[];
  allocations: ResourceAllocation[];
  availableResources: DeployedResources & { cooling_buses: number };
  plannerType: PlannerType;
  cycleCount: number;
}

export const PlannerReasoningPanel: React.FC<PlannerReasoningPanelProps> = ({
  plannerReasoning,
  reasoningSteps,
  allocations,
  availableResources,
  plannerType,
  cycleCount,
}) => {
  const isGemini = plannerType === 'GEMINI_3_5_FLASH';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Planner Brain Reasoning Console
              {isGemini ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-900 to-purple-900 text-amber-300 border border-purple-400/40">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Gemini 3.5 Flash Thinking
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40 font-mono">
                  Deterministic Heuristic
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">Autonomous Resource Arbitration & Vulnerability Trade-offs</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Cycle #{cycleCount}
        </div>
      </div>

      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[460px] custom-scrollbar">
        {/* Resource Pool Meters */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span>Municipal Cooling Resource Pool</span>
            <span className="text-emerald-400 font-mono">Real-Time Inventory</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Misting Trailers</div>
                <div className="font-mono font-bold text-cyan-300">
                  {availableResources.misting_trailers} Units
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center gap-2">
              <Tent className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Cooling Shelters</div>
                <div className="font-mono font-bold text-amber-300">
                  {availableResources.mobile_shelters} Units
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">Hydration Vans</div>
                <div className="font-mono font-bold text-emerald-300">
                  {availableResources.hydration_vans} Vans
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Reasoning Terminal Stream */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Agent "Think Out Loud" Reasoning Chain</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-purple-900/40 text-xs font-mono leading-relaxed space-y-2 text-slate-300">
            {reasoningSteps && reasoningSteps.length > 0 ? (
              reasoningSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 shrink-0 font-bold">[{idx + 1}]</span>
                  <span className={idx === 0 ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
                    {step}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 whitespace-pre-wrap">{plannerReasoning}</p>
            )}
          </div>
        </div>

        {/* Active Dispatches Summary */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Targeted Asset Deployments ({allocations.length})</span>
            </span>
          </div>

          {allocations.length === 0 ? (
            <div className="text-xs text-slate-500 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 text-center italic">
              No emergency allocations active in current cycle.
            </div>
          ) : (
            <div className="space-y-2">
              {allocations.map((alloc, idx) => (
                <div
                  key={alloc.zone_id ? `${alloc.zone_id}-${idx}` : `alloc-${idx}`}
                  className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {alloc.zone_name} ({alloc.zone_id})
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300">
                      M:{alloc.allocated.misting_trailers} | S:{alloc.allocated.mobile_shelters} | H:{alloc.allocated.hydration_vans}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">{alloc.justification}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
