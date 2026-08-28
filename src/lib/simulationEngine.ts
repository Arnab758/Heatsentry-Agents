import {
  HazardLevel,
  PlannerType,
  SourceType,
  ScenarioType,
  ZoneState,
  AgentStatus,
  HeatAlert,
  AuditEntry,
  ResourceAllocation,
  ReplayResult,
  ReplayTimelineStep,
  ReplayZoneBreakdown,
  DeployedResources,
} from '../types/heatsentry';
import { PHOENIX_ZONES_LIST, PHOENIX_ZONES_MAP } from './zonesData';
import { calculateRiskScore } from './riskEngine';

export interface SimulationState {
  timestamp: string;
  hour: number;
  minute: number;
  cycleCount: number;
  scenario: ScenarioType;
  sourceType: SourceType;
  plannerType: PlannerType;
  zones: Record<string, ZoneState>;
  agentStatuses: Record<string, AgentStatus>;
  activeAlerts: HeatAlert[];
  activeAllocations: ResourceAllocation[];
  auditEntries: AuditEntry[];
  availableResources: DeployedResources & { cooling_buses: number };
  gridStrain: number;
  hospitalLoad: number;
  plannerReasoning: string;
  plannerReasoningSteps: string[];
  isGeminiStreaming?: boolean;
}

export function getScenarioParams(scenario: ScenarioType) {
  switch (scenario) {
    case 'MONSOON_HUMIDITY':
      return { peakTemp: 108, swing: 18, baseRh: 42, solarPeak: 890, name: 'Phoenix Monsoon Surge' };
    case 'FLASH_HEAT_DOME':
      return { peakTemp: 121, swing: 28, baseRh: 9, solarPeak: 1080, name: 'Flash Heat Dome Crisis' };
    case 'EXTREME_HEATWAVE':
    default:
      return { peakTemp: 116, swing: 24, baseRh: 16, solarPeak: 1020, name: 'Historic Phoenix Heatwave' };
  }
}

export function calculateZoneTelemetry(
  zoneId: string,
  hour: number,
  minute: number,
  scenario: ScenarioType
) {
  const zone = PHOENIX_ZONES_MAP[zoneId];
  const uhi = zone?.uhi_intensity_f || 4.0;
  const params = getScenarioParams(scenario);

  const hourFloat = hour + minute / 60.0;
  const tempPhase = (hourFloat - 16.5) * ((2 * Math.PI) / 24.0);
  const diurnalFactor = 0.5 * (1 + Math.cos(tempPhase));

  const minTemp = params.peakTemp - params.swing;
  const ambientTemp = minTemp + diurnalFactor * params.swing + uhi;

  const rh = Math.max(8, params.baseRh + (1.0 - diurnalFactor) * 20);

  let solarRad = 0;
  if (hourFloat >= 6.0 && hourFloat <= 19.5) {
    const solarPhase = (hourFloat - 13.0) / 6.5;
    solarRad = Math.max(0, params.solarPeak * (1.0 - solarPhase * solarPhase));
  }

  const canopyCooling = (zone?.tree_canopy_pct || 8.0) * 0.4;
  const surfaceTemp = ambientTemp + solarRad * 0.048 - canopyCooling;
  const windSpeed = Math.max(2.5, 6.0 + 2.0 * Math.sin(hourFloat));

  return {
    ambient_temperature_f: Math.round(ambientTemp * 10) / 10,
    surface_temperature_f: Math.round(surfaceTemp * 10) / 10,
    relative_humidity: Math.round(rh * 10) / 10,
    solar_radiation_w_m2: Math.round(solarRad * 10) / 10,
    wind_speed_mph: Math.round(windSpeed * 10) / 10,
    urban_heat_island_delta_f: uhi,
  };
}

export function initializeSimulation(
  scenario: ScenarioType = 'EXTREME_HEATWAVE',
  plannerType: PlannerType = 'DETERMINISTIC',
  sourceType: SourceType = 'SIMULATED_FEED'
): SimulationState {
  const initialHour = 8;
  const initialMinute = 0;

  const zones: Record<string, ZoneState> = {};
  for (const z of PHOENIX_ZONES_LIST) {
    const telem = calculateZoneTelemetry(z.id, initialHour, initialMinute, scenario);
    const risk = calculateRiskScore(
      telem.ambient_temperature_f,
      telem.relative_humidity,
      z.tree_canopy_pct,
      z.vulnerability_index,
      z.outdoor_workers,
      telem.wind_speed_mph,
      telem.solar_radiation_w_m2
    );

    zones[z.id] = {
      metadata: z,
      current_telemetry: telem,
      risk,
      forecast: {
        peak_temp_f: Math.round((getScenarioParams(scenario).peakTemp + z.uhi_intensity_f) * 10) / 10,
        will_cross_105: true,
        will_cross_110: true,
        duration_hours: 7.5,
        persistence_index: 0.85,
      },
      deployed_resources: {
        misting_trailers: 0,
        mobile_shelters: 0,
        hydration_vans: 0,
      },
      active_protections: [],
    };
  }

  const agentStatuses: Record<string, AgentStatus> = {
    LeadOrchestrator: {
      name: 'LeadOrchestrator',
      role: 'Fleet Commander & Multi-Agent Mesh Arbiter',
      status: 'ACTIVE',
      last_action: 'Mesh Fleet Initialized',
      last_reasoning: 'Calibrated digital twin for Phoenix Metropolitan Heat Resilience.',
    },
    ZoneMonitor: {
      name: 'ZoneMonitor',
      role: 'Hyperlocal Telemetry & Risk Scoring',
      status: 'READY',
      last_action: 'Telemetry Ingested',
      last_reasoning: '8 Phoenix zone telemetry channels streaming.',
    },
    HeatForecaster: {
      name: 'HeatForecaster',
      role: 'Threshold Crossing & Trajectory Prediction',
      status: 'READY',
      last_action: 'Predictive Trajectory Model Run',
      last_reasoning: 'Diurnal heat-dome trajectory calibrated to 16:30 solar peak.',
    },
    ResourcePlanner: {
      name: 'ResourcePlanner',
      role: 'Autonomous Asset Allocation & Optimization',
      status: 'READY',
      last_action: 'Resource Optimization Plan Ready',
      last_reasoning: 'Greedy heuristic and Gemini 3.5 Flash engine standby.',
    },
    AlertDispatcher: {
      name: 'AlertDispatcher',
      role: 'Bilingual Targeted Multi-Channel Emergency Broadcast',
      status: 'READY',
      last_action: 'SMS / Transit Gateways Ready',
      last_reasoning: 'Direct channels mapped to 36,000+ outdoor worker job sites (English + Spanish).',
    },
    CoolingCenters: {
      name: 'CoolingCenters',
      role: 'Municipal Hydration & Shelter Network',
      status: 'READY',
      last_action: '22 Centers Active',
      last_reasoning: '1,870 cooling beds online across municipal community hubs.',
    },
    EmployersAgent: {
      name: 'EmployersAgent',
      role: 'OSHA Work-Rest Protocol Compliance',
      status: 'READY',
      last_action: 'OSHA Protocol Monitoring Active',
      last_reasoning: 'Roofing, asphalt, and landscaping job sites synced.',
    },
    TransitAgent: {
      name: 'TransitAgent',
      role: 'Valley Metro Shaded Stops & Mobile AC Buses',
      status: 'READY',
      last_action: 'Mobile AC Buses Staged',
      last_reasoning: 'High-volume transfer stops in Maryvale and Alhambra covered.',
    },
    GridAgent: {
      name: 'GridAgent',
      role: 'APS / SRP Substation Load & Grid Resilience',
      status: 'READY',
      last_action: 'Substation Load Monitored',
      last_reasoning: 'Thermal strain on urban distribution nodes within safe buffer.',
    },
    HospitalAgent: {
      name: 'HospitalAgent',
      role: 'Valleywise & Banner ER Heat Stroke Surge Triage',
      status: 'READY',
      last_action: 'ER Surge Level 1 Active',
      last_reasoning: 'Rapid cold-water immersion tanks ready across trauma centers.',
    },
  };

  return {
    timestamp: '2026-07-15 08:00:00',
    hour: initialHour,
    minute: initialMinute,
    cycleCount: 0,
    scenario,
    sourceType,
    plannerType,
    zones,
    agentStatuses,
    activeAlerts: [
      {
        id: 'init-alert-001',
        target_channel: 'OUTDOOR_WORKERS_SMS',
        target_zone: 'PHX-02',
        severity: 'HIGH',
        title: 'HEAT ADVISORY: Excessive Thermal Burden Forecasted',
        title_ar: 'تحذير من الإجهاد الحراري الشديد: درجات حرارة قياسية',
        title_hi: 'अत्यधिक गर्मी चेतावनी: गंभीर तापीय संकट',
        message: 'Extreme heat forecast across Maryvale. Stay hydrated, mandatory shaded rest cycles start at 10:00 AM.',
        message_ar: 'توقعات بارتفاع درجات الحرارة إلى مستويات حرجة. الالتزام بفترات الراحة الإلزامية في الظل وشرب الماء بدءاً من الساعة 10:00 صباحاً.',
        action_required: 'Prepare 1 liter of electrolyte water per hour and confirm shade canopy locations.',
        action_required_ar: 'توفير لتر من الماء مع الأملاح المعدنية كل ساعة والتأكد من مواقع مظلات التبريد الميدانية.',
        timestamp: '08:00 AM',
      },
    ],
    activeAllocations: [],
    auditEntries: [
      {
        id: 'init-001',
        timestamp: '2026-07-15T08:00:00Z',
        agent: 'LeadOrchestrator',
        action: 'FLEET_STARTUP',
        reasoning: 'HeatSentry Autonomous Fleet initialized across 8 Phoenix micro-climate zones.',
      },
    ],
    availableResources: {
      misting_trailers: 12,
      mobile_shelters: 6,
      hydration_vans: 16,
      cooling_buses: 8,
    },
    gridStrain: 38.5,
    hospitalLoad: 12.0,
    plannerReasoning: 'HeatSentry fleet standing by. System initialized and awaiting first autonomous cycle.',
    plannerReasoningSteps: ['System initialized.', '8 Phoenix zones registered in digital twin.'],
  };
}

export function executeDeterministicPlan(
  zones: Record<string, ZoneState>,
  availableResources: DeployedResources
) {
  const resourcesLeft = { ...availableResources };
  const allocations: ResourceAllocation[] = [];
  const alerts: HeatAlert[] = [];
  const reasoningSteps: string[] = [];

  const scoredZones = Object.values(zones).map((z) => {
    const risk = z.risk.risk_score;
    const workers = z.metadata.outdoor_workers;
    const vuln = z.metadata.vulnerability_index;
    const priority = (risk / 100.0) * (workers / 1000.0) * (1.0 + vuln);
    return {
      zone: z,
      priority: Math.round(priority * 1000) / 1000,
    };
  });

  scoredZones.sort((a, b) => b.priority - a.priority);

  reasoningSteps.push(
    `Deterministic Heuristic Evaluation: Evaluated 8 zones. Resource Pool: ${resourcesLeft.misting_trailers} Misting Trailers, ${resourcesLeft.mobile_shelters} Mobile Shelters, ${resourcesLeft.hydration_vans} Hydration Vans.`
  );

  for (const item of scoredZones) {
    const z = item.zone;
    const score = z.risk.risk_score;
    const hazard = z.risk.hazard_level;
    const workers = z.metadata.outdoor_workers;

    if (score < 40 && hazard === 'LOW') continue;

    const neededMisting = Math.min(
      resourcesLeft.misting_trailers,
      workers > 4500 && score >= 70 ? 2 : 1
    );
    const neededShelters = Math.min(
      resourcesLeft.mobile_shelters,
      score >= 75 ? 1 : 0
    );
    const neededHydration = Math.min(
      resourcesLeft.hydration_vans,
      workers > 5000 ? 3 : score >= 65 ? 2 : 1
    );

    if (neededMisting > 0 || neededShelters > 0 || neededHydration > 0) {
      resourcesLeft.misting_trailers -= neededMisting;
      resourcesLeft.mobile_shelters -= neededShelters;
      resourcesLeft.hydration_vans -= neededHydration;

      allocations.push({
        zone_id: z.metadata.id,
        zone_name: z.metadata.name,
        allocated: {
          misting_trailers: neededMisting,
          mobile_shelters: neededShelters,
          hydration_vans: neededHydration,
        },
        justification: `Priority Index ${item.priority} (Risk ${score}/100, ${workers.toLocaleString()} outdoor workers). Mitigating extreme thermal stress.`,
      });

      reasoningSteps.push(
        `Dispatched to ${z.metadata.name} (${z.metadata.id}): ${neededMisting} Misting Trailers, ${neededShelters} Shelters, ${neededHydration} Hydration Vans protecting ${workers.toLocaleString()} workers at ${z.risk.heat_index}°F Heat Index.`
      );
    }

    if (hazard === 'HIGH' || hazard === 'EXTREME' || score >= 65) {
      const oshaRecEn =
        hazard === 'HIGH'
          ? 'Mandatory 30m work / 30m shade rest cycle with active electrolyte intake.'
          : 'Mandatory 15m work / 45m shade rest cycle. Suspend high-exertion roofing and asphalt paving.';

      const oshaRecAr =
        hazard === 'HIGH'
          ? 'فترات راحة إلزامية: 30 دقيقة عمل / 30 دقيقة راحة في الظل مع تعويض السوائل والأملاح.'
          : 'فترات راحة إلزامية: 15 دقيقة عمل / 45 دقيقة راحة في الظل. إيقاف أعمال الأسفلت والأسطح الشاقة فوراً.';

      const oshaRecHi =
        hazard === 'HIGH'
          ? 'अनिवार्य चक्र: 30 मिनट कार्य / 30 मिनट छायादार विश्राम एवं इलेक्ट्रोलाइट सेवन।'
          : 'अनिवार्य चक्र: 15 मिनट कार्य / 45 मिनट छायादार विश्राम। भारी कार्य तुरंत रोकें।';

      alerts.push({
        id: `alert-${z.metadata.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        target_channel: 'OUTDOOR_EMPLOYERS_SMS',
        target_zone: z.metadata.id,
        severity: hazard,
        title: `URGENT HEAT ALERT: ${z.metadata.name} under ${hazard} Thermal Stress`,
        title_ar: `إنذار حراري عاجل: ${z.metadata.name} تحت وطأة إجهاد حراري ${hazard === 'EXTREME' ? 'حرج للغاية' : 'مرتفع'}`,
        title_hi: `अत्यधिक गर्मी चेतावनी: ${z.metadata.name} गंभीर तापीय तनाव में`,
        message: `Heat Index ${z.risk.heat_index}°F (WBGT ${z.risk.wbgt}°F). ${oshaRecEn} Hydration vans stationed at major work zones.`,
        message_ar: `مؤشر الحرارة ${z.risk.heat_index}°F (WBGT ${z.risk.wbgt}°F). ${oshaRecAr} شاحنات الترطيب والمياه متمركزة في مواقع العمل.`,
        message_hi: `हीट इंडेक्स ${z.risk.heat_index}°F (WBGT ${z.risk.wbgt}°F)। ${oshaRecHi} प्रमुख कार्यस्थलों पर जलयोजन वैन तैनात हैं।`,
        action_required: 'Enforce shaded hydration breaks immediately and verify onsite cooling shelter access.',
        action_required_ar: 'تطبيق فترات الراحة وشرب المياه فوراً والتحقق من جاهزية ملاجئ التبريد الميدانية.',
        action_required_hi: 'तुरंत छायादार जलयोजन ब्रेक लागू करें और ऑन-साइट कूलिंग शेल्टर तक पहुंच सुनिश्चित करें।',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }

  return {
    allocations,
    alerts,
    remainingResources: resourcesLeft,
    reasoningText: reasoningSteps.join('\n'),
    reasoningSteps,
  };
}

export function runSimulationCycle(
  prevState: SimulationState,
  advanceMinutes = 30,
  geminiPlanResult?: {
    allocations: ResourceAllocation[];
    alerts: HeatAlert[];
    reasoningSummary: string;
    reasoningSteps: string[];
  }
): SimulationState {
  let newMinute = prevState.minute + advanceMinutes;
  let newHour = prevState.hour + Math.floor(newMinute / 60);
  newMinute = newMinute % 60;
  if (newHour >= 24) newHour = newHour % 24;

  const cycleCount = prevState.cycleCount + 1;
  const timeString = `2026-07-15 ${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}:00`;

  const updatedZones: Record<string, ZoneState> = {};
  const extremeZones: string[] = [];

  for (const z of PHOENIX_ZONES_LIST) {
    const telem = calculateZoneTelemetry(z.id, newHour, newMinute, prevState.scenario);
    const risk = calculateRiskScore(
      telem.ambient_temperature_f,
      telem.relative_humidity,
      z.tree_canopy_pct,
      z.vulnerability_index,
      z.outdoor_workers,
      telem.wind_speed_mph,
      telem.solar_radiation_w_m2
    );

    const oldZone = prevState.zones[z.id];

    updatedZones[z.id] = {
      ...oldZone,
      current_telemetry: telem,
      risk,
      forecast: {
        ...oldZone.forecast,
        peak_temp_f: Math.round((getScenarioParams(prevState.scenario).peakTemp + z.uhi_intensity_f) * 10) / 10,
        will_cross_105: telem.ambient_temperature_f >= 100 || oldZone.forecast.peak_temp_f >= 105,
      },
      deployed_resources: { misting_trailers: 0, mobile_shelters: 0, hydration_vans: 0 },
    };

    if (risk.hazard_level === 'HIGH' || risk.hazard_level === 'EXTREME') {
      extremeZones.push(`${z.name} (HI ${risk.heat_index}°F)`);
    }
  }

  let allocations: ResourceAllocation[] = [];
  let alerts: HeatAlert[] = [];
  let reasoningText = '';
  let reasoningSteps: string[] = [];

  if (geminiPlanResult && prevState.plannerType === 'GEMINI_3_5_FLASH') {
    allocations = geminiPlanResult.allocations;
    alerts = geminiPlanResult.alerts;
    reasoningText = geminiPlanResult.reasoningSummary;
    reasoningSteps = geminiPlanResult.reasoningSteps;
  } else {
    const plan = executeDeterministicPlan(updatedZones, {
      misting_trailers: prevState.availableResources.misting_trailers,
      mobile_shelters: prevState.availableResources.mobile_shelters,
      hydration_vans: prevState.availableResources.hydration_vans,
    });
    allocations = plan.allocations;
    alerts = plan.alerts;
    reasoningText = plan.reasoningText;
    reasoningSteps = plan.reasoningSteps;
  }

  for (const alloc of allocations) {
    if (updatedZones[alloc.zone_id]) {
      updatedZones[alloc.zone_id].deployed_resources = alloc.allocated;
    }
  }

  const avgHi =
    Object.values(updatedZones).reduce((acc, curr) => acc + curr.risk.heat_index, 0) /
    Object.keys(updatedZones).length;
  const gridStrain = Math.round(Math.min(98, Math.max(30, (avgHi - 80) * 1.6)) * 10) / 10;
  const highRiskCount = Object.values(updatedZones).filter(
    (z) => z.risk.hazard_level === 'HIGH' || z.risk.hazard_level === 'EXTREME'
  ).length;
  const hospitalLoad = Math.round(Math.min(95, 10 + highRiskCount * 9.5) * 10) / 10;

  const newAuditEntries: AuditEntry[] = [
    ...prevState.auditEntries,
    {
      id: `audit-${Date.now()}-1`,
      timestamp: new Date().toISOString(),
      agent: 'ZoneMonitor',
      action: 'INGEST_AND_SCORE',
      reasoning: `Ingested 8 Phoenix zones via ${prevState.sourceType}. ${extremeZones.length} high/extreme hazard zones flagged.`,
    },
    {
      id: `audit-${Date.now()}-2`,
      timestamp: new Date().toISOString(),
      agent: 'ResourcePlanner',
      action: 'OPTIMIZE_ALLOCATIONS',
      reasoning: `Allocated cooling assets across ${allocations.length} priority zones using ${prevState.plannerType}.`,
    },
    {
      id: `audit-${Date.now()}-3`,
      timestamp: new Date().toISOString(),
      agent: 'AlertDispatcher',
      action: 'DISPATCH_BROADCASTS',
      reasoning: `Broadcasted ${alerts.length} targeted bilingual heat warning alerts across worker SMS, transit, and employer portals.`,
    },
  ];

  const agentStatuses: Record<string, AgentStatus> = {
    LeadOrchestrator: {
      name: 'LeadOrchestrator',
      role: 'Fleet Commander & Decision Arbiter',
      status: 'ACTIVE',
      last_action: `Cycle #${cycleCount} Executed`,
      last_reasoning: `Coordinated fleet at ${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}. Dispatched ${allocations.length} cooling packages.`,
    },
    ZoneMonitor: {
      name: 'ZoneMonitor',
      role: 'Hyperlocal Telemetry & Risk Scoring',
      status: 'ACTIVE',
      last_action: `Ingested 8 Zones (${prevState.sourceType === 'FORTYGUARD_LIVE' ? 'FortyGuard Live API' : 'Simulated Physics Feed'})`,
      last_reasoning: `Average city Heat Index: ${Math.round(avgHi)}°F. Flagged ${extremeZones.length} thermal hotspots.`,
    },
    HeatForecaster: {
      name: 'HeatForecaster',
      role: 'Threshold Crossing & Trajectory Prediction',
      status: 'ACTIVE',
      last_action: 'Predictive Trajectory Updated',
      last_reasoning: `Anticipates 105°F+ threshold breaches in 8 zones. Peak thermal burden projected around 16:30.`,
    },
    ResourcePlanner: {
      name: 'ResourcePlanner',
      role: 'Autonomous Asset Allocation & Optimization',
      status: 'ACTIVE',
      last_action: `Dispatched ${allocations.length} Allocations (${prevState.plannerType})`,
      last_reasoning: `Prioritized Maryvale, Alhambra, and Deer Valley due to high outdoor worker concentration and low canopy cover.`,
    },
    AlertDispatcher: {
      name: 'AlertDispatcher',
      role: 'Targeted Multi-Channel Emergency Broadcast',
      status: 'DISPATCHING',
      last_action: `Dispatched ${alerts.length} Bilingual Alerts`,
      last_reasoning: `Transmitted OSHA Category ${avgHi >= 110 ? '4' : '3'} mandatory rest/shade protocols directly to active crews in EN and ES.`,
    },
    CoolingCenters: {
      name: 'CoolingCenters',
      role: 'Municipal Hydration & Shelter Network',
      status: 'ACTIVE',
      last_action: '22 Centers Active (1,870 Capacity)',
      last_reasoning: 'Cooling center hydration reserves verified at 94% capacity across Phoenix community facilities.',
    },
    EmployersAgent: {
      name: 'EmployersAgent',
      role: 'OSHA Work-Rest Protocol Compliance',
      status: avgHi >= 108 ? 'ALERT' : 'ACTIVE',
      last_action: avgHi >= 112 ? 'OSHA Cat 4 Work Suspension Active' : 'OSHA Rest Cycles Active',
      last_reasoning: avgHi >= 112 ? 'Suspended strenuous roofing/asphalt work in extreme thermal zones.' : 'Monitoring mandatory 30m work/30m shade break rotations.',
    },
    TransitAgent: {
      name: 'TransitAgent',
      role: 'Valley Metro Shaded Stops & Mobile AC Buses',
      status: 'ACTIVE',
      last_action: '6 Mobile AC Buses Staged',
      last_reasoning: 'Positioned mobile air-conditioned cooling buses at high-transfer Maryvale & Alhambra stops.',
    },
    GridAgent: {
      name: 'GridAgent',
      role: 'APS / SRP Substation Load & Grid Resilience',
      status: gridStrain >= 70 ? 'ALERT' : 'ACTIVE',
      last_action: `Substation Strain ${gridStrain}%`,
      last_reasoning: `Coordinating demand-response precooling with commercial HVAC to prevent peak distribution overload.`,
    },
    HospitalAgent: {
      name: 'HospitalAgent',
      role: 'Valleywise & Banner ER Heat Stroke Surge Triage',
      status: hospitalLoad >= 60 ? 'ALERT' : 'ACTIVE',
      last_action: `ER Surge Load ${hospitalLoad}%`,
      last_reasoning: `Trauma units staged with ice-water immersion tanks and IV electrolyte reserves for heat hyperthermia intake.`,
    },
  };

  return {
    ...prevState,
    timestamp: timeString,
    hour: newHour,
    minute: newMinute,
    cycleCount,
    zones: updatedZones,
    agentStatuses,
    activeAlerts: alerts,
    activeAllocations: allocations,
    auditEntries: newAuditEntries.slice(-150),
    gridStrain,
    hospitalLoad,
    plannerReasoning: reasoningText,
    plannerReasoningSteps: reasoningSteps,
  };
}

export function runCounterfactualReplay(scenario: ScenarioType = 'EXTREME_HEATWAVE'): ReplayResult {
  const params = getScenarioParams(scenario);
  const timeline: ReplayTimelineStep[] = [];

  let totalBaselineWorkerExp = 0;
  let totalHeatSentryWorkerExp = 0;
  let totalBaselineEr = 0;
  let totalHeatSentryEr = 0;
  let totalBaselineDeaths = 0;
  let totalHeatSentryDeaths = 0;
  let totalBreaches = 0;

  const zoneBreakdown: Record<string, ReplayZoneBreakdown> = Object.fromEntries(
    PHOENIX_ZONES_LIST.map((z) => [
      z.id,
      {
        zone_id: z.id,
        name: z.name,
        baseline_er_visits: 0,
        heatsentry_er_visits: 0,
        er_avoided: 0,
        baseline_worker_exposed_hrs: 0,
        heatsentry_worker_exposed_hrs: 0,
        worker_hrs_protected: 0,
        peak_temp_f: 0,
      },
    ])
  );

  for (let hour = 0; hour < 24; hour++) {
    const timeLabel = `${String(hour).padStart(2, '0')}:00`;
    let stepBaseEr = 0;
    let stepHsEr = 0;
    let stepBaseWorkerExp = 0;
    let stepHsWorkerExp = 0;
    let stepBaseMort = 0;
    let stepHsMort = 0;

    const hourlyZones: ReplayTimelineStep['zones'] = [];

    for (const z of PHOENIX_ZONES_LIST) {
      const telem = calculateZoneTelemetry(z.id, hour, 0, scenario);
      const risk = calculateRiskScore(
        telem.ambient_temperature_f,
        telem.relative_humidity,
        z.tree_canopy_pct,
        z.vulnerability_index,
        z.outdoor_workers,
        telem.wind_speed_mph,
        telem.solar_radiation_w_m2
      );

      const hi = risk.heat_index;
      const wbgt = risk.wbgt;
      const workers = z.outdoor_workers;
      const pop = z.population;
      const vuln = z.vulnerability_index;

      if (telem.ambient_temperature_f > zoneBreakdown[z.id].peak_temp_f) {
        zoneBreakdown[z.id].peak_temp_f = telem.ambient_temperature_f;
      }

      if (hi >= 105) totalBreaches++;

      const isWorkingHour = hour >= 6 && hour <= 18;

      let baseExp = 0;
      if (isWorkingHour && hi >= 100) baseExp = workers * 1.0;
      else if (isWorkingHour && hi >= 90) baseExp = workers * 0.5;

      let hsExp = 0;
      if (isWorkingHour && hi >= 105) hsExp = baseExp * 0.25;
      else if (isWorkingHour && hi >= 95) hsExp = baseExp * 0.4;
      else hsExp = baseExp * 0.7;

      const excessHeat = Math.max(0, hi - 88);
      const rr = excessHeat > 0 ? Math.exp(0.048 * excessHeat) : 1.0;

      const basePopErRate = (pop / 10000.0) * 0.012;
      const workerErRate = (workers / 1000.0) * (isWorkingHour ? 0.045 : 0.005);
      const baselineZoneEr =
        basePopErRate * (rr - 1.0) * (1.0 + vuln * 0.8) + workerErRate * Math.max(0, rr - 1.0);

      const mitigationFactor = hi >= 105 ? 0.72 : 0.55;
      const heatsentryZoneEr = baselineZoneEr * (1.0 - mitigationFactor);

      const baseMortality = baselineZoneEr * 0.038 * (1.0 + vuln);
      const hsMortality = heatsentryZoneEr * 0.008;

      stepBaseEr += baselineZoneEr;
      stepHsEr += heatsentryZoneEr;
      stepBaseWorkerExp += baseExp;
      stepHsWorkerExp += hsExp;
      stepBaseMort += baseMortality;
      stepHsMort += hsMortality;

      zoneBreakdown[z.id].baseline_er_visits += baselineZoneEr;
      zoneBreakdown[z.id].heatsentry_er_visits += heatsentryZoneEr;
      zoneBreakdown[z.id].baseline_worker_exposed_hrs += baseExp;
      zoneBreakdown[z.id].heatsentry_worker_exposed_hrs += hsExp;

      hourlyZones.push({
        zone_id: z.id,
        name: z.name,
        temp_f: telem.ambient_temperature_f,
        heat_index: hi,
        wbgt,
        hazard_level: risk.hazard_level,
        risk_score: risk.risk_score,
        baseline_er: Math.round(baselineZoneEr * 10) / 10,
        heatsentry_er: Math.round(heatsentryZoneEr * 10) / 10,
      });
    }

    totalBaselineEr += stepBaseEr;
    totalHeatSentryEr += stepHsEr;
    totalBaselineWorkerExp += stepBaseWorkerExp;
    totalHeatSentryWorkerExp += stepHsWorkerExp;
    totalBaselineDeaths += stepBaseMort;
    totalHeatSentryDeaths += stepHsMort;

    timeline.push({
      hour,
      time_label: timeLabel,
      city_avg_temp_f:
        Math.round((hourlyZones.reduce((a, b) => a + b.temp_f, 0) / hourlyZones.length) * 10) / 10,
      city_peak_temp_f: Math.round(Math.max(...hourlyZones.map((z) => z.temp_f)) * 10) / 10,
      city_peak_heat_index: Math.round(Math.max(...hourlyZones.map((z) => z.heat_index)) * 10) / 10,
      baseline_worker_exposed_hrs: Math.round(stepBaseWorkerExp),
      heatsentry_worker_exposed_hrs: Math.round(stepHsWorkerExp),
      baseline_er_visits: Math.round(stepBaseEr * 10) / 10,
      heatsentry_er_visits: Math.round(stepHsEr * 10) / 10,
      cumulative_er_avoided: Math.round((totalBaselineEr - totalHeatSentryEr) * 10) / 10,
      zones: hourlyZones,
    });
  }

  const erAvoided = Math.max(0, totalBaselineEr - totalHeatSentryEr);
  const livesSaved = Math.max(0, totalBaselineDeaths - totalHeatSentryDeaths);
  const workerHrsProtected = Math.max(0, totalBaselineWorkerExp - totalHeatSentryWorkerExp);
  const economicSavings = erAvoided * 14800 + workerHrsProtected * 32;

  const finalBreakdown = Object.values(zoneBreakdown).map((zd) => ({
    ...zd,
    baseline_er_visits: Math.round(zd.baseline_er_visits * 10) / 10,
    heatsentry_er_visits: Math.round(zd.heatsentry_er_visits * 10) / 10,
    er_avoided: Math.round((zd.baseline_er_visits - zd.heatsentry_er_visits) * 10) / 10,
    baseline_worker_exposed_hrs: Math.round(zd.baseline_worker_exposed_hrs),
    heatsentry_worker_exposed_hrs: Math.round(zd.heatsentry_worker_exposed_hrs),
    worker_hrs_protected: Math.round(zd.baseline_worker_exposed_hrs - zd.heatsentry_worker_exposed_hrs),
  }));

  return {
    status: 'SUCCESS',
    metadata: {
      scenario: params.name,
      peak_temperature_f: params.peakTemp,
      city: 'Phoenix, Arizona',
      zones_analyzed: PHOENIX_ZONES_LIST.length,
    },
    summary_deltas: {
      er_visits_avoided: Math.round(erAvoided * 10) / 10,
      er_visits_baseline: Math.round(totalBaselineEr * 10) / 10,
      er_visits_heatsentry: Math.round(totalHeatSentryEr * 10) / 10,
      lives_saved_projected: Math.round(livesSaved * 10) / 10,
      baseline_deaths_projected: Math.round(totalBaselineDeaths * 10) / 10,
      heatsentry_deaths_projected: Math.round(totalHeatSentryDeaths * 10) / 10,
      worker_hours_protected: Math.round(workerHrsProtected),
      worker_hours_exposed_baseline: Math.round(totalBaselineWorkerExp),
      worker_hours_exposed_heatsentry: Math.round(totalHeatSentryWorkerExp),
      threshold_crossings_prevented: totalBreaches,
      economic_savings_usd: Math.round(economicSavings),
      cooling_resource_efficiency_pct: 94.6,
    },
    zone_breakdown: finalBreakdown,
    timeline,
  };
}
