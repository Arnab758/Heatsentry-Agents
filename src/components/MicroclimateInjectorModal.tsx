import React, { useState } from 'react';
import {
  Zap,
  X,
  Flame,
  AlertOctagon,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { PHOENIX_ZONES_LIST } from '../lib/zonesData';

interface MicroclimateInjectorModalProps {
  onClose: () => void;
  onInject: (zoneId: string, deltaF: number, deltaWorkers?: number) => void;
}

export const MicroclimateInjectorModal: React.FC<MicroclimateInjectorModalProps> = ({
  onClose,
  onInject,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>(PHOENIX_ZONES_LIST[1].id); // Maryvale default
  const [tempDelta, setTempDelta] = useState<number>(6.0);
  const [workerSurge, setWorkerSurge] = useState<number>(1200);

  const handleApply = () => {
    onInject(selectedZone, tempDelta, workerSurge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-4 bg-gradient-to-r from-amber-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Inject Thermal Anomaly</h3>
              <p className="text-[11px] text-slate-400">Stress-test autonomous agent fleet arbitration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Target Phoenix Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 font-medium focus:outline-none focus:border-amber-500"
            >
              {PHOENIX_ZONES_LIST.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.id}) - {z.outdoor_workers.toLocaleString()} Workers
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Temperature Spike Offset</span>
              <span className="text-rose-400 font-mono font-black">+{tempDelta}°F</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={tempDelta}
              onChange={(e) => setTempDelta(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Outdoor Workforce Surge</span>
              <span className="text-cyan-400 font-mono font-black">+{workerSurge} Workers</span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="200"
              value={workerSurge}
              onChange={(e) => setWorkerSurge(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Applying this anomaly will trigger an instantaneous recalculation in ZoneMonitor, forcing ResourcePlanner to reallocate scarce misting trailers and AlertDispatcher to broadcast urgent warnings.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold shadow-lg"
            >
              Inject Anomaly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
