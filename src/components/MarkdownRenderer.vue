<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Read-only markdown renderer (marked -> HTML), with a lazy mermaid pass so
// `mermaid` code blocks become diagrams. Used for accepted/historical states.
import { ref, watch, onMounted, nextTick } from "vue";
import { renderMarkdown } from "../lib/markdown.js";
import { renderMermaid, hasMermaid } from "../lib/mermaid.js";

const props = defineProps({ content: { type: String, default: "" } });
const root = ref(null);
const html = ref("");

async function render() {
  html.value = renderMarkdown(props.content);
  await nextTick();
  if (root.value && hasMermaid(props.content)) {
    await renderMermaid(root.value);
  }
}

onMounted(render);
watch(() => props.content, render);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div ref="root" class="mt-markdown" v-html="html"></div>
</template>
