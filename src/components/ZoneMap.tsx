import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Tent,
  Truck,
  Users,
  Trees,
  AlertTriangle,
  ChevronRight,
  Info,
  Maximize2,
  Navigation,
  Compass,
  Layers,
  Thermometer,
  ShieldCheck,
  Eye,
  Radio,
} from 'lucide-react';
import { ZoneState, HazardLevel } from '../types/heatsentry';
import { PHOENIX_ZONES_LIST } from '../lib/zonesData';

interface ZoneMapProps {
  zones: Record<string, ZoneState>;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export const ZoneMap: React.FC<ZoneMapProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<
    'HEAT_INDEX' | 'FORTYGUARD_2M' | 'CANOPY_NDVI' | 'WBGT' | 'WORKER_DENSITY' | 'ASSET_ROUTES'
  >('FORTYGUARD_2M');
  const [showDispatchVectors, setShowDispatchVectors] = useState<boolean>(true);
  const [showThermalContours, setShowThermalContours] = useState<boolean>(true);

  const getZoneColor = (zone: ZoneState, zoneMeta: (typeof PHOENIX_ZONES_LIST)[0]) => {
    if (mapLayer === 'FORTYGUARD_2M') {
      const temp = zone.current_telemetry.ambient_temperature_f;
      if (temp >= 115) return { fill: '#7f1d1d', border: '#fca5a5', glow: 'rgba(185, 28, 28, 0.6)' };
      if (temp >= 110) return { fill: '#b91c1c', border: '#f87171', glow: 'rgba(220, 38, 38, 0.5)' };
      if (temp >= 105) return { fill: '#c2410c', border: '#fb923c', glow: 'rgba(234, 88, 12, 0.4)' };
      if (temp >= 98) return { fill: '#d97706', border: '#fde68a', glow: 'rgba(217, 119, 6, 0.35)' };
      return { fill: '#047857', border: '#6ee7b7', glow: 'rgba(5, 150, 105, 0.3)' };
    }

    if (mapLayer === 'CANOPY_NDVI') {
      const canopy = zone.metadata.tree_canopy_pct;
      // Low canopy = severe danger red, high canopy = deep green oasis
      if (canopy < 5.0) return { fill: '#991b1b', border: '#fca5a5', glow: 'rgba(153, 27, 27, 0.5)' }; // Extreme canopy deficit (Maryvale)
      if (canopy < 8.0) return { fill: '#ea580c', border: '#fdba74', glow: 'rgba(234, 88, 12, 0.4)' };
      if (canopy < 12.0) return { fill: '#ca8a04', border: '#fef08a', glow: 'rgba(202, 138, 4, 0.35)' };
      return { fill: '#15803d', border: '#86efac', glow: 'rgba(22, 128, 61, 0.4)' }; // Oasis (Camelback)
    }

    if (mapLayer === 'WBGT') {
      const wbgt = zone.risk.wbgt;
      if (wbgt >= 90) return { fill: '#581c87', border: '#d8b4fe', glow: 'rgba(88, 28, 135, 0.5)' };
      if (wbgt >= 86) return { fill: '#be123c', border: '#fecdd3', glow: 'rgba(190, 18, 60, 0.45)' };
      if (wbgt >= 80) return { fill: '#d97706', border: '#fef3c7', glow: 'rgba(217, 119, 6, 0.35)' };
      return { fill: '#0f766e', border: '#99f6e4', glow: 'rgba(15, 118, 110, 0.3)' };
    }

    if (mapLayer === 'WORKER_DENSITY') {
      const w = zone.metadata.outdoor_workers;
      if (w >= 5500) return { fill: '#831843', border: '#fbcfe8', glow: 'rgba(131, 24, 67, 0.5)' };
      if (w >= 4000) return { fill: '#c2410c', border: '#fed7aa', glow: 'rgba(194, 65, 12, 0.4)' };
      if (w >= 3000) return { fill: '#b45309', border: '#fde68a', glow: 'rgba(180, 83, 9, 0.35)' };
      return { fill: '#065f46', border: '#a7f3d0', glow: 'rgba(6, 95, 70, 0.3)' };
    }

    if (mapLayer === 'ASSET_ROUTES') {
      const deployed = zone.deployed_resources;
      const total = deployed.misting_trailers + deployed.mobile_shelters + deployed.hydration_vans;
      if (total >= 4) return { fill: '#1e3a8a', border: '#93c5fd', glow: 'rgba(30, 58, 138, 0.6)' };
      if (total >= 1) return { fill: '#1e293b', border: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)' };
      return { fill: '#0f172a', border: '#334155', glow: 'none' };
    }

    // Default: HEAT_INDEX
    const hi = zone.risk.heat_index;
    if (hi >= 115) return { fill: '#881337', border: '#fecdd3', glow: 'rgba(136, 19, 55, 0.5)' };
    if (hi >= 105) return { fill: '#dc2626', border: '#fca5a5', glow: 'rgba(220, 38, 38, 0.4)' };
    if (hi >= 95) return { fill: '#f97316', border: '#fed7aa', glow: 'rgba(249, 115, 22, 0.3)' };
    if (hi >= 85) return { fill: '#eab308', border: '#fef08a', glow: 'rgba(234, 179, 8, 0.25)' };
    return { fill: '#10b981', border: '#6ee7b7', glow: 'rgba(16, 185, 129, 0.2)' };
  };

  const getHazardBadge = (level: HazardLevel) => {
    switch (level) {
      case 'EXTREME':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-500 animate-pulse">
            EXTREME
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500">
            HIGH
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500">
            MODERATE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500">
            LOW
          </span>
        );
    }
  };

  const activeZoneHover = hoveredZoneId ? zones[hoveredZoneId] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Map Control Header */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Phoenix Hyperlocal 2m Microclimate Heat Island GIS Map
            </h2>
            <p className="text-[11px] text-slate-400">
              Calibrated with FortyGuard Pedestrian Physics & Autonomous Fleet Dispatch Vectors
            </p>
          </div>
        </div>

        {/* Toggle Overlays */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDispatchVectors(!showDispatchVectors)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
              showDispatchVectors
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle animated GPS trajectories for dispatched cooling fleet"
          >
            <Navigation className="w-3 h-3 text-cyan-400" />
            Dispatch Vectors
          </button>

          <button
            onClick={() => setShowThermalContours(!showThermalContours)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
              showThermalContours
                ? 'bg-rose-950 text-rose-300 border-rose-500/50 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle FortyGuard 2m thermal hotspot isotherms"
          >
            <Radio className="w-3 h-3 text-rose-400" />
            Thermal Isotherms
          </button>
        </div>

        {/* Layer Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] overflow-x-auto">
          <span className="text-slate-400 px-2 font-medium">Layer:</span>
          {(
            [
              { id: 'FORTYGUARD_2M', label: 'FortyGuard 2m Temp', icon: Thermometer },
              { id: 'CANOPY_NDVI', label: 'Canopy Deficit (%)', icon: Trees },
              { id: 'WBGT', label: 'WBGT Work Safety', icon: AlertTriangle },
              { id: 'WORKER_DENSITY', label: 'Exposed Workers', icon: Users },
              { id: 'ASSET_ROUTES', label: 'Fleet Deployments', icon: Truck },
            ] as const
          ).map((l) => (
            <button
              key={l.id}
              onClick={() => setMapLayer(l.id)}
              className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                mapLayer === l.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <l.icon className="w-3 h-3" />
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Map & Overlay */}
      <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center min-h-[400px] overflow-hidden">
        {/* Heat Contours & Grid Backdrop */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

        <svg
          viewBox="0 0 740 680"
          className="w-full h-full max-h-[520px] drop-shadow-2xl select-none"
        >
          <defs>
            <radialGradient id="maryvaleHotspot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#ea580c" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="alhambraHotspot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="camelbackCoolOasis" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <marker
              id="arrowhead-cyan"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
            </marker>
            <marker
              id="arrowhead-amber"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
          </defs>

          {/* City Boundary Base Outline */}
          <rect
            x="80"
            y="20"
            width="600"
            height="630"
            rx="24"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* FortyGuard Thermal Hotspot Radial Isotherms */}
          {showThermalContours && (
            <g className="pointer-events-none transition-opacity duration-500 opacity-80">
              {/* Maryvale Severe UHI Hotspot */}
              <circle cx="210" cy="300" r="130" fill="url(#maryvaleHotspot)" />
              {/* Alhambra Industrial Hotspot */}
              <circle cx="340" cy="240" r="110" fill="url(#alhambraHotspot)" />
              {/* Camelback Green Canopy Oasis */}
              <circle cx="530" cy="230" r="90" fill="url(#camelbackCoolOasis)" />
              {/* South Mountain Hotspot */}
              <circle cx="390" cy="550" r="95" fill="url(#maryvaleHotspot)" opacity="0.6" />
            </g>
          )}

          {/* Highway & Corridor Arterials */}
          <path d="M 100 340 L 680 340" stroke="#334155" strokeWidth="3" opacity="0.6" />
          <path d="M 400 30 L 400 640" stroke="#334155" strokeWidth="3" opacity="0.6" />
          <path d="M 120 180 L 660 520" stroke="#1e293b" strokeWidth="2" opacity="0.5" />
          <text x="640" y="335" fill="#475569" fontSize="10" fontWeight="bold">
            I-10 E
          </text>
          <text x="110" y="335" fill="#475569" fontSize="10" fontWeight="bold">
            I-10 W
          </text>
          <text x="405" y="45" fill="#475569" fontSize="10" fontWeight="bold">
            I-17 N
          </text>

          {/* Zones Polygons */}
          {PHOENIX_ZONES_LIST.map((zoneMeta) => {
            const zState = zones[zoneMeta.id];
            if (!zState) return null;
            const color = getZoneColor(zState, zoneMeta);
            const isSelected = selectedZoneId === zoneMeta.id;
            const isHovered = hoveredZoneId === zoneMeta.id;
            const deployed = zState.deployed_resources;
            const totalAssets =
              deployed.misting_trailers + deployed.mobile_shelters + deployed.hydration_vans;

            return (
              <g
                key={zoneMeta.id}
                onClick={() => onSelectZone(zoneMeta.id)}
                onMouseEnter={() => setHoveredZoneId(zoneMeta.id)}
                onMouseLeave={() => setHoveredZoneId(null)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* Zone Polygon */}
                <path
                  d={zoneMeta.svgPath}
                  fill={color.fill}
                  fillOpacity={isSelected ? 0.88 : isHovered ? 0.78 : 0.6}
                  stroke={isSelected ? '#ffffff' : isHovered ? '#fbbf24' : color.border}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                  filter={isSelected || isHovered ? 'url(#glow)' : undefined}
                />

                {/* Center Badge & Text */}
                <g transform={`translate(${zoneMeta.mapCoords.x}, ${zoneMeta.mapCoords.y})`}>
                  {/* Backdrop Pill */}
                  <rect
                    x="-68"
                    y="-30"
                    width="136"
                    height="60"
                    rx="10"
                    fill="#020617"
                    fillOpacity="0.92"
                    stroke={isSelected ? '#f59e0b' : '#334155'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* Zone Name */}
                  <text
                    x="0"
                    y="-13"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {zoneMeta.name.length > 16 ? zoneMeta.name.slice(0, 14) + '…' : zoneMeta.name}
                  </text>

                  {/* Dynamic Layer Metric Value */}
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill={
                      mapLayer === 'CANOPY_NDVI'
                        ? zState.metadata.tree_canopy_pct < 6.0
                          ? '#f43f5e'
                          : '#34d399'
                        : zState.risk.hazard_level === 'EXTREME'
                        ? '#f43f5e'
                        : zState.risk.hazard_level === 'HIGH'
                        ? '#fb923c'
                        : '#34d399'
                    }
                    fontSize="13"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    {mapLayer === 'FORTYGUARD_2M' &&
                      `${zState.current_telemetry.ambient_temperature_f}°F (2m)`}
                    {mapLayer === 'CANOPY_NDVI' &&
                      `🌳 ${zState.metadata.tree_canopy_pct}% Canopy`}
                    {mapLayer === 'WBGT' && `${zState.risk.wbgt}°F WBGT`}
                    {mapLayer === 'WORKER_DENSITY' &&
                      `${zState.metadata.outdoor_workers.toLocaleString()} Wkrs`}
                    {mapLayer === 'ASSET_ROUTES' &&
                      `${totalAssets} Units Active`}
                    {mapLayer === 'HEAT_INDEX' && `${zState.risk.heat_index}°F HI`}
                  </text>

                  {/* Secondary Line: Assets / Temp */}
                  <text
                    x="0"
                    y="20"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {totalAssets > 0 ? (
                      `🛡️ ${totalAssets} Assets Assigned`
                    ) : (
                      `40G Amb: ${zState.current_telemetry.ambient_temperature_f}°F`
                    )}
                  </text>
                </g>

                {/* Asset deployment badge */}
                {totalAssets > 0 && (
                  <g transform={`translate(${zoneMeta.mapCoords.x + 50}, ${zoneMeta.mapCoords.y - 34})`}>
                    <circle r="11" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
                    <text x="0" y="3.5" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">
                      {totalAssets}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Animated Autonomous GPS Dispatch Vectors & Trajectories */}
          {showDispatchVectors && (
            <g className="pointer-events-none">
              {/* Central Staging Hub (Downtown PHX-01) */}
              <circle cx="380" cy="380" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <text x="380" y="384" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
                HQ
              </text>

              {/* Dynamic Dispatch Vectors based on actual zone deployments */}
              {PHOENIX_ZONES_LIST.filter(
                (z) =>
                  z.id !== 'PHX-01' &&
                  zones[z.id] &&
                  (zones[z.id].deployed_resources.misting_trailers > 0 ||
                    zones[z.id].deployed_resources.mobile_shelters > 0 ||
                    zones[z.id].deployed_resources.hydration_vans > 0 ||
                    zones[z.id].risk.hazard_level === 'EXTREME' ||
                    zones[z.id].risk.hazard_level === 'HIGH')
              ).map((z) => {
                const isSelected = selectedZoneId === z.id;
                const totalAssets =
                  zones[z.id].deployed_resources.misting_trailers +
                  zones[z.id].deployed_resources.mobile_shelters +
                  zones[z.id].deployed_resources.hydration_vans;

                // Midpoint bezier curve calculation
                const midX = (380 + z.mapCoords.x) / 2 + (z.mapCoords.x < 380 ? -25 : 25);
                const midY = (380 + z.mapCoords.y) / 2 - 20;
                const color = totalAssets > 0 ? '#38bdf8' : '#f59e0b';
                const dur = isSelected ? '1.8s' : '2.8s';

                return (
                  <g key={`vector-${z.id}`}>
                    <path
                      d={`M 380 380 Q ${midX} ${midY} ${z.mapCoords.x} ${z.mapCoords.y}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={isSelected ? '3' : '2'}
                      strokeDasharray={totalAssets > 0 ? '6 4' : '3 3'}
                      markerEnd={totalAssets > 0 ? 'url(#arrowhead-cyan)' : 'url(#arrowhead-amber)'}
                      opacity={isSelected ? 1 : 0.75}
                      className={isSelected ? 'animate-pulse' : ''}
                    />
                    <circle cx={midX} cy={midY} r={isSelected ? '5.5' : '4'} fill={color}>
                      <animate
                        attributeName="cx"
                        values={`380;${midX};${z.mapCoords.x}`}
                        dur={dur}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        values={`380;${midY};${z.mapCoords.y}`}
                        dur={dur}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating Hover Inspector Drawer */}
        {activeZoneHover && (
          <div className="absolute top-4 right-4 bg-slate-950/95 border border-amber-500/40 rounded-xl p-3.5 shadow-2xl text-xs w-72 backdrop-blur-md animate-fade-in pointer-events-none">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">{activeZoneHover.metadata.name}</span>
              {getHazardBadge(activeZoneHover.risk.hazard_level)}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">FortyGuard 2m Ambient</div>
                <div className="text-sm font-mono font-black text-rose-400">
                  {activeZoneHover.current_telemetry.ambient_temperature_f}°F
                </div>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">WBGT Stull Eq.</div>
                <div className="text-sm font-mono font-black text-amber-400">
                  {activeZoneHover.risk.wbgt}°F
                </div>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Outdoor Workers</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {activeZoneHover.metadata.outdoor_workers.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Tree Canopy Deficit</div>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  {activeZoneHover.metadata.tree_canopy_pct}%
                </div>
              </div>
            </div>

            <div className="mt-2.5 bg-slate-900/90 p-2 rounded border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-amber-400 block mb-0.5">OSHA Recommendation:</strong>
              {activeZoneHover.risk.osha_work_rest_cycle}
            </div>
          </div>
        )}
      </div>

      {/* Footer GIS Key & Physics Grounding Citation */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-300 font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            FortyGuard tOS Physics:
          </span>
          <span>Pedestrian 2m Thermal Mesh</span>
          <span>•</span>
          <span>Rothfusz Polynomial HI</span>
          <span>•</span>
          <span>Title VI Canopy Disparity</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Optimal (&lt;100°F)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>Caution (100-108°F)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-600" />
            <span>Severe (109-115°F)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-600" />
            <span>Extreme (&gt;115°F)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
