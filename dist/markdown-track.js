import { provide as xe, inject as Me, ref as $, onMounted as H, onBeforeUnmount as J, openBlock as u, createElementBlock as v, createElementVNode as p, toDisplayString as C, Fragment as D, renderList as te, createCommentVNode as x, watch as F, nextTick as Ie, shallowRef as Le, normalizeClass as M, withDirectives as re, createVNode as De, unref as Oe, vShow as ce, computed as k, createTextVNode as Ne, defineAsyncComponent as Re, createBlock as Y, resolveDynamicComponent as Ve } from "vue";
import { marked as fe } from "marked";
import { gfmHeadingId as Ue } from "marked-gfm-heading-id";
import { Editor as Pe, EditorContent as Be } from "@tiptap/vue-3";
import je from "@tiptap/starter-kit";
import He from "@tiptap/extension-link";
import { Markdown as qe } from "tiptap-markdown";
import { scalePoint as ze } from "d3-scale";
import { diffLines as Ke } from "diff";
const pe = Symbol("markdown-track");
function rn(e) {
  return xe(pe, e), e;
}
function _e() {
  const e = Me(pe, null);
  if (!e)
    throw new Error(
      "useMarkdownTrack(): no markdown-track provider found. Call provideMarkdownTrack(createMarkdownTrack(...)) in a parent component."
    );
  return e;
}
const U = Object.freeze({
  ENTER_LIBRARY: "enter-library",
  SELECT_DOCUMENT: "select-document",
  SAVE_DOCUMENT: "save-document",
  LEAVE_DOCUMENT: "leave-document",
  LEAVE_LIBRARY: "leave-library"
});
function P(e, s, o = {}) {
  var r, h, g, i;
  const t = (r = e == null ? void 0 : e.hooks) == null ? void 0 : r.onEvent;
  if (typeof t != "function") return;
  let n = null;
  try {
    n = ((g = (h = e.hooks).getCurrentUser) == null ? void 0 : g.call(h)) ?? null;
  } catch {
    n = null;
  }
  const c = {
    action: s,
    currentUser: n,
    library: ((i = e == null ? void 0 : e.options) == null ? void 0 : i.library) ?? null,
    docId: o.docId ?? null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    t(c);
  } catch {
  }
  return c;
}
const Ye = { class: "mt-library" }, Fe = {
  key: 0,
  class: "mt-library__status"
}, We = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Je = {
  key: 2,
  class: "mt-library__status"
}, Ge = {
  key: 3,
  class: "mt-library__list"
}, Qe = ["onClick"], Xe = { class: "mt-library__title" }, Ze = {
  key: 0,
  class: "mt-library__filename"
}, cn = {
  __name: "MarkdownLibrary",
  emits: ["select"],
  setup(e, { emit: s }) {
    const o = s, t = _e(), { hooks: n } = t, c = $([]), r = $(!0), h = $(""), g = (i) => i.title || i.filename;
    return H(async () => {
      P(t, U.ENTER_LIBRARY);
      try {
        const i = await n.listDocuments();
        c.value = i.filter((f) => n.can("view", f)).sort((f, _) => g(f).localeCompare(g(_), void 0, { sensitivity: "base", numeric: !0 }));
      } catch (i) {
        h.value = (i == null ? void 0 : i.message) || String(i);
      } finally {
        r.value = !1;
      }
    }), J(() => {
      P(t, U.LEAVE_LIBRARY);
    }), (i, f) => (u(), v("div", Ye, [
      f[0] || (f[0] = p("h2", { class: "mt-library__heading" }, "Documents", -1)),
      r.value ? (u(), v("p", Fe, "Loading…")) : h.value ? (u(), v("p", We, C(h.value), 1)) : c.value.length ? (u(), v("ul", Ge, [
        (u(!0), v(D, null, te(c.value, (_) => (u(), v("li", {
          key: _.id,
          class: "mt-library__item"
        }, [
          p("button", {
            type: "button",
            class: "mt-library__link",
            onClick: (A) => o("select", _.id)
          }, [
            p("span", Xe, C(g(_)), 1),
            _.title && _.title !== _.filename ? (u(), v("span", Ze, C(_.filename), 1)) : x("", !0)
          ], 8, Qe)
        ]))), 128))
      ])) : (u(), v("p", Je, "No documents available."))
    ]));
  }
};
function et(e) {
  if (e == null) return null;
  const s = e instanceof Date ? e.getTime() : new Date(e).getTime();
  return Number.isNaN(s) ? null : s;
}
function tt(e) {
  const s = et(e);
  return s == null ? () => !0 : (o) => {
    const t = o instanceof Date ? o.getTime() : new Date(o).getTime();
    return Number.isNaN(t) ? !0 : t >= s;
  };
}
function ye(e) {
  if (typeof e != "string") return null;
  const s = [];
  let o = null;
  for (const t of e.split(`
`)) {
    const n = t.replace(/\r$/, ""), c = n.match(/^\s*(`{3,}|~{3,})/);
    if (c) {
      const h = c[1][0];
      o === null ? o = h : o === h && (o = null);
      continue;
    }
    if (o !== null) continue;
    const r = n.match(/^#\s+(.+?)\s*#*\s*$/);
    r && r[1].trim() && s.push(r[1].trim());
  }
  return s.length === 1 ? s[0] : null;
}
const ge = /^\s*<!--\s*Access:\s*(.*?)\s*-->\s*$/i;
function* he(e) {
  let s = null;
  for (const o of e.split(`
`)) {
    const t = o.replace(/\r$/, ""), n = t.match(/^\s*(`{3,}|~{3,})/);
    if (n) {
      const c = n[1][0];
      s === null ? s = c : s === c && (s = null), yield { line: t, fenced: !0 };
      continue;
    }
    yield { line: t, fenced: s !== null };
  }
}
function nt(e) {
  return e.split(",").map((s) => s.trim()).filter(Boolean);
}
function W(e) {
  if (typeof e != "string") return null;
  let s = null;
  for (const { line: o, fenced: t } of he(e)) {
    if (t) continue;
    const n = o.match(ge);
    n && (s = nt(n[1]));
  }
  return s;
}
function st(e) {
  const s = [];
  for (const { line: o, fenced: t } of he(e))
    !t && ge.test(o) || s.push(o);
  return s.join(`
`);
}
function ot(e, s) {
  const o = typeof e == "string" ? e : "", t = /\r\n/.test(o) ? `\r
` : `
`, n = st(o).replace(/\s+$/, "").split(`
`).join(t);
  if (s == null)
    return n ? `${n}${t}` : "";
  const c = `<!-- Access: ${s.join(", ")} -->`;
  return (n ? `${n}${t}${t}` : "") + `${c}${t}`;
}
function at(e, s) {
  if (e === null || s === null) return e === s;
  if (e.length !== s.length) return !1;
  const o = [...e].sort(), t = [...s].sort();
  return o.every((n, c) => n === t[c]);
}
function lt(e, s, o) {
  const t = W(e), n = W(s);
  return o || at(t, n) ? { content: e, reverted: !1 } : { content: ot(e, n), reverted: !0 };
}
fe.use(Ue());
function it(e) {
  return typeof e != "string" || e.length === 0 ? "" : fe.parse(e, { gfm: !0, breaks: !1 });
}
let ue = !1;
function rt(e) {
  return typeof e == "string" && /(^|\n)\s*```mermaid\b/.test(e);
}
async function ct(e) {
  if (!e) return;
  const s = e.querySelectorAll("pre code.language-mermaid");
  if (!s.length) return;
  let o;
  try {
    o = (await import("mermaid")).default;
  } catch (t) {
    console.warn("markdown-track: 'mermaid' is not installed; leaving diagrams as code.", t);
    return;
  }
  ue || (o.initialize({ startOnLoad: !1, securityLevel: "strict" }), ue = !0);
  for (const t of s) {
    const n = t.closest("pre");
    if (!n) continue;
    const c = document.createElement("div");
    c.className = "mermaid", c.textContent = t.textContent, n.replaceWith(c);
  }
  try {
    await o.run({ nodes: e.querySelectorAll(".mermaid") });
  } catch (t) {
    console.warn("markdown-track: mermaid render error", t);
  }
}
const ut = ["innerHTML"], dt = {
  __name: "MarkdownRenderer",
  props: { content: { type: String, default: "" } },
  setup(e) {
    const s = e, o = $(null), t = $("");
    async function n() {
      t.value = it(s.content), await Ie(), o.value && rt(s.content) && await ct(o.value);
    }
    return H(n), F(() => s.content, n), (c, r) => (u(), v("div", {
      ref_key: "root",
      ref: o,
      class: "mt-markdown",
      innerHTML: t.value
    }, null, 8, ut));
  }
};
function mt() {
  return [
    je,
    He.configure({ openOnClick: !1 }),
    qe.configure({
      html: !1,
      tightLists: !0,
      breaks: !1,
      transformPastedText: !0,
      transformCopiedText: !0
    })
  ];
}
function de(e) {
  var s, o, t;
  return ((t = (o = (s = e == null ? void 0 : e.storage) == null ? void 0 : s.markdown) == null ? void 0 : o.getMarkdown) == null ? void 0 : t.call(o)) ?? "";
}
const vt = { class: "mt-editor" }, ft = {
  key: 0,
  class: "mt-editor__toolbar"
}, pt = ["value"], _t = {
  __name: "MarkdownEditor",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(e, { emit: s }) {
    const o = e, t = s, n = Le(null), c = $(!1);
    H(() => {
      n.value = new Pe({
        extensions: mt(),
        content: o.modelValue,
        // tiptap-markdown parses the markdown string
        onUpdate: ({ editor: g }) => t("update:modelValue", de(g))
      });
    }), J(() => {
      var g;
      return (g = n.value) == null ? void 0 : g.destroy();
    }), F(
      () => o.modelValue,
      (g) => {
        n.value && g !== de(n.value) && n.value.commands.setContent(g, !1);
      }
    );
    const r = (g) => n.value && g(n.value.chain().focus()), h = (g, i) => {
      var f;
      return ((f = n.value) == null ? void 0 : f.isActive(g, i)) ?? !1;
    };
    return (g, i) => (u(), v("div", vt, [
      n.value ? (u(), v("div", ft, [
        p("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("heading", { level: 1 }) }]),
          onClick: i[0] || (i[0] = (f) => r((_) => _.toggleHeading({ level: 1 }).run()))
        }, "H1", 2),
        p("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("heading", { level: 2 }) }]),
          onClick: i[1] || (i[1] = (f) => r((_) => _.toggleHeading({ level: 2 }).run()))
        }, "H2", 2),
        p("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("bold") }]),
          onClick: i[2] || (i[2] = (f) => r((_) => _.toggleBold().run()))
        }, [...i[7] || (i[7] = [
          p("b", null, "B", -1)
        ])], 2),
        p("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("italic") }]),
          onClick: i[3] || (i[3] = (f) => r((_) => _.toggleItalic().run()))
        }, [...i[8] || (i[8] = [
          p("i", null, "I", -1)
        ])], 2),
        p("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("bulletList") }]),
          onClick: i[4] || (i[4] = (f) => r((_) => _.toggleBulletList().run()))
        }, "• List", 2),
        p("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("codeBlock") }]),
          onClick: i[5] || (i[5] = (f) => r((_) => _.toggleCodeBlock().run()))
        }, "Code", 2),
        i[9] || (i[9] = p("span", { class: "mt-editor__spacer" }, null, -1)),
        p("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": c.value }]),
          onClick: i[6] || (i[6] = (f) => c.value = !c.value)
        }, "Source", 2)
      ])) : x("", !0),
      re(De(Oe(Be), {
        editor: n.value,
        class: "mt-editor__content"
      }, null, 8, ["editor"]), [
        [ce, !c.value]
      ]),
      re(p("textarea", {
        class: "mt-editor__source",
        value: e.modelValue,
        readonly: "",
        spellcheck: "false"
      }, null, 8, pt), [
        [ce, c.value]
      ])
    ]));
  }
}, yt = ["width"], gt = ["x2"], ht = ["transform", "onClick"], kt = {
  key: 0,
  class: "mt-timeline__dot",
  x: "-6.5",
  y: "-6.5",
  width: "13",
  height: "13",
  transform: "rotate(45)"
}, bt = ["r"], wt = {
  key: 0,
  class: "mt-timeline__caption"
}, Ct = ["disabled"], $t = ["disabled"], Et = { class: "mt-timeline__label" }, At = { key: 0 }, V = 24, Tt = 44, ee = 22, St = {
  __name: "ChangeTimeline",
  props: {
    // [{ id, kind: 'accepted'|'pending', at, label, author? }]
    points: { type: Array, default: () => [] },
    selectedId: { type: String, default: null }
  },
  emits: ["select"],
  setup(e, { emit: s }) {
    const o = e, t = s, n = $(null), c = $(600);
    let r = null;
    H(() => {
      n.value && (c.value = n.value.clientWidth || 600, r = new ResizeObserver(() => {
        c.value = n.value.clientWidth || 600;
      }), r.observe(n.value));
    }), J(() => r == null ? void 0 : r.disconnect());
    const h = k(
      () => ze().domain(o.points.map((w) => w.id)).range([V, Math.max(V + 1, c.value - V)]).padding(0.5)
    ), g = k(
      () => o.points.map((w) => ({ ...w, x: h.value(w.id) ?? V }))
    ), i = k(() => o.points.findIndex((w) => w.id === o.selectedId)), f = k(() => o.points[i.value] || null);
    function _(w) {
      const l = i.value + w;
      l >= 0 && l < o.points.length && t("select", o.points[l].id);
    }
    const A = (w) => {
      try {
        return new Date(w).toLocaleString();
      } catch {
        return String(w);
      }
    };
    return (w, l) => (u(), v("div", {
      ref_key: "root",
      ref: n,
      class: "mt-timeline"
    }, [
      (u(), v("svg", {
        width: c.value,
        height: Tt,
        class: "mt-timeline__svg",
        role: "group",
        "aria-label": "Change timeline"
      }, [
        p("line", {
          class: "mt-timeline__track",
          x1: V,
          y1: ee,
          x2: Math.max(V, c.value - V),
          y2: ee
        }, null, 8, gt),
        (u(!0), v(D, null, te(g.value, (d) => (u(), v("g", {
          key: d.id,
          class: M(["mt-timeline__point", [`mt-timeline__point--${d.kind}`, { "is-selected": d.id === e.selectedId }]]),
          transform: `translate(${d.x},${ee})`,
          onClick: (b) => t("select", d.id)
        }, [
          l[2] || (l[2] = p("circle", {
            r: "11",
            class: "mt-timeline__hit"
          }, null, -1)),
          d.kind === "summary" ? (u(), v("rect", kt)) : (u(), v("circle", {
            key: 1,
            r: d.kind === "accepted" ? 7 : 4.5,
            class: "mt-timeline__dot"
          }, null, 8, bt)),
          p("title", null, C(d.label) + " — " + C(A(d.at)), 1)
        ], 10, ht))), 128))
      ], 8, yt)),
      f.value ? (u(), v("div", wt, [
        p("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: i.value <= 0,
          onClick: l[0] || (l[0] = (d) => _(-1))
        }, "‹", 8, Ct),
        p("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: i.value >= e.points.length - 1,
          onClick: l[1] || (l[1] = (d) => _(1))
        }, "›", 8, $t),
        p("span", Et, [
          p("strong", null, C(f.value.label), 1),
          p("span", null, " · " + C(A(f.value.at)), 1),
          f.value.author ? (u(), v("span", At, " · " + C(f.value.author.email), 1)) : x("", !0)
        ])
      ])) : x("", !0)
    ], 512));
  }
};
function xt(e, s) {
  const o = Ke(e ?? "", s ?? ""), t = [];
  for (const n of o) {
    const c = n.added ? "added" : n.removed ? "removed" : "context", r = n.value.split(`
`);
    r.length && r[r.length - 1] === "" && r.pop();
    for (const h of r) t.push({ type: c, text: h });
  }
  return t;
}
function Mt(e) {
  let s = 0, o = 0;
  for (const t of e)
    t.type === "added" ? s += 1 : t.type === "removed" && (o += 1);
  return { added: s, removed: o };
}
const It = { class: "mt-diff" }, Lt = { class: "mt-diff__stats" }, Dt = { class: "mt-diff__stat mt-diff__stat--added" }, Ot = { class: "mt-diff__stat mt-diff__stat--removed" }, Nt = {
  key: 0,
  class: "mt-library__status"
}, Rt = {
  key: 1,
  class: "mt-diff__body"
}, Vt = { class: "mt-diff__gutter" }, Ut = { class: "mt-diff__text" }, Pt = {
  __name: "DiffView",
  props: {
    oldText: { type: String, default: "" },
    newText: { type: String, default: "" }
  },
  setup(e) {
    const s = e, o = k(() => xt(s.oldText, s.newText)), t = k(() => Mt(o.value)), n = k(() => t.value.added > 0 || t.value.removed > 0), c = (r) => r === "added" ? "+" : r === "removed" ? "−" : " ";
    return (r, h) => (u(), v("div", It, [
      p("div", Lt, [
        p("span", Dt, "+" + C(t.value.added), 1),
        p("span", Ot, "−" + C(t.value.removed), 1)
      ]),
      n.value ? (u(), v("pre", Rt, [
        (u(!0), v(D, null, te(o.value, (g, i) => (u(), v("span", {
          key: i,
          class: M(["mt-diff__line", `mt-diff__line--${g.type}`])
        }, [
          p("span", Vt, C(c(g.type)), 1),
          p("span", Ut, C(g.text), 1),
          h[0] || (h[0] = Ne(`
`, -1))
        ], 2))), 128))
      ])) : (u(), v("p", Nt, "No changes from the accepted version."))
    ]));
  }
}, Bt = { class: "mt-doc" }, jt = { class: "mt-doc__bar" }, Ht = { class: "mt-doc__title" }, qt = {
  key: 0,
  class: "mt-doc__pending"
}, zt = { class: "mt-doc__confirm" }, Kt = ["disabled"], Yt = ["title"], Ft = ["disabled"], Wt = {
  key: 0,
  class: "mt-library__status"
}, Jt = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Gt = {
  key: 2,
  class: "mt-library__status"
}, Qt = {
  key: 0,
  class: "mt-doc__note"
}, un = {
  __name: "DocumentView",
  props: { docId: { type: String, required: !0 } },
  emits: ["back"],
  setup(e, { emit: s }) {
    const o = Re(() => import("./MarkdownEditorVMd-B_zVhYSN.js")), t = e, n = s, c = _e(), { hooks: r, options: h } = c, g = k(
      () => h.editor === "tiptap" ? _t : o
    ), i = $([]), f = $([]), _ = $(!0), A = $(""), w = $("view"), l = $(""), d = $(!1), b = $(""), T = $(null), S = $(!1), I = $(!1), B = k(() => tt(h.hideHistoryBefore)), G = k(
      () => i.value.filter((a) => B.value(a.acceptedAt))
    ), q = k(
      () => f.value.filter((a) => B.value(a.savedAt))
    ), ne = k(() => G.value[G.value.length - 1] || null), se = k(() => q.value[q.value.length - 1] || null), O = k(() => {
      const a = [
        ...G.value.map((y) => ({
          id: y.id,
          kind: "accepted",
          at: y.acceptedAt,
          content: y.content,
          label: "Accepted",
          author: y.acceptedBy
        })),
        ...q.value.map((y) => ({
          id: y.id,
          kind: "pending",
          at: y.savedAt,
          content: y.content,
          label: `Pending #${y.seq}`,
          author: y.author
        }))
      ], m = se.value;
      return m && a.push({
        id: "all-changes",
        kind: "summary",
        at: m.savedAt,
        content: m.content,
        label: "All changes",
        author: m.author
      }), a;
    }), L = k(
      () => O.value.find((a) => a.id === T.value) || O.value[O.value.length - 1] || null
    ), Q = k(() => {
      var a;
      return ((a = L.value) == null ? void 0 : a.content) ?? "";
    }), ke = k(() => {
      var y, E;
      const a = L.value;
      if (!a) return "";
      if (a.kind === "summary") return ((y = ne.value) == null ? void 0 : y.content) ?? "";
      const m = O.value.findIndex((j) => j.id === a.id);
      return ((E = O.value[m - 1]) == null ? void 0 : E.content) ?? "";
    }), be = k(() => {
      var a;
      return ye(((a = ne.value) == null ? void 0 : a.content) || "") || t.docId;
    }), oe = k(
      () => {
        var a, m;
        return ((a = f.value[f.value.length - 1]) == null ? void 0 : a.content) ?? ((m = i.value[i.value.length - 1]) == null ? void 0 : m.content) ?? "";
      }
    ), z = k(() => ({ id: t.docId, access: W(oe.value) })), N = k(() => r.can("view", z.value)), we = k(() => N.value && r.can("edit", z.value)), Ce = k(() => N.value && r.can("accept", z.value)), X = k(() => q.value.length), Z = k(() => (t.docId || "document").replace(/\.md$/i, "")), ae = k(() => {
      const a = L.value;
      if ((a == null ? void 0 : a.kind) === "summary") return `${Z.value}.all-changes.md`;
      if ((a == null ? void 0 : a.kind) === "pending") {
        const m = String(a.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return `${Z.value}.${m}.md`;
      }
      return `${Z.value}.md`;
    });
    function $e() {
      const a = new Blob([Q.value ?? ""], { type: "text/markdown;charset=utf-8" }), m = URL.createObjectURL(a), y = document.createElement("a");
      y.href = m, y.download = ae.value, document.body.appendChild(y), y.click(), y.remove(), URL.revokeObjectURL(m);
    }
    function le() {
      var y;
      const a = O.value, m = a.find((E) => E.kind === "summary");
      T.value = ((y = m ?? a[a.length - 1]) == null ? void 0 : y.id) ?? null;
    }
    async function ie() {
      _.value = !0, A.value = "", w.value = "view", b.value = "", S.value = !1, I.value = !1;
      try {
        const [a, m] = await Promise.all([
          r.listAcceptedStates(t.docId),
          r.listPendingChanges(t.docId)
        ]);
        i.value = a, f.value = m, le();
      } catch (a) {
        A.value = (a == null ? void 0 : a.message) || String(a);
      } finally {
        _.value = !1;
      }
    }
    H(() => {
      P(c, U.SELECT_DOCUMENT, { docId: t.docId }), ie();
    }), F(() => t.docId, (a, m) => {
      m && P(c, U.LEAVE_DOCUMENT, { docId: m }), P(c, U.SELECT_DOCUMENT, { docId: a }), ie();
    }), J(() => {
      P(c, U.LEAVE_DOCUMENT, { docId: t.docId });
    }), F(T, () => {
      I.value = !1;
    });
    function Ee() {
      var a;
      l.value = ((a = L.value) == null ? void 0 : a.content) ?? "", b.value = "", S.value = !1, I.value = !1, w.value = "edit";
    }
    function Ae() {
      w.value = "view";
    }
    async function Te() {
      d.value = !0, A.value = "";
      try {
        const a = r.can("set-access", z.value), { content: m, reverted: y } = lt(l.value, oe.value, a), E = await r.savePendingChange(t.docId, { content: m });
        P(c, U.SAVE_DOCUMENT, { docId: t.docId }), f.value = await r.listPendingChanges(t.docId), le(), b.value = y ? "Saved. The access list can only be changed by an administrator, so that change was reverted." : `Saved pending change (seq ${E.seq}).`, w.value = "view";
      } catch (a) {
        A.value = (a == null ? void 0 : a.message) || String(a);
      } finally {
        d.value = !1;
      }
    }
    async function Se() {
      var y;
      const a = L.value;
      if (!a || a.kind !== "pending" && a.kind !== "summary") return;
      const m = a.kind === "summary" ? ((y = se.value) == null ? void 0 : y.id) ?? null : a.id;
      d.value = !0, A.value = "";
      try {
        const E = await r.acceptChanges(t.docId, { upToChangeId: m }), [j, K] = await Promise.all([
          r.listAcceptedStates(t.docId),
          r.listPendingChanges(t.docId)
        ]);
        i.value = j, f.value = K, T.value = E.id, b.value = "Accepted — new baseline established.", I.value = !1;
      } catch (E) {
        A.value = (E == null ? void 0 : E.message) || String(E);
      } finally {
        d.value = !1;
      }
    }
    return (a, m) => {
      var y, E, j, K;
      return u(), v("div", Bt, [
        p("div", jt, [
          p("button", {
            type: "button",
            class: "mt-editor__btn",
            onClick: m[0] || (m[0] = (R) => n("back"))
          }, "← Library"),
          p("h2", Ht, C(N.value ? be.value : e.docId), 1),
          m[6] || (m[6] = p("span", { class: "mt-doc__spacer" }, null, -1)),
          N.value && X.value ? (u(), v("span", qt, C(X.value) + " pending", 1)) : x("", !0),
          w.value === "view" ? (u(), v(D, { key: 1 }, [
            I.value ? (u(), v(D, { key: 0 }, [
              p("span", zt, "Accept “" + C((y = L.value) == null ? void 0 : y.label) + "” as the new baseline?", 1),
              p("button", {
                type: "button",
                class: "mt-editor__btn",
                onClick: m[1] || (m[1] = (R) => I.value = !1)
              }, "Cancel"),
              p("button", {
                type: "button",
                class: "mt-editor__btn is-active",
                disabled: d.value,
                onClick: Se
              }, C(d.value ? "Accepting…" : "Confirm"), 9, Kt)
            ], 64)) : (u(), v(D, { key: 1 }, [
              N.value ? (u(), v("button", {
                key: 0,
                type: "button",
                class: "mt-editor__btn",
                title: `Download ${ae.value}`,
                onClick: $e
              }, "Download", 8, Yt)) : x("", !0),
              N.value && X.value ? (u(), v("button", {
                key: 1,
                type: "button",
                class: M(["mt-editor__btn", { "is-active": S.value }]),
                onClick: m[2] || (m[2] = (R) => S.value = !S.value)
              }, C(S.value ? "Hide changes" : "Show changes"), 3)) : x("", !0),
              Ce.value && (((E = L.value) == null ? void 0 : E.kind) === "pending" || ((j = L.value) == null ? void 0 : j.kind) === "summary") ? (u(), v("button", {
                key: 2,
                type: "button",
                class: "mt-editor__btn",
                onClick: m[3] || (m[3] = (R) => I.value = !0)
              }, "Accept")) : x("", !0),
              we.value ? (u(), v("button", {
                key: 3,
                type: "button",
                class: "mt-editor__btn",
                onClick: Ee
              }, "Edit")) : x("", !0)
            ], 64))
          ], 64)) : (u(), v(D, { key: 2 }, [
            p("button", {
              type: "button",
              class: "mt-editor__btn",
              onClick: Ae
            }, "Cancel"),
            p("button", {
              type: "button",
              class: "mt-editor__btn is-active",
              disabled: d.value,
              onClick: Te
            }, C(d.value ? "Saving…" : "Save"), 9, Ft)
          ], 64))
        ]),
        _.value ? (u(), v("p", Wt, "Loading…")) : A.value ? (u(), v("p", Jt, C(A.value), 1)) : N.value ? (u(), v(D, { key: 3 }, [
          b.value ? (u(), v("p", Qt, C(b.value), 1)) : x("", !0),
          w.value === "view" ? (u(), v(D, { key: 1 }, [
            O.value.length > 1 ? (u(), Y(St, {
              key: 0,
              points: O.value,
              "selected-id": (K = L.value) == null ? void 0 : K.id,
              onSelect: m[4] || (m[4] = (R) => T.value = R)
            }, null, 8, ["points", "selected-id"])) : x("", !0),
            S.value ? (u(), Y(Pt, {
              key: 1,
              "old-text": ke.value,
              "new-text": Q.value
            }, null, 8, ["old-text", "new-text"])) : (u(), Y(dt, {
              key: 2,
              content: Q.value
            }, null, 8, ["content"]))
          ], 64)) : (u(), Y(Ve(g.value), {
            key: 2,
            modelValue: l.value,
            "onUpdate:modelValue": m[5] || (m[5] = (R) => l.value = R)
          }, null, 8, ["modelValue"]))
        ], 64)) : (u(), v("p", Gt, " You don’t have access to this document. "))
      ]);
    };
  }
}, me = Object.freeze([
  "getCurrentUser",
  "can",
  "listDocuments",
  "readAcceptedState",
  "listAcceptedStates",
  "listPendingChanges",
  "savePendingChange",
  "acceptChanges"
]), ve = Object.freeze(["onEvent"]);
function dn(e = {}) {
  const s = me.filter(
    (n) => typeof e[n] != "function"
  );
  if (s.length > 0)
    throw new Error(
      `createMarkdownTrack: missing required hook(s): ${s.join(", ")}`
    );
  const o = ve.filter(
    (n) => e[n] != null && typeof e[n] != "function"
  );
  if (o.length > 0)
    throw new Error(
      `createMarkdownTrack: optional hook(s) must be functions: ${o.join(", ")}`
    );
  const t = {};
  for (const n of me) t[n] = e[n];
  for (const n of ve)
    typeof e[n] == "function" && (t[n] = e[n]);
  return Object.freeze({
    hooks: Object.freeze(t),
    options: Object.freeze({ ...e.options || {} })
  });
}
function mn(e = {}) {
  const s = e.user || { id: "dev", email: "dev@example.com", name: "Dev User" }, o = e.can || (() => !0), t = () => e.clock ? e.clock() : (/* @__PURE__ */ new Date()).toISOString(), n = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  let h = 0, g = 0;
  const i = (l) => `${l}-${++g}`, f = (l) => JSON.parse(JSON.stringify(l));
  for (const l of e.documents || [])
    n.set(l.id, { id: l.id, filename: l.filename }), c.set(l.id, [
      {
        id: i("acc"),
        docId: l.id,
        content: l.content ?? "",
        acceptedBy: s,
        acceptedAt: t(),
        ref: "seed"
      }
    ]), r.set(l.id, []);
  const _ = (l) => {
    const d = c.get(l) || [];
    return d[d.length - 1];
  }, A = (l) => {
    const d = r.get(l) || [];
    return d[d.length - 1];
  }, w = (l) => {
    var d, b;
    return ((d = A(l)) == null ? void 0 : d.content) ?? ((b = _(l)) == null ? void 0 : b.content) ?? "";
  };
  return {
    getCurrentUser: () => f(s),
    can: (l, d) => o(l, d, s),
    listDocuments: async () => [...n.values()].map((l) => {
      const d = w(l.id), b = W(d);
      return f({
        ...l,
        title: ye(d) ?? void 0,
        access: b ?? void 0
      });
    }),
    readAcceptedState: async (l) => {
      const d = _(l);
      if (!d) throw new Error(`Unknown document: ${l}`);
      return f(d);
    },
    listAcceptedStates: async (l) => f(c.get(l) || []),
    listPendingChanges: async (l) => f(r.get(l) || []),
    savePendingChange: async (l, { content: d }) => {
      var T;
      if (!n.has(l)) throw new Error(`Unknown document: ${l}`);
      const b = {
        id: i("pend"),
        docId: l,
        content: d,
        author: f(s),
        savedAt: t(),
        seq: ++h,
        baseRef: (T = _(l)) == null ? void 0 : T.ref
      };
      return r.get(l).push(b), f(b);
    },
    acceptChanges: async (l, d = {}) => {
      const b = r.get(l) || [];
      if (b.length === 0) throw new Error("No pending changes to accept");
      let T = b[b.length - 1];
      d.upToChangeId && (T = b.find((B) => B.id === d.upToChangeId) || T);
      const S = {
        id: i("acc"),
        docId: l,
        content: T.content,
        acceptedBy: f(s),
        acceptedAt: t(),
        ref: `mem-${T.seq}`
      };
      c.get(l).push(S);
      const I = b.indexOf(T);
      return r.set(
        l,
        b.slice(I + 1).map((B) => ({ ...B, baseRef: S.ref }))
      ), f(S);
    }
  };
}
export {
  St as ChangeTimeline,
  Pt as DiffView,
  un as DocumentView,
  _t as MarkdownEditor,
  cn as MarkdownLibrary,
  dt as MarkdownRenderer,
  ve as OPTIONAL_HOOKS,
  me as REQUIRED_HOOKS,
  U as TRACK_EVENTS,
  mn as createInMemoryHooks,
  dn as createMarkdownTrack,
  P as emitTrackEvent,
  W as extractAccess,
  ye as extractTitle,
  rn as provideMarkdownTrack,
  _e as useMarkdownTrack
};
