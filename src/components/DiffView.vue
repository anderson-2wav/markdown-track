<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Colorized unified diff between two markdown texts (Stage 4). Custom BEM render
// over jsdiff (not vue-diff) so styling is minimal and fully overridable via the
// `--mt-diff-*` tokens. Add/remove colors match WILD's GitHub-ish palette.
import { computed } from "vue";
import { computeLineDiff, diffStats } from "../lib/diff.js";

const props = defineProps({
  oldText: { type: String, default: "" },
  newText: { type: String, default: "" },
});

const lines = computed(() => computeLineDiff(props.oldText, props.newText));
const stats = computed(() => diffStats(lines.value));
const hasChanges = computed(() => stats.value.added > 0 || stats.value.removed > 0);
const sign = (t) => (t === "added" ? "+" : t === "removed" ? "−" : " ");
</script>

<template>
  <div class="mt-diff">
    <div class="mt-diff__stats">
      <span class="mt-diff__stat mt-diff__stat--added">+{{ stats.added }}</span>
      <span class="mt-diff__stat mt-diff__stat--removed">−{{ stats.removed }}</span>
    </div>

    <p v-if="!hasChanges" class="mt-library__status">No changes from the accepted version.</p>

    <pre v-else class="mt-diff__body"><template v-for="(line, i) in lines" :key="i"><span
      class="mt-diff__line"
      :class="`mt-diff__line--${line.type}`"
    ><span class="mt-diff__gutter">{{ sign(line.type) }}</span><span class="mt-diff__text">{{ line.text }}</span>
</span></template></pre>
  </div>
</template>
