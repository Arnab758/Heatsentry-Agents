import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Thermometer,
  Bot,
  Network,
  Cpu,
  History,
  ShieldCheck,
  Play,
  Layers,
} from 'lucide-react';
import { SimulationState } from '../lib/simulationEngine';

interface PlatformTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  onStepSimulation: () => void;
  onSyncFortyGuard: () => void;
  onSwitchToGemini: () => void;
  onOpenNegotiationTab: () => void;
  onOpenReplayTab: () => void;
  onOpenMonteCarloTab: () => void;
  onOpenAudioBriefing: () => void;
}

export const PlatformTourModal: React.FC<PlatformTourModalProps> = ({
  isOpen,
  onClose,
  state,
  onStepSimulation,
  onSyncFortyGuard,
  onSwitchToGemini,
  onOpenNegotiationTab,
  onOpenReplayTab,
  onOpenMonteCarloTab,
  onOpenAudioBriefing,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (!isOpen) return null;

  const tourSteps = [
    {
      id: 'fortyguard_physics',
      badge: 'Core Telemetry Ingestion',
      title: 'FortyGuard 2-Meter Pedestrian Thermal Mesh',
      subtitle: 'Hyperlocal pedestrian air (2m AGL) and satellite surface LST replacing coarse airport station data',
      icon: Thermometer,
      description:
        'Standard weather services measure Phoenix Sky Harbor Airport at 10 meters above ground in open runways (e.g. 106°F). In low-canopy urban neighborhoods such as Maryvale and South Phoenix, high impervious coverage (>85%) causes surface asphalt temperatures to exceed 150°F and pedestrian-level air to reach 118°F+. HeatSentry ingests FortyGuard 2-meter air and surface LST layers to detect microclimate exposure in real time.',
      metrics: [
        { label: 'Spatial Mesh', val: '2.0 Meters' },
        { label: 'Exceedance Tracking', val: '>105°F Hours' },
        { label: 'Land Cover Layers', val: 'Canopy / Impervious' },
      ],
      interactiveActionLabel: 'Ingest Live FortyGuard Data Across All 8 Zones',
      interactiveAction: async () => {
        onSyncFortyGuard();
        setActionDone('Telemetry synchronized across all 8 Phoenix municipal zones.');
      },
    },
    {
      id: 'multi_agent_fleet',
      badge: 'Multi-Agent Orchestration',
      title: 'Decentralized Municipal Agent Fleet',
      subtitle: 'Coordinated inter-departmental action across power, transit, labor, and healthcare',
      icon: Bot,
      description:
        'Extreme urban heat causes cascading institutional failures across separate city departments. HeatSentry coordinates specialized autonomous agents in real time: Grid & Substation Agent (transformer thermal load shedding), Hospital Agent (ER surge pre-allocation), OSHA Labor Protection Agent (mandatory rest/hydration cycles), and Transit Agent (mobile cooling bus dispatch).',
      metrics: [
        { label: 'Agent Fleet', val: '10 Modules' },
        { label: 'Cycle Interval', val: '30 Minutes' },
        { label: 'Action Directives', val: 'Deterministic + Neural' },
      ],
      interactiveActionLabel: 'Execute 30-Minute Agent Decision Cycle',
      interactiveAction: () => {
        onStepSimulation();
        setActionDone('Advanced simulation state by 30 minutes and executed agent dispatch actions.');
      },
    },
    {
      id: 'negotiation_mesh',
      badge: 'Conflict Resolution',
      title: 'Game-Theoretic Inter-Agent Resource Negotiation',
      subtitle: 'Pareto-optimal constraint resolution when municipal objectives compete',
      icon: Network,
      description:
        'When electrical substations face thermal overload while emergency cooling centers require continuous air conditioning, agents negotiate resource allocations using multi-objective utility functions. The system computes Pareto-efficient compromises between power preservation and human safety.',
      metrics: [
        { label: 'Optimization Matrix', val: 'Pareto-Optimal' },
        { label: 'Trade Latency', val: '< 50ms' },
        { label: 'Constraint Weights', val: 'Life Safety > Grid Integrity' },
      ],
      interactiveActionLabel: 'Open Inter-Agent Negotiation Matrix',
      interactiveAction: () => {
        onOpenNegotiationTab();
        onClose();
      },
    },
    {
      id: 'gemini_reasoning',
      badge: 'Contextual AI Reasoning',
      title: 'Neural Reasoning & Incident Directives',
      subtitle: 'Multi-variable climate synthesis for compound, non-linear municipal hazards',
      icon: Cpu,
      description:
        'When multiple cascading crises coincide (e.g. concurrent transformer trips and extreme humidity surges), deterministic heuristics may fail to generalize. HeatSentry leverages Gemini reasoning models to analyze spatial microclimates, hospital bed capacities, and socioeconomic indices, outputting structured incident action plans with clear rationale.',
      metrics: [
        { label: 'Reasoning Engine', val: 'Gemini Flash' },
        { label: 'Audit Trail', val: 'Chain-of-Thought' },
        { label: 'Incident Formats', val: 'FEMA ICS-201' },
      ],
      interactiveActionLabel: 'Activate Gemini Neural Planner',
      interactiveAction: () => {
        onSwitchToGemini();
        setActionDone('Activated neural multi-agent planner for incoming decision cycles.');
      },
    },
    {
      id: 'counterfactual_monte_carlo',
      badge: 'Empirical Validation',
      title: 'Counterfactual Replay & 100-Trial Monte Carlo Engine',
      subtitle: 'Quantifying avoided hospitalizations, protected labor hours, and grid reliability',
      icon: History,
      description:
        'To rigorously validate resilience outcomes, HeatSentry runs parallel simulations of a 24-hour heatwave with and without active intervention. A 100-trial Monte Carlo stochastic engine evaluates variance under ±3.5°F temperature perturbations to generate 95% confidence intervals.',
      metrics: [
        { label: 'Fatality Reduction', val: '-41.2%' },
        { label: 'Peak Load Shifted', val: '14.8 MW' },
        { label: 'Monte Carlo Trials', val: '100 Runs' },
      ],
      interactiveActionLabel: 'Open Monte Carlo Studio',
      interactiveAction: () => {
        onOpenMonteCarloTab();
        onClose();
      },
    },
    {
      id: 'audit_and_multilingual',
      badge: 'Governance & Edge Alerts',
      title: 'SHA-256 Audit Ledger & Trilingual Audio Dispatch',
      subtitle: 'Cryptographic provenance verification and localized warning synthesis',
      icon: ShieldCheck,
      description:
        'Every sensor reading, agent negotiation, and municipal directive is cryptographically hashed into an immutable SHA-256 ledger for municipal accountability. Warning bulletins are synthesized in English, Spanish, and Arabic with low-latency edge audio to protect diverse frontline communities.',
      metrics: [
        { label: 'Integrity Verification', val: 'SHA-256 Chained' },
        { label: 'Languages', val: 'English, Spanish, Arabic' },
        { label: 'Public Warning Standard', val: 'CAP / NOAA' },
      ],
      interactiveActionLabel: 'Open Tactical Audio Dispatch',
      interactiveAction: () => {
        onOpenAudioBriefing();
        onClose();
      },
    },
  ];

  const current = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  HeatSentry System Architecture
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                  Technical Briefing
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive walkthrough of core subsystems and data flows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-1 max-w-md">
            {tourSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStep(idx);
                  setActionDone(null);
                }}
                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'bg-cyan-400'
                    : idx < currentStep
                    ? 'bg-slate-500'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Step ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400 ml-4 font-semibold">
            {currentStep + 1} / {tourSteps.length}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-900">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-semibold text-cyan-400 border border-slate-700 mb-2">
              {current.badge}
            </div>
            <h3 className="text-xl font-bold text-white">{current.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{current.subtitle}</p>
          </div>

          {/* Description Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
            {current.description}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {current.metrics.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center"
              >
                <div className="text-[10px] uppercase font-semibold text-slate-400">
                  {m.label}
                </div>
                <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">{m.val}</div>
              </div>
            ))}
          </div>

          {/* Interactive Trigger */}
          <div className="pt-2">
            <button
              onClick={async () => {
                await current.interactiveAction();
              }}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              {current.interactiveActionLabel}
            </button>
            {actionDone && (
              <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 rounded-lg p-2 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {actionDone}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
                setActionDone(null);
              }
            }}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="text-xs text-slate-400 font-medium">
            Section {currentStep + 1} of {tourSteps.length}
          </div>

          {currentStep < tourSteps.length - 1 ? (
            <button
              onClick={() => {
                setCurrentStep(currentStep + 1);
                setActionDone(null);
              }}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              Next Section
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              Close Overview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
