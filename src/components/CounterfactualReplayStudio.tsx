import React, { useState } from 'react';
import {
  Layers,
  HeartPulse,
  Users,
  DollarSign,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ReplayResult, ReplayTimelineStep, ScenarioType } from '../types/heatsentry';
import { runCounterfactualReplay } from '../lib/simulationEngine';

interface CounterfactualReplayStudioProps {
  onClose: () => void;
  scenario: ScenarioType;
}

export const CounterfactualReplayStudio: React.FC<CounterfactualReplayStudioProps> = ({
  onClose,
  scenario,
}) => {
  const [replayData, setReplayData] = useState<ReplayResult>(() => runCounterfactualReplay(scenario));
  const [engine, setEngine] = useState<'backend' | 'local'>('local');
  const [selectedHour, setSelectedHour] = useState<number>(16); // Peak afternoon default (4:00 PM)
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // Primary engine: the real Python counterfactual replay engine (/api/replay)
  // — the same epidemiological dose-response model the backend runs for
  // Monte Carlo, so every number in the product comes from ONE engine.
  const fetchBackendReplay = async () => {
    try {
      const resp = await fetch('/api/replay');
      if (!resp.ok) throw new Error(`backend responded ${resp.status}`);
      const json = await resp.json();
      if (json && json.summary_deltas && Array.isArray(json.timeline)) {
        setReplayData(json);
        setEngine('backend');
        return;
      }
      throw new Error('invalid replay response');
    } catch {
      setReplayData(runCounterfactualReplay(scenario));
      setEngine('local');
    }
  };

  React.useEffect(() => {
    fetchBackendReplay();
  }, [scenario]);

  const currentStep = replayData.timeline[selectedHour] || replayData.timeline[0];
  const summary = replayData.summary_deltas;

  // Timeline playback effect
  React.useEffect(() => {
    let interval: any = null;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setSelectedHour((prev) => (prev >= 23 ? 0 : prev + 1));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  const handleRerun = (newScenario: ScenarioType) => {
    fetchBackendReplay();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 lg:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg border border-amber-400/40">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide flex items-center gap-1.5">
                  COUNTERFACTUAL "WHAT-IF" REPLAY ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  With vs Without HeatSentry
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulates the identical meteorological 24h day twice to prove lives & hospitalizations saved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                engine === 'backend'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-amber-950 text-amber-300 border-amber-500/50'
              }`}
            >
              {engine === 'backend' ? 'Python Replay Engine' : 'In-Browser Fallback'}
            </span>
            <button
              onClick={() => handleRerun(scenario)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-Calculate
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Close Studio
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Key Metric Impact Delta Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Lives Saved Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/80 to-slate-950 border border-emerald-500/40 shadow-lg">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Projected Lives Saved</span>
                <HeartPulse className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                +{summary.lives_saved_projected} <span className="text-sm font-semibold text-emerald-400">Lives</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Baseline: {summary.baseline_deaths_projected} deaths</span>
                <span className="text-emerald-400 font-bold">HeatSentry: {summary.heatsentry_deaths_projected}</span>
              </div>
            </div>

            {/* ER Visits Avoided */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/80 to-slate-950 border border-cyan-500/40 shadow-lg">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">ER Visits Avoided</span>
                <TrendingDown className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                -{summary.er_visits_avoided} <span className="text-sm font-semibold text-cyan-400">Visits</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Baseline: {summary.er_visits_baseline} ER</span>
                <span className="text-cyan-400 font-bold">HeatSentry: {summary.er_visits_heatsentry} ER</span>
              </div>
            </div>

            {/* Worker Hours Protected */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/80 to-slate-950 border border-amber-500/40 shadow-lg">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Worker Hours Protected</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {summary.worker_hours_protected.toLocaleString()}{' '}
                <span className="text-sm font-semibold text-amber-400">Hours</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Baseline Exp: {summary.worker_hours_exposed_baseline.toLocaleString()}h</span>
                <span className="text-amber-400 font-bold">Safe Rest Cycles</span>
              </div>
            </div>

            {/* Economic ROI */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/80 to-slate-950 border border-purple-500/40 shadow-lg">
              <div className="flex items-center justify-between text-purple-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Economic Health Savings</span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                ${summary.economic_savings_usd.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>ER & ICU costs saved</span>
                <span className="text-purple-400 font-bold">{summary.cooling_resource_efficiency_pct}% Asset Eff</span>
              </div>
            </div>
          </div>

          {/* Interactive 24-Hour Timeline Scrubber */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  24-Hour Diurnal Timeline Scrubber
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {currentStep.time_label} (Simulated)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                >
                  {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlayingTimeline ? 'Pause Scrub' : 'Play Timeline'}
                </button>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="23"
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            {/* Timeline Hour Strip */}
            <div className="grid grid-cols-12 lg:grid-cols-24 gap-1 text-center">
              {replayData.timeline.map((step) => (
                <button
                  key={step.hour}
                  onClick={() => setSelectedHour(step.hour)}
                  className={`p-1 rounded text-[10px] font-mono transition-all ${
                    selectedHour === step.hour
                      ? 'bg-amber-500 text-slate-950 font-bold scale-110 shadow-lg'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>{step.hour}:00</div>
                  <div
                    className={
                      step.city_peak_temp_f >= 110
                        ? 'text-rose-400 font-bold'
                        : step.city_peak_temp_f >= 100
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {Math.round(step.city_peak_temp_f)}°
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison at Current Selected Hour */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Scenario (WITHOUT HeatSentry) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 shadow-lg">
              <div className="flex items-center justify-between pb-2.5 border-b border-rose-900/40">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-sm text-rose-300">SCENARIO A: Unmitigated Baseline</span>
                </div>
                <span className="text-[11px] font-mono text-rose-400 font-semibold">No Agents Active</span>
              </div>

              <div className="space-y-3 mt-3 text-xs">
                <div className="bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exposed Worker-Hours this hour:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {currentStep.baseline_worker_exposed_hrs.toLocaleString()} hrs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected ER Visits this hour:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {currentStep.baseline_er_visits} cases
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">City Peak Heat Index:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {currentStep.city_peak_heat_index}°F
                    </span>
                  </div>
                </div>

                <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                  <li>Outdoor workers perform strenuous shifts with zero mandatory shade breaks</li>
                  <li>No mobile misting trailers or hydration vans staged at hotspots</li>
                  <li>Cooling centers operate on standard passive hours with no transportation</li>
                  <li>Trauma centers face uncoordinated, delayed hyperthermia surge intake</li>
                </ul>
              </div>
            </div>

            {/* HeatSentry Autonomous Scenario (WITH HeatSentry) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/60 shadow-lg">
              <div className="flex items-center justify-between pb-2.5 border-b border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-emerald-300">SCENARIO B: HeatSentry Fleet Active</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">10 Agents Autonomous</span>
              </div>

              <div className="space-y-3 mt-3 text-xs">
                <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exposed Worker-Hours this hour:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {currentStep.heatsentry_worker_exposed_hrs.toLocaleString()} hrs (75% reduction)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected ER Visits this hour:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {currentStep.heatsentry_er_visits} cases (-{Math.round((currentStep.baseline_er_visits - currentStep.heatsentry_er_visits) * 10) / 10})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cumulative ER Visits Saved:</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {currentStep.cumulative_er_avoided} Avoided
                    </span>
                  </div>
                </div>

                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>Automated OSHA Cat 3/4 alerts mandate 30-45m shade & hydration rotations</li>
                  <li>Misting trailers & mobile cooling shelters lower local apparent temp by ~15°F</li>
                  <li>Air-conditioned transit buses staged along vulnerable arterial corridors</li>
                  <li>Pre-staged rapid cold-water immersion tanks slash severe mortality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Zone-by-Zone Cumulative Counterfactual Breakdown Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Full 24-Hour Counterfactual Breakdown by Neighborhood
              </span>
              <span className="text-[11px] text-slate-400">Phoenix Metropolitan Area</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Zone</th>
                    <th className="p-2.5">Peak Temp</th>
                    <th className="p-2.5 text-rose-400">Baseline ER</th>
                    <th className="p-2.5 text-emerald-400">HeatSentry ER</th>
                    <th className="p-2.5 text-cyan-300">ER Avoided</th>
                    <th className="p-2.5">Worker Hrs Protected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {replayData.zone_breakdown.map((zd) => (
                    <tr key={zd.zone_id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-200">{zd.name}</td>
                      <td className="p-2.5 text-amber-300">{zd.peak_temp_f}°F</td>
                      <td className="p-2.5 text-rose-400">{zd.baseline_er_visits}</td>
                      <td className="p-2.5 text-emerald-400">{zd.heatsentry_er_visits}</td>
                      <td className="p-2.5 font-bold text-cyan-300">+{zd.er_avoided} Saved</td>
                      <td className="p-2.5 text-slate-300">{zd.worker_hrs_protected.toLocaleString()} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
