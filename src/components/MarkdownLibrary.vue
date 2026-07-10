<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Document library view (Stage 1). Lists the documents a user may view and emits
// a `select` event with the chosen document id. Title comes from the document's
// single top-level `#` heading (derived at discovery by the host hook) and falls
// back to the filename.
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useMarkdownTrack } from "../composables/useMarkdownTrack.js";
import { emitTrackEvent, TRACK_EVENTS } from "../lib/events.js";

const emit = defineEmits(["select"]);
const config = useMarkdownTrack();
const { hooks } = config;

const docs = ref([]);
const loading = ref(true);
const error = ref("");

// Display title: the document's single top-level `#` heading (derived at
// discovery), falling back to the filename.
const titleOf = (doc) => doc.title || doc.filename;

onMounted(async () => {
  emitTrackEvent(config, TRACK_EVENTS.ENTER_LIBRARY);
  try {
    const all = await hooks.listDocuments();
    docs.value = all
      .filter((doc) => hooks.can("view", doc))
      .sort((a, b) => titleOf(a).localeCompare(titleOf(b), undefined, { sensitivity: "base", numeric: true }));
  }
  catch (e) {
    error.value = e?.message || String(e);
  }
  finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  emitTrackEvent(config, TRACK_EVENTS.LEAVE_LIBRARY);
});
</script>

<template>
  <div class="mt-library">
    <h2 class="mt-library__heading">Documents</h2>

    <p v-if="loading" class="mt-library__status">Loading…</p>
    <p v-else-if="error" class="mt-library__status mt-library__status--error">{{ error }}</p>
    <p v-else-if="!docs.length" class="mt-library__status">No documents available.</p>

    <ul v-else class="mt-library__list">
      <li v-for="doc in docs" :key="doc.id" class="mt-library__item">
        <button
          type="button"
          class="mt-library__link"
          @click="emit('select', doc.id)"
        >
          <span class="mt-library__title">{{ titleOf(doc) }}</span>
          <span
            v-if="doc.title && doc.title !== doc.filename"
            class="mt-library__filename"
          >{{ doc.filename }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
