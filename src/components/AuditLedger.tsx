import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ShieldAlert,
  Bot,
  Link2,
  Fingerprint,
} from 'lucide-react';
import { AuditEntry } from '../types/heatsentry';

interface CryptoBlock {
  index: number;
  hash: string;
  previous_hash: string;
  timestamp: string;
  agent: string;
  action: string;
  target_zone?: string | null;
  reasoning: string;
}

interface AuditLedgerProps {
  entries: AuditEntry[];
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [cryptoBlocks, setCryptoBlocks] = useState<CryptoBlock[]>([]);
  const [chainValid, setChainValid] = useState<boolean | null>(null);
  const [ledgerEngine, setLedgerEngine] = useState<'backend' | 'local'>('local');

  // Real cryptographic audit chain from the Python backend — every agent
  // action is SHA-256 chained to the previous block; tampering breaks the hash.
  React.useEffect(() => {
    (async () => {
      try {
        const [verifyResp, blocksResp] = await Promise.all([
          fetch('/api/ledger/verify'),
          fetch('/api/ledger/blocks?limit=30'),
        ]);
        if (!verifyResp.ok || !blocksResp.ok) throw new Error('backend error');
        const verify = await verifyResp.json();
        const blocks = await blocksResp.json();
        setChainValid(verify.is_valid === true);
        if (Array.isArray(blocks.blocks)) {
          setCryptoBlocks(blocks.blocks);
          setLedgerEngine('backend');
        }
      } catch {
        setLedgerEngine('local');
      }
    })();
  }, [entries.length]);

  const filteredEntries = entries.filter((e) => {
    const matchSearch =
      e.reasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.agent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAgent = agentFilter === 'ALL' || e.agent === agentFilter;
    return matchSearch && matchAgent;
  });

  const uniqueAgents = Array.from(new Set(entries.map((e) => e.agent)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header & Search */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Immutable Autonomous Audit Trail
              <span className="px-2 py-0.2 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-mono">
                {entries.length} Records
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Timestamped & Queryable Decision Provenance</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Agents</option>
            {uniqueAgents.map((ag) => (
              <option key={ag} value={ag}>
                {ag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cryptographic Chain Integrity Banner */}
      {ledgerEngine === 'backend' && (
        <div
          className={`px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
            chainValid
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/60 border-rose-800/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] font-bold">
            {chainValid ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            )}
            <span className="uppercase tracking-wider">
              {chainValid ? 'SHA-256 Chain: Cryptographically Verified' : 'SHA-256 Chain: INTEGRITY FAILURE'}
            </span>
            <span className="font-mono text-[10px] opacity-80">
              {cryptoBlocks.length} blocks · latest {cryptoBlocks[0]?.hash?.slice(0, 16) || '…'}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300/80">
            <Fingerprint className="w-3 h-3" />
            Python CryptoAuditLedger
          </span>
        </div>
      )}

      {/* Cryptographic Block Chain (real backend ledger) */}
      {cryptoBlocks.length > 1 && (
        <div className="border-b border-slate-800 bg-slate-950/60">
          <div className="px-3.5 pt-3 pb-1.5 flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Immutable Hash-Chained Blocks (every agent action anchored)
            </span>
          </div>
          <div className="px-3.5 pb-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max">
              {cryptoBlocks
                .slice()
                .reverse()
                .map((b, idx) => (
                  <React.Fragment key={b.hash ? `${b.hash}-${idx}` : `block-${idx}`}>
                    <div
                      className="bg-slate-900 border border-purple-500/30 rounded-lg px-2.5 py-1.5 shrink-0"
                      title={`${b.agent} · ${b.action} · ${b.reasoning}`}
                    >
                      <div className="text-[9px] font-mono text-purple-300 font-bold">#{b.index}</div>
                      <div className="text-[9px] font-mono text-slate-300">{b.action}</div>
                      <div className="text-[8px] font-mono text-slate-500">{b.hash.slice(0, 10)}…</div>
                    </div>
                    {idx < cryptoBlocks.length - 2 && (
                      <div className="w-3 h-px bg-purple-500/50 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="flex-1 overflow-y-auto max-h-[460px] custom-scrollbar">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-[10px] text-slate-400 uppercase font-bold sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-2.5">ID / Time</th>
              <th className="p-2.5">Responsible Agent</th>
              <th className="p-2.5">Action Executed</th>
              <th className="p-2.5">Reasoning & Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEntries.slice().reverse().map((entry, idx) => (
              <tr key={entry.id ? `${entry.id}-${idx}` : `entry-${idx}`} className="hover:bg-slate-950/60 transition-colors">
                <td className="p-2.5 text-slate-400 whitespace-nowrap text-[11px]">
                  <span className="text-amber-400 font-bold block">#{entry.id}</span>
                  <span className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </td>
                <td className="p-2.5 font-sans font-semibold text-cyan-300 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-slate-400" />
                    {entry.agent}
                  </span>
                </td>
                <td className="p-2.5 font-sans font-bold text-amber-300 whitespace-nowrap">
                  {entry.action}
                </td>
                <td className="p-2.5 font-sans text-slate-300 leading-relaxed text-[11px]">
                  {entry.reasoning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
