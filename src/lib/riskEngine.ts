import { HazardLevel, ZoneRisk } from '../types/heatsentry';

export function calculateHeatIndex(tempF: number, relativeHumidity: number): number {
  const T = tempF;
  const RH = Math.max(0, Math.min(100, relativeHumidity));

  // Steadman simple formula
  const simpleHi = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
  if (simpleHi < 80.0) {
    return Math.round(simpleHi * 10) / 10;
  }

  // Rothfusz regression equation
  let hi =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * (T * T) -
    0.05481717 * (RH * RH) +
    0.00122874 * (T * T) * RH +
    0.00085282 * T * (RH * RH) -
    0.00000199 * (T * T) * (RH * RH);

  // Low RH adjustment for Phoenix desert conditions
  if (RH < 13.0 && T >= 80.0 && T <= 112.0) {
    const adj = ((13.0 - RH) / 4.0) * Math.sqrt((17.0 - Math.abs(T - 95.0)) / 17.0);
    hi -= adj;
  } else if (RH > 85.0 && T >= 80.0 && T <= 87.0) {
    const adj = ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0);
    hi += adj;
  }

  return Math.round(hi * 10) / 10;
}

export function calculateWbgt(
  tempF: number,
  relativeHumidity: number,
  windSpeedMph = 5.0,
  solarRadWm2 = 750.0
): number {
  const tempC = ((tempF - 32.0) * 5.0) / 9.0;
  const rh = Math.max(1, Math.min(100, relativeHumidity));

  // Stull equation for wet bulb temp
  const twC =
    tempC * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(tempC + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;

  const twF = (twC * 9.0) / 5.0 + 32.0;
  const windFactor = Math.max(1.0, Math.sqrt(Math.max(0.5, windSpeedMph)));
  const solarRiseF = (solarRadWm2 / 100.0) * (2.8 / windFactor);
  const tgF = tempF + solarRiseF;
  const tdF = tempF;

  const wbgtF = 0.7 * twF + 0.2 * tgF + 0.1 * tdF;
  return Math.round(wbgtF * 10) / 10;
}

export function classifyHazard(heatIndex: number, wbgt: number): HazardLevel {
  if (heatIndex >= 115.0 || wbgt >= 90.0) return 'EXTREME';
  if (heatIndex >= 103.0 || wbgt >= 86.0) return 'HIGH';
  if (heatIndex >= 91.0 || wbgt >= 80.0) return 'MODERATE';
  return 'LOW';
}

export function getOshaRecommendation(wbgtF: number): string {
  if (wbgtF >= 90.0) {
    return 'OSHA Cat 4: 15m work / 45m shade rest per hr. Suspend heavy roofing/paving.';
  }
  if (wbgtF >= 86.0) {
    return 'OSHA Cat 3: 30m work / 30m shade rest per hr. Mandatory electrolytes.';
  }
  if (wbgtF >= 80.0) {
    return 'OSHA Cat 2: 45m work / 15m shade rest per hr. Water break every 20m.';
  }
  return 'OSHA Cat 1: Normal operations with free shaded water access.';
}

export function calculateRiskScore(
  tempF: number,
  relativeHumidity: number,
  treeCanopyPct: number,
  vulnerabilityIndex: number,
  outdoorWorkers: number,
  windSpeedMph = 5.0,
  solarRadWm2 = 750.0
): ZoneRisk {
  const hi = calculateHeatIndex(tempF, relativeHumidity);
  const wbgt = calculateWbgt(tempF, relativeHumidity, windSpeedMph, solarRadWm2);
  const hazardLevel = classifyHazard(hi, wbgt);

  // Base meteorological thermal strain (0 to 60 pts)
  const meteorologicalScore = Math.max(0, Math.min(60, (hi - 75.0) * (60.0 / 45.0)));

  // Tree canopy deficit penalty (0 to 15 pts)
  const canopyPenalty = Math.max(0, Math.min(15, (30.0 - Math.min(30, treeCanopyPct)) * 0.5));

  // Social vulnerability (0 to 15 pts)
  const socialScore = Math.max(0, Math.min(15, vulnerabilityIndex * 15.0));

  // Outdoor worker density (0 to 10 pts)
  const workerFactor = Math.max(0, Math.min(10, outdoorWorkers / 500.0));

  const rawScore = meteorologicalScore + canopyPenalty + socialScore + workerFactor;
  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)) * 10) / 10;

  return {
    heat_index: hi,
    wbgt: wbgt,
    hazard_level: hazardLevel,
    risk_score: finalScore,
    breakdown: {
      meteorological: Math.round(meteorologicalScore * 10) / 10,
      canopy_penalty: Math.round(canopyPenalty * 10) / 10,
      social_vulnerability: Math.round(socialScore * 10) / 10,
      worker_exposure: Math.round(workerFactor * 10) / 10,
    },
    requires_urgent_action: finalScore >= 70.0 || hazardLevel === 'HIGH' || hazardLevel === 'EXTREME',
    osha_work_rest_cycle: getOshaRecommendation(wbgt),
  };
}
