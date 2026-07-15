# Markdown Track

A Vue 3 component suite for managing collaborative editing of markdown documents:
a document library, a WYSIWYG / source editor, per-save **pending changes**, an
**accepted-state timeline**, colorized **diffs**, and an authorized **Accept**
workflow. Storage and identity are pluggable — you provide a small set of hooks,
so the library stays free of any particular backend (git, a database, an API, …).

> ⚠️ **Not yet published to npm.** The `@2wav/markdown-track` package name is
> reserved but **not** on the public registry yet. Install from git for now
> (see below). The API may change before the first published release.

## Contents

- [Install](#install)
- [Concepts](#concepts)
- [Quick start](#quick-start)
- [The hooks contract](#the-hooks-contract)
- [Event notifications](#event-notifications)
- [Components](#components)
- [Routing & deep-linking](#routing--deep-linking)
- [Editor selection](#editor-selection)
- [Hiding early history](#hiding-early-history)
- [Access control (optional)](#access-control-optional)
- [Styling](#styling)
- [Development](#development)
- [License](#license)

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
| `can` | `(action, doc) => boolean` | Authorize `'view' \| 'edit' \| 'accept' \| 'set-access'`. |
| `listDocuments` | `() => Promise<DocMeta[]>` | The library listing. |
| `readAcceptedState` | `(docId) => Promise<AcceptedState>` | Current accepted version. |
| `listAcceptedStates` | `(docId) => Promise<AcceptedState[]>` | Accepted history (oldest→newest). |
| `listPendingChanges` | `(docId) => Promise<PendingChange[]>` | Pending changes since the last accept. |
| `savePendingChange` | `(docId, { content }) => Promise<PendingChange>` | Record a save. |
| `acceptChanges` | `(docId, { upToChangeId? }) => Promise<AcceptedState>` | Promote pending → new accepted state. |

### Data shapes

```ts
interface User          { id: string; email?: string; name?: string }
interface DocMeta       { id: string; filename: string; title?: string; access?: string[] }
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
- `DocMeta.access` (optional) carries the document's parsed `<!-- Access: … -->`
  tokens; see **Access control** below. Absent = unrestricted.
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

## Routing & deep-linking

The library is **router-agnostic** — it ships no routes and holds no selection
state. `DocumentView` takes a `docId` prop, `MarkdownLibrary` emits
`select(docId)`, and *which* document is shown is entirely the host's decision
(the Quick start keeps it in a local `ref`). To make documents deep-linkable, map
a URL segment to a `docId` and drive that same prop from your router.

Since `docId` is whatever `listDocuments` returns as `id`, using the filename as
the id gives clean URLs for free: `/docs/Guide.md` → `docId` `"Guide.md"`.

**The pattern (two-way):**

1. **URL → view.** Resolve the `docId` from the route and validate it against
   `listDocuments()` (fetched once). If it names no viewable document — unknown,
   renamed, or access-filtered — fall back to the library and normalize the URL.
2. **View → URL.** On `select` / `back`, push or replace the route so links,
   browser back/forward, and refresh all stay in sync.
3. Show a brief **loading** state until the list resolves, so a cold deep-link
   doesn't flash the library before honoring the link.

Framework-agnostic sketch:

```js
const docId    = /* the id from your route */;
const validIds = new Set((await listDocuments()).map((d) => d.id));
const selected = validIds.has(docId) ? docId : null;   // else → show the library
// select(id) → route to `.../${id}` ; back → route to the library path
```

### Nuxt

Nuxt derives routes from `pages/`, auto-imports its composables, and renders on
the server first — three things to get right:

- **Optional dynamic segment** — one page serves both the library and a document:

  ```
  pages/docs/[[docId]].vue      # matches /docs AND /docs/Guide.md
  ```

  Use a catch-all `pages/docs/[[slug]].vue` (with `slug?.join("/")`) if your ids
  can contain `/`.

- **Fetch the id set with `useAsyncData`, not a bare `.then()`** — it runs on the
  server and ships the result in the payload, so a deep link renders the right
  view with no hydration flash. `useRoute` / `navigateTo` are auto-imports:

  ```vue
  <script setup>
  const route  = useRoute();
  const config = useMarkdownTrack();   // provided once in a layout/plugin (below)
  const { data: ids } = await useAsyncData("mt-doc-ids", async () =>
    (await config.hooks.listDocuments()).map((d) => d.id)
  );
  const validIds   = computed(() => new Set(ids.value ?? []));
  const docId      = computed(() => route.params.docId || null);
  const selectedId = computed(() =>
    docId.value && validIds.value.has(docId.value) ? docId.value : null
  );
  // Normalize a bad id where SSR honors it (setup/middleware), not a client watch:
  if (docId.value && ids.value && !validIds.value.has(docId.value)) {
    await navigateTo("/docs", { replace: true });
  }
  const openDoc = (id) => navigateTo(`/docs/${encodeURIComponent(id)}`);
  </script>

  <template>
    <MarkdownLibrary v-if="!selectedId" @select="openDoc" />
    <DocumentView v-else :doc-id="selectedId" @back="() => navigateTo('/docs')" />
  </template>
  ```

- **`provideMarkdownTrack`** must run in an ancestor — call it once in a layout or
  plugin (with `import "@2wav/markdown-track/style.css"`), not per page.

**Links inside rendered markdown.** A markdown link like `[Guide](/docs/Guide.md)`
renders as a plain same-origin anchor: it works, but triggers a full navigation (a
fresh SSR round-trip in Nuxt) rather than client-side routing. If you want
in-document links to route client-side, intercept same-origin clicks on the
rendered output and hand them to `navigateTo` — an optional enhancement; the
default full navigation is correct either way.

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

## Access control (optional)

A document may declare who can see it with a single HTML comment, matched anywhere
(last one wins):

    <!-- Access: admin, projects_admin, sam@example.org -->

The tokens are **opaque** to the library — it only parses and trims them (via the
exported `extractAccess`) and calls your hooks. **The library parses; your `can()`
enforces.** Two actions do the work:

- **`can('view', doc)`** gates both the library listing and opening a document.
  Typical logic: allow if the user is an admin, the document is unrestricted
  (`doc.access == null`), or the user's keys intersect `doc.access`.
- **`can('set-access', doc)`** decides who may change the `Access:` line. When a
  user *without* it saves an edit that alters the line, the library **reverts just
  that line and keeps their other changes**, notifying them — you only answer the
  hook.

Give admins a bypass on `view`, `set-access`, **and** `accept`, so a document can
never lock everyone (including admins) out.

**Wiring it up (host side):**

1. **Surface the tokens.** Populate `DocMeta.access` from each document's parsed
   marker in `listDocuments`, so the library can filter the listing
   (`MarkdownLibrary` already drops entries your `can('view')` rejects):

   ```js
   import { extractAccess } from "@2wav/markdown-track";
   // inside listDocuments(), per document:
   const access = extractAccess(effectiveContent) ?? undefined; // string[] | undefined
   return { id, filename, title, access };
   ```

2. **Implement `can`:**

   ```js
   function can(action, doc) {
     if (isAdmin(currentUser)) return true;                  // bypass — no lockout
     if (action === "accept" || action === "set-access") return false;
     if (action === "view") {
       const a = doc?.access;
       if (a == null) return true;         // no marker → unrestricted
       if (a.length === 0) return false;   // `<!-- Access: -->` → your call
       return a.some((tok) => userKeys(currentUser).includes(tok));
     }
     return true;                           // 'edit', etc.
   }
   ```

3. **Latest pending governs.** Derive `access` (and the view decision) from each
   document's *effective* content — the latest pending change if any, else the
   accepted state — so an admin can change access live through a pending edit.
   Pass whichever content is effective to `extractAccess`.

`extractAccess(markdown)` returns the trimmed tokens, `[]` for an empty marker, or
`null` when there's no marker.

> **Not a security boundary.** This hides documents in the UI and politely blocks
> access; it is **not** confidentiality. Anyone able to call your read hooks (or
> the underlying store) can fetch the raw markdown, including the `Access:` line.
> If you need real confidentiality, enforce it in your server-side read path.

**Nuxt / SSR.** Your hooks run on the server (Nitro) as well as the client, so
parse access in `listDocuments` server-side. A deep link to a restricted document
then falls back to the library during SSR — it simply isn't in the filtered list —
with no flash.

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
