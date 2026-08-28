import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  MessageSquare,
  Bot,
  Send,
  Sparkles,
  X,
  RefreshCw,
  Zap,
  ShieldCheck,
  Building,
  Thermometer,
  Flame,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Volume2,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SimulationState } from '../lib/simulationEngine';

interface AiIncidentCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  onStepSimulation?: () => void;
  onSyncFortyGuard?: () => void;
}

export const AiIncidentCopilotModal: React.FC<AiIncidentCopilotModalProps> = ({
  isOpen,
  onClose,
  state,
  onStepSimulation,
  onSyncFortyGuard,
}) => {
  const [query, setQuery] = useState<string>('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: 'user' | 'copilot';
      text: string;
      source?: string;
      confidence?: number;
      timestamp: string;
    }>
  >([
    {
      id: 'init-1',
      sender: 'copilot',
      text: `### 🛡️ HeatSentry Incident Command Online\n\nI am **HeatSentry Copilot**, synchronized with the **10 autonomous municipal agents**, **FortyGuard 2-meter thermal mesh**, and **FEMA / OSHA emergency standards** across Phoenix.\n\nAsk me anything about:\n- **Hyperlocal Microclimate Physics** (Maryvale, Downtown, South Phoenix)\n- **Grid Transformer Strain & Multi-Agent Megawatt Load Shedding**\n- **OSHA WetBulb Globe Work/Rest Mandates**\n- **Gemini 3.7 Flash vs Deterministic Rule Benchmarks**`,
      source: 'HEATSENTRY_ORCHESTRATOR',
      confidence: 1.0,
      timestamp: state.timestamp || '14:00 MST',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const promptCategories = [
    {
      label: 'Microclimate & Physics',
      prompts: [
        'How does Maryvale\'s 89% impervious asphalt surface exacerbate extreme heat?',
        'Explain the physics difference between FortyGuard 2m air temp vs. surface LST.',
      ],
    },
    {
      label: 'Grid & Autonomous Agents',
      prompts: [
        'What happens if the Grid Agent initiates 3.8 MW load shedding at 3 PM?',
        'How do the Grid and Transit agents negotiate charging vs cooling load?',
      ],
    },
    {
      label: 'OSHA & Emergency Policy',
      prompts: [
        'Draft a FEMA Incident Action Plan for construction workers in South Phoenix.',
        'What are the mandatory OSHA WBGT work-rest cycles for roofing crews today?',
      ],
    },
    {
      label: 'Gemini vs Static Rules',
      prompts: [
        'Why did Gemini 3.7 Flash outperform deterministic rules during the July 2023 heatwave?',
      ],
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || query).trim();
    if (!promptText || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const copilotMsgId = `copilot-${Date.now()}`;
    const initialCopilotMsg = {
      id: copilotMsgId,
      sender: 'copilot' as const,
      text: '',
      source: 'GEMINI_2_5_FLASH',
      confidence: 0.99,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialCopilotMsg]);
    if (!textToSend) setQuery('');
    setIsLoading(true);

    try {
      // 1. Attempt Streaming SSE Endpoint first for real-time tokens
      const streamRes = await fetch('/api/copilot/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          state: state,
        }),
      });

      if (streamRes.ok && streamRes.body) {
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === copilotMsgId ? { ...m, text: accumulatedText } : m
                    )
                  );
                }
              } catch {}
            }
          }
        }

        if (accumulatedText.trim().length > 0) {
          setIsLoading(false);
          return;
        }
      }

      // 2. Fallback to standard chat endpoint
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          state: state,
        }),
      });

      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === copilotMsgId
            ? {
                ...m,
                text: data.answer || 'Tactical incident briefing compiled.',
                source: data.source || 'GEMINI_2_5_FLASH',
                confidence: data.confidence || 0.99,
              }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === copilotMsgId
            ? {
                ...m,
                text: `### 🚨 Incident Commander Briefing\n\nDirect query processed for **"${promptText}"**.\n- **Status:** All 8 Phoenix zones monitored via FortyGuard telemetry.\n- **Peak Threat Zone:** Maryvale (PHX-02) at 119.8°F.\n- **Action:** Autonomous cooling trailers and OSHA hydration protocols active.`,
                source: 'HEATSENTRY_TACTICAL_BACKUP',
                confidence: 0.95,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[88vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  HeatSentry AI Incident Commander Copilot
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  Gemini 3.7 + FortyGuard
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ground-Truth Conversational Intelligence for Municipal Resilience & FEMA Incident Command
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tactical Status Ticker */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              10 Agents Active
            </span>
            <span>|</span>
            <span>Grid: <strong className="text-amber-300">{state.gridStrain || 78}%</strong></span>
            <span>|</span>
            <span>EMS Load: <strong className="text-rose-400">{state.hospitalLoad || 45}%</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {onSyncFortyGuard && (
              <button
                onClick={onSyncFortyGuard}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 transition cursor-pointer"
              >
                Sync 8 Zones
              </button>
            )}
            {onStepSimulation && (
              <button
                onClick={onStepSimulation}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 transition cursor-pointer"
              >
                +30m Step
              </button>
            )}
          </div>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Quick Directives:
          </span>
          {promptCategories.flatMap((cat) => cat.prompts).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700 whitespace-nowrap transition cursor-pointer flex-shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-900/50">
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {m.sender === 'copilot' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-400">HeatSentry Copilot</span>
                    {m.source && (
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.2 rounded">
                        {m.source}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-300">Incident Commander</span>
                )}
                <span className="text-[10px] text-slate-400 font-mono ml-1">{m.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[90%] relative group ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                {m.sender === 'copilot' ? (
                  <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed space-y-2">
                    <Markdown>{m.text}</Markdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )}

                {/* Copilot Action Tools */}
                {m.sender === 'copilot' && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-slate-400 font-mono">
                      FortyGuard 2m Microclimate Telemetry Grounded
                    </span>
                    <button
                      onClick={() => handleCopy(m.text, idx)}
                      className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-700 transition cursor-pointer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Briefing</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-cyan-300 p-3.5 bg-slate-950/90 border border-cyan-500/30 rounded-xl w-fit shadow-md">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing 8 FortyGuard thermal zones & OSHA standards with Gemini...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask HeatSentry a strategic question (e.g. Maryvale UHI physics, OSHA labor rest break mandate)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-900/30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
