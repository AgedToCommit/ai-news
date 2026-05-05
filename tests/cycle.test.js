import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickSnapshots } from '../js/cycle.js';

const manifest = {
  schema_version: 1,
  generated_at: '2026-05-04T17:01:00Z',
  snapshots: [
    { id: '2026-05-04-pm', type: 'pm', calendar_date: '2026-05-04' },
    { id: '2026-05-04-am', type: 'am', calendar_date: '2026-05-04' },
    { id: '2026-05-03-pm', type: 'pm', calendar_date: '2026-05-03' }
  ]
};

// Helper: build a Date in EST for a given local-time string
const est = (s) => new Date(`${s}-04:00`); // EDT in May 2026 (UTC-4)

test('1pm EST: top = today pm, bottom = today am, no banner', () => {
  const r = pickSnapshots(est('2026-05-04T13:30:00'), manifest);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, '2026-05-04-am');
  assert.equal(r.banner, null);
});

test('11pm EST: still pm/am with no banner', () => {
  const r = pickSnapshots(est('2026-05-04T23:59:00'), manifest);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, '2026-05-04-am');
  assert.equal(r.banner, null);
});

test('1am EST (after midnight, before 2am): still showing yesterday pm/am as Today', () => {
  // 1am on May 5, but the cycle hasn't transitioned yet — May 4 pm/am still labeled "Today"
  const r = pickSnapshots(est('2026-05-05T01:30:00'), manifest);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, '2026-05-04-am');
  assert.equal(r.banner, null);
});

test('2am EST: top hidden, bottom = newest pm, banner about 7am refresh', () => {
  const r = pickSnapshots(est('2026-05-05T02:30:00'), manifest);
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, '2026-05-04-pm');
  assert.match(r.banner, /morning refresh runs at 7am/i);
});

test('6:59am EST: still in the 2am-7am window', () => {
  const r = pickSnapshots(est('2026-05-05T06:59:00'), manifest);
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, '2026-05-04-pm');
  assert.match(r.banner, /morning refresh runs at 7am/i);
});

test('7am EST when am file exists for today: top = today am, bottom = yesterday pm, banner about 1pm digest', () => {
  // Add a May 5 am snapshot for this test
  const m = {
    ...manifest,
    snapshots: [
      { id: '2026-05-05-am', type: 'am', calendar_date: '2026-05-05' },
      ...manifest.snapshots
    ]
  };
  const r = pickSnapshots(est('2026-05-05T07:30:00'), m);
  assert.equal(r.topId, '2026-05-05-am');
  assert.equal(r.bottomId, '2026-05-04-pm');
  assert.match(r.banner, /afternoon digest runs at 1pm/i);
});

test('7am EST when am file does NOT exist yet: top hidden, bottom = newest pm, banner unchanged from 2am-7am', () => {
  // 7am but no May 5 am file (e.g., 2am run failed) — treat like still in the in-between window
  const r = pickSnapshots(est('2026-05-05T07:30:00'), manifest);
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, '2026-05-04-pm');
  assert.match(r.banner, /morning refresh runs at 7am/i);
});

test('1pm EST after a fresh digest: top = today pm, bottom = today am', () => {
  const m = {
    ...manifest,
    snapshots: [
      { id: '2026-05-05-pm', type: 'pm', calendar_date: '2026-05-05' },
      { id: '2026-05-05-am', type: 'am', calendar_date: '2026-05-05' },
      ...manifest.snapshots
    ]
  };
  const r = pickSnapshots(est('2026-05-05T13:30:00'), m);
  assert.equal(r.topId, '2026-05-05-pm');
  assert.equal(r.bottomId, '2026-05-05-am');
  assert.equal(r.banner, null);
});

test('Empty manifest: both null, no crash', () => {
  const r = pickSnapshots(est('2026-05-04T13:30:00'), { schema_version: 1, snapshots: [] });
  assert.equal(r.topId, null);
  assert.equal(r.bottomId, null);
});

test('Bootstrap state — only one pm snapshot exists: shows it as top, bottom is null', () => {
  const m = { schema_version: 1, snapshots: [{ id: '2026-05-04-pm', type: 'pm', calendar_date: '2026-05-04' }] };
  const r = pickSnapshots(est('2026-05-04T15:00:00'), m);
  assert.equal(r.topId, '2026-05-04-pm');
  assert.equal(r.bottomId, null);
  assert.equal(r.banner, null);
});
