import type { AlgorithmResult, DiskConfig, ExecutionStep, GraphDataPoint } from '../types/disk';

interface RequestItem {
  id: number;
  track: number;
  originalIndex: number;
}

export function runCLOOK(config: DiskConfig): AlgorithmResult {
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
  let jumpCount = 0;

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

    // 2. Circular Jump: from the highest visited request directly to the lowest pending request (< initialHead)
    const leftItems = remainingItems
      .filter((item) => item.track < initialHead)
      .sort((a, b) => a.track - b.track || a.originalIndex - b.originalIndex);

    let isFirstAfterJump = true;
    for (const item of leftItems) {
      const target = item.track;
      const seekDist = Math.abs(target - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;

      const remIdx = remainingItems.findIndex((r) => r.id === item.id);
      if (remIdx !== -1) remainingItems.splice(remIdx, 1);

      servicedSequence.push(target);
      headSequence.push(target);

      const isJumpStep = isFirstAfterJump;
      if (isJumpStep) {
        jumpCount++;
        isFirstAfterJump = false;
      }

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: target,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: target,
        isBoundary: false,
        isJump: isJumpStep,
        isReturnPath: true,
        direction: 'right',
        description: isJumpStep
          ? `Circular Jump: Arm rapidly resets from cylinder ${currentHead} directly to lowest pending request at cylinder ${target} (seek: ${seekDist} cylinders).`
          : `Post-jump sweep (Right): Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: target,
        seekDistance: seekDist,
        direction: 'right',
        isJump: isJumpStep,
        isReturnPath: true,
        label: isJumpStep ? `Jump to ${target}` : `Track ${target}`,
        servicedTrack: target,
      });

      currentHead = target;
      stepCounter++;
    }
  } else {
    // Heading LEFT (towards lower tracks)
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

    // 2. Circular Jump: from lowest visited request directly to the highest pending request (> initialHead)
    const rightItems = remainingItems
      .filter((item) => item.track > initialHead)
      .sort((a, b) => b.track - a.track || a.originalIndex - b.originalIndex);

    let isFirstAfterJump = true;
    for (const item of rightItems) {
      const target = item.track;
      const seekDist = Math.abs(target - currentHead);
      totalHeadMovement += seekDist;
      if (seekDist > maxSeekDistance) maxSeekDistance = seekDist;

      const remIdx = remainingItems.findIndex((r) => r.id === item.id);
      if (remIdx !== -1) remainingItems.splice(remIdx, 1);

      servicedSequence.push(target);
      headSequence.push(target);

      const isJumpStep = isFirstAfterJump;
      if (isJumpStep) {
        jumpCount++;
        isFirstAfterJump = false;
      }

      const step: ExecutionStep = {
        stepIndex: stepCounter,
        fromTrack: currentHead,
        toTrack: target,
        seekDistance: seekDist,
        totalSeekSoFar: totalHeadMovement,
        remainingQueue: remainingItems.map((r) => r.track),
        servicedTrack: target,
        isBoundary: false,
        isJump: isJumpStep,
        isReturnPath: true,
        direction: 'left',
        description: isJumpStep
          ? `Circular Jump: Arm rapidly resets from cylinder ${currentHead} directly to highest pending request at cylinder ${target} (seek: ${seekDist} cylinders).`
          : `Post-jump sweep (Left): Serviced cylinder ${target} (seek: ${seekDist} cylinders).`,
      };
      steps.push(step);

      graphData.push({
        step: stepCounter,
        track: target,
        seekDistance: seekDist,
        direction: 'left',
        isJump: isJumpStep,
        isReturnPath: true,
        label: isJumpStep ? `Jump to ${target}` : `Track ${target}`,
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
    algorithm: 'C-LOOK',
    name: 'C-LOOK',
    fullName: 'Circular LOOK Disk Scheduling',
    description:
      'Combines the benefits of C-SCAN and LOOK. The head sweeps in one direction up to the last pending request, then jumps directly to the first pending request at the opposite extreme (without touching boundaries), and resumes servicing in the original direction.',
    headSequence,
    seekSequence: headSequence,
    servicedSequence,
    steps,
    graphData,
    totalHeadMovement,
    averageMovement,
    maxSeekDistance,
    boundaryCount: 0,
    jumpCount,
    executionNotes: [
      `Initiated unidirectional sweep in ${scanDirection.toUpperCase()} direction from track ${initialHead}.`,
      `Advanced to outermost requested cylinder (no useless boundary traversal).`,
      `Executed circular jump directly to opposite extreme requested cylinder with seek penalty included.`,
      `Resumed servicing in original direction.`,
      `Total head movement accumulated is ${totalHeadMovement} cylinders.`,
    ],
  };
}
