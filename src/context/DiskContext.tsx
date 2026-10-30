import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type {
  DiskConfig,
  RawInputState,
  ScanDirection,
  ValidationErrors,
  AlgorithmResult,
  ComparisonSummary,
} from '../types/disk';
import { runFCFS, runSSTF, runSCAN, runLOOK, runCLOOK, runCSCAN, runAllAlgorithms } from '../algorithms';

export type PageTab = 'home' | 'fcfs' | 'sstf' | 'scan' | 'look' | 'clook' | 'cscan' | 'compare';

export interface Preset {
  id: string;
  name: string;
  description: string;
  initialHead: number;
  requestQueue: number[];
  minTrack: number;
  maxTrack: number;
  scanDirection: ScanDirection;
}

export const PRESETS: Preset[] = [
  {
    id: 'textbook',
    name: 'Silberschatz OS Standard',
    description: 'Classic textbook benchmark (Head: 53, 8 requests)',
    initialHead: 53,
    requestQueue: [98, 183, 37, 122, 14, 124, 65, 67],
    minTrack: 0,
    maxTrack: 199,
    scanDirection: 'right',
  },
  {
    id: 'thrashing',
    name: 'Extreme Arm Thrashing',
    description: 'Alternating extremes causing maximum FCFS seek distance',
    initialHead: 100,
    requestQueue: [10, 190, 15, 185, 20, 180, 5, 195],
    minTrack: 0,
    maxTrack: 199,
    scanDirection: 'right',
  },
  {
    id: 'clustered',
    name: 'Localized Clusters',
    description: 'Clustered requests where SSTF excels with minimal seek',
    initialHead: 50,
    requestQueue: [52, 48, 55, 45, 120, 122, 118, 125],
    minTrack: 0,
    maxTrack: 199,
    scanDirection: 'right',
  },
  {
    id: 'boundary',
    name: 'Boundary Heavy SCAN',
    description: 'Requests near outer and inner tracks testing boundaries',
    initialHead: 90,
    requestQueue: [5, 195, 2, 198, 10, 190, 80],
    minTrack: 0,
    maxTrack: 199,
    scanDirection: 'left',
  },
];

interface DiskContextType {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  rawInputs: RawInputState;
  updateRawInput: (field: keyof RawInputState, value: string) => void;
  config: DiskConfig;
  errors: ValidationErrors;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  loadPreset: (presetId: string) => void;
  clearInputs: () => void;
  generateRandomQueue: (count?: number) => void;
  validateInputs: () => boolean;
  fcfsResult: AlgorithmResult;
  sstfResult: AlgorithmResult;
  scanResult: AlgorithmResult;
  lookResult: AlgorithmResult;
  clookResult: AlgorithmResult;
  cscanResult: AlgorithmResult;
  comparisonSummary: ComparisonSummary;
  navigateToSim: (tab: PageTab) => void;
}

const DEFAULT_RAW_INPUTS: RawInputState = {
  initialHead: '53',
  requestQueue: '98, 183, 37, 122, 14, 124, 65, 67',
  minTrack: '0',
  maxTrack: '199',
  scanDirection: 'right',
  speed: 'normal',
};

const DiskContext = createContext<DiskContextType | undefined>(undefined);

export const DiskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<PageTab>('home');
  const [rawInputs, setRawInputs] = useState<RawInputState>(DEFAULT_RAW_INPUTS);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [appliedConfig, setAppliedConfig] = useState<DiskConfig>({
    initialHead: 53,
    requestQueue: [98, 183, 37, 122, 14, 124, 65, 67],
    minTrack: 0,
    maxTrack: 199,
    scanDirection: 'right',
    speed: 'normal',
  });

  const updateRawInput = (field: keyof RawInputState, value: string) => {
    setRawInputs((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = (): boolean => {
    const newErrors: ValidationErrors = {};

    const min = parseInt(rawInputs.minTrack.trim(), 10);
    const max = parseInt(rawInputs.maxTrack.trim(), 10);
    const head = parseInt(rawInputs.initialHead.trim(), 10);

    if (isNaN(min)) {
      newErrors.minTrack = 'Minimum track must be a valid integer.';
    } else if (min < 0) {
      newErrors.minTrack = 'Minimum track cannot be negative.';
    }

    if (isNaN(max)) {
      newErrors.maxTrack = 'Maximum track must be a valid integer.';
    } else if (!isNaN(min) && max <= min) {
      newErrors.maxTrack = `Maximum track must be greater than minimum track (${min}).`;
    }

    if (isNaN(head)) {
      newErrors.initialHead = 'Initial head must be a valid integer.';
    } else if (!isNaN(min) && !isNaN(max)) {
      if (head < min || head > max) {
        newErrors.initialHead = `Initial head position must be within track range [${min}, ${max}].`;
      }
    }

    const queueStr = rawInputs.requestQueue.trim();
    if (!queueStr) {
      newErrors.requestQueue = 'Request queue cannot be empty.';
    } else {
      const tokens = queueStr.split(/[\s,]+/).filter(Boolean);
      const parsedQueue: number[] = [];
      let hasQueueError = false;

      for (let i = 0; i < tokens.length; i++) {
        const val = parseInt(tokens[i], 10);
        if (isNaN(val)) {
          newErrors.requestQueue = `Invalid track token "${tokens[i]}". Must be integers.`;
          hasQueueError = true;
          break;
        }
        if (!isNaN(min) && !isNaN(max) && (val < min || val > max)) {
          newErrors.requestQueue = `Track ${val} is outside valid cylinder range [${min}, ${max}].`;
          hasQueueError = true;
          break;
        }
        parsedQueue.push(val);
      }

      if (!hasQueueError && parsedQueue.length === 0) {
        newErrors.requestQueue = 'Enter at least one track request.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const validQueue = rawInputs.requestQueue
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((t) => parseInt(t, 10));

      setAppliedConfig({
        initialHead: head,
        requestQueue: validQueue,
        minTrack: min,
        maxTrack: max,
        scanDirection: rawInputs.scanDirection,
        speed: rawInputs.speed,
      });
      return true;
    }

    return false;
  };

  // Re-run validation whenever inputs change to keep appliedConfig fresh if valid
  useEffect(() => {
    const min = parseInt(rawInputs.minTrack.trim(), 10);
    const max = parseInt(rawInputs.maxTrack.trim(), 10);
    const head = parseInt(rawInputs.initialHead.trim(), 10);
    const tokens = rawInputs.requestQueue.split(/[\s,]+/).filter(Boolean);

    if (
      !isNaN(min) &&
      !isNaN(max) &&
      min >= 0 &&
      max > min &&
      !isNaN(head) &&
      head >= min &&
      head <= max &&
      tokens.length > 0
    ) {
      const parsed: number[] = [];
      let ok = true;
      for (const t of tokens) {
        const val = parseInt(t, 10);
        if (isNaN(val) || val < min || val > max) {
          ok = false;
          break;
        }
        parsed.push(val);
      }
      if (ok) {
        setAppliedConfig({
          initialHead: head,
          requestQueue: parsed,
          minTrack: min,
          maxTrack: max,
          scanDirection: rawInputs.scanDirection,
          speed: rawInputs.speed,
        });
        setErrors({});
      }
    }
  }, [rawInputs]);

  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[0];
    setRawInputs({
      initialHead: String(preset.initialHead),
      requestQueue: preset.requestQueue.join(', '),
      minTrack: String(preset.minTrack),
      maxTrack: String(preset.maxTrack),
      scanDirection: preset.scanDirection,
      speed: rawInputs.speed,
    });
    setAppliedConfig({
      initialHead: preset.initialHead,
      requestQueue: preset.requestQueue,
      minTrack: preset.minTrack,
      maxTrack: preset.maxTrack,
      scanDirection: preset.scanDirection,
      speed: rawInputs.speed,
    });
    setErrors({});
  };

  const clearInputs = () => {
    setRawInputs({
      initialHead: '',
      requestQueue: '',
      minTrack: '0',
      maxTrack: '199',
      scanDirection: 'right',
      speed: rawInputs.speed,
    });
    setErrors({
      initialHead: 'Please enter an initial head position.',
      requestQueue: 'Please enter track requests.',
    });
  };

  const generateRandomQueue = (count = 8) => {
    const min = parseInt(rawInputs.minTrack, 10) || 0;
    const max = parseInt(rawInputs.maxTrack, 10) || 199;
    const randomQueue: number[] = [];
    for (let i = 0; i < count; i++) {
      randomQueue.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    const randHead = Math.floor(Math.random() * (max - min + 1)) + min;
    setRawInputs((prev) => ({
      ...prev,
      initialHead: String(randHead),
      requestQueue: randomQueue.join(', '),
    }));
  };

  const navigateToSim = (tab: PageTab) => {
    if (validateInputs()) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fcfsResult = useMemo(() => runFCFS(appliedConfig), [appliedConfig]);
  const sstfResult = useMemo(() => runSSTF(appliedConfig), [appliedConfig]);
  const scanResult = useMemo(() => runSCAN(appliedConfig), [appliedConfig]);
  const lookResult = useMemo(() => runLOOK(appliedConfig), [appliedConfig]);
  const clookResult = useMemo(() => runCLOOK(appliedConfig), [appliedConfig]);
  const cscanResult = useMemo(() => runCSCAN(appliedConfig), [appliedConfig]);
  const comparisonSummary = useMemo(() => runAllAlgorithms(appliedConfig), [appliedConfig]);

  return (
    <DiskContext.Provider
      value={{
        activeTab,
        setActiveTab,
        rawInputs,
        updateRawInput,
        config: appliedConfig,
        errors,
        reducedMotion,
        setReducedMotion,
        loadPreset,
        clearInputs,
        generateRandomQueue,
        validateInputs,
        fcfsResult,
        sstfResult,
        scanResult,
        lookResult,
        clookResult,
        cscanResult,
        comparisonSummary,
        navigateToSim,
      }}
    >
      {children}
    </DiskContext.Provider>
  );
};

export const useDisk = () => {
  const context = useContext(DiskContext);
  if (!context) {
    throw new Error('useDisk must be used within a DiskProvider');
  }
  return context;
};
