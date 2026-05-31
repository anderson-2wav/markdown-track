<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Document view orchestrator (Stage 2): loads the accepted state, renders it
// read-only (with mermaid), and offers a WYSIWYG editor whose Save records a
// pending change. The timeline / state-selection / diff / accept arrive in
// Stages 3-5.
import { ref, watch, onMounted, computed } from "vue";
import { useMarkdownTrack } from "../composables/useMarkdownTrack.js";
import { extractTitle } from "../lib/title.js";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import MarkdownEditor from "./MarkdownEditor.vue";

const props = defineProps({ docId: { type: String, required: true } });
const emit = defineEmits(["back"]);
const { hooks } = useMarkdownTrack();

const accepted = ref(null);
const loading = ref(true);
const error = ref("");
const mode = ref("view"); // 'view' | 'edit'
const draft = ref("");
const saving = ref(false);
const savedNote = ref("");
const pendingCount = ref(0);

const title = computed(() => extractTitle(accepted.value?.content || "") || props.docId);
const canEdit = computed(() => hooks.can("edit", { id: props.docId }));

async function refreshPending() {
  try {
    pendingCount.value = (await hooks.listPendingChanges(props.docId)).length;
  }
  catch { /* non-fatal */ }
}

async function load() {
  loading.value = true;
  error.value = "";
  mode.value = "view";
  try {
    accepted.value = await hooks.readAcceptedState(props.docId);
    draft.value = accepted.value.content;
    await refreshPending();
  }
  catch (e) {
    error.value = e?.message || String(e);
  }
  finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => props.docId, load);

function startEdit() {
  draft.value = accepted.value?.content ?? "";
  savedNote.value = "";
  mode.value = "edit";
}

function cancel() {
  mode.value = "view";
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const change = await hooks.savePendingChange(props.docId, { content: draft.value });
    savedNote.value = `Saved pending change (seq ${change.seq}).`;
    await refreshPending();
    mode.value = "view";
  }
  catch (e) {
    error.value = e?.message || String(e);
  }
  finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mt-doc">
    <div class="mt-doc__bar">
      <button type="button" class="mt-editor__btn" @click="emit('back')">← Library</button>
      <h2 class="mt-doc__title">{{ title }}</h2>
      <span class="mt-doc__spacer"></span>
      <span v-if="pendingCount" class="mt-doc__pending">{{ pendingCount }} pending</span>
      <template v-if="mode === 'view'">
        <button v-if="canEdit" type="button" class="mt-editor__btn" @click="startEdit">Edit</button>
      </template>
      <template v-else>
        <button type="button" class="mt-editor__btn" @click="cancel">Cancel</button>
        <button type="button" class="mt-editor__btn is-active" :disabled="saving" @click="save">
          {{ saving ? "Saving…" : "Save" }}
        </button>
      </template>
    </div>

    <p v-if="loading" class="mt-library__status">Loading…</p>
    <p v-else-if="error" class="mt-library__status mt-library__status--error">{{ error }}</p>

    <template v-else>
      <p v-if="savedNote" class="mt-doc__note">{{ savedNote }}</p>
      <MarkdownRenderer v-if="mode === 'view'" :content="accepted?.content || ''" />
      <MarkdownEditor v-else v-model="draft" />
    </template>
  </div>
</template>
