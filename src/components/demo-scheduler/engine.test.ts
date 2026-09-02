import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DATASET,
  NURSES,
  SHIFTS,
  checkSchedule,
  eligibleCandidates,
  generateSchedule,
  neededSlotKind,
  placementViolations,
  restGapHours,
  type Assignment,
} from './engine.ts';

const byId = (id: string) => NURSES.find((n) => n.id === id)!;
const staffNurse = NURSES.find(
  (n) => n.role === 'SN' && !n.inChargeQualified && n.employment === 'full-time' && !n.leaveDays
)!;
const inCharge = NURSES.find((n) => n.inChargeQualified)!;
const assistant = NURSES.find((n) => n.role === 'NA')!;
const contract = NURSES.find((n) => n.employment === 'contract')!;
const onLeave = NURSES.find((n) => n.leaveDays && n.leaveDays.length > 0)!;

test('roster shape: 17 staff, 13 staff nurses, 5 in-charge qualified, 4 assistants', () => {
  assert.equal(NURSES.length, 17);
  assert.equal(NURSES.filter((n) => n.role === 'SN').length, 13);
  assert.equal(NURSES.filter((n) => n.inChargeQualified).length, 5);
  assert.equal(NURSES.filter((n) => n.role === 'NA').length, 4);
  assert.equal(SHIFTS.length, 21);
});

test('generateSchedule fills every seat with zero violations and is deterministic', () => {
  const s = generateSchedule();
  for (const def of SHIFTS)
    assert.equal(neededSlotKind(s, def, DATASET), null, `open seat on day ${def.day} ${def.type}`);
  assert.deepEqual(checkSchedule(s), []);
  assert.deepEqual(generateSchedule(), s);
});

test('rest: evening into next-morning gives 8h and breaks the 12h rule', () => {
  const a: Assignment = { nurseId: staffNurse.id, day: 0, type: 'evening' };
  const b: Assignment = { nurseId: staffNurse.id, day: 1, type: 'morning' };
  assert.equal(restGapHours(a, b), 8);
  const v = placementViolations([a], b);
  assert.ok(
    v.some((x) => x.rule === 'rest12h'),
    JSON.stringify(v)
  );
  assert.ok(v.find((x) => x.rule === 'rest12h')!.message.includes('evening-into-morning'));
});

test('rest: morning then evening next day is a clean 24h gap', () => {
  const a: Assignment = { nurseId: staffNurse.id, day: 0, type: 'morning' };
  const b: Assignment = { nurseId: staffNurse.id, day: 1, type: 'evening' };
  assert.equal(restGapHours(a, b), 24);
  assert.deepEqual(placementViolations([a], b), []);
});

test('same-day double shift is blocked by rest, and overlapping is noOverlap', () => {
  const a: Assignment = { nurseId: staffNurse.id, day: 2, type: 'morning' };
  assert.ok(placementViolations([a], { ...a, type: 'evening' }).some((v) => v.rule === 'rest12h'));
  assert.ok(placementViolations([a], { ...a }).some((v) => v.rule === 'noOverlap'));
});

test('48-hour cap, weekly off and 6-day limit all fire on a seventh day', () => {
  const six: Assignment[] = [0, 1, 2, 3, 4, 5].map((d) => ({ nurseId: staffNurse.id, day: d as 0, type: 'morning' }));
  assert.deepEqual(placementViolations(six.slice(0, 5), six[5]!), []);
  const rules = placementViolations(six, { nurseId: staffNurse.id, day: 6, type: 'morning' }).map((v) => v.rule);
  assert.ok(rules.includes('maxHours48'), rules.join());
  assert.ok(rules.includes('weeklyOff'), rules.join());
  assert.ok(rules.includes('maxConsecutive6'), rules.join());
});

test('weekly off fires on 7 distinct days even when the run is broken', () => {
  const days = [0, 1, 2, 3, 4, 6];
  const six: Assignment[] = days.map((d) => ({ nurseId: staffNurse.id, day: d as 0, type: 'night' }));
  const rules = placementViolations(six, { nurseId: staffNurse.id, day: 5, type: 'night' }).map((v) => v.rule);
  assert.ok(rules.includes('weeklyOff'));
});

test('role fit: an assistant cannot take the in-charge or staff-nurse seat, a nurse cannot take the assistant seat', () => {
  const slot = { day: 0 as const, type: 'morning' as const };
  const forIC = eligibleCandidates([], slot, 'incharge');
  assert.ok(!forIC.find((c) => c.nurse.id === assistant.id)!.eligible);
  assert.ok(!forIC.find((c) => c.nurse.id === staffNurse.id)!.eligible);
  assert.ok(forIC.find((c) => c.nurse.id === inCharge.id)!.eligible);
  const forNA = eligibleCandidates([], slot, 'na');
  assert.ok(!forNA.find((c) => c.nurse.id === inCharge.id)!.eligible);
  assert.ok(forNA.find((c) => c.nurse.id === assistant.id)!.eligible);
});

test('approved leave and contract availability are enforced', () => {
  const leaveDay = onLeave.leaveDays![0]!;
  assert.ok(
    placementViolations([], { nurseId: onLeave.id, day: leaveDay, type: 'morning' }).some(
      (v) => v.rule === 'approvedLeave'
    )
  );
  const offDay = ([0, 1, 2, 3, 4, 5, 6] as const).find((d) => !contract.contractAvailableDays!.includes(d))!;
  assert.ok(
    placementViolations([], { nurseId: contract.id, day: offDay, type: 'morning' }).some(
      (v) => v.rule === 'contractAvailability'
    )
  );
  assert.ok(byId(contract.id).contractAvailableDays!.length > 0);
});

test('eligible candidates are sorted eligible-first with a positive reason list', () => {
  const s = generateSchedule();
  const def = SHIFTS[0]!;
  const removed = s.filter((a) => !(a.day === def.day && a.type === def.type && byId(a.nurseId).role === 'NA'));
  const list = eligibleCandidates(removed, def, 'na');
  const firstIneligible = list.findIndex((c) => !c.eligible);
  const lastEligible = list.map((c) => c.eligible).lastIndexOf(true);
  assert.ok(firstIneligible === -1 || lastEligible < firstIneligible);
  assert.ok(list.find((c) => c.eligible)!.reasons.length >= 2);
});
