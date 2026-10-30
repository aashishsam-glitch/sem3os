import type { AlgorithmResult, DiskConfig, ExecutionStep, GraphDataPoint } from '../types/disk';

export function runFCFS(config: DiskConfig): AlgorithmResult {
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

  let currentHead = initialHead;
  let totalHeadMovement = 0;
  let maxSeekDistance = 0;
  const remaining = [...requestQueue];

  for (let i = 0; i < requestQueue.length; i++) {
    const target = requestQueue[i];
    const seekDistance = Math.abs(target - currentHead);
    totalHeadMovement += seekDistance;
    if (seekDistance > maxSeekDistance) {
      maxSeekDistance = seekDistance;
    }

    remaining.shift();
    servicedSequence.push(target);
    headSequence.push(target);

    const stepIndex = i + 1;
    const direction = target > currentHead ? 'right' : target < currentHead ? 'left' : undefined;

    const step: ExecutionStep = {
      stepIndex,
      fromTrack: currentHead,
      toTrack: target,
      seekDistance,
      totalSeekSoFar: totalHeadMovement,
      remainingQueue: [...remaining],
      servicedTrack: target,
      isBoundary: false,
      direction,
      description: `Moved from cylinder ${currentHead} to ${target} (distance: ${seekDistance} cylinders).`,
    };
    steps.push(step);

    graphData.push({
      step: stepIndex,
      track: target,
      seekDistance,
      direction,
      label: `Track ${target}`,
      servicedTrack: target,
    });

    currentHead = target;
  }

  const averageMovement =
    requestQueue.length > 0 ? Number((totalHeadMovement / requestQueue.length).toFixed(3)) : 0;

  return {
    algorithm: 'FCFS',
    name: 'First Come First Serve',
    fullName: 'First-Come, First-Served (FCFS)',
    description:
      'Processes I/O track requests strictly in the arrival order without reordering. Simple and fair, but can result in large seek times due to head thrashing across the disk.',
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
      `Serviced all ${requestQueue.length} requests in exact arrival sequence.`,
      `Initial head was positioned at track ${initialHead}.`,
      `Final head position is at track ${currentHead}.`,
      `Total head movement accumulated is ${totalHeadMovement} cylinders.`,
    ],
  };
}
