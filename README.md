# Markdown Track

A Vue 3 component suite to manage markdown file collaboration.

## Install

```bash
npm install @2wav/markdown-track vue
```

`vue` (^3.4) is a peer dependency — your app provides it.

## Usage

```js
import { /* components */ } from "@2wav/markdown-track";
import "@2wav/markdown-track/style.css";
```

> Components are added to the public entry (`src/index.js`) as they are built.

## Develop

```bash
npm install        # install dev deps (Vite, @vitejs/plugin-vue)
npm run dev        # Vite dev server
npm run build      # library build -> dist/ (ESM + UMD + CSS)
```

`npm run build` produces `dist/markdown-track.js` (ESM), `dist/markdown-track.umd.cjs`
(UMD), and `dist/markdown-track.css`. `dist/` is gitignored and built on publish
(`prepublishOnly`).

## License

Licensed under the **GNU Lesser General Public License v3.0 or later** (LGPL-3.0-or-later).
See [`LICENSE`](./LICENSE).

Copyright © 2026 Anderson Wiese / 2wav, Inc.
