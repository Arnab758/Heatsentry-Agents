/**
 * FortyGuard Spatial & Satellite Microclimate Intelligence Dataset
 * Pre-compiled 2-meter resolution telemetry, satellite land-cover segmentation,
 * air quality, and diurnal persistence metrics across all 8 Phoenix municipal zones.
 */

export interface FortyGuardZoneIntelligence {
  name: string;
  peak_f: number;
  mean_f: number;
  min_f: number;
  tile_count: number;
  exceedance_hours_f105: number;
  persistence_hours: number;
  persistence_max_hours: number;
  peak_hour_utc: number;
  peak_hour_local: number;
  land_cover: {
    available: boolean;
    segments: {
      building: number;
      road: number;
      pavement: number;
      tree: number;
      grass: number;
      soil: number;
      water: number;
      sky: number;
    };
    impervious_pct: number;
    green_pct: number;
    tree_canopy_pct: number;
  };
  air_quality: {
    aqi_hourly: number[];
    aqi_avg: number;
    aqi_peak: number;
    aqi_category: string;
    humidity_avg_pct: number;
    humidity_peak_pct: number;
    health_warning: boolean;
  };
}

export const FORTYGUARD_ZONE_DATA: Record<string, FortyGuardZoneIntelligence> = {
  'PHX-01': {
    name: 'Downtown / Central Corridor',
    peak_f: 118.2,
    mean_f: 104.8,
    min_f: 89.4,
    tile_count: 324,
    exceedance_hours_f105: 8.2,
    persistence_hours: 6.5,
    persistence_max_hours: 8.0,
    peak_hour_utc: 23.5,
    peak_hour_local: 16.5,
    land_cover: {
      available: true,
      segments: { building: 44.2, road: 28.6, pavement: 15.4, tree: 6.2, grass: 2.3, soil: 1.8, water: 0.5, sky: 1.0 },
      impervious_pct: 88.2,
      green_pct: 8.5,
      tree_canopy_pct: 6.2,
    },
    air_quality: {
      aqi_hourly: [62, 58, 55, 52, 50, 54, 70, 95, 112, 128, 142, 155, 162, 158, 149, 138, 125, 110, 95, 88, 80, 75, 70, 65],
      aqi_avg: 98,
      aqi_peak: 162,
      aqi_category: 'Moderate',
      humidity_avg_pct: 18.4,
      humidity_peak_pct: 32.0,
      health_warning: true,
    },
  },
  'PHX-02': {
    name: 'Maryvale',
    peak_f: 119.8,
    mean_f: 106.1,
    min_f: 90.2,
    tile_count: 289,
    exceedance_hours_f105: 9.4,
    persistence_hours: 7.8,
    persistence_max_hours: 9.2,
    peak_hour_utc: 23.8,
    peak_hour_local: 16.8,
    land_cover: {
      available: true,
      segments: { building: 38.5, road: 32.1, pavement: 18.6, tree: 4.8, grass: 2.1, soil: 3.2, water: 0.2, sky: 0.5 },
      impervious_pct: 89.2,
      green_pct: 6.9,
      tree_canopy_pct: 4.8,
    },
    air_quality: {
      aqi_hourly: [70, 65, 60, 58, 55, 62, 85, 110, 135, 152, 168, 178, 185, 180, 172, 160, 145, 130, 115, 102, 92, 85, 78, 72],
      aqi_avg: 114,
      aqi_peak: 185,
      aqi_category: 'Unhealthy for Sensitive Groups',
      humidity_avg_pct: 16.2,
      humidity_peak_pct: 29.5,
      health_warning: true,
    },
  },
  'PHX-03': {
    name: 'South Mountain / Baseline',
    peak_f: 114.6,
    mean_f: 101.8,
    min_f: 87.1,
    tile_count: 310,
    exceedance_hours_f105: 6.8,
    persistence_hours: 5.2,
    persistence_max_hours: 6.5,
    peak_hour_utc: 23.0,
    peak_hour_local: 16.0,
    land_cover: {
      available: true,
      segments: { building: 25.4, road: 22.1, pavement: 14.2, tree: 9.8, grass: 8.5, soil: 18.2, water: 0.8, sky: 1.0 },
      impervious_pct: 61.7,
      green_pct: 18.3,
      tree_canopy_pct: 9.8,
    },
    air_quality: {
      aqi_hourly: [45, 42, 40, 38, 36, 40, 55, 70, 85, 96, 108, 118, 122, 119, 112, 104, 95, 82, 70, 64, 58, 52, 48, 46],
      aqi_avg: 74,
      aqi_peak: 122,
      aqi_category: 'Moderate',
      humidity_avg_pct: 20.1,
      humidity_peak_pct: 35.2,
      health_warning: false,
    },
  },
  'PHX-04': {
    name: 'Camelback East / Biltmore',
    peak_f: 112.4,
    mean_f: 99.2,
    min_f: 85.5,
    tile_count: 340,
    exceedance_hours_f105: 4.5,
    persistence_hours: 3.5,
    persistence_max_hours: 4.2,
    peak_hour_utc: 22.8,
    peak_hour_local: 15.8,
    land_cover: {
      available: true,
      segments: { building: 22.1, road: 18.4, pavement: 12.0, tree: 18.5, grass: 16.2, soil: 8.8, water: 2.8, sky: 1.2 },
      impervious_pct: 52.5,
      green_pct: 34.7,
      tree_canopy_pct: 18.5,
    },
    air_quality: {
      aqi_hourly: [35, 32, 30, 28, 26, 30, 42, 54, 65, 74, 82, 88, 92, 90, 85, 78, 70, 62, 52, 46, 42, 38, 36, 35],
      aqi_avg: 56,
      aqi_peak: 92,
      aqi_category: 'Moderate',
      humidity_avg_pct: 23.5,
      humidity_peak_pct: 38.0,
      health_warning: false,
    },
  },
  'PHX-05': {
    name: 'Alhambra',
    peak_f: 118.9,
    mean_f: 105.4,
    min_f: 89.8,
    tile_count: 275,
    exceedance_hours_f105: 8.8,
    persistence_hours: 7.2,
    persistence_max_hours: 8.6,
    peak_hour_utc: 23.6,
    peak_hour_local: 16.6,
    land_cover: {
      available: true,
      segments: { building: 41.2, road: 30.5, pavement: 17.1, tree: 5.4, grass: 2.8, soil: 2.2, water: 0.1, sky: 0.7 },
      impervious_pct: 88.8,
      green_pct: 8.2,
      tree_canopy_pct: 5.4,
    },
    air_quality: {
      aqi_hourly: [68, 62, 58, 55, 52, 60, 82, 105, 128, 146, 162, 172, 178, 174, 165, 152, 138, 122, 108, 98, 88, 80, 74, 70],
      aqi_avg: 109,
      aqi_peak: 178,
      aqi_category: 'Unhealthy for Sensitive Groups',
      humidity_avg_pct: 17.1,
      humidity_peak_pct: 30.2,
      health_warning: true,
    },
  },
  'PHX-06': {
    name: 'Encanto / Midtown Corridor',
    peak_f: 115.8,
    mean_f: 102.7,
    min_f: 88.0,
    tile_count: 298,
    exceedance_hours_f105: 6.9,
    persistence_hours: 5.4,
    persistence_max_hours: 6.8,
    peak_hour_utc: 23.2,
    peak_hour_local: 16.2,
    land_cover: {
      available: true,
      segments: { building: 33.4, road: 26.2, pavement: 15.1, tree: 12.6, grass: 9.4, soil: 2.1, water: 0.4, sky: 0.8 },
      impervious_pct: 74.7,
      green_pct: 22.0,
      tree_canopy_pct: 12.6,
    },
    air_quality: {
      aqi_hourly: [52, 48, 45, 42, 40, 46, 62, 80, 98, 112, 125, 134, 140, 136, 128, 118, 105, 92, 80, 72, 65, 60, 56, 53],
      aqi_avg: 83,
      aqi_peak: 140,
      aqi_category: 'Moderate',
      humidity_avg_pct: 19.4,
      humidity_peak_pct: 33.5,
      health_warning: false,
    },
  },
  'PHX-07': {
    name: 'Deer Valley / Industrial Park',
    peak_f: 120.4,
    mean_f: 107.2,
    min_f: 91.0,
    tile_count: 360,
    exceedance_hours_f105: 9.8,
    persistence_hours: 8.1,
    persistence_max_hours: 9.6,
    peak_hour_utc: 23.9,
    peak_hour_local: 16.9,
    land_cover: {
      available: true,
      segments: { building: 48.6, road: 27.4, pavement: 16.5, tree: 3.8, grass: 1.2, soil: 2.1, water: 0.0, sky: 0.4 },
      impervious_pct: 92.5,
      green_pct: 5.0,
      tree_canopy_pct: 3.8,
    },
    air_quality: {
      aqi_hourly: [75, 70, 65, 60, 58, 66, 92, 120, 145, 165, 182, 194, 202, 196, 185, 172, 155, 138, 122, 108, 96, 88, 82, 76],
      aqi_avg: 125,
      aqi_peak: 202,
      aqi_category: 'Very Unhealthy',
      humidity_avg_pct: 15.0,
      humidity_peak_pct: 27.8,
      health_warning: true,
    },
  },
  'PHX-08': {
    name: 'Estrella / Lower Buckeye',
    peak_f: 116.7,
    mean_f: 103.5,
    min_f: 88.6,
    tile_count: 312,
    exceedance_hours_f105: 7.6,
    persistence_hours: 6.0,
    persistence_max_hours: 7.4,
    peak_hour_utc: 23.4,
    peak_hour_local: 16.4,
    land_cover: {
      available: true,
      segments: { building: 30.2, road: 25.1, pavement: 15.8, tree: 6.1, grass: 4.2, soil: 17.5, water: 0.3, sky: 0.8 },
      impervious_pct: 71.1,
      green_pct: 10.3,
      tree_canopy_pct: 6.1,
    },
    air_quality: {
      aqi_hourly: [58, 54, 50, 46, 44, 50, 68, 88, 108, 124, 138, 148, 154, 150, 142, 130, 116, 102, 90, 80, 72, 66, 62, 59],
      aqi_avg: 94,
      aqi_peak: 154,
      aqi_category: 'Moderate',
      humidity_avg_pct: 18.0,
      humidity_peak_pct: 31.0,
      health_warning: true,
    },
  },
};

export function getLandCoverData(): Record<string, { name: string; land_cover: FortyGuardZoneIntelligence['land_cover'] }> {
  const result: Record<string, { name: string; land_cover: FortyGuardZoneIntelligence['land_cover'] }> = {};
  for (const [id, data] of Object.entries(FORTYGUARD_ZONE_DATA)) {
    result[id] = {
      name: data.name,
      land_cover: data.land_cover,
    };
  }
  return result;
}

export function getAirQualityData(): Record<string, { name: string; air_quality: FortyGuardZoneIntelligence['air_quality'] }> {
  const result: Record<string, { name: string; air_quality: FortyGuardZoneIntelligence['air_quality'] }> = {};
  for (const [id, data] of Object.entries(FORTYGUARD_ZONE_DATA)) {
    result[id] = {
      name: data.name,
      air_quality: data.air_quality,
    };
  }
  return result;
}

export function getPersistenceData(): Record<string, {
  name: string;
  exceedance_hours: number;
  persistence_hours: number;
  persistence_max_hours: number;
  peak_hour_utc: number;
  peak_hour_local: number;
}> {
  const result: Record<string, any> = {};
  for (const [id, data] of Object.entries(FORTYGUARD_ZONE_DATA)) {
    result[id] = {
      name: data.name,
      exceedance_hours: data.exceedance_hours_f105,
      persistence_hours: data.persistence_hours,
      persistence_max_hours: data.persistence_max_hours,
      peak_hour_utc: data.peak_hour_utc,
      peak_hour_local: data.peak_hour_local,
    };
  }
  return result;
}
