<script>
  
  const NAVY = '#0b1f3a';
  const NAVY_D = '#071527';
  const SAFFRON = '#f5a623';

  // Staff roster — Indian names, roles staff nurse (SN) / senior staff nurse (in-charge) / nursing assistant (NA)
  const S = {
    am: { name: 'Anjali M.', role: 'Sr SN', charge: true, bg: '#fdecc8', fg: '#8a5a10' },
    pn: { name: 'Priya N.', role: 'Sr SN', charge: true, bg: '#fdecc8', fg: '#8a5a10' },
    rs: { name: 'Rekha S.', role: 'Sr SN', charge: true, bg: '#fdecc8', fg: '#8a5a10' },
    jt: { name: 'Joseph T.', role: 'Sr SN', charge: true, bg: '#fdecc8', fg: '#8a5a10' },
    sp: { name: 'Sunita P.', role: 'Sr SN', charge: true, bg: '#fdecc8', fg: '#8a5a10' },
    dk: { name: 'Deepa K.', role: 'SN', charge: false, bg: '#e3f5f3', fg: '#155e56' },
    mi: { name: 'Meena I.', role: 'SN', charge: false, bg: '#e3f5f3', fg: '#155e56' },
    rv: { name: 'Ritu V.', role: 'SN', charge: false, bg: '#e3f5f3', fg: '#155e56' },
    ap: { name: 'Arun P.', role: 'SN', charge: false, bg: '#e3f5f3', fg: '#155e56' },
    kr: { name: 'Kavitha R.', role: 'SN', charge: false, bg: '#e3f5f3', fg: '#155e56' },
    sj: { name: 'Sneha J.', role: 'SN', charge: false, bg: '#e3f5f3', fg: '#155e56' },
    ng: { name: 'Neha G.', role: 'SN', charge: false, bg: '#e3f5f3', fg: '#155e56' },
    rk: { name: 'Ramesh K.', role: 'NA', charge: false, bg: '#e6e9ef', fg: '#33415a' },
    gy: { name: 'Geeta Y.', role: 'NA', charge: false, bg: '#e6e9ef', fg: '#33415a' },
    sb: { name: 'Suresh B.', role: 'NA', charge: false, bg: '#e6e9ef', fg: '#33415a' },
    ps: { name: 'Pooja S.', role: 'NA', charge: false, bg: '#e6e9ef', fg: '#33415a' },
  };

  // 7-day duty roster: three 8-hour shifts a day (Mon 7 Sep – Sun 13 Sep 2026)
  const DAYS = [
    { lbl: 'Mon', dt: 'Sep 7', wk: false, morning: ['am', 'dk', 'mi', 'rk'], evening: ['pn', 'rv', 'ng', 'gy'], night: ['rs', 'ap', 'sb'] },
    { lbl: 'Tue', dt: 'Sep 8', wk: false, morning: ['jt', 'sj', 'kr', 'ps'], evening: ['sp', 'dk', 'rv', 'rk'], night: ['am', 'mi', 'gy'] },
    { lbl: 'Wed', dt: 'Sep 9', wk: false, morning: ['pn', 'ap', 'ng', 'sb'], evening: ['rs', 'sj', 'kr', 'ps'], night: ['jt', 'dk', 'rk'] },
    { lbl: 'Thu', dt: 'Sep 10', wk: false, morning: ['sp', 'rv', 'mi', 'gy'], evening: ['am', 'ap', 'ng', 'sb'], night: ['pn', 'sj', 'ps'] },
    { lbl: 'Fri', dt: 'Sep 11', wk: false, morning: ['rs', 'dk', 'kr', 'rk'], evening: ['jt', 'rv', 'mi', 'gy'], night: ['sp', 'ap', 'sb'] },
    { lbl: 'Sat', dt: 'Sep 12', wk: true, morning: ['am', 'sj', 'ng', 'ps'], evening: ['pn', 'dk', 'kr', 'rk'], night: ['rs', 'rv', 'gy'] },
    { lbl: 'Sun', dt: 'Sep 13', wk: true, morning: ['jt', 'mi', 'ap', 'sb'], evening: ['sp', 'sj', 'ng', 'ps'], night: ['am', 'dk', 'kr'] },
  ];

  const M_REQ = 4;
  const E_REQ = 4;
  const N_REQ = 3;
  const reqFor = (shift) => (shift === 'morning' ? M_REQ : shift === 'evening' ? E_REQ : N_REQ);

  // Flat sequence: walk row-by-row, morning then evening then night
  const FLAT = [];
  DAYS.forEach((d, di) => {
    d.morning.forEach((id) => FLAT.push({ di, shift: 'morning', id }));
    d.evening.forEach((id) => FLAT.push({ di, shift: 'evening', id }));
    d.night.forEach((id) => FLAT.push({ di, shift: 'night', id }));
  });
  const TOTAL = FLAT.length; // 77

  // Absence: Meena I. absent Tue night, replaced by Kavitha R.
  const CO = { di: 1, shift: 'night', id: 'mi' };
  const REPLACE = 'kr';

  const CANDIDATES = [
    {
      rank: 1,
      id: 'kr',
      type: 'Cross-trained',
      tBg: '#e3f5f3',
      tFg: '#155e56',
      pros: ['Within the hours cap', 'In-charge qualified', '14h rest ✓'],
      flags: [],
    },
    {
      rank: 2,
      id: 'sm',
      name: 'Suma R.',
      type: 'Contract',
      tBg: '#fdecc8',
      tFg: '#8a5a10',
      pros: ['Available'],
      flags: ['40h this week → over the cap if extended'],
    },
    {
      rank: 3,
      id: 'ln',
      name: 'Latha N.',
      type: 'Part-time',
      tBg: '#f3f4f6',
      tFg: '#374151',
      pros: ['Available'],
      flags: ['Only 11h rest since last duty'],
    },
  ];

  const ANN = {
    1: { icon: '✦', text: 'AI filling duties. Your ward rules enforced on every seat', bg: NAVY, fg: '#fff', spin: false },
    2: { icon: '⟳', text: 'Checking rules…', bg: '#1a2332', fg: '#fff', spin: true },
    3: { icon: '✓', text: 'Roster complete · All 77 seats filled · Ready to publish', bg: '#1a6b62', fg: '#fff', spin: false },
    4: { icon: '⚠', text: 'Absence logged · Scanning 17 staff for cover', bg: '#c2410c', fg: '#fff', spin: false },
    5: { icon: '⚡', text: '3 candidates ranked by rest, hours and fairness', bg: NAVY, fg: '#fff', spin: false },
    6: { icon: '✓', text: 'Cover confirmed in one tap · Audit trail logged', bg: '#1a6b62', fg: '#fff', spin: false },
  };

  // Reactive state
  let phase = $state(0);
  let filled = $state(0);
  let rules = $state(0);
  let dismissed = $state(false);
  let cursor = $state({ x: 60, y: 60, clicking: false, visible: false });

  // Non-reactive refs
  let containerEl;
  let timers = [];
  let fillIntervalId = null;
  let ruleIntervalId = null;

  // Derived
  let ann = $derived(ANN[phase]);
  let showPanel = $derived(!dismissed && phase >= 4);

  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
    if (fillIntervalId) clearInterval(fillIntervalId);
    if (ruleIntervalId) clearInterval(ruleIntervalId);
  }
  function at(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function moveCursorTo(selector, offsetX = 0, offsetY = 0) {
    if (!containerEl) return;
    const t = containerEl.querySelector(selector);
    if (!t) return;
    const cb = containerEl.getBoundingClientRect();
    const tb = t.getBoundingClientRect();
    cursor = {
      ...cursor,
      x: tb.left - cb.left + tb.width / 2 + offsetX - 2,
      y: tb.top - cb.top + tb.height / 2 + offsetY - 2,
      visible: true,
    };
  }
  function clickCursor() {
    cursor = { ...cursor, clicking: true };
    setTimeout(() => {
      cursor = { ...cursor, clicking: false };
    }, 550);
  }
  function hideCursor() {
    cursor = { ...cursor, visible: false };
  }

  function cellActive(d, shift, req) {
    // visible IDs given current "filled" pointer
    const ids = d[shift];
    const visIds = ids.filter((id) => {
      const idx = FLAT.findIndex((f) => f.di === DAYS.indexOf(d) && f.shift === shift && f.id === id);
      return idx !== -1 && filled > idx;
    });
    const di = DAYS.indexOf(d);
    const isCoCell = !dismissed && phase >= 4 && CO.di === di && CO.shift === shift;
    const isRpl = !dismissed && phase === 6 && CO.di === di && CO.shift === shift;
    const coId = isCoCell ? CO.id : null;
    // The absent nurse is always subtracted from the filled count; a confirmed
    // replacement (isRpl) adds one back. Absence: len-1. Replaced: len-1+1 = len.
    const active = visIds.length - (isCoCell && visIds.includes(coId) ? 1 : 0) + (isRpl ? 1 : 0);
    const full = active >= req;
    const empty = visIds.length === 0;
    const brd = empty ? '#e5e7eb' : full ? '#8fd6cc' : '#fde68a';
    const bgc = empty ? '#fafafa' : full ? '#eefaf8' : '#fffbeb';
    const display = visIds.map((id) => (isRpl && id === coId ? REPLACE : id));
    return { ids, visIds, isCoCell, isRpl, coId, active, full, empty, brd, bgc, display };
  }

  $effect(() => {
    function loop() {
      clearAll();
      phase = 0;
      filled = 0;
      rules = 0;
      dismissed = false;
      cursor = { x: 60, y: 60, clicking: false, visible: false };

      // T+0.4s — cursor enters
      at(() => {
        cursor = { x: 120, y: 50, clicking: false, visible: true };
      }, 400);
      at(() => moveCursorTo('[data-cursor="generate"]'), 700);

      // T+1.9s — click → Phase 1
      at(clickCursor, 1900);
      at(() => {
        phase = 1;
        let f = 0;
        fillIntervalId = setInterval(() => {
          f++;
          filled = f;
          if (f >= TOTAL) {
            clearInterval(fillIntervalId);
            fillIntervalId = null;
            at(() => {
              phase = 2;
              rules = 0;
              let r = 0;
              ruleIntervalId = setInterval(() => {
                r++;
                rules = r;
                if (r >= 21) {
                  clearInterval(ruleIntervalId);
                  ruleIntervalId = null;
                  at(() => (phase = 3), 350);
                }
              }, 85);
            }, 500);
          }
        }, 90);
      }, 2050);

      // Cursor idles bottom-right while filling
      at(() => {
        cursor = { ...cursor, x: 780, y: 340 };
      }, 2400);

      const fillDone = 2050 + TOTAL * 90 + 500;
      const validateDone = fillDone + 21 * 85 + 350;
      const phase3Hold = 3800;
      const absenceAt = validateDone + phase3Hold;

      at(() => moveCursorTo('[data-cursor="bell"]'), validateDone + phase3Hold - 1200);

      at(() => {
        phase = 4;
        dismissed = false;
      }, absenceAt);

      at(() => moveCursorTo('[data-cand="0"]'), absenceAt + 1400);
      at(() => (phase = 5), absenceAt + 2400);
      at(() => moveCursorTo('[data-assign="0"]'), absenceAt + 3000);
      at(clickCursor, absenceAt + 3700);
      at(() => (phase = 6), absenceAt + 3850);
      at(hideCursor, absenceAt + 5500);
      at(loop, absenceAt + 7800);
    }

    // Start the demo only once it scrolls into view, so visitors see it from the beginning.
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (started) return;
        if (entries.some((e) => e.isIntersecting)) {
          started = true;
          io.disconnect();
          loop();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(containerEl);
    return () => {
      io.disconnect();
      clearAll();
    };
  });

  function dismissPanel() {
    dismissed = true;
  }
</script>

<style>
  @keyframes pulseRing {
    0% {
      box-shadow: 0 0 0 0 rgba(11, 31, 58, 0.45);
    }
    70% {
      box-shadow: 0 0 0 11px rgba(11, 31, 58, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(11, 31, 58, 0);
    }
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes panelIn {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }
  @keyframes chipPop {
    from {
      transform: scale(0.85);
    }
    to {
      transform: scale(1);
    }
  }
  @keyframes ringPulse {
    0% {
      transform: scale(0.6);
      opacity: 0.7;
    }
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }
  .pulse {
    animation: pulseRing 1.6s infinite;
  }
  .spin {
    animation: spin 0.9s linear infinite;
    display: inline-block;
  }
  .fade-up {
    animation: fadeUp 0.35s ease both;
  }
  .panel-in {
    animation: panelIn 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.05) both;
  }
  .shake {
    animation: shake 0.45s ease;
  }
  .chip-pop {
    animation: chipPop 0.25s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  }
  .skeleton {
    background: linear-gradient(90deg, #eef0f3 25%, #dcdfe5 50%, #eef0f3 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 5px;
    height: 14px;
    width: 90%;
  }
  .cursor {
    position: absolute;
    width: 22px;
    height: 22px;
    pointer-events: none;
    z-index: 30;
    transition:
      left 1.1s cubic-bezier(0.4, 0, 0.2, 1),
      top 1.1s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  }
  .cursor.click::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(11, 31, 58, 0.35);
    animation: ringPulse 0.55s ease-out;
  }
  .sd-wrap {
    font-family: 'Inter', sans-serif;
  }
</style>

{#snippet chip(id, isAbsent, isReplaced)}
  {@const s = S[id] || S.kr}
  {@const bg = isReplaced ? '#eefaf8' : isAbsent ? '#fef2f2' : s.bg}
  {@const fg = isReplaced ? '#1a6b62' : isAbsent ? '#dc2626' : s.fg}
  <div
    class="chip-pop {isAbsent && !isReplaced ? 'shake' : ''}"
    style="display:flex;align-items:center;gap:3px;background:{bg};border-radius:5px;padding:2px 6px;"
  >
    {#if s.charge && !isAbsent}
      <svg
        width="7"
        height="7"
        viewBox="0 0 24 24"
        fill="none"
        stroke={fg}
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path
          d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        /></svg
      >
    {/if}
    <span style="font-size:10px;font-weight:600;color:{fg};white-space:nowrap;">{s.name}</span>
    <span style="font-size:8px;color:{fg};opacity:.55;">{s.role}</span>
    {#if isAbsent && !isReplaced}
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={fg} stroke-width="2.5"
        ><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg
      >
    {/if}
    {#if isReplaced}
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={fg} stroke-width="2.5"
        ><polyline points="20 6 9 17 4 12" /></svg
      >
    {/if}
  </div>
{/snippet}

{#snippet cell(d, shift, req)}
  {@const c = cellActive(d, shift, req)}
  <div
    data-cell={`${DAYS.indexOf(d)}-${shift}`}
    style="border-radius:9px;border:1.5px solid {c.brd};background:{c.bgc};padding:5px 8px;height:100%;transition:border-color .35s,background .35s;"
  >
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <span style="font-size:8px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">
        {shift === 'morning' ? '07:00-15:00' : shift === 'evening' ? '15:00-23:00' : '23:00-07:00'}
      </span>
      <span
        style="font-size:10px;font-weight:800;color:{c.full
          ? '#1a6b62'
          : c.empty
            ? '#d1d5db'
            : '#d97706'};display:flex;align-items:center;gap:2px;"
      >
        {#if c.full}
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            ><polyline points="20 6 9 17 4 12" /></svg
          >
        {/if}
        {c.active}/{req}
      </span>
    </div>
    {#if c.empty}
      {#if phase === 1}
        <div class="skeleton"></div>
      {:else}
        <span style="font-size:9px;color:#d1d5db;font-style:italic;">-</span>
      {/if}
    {:else}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;">
        {#each c.display as id, i (id + '-' + i)}
          {@render chip(id, c.isCoCell && !c.isRpl && c.ids[i] === c.coId, c.isRpl && c.ids.indexOf(c.coId) === i)}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet panel()}
  {@const searching = phase === 4}
  {@const cands = phase === 5}
  {@const done = phase === 6}
  <div
    class="panel-in"
    style="position:absolute;bottom:3px;left:6px;right:6px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 -4px 24px rgba(0,0,0,0.12);overflow:hidden;z-index:10;"
  >
    <div
      style="background:{done
        ? '#eefaf8'
        : '#fff7ed'};border-bottom:1px solid #f3f4f6;padding:8px 12px;display:flex;align-items:center;gap:7px;"
    >
      {#if done}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a6b62" stroke-width="2.5"
          ><polyline points="20 6 9 17 4 12" /></svg
        >
        <span style="font-size:11px;font-weight:700;color:#155e56;">Kavitha R. confirmed · Audit trail logged</span>
      {:else}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ea580c"
          stroke-width="2"
          stroke-linecap="round"
          ><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg
        >
        <span style="font-size:11px;font-weight:700;color:#c2410c;"
          >Absent: Meena I. · Tue 8 Sep · Night duty</span
        >
        <span style="margin-left:auto;font-size:9px;color:#9ca3af;">11:14 PM</span>
      {/if}
      <button
        onclick={dismissPanel}
        aria-label="Dismiss"
        style="margin-left:{done
          ? 'auto'
          : '6px'};background:none;border:none;cursor:pointer;color:#9ca3af;font-size:16px;line-height:1;">×</button
      >
    </div>
    {#if searching}
      <div style="padding:12px 14px;display:flex;align-items:center;gap:10px;">
        <span class="spin" style="color:{NAVY};font-size:16px;">⟳</span>
        <div>
          <div style="font-size:11px;font-weight:600;color:#111;">Finding cover…</div>
          <div style="font-size:10px;color:#9ca3af;margin-top:1px;">
            Checking 17 staff · your ward rules · hours cap · rest hours
          </div>
        </div>
      </div>
    {/if}
    {#if cands || done}
      <div style="padding:8px 10px;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;">
          {#each CANDIDATES as c, i (c.rank)}
            {@const sName = (S[c.id] || { name: c.name }).name}
            {@const hi = done && i === 0}
            <div
              data-cand={i}
              style="border:1.5px solid {hi
                ? '#8fd6cc'
                : '#e5e7eb'};background:{hi ? '#eefaf8' : '#fff'};border-radius:9px;padding:8px;transition:all .3s;"
            >
              <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <div>
                  <div style="font-size:11px;font-weight:700;color:#111;">{sName}</div>
                  <span
                    style="font-size:8px;font-weight:600;border-radius:9999px;background:{c.tBg};color:{c.tFg};padding:1px 5px;"
                    >{c.type}</span
                  >
                </div>
                <span style="font-size:9px;font-weight:700;color:#9ca3af;">#{c.rank}</span>
              </div>
              <ul style="list-style:none;margin-bottom:7px;padding:0;">
                {#each c.pros as p}
                  <li style="font-size:9px;color:#1a6b62;display:flex;gap:3px;margin-bottom:1px;">
                    <svg
                      width="7"
                      height="7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      style="flex-shrink:0;margin-top:1px;"><polyline points="20 6 9 17 4 12" /></svg
                    >
                    {p}
                  </li>
                {/each}
                {#each c.flags as f}
                  <li style="font-size:9px;color:#d97706;display:flex;gap:3px;margin-bottom:1px;">
                    <span style="font-weight:700;">⚠</span>{f}
                  </li>
                {/each}
              </ul>
              <button
                data-assign={i}
                style="width:100%;padding:4px 0;border-radius:6px;font-size:9px;font-weight:700;border:{i === 0
                  ? 'none'
                  : '1px solid #e5e7eb'};background:{hi
                  ? '#1a6b62'
                  : i === 0
                    ? NAVY
                    : 'transparent'};color:{i === 0 ? '#fff' : '#6b7280'};display:flex;align-items:center;justify-content:center;gap:3px;font-family:Inter,sans-serif;cursor:pointer;"
              >
                {#if hi}
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    ><polyline points="20 6 9 17 4 12" /></svg
                  >
                  Assigned
                {:else if i === 0}
                  Assign →
                {:else}
                  Assign
                {/if}
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/snippet}

<div bind:this={containerEl} class="sd-wrap" style="position:relative;">
  <div
    style="border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 6px 32px rgba(0,0,50,.09);overflow:hidden;background:#fff;"
  >
    <!-- Chrome -->
    <div
      style="background:#f5f5f7;border-bottom:1px solid #e5e7eb;padding:8px 14px;display:flex;align-items:center;gap:7px;"
    >
      {#each ['#ff5f57', '#ffbd2e', '#28c840'] as c}
        <div style="width:10px;height:10px;border-radius:50%;background:{c};"></div>
      {/each}
      <span style="margin-left:5px;font-size:10px;color:#6b7280;font-family:monospace;"
        >General Ward · Week of 7–13 Sep 2026</span
      >
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
        {#if phase === 3}
          <span
            class="fade-up"
            style="font-size:10px;color:#1a6b62;font-weight:700;display:flex;align-items:center;gap:3px;"
            ><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              ><polyline points="20 6 9 17 4 12" /></svg
            >21 rules · 0 violations</span
          >
        {/if}
        <button
          data-cursor="generate"
          class={phase === 1 ? 'pulse' : ''}
          aria-label="Fill duty roster"
          style="background:{phase === 1
            ? NAVY_D
            : NAVY};color:#fff;border:none;border-radius:9999px;padding:5px 13px;font-size:10px;font-weight:700;cursor:default;display:flex;align-items:center;gap:5px;font-family:Inter,sans-serif;transform:{phase ===
          1
            ? 'scale(1.04)'
            : 'scale(1)'};transition:all .25s ease;"
        >
          {#if phase === 1}
            <span class="spin">⟳</span> Filling…
          {:else if phase === 2 || phase === 3}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              ><polyline points="20 6 9 17 4 12" /></svg
            > Roster ready
          {:else}
            ✦ Fill roster
          {/if}
        </button>
        <div
          data-cursor="bell"
          style="width:28px;height:28px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;position:relative;"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            stroke-width="1.8"
            stroke-linecap="round"
            ><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg
          >
          {#if phase >= 4 && !dismissed}
            <div
              style="position:absolute;top:3px;right:3px;width:6px;height:6px;border-radius:50%;background:{SAFFRON};border:1.5px solid #fff;"
            ></div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Validation bar — always rendered to reserve space, visibility toggles -->
    <div
      style="padding:5px 14px;background:{phase === 2
        ? '#eef4f1'
        : 'transparent'};border-bottom:1px solid {phase === 2
        ? '#cfe0d9'
        : 'transparent'};display:flex;align-items:center;gap:9px;visibility:{phase === 2
        ? 'visible'
        : 'hidden'};transition:background .2s,border-color .2s;"
    >
      <span class="spin" style="color:{NAVY};font-size:12px;">⟳</span>
      <span style="font-size:10px;color:#155e56;font-weight:600;">Checking rules…</span>
      <div style="flex:1;height:3px;border-radius:9999px;background:#dce8e3;overflow:hidden;">
        <div
          style="height:100%;background:{NAVY};border-radius:9999px;width:{(rules / 21) *
            100}%;transition:width .08s linear;"
        ></div>
      </div>
      <span style="font-size:10px;font-weight:700;color:{NAVY};min-width:34px;">{rules}/21</span>
    </div>

    <!-- Column headers -->
    <div style="display:grid;grid-template-columns:70px 1fr 1fr 1fr;border-bottom:2px solid #e5e7eb;background:#fafafa;">
      <div
        style="padding:7px 8px;font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;"
      >
        Date
      </div>
      <div style="padding:7px 7px;border-left:1px solid #f0f0f0;">
        <div style="font-size:10px;font-weight:700;color:#374151;">Morning</div>
        <div style="font-size:9px;color:#9ca3af;">07:00-15:00 · 4 staff</div>
      </div>
      <div style="padding:7px 7px;border-left:1px solid #f0f0f0;">
        <div style="font-size:10px;font-weight:700;color:#374151;">Evening</div>
        <div style="font-size:9px;color:#9ca3af;">15:00-23:00 · 4 staff</div>
      </div>
      <div style="padding:7px 7px;border-left:1px solid #f0f0f0;">
        <div style="font-size:10px;font-weight:700;color:#374151;">Night</div>
        <div style="font-size:9px;color:#9ca3af;">23:00-07:00 · 3 staff</div>
      </div>
    </div>

    <!-- Roster rows -->
    <div style="position:relative;">
      {#each DAYS as d, di (d.dt)}
        <div
          style="display:grid;grid-template-columns:70px 1fr 1fr 1fr;border-bottom:{di < 6
            ? '1px solid #f3f4f6'
            : 'none'};background:{d.wk ? '#faf9f6' : '#fff'};"
        >
          <div style="padding:6px 8px;display:flex;flex-direction:column;justify-content:center;">
            <span style="font-size:12px;font-weight:700;color:{d.wk ? '#9ca3af' : '#111'};">{d.lbl}</span>
            <span style="font-size:9px;color:#9ca3af;">{d.dt}</span>
            {#if d.wk}
              <span
                style="font-size:8px;margin-top:2px;background:#f3f4f6;color:#9ca3af;border-radius:3px;padding:1px 4px;font-weight:600;width:fit-content;"
                >WKD</span
              >
            {/if}
          </div>
          <div style="padding:4px 4px 4px 5px;border-left:1px solid #f3f4f6;">
            {@render cell(d, 'morning', reqFor('morning'))}
          </div>
          <div style="padding:4px 4px;border-left:1px solid #f3f4f6;">
            {@render cell(d, 'evening', reqFor('evening'))}
          </div>
          <div style="padding:4px 5px 4px 4px;border-left:1px solid #f3f4f6;">
            {@render cell(d, 'night', reqFor('night'))}
          </div>
        </div>
      {/each}

      <!-- Annotation pill -->
      {#if ann}
        {#key phase}
          <div
            class="fade-up"
            style="position:absolute;bottom:10px;right:10px;display:inline-flex;align-items:center;gap:6px;background:{ann.bg};color:{ann.fg};border-radius:9999px;padding:7px 14px;font-size:10px;font-weight:700;box-shadow:0 3px 14px rgba(0,0,0,0.2);max-width:380px;z-index:5;pointer-events:none;"
          >
            <span class={ann.spin ? 'spin' : ''} style="font-size:13px;">{ann.icon}</span>
            {phase === 2 ? `Validating rule ${Math.min(rules, 21)} of 21…` : ann.text}
          </div>
        {/key}
      {/if}
    </div>

    <!-- Footer -->
    <div
      style="padding:7px 14px;background:#fafafa;border-top:1px solid #f3f4f6;display:flex;align-items:center;gap:14px;font-size:9px;color:#9ca3af;"
    >
      <div style="display:flex;align-items:center;gap:4px;">
        <div style="width:6px;height:6px;border-radius:50%;background:{phase >= 3 ? '#2aa79b' : '#d1d5db'};"></div>
        <span
          >{phase >= 3 ? '21 rules validated · 0 violations' : phase === 2 ? `${rules}/21 rules…` : 'Pending validation'}</span
        >
      </div>
      <div style="display:flex;align-items:center;gap:4px;">
        <div style="width:6px;height:6px;border-radius:50%;background:{filled > 0 ? NAVY : '#d1d5db'};"></div>
        <span>{filled}/{TOTAL} duties filled</span>
      </div>
      <div style="margin-left:auto;display:flex;gap:4px;">
        {#each ['PDF for the notice board', 'Excel for HR', 'Audit trail'] as l}
          <span
            style="border-radius:9999px;border:1px solid #e5e7eb;background:#fff;padding:2px 7px;font-size:8px;font-weight:600;color:{phase >=
            3
              ? '#374151'
              : '#d1d5db'};">{l}</span
          >
        {/each}
      </div>
    </div>
  </div>

  {#if showPanel}
    {@render panel()}
  {/if}

  {#if cursor.visible}
    <div class="cursor {cursor.clicking ? 'click' : ''}" style="left:{cursor.x}px;top:{cursor.y}px;">
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path
          d="M3 2 L3 18 L7 14.5 L9.5 21 L12.5 19.5 L10 13 L15 13 Z"
          fill="#fff"
          stroke="#111"
          stroke-width="1.4"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  {/if}
</div>
