import React, { useState } from 'react';
import { useDisk } from '../context/DiskContext';
import type { PageTab } from '../context/DiskContext';
import {
  Home,
  ArrowRightLeft,
  Compass,
  GitCommit,
  BarChart3,
  Menu,
  X,
  EyeOff,
  Eye,
  Disc,
  RefreshCw,
  RotateCw,
} from 'lucide-react';

interface NavItem {
  id: PageTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, reducedMotion, setReducedMotion, config } = useDisk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home & Setup',
      shortLabel: 'Home',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'fcfs',
      label: 'FCFS Scheduling',
      shortLabel: 'FCFS',
      icon: <ArrowRightLeft className="w-4 h-4" />,
      badge: 'Fair',
    },
    {
      id: 'sstf',
      label: 'SSTF Scheduling',
      shortLabel: 'SSTF',
      icon: <Compass className="w-4 h-4" />,
      badge: 'Greedy',
    },
    {
      id: 'scan',
      label: 'SCAN (Elevator)',
      shortLabel: 'SCAN',
      icon: <GitCommit className="w-4 h-4" />,
      badge: 'Boundary',
    },
    {
      id: 'look',
      label: 'LOOK Scheduling',
      shortLabel: 'LOOK',
      icon: <Eye className="w-4 h-4" />,
      badge: 'Adaptive',
    },
    {
      id: 'cscan',
      label: 'C-SCAN (Circular)',
      shortLabel: 'C-SCAN',
      icon: <RefreshCw className="w-4 h-4" />,
      badge: 'Circular',
    },
    {
      id: 'clook',
      label: 'C-LOOK (Circular)',
      shortLabel: 'C-LOOK',
      icon: <RotateCw className="w-4 h-4" />,
      badge: 'Optimized',
    },
    {
      id: 'compare',
      label: 'Compare All (6)',
      shortLabel: 'Compare',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: 'Benchmark',
    },
  ];

  const handleSelectTab = (tab: PageTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="lg:hidden sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-glow-cyan">
            <Disc className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              Disk Scheduling
            </h1>
            <span className="text-[10px] text-cyan-400 font-mono">OS Micro-Project</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#060913]/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <Disc className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-lg text-white">Menu Navigation</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 text-xs text-slate-300 border border-slate-800"
            >
              <span className="flex items-center gap-2">
                {reducedMotion ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                Reduced Motion
              </span>
              <span className="font-mono text-cyan-400">{reducedMotion ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 glass-panel border-r border-white/10 flex-col z-30 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-glow-cyan flex-shrink-0">
              <Disc className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-extrabold text-white tracking-tight leading-tight truncate">
                Disk Scheduling
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider block">
                VISUALIZER OS 2.0
              </span>
            </div>
          </div>
        </div>

        {/* Current Active Input Summary Pill */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex justify-between items-center text-slate-300 mb-1">
            <span>Head Position:</span>
            <strong className="text-cyan-400 font-bold">{config.initialHead}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Queue Length:</span>
            <strong className="text-purple-300">{config.requestQueue.length} tracks</strong>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                        : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400 border border-slate-800'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer settings & Motion toggle */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#080d1a]/50">
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition-all"
            title="Toggle CSS & Particle animations for accessibility"
          >
            <span className="flex items-center gap-2">
              {reducedMotion ? (
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
              )}
              Reduced Motion
            </span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                reducedMotion
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-cyan-500/20 text-cyan-300'
              }`}
            >
              {reducedMotion ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="text-[10px] text-slate-500 font-mono text-center">
            OS Micro-Project &bull; Graphical Visualization
          </div>
        </div>
      </aside>
    </>
  );
};
