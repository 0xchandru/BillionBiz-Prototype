const fs = require('fs');
const path = require('path');
const { parseCSV, stringifyCSV } = require('./csvUtils');

const tasksPath = path.resolve('management/tasks.csv');
const rawCSV = fs.readFileSync(tasksPath, 'utf8');
const rows = parseCSV(rawCSV);

const header = rows[0];
const idIdx = header.indexOf('task_id');
const statusIdx = header.indexOf('status');
const updatedIdx = header.indexOf('updated_at');
const evidenceIdx = header.indexOf('evidence');

const taskUpdates = {
  'T-001': { status: 'DONE', evidence: 'audit-and-gap-report-v2.3.md Section 1-2' },
  'T-002': { status: 'DONE', evidence: 'audit-and-gap-report-v2.3.md Section 4' },
  'T-009': { status: 'DONE', evidence: 'audit-and-gap-report-v2.3.md; onlineStore.ts' },
  'T-010': { status: 'DONE', evidence: 'onlineStore.ts; storefront.router.ts' },
  'T-011': { status: 'DONE', evidence: 'TC-STORE-004; TC-STORE-005 in v2_storefront_runtime.test.ts' },
  'T-012': { status: 'DONE', evidence: 'v2_storefront_runtime.test.ts; StorefrontPage.tsx' },
  'T-013': { status: 'DONE', evidence: 'onlineStore.ts non-destructive migration bridge' },
  'T-058': { status: 'DONE', evidence: 'Dashboard.tsx; TC-DASH-001 in v2_realtime_and_release_gate.test.ts' },
  'T-059': { status: 'DONE', evidence: 'realtimeGateway.ts; useRealtime.ts; Header.tsx' },
  'T-062': { status: 'DONE', evidence: 'scripts/refine_requirements.js; 125/125 rows refined in requirements.csv' },
  'T-065': { status: 'DONE', evidence: 'v2_realtime_and_release_gate.test.ts; useRealtime.ts' },
  'V23-T001': { status: 'DONE', evidence: 'audit-and-gap-report-v2.3.md Section 2' },
  'V23-T002': { status: 'DONE', evidence: 'audit-and-gap-report-v2.3.md Section 1' },
  'V23-T003': { status: 'DONE', evidence: 'HostDispatcher.tsx; StaffPortalPage.tsx; OpsPortalPage.tsx; POSCounters.tsx; People.tsx' },
  'V23-T004': { status: 'DONE', evidence: 'crypto.ts; 004_integration_connections.sql; v2_encrypted_connections.test.ts' },
  'V23-T005': { status: 'DONE', evidence: 'extensions.router.ts; Extensions.tsx; v2_encrypted_connections.test.ts' },
  'V23-T006': { status: 'DONE', evidence: 'audit-and-gap-report-v2.3.md Section 3' },
  'V23-T007': { status: 'DONE', evidence: 'version.ts; onlineStore.ts; seed.ts non-destructive guarantees' },
  'V23-T008': { status: 'DONE', evidence: 'storefront.router.ts; StorefrontPage.tsx; v2_storefront_runtime.test.ts' },
  'V23-T009': { status: 'DONE', evidence: 'onlineStore.ts; siteStore.ts migration bridge' },
  'V23-T010': { status: 'DONE', evidence: 'Sidebar.tsx; Dashboard.tsx; onlineStore.ts zero sitestore dependencies' },
  'V23-T011': { status: 'DONE', evidence: 'Dashboard.tsx honest zero states; TC-DASH-001 in v2_realtime_and_release_gate.test.ts' },
  'V23-T012': { status: 'DONE', evidence: 'realtimeGateway.ts; useRealtime.ts; TC-RT-001..003' },
  'V23-T013': { status: 'DONE', evidence: 'audit-and-gap-report-v2.3.md Section 5' },
  'V23-T014': { status: 'DONE', evidence: 'v2_realtime_and_release_gate.test.ts; v2_storefront_runtime.test.ts; v2_encrypted_connections.test.ts' }
};

const now = '2026-11-02T21:05:00+05:30';
let updatedCount = 0;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const taskId = row[idIdx];
  if (taskUpdates[taskId]) {
    row[statusIdx] = taskUpdates[taskId].status;
    row[evidenceIdx] = taskUpdates[taskId].evidence;
    row[updatedIdx] = now;
    updatedCount++;
  }
}

fs.writeFileSync(tasksPath, stringifyCSV(rows), 'utf8');
console.log(`Updated ${updatedCount} tasks in ${tasksPath}`);

