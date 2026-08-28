import React, { useState } from 'react';
import {
  Send,
  AlertTriangle,
  Flame,
  Clock,
  Filter,
  CheckCircle2,
  PhoneCall,
  Radio,
  Globe,
} from 'lucide-react';
import { HeatAlert, HazardLevel } from '../types/heatsentry';

interface LiveAlertsFeedProps {
  alerts: HeatAlert[];
}

export const LiveAlertsFeed: React.FC<LiveAlertsFeedProps> = ({ alerts }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [feedLang, setFeedLang] = useState<'EN' | 'ES' | 'HI'>('EN');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const getSeverityBadge = (sev: HazardLevel) => {
    switch (sev) {
      case 'EXTREME':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-500/60 animate-pulse">
            EXTREME
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/60">
            HIGH
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/60">
            MODERATE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-500/60">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Targeted Dispatch & Alerts Stream
              <span className="px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 text-[10px] font-mono">
                {alerts.length} Dispatched
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Direct Broadcast to Workers, Transit & Trauma Centers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Trilingual Language Selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setFeedLang('HI')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                feedLang === 'HI' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="हिंदी (Hindi)"
            >
              🇮🇳 HI
            </button>
            <button
              onClick={() => setFeedLang('EN')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                feedLang === 'EN' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => setFeedLang('ES')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                feedLang === 'ES' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇲🇽 ES
            </button>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3 text-slate-400" />
            {(['ALL', 'EXTREME', 'HIGH'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  severityFilter === lvl
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[460px] custom-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-lg border border-slate-800/60">
            No active emergency alerts matching filter.
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const uniqueKey = alert.id || `alert-${idx}-${alert.target_zone || 'zone'}-${alert.timestamp || idx}-${alert.title || ''}`;
            const displayTitle =
              feedLang === 'HI' ? alert.title_hi || alert.title : feedLang === 'ES' ? alert.title_es || alert.title : alert.title;
            const displayMessage =
              feedLang === 'HI' ? alert.message_hi || alert.message : feedLang === 'ES' ? alert.message_es || alert.message : alert.message;
            const displayAction =
              feedLang === 'HI'
                ? alert.action_required_hi || alert.action_required
                : feedLang === 'ES'
                ? alert.action_required_es || alert.action_required
                : alert.action_required;

            return (
              <div
                key={uniqueKey}
                className="p-3 rounded-lg bg-slate-950/95 border border-rose-900/40 hover:border-rose-700/60 transition-all text-xs space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="font-bold text-slate-100">{displayTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-400">{alert.target_channel}</span>
                        <span>•</span>
                        <span>Target: {alert.target_zone}</span>
                        <span>•</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/80 p-2 rounded border border-slate-800">
                  {displayMessage}
                </p>

                <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>
                    {feedLang === 'HI' ? 'अनिवार्य कार्रवाई:' : feedLang === 'ES' ? 'Acción Requerida:' : 'Action:'}{' '}
                    {displayAction}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
