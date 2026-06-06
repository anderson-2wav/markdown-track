<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// Alternative editor: @kangc/v-md-editor (markdown source + live preview).
//
// Unlike the TipTap editor, this edits the RAW markdown directly — there is no
// ProseMirror round-trip, so the source is never rewritten and non-standard /
// nested markdown (e.g. CritterTrack's "- a./b./c." lettered lists) is preserved
// byte-for-byte. It also gives an editable source pane. Selected via
// `options.editor === 'v-md-editor'`; lazy-loaded by DocumentView so the TipTap
// path never pays v-md-editor's (heavier) bundle.
import VMdEditor from "@kangc/v-md-editor";
import "@kangc/v-md-editor/lib/style/base-editor.css";
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";
import hljs from "highlight.js";

VMdEditor.use(githubTheme, { Hljs: hljs });

defineProps({ modelValue: { type: String, default: "" } });
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <span>Please use the full-screen option for the best user experience. See <span style="display:inline; border: 2px solid red; ">&nbsp;&nbsp;</span>.</span>
  <VMdEditor
    class="mt-vmd"
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
    height="440px"
    left-toolbar="undo redo clear | h bold italic strikethrough | ul ol table hr | link code | preview"
  />
</template>

<style scoped>
.mt-vmd { border-radius: var(--mt-radius, 6px); overflow: hidden; }

:deep(.v-md-editor__toolbar-item-fullscreen) {
  border: 2px solid red;
}

</style>
