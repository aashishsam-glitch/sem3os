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
  RotateCw,
  CheckCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import type { ScanDirection } from '../types/disk';

export const CLOOKPage: React.FC = () => {
  const { config, clookResult, cscanResult, updateRawInput, reducedMotion } = useDisk();
  const [activeView, setActiveView] = useState<'both' | 'graph' | 'platter'>('both');

  const playback = usePlayback({
    totalSteps: clookResult.steps.length,
    initialSpeed: config.speed,
  });

  const currentStep = playback.currentStep;
  const currentStepData = currentStep > 0 ? clookResult.steps[currentStep - 1] : null;
  const currentTrack =
    currentStep === 0 ? clookResult.headSequence[0] : clookResult.headSequence[currentStep];

  const handleDirectionChange = (newDir: ScanDirection) => {
    playback.reset();
    updateRawInput('scanDirection', newDir);
  };

  const currentDirection = currentStepData?.direction || config.scanDirection;
  const cylindersSavedVsCScan = Math.max(0, cscanResult.totalHeadMovement - clookResult.totalHeadMovement);
  const minPending = Math.min(...config.requestQueue);
  const maxPending = Math.max(...config.requestQueue);

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
            <RotateCw className="w-3.5 h-3.5" />
            CIRCULAR LOOK (C-LOOK)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            C-LOOK Disk Scheduling Algorithm
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Combines the uniform waiting time of circular scheduling with the boundary-saving efficiency of LOOK. Jumps directly between extreme pending requests without touching boundaries.
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
        {/* Left Card: Direction Selector */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Sweep Direction
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Active: {config.scanDirection.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDirectionChange('left')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                config.scanDirection === 'left'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-glow-cyan'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Left (Towards Min: {config.minTrack})</span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectionChange('right')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                config.scanDirection === 'right'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-glow-cyan'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>Right (Towards Max: {config.maxTrack})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Changing direction automatically resets and recalculates the trajectory sequence.
          </p>
        </div>

        {/* Right Card: C-LOOK vs C-SCAN Comparison Insight */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              Seek Movement Savings Over C-SCAN
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              HIGH EFFICIENCY
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-200">
              Saved <span className="font-mono text-cyan-300 font-bold">{cylindersSavedVsCScan} cylinders</span> vs C-SCAN!
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              By jumping directly between extreme requests ({maxPending} ↔ {minPending}) instead of traveling to boundaries 0 and 199, C-LOOK significantly reduces unproductive seek distance while preserving uniform delay.
            </p>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Direct Span: [{minPending} ↔ {maxPending}]</span>
            <span className="text-cyan-300">Optimal Circular Path</span>
          </div>
        </div>
      </div>

      {/* 3. Numerical Metrics Cards */}
      <MetricsCard result={clookResult} currentStep={currentStep} />

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
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <ArrowRight className={`w-3 h-3 ${currentDirection === 'left' ? 'rotate-180' : ''}`} />
                {currentDirection.toUpperCase()}
              </span>
              {currentStepData?.isJump ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Direct Circular Jump Active
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Sweep Phase
                </span>
              )}
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
        headSequence={clookResult.headSequence}
        currentStep={currentStep}
        steps={clookResult.steps}
        totalHeadMovement={clookResult.totalHeadMovement}
        algorithmName="C-LOOK"
        onSelectStep={playback.goToStep}
      />

      {/* 6. Playback Controls */}
      <PlaybackControls
        currentStep={currentStep}
        totalSteps={clookResult.steps.length}
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
            result={clookResult}
            currentStep={currentStep}
            minTrack={config.minTrack}
            maxTrack={config.maxTrack}
          />
        )}

        {(activeView === 'both' || activeView === 'graph') && (
          <AlgorithmGraph
            result={clookResult}
            currentStep={currentStep}
            minTrack={config.minTrack}
            maxTrack={config.maxTrack}
            isScan={true}
          />
        )}
      </div>

      {/* 7. Execution Schedule Table */}
      <ExecutionTable
        steps={clookResult.steps}
        currentStep={currentStep}
        initialHead={config.initialHead}
        onSelectStep={playback.goToStep}
        algorithmName="C-LOOK"
      />

      {/* 8. Theoretical Analysis Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          C-LOOK Theoretical Trade-offs & Advantages
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1.5">
              <CheckCircle className="w-4 h-4" />
              Advantages
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Combines circular fairness with optimal boundary avoidance.</li>
              <li>Significantly lower total seek displacement than C-SCAN.</li>
              <li>Uniform waiting time distribution without starvation.</li>
              <li>Often regarded as the most practical elevator-variant in modern operating systems.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1.5">
              <AlertTriangle className="w-4 h-4" />
              Considerations
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Requires maintaining min and max pending pointers in memory.</li>
              <li>Still incurs a long seek penalty during the circular jump between extreme requests.</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
