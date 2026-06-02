# Markdown Track

A Vue 3 component suite for managing collaborative editing of markdown documents:
a document library, a WYSIWYG / source editor, per-save **pending changes**, an
**accepted-state timeline**, colorized **diffs**, and an authorized **Accept**
workflow. Storage and identity are pluggable — you provide a small set of hooks,
so the library stays free of any particular backend (git, a database, an API, …).

> ⚠️ **Not yet published to npm.** The `@2wav/markdown-track` package name is
> reserved but **not** on the public registry yet. Install from git for now
> (see below). The API may change before the first published release.

## Install

Once published:

```bash
npm install @2wav/markdown-track
```

Until then, install from the repository:

```bash
npm install github:anderson-2wav/markdown-track
```

### Peer dependencies

- **`vue`** (`^3.3`) — required; your app provides the single Vue instance.
- **`mermaid`** (`^11`) — *optional*. Install it only if your documents use
  ` ```mermaid ` blocks; it is dynamically imported and never loaded otherwise.

```bash
npm install vue
npm install mermaid   # optional, for diagram rendering
```

TypeScript declarations are bundled (`index.d.ts`).

## Concepts

The library is **UI + a contract**. You implement a set of **hooks** that handle
identity, access control, and document storage; the components call them. A
document has:

- an **accepted state** — the current canonical version (its history is the
  accepted timeline), and
- **pending changes** — each user save, in order, until someone with permission
  **Accepts** them into a new accepted state.

The included reference hooks keep everything in memory; a real deployment backs
them with whatever you like.

## Quick start

```vue
<!-- App.vue -->
<script setup>
import { ref } from "vue";
import {
  createMarkdownTrack,
  provideMarkdownTrack,
  createInMemoryHooks,
  MarkdownLibrary,
  DocumentView,
} from "@2wav/markdown-track";
import "@2wav/markdown-track/style.css";

// Replace createInMemoryHooks(...) with your own hooks (see "The hooks contract").
const config = createMarkdownTrack({
  ...createInMemoryHooks({
    documents: [
      { id: "readme", filename: "README.md", content: "# Hello\n\nEdit me." },
    ],
  }),
  options: { editor: "v-md-editor" }, // or "tiptap"
});
provideMarkdownTrack(config);

const selectedId = ref(null);
</script>

<template>
  <div class="mt-root">
    <MarkdownLibrary v-if="!selectedId" @select="(id) => (selectedId = id)" />
    <DocumentView v-else :doc-id="selectedId" @back="selectedId = null" />
  </div>
</template>
```

`provideMarkdownTrack` must run in an ancestor of the components (it uses Vue
`provide`/`inject`). Inside descendants you can also call `useMarkdownTrack()` to
read the config.

## The hooks contract

Pass an object implementing every hook to `createMarkdownTrack`. It throws if any
are missing.

| Hook | Signature | Purpose |
|---|---|---|
| `getCurrentUser` | `() => User` | The acting user. |
| `can` | `(action, doc) => boolean` | Authorize `'view' \| 'edit' \| 'accept'`. |
| `listDocuments` | `() => Promise<DocMeta[]>` | The library listing. |
| `readAcceptedState` | `(docId) => Promise<AcceptedState>` | Current accepted version. |
| `listAcceptedStates` | `(docId) => Promise<AcceptedState[]>` | Accepted history (oldest→newest). |
| `listPendingChanges` | `(docId) => Promise<PendingChange[]>` | Pending changes since the last accept. |
| `savePendingChange` | `(docId, { content }) => Promise<PendingChange>` | Record a save. |
| `acceptChanges` | `(docId, { upToChangeId? }) => Promise<AcceptedState>` | Promote pending → new accepted state. |

### Data shapes

```ts
interface User          { id: string; email?: string; name?: string }
interface DocMeta       { id: string; filename: string; title?: string }
interface AcceptedState { id: string; docId: string; content: string;
                          acceptedBy: User; acceptedAt: string; ref: string }
interface PendingChange { id: string; docId: string; content: string;
                          author: User; savedAt: string; seq: number; baseRef?: string }
```

Notes:
- `content` is **markdown** throughout (the source of truth).
- `DocMeta.title` is optional; provide it (e.g. the document's lone top-level
  `#` heading) and the library shows it, otherwise it falls back to `filename`.
  The `extractTitle(markdown)` helper is exported for this.
- `acceptChanges` with `upToChangeId` accepts up to a specific pending change and
  rebases any later ones; without it, it accepts everything.

### Optional hooks

| Hook | Signature | Purpose |
|---|---|---|
| `onEvent` | `(event: TrackEvent) => void` | Receive lifecycle notifications (see below). Omit it and nothing is reported. |

## Event notifications

Supply an optional `onEvent` hook to observe what the user is doing — entering
and leaving the library, and selecting, saving, or leaving documents. It is
**fire-and-forget**: the library never depends on what it returns, and any error
it throws is swallowed, so reporting can never break the UI. Use it for audit
logging, analytics, or presence.

```js
const config = createMarkdownTrack({
  ...yourHooks,
  onEvent(event) {
    // { action, currentUser, library, docId, timestamp }
    console.log("[markdown-track]", event.action, event);
  },
  options: { library: "my-library" }, // optional id, echoed on every event
});
```

### Actions

| `action` | Fired when | `docId` |
|---|---|---|
| `enter-library` | the document library opens | `null` |
| `leave-library` | the document library closes | `null` |
| `select-document` | a document opens (incl. switching directly between documents) | the document |
| `save-document` | a pending change is saved successfully | the document |
| `leave-document` | a document closes (incl. before switching to another) | the document |

Switching straight from one document to another (without returning to the
library) emits `leave-document` for the old one, then `select-document` for the
new one.

### Event shape

```ts
type TrackEventAction =
  | "enter-library" | "leave-library"
  | "select-document" | "save-document" | "leave-document";

interface TrackEvent {
  action: TrackEventAction;
  currentUser: User | null;   // from getCurrentUser(); null if it is unavailable
  library: string | null;     // options.library, or null
  docId: string | null;       // the document for doc-scoped actions, else null
  timestamp: string;          // ISO 8601
}
```

`TRACK_EVENTS` (the action constants) and `emitTrackEvent` are also exported, for
hosts that want to dispatch their own events through the same path.

## Components

| Component | Props | Emits | Notes |
|---|---|---|---|
| `MarkdownLibrary` | — | `select(docId)` | Lists viewable documents. |
| `DocumentView` | `docId: string` | `back` | The full editor: read view, editor, timeline, per-state **download**, diff, Accept. |
| `MarkdownRenderer` | `content?: string` | — | Read-only render (marked + optional mermaid). |
| `MarkdownEditor` | `modelValue?: string` (v-model) | `update:modelValue` | TipTap WYSIWYG editor. |
| `ChangeTimeline` | `points`, `selectedId` | `select(id)` | The accepted/pending timeline. |
| `DiffView` | `oldText?`, `newText?` | — | Unified colorized diff. |

Most apps only need `MarkdownLibrary` + `DocumentView`; the others are exposed for
custom layouts.

## Editor selection

`options.editor` chooses the editing experience:

- **`'v-md-editor'`** *(default)* — markdown source + live preview. Faithful: it
  never rewrites your markdown, so non-standard / nested constructs survive
  exactly. Built on [`@kangc/v-md-editor`](https://www.npmjs.com/package/@kangc/v-md-editor).
- **`'tiptap'`** — true WYSIWYG (hides markdown syntax). Convenient for
  non-technical authors, but its markdown round-trip can normalize/rewrite
  unusual markdown. Built on [TipTap](https://tiptap.dev).

## Hiding early history

Set `options.hideHistoryBefore` to a cutoff date to drop everything in the
timeline (accepted states **and** pending changes) from before it — so a
document opens at the version you want to show, with the original authoring steps
hidden:

```js
const config = createMarkdownTrack({
  ...yourHooks,
  options: {
    // Hide every revision before this point. Date | ISO string | epoch ms.
    hideHistoryBefore: "2026-05-01T00:00:00Z",
  },
});
```

- Accepts a `Date`, an ISO-8601 string, or an epoch-millisecond number.
- **Inclusive** — a revision dated exactly at the cutoff is kept, so you can pass
  the timestamp of the first version you want shown.
- Applies to **every** document (one cutoff for the whole library, for now).
- **Presentation only.** The underlying data is untouched; this filters what the
  timeline renders, it does not delete or alter any accepted state or pending
  change. It is not an access control — pair it with your `can`/storage hooks if
  earlier content must be truly unavailable.

## Styling

Import the stylesheet once:

```js
import "@2wav/markdown-track/style.css";
```

All visuals are driven by CSS custom properties under the `--mt-*` namespace, so
you re-theme by redefining tokens on `.mt-root` (or any ancestor) — no rule
overrides needed:

```css
.mt-root {
  --mt-color-accent: #6d28d9;
  --mt-color-fg: #1f2328;
  --mt-color-border: #d0d7de;
  --mt-radius: 8px;
  /* …see the stylesheet for the full token list */
}
```

Class names are BEM (`.mt-library`, `.mt-doc__title`, `.mt-diff__line--added`, …).
No Tailwind.

## Development

```bash
npm install      # dev tooling (Vite, @vitejs/plugin-vue, jsdom)
npm test         # unit tests (node --test)
npm run build    # build dist/ (ESM + CJS + extracted CSS)
```

`npm run build` (via `vite.lib.config.mjs`) externalizes all third-party deps and
emits `dist/markdown-track.js` (ESM), `dist/markdown-track.cjs` (CJS), and
`dist/markdown-track.css`. The built `dist/` is committed so the package can be
consumed directly from git without a build step.

## License

Licensed under the **GNU Lesser General Public License v3.0 or later**
(LGPL-3.0-or-later). See [`LICENSE`](./LICENSE).

Copyright © 2026 Anderson Wiese / 2wav, Inc.
