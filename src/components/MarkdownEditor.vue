<!-- Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later -->
<script setup>
// WYSIWYG markdown editor (TipTap + tiptap-markdown). v-model is the markdown
// string; the user edits rendered content and never sees raw markdown unless
// they flip the "Source" toggle (a read-only view of the serialized markdown).
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { editorExtensions, getMarkdown } from "../lib/editor.js";

const props = defineProps({ modelValue: { type: String, default: "" } });
const emit = defineEmits(["update:modelValue"]);

const editor = shallowRef(null);
const showSource = ref(false);

onMounted(() => {
  editor.value = new Editor({
    extensions: editorExtensions(),
    content: props.modelValue, // tiptap-markdown parses the markdown string
    onUpdate: ({ editor }) => emit("update:modelValue", getMarkdown(editor)),
  });
});

onBeforeUnmount(() => editor.value?.destroy());

// Reflect external content changes (e.g. switching documents) without clobbering
// the user's in-progress edits.
watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return;
    if (val !== getMarkdown(editor.value)) {
      editor.value.commands.setContent(val, false);
    }
  }
);

const run = (fn) => editor.value && fn(editor.value.chain().focus());
const isActive = (name, attrs) => editor.value?.isActive(name, attrs) ?? false;
</script>

<template>
  <div class="mt-editor">
    <div v-if="editor" class="mt-editor__toolbar">
      <button type="button" class="mt-editor__btn" :class="{ 'is-active': isActive('heading', { level: 1 }) }" @click="run((c) => c.toggleHeading({ level: 1 }).run())">H1</button>
      <button type="button" class="mt-editor__btn" :class="{ 'is-active': isActive('heading', { level: 2 }) }" @click="run((c) => c.toggleHeading({ level: 2 }).run())">H2</button>
      <button type="button" class="mt-editor__btn" :class="{ 'is-active': isActive('bold') }" @click="run((c) => c.toggleBold().run())"><b>B</b></button>
      <button type="button" class="mt-editor__btn" :class="{ 'is-active': isActive('italic') }" @click="run((c) => c.toggleItalic().run())"><i>I</i></button>
      <button type="button" class="mt-editor__btn" :class="{ 'is-active': isActive('bulletList') }" @click="run((c) => c.toggleBulletList().run())">• List</button>
      <button type="button" class="mt-editor__btn" :class="{ 'is-active': isActive('codeBlock') }" @click="run((c) => c.toggleCodeBlock().run())">Code</button>
      <span class="mt-editor__spacer"></span>
      <button type="button" class="mt-editor__btn" :class="{ 'is-active': showSource }" @click="showSource = !showSource">Source</button>
    </div>

    <EditorContent v-show="!showSource" :editor="editor" class="mt-editor__content" />
    <textarea v-show="showSource" class="mt-editor__source" :value="modelValue" readonly spellcheck="false"></textarea>
  </div>
</template>
