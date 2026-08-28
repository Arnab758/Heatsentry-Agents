import { MonteCarloSummary, MonteCarloIteration, ScenarioType } from '../types/heatsentry';
import { runCounterfactualReplay } from './simulationEngine';

export function runMonteCarloSimulation(
  runsCount = 100,
  scenario: ScenarioType = 'EXTREME_HEATWAVE'
): MonteCarloSummary {
  const iterations: MonteCarloIteration[] = [];
  const baseReplay = runCounterfactualReplay(scenario);
  const baseErAvoided = baseReplay.summary_deltas.er_visits_avoided;
  const baseLivesSaved = baseReplay.summary_deltas.lives_saved_projected;
  const baseSavings = baseReplay.summary_deltas.economic_savings_usd;

  let totalLivesSaved = 0;
  let totalErAvoided = 0;
  let totalEconomicSavings = 0;

  for (let i = 1; i <= runsCount; i++) {
    // Gaussian-like randomized variance
    const tempNoise = (Math.random() - 0.5) * 6.0; // +/- 3 deg
    const powerOutageProb = Math.random() < 0.18; // 18% outage probability
    const peakTemp = Math.round((116.0 + tempNoise) * 10) / 10;

    const outageMultiplier = powerOutageProb ? 1.45 : 1.0;
    const tempSeverityMultiplier = Math.max(0.7, 1.0 + (peakTemp - 116.0) * 0.08);

    const runErAvoided = Math.round(baseErAvoided * tempSeverityMultiplier * outageMultiplier * (0.92 + Math.random() * 0.16) * 10) / 10;
    const runLivesSaved = Math.round(baseLivesSaved * tempSeverityMultiplier * outageMultiplier * (0.88 + Math.random() * 0.24) * 10) / 10;
    const runSavings = Math.round(runErAvoided * 14800 + runLivesSaved * 120000);

    const baseEr = Math.round(runErAvoided * 2.3 * 10) / 10;
    const hsEr = Math.round((baseEr - runErAvoided) * 10) / 10;

    iterations.push({
      run_id: i,
      peak_temp_f: peakTemp,
      power_outage_occurred: powerOutageProb,
      baseline_er: baseEr,
      heatsentry_er: hsEr,
      er_avoided: runErAvoided,
      lives_saved: runLivesSaved,
      economic_savings_usd: runSavings,
    });

    totalLivesSaved += runLivesSaved;
    totalErAvoided += runErAvoided;
    totalEconomicSavings += runSavings;
  }

  const meanLivesSaved = Math.round((totalLivesSaved / runsCount) * 10) / 10;
  const meanErAvoided = Math.round((totalErAvoided / runsCount) * 10) / 10;
  const meanEconomicSavings = Math.round(totalEconomicSavings / runsCount);

  // Calculate standard deviations
  const sdLives = Math.sqrt(
    iterations.reduce((acc, it) => acc + Math.pow(it.lives_saved - meanLivesSaved, 2), 0) / runsCount
  );
  const sdEr = Math.sqrt(
    iterations.reduce((acc, it) => acc + Math.pow(it.er_avoided - meanErAvoided, 2), 0) / runsCount
  );

  const livesSorted = iterations.map((it) => it.lives_saved).sort((a, b) => a - b);

  return {
    total_runs: runsCount,
    mean_lives_saved: meanLivesSaved,
    ci_95_lives_saved: [
      Math.max(0.5, Math.round((meanLivesSaved - 1.96 * (sdLives / Math.sqrt(runsCount))) * 10) / 10),
      Math.round((meanLivesSaved + 1.96 * (sdLives / Math.sqrt(runsCount))) * 10) / 10,
    ],
    mean_er_avoided: meanErAvoided,
    ci_95_er_avoided: [
      Math.round((meanErAvoided - 1.96 * (sdEr / Math.sqrt(runsCount))) * 10) / 10,
      Math.round((meanErAvoided + 1.96 * (sdEr / Math.sqrt(runsCount))) * 10) / 10,
    ],
    mean_economic_savings: meanEconomicSavings,
    worst_case_lives_saved: livesSorted[0],
    best_case_lives_saved: livesSorted[livesSorted.length - 1],
    iterations,
  };
}
