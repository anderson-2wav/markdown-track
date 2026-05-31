// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { inject, provide } from "vue";

const MARKDOWN_TRACK_KEY = Symbol("markdown-track");

/**
 * Provide a markdown-track config (from `createMarkdownTrack`) to descendant
 * components. Call this in the root component's `setup`.
 *
 * @param {{ hooks: object, options: object }} config
 * @returns {{ hooks: object, options: object }}
 */
export function provideMarkdownTrack(config) {
  provide(MARKDOWN_TRACK_KEY, config);
  return config;
}

/**
 * Inject the markdown-track config. Throws if no provider is present.
 *
 * @returns {{ hooks: object, options: object }}
 */
export function useMarkdownTrack() {
  const config = inject(MARKDOWN_TRACK_KEY, null);
  if (!config) {
    throw new Error(
      "useMarkdownTrack(): no markdown-track provider found. " +
        "Call provideMarkdownTrack(createMarkdownTrack(...)) in a parent component."
    );
  }
  return config;
}
