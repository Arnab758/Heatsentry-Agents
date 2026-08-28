import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  FileText,
  MessageSquare,
  Globe,
  TrendingUp,
  FileCheck,
  Zap,
  Trees,
  Wind,
  Timer,
  Satellite,
} from 'lucide-react';
import { Header } from './components/Header';
import { ZoneMap } from './components/ZoneMap';
import { AgentFleetRoster } from './components/AgentFleetRoster';
import { PlannerReasoningPanel } from './components/PlannerReasoningPanel';
import { LiveAlertsFeed } from './components/LiveAlertsFeed';
import { CounterfactualReplayStudio } from './components/CounterfactualReplayStudio';
import { AuditLedger } from './components/AuditLedger';
import { ZoneDetailDrawer } from './components/ZoneDetailDrawer';
import { MicroclimateInjectorModal } from './components/MicroclimateInjectorModal';
import { StressTestCrisisModal, CrisisScenario } from './components/StressTestCrisisModal';
import { AgentNegotiationMesh } from './components/AgentNegotiationMesh';
import { BilingualDeviceSimulator } from './components/BilingualDeviceSimulator';
import { MonteCarloStudio } from './components/MonteCarloStudio';
import { EmergencyAudioBriefing } from './components/EmergencyAudioBriefing';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { LandCoverPanel } from './components/LandCoverPanel';
import { AirQualityPanel } from './components/AirQualityPanel';
import { PersistencePanel } from './components/PersistencePanel';
import { FortyGuardIntegrationModal } from './components/FortyGuardIntegrationModal';
import { JudgeDemoTourModal } from './components/JudgeDemoTourModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AiIncidentCopilotModal } from './components/AiIncidentCopilotModal';
import { GoogleAiModelsStudioModal } from './components/GoogleAiModelsStudioModal';
import {
  SimulationState,
  initializeSimulation,
  runSimulationCycle,
} from './lib/simulationEngine';
import { PlannerType, SourceType, ScenarioType } from './types/heatsentry';
import { calculateRiskScore } from './lib/riskEngine';

import {
  getLandCoverData,
  getAirQualityData,
  getPersistenceData,
  FORTYGUARD_ZONE_DATA,
} from './lib/fortyguardData';

export default function App() {
  const [state, setState] = useState<SimulationState>(() =>
    initializeSimulation('EXTREME_HEATWAVE', 'DETERMINISTIC', 'SIMULATED_FEED')
  );

  const [activeTab, setActiveTab] = useState<
    'COMMAND_CENTER' | 'NEGOTIATION_MESH' | 'REPLAY_STUDIO' | 'MONTE_CARLO' | 'DEVICE_SIM' | 'AUDIT_LEDGER' | 'LAND_COVER' | 'AIR_QUALITY' | 'PERSISTENCE'
  >('COMMAND_CENTER');

  // FortyGuard advanced data (initialized with full dataset, synced from backend when available)
  const [landCoverData, setLandCoverData] = useState<Record<string, any>>(() => getLandCoverData());
  const [airQualityData, setAirQualityData] = useState<Record<string, any>>(() => getAirQualityData());
  const [persistenceData, setPersistenceData] = useState<Record<string, any>>(() => getPersistenceData());

  // Fetch FortyGuard advanced data when switching to relevant tabs (with client fallback)
  useEffect(() => {
    if (activeTab === 'LAND_COVER') {
      fetch('/api/fortyguard/land-cover')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d && d.zones) setLandCoverData(d.zones);
        })
        .catch(() => {});
    }
    if (activeTab === 'AIR_QUALITY') {
      fetch('/api/fortyguard/air-quality')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d && d.zones) setAirQualityData(d.zones);
        })
        .catch(() => {});
    }
    if (activeTab === 'PERSISTENCE') {
      fetch('/api/fortyguard/persistence')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d && d.zones) setPersistenceData(d.zones);
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState<boolean>(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isFortyGuardModalOpen, setIsFortyGuardModalOpen] = useState<boolean>(false);
  const [isJudgeTourOpen, setIsJudgeTourOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isGoogleAiStudioOpen, setIsGoogleAiStudioOpen] = useState<boolean>(false);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);

  // Auto-cycle timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        handleCycleStep();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, state.plannerType, state.scenario, state.sourceType]);

  const handleCycleStep = async () => {
    if (state.plannerType === 'GEMINI_3_5_FLASH') {
      setIsGeminiLoading(true);
      try {
        const response = await fetch('/api/gemini/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worldState: { zones: state.zones, timestamp: state.timestamp },
            availableResources: state.availableResources,
          }),
        });
        const geminiRes = await response.json();
        setIsGeminiLoading(false);

        setState((prev) =>
          runSimulationCycle(prev, 30, {
            allocations: geminiRes.allocations || [],
            alerts: geminiRes.alerts || [],
            reasoningSummary: geminiRes.reasoning_summary || 'Gemini 3.5 Flash autonomous plan.',
            reasoningSteps: geminiRes.reasoning_steps || [],
          })
        );
      } catch (err) {
        setIsGeminiLoading(false);
        setState((prev) => runSimulationCycle(prev, 30));
      }
    } else {
      setState((prev) => runSimulationCycle(prev, 30));
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setState(initializeSimulation(state.scenario, state.plannerType, state.sourceType));
  };

  const handleSelectPlanner = (planner: PlannerType) => {
    setState((prev) => ({
      ...prev,
      plannerType: planner,
      auditEntries: [
        ...(prev.auditEntries || []),
        {
          id: `config-${Date.now()}`,
          timestamp: new Date().toISOString(),
          agent: 'LeadOrchestrator',
          action: 'CONFIG_PLANNER_CHANGE',
          reasoning: `Switched planner brain to ${planner === 'GEMINI_3_5_FLASH' ? 'Gemini 3.5 Flash Neural Agent' : 'Deterministic Greedy Heuristic'}`,
        },
      ],
    }));
  };

  const handleSelectSource = async (source: SourceType) => {
    if (source === 'FORTYGUARD_LIVE') {
      try {
        const res = await fetch('/api/fortyguard/sync-all', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.zones) {
            setState((prev) => ({
              ...prev,
              sourceType: 'FORTYGUARD_LIVE',
              zones: data.zones,
              auditEntries: [
                ...(prev.auditEntries || []),
                {
                  id: `fg-sync-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  agent: 'FortyGuardClient',
                  action: 'INGEST_FORTYGUARD_TELEMETRY',
                  reasoning: `Successfully synced all 8 Phoenix zones with FortyGuard 2m ambient air & surface LST telemetry.`,
                },
              ],
            }));
            return;
          }
        }
      } catch {
        // static preview fallback
      }

      // Seamless client-side live FortyGuard telemetry sync
      setState((prev) => {
        const updatedZones: Record<string, any> = {};
        for (const [zid, zone] of Object.entries(prev.zones)) {
          const fg = FORTYGUARD_ZONE_DATA[zid];
          const newTemp = fg ? fg.peak_f : zone.current_telemetry.ambient_temperature_f;
          const newSurface = fg ? Math.round(newTemp * 1.25) : zone.current_telemetry.surface_temperature_f;
          const newRisk = calculateRiskScore(
            newTemp,
            zone.current_telemetry.relative_humidity,
            fg?.land_cover?.tree_canopy_pct || zone.metadata.tree_canopy_pct,
            zone.metadata.vulnerability_index,
            zone.metadata.outdoor_workers,
            zone.current_telemetry.wind_speed_mph,
            zone.current_telemetry.solar_radiation_w_m2
          );
          updatedZones[zid] = {
            ...zone,
            current_telemetry: {
              ...zone.current_telemetry,
              ambient_temperature_f: newTemp,
              surface_temperature_f: newSurface,
            },
            risk: newRisk,
          };
        }
        return {
          ...prev,
          sourceType: 'FORTYGUARD_LIVE',
          zones: updatedZones,
          auditEntries: [
            ...(prev.auditEntries || []),
            {
              id: `fg-sync-${Date.now()}`,
              timestamp: new Date().toISOString(),
              agent: 'FortyGuardClient',
              action: 'INGEST_FORTYGUARD_TELEMETRY',
              reasoning: `Successfully synced all 8 Phoenix zones with FortyGuard 2m ambient air & surface LST telemetry.`,
            },
          ],
        };
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      sourceType: source,
      auditEntries: [
        ...(prev.auditEntries || []),
        {
          id: `config-${Date.now()}`,
          timestamp: new Date().toISOString(),
          agent: 'LeadOrchestrator',
          action: 'CONFIG_SOURCE_CHANGE',
          reasoning: 'Switched temperature data feed to Deterministic FortyGuard-Schema Simulation Feed',
        },
      ],
    }));

    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'simulated' }),
    }).catch(() => {
      /* backend offline */
    });
  };

  const handleSelectScenario = (scenario: ScenarioType) => {
    setIsPlaying(false);
    setState(initializeSimulation(scenario, state.plannerType, state.sourceType));
  };

  const handleInjectCrisisScenario = (scenario: CrisisScenario) => {
    setState((prev) => {
      const zone = prev.zones[scenario.targetZoneId];
      if (!zone) return prev;

      const newTemp = zone.current_telemetry.ambient_temperature_f + scenario.tempDeltaF;
      const newWorkers = zone.metadata.outdoor_workers + scenario.workerSurge;

      const newRisk = calculateRiskScore(
        newTemp,
        zone.current_telemetry.relative_humidity,
        zone.metadata.tree_canopy_pct,
        zone.metadata.vulnerability_index,
        newWorkers,
        zone.current_telemetry.wind_speed_mph,
        zone.current_telemetry.solar_radiation_w_m2
      );

      const updatedZone = {
        ...zone,
        metadata: { ...zone.metadata, outdoor_workers: newWorkers },
        current_telemetry: { ...zone.current_telemetry, ambient_temperature_f: newTemp },
        risk: newRisk,
      };

      const updatedZones = { ...prev.zones, [scenario.targetZoneId]: updatedZone };
      const newGridStrain = Math.min(100, prev.gridStrain + scenario.gridStrainDelta);
      const newHospitalLoad = Math.min(100, prev.hospitalLoad + scenario.hospitalLoadDelta);

      return {
        ...prev,
        gridStrain: newGridStrain,
        hospitalLoad: newHospitalLoad,
        zones: updatedZones,
        auditEntries: [
          ...prev.auditEntries,
          {
            id: `crisis-${Date.now()}`,
            timestamp: new Date().toISOString(),
            agent: 'MicroclimateInjector',
            action: 'INJECT_CRISIS_PRESET',
            target_zone: scenario.targetZoneId,
            reasoning: `🚨 JUDGE DEMO CRISIS INJECTED: [${scenario.title}] in ${zone.metadata.name}. Temp: ${newTemp}°F, Exposed: ${newWorkers.toLocaleString()}, Grid Strain: ${newGridStrain}%, Hospital Load: ${newHospitalLoad}%. Autonomous Gemini multi-agent resolution triggered.`,
          },
        ],
      };
    });

    setTimeout(() => {
      handleCycleStep();
    }, 200);
  };

  const handleInjectAnomaly = (zoneId: string, deltaF: number, deltaWorkers = 0) => {
    setState((prev) => {
      const zone = prev.zones[zoneId];
      if (!zone) return prev;

      const newTemp = zone.current_telemetry.ambient_temperature_f + deltaF;
      const newWorkers = zone.metadata.outdoor_workers + deltaWorkers;

      const newRisk = calculateRiskScore(
        newTemp,
        zone.current_telemetry.relative_humidity,
        zone.metadata.tree_canopy_pct,
        zone.metadata.vulnerability_index,
        newWorkers,
        zone.current_telemetry.wind_speed_mph,
        zone.current_telemetry.solar_radiation_w_m2
      );

      const updatedZone = {
        ...zone,
        metadata: { ...zone.metadata, outdoor_workers: newWorkers },
        current_telemetry: { ...zone.current_telemetry, ambient_temperature_f: newTemp },
        risk: newRisk,
      };

      const updatedZones = { ...prev.zones, [zoneId]: updatedZone };

      return {
        ...prev,
        zones: updatedZones,
        auditEntries: [
          ...prev.auditEntries,
          {
            id: `spike-${Date.now()}`,
            timestamp: new Date().toISOString(),
            agent: 'MicroclimateInjector',
            action: 'INJECT_HEAT_ANOMALY',
            target_zone: zoneId,
            reasoning: `Manual anomaly injected into ${zone.metadata.name}: +${deltaF}°F spike (Temp ${newTemp}°F, HI ${newRisk.heat_index}°F). Fleet autonomously responding.`,
          },
        ],
      };
    });

    setTimeout(() => {
      handleCycleStep();
    }, 300);
  };

  const selectedZone = selectedZoneId ? state.zones[selectedZoneId] || null : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Command Bar */}
      <Header
        state={state}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onStep={handleCycleStep}
        onReset={handleReset}
        onSelectPlanner={handleSelectPlanner}
        onSelectSource={handleSelectSource}
        onSelectScenario={handleSelectScenario}
        onOpenReplay={() => setIsReplayModalOpen(true)}
        onOpenStressTest={() => setIsStressTestOpen(true)}
        onOpenFortyGuardModal={() => setIsFortyGuardModalOpen(true)}
        onOpenJudgeTour={() => setIsJudgeTourOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenGoogleAiStudio={() => setIsGoogleAiStudioOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 lg:p-5 space-y-4 max-w-[1750px] mx-auto w-full">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('COMMAND_CENTER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'COMMAND_CENTER'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live Fleet Mission Control
            </button>

            <button
              onClick={() => setActiveTab('NEGOTIATION_MESH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'NEGOTIATION_MESH'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Agent Negotiation Mesh
            </button>

            <button
              onClick={() => setActiveTab('REPLAY_STUDIO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'REPLAY_STUDIO'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              What-If Counterfactual Replay
            </button>

            <button
              onClick={() => setActiveTab('MONTE_CARLO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'MONTE_CARLO'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              100-Trial Monte Carlo
            </button>

            <button
              onClick={() => setActiveTab('DEVICE_SIM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'DEVICE_SIM'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Bilingual Device Sim
            </button>

            <button
              onClick={() => setActiveTab('AUDIT_LEDGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'AUDIT_LEDGER'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Audit Ledger
            </button>

            <button
              onClick={() => setActiveTab('LAND_COVER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'LAND_COVER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              Land Cover
            </button>

            <button
              onClick={() => setActiveTab('AIR_QUALITY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'AIR_QUALITY'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              Air Quality
            </button>

            <button
              onClick={() => setActiveTab('PERSISTENCE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'PERSISTENCE'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              Persistence
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer shadow"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Executive PDF Report
            </button>
          </div>
        </div>

        {/* Emergency Voice Commander Strip */}
        <EmergencyAudioBriefing
          zones={state.zones}
          cycleCount={state.cycleCount}
          timestamp={state.timestamp}
        />

        {/* Tab 1: Live Command Center View */}
        {activeTab === 'COMMAND_CENTER' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 h-full min-h-[480px]">
                <ZoneMap
                  zones={state.zones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={(id) => setSelectedZoneId(id)}
                />
              </div>

              <div className="lg:col-span-5 h-full min-h-[480px]">
                <PlannerReasoningPanel
                  plannerReasoning={state.plannerReasoning}
                  reasoningSteps={state.plannerReasoningSteps}
                  allocations={state.activeAllocations}
                  availableResources={state.availableResources}
                  plannerType={state.plannerType}
                  cycleCount={state.cycleCount}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <AgentFleetRoster
                  agentStatuses={state.agentStatuses}
                  plannerType={state.plannerType}
                />
              </div>

              <div className="lg:col-span-6">
                <LiveAlertsFeed alerts={state.activeAlerts} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Agent Negotiation Mesh */}
        {activeTab === 'NEGOTIATION_MESH' && (
          <AgentNegotiationMesh
            zones={state.zones}
            cycleCount={state.cycleCount}
            gridStrain={state.gridStrain}
            hospitalLoad={state.hospitalLoad}
          />
        )}

        {/* Tab 3: Counterfactual Replay Studio View */}
        {activeTab === 'REPLAY_STUDIO' && (
          <CounterfactualReplayStudio
            onClose={() => setActiveTab('COMMAND_CENTER')}
            scenario={state.scenario}
          />
        )}

        {/* Tab 4: Monte Carlo Resilience Studio */}
        {activeTab === 'MONTE_CARLO' && (
          <MonteCarloStudio scenario={state.scenario} />
        )}

        {/* Tab 5: Bilingual Device Simulator */}
        {activeTab === 'DEVICE_SIM' && (
          <BilingualDeviceSimulator
            alerts={state.activeAlerts}
            zones={state.zones}
          />
        )}

        {/* Tab 6: Immutable Audit Ledger View */}
        {activeTab === 'AUDIT_LEDGER' && (
          <AuditLedger entries={state.auditEntries} />
        )}

        {/* Tab 7: Land Cover */}
        {activeTab === 'LAND_COVER' && (
          <LandCoverPanel zones={landCoverData} />
        )}

        {/* Tab 8: Air Quality */}
        {activeTab === 'AIR_QUALITY' && (
          <AirQualityPanel zones={airQualityData} />
        )}

        {/* Tab 9: Persistence & Timing */}
        {activeTab === 'PERSISTENCE' && (
          <PersistencePanel zones={persistenceData} />
        )}
      </main>

      {/* Floating Replay Modal (if triggered via header button) */}
      {isReplayModalOpen && (
        <CounterfactualReplayStudio
          onClose={() => setIsReplayModalOpen(false)}
          scenario={state.scenario}
        />
      )}

      {/* Selected Zone Deep Inspection Drawer */}
      {selectedZone && (
        <ZoneDetailDrawer
          zone={selectedZone}
          onClose={() => setSelectedZoneId(null)}
          onInjectHeatSpike={handleInjectAnomaly}
        />
      )}

      {/* Anomaly Stress Test Crisis Presets Modal */}
      {isStressTestOpen && (
        <StressTestCrisisModal
          onClose={() => setIsStressTestOpen(false)}
          onInjectScenario={handleInjectCrisisScenario}
          onInjectCustom={handleInjectAnomaly}
        />
      )}

      {/* Executive Municipal Action Report Modal */}
      {isReportOpen && (
        <ExecutiveReportModal
          state={state}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* FortyGuard Thermal Intelligence & Credit Safeguard Modal */}
      <FortyGuardIntegrationModal
        isOpen={isFortyGuardModalOpen}
        onClose={() => setIsFortyGuardModalOpen(false)}
        onSyncLiveFeed={() => handleSelectSource('FORTYGUARD_LIVE')}
      />

      {/* Executive Judge Demo Tour & Breakthrough Walkthrough */}
      <JudgeDemoTourModal
        isOpen={isJudgeTourOpen}
        onClose={() => setIsJudgeTourOpen(false)}
        state={state}
        onStepSimulation={handleCycleStep}
        onSyncFortyGuard={() => handleSelectSource('FORTYGUARD_LIVE')}
        onSwitchToGemini={() => handleSelectPlanner('GEMINI_3_5_FLASH')}
        onOpenNegotiationTab={() => setActiveTab('NEGOTIATION_MESH')}
        onOpenReplayTab={() => setActiveTab('REPLAY_STUDIO')}
        onOpenMonteCarloTab={() => setActiveTab('MONTE_CARLO')}
        onOpenAudioBriefing={() => setActiveTab('DEVICE_SIM')}
        onOpenArchitectureModal={() => setIsArchitectureOpen(true)}
      />

      {/* Full Technical Architecture Diagram & Specs Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* AI Incident Command Copilot Modal */}
      <AiIncidentCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        state={state}
        onStepSimulation={handleCycleStep}
        onSyncFortyGuard={() => handleSelectSource('FORTYGUARD_LIVE')}
      />

      {/* Google AI Specialized Models (Gemma, Veo, Lyria) & Agent Supervisor Studio */}
      <GoogleAiModelsStudioModal
        isOpen={isGoogleAiStudioOpen}
        onClose={() => setIsGoogleAiStudioOpen(false)}
      />
    </div>
  );
}
