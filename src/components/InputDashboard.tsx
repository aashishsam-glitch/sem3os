import React from 'react';
import { useDisk, PRESETS } from '../context/DiskContext';
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  BarChart3,
  Dices,
  AlertCircle,
  ArrowRight,
  HardDrive,
  Compass,
} from 'lucide-react';
import type { SimulationSpeed } from '../types/disk';

interface InputDashboardProps {
  onStartSimulation?: () => void;
  onRunAll?: () => void;
}

export const InputDashboard: React.FC<InputDashboardProps> = ({
  onStartSimulation,
  onRunAll,
}) => {
  const {
    rawInputs,
    updateRawInput,
    errors,
    loadPreset,
    clearInputs,
    generateRandomQueue,
    validateInputs,
    navigateToSim,
  } = useDisk();

  const handleStartSimulation = () => {
    if (validateInputs()) {
      if (onStartSimulation) {
        onStartSimulation();
      } else {
        navigateToSim('fcfs');
      }
    }
  };

  const handleRunAll = () => {
    if (validateInputs()) {
      if (onRunAll) {
        onRunAll();
      } else {
        navigateToSim('compare');
      }
    }
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-glass relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Panel Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <Sliders className="w-3.5 h-3.5" />
            DISK CONTROLLER CONFIGURATION
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Configure Disk Parameters & Request Queue
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Specify initial head coordinate, cylinder ranges, and arrival track sequence.
          </p>
        </div>

        {/* Quick Presets / Generator */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset('textbook')}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Example
          </button>
          <button
            onClick={() => generateRandomQueue(8)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            title="Generate random track sequence"
          >
            <Dices className="w-3.5 h-3.5 text-purple-400" />
            Random
          </button>
          <button
            onClick={clearInputs}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Preset Chips Bar */}
      <div className="relative z-10 mb-6">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 block">
          Preset Benchmark Profiles:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id)}
              className="text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                <span>{p.name}</span>
                <span className="text-[10px] font-mono text-slate-500">H:{p.initialHead}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {p.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="relative z-10 space-y-5">
        {/* Row 1: Initial Head, Min Track, Max Track */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Initial Head Position */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Initial Head Position
              </span>
              <span className="text-[10px] font-mono text-slate-400">Integer</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={rawInputs.initialHead}
                onChange={(e) => updateRawInput('initialHead', e.target.value)}
                placeholder="e.g. 53"
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm glass-input text-white ${
                  errors.initialHead ? 'border-rose-500 focus:border-rose-500' : ''
                }`}
              />
            </div>
            {errors.initialHead && (
              <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 font-mono">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.initialHead}
              </p>
            )}
          </div>

          {/* Min Track */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                Minimum Track
              </span>
              <span className="text-[10px] font-mono text-slate-400">Default: 0</span>
            </label>
            <input
              type="number"
              value={rawInputs.minTrack}
              onChange={(e) => updateRawInput('minTrack', e.target.value)}
              placeholder="0"
              className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm glass-input text-white ${
                errors.minTrack ? 'border-rose-500 focus:border-rose-500' : ''
              }`}
            />
            {errors.minTrack && (
              <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 font-mono">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.minTrack}
              </p>
            )}
          </div>

          {/* Max Track */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                Maximum Track
              </span>
              <span className="text-[10px] font-mono text-slate-400">Default: 199</span>
            </label>
            <input
              type="number"
              value={rawInputs.maxTrack}
              onChange={(e) => updateRawInput('maxTrack', e.target.value)}
              placeholder="199"
              className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm glass-input text-white ${
                errors.maxTrack ? 'border-rose-500 focus:border-rose-500' : ''
              }`}
            />
            {errors.maxTrack && (
              <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 font-mono">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.maxTrack}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Request Queue */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Disk Request Queue (comma or space separated)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              Tokens: {rawInputs.requestQueue.split(/[\s,]+/).filter(Boolean).length}
            </span>
          </div>

          <textarea
            rows={2}
            value={rawInputs.requestQueue}
            onChange={(e) => updateRawInput('requestQueue', e.target.value)}
            placeholder="e.g. 98, 183, 37, 122, 14, 124, 65, 67"
            className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-sm glass-input text-cyan-200 resize-none ${
              errors.requestQueue ? 'border-rose-500 focus:border-rose-500' : ''
            }`}
          />
          {errors.requestQueue && (
            <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 font-mono">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.requestQueue}
            </p>
          )}
        </div>

        {/* Row 3: SCAN Direction & Speed Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* SCAN Direction */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              SCAN Initial Arm Sweep Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateRawInput('scanDirection', 'left')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  rawInputs.scanDirection === 'left'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-violet'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Left (Towards Min)</span>
              </button>

              <button
                type="button"
                onClick={() => updateRawInput('scanDirection', 'right')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  rawInputs.scanDirection === 'right'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-glow-cyan'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>Right (Towards Max)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              SCAN will first service tracks toward this end until reaching the physical disk boundary.
            </p>
          </div>

          {/* Simulation Speed */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Default Simulation Playback Speed
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'normal', 'fast'] as SimulationSpeed[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateRawInput('speed', s)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                    rawInputs.speed === s
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                      : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Speed controls the transition delay between sequential track visits during playback.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-white/10">
          <button
            onClick={handleStartSimulation}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-glow-cyan transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Simulation</span>
          </button>

          <button
            onClick={handleRunAll}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-glow-violet transition-all active:scale-95"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Run All Algorithms</span>
          </button>
        </div>
      </div>
    </div>
  );
};
