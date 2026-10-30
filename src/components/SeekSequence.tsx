import React, { useState } from 'react';
import type { ExecutionStep } from '../types/disk';
import { Route, Copy, Check, Sparkles, ArrowRight, CornerDownRight } from 'lucide-react';

export interface SeekSequenceProps {
  headSequence: number[];
  currentStep: number;
  steps: ExecutionStep[];
  totalHeadMovement: number;
  algorithmName: string;
  onSelectStep?: (stepIndex: number) => void;
}

export const SeekSequence: React.FC<SeekSequenceProps> = ({
  headSequence,
  currentStep,
  steps,
  totalHeadMovement,
  algorithmName,
  onSelectStep,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedSequence = headSequence.join(' → ');

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4 shadow-glass">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {algorithmName} Seek Sequence
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                HEAD TRAJECTORY PATH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Complete chronological cylinder service order from initial position to final track.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Step <strong className="text-cyan-300">{currentStep}</strong> / {steps.length}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Copy seek sequence to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Sequence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Interactive Interactive Visual Node Chain */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 min-h-[58px]">
        {headSequence.map((track, idx) => {
          const isActive = currentStep === idx;
          const isVisited = currentStep > idx;
          const isInitial = idx === 0;
          const stepData = idx > 0 ? steps[idx - 1] : null;
          const isBoundary = stepData?.isBoundary ?? false;
          const isJump = stepData?.isJump ?? false;

          return (
            <React.Fragment key={idx}>
              {/* Node Button */}
              <button
                type="button"
                onClick={() => onSelectStep?.(idx)}
                title={
                  isInitial
                    ? `Initial Head Position: Track ${track}`
                    : `Step ${idx}: Track ${track} (${stepData?.seekDistance ?? 0} cyl seek)`
                }
                className={`group relative px-2.5 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-glow-cyan ring-2 ring-cyan-300 scale-105 z-10'
                    : isVisited
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {isInitial ? (
                  <span
                    className={`text-[9px] font-sans font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                      isActive ? 'bg-slate-950/30 text-slate-950' : 'text-cyan-400'
                    }`}
                  >
                    Start
                  </span>
                ) : (
                  <span
                    className={`text-[9px] font-sans opacity-70 ${
                      isActive ? 'text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    #{idx}
                  </span>
                )}

                <span className="font-bold">{track}</span>

                {isBoundary && (
                  <span
                    className={`text-[9px] font-sans font-bold px-1 rounded ${
                      isActive
                        ? 'bg-rose-950/40 text-slate-950'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    Boundary
                  </span>
                )}

                {isJump && (
                  <span
                    className={`text-[9px] font-sans font-bold px-1 rounded flex items-center gap-0.5 ${
                      isActive
                        ? 'bg-amber-950/40 text-slate-950'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    Jump
                  </span>
                )}

                {/* Real-time active indicator pulse */}
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300" />
                  </span>
                )}
              </button>

              {/* Connecting Arrow */}
              {idx < headSequence.length - 1 && (
                <span className="text-slate-600 px-0.5 select-none font-bold text-xs flex items-center">
                  {steps[idx]?.isJump ? (
                    <span className="text-amber-400 font-bold text-sm px-0.5" title="Circular reset jump">
                      ↷
                    </span>
                  ) : (
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  )}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Textbook Clean Output String */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5">
          <span className="text-cyan-400 font-bold shrink-0 flex items-center gap-1">
            <CornerDownRight className="w-3.5 h-3.5" />
            Seek Sequence:
          </span>
          <span className="text-slate-200 select-all font-semibold tracking-wide">
            {formattedSequence}
          </span>
        </div>
        <div className="text-slate-400 text-[11px] shrink-0 font-sans">
          Total: <strong className="text-cyan-300 font-mono">{totalHeadMovement}</strong> cylinders seek
        </div>
      </div>
    </div>
  );
};
