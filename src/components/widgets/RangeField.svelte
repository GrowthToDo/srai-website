<script lang="ts">
  let {
    label,
    id,
    min,
    max,
    step,
    display,
    minLabel = min.toLocaleString('en-IN'),
    maxLabel = max.toLocaleString('en-IN'),
    value = $bindable(),
  }: {
    label: string;
    id: string;
    min: number;
    max: number;
    step: number;
    display: string;
    minLabel?: string;
    maxLabel?: string;
    value: number;
  } = $props();
</script>

<div>
  <div class="mb-2 flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700" for={id}>{label}</label>
    <span class="ml-4 shrink-0 text-sm font-bold text-primary">{display}</span>
  </div>
  <input {id} type="range" {min} {max} {step} bind:value class="w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary h-2" />
  <div class="mt-1 flex justify-between text-xs text-muted">
    <span>{minLabel}</span>
    <span>{maxLabel}</span>
  </div>
</div>
