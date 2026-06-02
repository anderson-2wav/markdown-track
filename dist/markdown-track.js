import { provide as Ce, inject as $e, ref as $, onMounted as B, onBeforeUnmount as K, createElementBlock as d, openBlock as u, createElementVNode as m, toDisplayString as C, Fragment as I, renderList as Q, createCommentVNode as A, watch as q, nextTick as Ee, shallowRef as Te, withDirectives as se, normalizeClass as x, createVNode as Se, unref as xe, vShow as ae, computed as w, createTextVNode as Ae, defineAsyncComponent as Me, createBlock as z, resolveDynamicComponent as Ie } from "vue";
import { marked as ue } from "marked";
import { gfmHeadingId as Le } from "marked-gfm-heading-id";
import { Editor as De, EditorContent as Oe } from "@tiptap/vue-3";
import Ne from "@tiptap/starter-kit";
import Re from "@tiptap/extension-link";
import { Markdown as Ve } from "tiptap-markdown";
import { scalePoint as Ue } from "d3-scale";
import { diffLines as Pe } from "diff";
const de = Symbol("markdown-track");
function Jt(e) {
  return Ce(de, e), e;
}
function me() {
  const e = $e(de, null);
  if (!e)
    throw new Error(
      "useMarkdownTrack(): no markdown-track provider found. Call provideMarkdownTrack(createMarkdownTrack(...)) in a parent component."
    );
  return e;
}
const V = Object.freeze({
  ENTER_LIBRARY: "enter-library",
  SELECT_DOCUMENT: "select-document",
  SAVE_DOCUMENT: "save-document",
  LEAVE_DOCUMENT: "leave-document",
  LEAVE_LIBRARY: "leave-library"
});
function U(e, r, s = {}) {
  var l, g, h, a;
  const t = (l = e == null ? void 0 : e.hooks) == null ? void 0 : l.onEvent;
  if (typeof t != "function") return;
  let o = null;
  try {
    o = ((h = (g = e.hooks).getCurrentUser) == null ? void 0 : h.call(g)) ?? null;
  } catch {
    o = null;
  }
  const c = {
    action: r,
    currentUser: o,
    library: ((a = e == null ? void 0 : e.options) == null ? void 0 : a.library) ?? null,
    docId: s.docId ?? null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    t(c);
  } catch {
  }
  return c;
}
const Be = { class: "mt-library" }, He = {
  key: 0,
  class: "mt-library__status"
}, je = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, ze = {
  key: 2,
  class: "mt-library__status"
}, qe = {
  key: 3,
  class: "mt-library__list"
}, Ke = ["onClick"], Ye = { class: "mt-library__title" }, Fe = {
  key: 0,
  class: "mt-library__filename"
}, Gt = {
  __name: "MarkdownLibrary",
  emits: ["select"],
  setup(e, { emit: r }) {
    const s = r, t = me(), { hooks: o } = t, c = $([]), l = $(!0), g = $("");
    B(async () => {
      U(t, V.ENTER_LIBRARY);
      try {
        const a = await o.listDocuments();
        c.value = a.filter((v) => o.can("view", v));
      } catch (a) {
        g.value = (a == null ? void 0 : a.message) || String(a);
      } finally {
        l.value = !1;
      }
    }), K(() => {
      U(t, V.LEAVE_LIBRARY);
    });
    const h = (a) => a.title || a.filename;
    return (a, v) => (u(), d("div", Be, [
      v[0] || (v[0] = m("h2", { class: "mt-library__heading" }, "Documents", -1)),
      l.value ? (u(), d("p", He, "Loading…")) : g.value ? (u(), d("p", je, C(g.value), 1)) : c.value.length ? (u(), d("ul", qe, [
        (u(!0), d(I, null, Q(c.value, (_) => (u(), d("li", {
          key: _.id,
          class: "mt-library__item"
        }, [
          m("button", {
            type: "button",
            class: "mt-library__link",
            onClick: (i) => s("select", _.id)
          }, [
            m("span", Ye, C(h(_)), 1),
            _.title && _.title !== _.filename ? (u(), d("span", Fe, C(_.filename), 1)) : A("", !0)
          ], 8, Ke)
        ]))), 128))
      ])) : (u(), d("p", ze, "No documents available."))
    ]));
  }
};
function We(e) {
  if (e == null) return null;
  const r = e instanceof Date ? e.getTime() : new Date(e).getTime();
  return Number.isNaN(r) ? null : r;
}
function Je(e) {
  const r = We(e);
  return r == null ? () => !0 : (s) => {
    const t = s instanceof Date ? s.getTime() : new Date(s).getTime();
    return Number.isNaN(t) ? !0 : t >= r;
  };
}
function ve(e) {
  if (typeof e != "string") return null;
  const r = [];
  let s = null;
  for (const t of e.split(`
`)) {
    const o = t.replace(/\r$/, ""), c = o.match(/^\s*(`{3,}|~{3,})/);
    if (c) {
      const g = c[1][0];
      s === null ? s = g : s === g && (s = null);
      continue;
    }
    if (s !== null) continue;
    const l = o.match(/^#\s+(.+?)\s*#*\s*$/);
    l && l[1].trim() && r.push(l[1].trim());
  }
  return r.length === 1 ? r[0] : null;
}
ue.use(Le());
function Ge(e) {
  return typeof e != "string" || e.length === 0 ? "" : ue.parse(e, { gfm: !0, breaks: !1 });
}
let le = !1;
function Qe(e) {
  return typeof e == "string" && /(^|\n)\s*```mermaid\b/.test(e);
}
async function Xe(e) {
  if (!e) return;
  const r = e.querySelectorAll("pre code.language-mermaid");
  if (!r.length) return;
  let s;
  try {
    s = (await import("mermaid")).default;
  } catch (t) {
    console.warn("markdown-track: 'mermaid' is not installed; leaving diagrams as code.", t);
    return;
  }
  le || (s.initialize({ startOnLoad: !1, securityLevel: "strict" }), le = !0);
  for (const t of r) {
    const o = t.closest("pre");
    if (!o) continue;
    const c = document.createElement("div");
    c.className = "mermaid", c.textContent = t.textContent, o.replaceWith(c);
  }
  try {
    await s.run({ nodes: e.querySelectorAll(".mermaid") });
  } catch (t) {
    console.warn("markdown-track: mermaid render error", t);
  }
}
const Ze = ["innerHTML"], et = {
  __name: "MarkdownRenderer",
  props: { content: { type: String, default: "" } },
  setup(e) {
    const r = e, s = $(null), t = $("");
    async function o() {
      t.value = Ge(r.content), await Ee(), s.value && Qe(r.content) && await Xe(s.value);
    }
    return B(o), q(() => r.content, o), (c, l) => (u(), d("div", {
      ref_key: "root",
      ref: s,
      class: "mt-markdown",
      innerHTML: t.value
    }, null, 8, Ze));
  }
};
function tt() {
  return [
    Ne,
    Re.configure({ openOnClick: !1 }),
    Ve.configure({
      html: !1,
      tightLists: !0,
      breaks: !1,
      transformPastedText: !0,
      transformCopiedText: !0
    })
  ];
}
function ie(e) {
  var r, s, t;
  return ((t = (s = (r = e == null ? void 0 : e.storage) == null ? void 0 : r.markdown) == null ? void 0 : s.getMarkdown) == null ? void 0 : t.call(s)) ?? "";
}
const nt = { class: "mt-editor" }, ot = {
  key: 0,
  class: "mt-editor__toolbar"
}, st = ["value"], at = {
  __name: "MarkdownEditor",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(e, { emit: r }) {
    const s = e, t = r, o = Te(null), c = $(!1);
    B(() => {
      o.value = new De({
        extensions: tt(),
        content: s.modelValue,
        // tiptap-markdown parses the markdown string
        onUpdate: ({ editor: h }) => t("update:modelValue", ie(h))
      });
    }), K(() => {
      var h;
      return (h = o.value) == null ? void 0 : h.destroy();
    }), q(
      () => s.modelValue,
      (h) => {
        o.value && h !== ie(o.value) && o.value.commands.setContent(h, !1);
      }
    );
    const l = (h) => o.value && h(o.value.chain().focus()), g = (h, a) => {
      var v;
      return ((v = o.value) == null ? void 0 : v.isActive(h, a)) ?? !1;
    };
    return (h, a) => (u(), d("div", nt, [
      o.value ? (u(), d("div", ot, [
        m("button", {
          type: "button",
          class: x(["mt-editor__btn", { "is-active": g("heading", { level: 1 }) }]),
          onClick: a[0] || (a[0] = (v) => l((_) => _.toggleHeading({ level: 1 }).run()))
        }, "H1", 2),
        m("button", {
          type: "button",
          class: x(["mt-editor__btn", { "is-active": g("heading", { level: 2 }) }]),
          onClick: a[1] || (a[1] = (v) => l((_) => _.toggleHeading({ level: 2 }).run()))
        }, "H2", 2),
        m("button", {
          type: "button",
          class: x(["mt-editor__btn", { "is-active": g("bold") }]),
          onClick: a[2] || (a[2] = (v) => l((_) => _.toggleBold().run()))
        }, a[7] || (a[7] = [
          m("b", null, "B", -1)
        ]), 2),
        m("button", {
          type: "button",
          class: x(["mt-editor__btn", { "is-active": g("italic") }]),
          onClick: a[3] || (a[3] = (v) => l((_) => _.toggleItalic().run()))
        }, a[8] || (a[8] = [
          m("i", null, "I", -1)
        ]), 2),
        m("button", {
          type: "button",
          class: x(["mt-editor__btn", { "is-active": g("bulletList") }]),
          onClick: a[4] || (a[4] = (v) => l((_) => _.toggleBulletList().run()))
        }, "• List", 2),
        m("button", {
          type: "button",
          class: x(["mt-editor__btn", { "is-active": g("codeBlock") }]),
          onClick: a[5] || (a[5] = (v) => l((_) => _.toggleCodeBlock().run()))
        }, "Code", 2),
        a[9] || (a[9] = m("span", { class: "mt-editor__spacer" }, null, -1)),
        m("button", {
          type: "button",
          class: x(["mt-editor__btn", { "is-active": c.value }]),
          onClick: a[6] || (a[6] = (v) => c.value = !c.value)
        }, "Source", 2)
      ])) : A("", !0),
      se(Se(xe(Oe), {
        editor: o.value,
        class: "mt-editor__content"
      }, null, 8, ["editor"]), [
        [ae, !c.value]
      ]),
      se(m("textarea", {
        class: "mt-editor__source",
        value: e.modelValue,
        readonly: "",
        spellcheck: "false"
      }, null, 8, st), [
        [ae, c.value]
      ])
    ]));
  }
}, lt = ["width"], it = ["x2"], rt = ["transform", "onClick"], ct = {
  key: 0,
  class: "mt-timeline__dot",
  x: "-6.5",
  y: "-6.5",
  width: "13",
  height: "13",
  transform: "rotate(45)"
}, ut = ["r"], dt = {
  key: 0,
  class: "mt-timeline__caption"
}, mt = ["disabled"], vt = ["disabled"], ft = { class: "mt-timeline__label" }, pt = { key: 0 }, R = 24, _t = 44, G = 22, yt = {
  __name: "ChangeTimeline",
  props: {
    // [{ id, kind: 'accepted'|'pending', at, label, author? }]
    points: { type: Array, default: () => [] },
    selectedId: { type: String, default: null }
  },
  emits: ["select"],
  setup(e, { emit: r }) {
    const s = e, t = r, o = $(null), c = $(600);
    let l = null;
    B(() => {
      o.value && (c.value = o.value.clientWidth || 600, l = new ResizeObserver(() => {
        c.value = o.value.clientWidth || 600;
      }), l.observe(o.value));
    }), K(() => l == null ? void 0 : l.disconnect());
    const g = w(
      () => Ue().domain(s.points.map((p) => p.id)).range([R, Math.max(R + 1, c.value - R)]).padding(0.5)
    ), h = w(
      () => s.points.map((p) => ({ ...p, x: g.value(p.id) ?? R }))
    ), a = w(() => s.points.findIndex((p) => p.id === s.selectedId)), v = w(() => s.points[a.value] || null);
    function _(p) {
      const k = a.value + p;
      k >= 0 && k < s.points.length && t("select", s.points[k].id);
    }
    const i = (p) => {
      try {
        return new Date(p).toLocaleString();
      } catch {
        return String(p);
      }
    };
    return (p, k) => (u(), d("div", {
      ref_key: "root",
      ref: o,
      class: "mt-timeline"
    }, [
      (u(), d("svg", {
        width: c.value,
        height: _t,
        class: "mt-timeline__svg",
        role: "group",
        "aria-label": "Change timeline"
      }, [
        m("line", {
          class: "mt-timeline__track",
          x1: R,
          y1: G,
          x2: Math.max(R, c.value - R),
          y2: G
        }, null, 8, it),
        (u(!0), d(I, null, Q(h.value, (y) => (u(), d("g", {
          key: y.id,
          class: x(["mt-timeline__point", [`mt-timeline__point--${y.kind}`, { "is-selected": y.id === e.selectedId }]]),
          transform: `translate(${y.x},${G})`,
          onClick: (T) => t("select", y.id)
        }, [
          k[2] || (k[2] = m("circle", {
            r: "11",
            class: "mt-timeline__hit"
          }, null, -1)),
          y.kind === "summary" ? (u(), d("rect", ct)) : (u(), d("circle", {
            key: 1,
            r: y.kind === "accepted" ? 7 : 4.5,
            class: "mt-timeline__dot"
          }, null, 8, ut)),
          m("title", null, C(y.label) + " — " + C(i(y.at)), 1)
        ], 10, rt))), 128))
      ], 8, lt)),
      v.value ? (u(), d("div", dt, [
        m("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: a.value <= 0,
          onClick: k[0] || (k[0] = (y) => _(-1))
        }, "‹", 8, mt),
        m("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: a.value >= e.points.length - 1,
          onClick: k[1] || (k[1] = (y) => _(1))
        }, "›", 8, vt),
        m("span", ft, [
          m("strong", null, C(v.value.label), 1),
          m("span", null, " · " + C(i(v.value.at)), 1),
          v.value.author ? (u(), d("span", pt, " · " + C(v.value.author.email), 1)) : A("", !0)
        ])
      ])) : A("", !0)
    ], 512));
  }
};
function gt(e, r) {
  const s = Pe(e ?? "", r ?? ""), t = [];
  for (const o of s) {
    const c = o.added ? "added" : o.removed ? "removed" : "context", l = o.value.split(`
`);
    l.length && l[l.length - 1] === "" && l.pop();
    for (const g of l) t.push({ type: c, text: g });
  }
  return t;
}
function kt(e) {
  let r = 0, s = 0;
  for (const t of e)
    t.type === "added" ? r += 1 : t.type === "removed" && (s += 1);
  return { added: r, removed: s };
}
const bt = { class: "mt-diff" }, ht = { class: "mt-diff__stats" }, wt = { class: "mt-diff__stat mt-diff__stat--added" }, Ct = { class: "mt-diff__stat mt-diff__stat--removed" }, $t = {
  key: 0,
  class: "mt-library__status"
}, Et = {
  key: 1,
  class: "mt-diff__body"
}, Tt = { class: "mt-diff__gutter" }, St = { class: "mt-diff__text" }, xt = {
  __name: "DiffView",
  props: {
    oldText: { type: String, default: "" },
    newText: { type: String, default: "" }
  },
  setup(e) {
    const r = e, s = w(() => gt(r.oldText, r.newText)), t = w(() => kt(s.value)), o = w(() => t.value.added > 0 || t.value.removed > 0), c = (l) => l === "added" ? "+" : l === "removed" ? "−" : " ";
    return (l, g) => (u(), d("div", bt, [
      m("div", ht, [
        m("span", wt, "+" + C(t.value.added), 1),
        m("span", Ct, "−" + C(t.value.removed), 1)
      ]),
      o.value ? (u(), d("pre", Et, [
        (u(!0), d(I, null, Q(s.value, (h, a) => (u(), d("span", {
          key: a,
          class: x(["mt-diff__line", `mt-diff__line--${h.type}`])
        }, [
          m("span", Tt, C(c(h.type)), 1),
          m("span", St, C(h.text), 1),
          g[0] || (g[0] = Ae(`
`))
        ], 2))), 128))
      ])) : (u(), d("p", $t, "No changes from the accepted version."))
    ]));
  }
}, At = { class: "mt-doc" }, Mt = { class: "mt-doc__bar" }, It = { class: "mt-doc__title" }, Lt = {
  key: 0,
  class: "mt-doc__pending"
}, Dt = { class: "mt-doc__confirm" }, Ot = ["disabled"], Nt = ["title"], Rt = ["disabled"], Vt = {
  key: 0,
  class: "mt-library__status"
}, Ut = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Pt = {
  key: 0,
  class: "mt-doc__note"
}, Qt = {
  __name: "DocumentView",
  props: { docId: { type: String, required: !0 } },
  emits: ["back"],
  setup(e, { emit: r }) {
    const s = Me(() => import("./MarkdownEditorVMd-CIGKbg-C.js")), t = e, o = r, c = me(), { hooks: l, options: g } = c, h = w(
      () => g.editor === "tiptap" ? at : s
    ), a = $([]), v = $([]), _ = $(!0), i = $(""), p = $("view"), k = $(""), y = $(!1), T = $(""), D = $(null), S = $(!1), O = $(!1), X = w(() => Je(g.hideHistoryBefore)), Y = w(
      () => a.value.filter((n) => X.value(n.acceptedAt))
    ), H = w(
      () => v.value.filter((n) => X.value(n.savedAt))
    ), Z = w(() => Y.value[Y.value.length - 1] || null), ee = w(() => H.value[H.value.length - 1] || null), L = w(() => {
      const n = [
        ...Y.value.map((b) => ({
          id: b.id,
          kind: "accepted",
          at: b.acceptedAt,
          content: b.content,
          label: "Accepted",
          author: b.acceptedBy
        })),
        ...H.value.map((b) => ({
          id: b.id,
          kind: "pending",
          at: b.savedAt,
          content: b.content,
          label: `Pending #${b.seq}`,
          author: b.author
        }))
      ], f = ee.value;
      return f && n.push({
        id: "all-changes",
        kind: "summary",
        at: f.savedAt,
        content: f.content,
        label: "All changes",
        author: f.author
      }), n;
    }), M = w(
      () => L.value.find((n) => n.id === D.value) || L.value[L.value.length - 1] || null
    ), F = w(() => {
      var n;
      return ((n = M.value) == null ? void 0 : n.content) ?? "";
    }), fe = w(() => {
      var b, E;
      const n = M.value;
      if (!n) return "";
      if (n.kind === "summary") return ((b = Z.value) == null ? void 0 : b.content) ?? "";
      const f = L.value.findIndex((P) => P.id === n.id);
      return ((E = L.value[f - 1]) == null ? void 0 : E.content) ?? "";
    }), pe = w(() => {
      var n;
      return ve(((n = Z.value) == null ? void 0 : n.content) || "") || t.docId;
    }), _e = w(() => l.can("edit", { id: t.docId })), ye = w(() => l.can("accept", { id: t.docId })), W = w(() => H.value.length), J = w(() => (t.docId || "document").replace(/\.md$/i, "")), te = w(() => {
      const n = M.value;
      if ((n == null ? void 0 : n.kind) === "summary") return `${J.value}.all-changes.md`;
      if ((n == null ? void 0 : n.kind) === "pending") {
        const f = String(n.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return `${J.value}.${f}.md`;
      }
      return `${J.value}.md`;
    });
    function ge() {
      const n = new Blob([F.value ?? ""], { type: "text/markdown;charset=utf-8" }), f = URL.createObjectURL(n), b = document.createElement("a");
      b.href = f, b.download = te.value, document.body.appendChild(b), b.click(), b.remove(), URL.revokeObjectURL(f);
    }
    function ne() {
      var b;
      const n = L.value, f = n.find((E) => E.kind === "summary");
      D.value = ((b = f ?? n[n.length - 1]) == null ? void 0 : b.id) ?? null;
    }
    async function oe() {
      _.value = !0, i.value = "", p.value = "view", T.value = "", S.value = !1, O.value = !1;
      try {
        const [n, f] = await Promise.all([
          l.listAcceptedStates(t.docId),
          l.listPendingChanges(t.docId)
        ]);
        a.value = n, v.value = f, ne();
      } catch (n) {
        i.value = (n == null ? void 0 : n.message) || String(n);
      } finally {
        _.value = !1;
      }
    }
    B(() => {
      U(c, V.SELECT_DOCUMENT, { docId: t.docId }), oe();
    }), q(() => t.docId, (n, f) => {
      f && U(c, V.LEAVE_DOCUMENT, { docId: f }), U(c, V.SELECT_DOCUMENT, { docId: n }), oe();
    }), K(() => {
      U(c, V.LEAVE_DOCUMENT, { docId: t.docId });
    }), q(D, () => {
      O.value = !1;
    });
    function ke() {
      var n;
      k.value = ((n = M.value) == null ? void 0 : n.content) ?? "", T.value = "", S.value = !1, O.value = !1, p.value = "edit";
    }
    function be() {
      p.value = "view";
    }
    async function he() {
      y.value = !0, i.value = "";
      try {
        const n = await l.savePendingChange(t.docId, { content: k.value });
        U(c, V.SAVE_DOCUMENT, { docId: t.docId }), v.value = await l.listPendingChanges(t.docId), ne(), T.value = `Saved pending change (seq ${n.seq}).`, p.value = "view";
      } catch (n) {
        i.value = (n == null ? void 0 : n.message) || String(n);
      } finally {
        y.value = !1;
      }
    }
    async function we() {
      var b;
      const n = M.value;
      if (!n || n.kind !== "pending" && n.kind !== "summary") return;
      const f = n.kind === "summary" ? ((b = ee.value) == null ? void 0 : b.id) ?? null : n.id;
      y.value = !0, i.value = "";
      try {
        const E = await l.acceptChanges(t.docId, { upToChangeId: f }), [P, j] = await Promise.all([
          l.listAcceptedStates(t.docId),
          l.listPendingChanges(t.docId)
        ]);
        a.value = P, v.value = j, D.value = E.id, T.value = "Accepted — new baseline established.", O.value = !1;
      } catch (E) {
        i.value = (E == null ? void 0 : E.message) || String(E);
      } finally {
        y.value = !1;
      }
    }
    return (n, f) => {
      var b, E, P, j;
      return u(), d("div", At, [
        m("div", Mt, [
          m("button", {
            type: "button",
            class: "mt-editor__btn",
            onClick: f[0] || (f[0] = (N) => o("back"))
          }, "← Library"),
          m("h2", It, C(pe.value), 1),
          f[6] || (f[6] = m("span", { class: "mt-doc__spacer" }, null, -1)),
          W.value ? (u(), d("span", Lt, C(W.value) + " pending", 1)) : A("", !0),
          p.value === "view" ? (u(), d(I, { key: 1 }, [
            O.value ? (u(), d(I, { key: 0 }, [
              m("span", Dt, "Accept “" + C((b = M.value) == null ? void 0 : b.label) + "” as the new baseline?", 1),
              m("button", {
                type: "button",
                class: "mt-editor__btn",
                onClick: f[1] || (f[1] = (N) => O.value = !1)
              }, "Cancel"),
              m("button", {
                type: "button",
                class: "mt-editor__btn is-active",
                disabled: y.value,
                onClick: we
              }, C(y.value ? "Accepting…" : "Confirm"), 9, Ot)
            ], 64)) : (u(), d(I, { key: 1 }, [
              m("button", {
                type: "button",
                class: "mt-editor__btn",
                title: `Download ${te.value}`,
                onClick: ge
              }, "Download", 8, Nt),
              W.value ? (u(), d("button", {
                key: 0,
                type: "button",
                class: x(["mt-editor__btn", { "is-active": S.value }]),
                onClick: f[2] || (f[2] = (N) => S.value = !S.value)
              }, C(S.value ? "Hide changes" : "Show changes"), 3)) : A("", !0),
              ye.value && (((E = M.value) == null ? void 0 : E.kind) === "pending" || ((P = M.value) == null ? void 0 : P.kind) === "summary") ? (u(), d("button", {
                key: 1,
                type: "button",
                class: "mt-editor__btn",
                onClick: f[3] || (f[3] = (N) => O.value = !0)
              }, "Accept")) : A("", !0),
              _e.value ? (u(), d("button", {
                key: 2,
                type: "button",
                class: "mt-editor__btn",
                onClick: ke
              }, "Edit")) : A("", !0)
            ], 64))
          ], 64)) : (u(), d(I, { key: 2 }, [
            m("button", {
              type: "button",
              class: "mt-editor__btn",
              onClick: be
            }, "Cancel"),
            m("button", {
              type: "button",
              class: "mt-editor__btn is-active",
              disabled: y.value,
              onClick: he
            }, C(y.value ? "Saving…" : "Save"), 9, Rt)
          ], 64))
        ]),
        _.value ? (u(), d("p", Vt, "Loading…")) : i.value ? (u(), d("p", Ut, C(i.value), 1)) : (u(), d(I, { key: 2 }, [
          T.value ? (u(), d("p", Pt, C(T.value), 1)) : A("", !0),
          p.value === "view" ? (u(), d(I, { key: 1 }, [
            L.value.length > 1 ? (u(), z(yt, {
              key: 0,
              points: L.value,
              "selected-id": (j = M.value) == null ? void 0 : j.id,
              onSelect: f[4] || (f[4] = (N) => D.value = N)
            }, null, 8, ["points", "selected-id"])) : A("", !0),
            S.value ? (u(), z(xt, {
              key: 1,
              "old-text": fe.value,
              "new-text": F.value
            }, null, 8, ["old-text", "new-text"])) : (u(), z(et, {
              key: 2,
              content: F.value
            }, null, 8, ["content"]))
          ], 64)) : (u(), z(Ie(h.value), {
            key: 2,
            modelValue: k.value,
            "onUpdate:modelValue": f[5] || (f[5] = (N) => k.value = N)
          }, null, 8, ["modelValue"]))
        ], 64))
      ]);
    };
  }
}, re = Object.freeze([
  "getCurrentUser",
  "can",
  "listDocuments",
  "readAcceptedState",
  "listAcceptedStates",
  "listPendingChanges",
  "savePendingChange",
  "acceptChanges"
]), ce = Object.freeze(["onEvent"]);
function Xt(e = {}) {
  const r = re.filter(
    (o) => typeof e[o] != "function"
  );
  if (r.length > 0)
    throw new Error(
      `createMarkdownTrack: missing required hook(s): ${r.join(", ")}`
    );
  const s = ce.filter(
    (o) => e[o] != null && typeof e[o] != "function"
  );
  if (s.length > 0)
    throw new Error(
      `createMarkdownTrack: optional hook(s) must be functions: ${s.join(", ")}`
    );
  const t = {};
  for (const o of re) t[o] = e[o];
  for (const o of ce)
    typeof e[o] == "function" && (t[o] = e[o]);
  return Object.freeze({
    hooks: Object.freeze(t),
    options: Object.freeze({ ...e.options || {} })
  });
}
function Zt(e = {}) {
  const r = e.user || { id: "dev", email: "dev@example.com", name: "Dev User" }, s = e.can || (() => !0), t = () => e.clock ? e.clock() : (/* @__PURE__ */ new Date()).toISOString(), o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
  let g = 0, h = 0;
  const a = (i) => `${i}-${++h}`, v = (i) => JSON.parse(JSON.stringify(i));
  for (const i of e.documents || [])
    o.set(i.id, { id: i.id, filename: i.filename }), c.set(i.id, [
      {
        id: a("acc"),
        docId: i.id,
        content: i.content ?? "",
        acceptedBy: r,
        acceptedAt: t(),
        ref: "seed"
      }
    ]), l.set(i.id, []);
  const _ = (i) => {
    const p = c.get(i) || [];
    return p[p.length - 1];
  };
  return {
    getCurrentUser: () => v(r),
    can: (i, p) => s(i, p, r),
    listDocuments: async () => [...o.values()].map((i) => {
      var k;
      const p = ((k = _(i.id)) == null ? void 0 : k.content) ?? "";
      return v({ ...i, title: ve(p) ?? void 0 });
    }),
    readAcceptedState: async (i) => {
      const p = _(i);
      if (!p) throw new Error(`Unknown document: ${i}`);
      return v(p);
    },
    listAcceptedStates: async (i) => v(c.get(i) || []),
    listPendingChanges: async (i) => v(l.get(i) || []),
    savePendingChange: async (i, { content: p }) => {
      var y;
      if (!o.has(i)) throw new Error(`Unknown document: ${i}`);
      const k = {
        id: a("pend"),
        docId: i,
        content: p,
        author: v(r),
        savedAt: t(),
        seq: ++g,
        baseRef: (y = _(i)) == null ? void 0 : y.ref
      };
      return l.get(i).push(k), v(k);
    },
    acceptChanges: async (i, p = {}) => {
      const k = l.get(i) || [];
      if (k.length === 0) throw new Error("No pending changes to accept");
      let y = k[k.length - 1];
      p.upToChangeId && (y = k.find((S) => S.id === p.upToChangeId) || y);
      const T = {
        id: a("acc"),
        docId: i,
        content: y.content,
        acceptedBy: v(r),
        acceptedAt: t(),
        ref: `mem-${y.seq}`
      };
      c.get(i).push(T);
      const D = k.indexOf(y);
      return l.set(
        i,
        k.slice(D + 1).map((S) => ({ ...S, baseRef: T.ref }))
      ), v(T);
    }
  };
}
export {
  yt as ChangeTimeline,
  xt as DiffView,
  Qt as DocumentView,
  at as MarkdownEditor,
  Gt as MarkdownLibrary,
  et as MarkdownRenderer,
  ce as OPTIONAL_HOOKS,
  re as REQUIRED_HOOKS,
  V as TRACK_EVENTS,
  Zt as createInMemoryHooks,
  Xt as createMarkdownTrack,
  U as emitTrackEvent,
  ve as extractTitle,
  Jt as provideMarkdownTrack,
  me as useMarkdownTrack
};
