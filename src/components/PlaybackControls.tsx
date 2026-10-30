import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Gauge, Repeat } from 'lucide-react';
import type { SimulationSpeed } from '../types/disk';

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: SimulationSpeed;
  isLooping: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToStep: (step: number) => void;
  onSetSpeed: (speed: SimulationSpeed) => void;
  onToggleLoop: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  isLooping,
  onPlay,
  onPause,
  onReset,
  onNext,
  onPrev,
  onGoToStep,
  onSetSpeed,
  onToggleLoop,
}) => {
  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) onPause();
        else onPlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onPlay, onPause, onNext, onPrev, onReset]);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-cyan-500/20 shadow-glass space-y-4">
      {/* Top Slider and Step Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">
            Playback Progress: <strong className="text-cyan-400 font-bold">{currentStep}</strong> / {totalSteps} steps
          </span>
          <span className="text-slate-400">
            {currentStep === 0
              ? 'Ready to simulate'
              : currentStep >= totalSteps
              ? 'Simulation Finished'
              : `Step ${currentStep} Active`}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={totalSteps}
          value={currentStep}
          onChange={(e) => onGoToStep(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>

      {/* Control Buttons Grid */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Step Controls */}
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset to initial position (R)"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Prev Step */}
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            title="Previous Step (Left Arrow)"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause Main CTA */}
          {isPlaying ? (
            <button
              onClick={onPause}
              title="Pause Simulation (Spacebar)"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              title="Play Simulation (Spacebar)"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-semibold flex items-center gap-2 shadow-glow-cyan transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{currentStep >= totalSteps ? 'Replay' : 'Play'}</span>
            </button>
          )}

          {/* Next Step */}
          <button
            onClick={onNext}
            disabled={currentStep >= totalSteps}
            title="Next Step (Right Arrow)"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Loop toggle */}
          <button
            onClick={onToggleLoop}
            title="Toggle Continuous Loop"
            className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
              isLooping
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-slate-400'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="px-2 flex items-center gap-1 text-slate-400 text-xs">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Speed:</span>
          </div>

          {(['slow', 'normal', 'fast'] as SimulationSpeed[]).map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-3 py-1 text-xs rounded-lg font-medium capitalize transition-all ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Helpful keyboard hint */}
      <div className="hidden sm:flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-white/5">
        <span>Keyboard shortcuts:</span>
        <span className="space-x-2 font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Space</kbd> Play/Pause
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 ml-2">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">→</kbd> Step
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 ml-2">R</kbd> Reset
        </span>
      </div>
    </div>
  );
};
