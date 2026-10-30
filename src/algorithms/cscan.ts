import type { AlgorithmResult, DiskConfig, ExecutionStep, GraphDataPoint } from '../types/disk';

interface RequestItem {
  id: number;
  track: number;
  originalIndex: number;
}

export function runCSCAN(config: DiskConfig): AlgorithmResult {
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
  let jumpCount = 0;

  const allItems: RequestItem[] = requestQueue.map((track, idx) => ({
    id: idx,
    track,
    originalIndex: idx,
  }));

  const remainingItems = [...allItems];

  if (scanDirection === 'right') {
    // 1. Forward sweep (Right): requests >= initialHead sorted ascending
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

    // 2. Physical boundary maxTrack (if not already there)
    const hasRequestAtMax = rightItems.some((item) => item.track === maxTrack);
    if (!hasRequestAtMax && currentHead !== maxTrack) {
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
        direction: 'right',
        description: `Reached physical disk upper boundary at cylinder ${maxTrack} (seek: ${seekDist} cylinders).`,
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

    // 3. Circular Jump from maxTrack to opposite boundary minTrack (if remaining requests exist)
    const leftItems = remainingItems
      .filter((item) => item.track < initialHead)
      .sort((a, b) => a.track - b.track || a.originalIndex - b.originalIndex);

    if (leftItems.length > 0) {
      const jumpDist = Math.abs(minTrack - currentHead);
      totalHeadMovement += jumpDist;
      if (jumpDist > maxSeekDistance) maxSeekDistance = jumpDist;
      jumpCount++;
      boundaryCount++;

      headSequence.push(minTrack);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: minTrack,
        seekDistance: jumpDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: null,
        isBoundary: true,
        isJump: true,
        direction: 'right',
        description: `Circular Jump: Arm rapidly resets from cylinder ${currentHead} to opposite boundary cylinder ${minTrack} (seek: ${jumpDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: minTrack,
        seekDistance: jumpDist,
        direction: 'right',
        isBoundary: true,
        isJump: true,
        isReturnPath: true,
        label: `Jump to Min (${minTrack})`,
        servicedTrack: null,
      });

      currentHead = minTrack;
      stepCounter++;

      // 4. Continue servicing in original direction (Right / increasing order) from minTrack
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
          direction: 'right',
          description: `Post-jump sweep (Right): Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
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
  } else {
    // Heading LEFT (towards minTrack)
    // 1. Forward sweep (Left): requests <= initialHead sorted descending
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

    // 2. Physical boundary minTrack (if not already there)
    const hasRequestAtMin = leftItems.some((item) => item.track === minTrack);
    if (!hasRequestAtMin && currentHead !== minTrack) {
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
        direction: 'left',
        description: `Reached physical disk lower boundary at cylinder ${minTrack} (seek: ${seekDist} cylinders).`,
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

    // 3. Circular Jump from minTrack to opposite boundary maxTrack (if remaining requests exist)
    const rightItems = remainingItems
      .filter((item) => item.track > initialHead)
      .sort((a, b) => b.track - a.track || a.originalIndex - b.originalIndex);

    if (rightItems.length > 0) {
      const jumpDist = Math.abs(maxTrack - currentHead);
      totalHeadMovement += jumpDist;
      if (jumpDist > maxSeekDistance) maxSeekDistance = jumpDist;
      jumpCount++;
      boundaryCount++;

      headSequence.push(maxTrack);

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: maxTrack,
        seekDistance: jumpDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: null,
        isBoundary: true,
        isJump: true,
        direction: 'left',
        description: `Circular Jump: Arm rapidly resets from cylinder ${currentHead} to opposite boundary cylinder ${maxTrack} (seek: ${jumpDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: maxTrack,
        seekDistance: jumpDist,
        direction: 'left',
        isBoundary: true,
        isJump: true,
        isReturnPath: true,
        label: `Jump to Max (${maxTrack})`,
        servicedTrack: null,
      });

      currentHead = maxTrack;
      stepCounter++;

      // 4. Continue servicing in original direction (Left / decreasing order) from maxTrack
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
          direction: 'left',
          description: `Post-jump sweep (Left): Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
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
    }
  }

  const averageMovement =
    requestQueue.length > 0
      ? Number((totalHeadMovement / requestQueue.length).toFixed(3))
      : 0;

  return {
    algorithm: 'C-SCAN',
    name: 'C-SCAN',
    fullName: 'Circular SCAN Disk Scheduling',
    description:
      'Provides a more uniform wait time than standard SCAN. The head moves in one direction servicing requests until it hits the physical boundary, then immediately jumps to the opposite physical boundary without servicing requests on the return trip, and resumes servicing in the original direction.',
    headSequence,
    seekSequence: headSequence,
    servicedSequence,
    steps,
    graphData,
    totalHeadMovement,
    averageMovement,
    maxSeekDistance,
    boundaryCount,
    jumpCount,
    executionNotes: [
      `Initiated unidirectional sweep in ${scanDirection.toUpperCase()} direction from track ${initialHead}.`,
      `Traversed to physical boundary (${scanDirection === 'right' ? maxTrack : minTrack}).`,
      `Executed circular jump across full platter to opposite boundary (${scanDirection === 'right' ? minTrack : maxTrack}) with seek penalty included.`,
      `Resumed servicing remaining tracks in original direction.`,
      `Total head movement accumulated is ${totalHeadMovement} cylinders.`,
    ],
  };
}
