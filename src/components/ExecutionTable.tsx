import React, { useState } from 'react';
import type { ExecutionStep } from '../types/disk';
import { ArrowRight, Copy, Check, Table, Download } from 'lucide-react';

interface ExecutionTableProps {
  steps: ExecutionStep[];
  currentStep: number;
  initialHead: number;
  onSelectStep: (stepNumber: number) => void;
  algorithmName: string;
}

export const ExecutionTable: React.FC<ExecutionTableProps> = ({
  steps,
  currentStep,
  initialHead,
  onSelectStep,
  algorithmName,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const header = `Step\tFrom\tTo\tSeek (cyl)\tTotal Seek\tType\tRemaining Queue\n`;
    const rows = steps
      .map(
        (s) =>
          `${s.stepIndex}\t${s.fromTrack}\t${s.toTrack}\t${s.seekDistance}\t${s.totalSeekSoFar}\t${
            s.isBoundary ? 'Boundary' : 'Serviced'
          }\t[${s.remainingQueue.join(', ')}]`
      )
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    const header = `Step,From,To,Seek Distance,Total Seek,Type,Remaining Queue\n`;
    const rows = steps
      .map(
        (s) =>
          `${s.stepIndex},${s.fromTrack},${s.toTrack},${s.seekDistance},${s.totalSeekSoFar},${
            s.isBoundary ? 'Boundary' : 'Serviced'
          },"${s.remainingQueue.join(' ')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${algorithmName.toLowerCase()}-execution-log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-slate-100">
            Step-by-Step Execution Schedule
          </h4>
          <span className="text-xs text-slate-400">({steps.length} total steps)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy TSV</span>
              </>
            )}
          </button>
          <button
            onClick={downloadCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Seek Sequence Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="text-cyan-400 font-bold shrink-0">Seek Sequence:</span>
          <span className="text-slate-200 select-all font-semibold">
            {[initialHead, ...steps.map((s) => s.toTrack)].join(' → ')}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0 font-sans">
          Total: <strong className="text-cyan-300 font-mono">{steps[steps.length - 1]?.totalSeekSoFar ?? 0}</strong> cyl
        </span>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-[#0c1424] text-slate-400 border-b border-white/10 z-10">
            <tr>
              <th className="py-2.5 px-3">Step</th>
              <th className="py-2.5 px-3">Previous Head</th>
              <th className="py-2.5 px-3">Next Head</th>
              <th className="py-2.5 px-3">Seek Distance</th>
              <th className="py-2.5 px-3">Accumulated</th>
              <th className="py-2.5 px-3">Direction / Type</th>
              <th className="py-2.5 px-3">Pending Queue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {/* Initial row 0 */}
            <tr
              onClick={() => onSelectStep(0)}
              className={`cursor-pointer transition-colors ${
                currentStep === 0 ? 'bg-cyan-500/15 font-semibold text-cyan-300' : 'hover:bg-white/5'
              }`}
            >
              <td className="py-2.5 px-3 text-slate-400">0</td>
              <td className="py-2.5 px-3 text-slate-500">—</td>
              <td className="py-2.5 px-3 font-bold text-cyan-400">{initialHead}</td>
              <td className="py-2.5 px-3 text-slate-500">0 cyl</td>
              <td className="py-2.5 px-3 text-slate-500">0 cyl</td>
              <td className="py-2.5 px-3">
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                  Initial Start
                </span>
              </td>
              <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                {steps[0]?.remainingQueue ? `[${steps[0].remainingQueue.join(', ')}]` : '—'}
              </td>
            </tr>

            {steps.map((s) => {
              const isActive = currentStep === s.stepIndex;
              const isPast = currentStep > s.stepIndex;

              return (
                <tr
                  key={s.stepIndex}
                  onClick={() => onSelectStep(s.stepIndex)}
                  className={`cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 font-bold border-l-4 border-l-cyan-400'
                      : isPast
                      ? 'bg-white/[0.02] text-slate-300 hover:bg-white/5'
                      : 'text-slate-500 hover:bg-white/5'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      #{s.stepIndex}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{s.fromTrack}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-100">{s.toTrack}</td>
                  <td className="py-2.5 px-3 text-amber-300 font-medium">{s.seekDistance} cyl</td>
                  <td className="py-2.5 px-3 text-violet-300">{s.totalSeekSoFar} cyl</td>
                  <td className="py-2.5 px-3">
                    {s.isJump ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        Circular Jump
                      </span>
                    ) : s.isBoundary ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Boundary
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                        {s.direction && (
                          <ArrowRight
                            className={`w-2.5 h-2.5 ${
                              s.direction === 'left' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                        Serviced
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                    {s.remainingQueue.length > 0 ? (
                      <span className="text-slate-400">
                        [{s.remainingQueue.join(', ')}]
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Queue Empty (Done)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
