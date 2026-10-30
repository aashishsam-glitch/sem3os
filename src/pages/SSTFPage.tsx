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
  Compass,
  CheckCircle,
  AlertTriangle,
  Layers,
  Target,
} from 'lucide-react';

export const SSTFPage: React.FC = () => {
  const { config, sstfResult, reducedMotion } = useDisk();
  const [activeView, setActiveView] = useState<'both' | 'graph' | 'platter'>('both');

  const playback = usePlayback({
    totalSteps: sstfResult.steps.length,
    initialSpeed: config.speed,
  });

  const currentStep = playback.currentStep;
  const currentStepData = currentStep > 0 ? sstfResult.steps[currentStep - 1] : null;
  const currentTrack =
    currentStep === 0 ? sstfResult.headSequence[0] : sstfResult.headSequence[currentStep];

  const pendingRequests = currentStepData
    ? currentStepData.remainingQueue
    : config.requestQueue;

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
            <Compass className="w-3.5 h-3.5" />
            SHORTEST SEEK TIME FIRST
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SSTF Disk Scheduling Algorithm
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Greedily selects the pending track with the minimum absolute distance |track - head| from the active cylinder.
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
        {/* Left Card: Selected Request */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" />
              Active Target Selection (Step {currentStep})
            </span>
            <span className="font-mono text-slate-400 text-[10px]">Head: {currentTrack}</span>
          </div>

          {currentStepData ? (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Selected Track:</span>
                <span className="text-2xl font-black text-cyan-300 font-mono">
                  Track {currentStepData.toTrack}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Minimal Seek Distance:</span>
                <span className="text-xl font-bold text-amber-300 font-mono">
                  {currentStepData.seekDistance} cyl
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              Arm ready at initial track {config.initialHead}. Press Play to evaluate the nearest request.
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Deterministic tie-breaker: Equal distance ties prioritize requests appearing earlier in the original queue.
          </p>
        </div>

        {/* Right Card: Pending Requests Pool */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Pending Requests Pool ({pendingRequests.length} remaining)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Dynamic Pool</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 min-h-[46px] p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((track, i) => {
                const distFromHead = Math.abs(track - currentTrack);
                return (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-xs flex items-center gap-1"
                    title={`Distance to track ${track} is ${distFromHead} cylinders`}
                  >
                    <span>{track}</span>
                    <span className="text-[9px] text-amber-400/80 font-sans">
                      (Δ{distFromHead})
                    </span>
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                All queue requests successfully serviced!
              </span>
            )}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Original Queue: [{config.requestQueue.join(', ')}]</span>
            <span className="text-purple-300">
              Serviced: {currentStep} / {config.requestQueue.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Numerical Metrics Cards */}
      <MetricsCard result={sstfResult} currentStep={currentStep} />

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
                Greedy Nearest
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
        headSequence={sstfResult.headSequence}
        currentStep={currentStep}
        steps={sstfResult.steps}
        totalHeadMovement={sstfResult.totalHeadMovement}
        algorithmName="SSTF"
        onSelectStep={playback.goToStep}
      />

      {/* 6. Playback Controls */}
      <PlaybackControls
        currentStep={currentStep}
        totalSteps={sstfResult.steps.length}
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
            result={sstfResult}
            currentStep={currentStep}
            minTrack={config.minTrack}
            maxTrack={config.maxTrack}
          />
        )}

        {(activeView === 'both' || activeView === 'graph') && (
          <AlgorithmGraph
            result={sstfResult}
            currentStep={currentStep}
            minTrack={config.minTrack}
            maxTrack={config.maxTrack}
          />
        )}
      </div>

      {/* 7. Execution Schedule Table */}
      <ExecutionTable
        steps={sstfResult.steps}
        currentStep={currentStep}
        initialHead={config.initialHead}
        onSelectStep={playback.goToStep}
        algorithmName="SSTF"
      />

      {/* 8. Theoretical Analysis Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          SSTF Theoretical Trade-offs & Starvation Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1.5">
              <CheckCircle className="w-4 h-4" />
              Advantages
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Substantially lowers total head movement compared to naive FCFS.</li>
              <li>Improves overall system I/O throughput for clustered requests.</li>
              <li>Minimal seek latency on average.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1.5">
              <AlertTriangle className="w-4 h-4" />
              Starvation Hazard
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                <strong>Starvation:</strong> If new requests continuously arrive close to the current head, requests on distant tracks may wait indefinitely.
              </li>
              <li>High variance in response times (not ideal for real-time systems).</li>
              <li>Requires calculating seek distances across all pending requests at every step.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
