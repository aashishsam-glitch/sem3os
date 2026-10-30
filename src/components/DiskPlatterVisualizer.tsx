import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { AlgorithmResult } from '../types/disk';
import { Disc3, Layers, Compass, ArrowRight } from 'lucide-react';

interface DiskPlatterVisualizerProps {
  result: AlgorithmResult;
  currentStep: number;
  minTrack: number;
  maxTrack: number;
}

export const DiskPlatterVisualizer: React.FC<DiskPlatterVisualizerProps> = ({
  result,
  currentStep,
  minTrack,
  maxTrack,
}) => {
  // Current active track
  const currentTrack =
    currentStep === 0
      ? result.headSequence[0]
      : result.headSequence[Math.min(currentStep, result.headSequence.length - 1)];

  // Steps executed so far
  const currentStepData = currentStep > 0 ? result.steps[currentStep - 1] : null;

  // Track history up to current step
  const visitedTracks = useMemo(() => {
    return result.headSequence.slice(0, currentStep + 1);
  }, [result.headSequence, currentStep]);

  // Pending tracks at current step
  const remainingTracks = useMemo(() => {
    if (currentStep === 0) return result.servicedSequence;
    if (!currentStepData) return [];
    return currentStepData.remainingQueue;
  }, [currentStep, currentStepData, result.servicedSequence]);

  // Radius normalization: map track [minTrack, maxTrack] to platter radius [innerRadius, outerRadius]
  const innerRadius = 55;
  const outerRadius = 160;
  const trackRange = Math.max(1, maxTrack - minTrack);

  const getRadiusForTrack = (track: number) => {
    const fraction = (track - minTrack) / trackRange;
    return innerRadius + fraction * (outerRadius - innerRadius);
  };

  const activeRadius = getRadiusForTrack(currentTrack);

  // Arm pivot calculation
  const pivotX = 350;
  const pivotY = 220;
  const platterCenterX = 180;
  const platterCenterY = 180;

  // Arm angle pointing to top quadrant of active cylinder
  const targetX = platterCenterX + activeRadius * 0.707;
  const targetY = platterCenterY - activeRadius * 0.707;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 shadow-glass overflow-hidden relative">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Disc3 className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Hard Drive Actuator Arm Visualizer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LIVE CYLINDER
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Real-time physical representation of head radial positioning across disk platters
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Head Track: <strong className="text-cyan-300 font-bold">{currentTrack}</strong>
          </span>
          {currentStepData && (
            <span className="px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Seek: <strong className="text-violet-300 font-bold">{currentStepData.seekDistance} cyl</strong>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Platter Graphic */}
        <div className="lg:col-span-7 flex justify-center items-center py-2 relative">
          <svg
            viewBox="0 0 380 340"
            className="w-full max-w-[380px] h-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
          >
            <defs>
              {/* Radial gradient for metallic platter */}
              <radialGradient id="platterMetal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f1b33" />
                <stop offset="35%" stopColor="#132342" />
                <stop offset="70%" stopColor="#0d182e" />
                <stop offset="100%" stopColor="#070c17" />
              </radialGradient>

              {/* Spindle hub gradient */}
              <radialGradient id="spindleHub" cx="45%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#0284c7" />
                <stop offset="85%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#082f49" />
              </radialGradient>

              {/* Glowing filter */}
              <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Platter Base */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={outerRadius + 8}
              fill="url(#platterMetal)"
              stroke="rgba(0, 242, 254, 0.25)"
              strokeWidth="2"
            />

            {/* Outer edge rim tick marks */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={outerRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />

            {/* Benchmark Track Rings */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((fraction, idx) => {
              const r = innerRadius + fraction * (outerRadius - innerRadius);
              const trackVal = Math.round(minTrack + fraction * trackRange);
              return (
                <g key={idx}>
                  <circle
                    cx={platterCenterX}
                    cy={platterCenterY}
                    r={r}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeWidth="1"
                  />
                  <text
                    x={platterCenterX}
                    y={platterCenterY - r + 9}
                    textAnchor="middle"
                    className="text-[8px] fill-slate-500 font-mono select-none"
                  >
                    {trackVal}
                  </text>
                </g>
              );
            })}

            {/* Boundary Tracks */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={innerRadius}
              fill="none"
              stroke="rgba(244, 63, 94, 0.35)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={outerRadius}
              fill="none"
              stroke="rgba(244, 63, 94, 0.35)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Visited Track Rings (Subtle emerald lines) */}
            {visitedTracks.map((t, idx) => {
              const r = getRadiusForTrack(t);
              return (
                <circle
                  key={`visited-${idx}`}
                  cx={platterCenterX}
                  cy={platterCenterY}
                  r={r}
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.35)"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* Pending Requests on Platter (Amber Dots) */}
            {remainingTracks.map((t, idx) => {
              const r = getRadiusForTrack(t);
              // Scatter along different angles for visual clarity
              const theta = ((idx * 47) % 360) * (Math.PI / 180);
              const px = platterCenterX + Math.cos(theta) * r;
              const py = platterCenterY + Math.sin(theta) * r;
              return (
                <g key={`pending-${idx}`}>
                  <circle cx={px} cy={py} r="3" fill="#f59e0b" opacity="0.8" />
                  <circle cx={px} cy={py} r="6" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.4" />
                </g>
              );
            })}

            {/* ACTIVE HEAD CYLINDER (Glowing Cyan Pulse Ring) */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={activeRadius}
              fill="none"
              stroke="#00f2fe"
              strokeWidth="2.5"
              filter="url(#cyanGlow)"
            />
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={activeRadius}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="4 3"
              className="animate-spin-slow origin-center"
              style={{ transformOrigin: `${platterCenterX}px ${platterCenterY}px` }}
            />

            {/* Spindle Hub Center */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={innerRadius - 10}
              fill="url(#spindleHub)"
              stroke="rgba(0, 242, 254, 0.5)"
              strokeWidth="2"
            />
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={12}
              fill="#082f49"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <text
              x={platterCenterX}
              y={platterCenterY + 3}
              textAnchor="middle"
              className="text-[9px] font-bold fill-cyan-100 font-mono tracking-wider select-none"
            >
              SPINDLE
            </text>

            {/* Actuator Base / Pivot Motor */}
            <circle
              cx={pivotX}
              cy={pivotY}
              r={24}
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="2"
            />
            <circle
              cx={pivotX}
              cy={pivotY}
              r={12}
              fill="#0f172a"
              stroke="#00f2fe"
              strokeWidth="1.5"
            />

            {/* Actuator Arm */}
            <g>
              <line
                x1={pivotX}
                y1={pivotY}
                x2={targetX}
                y2={targetY}
                stroke="#94a3b8"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={pivotX}
                y1={pivotY}
                x2={targetX}
                y2={targetY}
                stroke="#00f2fe"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Read/Write Slider Head */}
              <circle
                cx={targetX}
                cy={targetY}
                r="6"
                fill="#00f2fe"
                stroke="#ffffff"
                strokeWidth="1.5"
                filter="url(#cyanGlow)"
              />
              <circle cx={targetX} cy={targetY} r="11" fill="none" stroke="#00f2fe" strokeWidth="1" opacity="0.6" />
            </g>
          </svg>
        </div>

        {/* Platter Legend & Linear Cylinder Gauge */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-2.5">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Linear Track Gauge [ {minTrack} — {maxTrack} ]
            </span>

            {/* Linear track bar representation */}
            <div className="relative h-6 bg-slate-950 rounded-lg p-1 border border-slate-800 flex items-center overflow-hidden">
              {/* Boundary markers */}
              <div className="absolute left-1 text-[9px] font-mono text-slate-500">
                {minTrack}
              </div>
              <div className="absolute right-1 text-[9px] font-mono text-slate-500">
                {maxTrack}
              </div>

              {/* Visited track ticks */}
              {visitedTracks.map((t, i) => {
                const posPercent = ((t - minTrack) / trackRange) * 100;
                return (
                  <div
                    key={`bar-visited-${i}`}
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-400/50"
                    style={{ left: `${posPercent}%` }}
                  />
                );
              })}

              {/* Pending track ticks */}
              {remainingTracks.map((t, i) => {
                const posPercent = ((t - minTrack) / trackRange) * 100;
                return (
                  <div
                    key={`bar-pending-${i}`}
                    className="absolute top-1 bottom-1 w-1 rounded-full bg-amber-400"
                    style={{ left: `${posPercent}%` }}
                  />
                );
              })}

              {/* Head position indicator */}
              <motion.div
                className="absolute top-0 bottom-0 w-2.5 rounded bg-cyan-400 shadow-glow-cyan z-10 -ml-1 flex items-center justify-center"
                animate={{ left: `${((currentTrack - minTrack) / trackRange) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="w-0.5 h-3 bg-slate-900 rounded-full" />
              </motion.div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span>Inner Cylinder (Track {minTrack})</span>
              <span className="text-cyan-300 font-bold">Track {currentTrack}</span>
              <span>Outer Cylinder (Track {maxTrack})</span>
            </div>
          </div>

          {/* Color legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-cyan-500/20">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-glow-cyan" />
              <span className="text-slate-300">Active Head Track</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-emerald-500/20">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Serviced Track</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-amber-500/20">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-300">Pending Request</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 border border-rose-500/20">
              <span className="w-3 h-3 rounded-full border border-dashed border-rose-400" />
              <span className="text-slate-300">Disk Boundary</span>
            </div>
          </div>

          {/* Step Narrative Note */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300">
            <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
              <span>Step {currentStep} of {result.steps.length}</span>
              {currentStepData?.direction && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                  <ArrowRight className={`w-3 h-3 ${currentStepData.direction === 'left' ? 'rotate-180' : ''}`} />
                  {currentStepData.direction.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {currentStep === 0
                ? `Arm initialized at track ${result.headSequence[0]}. Press Play or Next Step to start disk scheduling.`
                : currentStepData?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
