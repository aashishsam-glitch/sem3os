# Disk Scheduling Visualizer

> **Operating Systems Micro-Project:** *Develop Graphical Visualization for Disk Scheduling Methods*  
> Implemented with **React 19**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **Framer Motion**.  
> Features 6 Core Scheduling Algorithms: **FCFS**, **SSTF**, **SCAN**, **LOOK**, **C-SCAN**, and **C-LOOK**.

---

## 🚀 Live Demo & Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.14.0)
- **npm** or **pnpm**

### 2. Installation
```bash
# In the project root directory
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build & Mathematical Verification
```bash
# Build production bundle
npm run build

# Run algorithm mathematical verification test suite
npx tsx src/algorithms/__tests__/validate.ts
```

---

## 🌟 The 6 Supported Scheduling Algorithms

### 1. **FCFS (First-Come, First-Served)**
- Services requests strictly in arrival order without sorting.
- Zero starvation risk, but suffers from high arm thrashing.

### 2. **SSTF (Shortest Seek Time First)**
- Greedily selects the pending track closest to the current head position ($\min |track - head|$).
- Dynamic pending pool with seek distance annotations ($\Delta$) and deterministic tie-breaking.
- Minimizes seek latency on average; introduces starvation risk for distant cylinders.

### 3. **SCAN (Elevator Algorithm)**
- Sweeps across the disk in the specified direction servicing tracks.
- **Strict SCAN Compliance**: Continues all the way to the physical disk boundary (`0` or `199`), reverses direction, and services remaining requests.
- Includes boundary seek displacement in total head movement.

### 4. **LOOK (Adaptive Elevator)**
- Looks ahead in the chosen direction and services requests in order.
- **Immediate Reversal**: Reverses immediately at the outermost requested cylinder in the current sweep, eliminating unproductive seek overhead to physical boundaries (0 or 199).
- Produces lower total seek displacement than SCAN.

### 5. **C-SCAN (Circular SCAN)**
- Treats cylinders as a continuous circular ring.
- Services tracks unidirectionally all the way to the physical boundary.
- **Circular Jump**: Rapidly resets from boundary to opposite physical boundary without servicing requests on return, providing a uniform waiting time distribution.

### 6. **C-LOOK (Circular LOOK)**
- Combines the uniform delay distribution of circular scheduling with the boundary-avoidance efficiency of LOOK.
- Sweeps unidirectionally to the outermost pending request, then jumps directly to the lowest/highest pending request at the opposite extreme (without touching physical boundaries).
- Highly practical and efficient algorithm for modern operating systems.

---

## 📐 Benchmark Verification (Reference Test Case)

Given:
- **Initial Head Position**: `53`
- **Request Queue**: `[98, 183, 37, 122, 14, 124, 65, 67]` (8 requests)
- **Disk Boundary Range**: `0 – 199`
- **Direction**: `Right (Towards higher cylinder numbers)`

| Algorithm | Trajectory Sequence | Total Head Movement | Average Seek / Request |
| :--- | :--- | :---: | :---: |
| **FCFS** | `53 → 98 → 183 → 37 → 122 → 14 → 124 → 65 → 67` | **640 cyl** | **80.000 cyl** |
| **SSTF** | `53 → 65 → 67 → 37 → 14 → 98 → 122 → 124 → 183` | **236 cyl** | **29.500 cyl** |
| **SCAN** | `53 → 65 → 67 → 98 → 122 → 124 → 183 → 199 → 37 → 14` | **331 cyl** | **41.375 cyl** |
| **LOOK** | `53 → 65 → 67 → 98 → 122 → 124 → 183 → 37 → 14` | **299 cyl** | **37.375 cyl** |
| **C-SCAN** | `53 → 65 → 67 → 98 → 122 → 124 → 183 → 199 → 0 → 14 → 37` | **382 cyl** | **47.750 cyl** |
| **C-LOOK** | `53 → 65 → 67 → 98 → 122 → 124 → 183 → 14 → 37` | **322 cyl** | **40.250 cyl** |

*All results verified via unit test script:* `src/algorithms/__tests__/validate.ts`.

---

## 📁 Architecture & File Layout

```
ia3os/
├── src/
│   ├── algorithms/
│   │   ├── __tests__/
│   │   │   └── validate.ts       # Mathematical verification suite (all 6 algorithms)
│   │   ├── fcfs.ts               # First-Come, First-Served
│   │   ├── sstf.ts               # Shortest Seek Time First
│   │   ├── scan.ts               # SCAN (Elevator)
│   │   ├── look.ts               # LOOK (Adaptive Elevator)
│   │   ├── cscan.ts              # Circular SCAN (C-SCAN)
│   │   ├── clook.ts              # Circular LOOK (C-LOOK)
│   │   └── index.ts              # Unified runner & 6-way comparison logic
│   ├── components/
│   │   ├── AlgorithmGraph.tsx    # Recharts trajectory graph with circular jump markers
│   │   ├── DiskPlatterVisualizer.tsx # Physical hard drive actuator & platter
│   │   ├── ExecutionTable.tsx    # Step-by-step log with CSV/TSV export & jump badges
│   │   ├── InputDashboard.tsx    # Parameter inputs, presets, validation
│   │   ├── InteractiveBackground.tsx # Lightweight 3D wireframe canvas
│   │   ├── MetricsCard.tsx       # Performance metrics & counters
│   │   ├── Navigation.tsx        # Responsive sidebar with all 6 algorithm tabs
│   │   └── PlaybackControls.tsx  # Play, pause, step, speed, loop controls
│   ├── context/
│   │   └── DiskContext.tsx       # Global state management across pages
│   ├── hooks/
│   │   └── usePlayback.ts        # Playback timer lifecycle & step scrubbing
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing page with 6 algorithm showcase cards
│   │   ├── FCFSPage.tsx          # Dedicated FCFS page
│   │   ├── SSTFPage.tsx          # Dedicated SSTF page
│   │   ├── SCANPage.tsx          # Dedicated SCAN page
│   │   ├── LOOKPage.tsx          # Dedicated LOOK page
│   │   ├── CSCANPage.tsx         # Dedicated C-SCAN page
│   │   ├── CLOOKPage.tsx         # Dedicated C-LOOK page
│   │   └── ComparisonPage.tsx    # Unified comparative analytics for all 6 methods
│   ├── types/
│   │   └── disk.ts               # TypeScript interfaces & types
│   ├── App.tsx                   # Main app router & layout
│   ├── index.css                 # Tailwind CSS & glassmorphic styling
│   └── main.tsx                  # React DOM entry point
```

---

## ⌨️ Playback & Keyboard Shortcuts
- `Space`: Play / Pause simulation
- `→` / `←`: Next Step / Previous Step
- `R`: Reset to initial head position
- **Speed Selector**: 0.5x, 1x, 2x speeds
- **Continuous Loop Mode**: Automatic replay for lab presentations
