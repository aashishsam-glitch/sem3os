import type { AlgorithmType, ComparisonSummary, DiskConfig } from '../types/disk';
import { runFCFS } from './fcfs';
import { runSSTF } from './sstf';
import { runSCAN } from './scan';
import { runLOOK } from './look';
import { runCLOOK } from './clook';
import { runCSCAN } from './cscan';

export { runFCFS, runSSTF, runSCAN, runLOOK, runCLOOK, runCSCAN };

export function runAllAlgorithms(config: DiskConfig): ComparisonSummary {
  const fcfs = runFCFS(config);
  const sstf = runSSTF(config);
  const scan = runSCAN(config);
  const look = runLOOK(config);
  const clook = runCLOOK(config);
  const cscan = runCSCAN(config);

  const movements: { algo: AlgorithmType; movement: number }[] = [
    { algo: 'FCFS', movement: fcfs.totalHeadMovement },
    { algo: 'SSTF', movement: sstf.totalHeadMovement },
    { algo: 'SCAN', movement: scan.totalHeadMovement },
    { algo: 'LOOK', movement: look.totalHeadMovement },
    { algo: 'C-LOOK', movement: clook.totalHeadMovement },
    { algo: 'C-SCAN', movement: cscan.totalHeadMovement },
  ];

  movements.sort((a, b) => a.movement - b.movement);
  const bestAlgorithm = movements[0].algo;
  const minMovement = movements[0].movement;
  const maxMovement = movements[movements.length - 1].movement;
  const differenceBetweenBestAndWorst = maxMovement - minMovement;
  const percentageSaved =
    maxMovement > 0
      ? Number((((maxMovement - minMovement) / maxMovement) * 100).toFixed(1))
      : 0;

  return {
    fcfs,
    sstf,
    scan,
    look,
    clook,
    cscan,
    bestAlgorithm,
    minMovement,
    maxMovement,
    differenceBetweenBestAndWorst,
    percentageSaved,
  };
}
