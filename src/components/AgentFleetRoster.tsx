import React from 'react';
import {
  Bot,
  Activity,
  Cpu,
  Radio,
  Send,
  Building2,
  Briefcase,
  Bus,
  Zap,
  Hospital,
  CheckCircle2,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { AgentStatus } from '../types/heatsentry';

interface AgentFleetRosterProps {
  agentStatuses: Record<string, AgentStatus>;
  plannerType: string;
}

export const AgentFleetRoster: React.FC<AgentFleetRosterProps> = ({
  agentStatuses,
  plannerType,
}) => {
  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'LeadOrchestrator':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'ZoneMonitor':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'HeatForecaster':
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'ResourcePlanner':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'AlertDispatcher':
        return <Send className="w-4 h-4 text-rose-400" />;
      case 'CoolingCenters':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'EmployersAgent':
        return <Briefcase className="w-4 h-4 text-orange-400" />;
      case 'TransitAgent':
        return <Bus className="w-4 h-4 text-indigo-400" />;
      case 'GridAgent':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'HospitalAgent':
        return <Hospital className="w-4 h-4 text-red-400" />;
      default:
        return <Bot className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: AgentStatus['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'DISPATCHING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            DISPATCHING
          </span>
        );
      case 'ALERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            ALERT
          </span>
        );
      case 'REASONING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            REASONING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            READY
          </span>
        );
    }
  };

  const agentsList: AgentStatus[] = Object.values(agentStatuses);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Autonomous Agent Fleet Roster
              <span className="px-2 py-0.2 bg-slate-800 text-slate-300 text-[10px] rounded font-mono">
                10 Agents
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Coordinated Multi-Agent Taskmaster System</p>
          </div>
        </div>
      </div>

      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 overflow-y-auto max-h-[440px] custom-scrollbar">
        {agentsList.map((agent) => (
          <div
            key={agent.name}
            className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-900 border border-slate-800">
                  {getAgentIcon(agent.name)}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    {agent.name}
                    {agent.name === 'ResourcePlanner' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                        {plannerType === 'GEMINI_3_5_FLASH' ? 'Gemini 3.5' : 'Deterministic'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">{agent.role}</div>
                </div>
              </div>
              {getStatusBadge(agent.status)}
            </div>

            <div className="mt-2 text-xs space-y-1">
              <div className="flex items-center gap-1 text-[11px] text-slate-300 font-medium">
                <span className="text-slate-500 font-normal">Last Action:</span>
                <span className="font-mono text-cyan-300">{agent.last_action}</span>
              </div>
              <div className="text-[11px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded border border-slate-800/50 leading-snug">
                "{agent.last_reasoning}"
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
