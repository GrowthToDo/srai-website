/**
 * SimpleRosterAI — interactive demo rostering engine.
 *
 * Pure, dependency-free, deterministic. No DOM, no network, no randomness beyond
 * a fixed seed. Models one ward of an Indian hospital on three 8-hour shifts
 * (morning 07:00–15:00, evening 15:00–23:00, night 23:00–07:00) with the rules a
 * CNO actually enforces: an in-charge on every shift, the right skill mix,
 * 12 hours rest, a 48-hour week, one weekly off, no seventh consecutive day.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type ShiftType = 'morning' | 'evening' | 'night';
/** 0 = Monday … 6 = Sunday */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Employment = 'full-time' | 'contract';
/** SN = Staff Nurse (GNM/BSc), NA = Nursing Assistant */
export type Role = 'SN' | 'NA';
/** The kind of seat on a shift: the in-charge, a staff nurse, or a nursing assistant. */
export type SlotKind = 'incharge' | 'sn' | 'na';

export interface Nurse {
  id: string;
  name: string;
  role: Role;
  /** senior staff nurses only: may hold the in-charge seat */
  inChargeQualified: boolean;
  employment: Employment;
  /** approved-leave day indices (never rostered on these) */
  leaveDays?: DayIndex[];
  /** for contract staff: the only day indices they are available */
  contractAvailableDays?: DayIndex[];
}

export interface ShiftDef {
  day: DayIndex;
  type: ShiftType;
  /** in-charge seats (always 1) */
  incharge: number;
  /** additional staff-nurse seats */
  sn: number;
  /** nursing-assistant seats */
  na: number;
  /** total headcount = incharge + sn + na */
  required: number;
}

export interface Assignment {
  nurseId: string;
  day: DayIndex;
  type: ShiftType;
}

export type Schedule = Assignment[];

export type RuleId =
  | 'rest12h'
  | 'maxConsecutive6'
  | 'maxHours48'
  | 'weeklyOff'
  | 'noOverlap'
  | 'inchargeCoverage'
  | 'snCoverage'
  | 'naCoverage'
  | 'approvedLeave'
  | 'contractAvailability';

export interface Violation {
  rule: RuleId;
  nurseId?: string;
  day?: DayIndex;
  type?: ShiftType;
  /** plain-English, visitor-facing explanation */
  message: string;
}

export interface Candidate {
  nurse: Nurse;
  eligible: boolean;
  already: boolean;
  violations: Violation[];
  reasons: string[];
  score: number;
}

export interface Dataset {
  nurses: Nurse[];
  shifts: ShiftDef[];
}

// ── Constants and fixed, fictional dataset ──────────────────────────────────

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const SHIFT_TYPES: readonly ShiftType[] = ['morning', 'evening', 'night'];
export const SHIFT_LABEL: Record<ShiftType, string> = { morning: 'Morning', evening: 'Evening', night: 'Night' };
export const SHIFT_WINDOW_LABEL: Record<ShiftType, string> = {
  morning: '07:00–15:00',
  evening: '15:00–23:00',
  night: '23:00–07:00',
};
export const SHIFT_HOURS = 8;
export const MAX_WEEK_HOURS = 48;
export const MIN_REST_HOURS = 12;
export const MAX_CONSECUTIVE_DAYS = 6;
export const SEED = 20260902;

function sn(
  id: string,
  name: string,
  inCharge = false,
  employment: Employment = 'full-time',
  extra: Partial<Nurse> = {}
): Nurse {
  return { id, name, role: 'SN', inChargeQualified: inCharge, employment, ...extra };
}
function na(id: string, name: string): Nurse {
  return { id, name, role: 'NA', inChargeQualified: false, employment: 'full-time' };
}

export const NURSES: Nurse[] = [
  // Senior staff nurses, in-charge qualified (5)
  sn('n1', 'Anjali Menon', true),
  sn('n2', 'Priya Nair', true),
  sn('n3', 'Rekha Sharma', true),
  sn('n4', 'Joseph Thomas', true),
  sn('n5', 'Sunita Patil', true),
  // Staff nurses (8)
  sn('n6', 'Deepa Krishnan'),
  sn('n7', 'Meena Iyer'),
  sn('n8', 'Ritu Verma'),
  sn('n9', 'Arun Pillai'),
  sn('n10', 'Kavitha Reddy'),
  sn('n11', 'Sneha Joshi'),
  sn('n12', 'Lakshmi Das', false, 'contract', { contractAvailableDays: [5, 6] }), // contract: weekends only
  sn('n13', 'Neha Gupta', false, 'full-time', { leaveDays: [2, 3] }), // approved leave Wed–Thu
  // Nursing assistants (4)
  na('a1', 'Ramesh Kumar'),
  na('a2', 'Geeta Yadav'),
  na('a3', 'Suresh Babu'),
  na('a4', 'Pooja Singh'),
];

/**
 * Morning = 1 in-charge + 2 staff nurses + 1 assistant (4).
 * Evening = 1 in-charge + 2 staff nurses + 1 assistant (4).
 * Night   = 1 in-charge + 1 staff nurse  + 1 assistant (3).
 * 11 seats a day, 77 a week, staffed by 17 people on at most 6 duties each.
 */
function mkShift(day: DayIndex, type: ShiftType, incharge: number, snSeats: number, naSeats: number): ShiftDef {
  return { day, type, incharge, sn: snSeats, na: naSeats, required: incharge + snSeats + naSeats };
}
export const SHIFTS: ShiftDef[] = ([0, 1, 2, 3, 4, 5, 6] as DayIndex[]).flatMap((day) => [
  mkShift(day, 'morning', 1, 2, 1),
  mkShift(day, 'evening', 1, 2, 1),
  mkShift(day, 'night', 1, 1, 1),
]);

export const DATASET: Dataset = { nurses: NURSES, shifts: SHIFTS };

/** Display credential: Sr SN for in-charge qualified, SN, NA. */
export function designation(nurse: Nurse): string {
  if (nurse.role === 'NA') return 'NA';
  return nurse.inChargeQualified ? 'Sr SN' : 'SN';
}

// ── Time helpers (absolute hours from Monday 00:00) ─────────────────────────

const SHIFT_START: Record<ShiftType, number> = { morning: 7, evening: 15, night: 23 };

export function shiftWindow(day: DayIndex, type: ShiftType): { start: number; end: number } {
  const start = day * 24 + SHIFT_START[type];
  return { start, end: start + SHIFT_HOURS };
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Rest hours between two shifts. Returns -1 if they overlap. Touching shifts = 0h. */
export function restGapHours(a: Assignment, b: Assignment): number {
  const wa = shiftWindow(a.day, a.type);
  const wb = shiftWindow(b.day, b.type);
  if (overlaps(wa, wb)) return -1;
  return wa.end <= wb.start ? wb.start - wa.end : wa.start - wb.end;
}

export function longestConsecutiveRun(days: number[]): number {
  const uniq = [...new Set(days)].sort((x, y) => x - y);
  let best = 0;
  let run = 0;
  let prev = Number.NaN;
  for (const d of uniq) {
    run = d === prev + 1 ? run + 1 : 1;
    prev = d;
    if (run > best) best = run;
  }
  return best;
}

export function nurseHoursInWeek(schedule: Schedule, nurseId: string): number {
  return schedule.filter((a) => a.nurseId === nurseId).length * SHIFT_HOURS;
}

/** Max hours in any 7-consecutive-day window containing `pivotDay`. */
function maxRolling7Hours(workedDays: number[], pivotDay: number): number {
  let max = 0;
  for (let start = pivotDay - 6; start <= pivotDay; start++) {
    const count = workedDays.filter((d) => d >= start && d <= start + 6).length;
    max = Math.max(max, count * SHIFT_HOURS);
  }
  return max;
}

// ── Roles ───────────────────────────────────────────────────────────────────

export function roleFits(nurse: Nurse, kind: SlotKind): boolean {
  if (kind === 'incharge') return nurse.role === 'SN' && nurse.inChargeQualified;
  if (kind === 'sn') return nurse.role === 'SN';
  return nurse.role === 'NA';
}

function roleFitViolation(nurse: Nurse, kind: SlotKind, day: DayIndex, type: ShiftType): Violation | null {
  if (roleFits(nurse, kind)) return null;
  const at = { nurseId: nurse.id, day, type };
  if (kind === 'incharge') {
    const message =
      nurse.role !== 'SN'
        ? `${nurse.name} is a nursing assistant — the in-charge must be a senior staff nurse.`
        : `${nurse.name} is not in-charge qualified — this seat needs a senior staff nurse.`;
    return { rule: 'inchargeCoverage', ...at, message };
  }
  if (kind === 'sn') {
    return { rule: 'snCoverage', ...at, message: `${nurse.name} is a nursing assistant — this is a staff-nurse seat.` };
  }
  return {
    rule: 'naCoverage',
    ...at,
    message: `${nurse.name} is a staff nurse — this seat is for a nursing assistant.`,
  };
}

function countOnShift(schedule: Schedule, day: DayIndex, type: ShiftType, ds: Dataset) {
  const here = schedule.filter((a) => a.day === day && a.type === type);
  let incharge = 0;
  let snCount = 0;
  let naCount = 0;
  for (const a of here) {
    const n = ds.nurses.find((nn) => nn.id === a.nurseId);
    if (!n) continue;
    if (n.role === 'SN') {
      snCount += 1;
      if (n.inChargeQualified) incharge += 1;
    } else {
      naCount += 1;
    }
  }
  return { incharge, sn: snCount, na: naCount, total: here.length };
}

/** The next unfilled seat kind on a shift (incharge → sn → na), or null when fully staffed. */
export function neededSlotKind(schedule: Schedule, def: ShiftDef, ds: Dataset = DATASET): SlotKind | null {
  const c = countOnShift(schedule, def.day, def.type, ds);
  if (c.incharge < def.incharge) return 'incharge';
  if (c.sn < def.incharge + def.sn) return 'sn';
  if (c.na < def.na) return 'na';
  return null;
}

// ── Hard rules — placement-level ────────────────────────────────────────────

export function placementViolations(schedule: Schedule, cand: Assignment, ds: Dataset = DATASET): Violation[] {
  const v: Violation[] = [];
  const nurse = ds.nurses.find((n) => n.id === cand.nurseId);
  if (!nurse) return v;
  const name = nurse.name;
  const dayName = DAY_NAMES[cand.day];
  const at = { nurseId: nurse.id, day: cand.day, type: cand.type };

  if (nurse.leaveDays?.includes(cand.day)) {
    v.push({ rule: 'approvedLeave', ...at, message: `${name} is on approved leave on ${dayName}.` });
  }
  if (nurse.employment === 'contract' && !(nurse.contractAvailableDays ?? []).includes(cand.day)) {
    v.push({
      rule: 'contractAvailability',
      ...at,
      message: `${name} is a contract nurse and is not available on ${dayName}.`,
    });
  }

  const others = schedule.filter((a) => a.nurseId === cand.nurseId);
  let overlapFlagged = false;
  let restFlagged = false;
  for (const o of others) {
    const gap = restGapHours(o, cand);
    if (gap < 0 && !overlapFlagged) {
      v.push({ rule: 'noOverlap', ...at, message: `${name} is already on another shift at that time.` });
      overlapFlagged = true;
    } else if (gap >= 0 && gap < MIN_REST_HOURS && !restFlagged) {
      const earlier = shiftWindow(o.day, o.type).start < shiftWindow(cand.day, cand.type).start ? o : cand;
      const later = earlier === o ? cand : o;
      const turnaround = earlier.type === 'evening' && later.type === 'morning' && later.day === earlier.day + 1;
      v.push({
        rule: 'rest12h',
        ...at,
        message: turnaround
          ? `${name} would do an evening-into-morning turnaround — only ${gap}h rest, under the 12-hour minimum.`
          : `${name} would get only ${gap}h rest between shifts — under the 12-hour minimum.`,
      });
      restFlagged = true;
    }
  }

  const workedDays = [...others.map((o) => o.day), cand.day];
  const run = longestConsecutiveRun(workedDays);
  if (run > MAX_CONSECUTIVE_DAYS) {
    v.push({
      rule: 'maxConsecutive6',
      ...at,
      message: `${name} would be on duty ${run} days in a row — over the ${MAX_CONSECUTIVE_DAYS}-day limit.`,
    });
  }

  const hours = maxRolling7Hours(workedDays, cand.day);
  if (hours > MAX_WEEK_HOURS) {
    v.push({ rule: 'maxHours48', ...at, message: `${name} would reach ${hours}h this week — over the 48-hour limit.` });
  }

  if (new Set(workedDays).size > 6) {
    v.push({
      rule: 'weeklyOff',
      ...at,
      message: `${name} would have no weekly off — every nurse gets one day off in seven.`,
    });
  }

  return v;
}

// ── Whole-schedule validation ───────────────────────────────────────────────

export function checkSchedule(schedule: Schedule, ds: Dataset = DATASET): Violation[] {
  const out: Violation[] = [];
  for (const asg of schedule) {
    const rest = schedule.filter((x) => x !== asg);
    out.push(...placementViolations(rest, asg, ds));
  }
  for (const shift of ds.shifts) {
    const c = countOnShift(schedule, shift.day, shift.type, ds);
    const where = `${DAY_NAMES[shift.day]} ${shift.type} shift`;
    if (c.incharge < shift.incharge) {
      out.push({
        rule: 'inchargeCoverage',
        day: shift.day,
        type: shift.type,
        message: `${where} has no in-charge — every shift needs a senior staff nurse in charge.`,
      });
    }
    if (c.sn < shift.incharge + shift.sn) {
      out.push({
        rule: 'snCoverage',
        day: shift.day,
        type: shift.type,
        message: `${where} is short ${shift.incharge + shift.sn - c.sn} staff nurse(s).`,
      });
    }
    if (c.na < shift.na) {
      out.push({
        rule: 'naCoverage',
        day: shift.day,
        type: shift.type,
        message: `${where} needs a nursing assistant.`,
      });
    }
  }
  return out;
}

// ── Soft preferences + deterministic jitter ─────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function jitterFor(nurseId: string, seed: number): number {
  return mulberry32((seed ^ hashStr(nurseId)) >>> 0)();
}

const isWeekendDay = (d: number): boolean => d === 5 || d === 6;

function scoreFor(nurse: Nurse, schedule: Schedule, slot: { day: DayIndex; type: ShiftType }, seed: number): number {
  const hours = nurseHoursInWeek(schedule, nurse.id);
  let s = 1000 - hours * 5;
  const worksDay = (d: number) => schedule.some((a) => a.nurseId === nurse.id && a.day === d);
  if (worksDay(slot.day - 1) || worksDay(slot.day + 1)) s -= 8;
  if (isWeekendDay(slot.day) && schedule.some((a) => a.nurseId === nurse.id && isWeekendDay(a.day))) s -= 15;
  if (slot.type === 'night' && schedule.some((a) => a.nurseId === nurse.id && a.type === 'night')) s -= 12; // night rotation fairness
  s += jitterFor(nurse.id, seed) * 4;
  return s;
}

function positiveReasons(nurse: Nurse, schedule: Schedule, slot: { day: DayIndex; type: ShiftType }): string[] {
  const hours = nurseHoursInWeek(schedule, nurse.id);
  const reasons: string[] = [designation(nurse)];
  if (nurse.inChargeQualified) reasons.push('in-charge qualified');
  reasons.push(`${hours}h so far this week`);
  const others = schedule.filter((a) => a.nurseId === nurse.id);
  if (others.length) {
    const gaps = others
      .map((o) => restGapHours(o, { nurseId: nurse.id, day: slot.day, type: slot.type }))
      .filter((g) => g >= 0);
    if (gaps.length) reasons.push(`${Math.min(...gaps)}h rest ✓`);
  }
  return reasons;
}

// ── The picker ──────────────────────────────────────────────────────────────

export function eligibleCandidates(
  schedule: Schedule,
  slot: { day: DayIndex; type: ShiftType },
  kind: SlotKind,
  ds: Dataset = DATASET,
  seed: number = SEED
): Candidate[] {
  const onShift = new Set(schedule.filter((a) => a.day === slot.day && a.type === slot.type).map((a) => a.nurseId));
  const list: Candidate[] = ds.nurses.map((nurse) => {
    const already = onShift.has(nurse.id);
    const cand: Assignment = { nurseId: nurse.id, day: slot.day, type: slot.type };
    let violations: Violation[] = [];
    if (!already) {
      const rf = roleFitViolation(nurse, kind, slot.day, slot.type);
      violations = [...(rf ? [rf] : []), ...placementViolations(schedule, cand, ds)];
    }
    const eligible = !already && violations.length === 0;
    return {
      nurse,
      eligible,
      already,
      violations,
      reasons: eligible ? positiveReasons(nurse, schedule, slot) : [],
      score: scoreFor(nurse, schedule, slot, seed),
    };
  });
  list.sort((x, y) => {
    if (x.eligible !== y.eligible) return x.eligible ? -1 : 1;
    if (y.score !== x.score) return y.score - x.score;
    return x.nurse.id < y.nurse.id ? -1 : 1;
  });
  return list;
}

// ── Deterministic generation ────────────────────────────────────────────────

export function generateSchedule(seed: number = SEED, ds: Dataset = DATASET): Schedule {
  const schedule: Schedule = [];
  const onShift = (day: DayIndex, type: ShiftType) =>
    new Set(schedule.filter((a) => a.day === day && a.type === type).map((a) => a.nurseId));

  for (const shift of ds.shifts) {
    const kinds: SlotKind[] = ['incharge', 'sn', 'na'];
    for (const kind of kinds) {
      const target = kind === 'incharge' ? shift.incharge : kind === 'sn' ? shift.incharge + shift.sn : shift.na;
      for (;;) {
        const c = countOnShift(schedule, shift.day, shift.type, ds);
        const have = kind === 'incharge' ? c.incharge : kind === 'sn' ? c.sn : c.na;
        if (have >= target) break;
        const here = onShift(shift.day, shift.type);
        let cands = eligibleCandidates(schedule, shift, kind, ds, seed).filter(
          (cd) => cd.eligible && !here.has(cd.nurse.id)
        );
        if (kind === 'sn') {
          // Prefer non-in-charge nurses for staff seats to preserve scarce in-charge capacity.
          cands = cands.sort((x, y) => {
            const cx = x.nurse.inChargeQualified ? 1 : 0;
            const cy = y.nurse.inChargeQualified ? 1 : 0;
            if (cx !== cy) return cx - cy;
            if (y.score !== x.score) return y.score - x.score;
            return x.nurse.id < y.nurse.id ? -1 : 1;
          });
        }
        if (cands.length === 0) break;
        schedule.push({ nurseId: cands[0]!.nurse.id, day: shift.day, type: shift.type });
      }
    }
  }
  return schedule;
}
