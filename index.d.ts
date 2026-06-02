// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
// Public type declarations for @2wav/markdown-track.
import type { DefineComponent } from "vue";

export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface DocMeta {
  id: string;
  filename: string;
  title?: string;
}

export interface AcceptedState {
  id: string;
  docId: string;
  content: string;
  acceptedBy: User;
  acceptedAt: string;
  ref: string;
}

export interface PendingChange {
  id: string;
  docId: string;
  content: string;
  author: User;
  savedAt: string;
  seq: number;
  baseRef?: string;
}

export type AccessAction = "view" | "edit" | "accept";

/** A lifecycle action reported through the optional `onEvent` hook. */
export type TrackEventAction =
  | "enter-library"
  | "select-document"
  | "save-document"
  | "leave-document"
  | "leave-library";

/** Fire-and-forget lifecycle notification payload. */
export interface TrackEvent {
  action: TrackEventAction;
  currentUser: User | null;
  /** Host-supplied library identifier (`options.library`), or null. */
  library: string | null;
  /** Document id for doc-scoped actions; null for library-scoped actions. */
  docId: string | null;
  /** ISO 8601 timestamp. */
  timestamp: string;
}

/** The host-provided I/O contract (identity, access control, document storage). */
export interface MarkdownTrackHooks {
  getCurrentUser(): User;
  can(action: AccessAction, doc: DocMeta): boolean;
  listDocuments(): Promise<DocMeta[]>;
  readAcceptedState(docId: string): Promise<AcceptedState>;
  listAcceptedStates(docId: string): Promise<AcceptedState[]>;
  listPendingChanges(docId: string): Promise<PendingChange[]>;
  savePendingChange(docId: string, change: { content: string }): Promise<PendingChange>;
  acceptChanges(docId: string, opts?: { upToChangeId?: string | null }): Promise<AcceptedState>;
  /** Optional. Receives lifecycle events (enter/leave library, select/save/leave document). */
  onEvent?(event: TrackEvent): void;
}

export interface MarkdownTrackOptions {
  /** Editor implementation. Default: 'v-md-editor'. */
  editor?: "v-md-editor" | "tiptap";
  /** Optional identifier for this library instance, surfaced on every TrackEvent. */
  library?: string;
  /**
   * Hide all timeline history (accepted states and pending changes) dated before
   * this cutoff, so a document's timeline begins at the version you want to show.
   * Accepts a Date, an ISO-8601 string, or an epoch-millisecond number. Inclusive:
   * items dated exactly at the cutoff are kept. Applies to every document. The
   * underlying data is untouched — only what the timeline renders is filtered.
   */
  hideHistoryBefore?: Date | string | number;
}

/** Lifecycle action constants (values match TrackEventAction). */
export const TRACK_EVENTS: Readonly<{
  ENTER_LIBRARY: "enter-library";
  SELECT_DOCUMENT: "select-document";
  SAVE_DOCUMENT: "save-document";
  LEAVE_DOCUMENT: "leave-document";
  LEAVE_LIBRARY: "leave-library";
}>;

/** Build a TrackEvent payload and dispatch it to the config's `onEvent` hook. Never throws. */
export function emitTrackEvent(
  config: MarkdownTrackConfig,
  action: TrackEventAction,
  detail?: { docId?: string | null }
): TrackEvent | undefined;

export interface MarkdownTrackConfig {
  hooks: MarkdownTrackHooks;
  options: MarkdownTrackOptions;
}

export const REQUIRED_HOOKS: ReadonlyArray<keyof MarkdownTrackHooks>;
export const OPTIONAL_HOOKS: ReadonlyArray<keyof MarkdownTrackHooks>;

/** Validate + normalize a markdown-track configuration. */
export function createMarkdownTrack(
  config: MarkdownTrackHooks & { options?: MarkdownTrackOptions }
): MarkdownTrackConfig;

/** In-memory reference hooks for development and tests. */
export function createInMemoryHooks(seed?: {
  documents?: Array<{ id: string; filename: string; content?: string }>;
  user?: User;
  can?: (action: AccessAction, doc: DocMeta, user: User) => boolean;
  clock?: () => string;
}): MarkdownTrackHooks;

/** Provide a config to descendant components (call in a root setup). */
export function provideMarkdownTrack(config: MarkdownTrackConfig): MarkdownTrackConfig;

/** Inject the provided config. Throws if no provider is present. */
export function useMarkdownTrack(): MarkdownTrackConfig;

/** Return a document's lone top-level `#` heading, else null. */
export function extractTitle(markdown: string): string | null;

export const MarkdownLibrary: DefineComponent<Record<string, never>>;
export const DocumentView: DefineComponent<{ docId: string }>;
export const MarkdownRenderer: DefineComponent<{ content?: string }>;
export const MarkdownEditor: DefineComponent<{ modelValue?: string }>;
export const ChangeTimeline: DefineComponent<{ points?: unknown[]; selectedId?: string | null }>;
export const DiffView: DefineComponent<{ oldText?: string; newText?: string }>;
