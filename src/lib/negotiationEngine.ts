import { AgentNegotiationMessage, ZoneState, DeployedResources } from '../types/heatsentry';

export function generateNegotiationMesh(
  zones: Record<string, ZoneState>,
  cycleCount: number,
  gridStrain: number,
  hospitalLoad: number
): AgentNegotiationMessage[] {
  const timestamp = new Date().toLocaleTimeString();
  const messages: AgentNegotiationMessage[] = [];

  // Find most critical zone
  const sorted = Object.values(zones).sort(
    (a, b) => b.risk.risk_score - a.risk.risk_score
  );
  const primaryCritical = sorted[0];
  const secondaryCritical = sorted[1] || sorted[0];

  const primaryName = primaryCritical?.metadata.name || 'Maryvale';
  const primaryId = primaryCritical?.metadata.id || 'PHX-02';
  const secName = secondaryCritical?.metadata.name || 'Alhambra';
  const secId = secondaryCritical?.metadata.id || 'PHX-05';

  const hi = primaryCritical?.risk.heat_index || 112;

  // Step 1: Hospital Surge Notification
  messages.push({
    id: `neg-${cycleCount}-1`,
    timestamp,
    fromAgent: 'HospitalAgent',
    toAgent: 'LeadOrchestrator',
    type: 'WARNING',
    topic: 'ER Heat-Stroke Triage Capacity',
    content: `Trauma units near ${primaryName} report ${hospitalLoad}% ICU/ER bed occupancy. High influx of outdoor roofers suffering severe exertional heat illness. Requesting immediate municipal source-cooling intervention in ${primaryName}.`,
    impactScoreDelta: -12,
  });

  // Step 2: Grid Agent Constraint Warning
  messages.push({
    id: `neg-${cycleCount}-2`,
    timestamp,
    fromAgent: 'GridAgent',
    toAgent: 'ResourcePlanner',
    type: 'COUNTER_PROPOSAL',
    topic: 'Substation Transformer Load Limit',
    content: `Grid warning: APS West Phoenix Substation is at ${gridStrain}% capacity. Deploying heavy electrical chiller trailers to ${primaryName} risks localized circuit breaker trips. Proposing solar-buffered misting trailers and zero-grid mobile battery shelters instead.`,
    impactScoreDelta: -5,
  });

  // Step 3: Transit Agent Offer
  messages.push({
    id: `neg-${cycleCount}-3`,
    timestamp,
    fromAgent: 'TransitAgent',
    toAgent: 'LeadOrchestrator',
    type: 'PROPOSAL',
    topic: 'Valley Metro Mobile AC Fleet Staging',
    content: `Valley Metro has 4 articulated air-conditioned buses available. We can stage 2 cooling buses directly at the unshaded ${primaryName} 51st Ave transfer hub, relieving foot-traffic heat exposure without drawing from the electric distribution grid.`,
    impactScoreDelta: +18,
  });

  // Step 4: Employers Agent Protocol
  messages.push({
    id: `neg-${cycleCount}-4`,
    timestamp,
    fromAgent: 'EmployersAgent',
    toAgent: 'AlertDispatcher',
    type: 'PROPOSAL',
    topic: 'OSHA Category 4 Work Mandate',
    content: `Triggered bilingual SMS dispatch to 42 construction general contractors in ${primaryName} and ${secName}. Mandatory 15m work / 45m shade rotation with paid electrolyte breaks enforced under OSHA General Duty Clause.`,
    impactScoreDelta: +25,
  });

  // Step 5: Resource Planner Synthesis
  messages.push({
    id: `neg-${cycleCount}-5`,
    timestamp,
    fromAgent: 'ResourcePlanner',
    toAgent: 'LeadOrchestrator',
    type: 'CONCURRENCE',
    topic: 'Integrated Tri-Modal Heat Mitigation Plan',
    content: `Optimized plan synthesized: 1) Deploy 2 solar misting units to ${primaryName}, 2) Stage 2 Valley Metro AC buses at ${primaryName} light rail transfer, 3) Allocate 2 mobile hydration vans to ${secName} loading docks. Zero grid brownout risk verified.`,
    impactScoreDelta: +34,
  });

  // Step 6: Lead Orchestrator Consensus & Execution
  messages.push({
    id: `neg-${cycleCount}-6`,
    timestamp,
    fromAgent: 'LeadOrchestrator',
    toAgent: 'ALL_AGENTS',
    type: 'RESOLUTION',
    topic: 'Autonomous Fleet Consensus Reached',
    content: `Consensus validated with 100% agent agreement. Consensus Score: 98.4/100. Dispatches executed to field units, hospital trauma pre-alerted, and bilingual worker SMS broadcast triggered.`,
    impactScoreDelta: +45,
  });

  return messages;
}
