// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

// Public entry point for @2wav/markdown-track.

// The stylesheet is pulled into the build graph so the lib build extracts it to
// dist/markdown-track.css (consumed via "@2wav/markdown-track/style.css"). The
// built bundle does NOT auto-inject it — consumers import the CSS explicitly.
import "./styles/markdown-track.css";

export { default as MarkdownLibrary } from "./components/MarkdownLibrary.vue";
export { default as DocumentView } from "./components/DocumentView.vue";
export { default as MarkdownRenderer } from "./components/MarkdownRenderer.vue";
export { default as MarkdownEditor } from "./components/MarkdownEditor.vue";
export { default as ChangeTimeline } from "./components/ChangeTimeline.vue";
export { default as DiffView } from "./components/DiffView.vue";

export { createMarkdownTrack, REQUIRED_HOOKS } from "./config/createMarkdownTrack.js";
export { createInMemoryHooks } from "./config/inMemoryHooks.js";
export { provideMarkdownTrack, useMarkdownTrack } from "./composables/useMarkdownTrack.js";
export { extractTitle } from "./lib/title.js";

// Styles are published separately as "@2wav/markdown-track/style.css".
// For in-repo development, import "src/styles/markdown-track.css" directly.
