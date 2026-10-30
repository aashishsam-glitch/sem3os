import type { AlgorithmResult, DiskConfig, ExecutionStep, GraphDataPoint } from '../types/disk';

interface RequestItem {
  id: number;
  track: number;
  originalIndex: number;
}

export function runSSTF(config: DiskConfig): AlgorithmResult {
  const { initialHead, requestQueue } = config;
  const steps: ExecutionStep[] = [];
  const headSequence: number[] = [initialHead];
  const servicedSequence: number[] = [];
  const graphData: GraphDataPoint[] = [
    {
      step: 0,
      track: initialHead,
      isInitial: true,
      seekDistance: 0,
      label: `Start (${initialHead})`,
      servicedTrack: null,
    },
  ];

  // Wrap requests with IDs so duplicate tracks can be handled independently and tie-break respects original position
  let pending: RequestItem[] = requestQueue.map((track, idx) => ({
    id: idx,
    track,
    originalIndex: idx,
  }));

  let currentHead = initialHead;
  let totalHeadMovement = 0;
  let maxSeekDistance = 0;
  let stepCounter = 1;

  while (pending.length > 0) {
    // Find item with minimum distance to currentHead
    let bestIndex = 0;
    let minDistance = Math.abs(pending[0].track - currentHead);

    for (let i = 1; i < pending.length; i++) {
      const dist = Math.abs(pending[i].track - currentHead);
      if (dist < minDistance) {
        minDistance = dist;
        bestIndex = i;
      } else if (dist === minDistance) {
        // Deterministic tie-breaker: select request that appeared earlier in the original queue
        if (pending[i].originalIndex < pending[bestIndex].originalIndex) {
          bestIndex = i;
        }
      }
    }

    const selectedItem = pending[bestIndex];
    const target = selectedItem.track;
    const seekDistance = minDistance;

    totalHeadMovement += seekDistance;
    if (seekDistance > maxSeekDistance) {
      maxSeekDistance = seekDistance;
    }

    // Remove selected item from pending
    pending.splice(bestIndex, 1);

    servicedSequence.push(target);
    headSequence.push(target);

    const direction = target > currentHead ? 'right' : target < currentHead ? 'left' : undefined;
    const remainingTracks = pending.map((item) => item.track);

    const step: ExecutionStep = {
      stepIndex: stepCounter,
      fromTrack: currentHead,
      toTrack: target,
      seekDistance,
      totalSeekSoFar: totalHeadMovement,
      remainingQueue: remainingTracks,
      servicedTrack: target,
      isBoundary: false,
      direction,
      description: `Nearest request is cylinder ${target} with seek distance ${seekDistance} cylinders.`,
    };
    steps.push(step);

    graphData.push({
      step: stepCounter,
      track: target,
      seekDistance,
      direction,
      label: `Track ${target}`,
      servicedTrack: target,
    });

    currentHead = target;
    stepCounter++;
  }

  const averageMovement =
    requestQueue.length > 0 ? Number((totalHeadMovement / requestQueue.length).toFixed(3)) : 0;

  return {
    algorithm: 'SSTF',
    name: 'Shortest Seek Time First',
    fullName: 'Shortest Seek Time First (SSTF)',
    description:
      'Greedily selects the pending disk request closest to the current head position. Substantially reduces total head movement compared to FCFS, but may lead to starvation for requests far from the head.',
    headSequence,
    seekSequence: headSequence,
    servicedSequence,
    steps,
    graphData,
    totalHeadMovement,
    averageMovement,
    maxSeekDistance,
    boundaryCount: 0,
    executionNotes: [
      `Greedily evaluated seek distances across pending pool at each step.`,
      `Deterministic tie-breaker applied: earlier queue arrival prioritized on equal distance.`,
      `Total head movement accumulated is ${totalHeadMovement} cylinders.`,
      `Initial head at ${initialHead}, final head resting at track ${currentHead}.`,
    ],
  };
}
