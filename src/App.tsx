import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { DiskProvider, useDisk } from './context/DiskContext';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { FCFSPage } from './pages/FCFSPage';
import { SSTFPage } from './pages/SSTFPage';
import { SCANPage } from './pages/SCANPage';
import { LOOKPage } from './pages/LOOKPage';
import { CSCANPage } from './pages/CSCANPage';
import { CLOOKPage } from './pages/CLOOKPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { Disc } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useDisk();

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Navigation (Sidebar desktop + Topbar mobile) */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && <HomePage key="home" />}
            {activeTab === 'fcfs' && <FCFSPage key="fcfs" />}
            {activeTab === 'sstf' && <SSTFPage key="sstf" />}
            {activeTab === 'scan' && <SCANPage key="scan" />}
            {activeTab === 'look' && <LOOKPage key="look" />}
            {activeTab === 'cscan' && <CSCANPage key="cscan" />}
            {activeTab === 'clook' && <CLOOKPage key="clook" />}
            {activeTab === 'compare' && <ComparisonPage key="compare" />}
          </AnimatePresence>
        </div>

        {/* Global Footer */}
        <footer className="border-t border-white/5 bg-[#050811]/80 backdrop-blur-md px-6 py-4 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-cyan-400" />
              <span>
                Disk Scheduling Visualizer &bull; Operating Systems Micro-Project
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-slate-400">
                Algorithms: <strong className="text-cyan-400">FCFS</strong> | <strong className="text-purple-400">SSTF</strong> | <strong className="text-blue-400">SCAN</strong> | <strong className="text-emerald-400">LOOK</strong> | <strong className="text-cyan-300">C-SCAN</strong> | <strong className="text-violet-400">C-LOOK</strong>
              </span>
              <span className="hidden sm:inline text-slate-600">&bull;</span>
              <span className="hidden sm:inline text-slate-400">
                Standard Range: 0–199 Cylinders
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export function App() {
  return (
    <DiskProvider>
      <div className="relative min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <InteractiveBackground />
        <MainContent />
      </div>
    </DiskProvider>
  );
}

export default App;
