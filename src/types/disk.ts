export type ScanDirection = 'left' | 'right';
export type SimulationSpeed = 'slow' | 'normal' | 'fast';

export type AlgorithmType = 'FCFS' | 'SSTF' | 'SCAN' | 'LOOK' | 'C-LOOK' | 'C-SCAN';

export interface DiskConfig {
  initialHead: number;
  requestQueue: number[];
  minTrack: number;
  maxTrack: number;
  scanDirection: ScanDirection;
  speed: SimulationSpeed;
}

export interface RawInputState {
  initialHead: string;
  requestQueue: string;
  minTrack: string;
  maxTrack: string;
  scanDirection: ScanDirection;
  speed: SimulationSpeed;
}

export interface ValidationErrors {
  initialHead?: string;
  requestQueue?: string;
  minTrack?: string;
  maxTrack?: string;
  general?: string;
}

export interface ExecutionStep {
  stepIndex: number;
  fromTrack: number;
  toTrack: number;
  seekDistance: number;
  totalSeekSoFar: number;
  remainingQueue: number[];
  servicedTrack: number | null; // null if boundary turnaround or jump without request
  isBoundary: boolean;
  isJump?: boolean;
  isReturnPath?: boolean;
  direction?: ScanDirection;
  description: string;
}

export interface GraphDataPoint {
  step: number;
  track: number;
  isInitial?: boolean;
  isBoundary?: boolean;
  isJump?: boolean;
  seekDistance?: number;
  direction?: ScanDirection;
  isReturnPath?: boolean;
  label?: string;
  servicedTrack?: number | null;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  name: string;
  fullName: string;
  description: string;
  headSequence: number[];
  seekSequence: number[];
  servicedSequence: number[];
  steps: ExecutionStep[];
  graphData: GraphDataPoint[];
  totalHeadMovement: number;
  averageMovement: number;
  maxSeekDistance: number;
  boundaryCount: number;
  jumpCount?: number;
  executionNotes: string[];
}

export interface ComparisonSummary {
  fcfs: AlgorithmResult;
  sstf: AlgorithmResult;
  scan: AlgorithmResult;
  look: AlgorithmResult;
  clook: AlgorithmResult;
  cscan: AlgorithmResult;
  bestAlgorithm: AlgorithmType;
  minMovement: number;
  maxMovement: number;
  differenceBetweenBestAndWorst: number;
  percentageSaved: number;
}
