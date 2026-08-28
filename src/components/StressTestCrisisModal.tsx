import React, { useState } from 'react';
import {
  Zap,
  X,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { PHOENIX_ZONES_LIST } from '../lib/zonesData';

export interface CrisisScenario {
  id: string;
  title: string;
  category: 'GRID_FAILURE' | 'LABOR_EMERGENCY' | 'HOSPITAL_SURGE' | 'ASPHALT_CRISIS';
  severity: 'CRITICAL' | 'CATASTROPHIC' | 'HIGH';
  targetZoneId: string;
  tempDeltaF: number;
  workerSurge: number;
  gridStrainDelta: number;
  hospitalLoadDelta: number;
  description: string;
  expectedAgentActions: string[];
}

export const CRISIS_PRESETS: CrisisScenario[] = [
  {
    id: 'substation-meltdown',
    title: 'Substation 12B Thermal Overload (119°F Spike)',
    category: 'GRID_FAILURE',
    severity: 'CATASTROPHIC',
    targetZoneId: 'PHX-02', // Maryvale
    tempDeltaF: 8.5,
    workerSurge: 800,
    gridStrainDelta: 24,
    hospitalLoadDelta: 12,
    description:
      'A primary distribution transformer in Maryvale approaches thermal trip thresholds during peak afternoon temperatures. The Grid Agent coordinates with Transit and Shelter agents to shed non-essential municipal loads while maintaining critical life-safety chillers.',
    expectedAgentActions: [
      'Grid Agent commands cooling stations to activate local battery backup buffers',
      'Resource Planner shifts mobile misting units from lower-risk sectors into Maryvale',
      'Alert Dispatcher broadcasts emergency safety advisories in English and Spanish',
    ],
  },
  {
    id: 'roofers-industrial-crisis',
    title: 'Deer Valley Industrial Corridor WBGT 94.8°F Exceedance',
    category: 'LABOR_EMERGENCY',
    severity: 'CRITICAL',
    targetZoneId: 'PHX-06', // Deer Valley
    tempDeltaF: 6.0,
    workerSurge: 1800,
    gridStrainDelta: 10,
    hospitalLoadDelta: 18,
    description:
      'Over 2,200 warehouse and roofing personnel face OSHA Category 4 Wet Bulb Globe Temperature conditions (>94.8°F). The OSHA Labor Agent enforces mandatory 15m work / 45m shade rest cycles.',
    expectedAgentActions: [
      'Labor Protection Agent issues mandatory work-rest cycle advisories to industrial contractors',
      'Resource Planner routes hydration transport units to the 7th Avenue commercial zone',
      'Hospital Agent places regional trauma centers on standby for acute heatstroke admissions',
    ],
  },
  {
    id: 'hospital-er-overcapacity',
    title: 'Regional Trauma & Pediatric ER 96% Saturation',
    category: 'HOSPITAL_SURGE',
    severity: 'CATASTROPHIC',
    targetZoneId: 'PHX-01', // Downtown
    tempDeltaF: 5.2,
    workerSurge: 600,
    gridStrainDelta: 15,
    hospitalLoadDelta: 30,
    description:
      'Downtown emergency departments approach capacity due to heat exhaustion and dehydration admissions. The Transit Coordinator stages climate-controlled municipal buses to serve as mobile pre-triage cooling refuges.',
    expectedAgentActions: [
      'Hospital Agent initiates regional patient load-balancing protocols',
      'Transit Coordinator deploys air-conditioned express buses along central corridors',
      'Lead Orchestrator synchronizes inter-agency surge priorities',
    ],
  },
  {
    id: 'asphalt-canopy-disparity',
    title: 'Alhambra Microclimate Heat Surge (142°F Surface)',
    category: 'ASPHALT_CRISIS',
    severity: 'HIGH',
    targetZoneId: 'PHX-05', // Alhambra
    tempDeltaF: 7.0,
    workerSurge: 1100,
    gridStrainDelta: 12,
    hospitalLoadDelta: 14,
    description:
      'With tree canopy below 6%, asphalt surface temperatures reach 142°F. The Environmental Justice Auditor prioritizes immediate mobile shade structures and hydration supply staging for pedestrian corridors.',
    expectedAgentActions: [
      'Equity Auditor reallocates priority resources to high-vulnerability census blocks',
      'Resource Planner positions temporary shade canopies and hydration points',
      'Localized SMS and audio alerts dispatched to affected frontline workers',
    ],
  },
];

interface StressTestCrisisModalProps {
  onClose: () => void;
  onInjectScenario: (scenario: CrisisScenario) => void;
  onInjectCustom: (zoneId: string, tempDelta: number, workerSurge: number) => void;
}

export const StressTestCrisisModal: React.FC<StressTestCrisisModalProps> = ({
  onClose,
  onInjectScenario,
  onInjectCustom,
}) => {
  const [activeTab, setActiveTab] = useState<'PRESETS' | 'CUSTOM'>('PRESETS');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CRISIS_PRESETS[0].id);

  // Custom form state
  const [customZone, setCustomZone] = useState<string>(PHOENIX_ZONES_LIST[1].id);
  const [customTemp, setCustomTemp] = useState<number>(7.0);
  const [customWorkers, setCustomWorkers] = useState<number>(1400);

  const selectedPreset = CRISIS_PRESETS.find((p) => p.id === selectedPresetId) || CRISIS_PRESETS[0];

  const handleApplyPreset = () => {
    onInjectScenario(selectedPreset);
    onClose();
  };

  const handleApplyCustom = () => {
    onInjectCustom(customZone, customTemp, customWorkers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 lg:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Crisis Scenario Simulation
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                  Stress Test
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulate extreme microclimate and grid anomalies to evaluate autonomous multi-agent response
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 px-4 py-2 border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PRESETS'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            Standard Crisis Scenarios
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CUSTOM'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Custom Parameter Injection
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'PRESETS' ? (
            <div className="space-y-4">
              {/* Presets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {CRISIS_PRESETS.map((preset) => {
                  const isSelected = preset.id === selectedPresetId;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-white text-xs">
                          {preset.title}
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                            preset.severity === 'CATASTROPHIC'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          }`}
                        >
                          {preset.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                        <span className="text-rose-400">+{preset.tempDeltaF}°F</span>
                        <span>•</span>
                        <span className="text-cyan-400">+{preset.workerSurge} Workers</span>
                        <span>•</span>
                        <span className="text-amber-400">Grid +{preset.gridStrainDelta}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Preset Detailed Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Scenario Dynamics
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Target Sector: <strong className="text-white">{selectedPreset.targetZoneId}</strong>
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedPreset.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Autonomous Response Protocol:
                  </span>
                  {selectedPreset.expectedAgentActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Sliders */
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Sector</label>
                <select
                  value={customZone}
                  onChange={(e) => setCustomZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-cyan-500"
                >
                  {PHOENIX_ZONES_LIST.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.id}) — {z.outdoor_workers.toLocaleString()} Outdoor Workers
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Temperature Delta</span>
                  <span className="text-rose-400 font-mono font-bold">+{customTemp}°F</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="1"
                  value={customTemp}
                  onChange={(e) => setCustomTemp(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Outdoor Workforce Surge</span>
                  <span className="text-cyan-400 font-mono font-bold">+{customWorkers} Workers</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="200"
                  value={customWorkers}
                  onChange={(e) => setCustomWorkers(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={activeTab === 'PRESETS' ? handleApplyPreset : handleApplyCustom}
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Scenario to Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
