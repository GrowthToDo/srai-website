<script lang="ts">
  import { LEAD_CAPTURE_URL, formatINR, bandForBeds } from '~/site';
  import RangeField from './RangeField.svelte';

  // Assumption constants (INR). Educated estimates for a 300+ bed Indian corporate
  // hospital; shown to the visitor as editable assumptions, not sourced figures.
  const RATES = {
    overtimePremiumHour: 150, // premium above a ~₹200/h staff nurse base
    contractNurseHour: 450, // outsourced/contract nurse, all-in hourly
    replacementCost: 120000, // recruit, onboard, cover a vacancy
  };

  let inCharges = $state(20); // ward nurse in-charges on the roster
  let inChargeCost = $state(45000); // monthly cost of one in-charge (salary plus benefits)
  let rosterShare = $state(35); // share of an in-charge's time spent on rostering, %
  let otHours = $state(200); // overtime hours/week across nursing staff
  let contractShifts = $state(60); // contract nurse shifts per month
  let exits = $state(12); // exits in past year where rostering was a factor
  let beds = $state(300); // licensed beds, for the comparison line

  const inChargeTimeCost = $derived(Math.round(inCharges * inChargeCost * 12 * (rosterShare / 100)));
  const otCost = $derived(Math.round(otHours * 52 * RATES.overtimePremiumHour));
  const contractCost = $derived(Math.round(contractShifts * 8 * RATES.contractNurseHour * 12));
  const attritionCost = $derived(exits * RATES.replacementCost);
  const totalCost = $derived(inChargeTimeCost + otCost + contractCost + attritionCost);
  const band = $derived(bandForBeds(beds));
  const subscription = $derived(band.pro);

  let showForm = $state(false);
  let showResults = $state(false);
  let submitting = $state(false);
  let submitError = $state(false);
  let formName = $state('');
  let formTitle = $state('');
  let formHospital = $state('');
  let formEmail = $state('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitting = true;
    submitError = false;
    const payload = {
      source: 'cost-calculator',
      timestamp: new Date().toISOString(),
      name: formName,
      title: formTitle,
      hospital: formHospital,
      email: formEmail,
      inCharges,
      inChargeCost,
      rosterShare,
      otHours,
      contractShifts,
      exits,
      beds,
      band: band.label,
      inChargeTimeCost,
      otCost,
      contractCost,
      attritionCost,
      totalCost,
    };
    try {
      await fetch(LEAD_CAPTURE_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
      showResults = true;
    } catch {
      submitError = true;
    } finally {
      submitting = false;
    }
  }

  const inputClass =
    'block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
</script>

<div class="mx-auto max-w-2xl">
  <div class="space-y-8">
    <RangeField
      label="Ward nurse in-charges on the roster"
      id="slider-inCharges"
      min={5}
      max={100}
      step={1}
      display={`${inCharges.toLocaleString('en-IN')} in-charges`}
      bind:value={inCharges}
    />

    <RangeField
      label="Monthly cost of one in-charge (salary plus benefits)"
      id="slider-inChargeCost"
      min={25000}
      max={100000}
      step={5000}
      display={formatINR(inChargeCost)}
      minLabel={formatINR(25000)}
      maxLabel={formatINR(100000)}
      bind:value={inChargeCost}
    />

    <RangeField
      label="Share of an in-charge's time spent on rostering"
      id="slider-rosterShare"
      min={20}
      max={50}
      step={5}
      display={`${rosterShare.toLocaleString('en-IN')}%`}
      bind:value={rosterShare}
    />

    <RangeField
      label="Overtime hours per week across nursing staff"
      id="slider-otHours"
      min={0}
      max={1000}
      step={20}
      display={`${otHours.toLocaleString('en-IN')} hrs`}
      bind:value={otHours}
    />

    <RangeField
      label="Contract nurse (outsourced) shifts per month"
      id="slider-contractShifts"
      min={0}
      max={400}
      step={10}
      display={`${contractShifts.toLocaleString('en-IN')} shifts`}
      bind:value={contractShifts}
    />

    <RangeField
      label="Nurse exits in the past year where rostering was a factor"
      id="slider-exits"
      min={0}
      max={100}
      step={1}
      display={`${exits.toLocaleString('en-IN')} exits`}
      bind:value={exits}
    />

    <RangeField
      label="Licensed beds (for the comparison line)"
      id="slider-beds"
      min={50}
      max={1000}
      step={10}
      display={`${beds.toLocaleString('en-IN')} beds`}
      bind:value={beds}
    />
  </div>

  {#if !showResults}
    <div class="mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p class="text-sm text-muted">Your estimated hidden rostering cost per year</p>
      <div class="pointer-events-none mt-2 select-none text-5xl font-bold tracking-tight blur-2xl">₹93,72,000</div>
      <p class="mt-3 text-sm text-muted">Enter your details to reveal your number</p>
      {#if !showForm}
        <button onclick={() => (showForm = true)} class="btn-primary mt-5">Reveal my cost breakdown</button>
      {:else}
        <form onsubmit={handleSubmit} class="mt-6 space-y-3 text-left">
          <input type="text" placeholder="Your name" bind:value={formName} required class={inputClass} />
          <input type="text" placeholder="Your role (e.g. CNO, Nursing Superintendent)" bind:value={formTitle} required class={inputClass} />
          <input type="text" placeholder="Hospital name" bind:value={formHospital} required class={inputClass} />
          <input type="email" placeholder="Work email" bind:value={formEmail} required class={inputClass} />
          {#if submitError}<p class="text-sm text-red-600">Something went wrong. Please try again.</p>{/if}
          <button type="submit" disabled={submitting} class="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Calculating…' : 'Show my results'}
          </button>
          <p class="text-center text-xs text-muted">No spam. We follow up once, and only if we think we can help.</p>
        </form>
      {/if}
    </div>
  {:else}
    <div class="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-8 shadow-sm">
      <h3 class="mb-6 text-center text-lg font-semibold">Your estimated hidden rostering cost per year</h3>
      <div class="space-y-3">
        {#each [
          ['In-charge time given back to the wards', inChargeTimeCost],
          ['Overtime premium', otCost],
          ['Contract nurse cover', contractCost],
          ['Attrition linked to rostering', attritionCost],
        ] as [label, value] (label)}
          <div class="flex items-center justify-between border-b border-primary/10 py-2">
            <span class="text-sm text-gray-700">{label}</span>
            <span class="text-sm font-semibold">{formatINR(value)}</span>
          </div>
        {/each}
        <div class="flex items-center justify-between pt-3">
          <span class="text-base font-bold">Total hidden rostering cost</span>
          <span class="text-2xl font-bold text-primary">{formatINR(totalCost)}</span>
        </div>
        <div class="flex items-center justify-between border-t border-primary/10 pt-3">
          <span class="text-sm text-gray-700">SimpleRosterAI Pro for a hospital of {beds.toLocaleString('en-IN')} beds ({band.label.toLowerCase()}), per year, GST extra</span>
          <span class="text-sm font-semibold">{formatINR(subscription)}</span>
        </div>
      </div>
      <p class="mt-4 text-center text-xs text-muted">
        In-charges typically spend 30–40% of their week building and patching the duty roster; the product returns that time to the ward. Editable
        assumptions: overtime premium {formatINR(RATES.overtimePremiumHour)} per hour, contract nurse {formatINR(RATES.contractNurseHour)} per hour,
        replacement cost {formatINR(RATES.replacementCost)} per exit. These are estimates; replace them with your own finance figures.
      </p>
      <div class="mt-6 text-center">
        <a href="/pricing" class="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary">See pricing</a>
      </div>
    </div>
  {/if}
</div>
