<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Change timeline (Stage 3) — an SVG track of accepted milestones (large dots)
// and pending changes (small dots), visually modeled on bold-vue's Scrubber.
// Click a point (or step with ‹ ›) to select the state to view. Positions use
// d3 `scalePoint` so events are evenly spaced and always clickable; the caption
// shows the real timestamp.
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { scalePoint } from "d3-scale";

const props = defineProps({
  // [{ id, kind: 'accepted'|'pending', at, label, author? }]
  points: { type: Array, default: () => [] },
  selectedId: { type: String, default: null },
});
const emit = defineEmits(["select"]);

const PAD = 24;
const HEIGHT = 44;
const TRACK_Y = 22;

const root = ref(null);
const width = ref(600);
let ro = null;
onMounted(() => {
  if (!root.value) return;
  width.value = root.value.clientWidth || 600;
  ro = new ResizeObserver(() => { width.value = root.value.clientWidth || 600; });
  ro.observe(root.value);
});
onBeforeUnmount(() => ro?.disconnect());

const xScale = computed(() =>
  scalePoint()
    .domain(props.points.map((p) => p.id))
    .range([PAD, Math.max(PAD + 1, width.value - PAD)])
    .padding(0.5)
);

const positioned = computed(() =>
  props.points.map((p) => ({ ...p, x: xScale.value(p.id) ?? PAD }))
);

const selectedIndex = computed(() => props.points.findIndex((p) => p.id === props.selectedId));
const selectedPoint = computed(() => props.points[selectedIndex.value] || null);

function step(delta) {
  const i = selectedIndex.value + delta;
  if (i >= 0 && i < props.points.length) emit("select", props.points[i].id);
}

const fmt = (iso) => {
  try { return new Date(iso).toLocaleString(); }
  catch { return String(iso); }
};
</script>

<template>
  <div ref="root" class="mt-timeline">
    <svg :width="width" :height="HEIGHT" class="mt-timeline__svg" role="group" aria-label="Change timeline">
      <line
        class="mt-timeline__track"
        :x1="PAD" :y1="TRACK_Y"
        :x2="Math.max(PAD, width - PAD)" :y2="TRACK_Y"
      />
      <g
        v-for="p in positioned"
        :key="p.id"
        class="mt-timeline__point"
        :class="[`mt-timeline__point--${p.kind}`, { 'is-selected': p.id === selectedId }]"
        :transform="`translate(${p.x},${TRACK_Y})`"
        @click="emit('select', p.id)"
      >
        <circle r="11" class="mt-timeline__hit" />
        <circle :r="p.kind === 'accepted' ? 7 : 4.5" class="mt-timeline__dot" />
        <title>{{ p.label }} — {{ fmt(p.at) }}</title>
      </g>
    </svg>

    <div v-if="selectedPoint" class="mt-timeline__caption">
      <button type="button" class="mt-editor__btn" :disabled="selectedIndex <= 0" @click="step(-1)">‹</button>
      <button type="button" class="mt-editor__btn" :disabled="selectedIndex >= points.length - 1" @click="step(1)">›</button>
      <span class="mt-timeline__label">
        <strong>{{ selectedPoint.label }}</strong>
        <span> · {{ fmt(selectedPoint.at) }}</span>
        <span v-if="selectedPoint.author"> · {{ selectedPoint.author.email }}</span>
      </span>
    </div>
  </div>
</template>
