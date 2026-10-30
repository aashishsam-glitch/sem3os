import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import confetti from 'canvas-confetti';
import { useDisk } from '../context/DiskContext';
import {
  BarChart3,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Compass,
  GitCommit,
  Eye,
  RefreshCw,
  RotateCw,
} from 'lucide-react';
import type { AlgorithmType } from '../types/disk';

export const ComparisonPage: React.FC = () => {
  const { config, comparisonSummary, navigateToSim, reducedMotion } = useDisk();
  const { fcfs, sstf, scan, look, clook, cscan, bestAlgorithm, minMovement, maxMovement, percentageSaved } =
    comparisonSummary;

  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (!hasCelebrated && !reducedMotion) {
      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#8a2be2', '#4facfe', '#10b981'],
        });
      } catch (e) {
        // Safe fallback
      }
      setHasCelebrated(true);
    }
  }, [hasCelebrated, reducedMotion]);

  const chartData = [
    {
      name: 'FCFS',
      fullName: 'First Come First Serve',
      movement: fcfs.totalHeadMovement,
      average: fcfs.averageMovement,
      color: '#00f2fe',
      isBest: bestAlgorithm === 'FCFS',
    },
    {
      name: 'SSTF',
      fullName: 'Shortest Seek Time First',
      movement: sstf.totalHeadMovement,
      average: sstf.averageMovement,
      color: '#a855f7',
      isBest: bestAlgorithm === 'SSTF',
    },
    {
      name: 'SCAN',
      fullName: 'SCAN (Elevator)',
      movement: scan.totalHeadMovement,
      average: scan.averageMovement,
      color: '#38bdf8',
      isBest: bestAlgorithm === 'SCAN',
    },
    {
      name: 'LOOK',
      fullName: 'LOOK (Adaptive)',
      movement: look.totalHeadMovement,
      average: look.averageMovement,
      color: '#10b981',
      isBest: bestAlgorithm === 'LOOK',
    },
    {
      name: 'C-SCAN',
      fullName: 'Circular SCAN',
      movement: cscan.totalHeadMovement,
      average: cscan.averageMovement,
      color: '#06b6d4',
      isBest: bestAlgorithm === 'C-SCAN',
    },
    {
      name: 'C-LOOK',
      fullName: 'Circular LOOK',
      movement: clook.totalHeadMovement,
      average: clook.averageMovement,
      color: '#8b5cf6',
      isBest: bestAlgorithm === 'C-LOOK',
    },
  ];

  const handleRerun = () => {
    setHasCelebrated(false);
    if (!reducedMotion) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const getAlgoName = (key: AlgorithmType) => {
    switch (key) {
      case 'FCFS': return 'First Come First Serve';
      case 'SSTF': return 'Shortest Seek Time First';
      case 'SCAN': return 'Elevator (SCAN)';
      case 'LOOK': return 'LOOK (Adaptive)';
      case 'C-SCAN': return 'Circular SCAN (C-SCAN)';
      case 'C-LOOK': return 'Circular LOOK (C-LOOK)';
    }
  };

  const getNavKey = (key: AlgorithmType) => {
    switch (key) {
      case 'FCFS': return 'fcfs';
      case 'SSTF': return 'sstf';
      case 'SCAN': return 'scan';
      case 'LOOK': return 'look';
      case 'C-SCAN': return 'cscan';
      case 'C-LOOK': return 'clook';
    }
  };

  const algorithmRows = [
    { key: 'FCFS' as const, res: fcfs, icon: <ArrowRightLeft className="w-3.5 h-3.5" />, color: 'text-cyan-300', nav: 'fcfs' as const },
    { key: 'SSTF' as const, res: sstf, icon: <Compass className="w-3.5 h-3.5" />, color: 'text-purple-300', nav: 'sstf' as const },
    { key: 'SCAN' as const, res: scan, icon: <GitCommit className="w-3.5 h-3.5" />, color: 'text-blue-300', nav: 'scan' as const },
    { key: 'LOOK' as const, res: look, icon: <Eye className="w-3.5 h-3.5" />, color: 'text-emerald-300', nav: 'look' as const },
    { key: 'C-SCAN' as const, res: cscan, icon: <RefreshCw className="w-3.5 h-3.5" />, color: 'text-cyan-400', nav: 'cscan' as const },
    { key: 'C-LOOK' as const, res: clook, icon: <RotateCw className="w-3.5 h-3.5" />, color: 'text-violet-300', nav: 'clook' as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pb-16 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            BENCHMARK EVALUATION DASHBOARD &bull; 6 ALGORITHMS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Algorithm Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comparing all six algorithms across identical input parameters: Head {config.initialHead}, Range [
            {config.minTrack} - {config.maxTrack}], {config.requestQueue.length} requests, Direction: {config.scanDirection.toUpperCase()}.
          </p>
        </div>

        <button
          onClick={handleRerun}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>Rerun Comparison</span>
        </button>
      </div>

      {/* Best Performer Banner (Dynamically Calculated) */}
      <div className="glass-panel-glow p-6 rounded-3xl border border-cyan-500/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              MINIMUM SEEK DISTANCE FOR CURRENT INPUT
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {bestAlgorithm} ({getAlgoName(bestAlgorithm)}) achieved the lowest head movement!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              With a total seek movement of <strong className="text-cyan-300 font-mono">{minMovement} cylinders</strong>{' '}
              and an average of{' '}
              <strong className="text-cyan-300 font-mono">
                {comparisonSummary[getNavKey(bestAlgorithm)].averageMovement} cyl/request
              </strong>,{' '}
              it reduced mechanical arm displacement by{' '}
              <strong className="text-emerald-400 font-bold">{percentageSaved}%</strong> compared to the least optimal
              method ({maxMovement} cylinders).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigateToSim(getNavKey(bestAlgorithm))}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-cyan transition-all active:scale-95"
            >
              <span>Inspect {bestAlgorithm} Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-glass space-y-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Total Head Movement Comparison Across All 6 Algorithms (Cylinders)
            </h4>
            <p className="text-xs text-slate-400">Lower cylinder displacement indicates superior mechanical efficiency</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
            6 Algorithms Evaluated
          </span>
        </div>

        <div className="w-full h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                label={{
                  value: 'Total Movement (Cylinders)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 5,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="glass-panel-glow p-3.5 rounded-xl border border-cyan-500/40 text-xs font-mono shadow-2xl">
                      <div className="font-bold text-white mb-1">{d.fullName}</div>
                      <div className="text-cyan-300">Total Seek: {d.movement} cylinders</div>
                      <div className="text-purple-300">Avg / Request: {d.average} cyl</div>
                      {d.isBest && (
                        <div className="mt-1 text-amber-400 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Optimal for current input
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="movement" radius={[8, 8, 0, 0]} maxBarSize={55}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.isBest ? '#ffffff' : 'none'}
                    strokeWidth={entry.isBest ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of 6 Performance Snippet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {algorithmRows.map((item) => (
          <div
            key={item.key}
            onClick={() => navigateToSim(item.nav)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
              bestAlgorithm === item.key
                ? 'glass-panel-glow border-cyan-500/50 shadow-glow-cyan'
                : 'glass-panel border-white/10 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`flex items-center gap-1.5 font-bold text-sm ${item.color}`}>
                {item.icon}
                {item.key}
                {bestAlgorithm === item.key && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-normal">
                    Optimal
                  </span>
                )}
              </span>
              <span className="text-lg font-black font-mono text-white">
                {item.res.totalHeadMovement} <span className="text-xs text-slate-400 font-normal">cyl</span>
              </span>
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Average Seek:</span>
              <span className="font-mono text-slate-200">{item.res.averageMovement} cyl/req</span>
            </div>
            <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Seek Sequence:</span>
              <span className="font-mono text-cyan-300/90 truncate block text-[11px]" title={item.res.headSequence.join(' → ')}>
                {item.res.headSequence.join(' → ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-Side Detailed Metrics Comparison Table */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-glass space-y-4">
        <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2 pb-3 border-b border-white/10">
          <Layers className="w-4 h-4 text-cyan-400" />
          Comparative Benchmark Matrix & Trajectories
        </h4>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0c1424] text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Total Head Movement</th>
                <th className="py-3 px-4">Average Movement / Req</th>
                <th className="py-3 px-4">Max Single Seek</th>
                <th className="py-3 px-4">Seek Sequence</th>
                <th className="py-3 px-4 text-right">Deep Dive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {algorithmRows.map((item) => (
                <tr
                  key={item.key}
                  className={`transition-colors ${
                    bestAlgorithm === item.key ? 'bg-cyan-500/10 font-medium' : 'hover:bg-white/5'
                  }`}
                >
                  <td className={`py-3 px-4 font-bold ${item.color} flex items-center gap-2`}>
                    {item.icon}
                    {item.key}
                    {bestAlgorithm === item.key && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-normal">
                        Best
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {item.res.totalHeadMovement} <span className="text-slate-500 text-[11px]">cyl</span>
                  </td>
                  <td className="py-3 px-4 text-cyan-300">{item.res.averageMovement} cyl</td>
                  <td className="py-3 px-4 text-amber-300">{item.res.maxSeekDistance} cyl</td>
                  <td className="py-3 px-4 text-slate-400 max-w-sm truncate text-[11px]">
                    {item.res.headSequence.join(' → ')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigateToSim(item.nav)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                    >
                      View
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balanced Academic Conclusion Notice */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 text-xs leading-relaxed text-slate-300">
        <h5 className="font-bold text-sm text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Academic Performance Takeaways across All 6 Methods
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-white font-semibold block mb-1">Standard vs. Elevator:</span>
            <strong>FCFS</strong> prevents starvation at the cost of high seek thrashing. <strong>SSTF</strong> greedily minimizes seek distance but risks starvation for tracks distant from current clusters.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-white font-semibold block mb-1">SCAN vs. LOOK:</span>
            <strong>SCAN</strong> sweeps all the way to physical boundaries (0 and 199). <strong>LOOK</strong> eliminates boundary overhead by reversing at the outermost pending request, consistently saving seek distance.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-white font-semibold block mb-1">Circular Policies (C-SCAN & C-LOOK):</span>
            Provide uniform waiting time distributions by servicing in one direction only. <strong>C-LOOK</strong> avoids boundary visits, making it one of the most practical and efficient disk scheduling algorithms.
          </div>
        </div>
      </div>
    </motion.div>
  );
};
