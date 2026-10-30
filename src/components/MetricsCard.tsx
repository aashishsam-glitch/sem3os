import React from 'react';
import { Activity, Gauge, CheckCircle2, TrendingUp } from 'lucide-react';
import type { AlgorithmResult } from '../types/disk';

interface MetricsCardProps {
  result: AlgorithmResult;
  currentStep: number;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ result, currentStep }) => {
  const currentStepData = currentStep > 0 ? result.steps[currentStep - 1] : null;

  // Running totals up to currentStep
  const runningSeek = currentStepData ? currentStepData.totalSeekSoFar : 0;
  const requestsServicedSoFar = Math.min(
    currentStep,
    result.servicedSequence.length
  );
  const totalRequests = result.servicedSequence.length;
  const progressPercent =
    result.steps.length > 0 ? Math.round((currentStep / result.steps.length) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Head Movement */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Total Head Movement</span>
          <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {runningSeek}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ {result.totalHeadMovement} cyl</span>
        </div>
        <div className="mt-2 text-[11px] text-cyan-400 font-medium">
          Cylinders traversed
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Average Movement Per Request */}
      <div className="glass-panel p-4 rounded-2xl border border-violet-500/20 relative overflow-hidden group hover:border-violet-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Avg Seek / Request</span>
          <Gauge className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {result.averageMovement}
          </span>
          <span className="text-xs text-slate-400 font-mono">cyl/req</span>
        </div>
        <div className="mt-2 text-[11px] text-violet-400 font-medium">
          Mean seek latency
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Requests Completed */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Requests Completed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {requestsServicedSoFar}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ {totalRequests}</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-400 font-medium">
          {progressPercent}% queue satisfied
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Max Seek Distance */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Max Single Hop</span>
          <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {result.maxSeekDistance}
          </span>
          <span className="text-xs text-slate-400 font-mono">cylinders</span>
        </div>
        <div className="mt-2 text-[11px] text-amber-400 font-medium">
          Worst-case arm jump
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
