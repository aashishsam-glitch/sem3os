import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { AlgorithmResult } from '../types/disk';
import { ArrowRight, Compass } from 'lucide-react';

interface AlgorithmGraphProps {
  result: AlgorithmResult;
  currentStep: number;
  minTrack: number;
  maxTrack: number;
  isScan?: boolean;
}

export const AlgorithmGraph: React.FC<AlgorithmGraphProps> = ({
  result,
  currentStep,
  minTrack,
  maxTrack,
  isScan = false,
}) => {
  // Map graphData points up to currentStep or all points with an active flag
  // The line reveals up to currentStep, while ghostly dotted points show upcoming steps!
  const fullData = result.graphData.map((pt, idx) => {
    const isVisited = idx <= currentStep;
    const isActive = idx === currentStep;
    return {
      ...pt,
      displayTrack: isVisited ? pt.track : null, // for revealing animated line
      ghostTrack: pt.track,
      isVisited,
      isActive,
      stepLabel: idx === 0 ? 'Init' : `S${idx}`,
    };
  });


  // Custom Dot component for Recharts
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.displayTrack === null) return null;

    const isActive = payload.isActive;
    const isBoundary = payload.isBoundary;
    const isJump = payload.isJump;
    const isInitial = payload.isInitial;

    let fill = '#00f2fe';
    let stroke = '#ffffff';

    if (isInitial) {
      fill = '#38bdf8';
    } else if (isJump) {
      fill = '#f59e0b'; // Amber for circular jump
    } else if (isBoundary) {
      fill = '#f43f5e';
    } else if (payload.isReturnPath) {
      fill = '#c084fc'; // Purple for return path
    }

    return (
      <g key={`dot-${payload.step}`}>
        {isActive && (
          <circle
            cx={cx}
            cy={cy}
            r={13}
            fill="none"
            stroke={fill}
            strokeWidth="2.5"
            className="animate-ping opacity-75 origin-center"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isActive ? 8 : 5}
          fill={fill}
          stroke={isActive ? '#ffffff' : stroke}
          strokeWidth={isActive ? 2.5 : 1.5}
        />
        {/* Track Label on the point */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="text-[11px] font-mono font-bold fill-slate-200 select-none"
          filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.8))"
        >
          {payload.track}
        </text>
      </g>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const stepIdx = data.step;
    const stepDetail = stepIdx > 0 ? result.steps[stepIdx - 1] : null;

    return (
      <div className="glass-panel-glow p-3.5 rounded-xl border border-cyan-500/40 text-xs shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-white/10">
          <span className="font-semibold text-cyan-300 font-mono">
            {stepIdx === 0 ? 'Initial Arm Position' : `Execution Step ${stepIdx}`}
          </span>
          {data.isJump ? (
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              Circular Jump
            </span>
          ) : data.isBoundary ? (
            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Boundary Turnaround
            </span>
          ) : data.isReturnPath ? (
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Return Sweep
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {stepIdx === 0 ? 'Start' : 'Servicing Request'}
            </span>
          )}
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Cylinder Track:</span>
            <strong className="text-cyan-300 text-sm">{data.track}</strong>
          </div>
          {stepDetail && (
            <>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>From Track:</span>
                <span className="text-slate-200">{stepDetail.fromTrack}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Seek Distance:</span>
                <strong className="text-amber-300">{stepDetail.seekDistance} cylinders</strong>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Total Accumulated Seek:</span>
                <span className="text-violet-300">{stepDetail.totalSeekSoFar} cyl</span>
              </div>
              {stepDetail.direction && (
                <div className="flex justify-between gap-4 text-slate-400">
                  <span>Arm Direction:</span>
                  <span className="text-cyan-400 uppercase font-bold flex items-center gap-1">
                    <ArrowRight className={`w-3 h-3 ${stepDetail.direction === 'left' ? 'rotate-180' : ''}`} />
                    {stepDetail.direction}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass space-y-4">
      {/* Graph Control / Header Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            Sequential Disk Head Trajectory Graph
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Step {currentStep} / {result.steps.length}
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            X-axis: Movement Sequence | Y-axis: Disk Cylinder Tracks ({minTrack} - {maxTrack})
          </p>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Forward Path</span>
          </div>
          {(isScan || result.algorithm === 'LOOK' || result.algorithm === 'C-SCAN' || result.algorithm === 'C-LOOK') && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>{result.algorithm.startsWith('C-') ? 'Post-Jump' : 'Reverse Path'}</span>
            </div>
          )}
          {(result.algorithm === 'C-SCAN' || result.algorithm === 'C-LOOK') && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Circular Jump</span>
            </div>
          )}
          {(result.algorithm === 'SCAN' || result.algorithm === 'C-SCAN') && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Boundary</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-500" />
            <span>Planned Path</span>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-[380px] sm:h-[420px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={fullData}
            margin={{ top: 25, right: 35, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            
            <XAxis
              dataKey="stepLabel"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={{ stroke: '#334155' }}
              label={{
                value: 'Head Movement Sequence (Step Index)',
                position: 'insideBottom',
                offset: -15,
                fill: '#94a3b8',
                fontSize: 12,
              }}
            />
            
            <YAxis
              domain={[minTrack, maxTrack]}
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={{ stroke: '#334155' }}
              label={{
                value: 'Cylinder Track Number',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#94a3b8',
                fontSize: 12,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Boundary reference lines */}
            <ReferenceLine
              y={minTrack}
              stroke="rgba(244, 63, 94, 0.4)"
              strokeDasharray="4 4"
              label={{
                value: `Min (${minTrack})`,
                fill: '#f43f5e',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
            />
            <ReferenceLine
              y={maxTrack}
              stroke="rgba(244, 63, 94, 0.4)"
              strokeDasharray="4 4"
              label={{
                value: `Max (${maxTrack})`,
                fill: '#f43f5e',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            {/* Initial head position reference */}
            <ReferenceLine
              y={result.headSequence[0]}
              stroke="rgba(56, 189, 248, 0.25)"
              strokeDasharray="2 2"
            />

            {/* Ghost Path (Shows full path lightly) */}
            <Line
              type="linear"
              dataKey="ghostTrack"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />

            {/* Active Execution Path up to currentStep */}
            <Line
              type="linear"
              dataKey="displayTrack"
              stroke="#00f2fe"
              strokeWidth={3}
              dot={renderCustomDot}
              activeDot={{ r: 9, fill: '#00f2fe', stroke: '#ffffff', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={400}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Head trajectory summary ticker */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium">Head Movement Sequence:</span>
        </div>
        <div className="flex items-center flex-wrap gap-1.5 font-mono">
          {result.headSequence.map((track, idx) => {
            const isReached = idx <= currentStep;
            const isCurrent = idx === currentStep;
            return (
              <React.Fragment key={idx}>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] transition-all duration-200 ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                      : isReached
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/40'
                      : 'bg-slate-950/50 text-slate-600 border border-slate-800'
                  }`}
                >
                  {track}
                </span>
                {idx < result.headSequence.length - 1 && (
                  <span className={`text-[10px] ${idx < currentStep ? 'text-cyan-400' : 'text-slate-700'}`}>
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
