import type { AlgorithmResult, DiskConfig, ExecutionStep, GraphDataPoint } from '../types/disk';

interface RequestItem {
  id: number;
  track: number;
  originalIndex: number;
}

export function runSCAN(config: DiskConfig): AlgorithmResult {
  const { initialHead, requestQueue, minTrack, maxTrack, scanDirection } = config;

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
  let boundaryCount = 0;

  // Track remaining requests by unique item
  const allItems: RequestItem[] = requestQueue.map((track, idx) => ({
    id: idx,
    track,
    originalIndex: idx,
  }));

  const remainingItems = [...allItems];

  if (scanDirection === 'right') {
    // Heading RIGHT (towards maxTrack)
    // 1. Forward pass: requests >= currentHead sorted ascending
    const rightItems = remainingItems
      .filter((item) => item.track >= initialHead)
      .sort((a, b) => a.track - b.track || a.originalIndex - b.originalIndex);

    for (const item of rightItems) {
      const target = item.track;
      const seekDist = Math.abs(target - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;

      // Remove from remainingItems
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
        description: `Moving right: Serviced request at cylinder ${target} (seek: ${seekDist} cylinders).`,
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

    // 2. Physical boundary maxTrack (SCAN requirement)
    // Even if no request exists at maxTrack, head travels to maxTrack
    const hasRequestAtBoundary = rightItems.some((item) => item.track === maxTrack);
    if (!hasRequestAtBoundary && currentHead !== maxTrack) {
      const seekDist = Math.abs(maxTrack - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;
      boundaryCount++;

      headSequence.push(maxTrack);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: maxTrack,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: null,
        isBoundary: true,
        isReturnPath: false,
        direction: 'right',
        description: `Reached physical disk upper boundary at cylinder ${maxTrack} (turnaround, seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: maxTrack,
        seekDistance: seekDist,
        direction: 'right',
        isBoundary: true,
        isReturnPath: false,
        label: `Max Boundary (${maxTrack})`,
        servicedTrack: null,
      });

      currentHead = maxTrack;
      stepCounter++;
    }

    // 3. Return pass: remaining requests (< initialHead) sorted descending (from closest to maxTrack downward)
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
        description: `Reversed left: Serviced request at cylinder ${target} (seek: ${seekDist} cylinders).`,
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
    // Heading LEFT (towards minTrack)
    // 1. Forward pass: requests <= currentHead sorted descending
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
        description: `Moving left: Serviced request at cylinder ${target} (seek: ${seekDist} cylinders).`,
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

    // 2. Physical boundary minTrack (SCAN requirement)
    const hasRequestAtBoundary = leftItems.some((item) => item.track === minTrack);
    if (!hasRequestAtBoundary && currentHead !== minTrack) {
      const seekDist = Math.abs(minTrack - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;
      boundaryCount++;

      headSequence.push(minTrack);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: minTrack,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: null,
        isBoundary: true,
        isReturnPath: false,
        direction: 'left',
        description: `Reached physical disk lower boundary at cylinder ${minTrack} (turnaround, seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: minTrack,
        seekDistance: seekDist,
        direction: 'left',
        isBoundary: true,
        isReturnPath: false,
        label: `Min Boundary (${minTrack})`,
        servicedTrack: null,
      });

      currentHead = minTrack;
      stepCounter++;
    }

    // 3. Return pass: remaining requests (> initialHead) sorted ascending (from closest to minTrack upward)
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
        description: `Reversed right: Serviced request at cylinder ${target} (seek: ${seekDist} cylinders).`,
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
    requestQueue.length > 0 ? Number((totalHeadMovement / requestQueue.length).toFixed(3)) : 0;

  return {
    algorithm: 'SCAN',
    name: 'SCAN (Elevator)',
    fullName: 'SCAN Disk Scheduling (Elevator Algorithm)',
    description:
      'The disk arm starts at the current head position, travels in the chosen direction servicing all pending requests until it hits the physical disk boundary, reverses direction, and services remaining requests on the return journey.',
    headSequence,
    seekSequence: headSequence,
    servicedSequence,
    steps,
    graphData,
    totalHeadMovement,
    averageMovement,
    maxSeekDistance,
    boundaryCount,
    executionNotes: [
      `Initiated sweep in ${scanDirection.toUpperCase()} direction from track ${initialHead}.`,
      `Traversed all the way to physical boundary cylinder ${scanDirection === 'right' ? maxTrack : minTrack}.`,
      `Reversed arm direction and serviced remaining queue tracks on return path.`,
      `Total head movement accumulated is ${totalHeadMovement} cylinders (including boundary seek).`,
      `Final head position stopped at track ${currentHead}.`,
    ],
  };
}
