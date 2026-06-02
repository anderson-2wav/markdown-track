<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Document view orchestrator. Loads the accepted history + pending changes,
// renders them as a scrubbable timeline (Stage 3), and shows the selected
// state read-only (with mermaid). Edit builds on the latest state; Save records
// a new pending change. Diff (Stage 4) and Accept (Stage 5) build on this.
import { ref, watch, onMounted, computed, defineAsyncComponent } from "vue";
import { useMarkdownTrack } from "../composables/useMarkdownTrack.js";
import { extractTitle } from "../lib/title.js";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import MarkdownEditor from "./MarkdownEditor.vue";
import ChangeTimeline from "./ChangeTimeline.vue";
import DiffView from "./DiffView.vue";

// v-md-editor and its theme/highlight.js deps are heavy; only load them when the
// config actually selects that editor.
const MarkdownEditorVMd = defineAsyncComponent(() => import("./MarkdownEditorVMd.vue"));

const props = defineProps({ docId: { type: String, required: true } });
const emit = defineEmits(["back"]);
const { hooks, options } = useMarkdownTrack();

// Editor is config-selectable: 'v-md-editor' (default — markdown source + preview,
// no round-trip) or 'tiptap' (WYSIWYG, but lossy on non-standard markdown).
const EditorComponent = computed(() =>
  options.editor === "tiptap" ? MarkdownEditor : MarkdownEditorVMd
);

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
const confirmingAccept = ref(false);

const latestAccepted = computed(() => acceptedStates.value[acceptedStates.value.length - 1] || null);
const latestPending = computed(() => pendingChanges.value[pendingChanges.value.length - 1] || null);

// Timeline points, left → right: accepted milestones, pending ticks, then a
// synthetic "All changes" summary node (only when there are pending changes).
const points = computed(() => {
  const list = [
    ...acceptedStates.value.map((s) => ({
      id: s.id, kind: "accepted", at: s.acceptedAt, content: s.content,
      label: "Accepted", author: s.acceptedBy,
    })),
    ...pendingChanges.value.map((c) => ({
      id: c.id, kind: "pending", at: c.savedAt, content: c.content,
      label: `Pending #${c.seq}`, author: c.author,
    })),
  ];
  const latest = latestPending.value;
  if (latest) {
    list.push({
      id: "all-changes", kind: "summary", at: latest.savedAt,
      content: latest.content, label: "All changes", author: latest.author,
    });
  }
  return list;
});

const selectedPoint = computed(
  () => points.value.find((p) => p.id === selectedId.value) || points.value[points.value.length - 1] || null
);
const viewedContent = computed(() => selectedPoint.value?.content ?? "");

// Diff baseline depends on the node: the "All changes" summary diffs against the
// accepted baseline (cumulative); a regular node diffs against its predecessor
// (the delta that revision introduced).
const diffOldText = computed(() => {
  const pt = selectedPoint.value;
  if (!pt) return "";
  if (pt.kind === "summary") return latestAccepted.value?.content ?? "";
  const idx = points.value.findIndex((p) => p.id === pt.id);
  return points.value[idx - 1]?.content ?? "";
});
const title = computed(() => extractTitle(latestAccepted.value?.content || "") || props.docId);
const canEdit = computed(() => hooks.can("edit", { id: props.docId }));
const canAccept = computed(() => hooks.can("accept", { id: props.docId }));
const pendingCount = computed(() => pendingChanges.value.length);

// Download the currently-selected state (accepted / a pending change / the
// "All changes" summary) as a markdown file, named to reflect that state.
const baseName = computed(() => (props.docId || "document").replace(/\.md$/i, ""));
const downloadName = computed(() => {
  const pt = selectedPoint.value;
  if (pt?.kind === "summary") return `${baseName.value}.all-changes.md`;
  if (pt?.kind === "pending") {
    const slug = String(pt.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `${baseName.value}.${slug}.md`; // e.g. "doc.pending-2.md"
  }
  return `${baseName.value}.md`; // accepted (canonical)
});

function downloadCurrent() {
  const blob = new Blob([viewedContent.value ?? ""], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = downloadName.value;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function selectLatest() {
  // Default to the "All changes" summary when present, else the latest point.
  const pts = points.value;
  const summary = pts.find((p) => p.kind === "summary");
  selectedId.value = (summary ?? pts[pts.length - 1])?.id ?? null;
}

async function load() {
  loading.value = true;
  error.value = "";
  mode.value = "view";
  savedNote.value = "";
  showDiff.value = false;
  confirmingAccept.value = false;
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
// Selecting a different state cancels a pending Accept confirmation.
watch(selectedId, () => { confirmingAccept.value = false; });

function startEdit() {
  // Edit builds on the currently-selected state (latest by default).
  draft.value = selectedPoint.value?.content ?? "";
  savedNote.value = "";
  showDiff.value = false;
  confirmingAccept.value = false;
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
    selectLatest(); // back to the "All changes" summary
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

// Promote pending changes up to the selected pending state into a new accepted
// baseline (Stage 6 wires this to a git commit). Later pending changes rebase.
async function accept() {
  const point = selectedPoint.value;
  if (!point || (point.kind !== "pending" && point.kind !== "summary")) return;
  // "All changes" accepts everything (up to the latest pending change).
  const upToChangeId = point.kind === "summary" ? (latestPending.value?.id ?? null) : point.id;
  saving.value = true;
  error.value = "";
  try {
    const state = await hooks.acceptChanges(props.docId, { upToChangeId });
    const [acc, pend] = await Promise.all([
      hooks.listAcceptedStates(props.docId),
      hooks.listPendingChanges(props.docId),
    ]);
    acceptedStates.value = acc;
    pendingChanges.value = pend;
    selectedId.value = state.id;
    savedNote.value = "Accepted — new baseline established.";
    confirmingAccept.value = false;
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
        <template v-if="confirmingAccept">
          <span class="mt-doc__confirm">Accept “{{ selectedPoint?.label }}” as the new baseline?</span>
          <button type="button" class="mt-editor__btn" @click="confirmingAccept = false">Cancel</button>
          <button type="button" class="mt-editor__btn is-active" :disabled="saving" @click="accept">
            {{ saving ? "Accepting…" : "Confirm" }}
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="mt-editor__btn"
            :title="`Download ${downloadName}`"
            @click="downloadCurrent"
          >Download</button>
          <button
            v-if="pendingCount"
            type="button"
            class="mt-editor__btn"
            :class="{ 'is-active': showDiff }"
            @click="showDiff = !showDiff"
          >{{ showDiff ? "Hide changes" : "Show changes" }}</button>
          <button
            v-if="canAccept && (selectedPoint?.kind === 'pending' || selectedPoint?.kind === 'summary')"
            type="button"
            class="mt-editor__btn"
            @click="confirmingAccept = true"
          >Accept</button>
          <button v-if="canEdit" type="button" class="mt-editor__btn" @click="startEdit">Edit</button>
        </template>
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
          :old-text="diffOldText"
          :new-text="viewedContent"
        />
        <MarkdownRenderer v-else :content="viewedContent" />
      </template>

      <component :is="EditorComponent" v-else v-model="draft" />
    </template>
  </div>
</template>
