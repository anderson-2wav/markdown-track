<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Document view orchestrator. Loads the accepted history + pending changes,
// renders them as a scrubbable timeline (Stage 3), and shows the selected
// state read-only (with mermaid). Edit builds on the latest state; Save records
// a new pending change. Diff (Stage 4) and Accept (Stage 5) build on this.
import { ref, watch, onMounted, computed } from "vue";
import { useMarkdownTrack } from "../composables/useMarkdownTrack.js";
import { extractTitle } from "../lib/title.js";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ChangeTimeline from "./ChangeTimeline.vue";
import DiffView from "./DiffView.vue";

const props = defineProps({ docId: { type: String, required: true } });
const emit = defineEmits(["back"]);
const { hooks } = useMarkdownTrack();

const acceptedStates = ref([]);
const pendingChanges = ref([]);
const loading = ref(true);
const error = ref("");
const mode = ref("view"); // 'view' | 'edit'
const draft = ref("");
const saving = ref(false);
const savedNote = ref("");
const selectedId = ref(null);
const showDiff = ref(false);

// Timeline points, left → right: accepted milestones then pending ticks.
const points = computed(() => [
  ...acceptedStates.value.map((s) => ({
    id: s.id, kind: "accepted", at: s.acceptedAt, content: s.content,
    label: "Accepted", author: s.acceptedBy,
  })),
  ...pendingChanges.value.map((c) => ({
    id: c.id, kind: "pending", at: c.savedAt, content: c.content,
    label: `Pending #${c.seq}`, author: c.author,
  })),
]);

const selectedPoint = computed(
  () => points.value.find((p) => p.id === selectedId.value) || points.value[points.value.length - 1] || null
);
const viewedContent = computed(() => selectedPoint.value?.content ?? "");
const latestAccepted = computed(() => acceptedStates.value[acceptedStates.value.length - 1] || null);
const title = computed(() => extractTitle(latestAccepted.value?.content || "") || props.docId);
const canEdit = computed(() => hooks.can("edit", { id: props.docId }));
const pendingCount = computed(() => pendingChanges.value.length);

function selectLatest() {
  selectedId.value = points.value[points.value.length - 1]?.id ?? null;
}

async function load() {
  loading.value = true;
  error.value = "";
  mode.value = "view";
  savedNote.value = "";
  showDiff.value = false;
  try {
    const [acc, pend] = await Promise.all([
      hooks.listAcceptedStates(props.docId),
      hooks.listPendingChanges(props.docId),
    ]);
    acceptedStates.value = acc;
    pendingChanges.value = pend;
    selectLatest();
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
  // Edit builds on the currently-selected state (latest by default).
  draft.value = selectedPoint.value?.content ?? "";
  savedNote.value = "";
  showDiff.value = false;
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
    pendingChanges.value = await hooks.listPendingChanges(props.docId);
    selectedId.value = change.id;
    savedNote.value = `Saved pending change (seq ${change.seq}).`;
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
        <button
          v-if="pendingCount"
          type="button"
          class="mt-editor__btn"
          :class="{ 'is-active': showDiff }"
          @click="showDiff = !showDiff"
        >{{ showDiff ? "Hide changes" : "Show changes" }}</button>
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

      <template v-if="mode === 'view'">
        <ChangeTimeline
          v-if="points.length > 1"
          :points="points"
          :selected-id="selectedPoint?.id"
          @select="(id) => (selectedId = id)"
        />
        <DiffView
          v-if="showDiff"
          :old-text="latestAccepted?.content || ''"
          :new-text="viewedContent"
        />
        <MarkdownRenderer v-else :content="viewedContent" />
      </template>

      <MarkdownEditor v-else v-model="draft" />
    </template>
  </div>
</template>
