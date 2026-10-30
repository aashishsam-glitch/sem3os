import type { AlgorithmResult, DiskConfig, ExecutionStep, GraphDataPoint } from '../types/disk';

interface RequestItem {
  id: number;
  track: number;
  originalIndex: number;
}

export function runLOOK(config: DiskConfig): AlgorithmResult {
  const { initialHead, requestQueue, scanDirection } = config;

  const steps: ExecutionStep[] = [];
  const headSequence: number[] = [initialHead];
  const servicedSequence: number[] = [];
  const graphData: GraphDataPoint[] = [
    {
      step: 0,
      track: initialHead,
      isInitial: true,
      seekDistance: 0,
      direction: scanDirection,
      isReturnPath: false,
      label: `Start (${initialHead})`,
      servicedTrack: null,
    },
  ];

  let currentHead = initialHead;
  let totalHeadMovement = 0;
  let maxSeekDistance = 0;
  let stepCounter = 1;

  // Track remaining requests by unique item
  const allItems: RequestItem[] = requestQueue.map((track, idx) => ({
    id: idx,
    track,
    originalIndex: idx,
  }));

  const remainingItems = [...allItems];

  if (scanDirection === 'right') {
    // 1. Forward sweep: requests >= initialHead sorted ascending
    const rightItems = remainingItems
      .filter((item) => item.track >= initialHead)
      .sort((a, b) => a.track - b.track || a.originalIndex - b.originalIndex);

    for (const item of rightItems) {
      const target = item.track;
      const seekDist = Math.abs(target - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;

      const remIdx = remainingItems.findIndex((r) => r.id === item.id);
      if (remIdx !== -1) remainingItems.splice(remIdx, 1);

      servicedSequence.push(target);
      headSequence.push(target);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: target,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: target,
        isBoundary: false,
        isReturnPath: false,
        direction: 'right',
        description: `Moving right: Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: target,
        seekDistance: seekDist,
        direction: 'right',
        isReturnPath: false,
        label: `Track ${target}`,
        servicedTrack: target,
      });

      currentHead = target;
      stepCounter++;
    }

    // 2. Reverse at the last pending request (no boundary traversal!)
    // Return sweep: remaining requests (< initialHead) sorted descending
    const leftItems = remainingItems
      .filter((item) => item.track < initialHead)
      .sort((a, b) => b.track - a.track || a.originalIndex - b.originalIndex);

    for (const item of leftItems) {
      const target = item.track;
      const seekDist = Math.abs(target - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;

      const remIdx = remainingItems.findIndex((r) => r.id === item.id);
      if (remIdx !== -1) remainingItems.splice(remIdx, 1);

      servicedSequence.push(target);
      headSequence.push(target);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: target,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: target,
        isBoundary: false,
        isReturnPath: true,
        direction: 'left',
        description: `Reversed left at track ${steps[steps.length - 1]?.toTrack ?? currentHead}: Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: target,
        seekDistance: seekDist,
        direction: 'left',
        isReturnPath: true,
        label: `Track ${target}`,
        servicedTrack: target,
      });

      currentHead = target;
      stepCounter++;
    }
  } else {
    // 1. Forward sweep: requests <= initialHead sorted descending
    const leftItems = remainingItems
      .filter((item) => item.track <= initialHead)
      .sort((a, b) => b.track - a.track || a.originalIndex - b.originalIndex);

    for (const item of leftItems) {
      const target = item.track;
      const seekDist = Math.abs(target - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;

      const remIdx = remainingItems.findIndex((r) => r.id === item.id);
      if (remIdx !== -1) remainingItems.splice(remIdx, 1);

      servicedSequence.push(target);
      headSequence.push(target);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: target,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: target,
        isBoundary: false,
        isReturnPath: false,
        direction: 'left',
        description: `Moving left: Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: target,
        seekDistance: seekDist,
        direction: 'left',
        isReturnPath: false,
        label: `Track ${target}`,
        servicedTrack: target,
      });

      currentHead = target;
      stepCounter++;
    }

    // 2. Reverse at the last pending request (no boundary traversal!)
    // Return sweep: remaining requests (> initialHead) sorted ascending
    const rightItems = remainingItems
      .filter((item) => item.track > initialHead)
      .sort((a, b) => a.track - b.track || a.originalIndex - b.originalIndex);

    for (const item of rightItems) {
      const target = item.track;
      const seekDist = Math.abs(target - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;

      const remIdx = remainingItems.findIndex((r) => r.id === item.id);
      if (remIdx !== -1) remainingItems.splice(remIdx, 1);

      servicedSequence.push(target);
      headSequence.push(target);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: target,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: target,
        isBoundary: false,
        isReturnPath: true,
        direction: 'right',
        description: `Reversed right at track ${steps[steps.length - 1]?.toTrack ?? currentHead}: Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: target,
        seekDistance: seekDist,
        direction: 'right',
        isReturnPath: true,
        label: `Track ${target}`,
        servicedTrack: target,
      });

      currentHead = target;
      stepCounter++;
    }
  }

  const averageMovement =
    requestQueue.length > 0
      ? Number((totalHeadMovement / requestQueue.length).toFixed(3))
      : 0;

  return {
    algorithm: 'LOOK',
    name: 'LOOK',
    fullName: 'LOOK Disk Scheduling',
    description:
      'Similar to SCAN, but the head only travels as far as the final pending request in each direction before reversing, rather than continuing all the way to physical boundaries (0 or 199). Eliminates useless boundary seek overhead.',
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
      `Initiated arm sweep in ${scanDirection.toUpperCase()} direction from track ${initialHead}.`,
      `Reversed arm direction immediately upon servicing the outermost pending request (no boundary seek).`,
      `Total head movement accumulated is ${totalHeadMovement} cylinders.`,
      `Final head position stopped at track ${currentHead}.`,
    ],
  };
}
