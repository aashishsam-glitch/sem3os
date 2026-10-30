import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDisk } from '../context/DiskContext';
import { usePlayback } from '../hooks/usePlayback';
import { AlgorithmGraph } from '../components/AlgorithmGraph';
import { DiskPlatterVisualizer } from '../components/DiskPlatterVisualizer';
import { PlaybackControls } from '../components/PlaybackControls';
import { SeekSequence } from '../components/SeekSequence';
import { ExecutionTable } from '../components/ExecutionTable';
import { MetricsCard } from '../components/MetricsCard';
import {
  ArrowRightLeft,
  Info,
  CheckCircle,
  AlertTriangle,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const FCFSPage: React.FC = () => {
  const { config, fcfsResult, reducedMotion } = useDisk();
  const [activeView, setActiveView] = useState<'both' | 'graph' | 'platter'>('both');

  const playback = usePlayback({
    totalSteps: fcfsResult.steps.length,
    initialSpeed: config.speed,
  });

  const currentStep = playback.currentStep;
  const currentStepData = currentStep > 0 ? fcfsResult.steps[currentStep - 1] : null;
  const currentTrack =
    currentStep === 0 ? fcfsResult.headSequence[0] : fcfsResult.headSequence[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pb-16 max-w-6xl mx-auto"
    >
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex-1 pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            FIRST-COME, FIRST-SERVED
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FCFS Disk Scheduling Algorithm
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Processes queue requests in strictly chronological arrival order without sorting or prioritizing tracks.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveView('both')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'both'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setActiveView('graph')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'graph'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Graph Only
          </button>
          <button
            onClick={() => setActiveView('platter')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeView === 'platter'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Platter Only
          </button>
        </div>
      </div>

      {/* 2. Context & Parameters 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Original Request Arrival Sequence */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              Original Request Arrival Sequence
            </span>
            <span className="font-mono text-slate-400 text-[10px]">
              Initial Head: <strong className="text-cyan-300">{config.initialHead}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 min-h-[46px] p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold">
              Start: {config.initialHead}
            </span>
            <span className="text-slate-600 font-bold">→</span>
            {config.requestQueue.map((track, idx) => (
              <React.Fragment key={idx}>
                <span
                  className={`px-2 py-1 rounded-lg font-mono text-xs transition-all ${
                    idx < currentStep
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : idx === currentStep - 1
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  {track}
                </span>
                {idx < config.requestQueue.length - 1 && (
                  <span className="text-slate-600 text-xs">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Requests are processed sequentially from first to last with zero track reordering.
          </p>
        </div>

        {/* Right Card: Policy & Mechanics Overview */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              FIFO Dispatch Policy & Guarantees
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              STRICT ORDER
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-200">
              Fair Queue Dispatch (Zero Starvation)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every arrival is serviced without being overtaken by newer requests. While simple and fair, alternating inner and outer cylinders leads to heavy mechanical arm thrashing.
            </p>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Disk Range: [{config.minTrack} – {config.maxTrack}]</span>
            <span className="text-cyan-300">Total: {config.requestQueue.length} requests</span>
          </div>
        </div>
      </div>

      {/* 3. Numerical Metrics Cards */}
      <MetricsCard result={fcfsResult} currentStep={currentStep} />

      {/* 4. Current Head Location & Accumulated Seek Ticker */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Current Head Location & Status
            </span>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
              <span>Track {currentTrack}</span>
              {currentStepData && (
                <span className="text-xs font-normal text-amber-300">
                  (+{currentStepData.seekDistance} cyl move from Track {currentStepData.fromTrack})
                </span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                FIFO Order
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Accumulated Seek
          </span>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {currentStepData ? currentStepData.totalSeekSoFar : 0} <span className="text-xs text-slate-400 font-normal">cyl</span>
          </div>
        </div>
      </div>

      {/* 5. Seek Sequence Traversal Path */}
      <SeekSequence
        headSequence={fcfsResult.headSequence}
        currentStep={currentStep}
        steps={fcfsResult.steps}
        totalHeadMovement={fcfsResult.totalHeadMovement}
        algorithmName="FCFS"
        onSelectStep={playback.goToStep}
      />

      {/* 6. Playback Controls */}
      <PlaybackControls
        currentStep={currentStep}
        totalSteps={fcfsResult.steps.length}
        isPlaying={playback.isPlaying}
        speed={playback.speed}
        isLooping={playback.isLooping}
        onPlay={playback.play}
        onPause={playback.pause}
        onReset={playback.reset}
        onNext={playback.nextStep}
        onPrev={playback.prevStep}
        onGoToStep={playback.goToStep}
        onSetSpeed={playback.setSpeed}
        onToggleLoop={() => playback.setIsLooping(!playback.isLooping)}
      />

      {/* 6. Visual Displays (Platter and Graph) */}
      <div className="space-y-6">
        {(activeView === 'both' || activeView === 'platter') && (
          <DiskPlatterVisualizer
            result={fcfsResult}
            currentStep={currentStep}
            minTrack={config.minTrack}
            maxTrack={config.maxTrack}
          />
        )}

        {(activeView === 'both' || activeView === 'graph') && (
          <AlgorithmGraph
            result={fcfsResult}
            currentStep={currentStep}
            minTrack={config.minTrack}
            maxTrack={config.maxTrack}
          />
        )}
      </div>

      {/* 7. Execution Schedule Table */}
      <ExecutionTable
        steps={fcfsResult.steps}
        currentStep={currentStep}
        initialHead={config.initialHead}
        onSelectStep={playback.goToStep}
        algorithmName="FCFS"
      />

      {/* 8. Theoretical Analysis Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          FCFS Theoretical Trade-offs & Characteristics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1.5">
              <CheckCircle className="w-4 h-4" />
              Advantages
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Absolutely fair to every I/O request.</li>
              <li>Zero risk of starvation; every request is guaranteed service.</li>
              <li>Trivial O(1) scheduling overhead (FIFO queue).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1.5">
              <AlertTriangle className="w-4 h-4" />
              Disadvantages
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>High arm thrashing when requests alternate between inner and outer tracks.</li>
              <li>Suboptimal seek times and elevated mean response times.</li>
              <li>Does not exploit secondary storage mechanical locality.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
