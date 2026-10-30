import { runFCFS } from '../fcfs';
import { runSSTF } from '../sstf';
import { runSCAN } from '../scan';
import { runLOOK } from '../look';
import { runCSCAN } from '../cscan';
import { runCLOOK } from '../clook';
import type { DiskConfig } from '../../types/disk';

const exampleConfig: DiskConfig = {
  initialHead: 53,
  requestQueue: [98, 183, 37, 122, 14, 124, 65, 67],
  minTrack: 0,
  maxTrack: 199,
  scanDirection: 'right',
  speed: 'normal',
};

console.log('--- TESTING ALL 6 ALGORITHMS WITH REFERENCE TEST CASE ---');
console.log('Initial Head: 53, Queue: [98, 183, 37, 122, 14, 124, 65, 67], Range: [0, 199], Direction: Right\n');

// 1. FCFS
const fcfsRes = runFCFS(exampleConfig);
console.log('[FCFS Result]');
console.log('Sequence:', fcfsRes.headSequence.join(' -> '));
console.log('Total Head Movement:', fcfsRes.totalHeadMovement, '(Expected: 640)');
console.log('Avg Seek:', fcfsRes.averageMovement, '(Expected: 80)');
if (fcfsRes.totalHeadMovement !== 640 || fcfsRes.averageMovement !== 80) {
  console.error('FAIL: FCFS mismatch!');
} else {
  console.log('PASS: FCFS matches reference.\n');
}

// 2. SSTF
const sstfRes = runSSTF(exampleConfig);
console.log('[SSTF Result]');
console.log('Sequence:', sstfRes.headSequence.join(' -> '));
console.log('Total Head Movement:', sstfRes.totalHeadMovement, '(Expected: 236)');
console.log('Avg Seek:', sstfRes.averageMovement, '(Expected: 29.5)');
if (sstfRes.totalHeadMovement !== 236 || sstfRes.averageMovement !== 29.5) {
  console.error('FAIL: SSTF mismatch!');
} else {
  console.log('PASS: SSTF matches reference.\n');
}

// 3. SCAN (Right)
const scanRes = runSCAN(exampleConfig);
console.log('[SCAN Result]');
console.log('Sequence:', scanRes.headSequence.join(' -> '));
console.log('Total Head Movement:', scanRes.totalHeadMovement, '(Expected: 331)');
console.log('Avg Seek:', scanRes.averageMovement, '(Expected: 41.375)');
if (scanRes.totalHeadMovement !== 331 || scanRes.averageMovement !== 41.375) {
  console.error('FAIL: SCAN mismatch!');
} else {
  console.log('PASS: SCAN matches reference.\n');
}

// 4. LOOK (Right)
const lookRes = runLOOK(exampleConfig);
console.log('[LOOK Result]');
console.log('Sequence:', lookRes.headSequence.join(' -> '));
console.log('Total Head Movement:', lookRes.totalHeadMovement, '(Expected: 299)');
console.log('Avg Seek:', lookRes.averageMovement, '(Expected: 37.375)');
if (lookRes.totalHeadMovement !== 299 || lookRes.averageMovement !== 37.375) {
  console.error('FAIL: LOOK mismatch!');
} else {
  console.log('PASS: LOOK matches reference.\n');
}

// 5. C-SCAN (Right)
const cscanRes = runCSCAN(exampleConfig);
console.log('[C-SCAN Result]');
console.log('Sequence:', cscanRes.headSequence.join(' -> '));
console.log('Total Head Movement:', cscanRes.totalHeadMovement, '(Expected: 382)');
console.log('Avg Seek:', cscanRes.averageMovement, '(Expected: 47.75)');
if (cscanRes.totalHeadMovement !== 382 || cscanRes.averageMovement !== 47.75) {
  console.error('FAIL: C-SCAN mismatch!');
} else {
  console.log('PASS: C-SCAN matches reference.\n');
}

// 6. C-LOOK (Right)
const clookRes = runCLOOK(exampleConfig);
console.log('[C-LOOK Result]');
console.log('Sequence:', clookRes.headSequence.join(' -> '));
console.log('Total Head Movement:', clookRes.totalHeadMovement, '(Expected: 322)');
console.log('Avg Seek:', clookRes.averageMovement, '(Expected: 40.25)');
if (clookRes.totalHeadMovement !== 322 || clookRes.averageMovement !== 40.25) {
  console.error('FAIL: C-LOOK mismatch!');
} else {
  console.log('PASS: C-LOOK matches reference.\n');
}

// Left Direction Tests
console.log('--- TESTING LEFT DIRECTION ---');
const leftConfig: DiskConfig = { ...exampleConfig, scanDirection: 'left' };

const scanLeft = runSCAN(leftConfig);
console.log('SCAN (Left) Total Movement:', scanLeft.totalHeadMovement, '(Expected: 236)');

const lookLeft = runLOOK(leftConfig);
console.log('LOOK (Left) Total Movement:', lookLeft.totalHeadMovement, '(Expected: 208)');
console.log('LOOK (Left) Sequence:', lookLeft.headSequence.join(' -> '));

const cscanLeft = runCSCAN(leftConfig);
console.log('C-SCAN (Left) Total Movement:', cscanLeft.totalHeadMovement, '(Expected: 386)');
console.log('C-SCAN (Left) Sequence:', cscanLeft.headSequence.join(' -> '));

const clookLeft = runCLOOK(leftConfig);
console.log('C-LOOK (Left) Total Movement:', clookLeft.totalHeadMovement, '(Expected: 326)');
console.log('C-LOOK (Left) Sequence:', clookLeft.headSequence.join(' -> '));

console.log('\n--- TESTING EDGE CASES FOR ALL ALGORITHMS ---');

// 1. Empty Queue
const emptyConfig: DiskConfig = {
  initialHead: 50,
  requestQueue: [],
  minTrack: 0,
  maxTrack: 100,
  scanDirection: 'right',
  speed: 'normal',
};
const lookEmpty = runLOOK(emptyConfig);
const cscanEmpty = runCSCAN(emptyConfig);
const clookEmpty = runCLOOK(emptyConfig);
console.log('Empty queue LOOK total:', lookEmpty.totalHeadMovement, 'avg:', lookEmpty.averageMovement);
console.log('Empty queue C-SCAN total:', cscanEmpty.totalHeadMovement, 'avg:', cscanEmpty.averageMovement);
console.log('Empty queue C-LOOK total:', clookEmpty.totalHeadMovement, 'avg:', clookEmpty.averageMovement);

// 2. Duplicate requests
const dupConfig: DiskConfig = {
  initialHead: 50,
  requestQueue: [60, 60, 40, 40],
  minTrack: 0,
  maxTrack: 100,
  scanDirection: 'right',
  speed: 'normal',
};
const lookDup = runLOOK(dupConfig);
const cscanDup = runCSCAN(dupConfig);
const clookDup = runCLOOK(dupConfig);
console.log('LOOK Duplicates Serviced:', lookDup.servicedSequence.length, '(Expected: 4)');
console.log('C-SCAN Duplicates Serviced:', cscanDup.servicedSequence.length, '(Expected: 4)');
console.log('C-LOOK Duplicates Serviced:', clookDup.servicedSequence.length, '(Expected: 4)');

// 3. Request equals initial head
const sameHeadConfig: DiskConfig = {
  initialHead: 50,
  requestQueue: [50, 70, 30],
  minTrack: 0,
  maxTrack: 100,
  scanDirection: 'right',
  speed: 'normal',
};
const lookSame = runLOOK(sameHeadConfig);
console.log('LOOK request on initial head:', lookSame.servicedSequence.join(', '), '(Expected: 50, 70, 30)');

// 4. Head at disk boundary
const boundaryHeadConfig: DiskConfig = {
  initialHead: 0,
  requestQueue: [20, 80],
  minTrack: 0,
  maxTrack: 100,
  scanDirection: 'right',
  speed: 'normal',
};
const lookBoundary = runLOOK(boundaryHeadConfig);
console.log('LOOK head at 0 total movement:', lookBoundary.totalHeadMovement, '(Expected: 80)');

console.log('\n--- ALL TEST CASES RUN SUCCESSFULLY ---');
