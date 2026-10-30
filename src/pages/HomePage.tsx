import React from 'react';
import { motion } from 'framer-motion';
import { useDisk } from '../context/DiskContext';
import { InputDashboard } from '../components/InputDashboard';
import {
  ArrowRight,
  HardDrive,
  Compass,
  GitCommit,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  Eye,
  RefreshCw,
  RotateCw,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateToSim, reducedMotion } = useDisk();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12 max-w-6xl mx-auto"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center pt-4 sm:pt-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          OPERATING SYSTEMS MICRO-PROJECT &bull; 6 DISK SCHEDULING ALGORITHMS
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Disk Scheduling{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Visualizer
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
          Interactive simulation and mathematical performance evaluation of{' '}
          <strong className="text-white">FCFS</strong>,{' '}
          <strong className="text-white">SSTF</strong>,{' '}
          <strong className="text-white">SCAN</strong>,{' '}
          <strong className="text-white">LOOK</strong>,{' '}
          <strong className="text-white">C-SCAN</strong>, and{' '}
          <strong className="text-white">C-LOOK</strong> disk head movement with synchronized playback and metrics.
        </p>
      </motion.section>

      {/* Central Disk Configuration Panel */}
      <motion.section variants={itemVariants}>
        <InputDashboard />
      </motion.section>

      {/* Algorithm Showcase Cards (6 Algorithms) */}
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Core Scheduling Methods Available (6)
          </h3>
          <span className="text-xs text-slate-400">Click any card to inspect dedicated walkthrough</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* FCFS Card */}
          <div
            onClick={() => navigateToSim('fcfs')}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HardDrive className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                O(N) Complexity
              </span>
            </div>

            <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              First-Come, First-Served
            </h4>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              Services track I/O requests strictly in arrival order without reordering.
              Guarantees zero request starvation but suffers from high arm thrashing.
            </p>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>Inspect FCFS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* SSTF Card */}
          <div
            onClick={() => navigateToSim('sstf')}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Greedy Policy
              </span>
            </div>

            <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              Shortest Seek Time First
            </h4>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              Selects the pending request closest to the current read/write arm.
              Dramatically curtails seek distance, but introduces risk of starvation for outer cylinders.
            </p>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Inspect SSTF</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* SCAN Card */}
          <div
            onClick={() => navigateToSim('scan')}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GitCommit className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Elevator Algorithm
              </span>
            </div>

            <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              SCAN (Elevator)
            </h4>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              Sweeps unidirectionally servicing requests until reaching the physical disk boundary,
              then flips direction. Provides balanced seek times without perpetual starvation.
            </p>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-400 font-semibold">
              <span>Inspect SCAN</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* LOOK Card */}
          <div
            onClick={() => navigateToSim('look')}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Boundary-Aware
              </span>
            </div>

            <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              LOOK Algorithm
            </h4>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              Looks ahead and reverses immediately at the last pending request in the current sweep.
              Eliminates wasteful boundary seek overhead to track 0 or 199.
            </p>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Inspect LOOK</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* C-SCAN Card */}
          <div
            onClick={() => navigateToSim('cscan')}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Circular Policy
              </span>
            </div>

            <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              Circular SCAN (C-SCAN)
            </h4>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              Services requests in one direction all the way to the boundary, then rapidly resets to the opposite
              physical boundary without servicing requests on return. Provides uniform wait times.
            </p>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>Inspect C-SCAN</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* C-LOOK Card */}
          <div
            onClick={() => navigateToSim('clook')}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-violet-500/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RotateCw className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                Optimal Circular
              </span>
            </div>

            <h4 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
              Circular LOOK (C-LOOK)
            </h4>
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              Combines circular fairness with LOOK boundary avoidance. Jumps directly between extreme
              pending requests without touching physical boundaries, yielding exceptional efficiency.
            </p>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-violet-400 font-semibold">
              <span>Inspect C-LOOK</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Secondary Storage Anatomy Guide */}
      <motion.section
        variants={itemVariants}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">
            Disk Access Latency Components (Why Disk Scheduling Matters)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm mb-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Seek Time (Arm Movement)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The time taken for the mechanical read/write arm to reposition to the requested cylinder track.
              <strong className="text-cyan-200"> Disk scheduling algorithms optimize this primary bottleneck!</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm mb-1.5">
              <Clock className="w-4 h-4 text-violet-400" />
              Rotational Latency
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The delay waiting for the magnetic disk platter to spin the desired sector directly under the read head.
              Typical rotational latency is around 2–4 milliseconds at 7200 RPM.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Data Transfer Time
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The duration needed to stream magnetic bits into OS memory buffer. Depends on platter recording density
              and internal bus transfer rate (SATA/NVMe).
            </p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
