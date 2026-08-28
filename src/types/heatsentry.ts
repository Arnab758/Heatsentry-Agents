export type HazardLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export type PlannerType = 'DETERMINISTIC' | 'GEMINI_3_5_FLASH';
export type SourceType = 'SIMULATED_FEED' | 'FORTYGUARD_LIVE';
export type ScenarioType = 'EXTREME_HEATWAVE' | 'MONSOON_HUMIDITY' | 'FLASH_HEAT_DOME';

export interface ZoneMetadata {
  id: string;
  name: string;
  lat: number;
  lon: number;
  population: number;
  outdoor_workers: number;
  tree_canopy_pct: number;
  uhi_intensity_f: number;
  vulnerability_index: number;
  primary_risks: string[];
  cooling_centers_available: number;
  misting_stations_capacity: number;
  mobile_shelters_capacity: number;
  svgPath?: string;
  mapCoords: { x: number; y: number };
}

export interface ZoneTelemetry {
  ambient_temperature_f: number;
  surface_temperature_f: number;
  relative_humidity: number;
  solar_radiation_w_m2: number;
  wind_speed_mph: number;
  urban_heat_island_delta_f: number;
}

export interface RiskBreakdown {
  meteorological: number;
  canopy_penalty: number;
  social_vulnerability: number;
  worker_exposure: number;
}

export interface ZoneRisk {
  heat_index: number;
  wbgt: number;
  hazard_level: HazardLevel;
  risk_score: number;
  breakdown: RiskBreakdown;
  requires_urgent_action: boolean;
  osha_work_rest_cycle: string;
}

export interface DeployedResources {
  misting_trailers: number;
  mobile_shelters: number;
  hydration_vans: number;
}

export interface ZoneForecast {
  peak_temp_f: number;
  will_cross_105: boolean;
  will_cross_110: boolean;
  duration_hours: number;
  persistence_index: number;
}

export interface ZoneState {
  metadata: ZoneMetadata;
  current_telemetry: ZoneTelemetry;
  risk: ZoneRisk;
  forecast: ZoneForecast;
  deployed_resources: DeployedResources;
  active_protections: string[];
}

export interface AgentStatus {
  name: string;
  role: string;
  status: 'ACTIVE' | 'REASONING' | 'DISPATCHING' | 'READY' | 'ALERT' | 'NEGOTIATING';
  last_action: string;
  last_reasoning: string;
}

export interface ResourceAllocation {
  zone_id: string;
  zone_name: string;
  allocated: DeployedResources;
  justification: string;
}

export interface HeatAlert {
  id: string;
  target_channel: string;
  target_zone: string;
  severity: HazardLevel;
  title: string;
  title_ar?: string;
  title_hi?: string;
  title_es?: string;
  message: string;
  message_ar?: string;
  message_hi?: string;
  message_es?: string;
  action_required: string;
  action_required_ar?: string;
  action_required_hi?: string;
  action_required_es?: string;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  target_zone?: string;
  reasoning: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}

export interface AgentNegotiationMessage {
  id: string;
  timestamp: string;
  fromAgent: string;
  toAgent: string;
  type: 'PROPOSAL' | 'COUNTER_PROPOSAL' | 'WARNING' | 'CONCURRENCE' | 'RESOLUTION';
  topic: string;
  content: string;
  impactScoreDelta?: number;
}

export interface MonteCarloIteration {
  run_id: number;
  peak_temp_f: number;
  power_outage_occurred: boolean;
  baseline_er: number;
  heatsentry_er: number;
  er_avoided: number;
  lives_saved: number;
  economic_savings_usd: number;
}

export interface MonteCarloSummary {
  total_runs: number;
  mean_lives_saved: number;
  ci_95_lives_saved: [number, number];
  mean_er_avoided: number;
  ci_95_er_avoided: [number, number];
  mean_economic_savings: number;
  worst_case_lives_saved: number;
  best_case_lives_saved: number;
  iterations: MonteCarloIteration[];
}

export interface ReplayTimelineStep {
  hour: number;
  time_label: string;
  city_avg_temp_f: number;
  city_peak_temp_f: number;
  city_peak_heat_index: number;
  baseline_worker_exposed_hrs: number;
  heatsentry_worker_exposed_hrs: number;
  baseline_er_visits: number;
  heatsentry_er_visits: number;
  cumulative_er_avoided: number;
  zones: {
    zone_id: string;
    name: string;
    temp_f: number;
    heat_index: number;
    wbgt: number;
    hazard_level: HazardLevel;
    risk_score: number;
    baseline_er: number;
    heatsentry_er: number;
  }[];
}

export interface ReplaySummary {
  er_visits_avoided: number;
  er_visits_baseline: number;
  er_visits_heatsentry: number;
  lives_saved_projected: number;
  baseline_deaths_projected: number;
  heatsentry_deaths_projected: number;
  worker_hours_protected: number;
  worker_hours_exposed_baseline: number;
  worker_hours_exposed_heatsentry: number;
  threshold_crossings_prevented: number;
  economic_savings_usd: number;
  cooling_resource_efficiency_pct: number;
}

export interface ReplayZoneBreakdown {
  zone_id: string;
  name: string;
  baseline_er_visits: number;
  heatsentry_er_visits: number;
  er_avoided: number;
  baseline_worker_exposed_hrs: number;
  heatsentry_worker_exposed_hrs: number;
  worker_hrs_protected: number;
  peak_temp_f: number;
}

export interface ReplayResult {
  status: string;
  metadata: {
    scenario: string;
    peak_temperature_f: number;
    city: string;
    zones_analyzed: number;
  };
  summary_deltas: ReplaySummary;
  zone_breakdown: ReplayZoneBreakdown[];
  timeline: ReplayTimelineStep[];
}
