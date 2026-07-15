import { provide as Ie, inject as Le, ref as $, onMounted as H, onBeforeUnmount as J, openBlock as u, createElementBlock as m, createElementVNode as p, toDisplayString as C, Fragment as D, renderList as ne, createCommentVNode as M, watch as F, nextTick as De, shallowRef as Oe, normalizeClass as I, withDirectives as ue, createVNode as Ne, unref as Re, vShow as de, computed as k, createTextVNode as Ve, defineAsyncComponent as Ue, createBlock as Y, resolveDynamicComponent as Pe } from "vue";
import { marked as _e } from "marked";
import { gfmHeadingId as Be } from "marked-gfm-heading-id";
import { Editor as je, EditorContent as He } from "@tiptap/vue-3";
import qe from "@tiptap/starter-kit";
import ze from "@tiptap/extension-link";
import { Markdown as Ke } from "tiptap-markdown";
import { scalePoint as Ye } from "d3-scale";
import { diffLines as Fe } from "diff";
const ye = Symbol("markdown-track");
function dn(e) {
  return Ie(ye, e), e;
}
function ge() {
  const e = Le(ye, null);
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
const We = { class: "mt-library" }, Je = {
  key: 0,
  class: "mt-library__status"
}, Ge = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Qe = {
  key: 2,
  class: "mt-library__status"
}, Xe = {
  key: 3,
  class: "mt-library__list"
}, Ze = ["onClick"], et = { class: "mt-library__title" }, tt = {
  key: 0,
  class: "mt-library__filename"
}, mn = {
  __name: "MarkdownLibrary",
  emits: ["select"],
  setup(e, { emit: s }) {
    const o = s, t = ge(), { hooks: n } = t, c = $([]), r = $(!0), h = $(""), g = (i) => i.title || i.filename;
    return H(async () => {
      P(t, U.ENTER_LIBRARY);
      try {
        const i = await n.listDocuments();
        c.value = i.filter((v) => n.can("view", v)).sort((v, _) => g(v).localeCompare(g(_), void 0, { sensitivity: "base", numeric: !0 }));
      } catch (i) {
        h.value = (i == null ? void 0 : i.message) || String(i);
      } finally {
        r.value = !1;
      }
    }), J(() => {
      P(t, U.LEAVE_LIBRARY);
    }), (i, v) => (u(), m("div", We, [
      v[0] || (v[0] = p("h2", { class: "mt-library__heading" }, "Documents", -1)),
      r.value ? (u(), m("p", Je, "Loading…")) : h.value ? (u(), m("p", Ge, C(h.value), 1)) : c.value.length ? (u(), m("ul", Xe, [
        (u(!0), m(D, null, ne(c.value, (_) => (u(), m("li", {
          key: _.id,
          class: "mt-library__item"
        }, [
          p("button", {
            type: "button",
            class: "mt-library__link",
            onClick: (A) => o("select", _.id)
          }, [
            p("span", et, C(g(_)), 1),
            _.title && _.title !== _.filename ? (u(), m("span", tt, C(_.filename), 1)) : M("", !0)
          ], 8, Ze)
        ]))), 128))
      ])) : (u(), m("p", Qe, "No documents available."))
    ]));
  }
};
function nt(e) {
  if (e == null) return null;
  const s = e instanceof Date ? e.getTime() : new Date(e).getTime();
  return Number.isNaN(s) ? null : s;
}
function st(e) {
  const s = nt(e);
  return s == null ? () => !0 : (o) => {
    const t = o instanceof Date ? o.getTime() : new Date(o).getTime();
    return Number.isNaN(t) ? !0 : t >= s;
  };
}
function he(e) {
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
const ke = /^\s*<!--\s*Access:\s*(.*?)\s*-->\s*$/i;
function* be(e) {
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
function ot(e) {
  return e.split(",").map((s) => s.trim()).filter(Boolean);
}
function W(e) {
  if (typeof e != "string") return null;
  let s = null;
  for (const { line: o, fenced: t } of be(e)) {
    if (t) continue;
    const n = o.match(ke);
    n && (s = ot(n[1]));
  }
  return s;
}
function at(e) {
  const s = [];
  for (const { line: o, fenced: t } of be(e))
    !t && ke.test(o) || s.push(o);
  return s.join(`
`);
}
function lt(e, s) {
  const o = typeof e == "string" ? e : "", t = /\r\n/.test(o) ? `\r
` : `
`, n = at(o).replace(/\s+$/, "").split(`
`).join(t);
  if (s == null)
    return n ? `${n}${t}` : "";
  const c = `<!-- Access: ${s.join(", ")} -->`;
  return (n ? `${n}${t}${t}` : "") + `${c}${t}`;
}
function it(e, s) {
  if (e === null || s === null) return e === s;
  if (e.length !== s.length) return !1;
  const o = [...e].sort(), t = [...s].sort();
  return o.every((n, c) => n === t[c]);
}
function rt(e, s, o) {
  const t = W(e), n = W(s);
  return o || it(t, n) ? { content: e, reverted: !1 } : { content: lt(e, n), reverted: !0 };
}
_e.use(Be());
function ct(e) {
  return typeof e != "string" || e.length === 0 ? "" : _e.parse(e, { gfm: !0, breaks: !1 });
}
let me = !1;
function ut(e) {
  return typeof e == "string" && /(^|\n)\s*```mermaid\b/.test(e);
}
async function dt(e) {
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
  me || (o.initialize({ startOnLoad: !1, securityLevel: "strict" }), me = !0);
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
const mt = ["innerHTML"], vt = {
  __name: "MarkdownRenderer",
  props: { content: { type: String, default: "" } },
  setup(e) {
    const s = e, o = $(null), t = $("");
    async function n() {
      t.value = ct(s.content), await De(), o.value && ut(s.content) && await dt(o.value);
    }
    return H(n), F(() => s.content, n), (c, r) => (u(), m("div", {
      ref_key: "root",
      ref: o,
      class: "mt-markdown",
      innerHTML: t.value
    }, null, 8, mt));
  }
};
function ft() {
  return [
    qe,
    ze.configure({ openOnClick: !1 }),
    Ke.configure({
      html: !1,
      tightLists: !0,
      breaks: !1,
      transformPastedText: !0,
      transformCopiedText: !0
    })
  ];
}
function ve(e) {
  var s, o, t;
  return ((t = (o = (s = e == null ? void 0 : e.storage) == null ? void 0 : s.markdown) == null ? void 0 : o.getMarkdown) == null ? void 0 : t.call(o)) ?? "";
}
const pt = { class: "mt-editor" }, _t = {
  key: 0,
  class: "mt-editor__toolbar"
}, yt = ["value"], gt = {
  __name: "MarkdownEditor",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(e, { emit: s }) {
    const o = e, t = s, n = Oe(null), c = $(!1);
    H(() => {
      n.value = new je({
        extensions: ft(),
        content: o.modelValue,
        // tiptap-markdown parses the markdown string
        onUpdate: ({ editor: g }) => t("update:modelValue", ve(g))
      });
    }), J(() => {
      var g;
      return (g = n.value) == null ? void 0 : g.destroy();
    }), F(
      () => o.modelValue,
      (g) => {
        n.value && g !== ve(n.value) && n.value.commands.setContent(g, !1);
      }
    );
    const r = (g) => n.value && g(n.value.chain().focus()), h = (g, i) => {
      var v;
      return ((v = n.value) == null ? void 0 : v.isActive(g, i)) ?? !1;
    };
    return (g, i) => (u(), m("div", pt, [
      n.value ? (u(), m("div", _t, [
        p("button", {
          type: "button",
          class: I(["mt-editor__btn", { "is-active": h("heading", { level: 1 }) }]),
          onClick: i[0] || (i[0] = (v) => r((_) => _.toggleHeading({ level: 1 }).run()))
        }, "H1", 2),
        p("button", {
          type: "button",
          class: I(["mt-editor__btn", { "is-active": h("heading", { level: 2 }) }]),
          onClick: i[1] || (i[1] = (v) => r((_) => _.toggleHeading({ level: 2 }).run()))
        }, "H2", 2),
        p("button", {
          type: "button",
          class: I(["mt-editor__btn", { "is-active": h("bold") }]),
          onClick: i[2] || (i[2] = (v) => r((_) => _.toggleBold().run()))
        }, [...i[7] || (i[7] = [
          p("b", null, "B", -1)
        ])], 2),
        p("button", {
          type: "button",
          class: I(["mt-editor__btn", { "is-active": h("italic") }]),
          onClick: i[3] || (i[3] = (v) => r((_) => _.toggleItalic().run()))
        }, [...i[8] || (i[8] = [
          p("i", null, "I", -1)
        ])], 2),
        p("button", {
          type: "button",
          class: I(["mt-editor__btn", { "is-active": h("bulletList") }]),
          onClick: i[4] || (i[4] = (v) => r((_) => _.toggleBulletList().run()))
        }, "• List", 2),
        p("button", {
          type: "button",
          class: I(["mt-editor__btn", { "is-active": h("codeBlock") }]),
          onClick: i[5] || (i[5] = (v) => r((_) => _.toggleCodeBlock().run()))
        }, "Code", 2),
        i[9] || (i[9] = p("span", { class: "mt-editor__spacer" }, null, -1)),
        p("button", {
          type: "button",
          class: I(["mt-editor__btn", { "is-active": c.value }]),
          onClick: i[6] || (i[6] = (v) => c.value = !c.value)
        }, "Source", 2)
      ])) : M("", !0),
      ue(Ne(Re(He), {
        editor: n.value,
        class: "mt-editor__content"
      }, null, 8, ["editor"]), [
        [de, !c.value]
      ]),
      ue(p("textarea", {
        class: "mt-editor__source",
        value: e.modelValue,
        readonly: "",
        spellcheck: "false"
      }, null, 8, yt), [
        [de, c.value]
      ])
    ]));
  }
}, ht = ["width"], kt = ["x2"], bt = ["transform", "onClick"], wt = {
  key: 0,
  class: "mt-timeline__dot",
  x: "-6.5",
  y: "-6.5",
  width: "13",
  height: "13",
  transform: "rotate(45)"
}, Ct = ["r"], $t = {
  key: 0,
  class: "mt-timeline__caption"
}, Et = ["disabled"], At = ["disabled"], Tt = { class: "mt-timeline__label" }, St = { key: 0 }, V = 24, xt = 44, te = 22, Mt = {
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
      () => Ye().domain(o.points.map((w) => w.id)).range([V, Math.max(V + 1, c.value - V)]).padding(0.5)
    ), g = k(
      () => o.points.map((w) => ({ ...w, x: h.value(w.id) ?? V }))
    ), i = k(() => o.points.findIndex((w) => w.id === o.selectedId)), v = k(() => o.points[i.value] || null);
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
    return (w, l) => (u(), m("div", {
      ref_key: "root",
      ref: n,
      class: "mt-timeline"
    }, [
      (u(), m("svg", {
        width: c.value,
        height: xt,
        class: "mt-timeline__svg",
        role: "group",
        "aria-label": "Change timeline"
      }, [
        p("line", {
          class: "mt-timeline__track",
          x1: V,
          y1: te,
          x2: Math.max(V, c.value - V),
          y2: te
        }, null, 8, kt),
        (u(!0), m(D, null, ne(g.value, (d) => (u(), m("g", {
          key: d.id,
          class: I(["mt-timeline__point", [`mt-timeline__point--${d.kind}`, { "is-selected": d.id === e.selectedId }]]),
          transform: `translate(${d.x},${te})`,
          onClick: (b) => t("select", d.id)
        }, [
          l[2] || (l[2] = p("circle", {
            r: "11",
            class: "mt-timeline__hit"
          }, null, -1)),
          d.kind === "summary" ? (u(), m("rect", wt)) : (u(), m("circle", {
            key: 1,
            r: d.kind === "accepted" ? 7 : 4.5,
            class: "mt-timeline__dot"
          }, null, 8, Ct)),
          p("title", null, C(d.label) + " — " + C(A(d.at)), 1)
        ], 10, bt))), 128))
      ], 8, ht)),
      v.value ? (u(), m("div", $t, [
        p("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: i.value <= 0,
          onClick: l[0] || (l[0] = (d) => _(-1))
        }, "‹", 8, Et),
        p("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: i.value >= e.points.length - 1,
          onClick: l[1] || (l[1] = (d) => _(1))
        }, "›", 8, At),
        p("span", Tt, [
          p("strong", null, C(v.value.label), 1),
          p("span", null, " · " + C(A(v.value.at)), 1),
          v.value.author ? (u(), m("span", St, " · " + C(v.value.author.email), 1)) : M("", !0)
        ])
      ])) : M("", !0)
    ], 512));
  }
};
function It(e, s) {
  const o = Fe(e ?? "", s ?? ""), t = [];
  for (const n of o) {
    const c = n.added ? "added" : n.removed ? "removed" : "context", r = n.value.split(`
`);
    r.length && r[r.length - 1] === "" && r.pop();
    for (const h of r) t.push({ type: c, text: h });
  }
  return t;
}
function Lt(e) {
  let s = 0, o = 0;
  for (const t of e)
    t.type === "added" ? s += 1 : t.type === "removed" && (o += 1);
  return { added: s, removed: o };
}
const Dt = { class: "mt-diff" }, Ot = { class: "mt-diff__stats" }, Nt = { class: "mt-diff__stat mt-diff__stat--added" }, Rt = { class: "mt-diff__stat mt-diff__stat--removed" }, Vt = {
  key: 0,
  class: "mt-library__status"
}, Ut = {
  key: 1,
  class: "mt-diff__body"
}, Pt = { class: "mt-diff__gutter" }, Bt = { class: "mt-diff__text" }, jt = {
  __name: "DiffView",
  props: {
    oldText: { type: String, default: "" },
    newText: { type: String, default: "" }
  },
  setup(e) {
    const s = e, o = k(() => It(s.oldText, s.newText)), t = k(() => Lt(o.value)), n = k(() => t.value.added > 0 || t.value.removed > 0), c = (r) => r === "added" ? "+" : r === "removed" ? "−" : " ";
    return (r, h) => (u(), m("div", Dt, [
      p("div", Ot, [
        p("span", Nt, "+" + C(t.value.added), 1),
        p("span", Rt, "−" + C(t.value.removed), 1)
      ]),
      n.value ? (u(), m("pre", Ut, [
        (u(!0), m(D, null, ne(o.value, (g, i) => (u(), m("span", {
          key: i,
          class: I(["mt-diff__line", `mt-diff__line--${g.type}`])
        }, [
          p("span", Pt, C(c(g.type)), 1),
          p("span", Bt, C(g.text), 1),
          h[0] || (h[0] = Ve(`
`, -1))
        ], 2))), 128))
      ])) : (u(), m("p", Vt, "No changes from the accepted version."))
    ]));
  }
}, Ht = { class: "mt-doc" }, qt = { class: "mt-doc__bar" }, zt = { class: "mt-doc__title" }, Kt = {
  key: 0,
  class: "mt-doc__pending"
}, Yt = { class: "mt-doc__confirm" }, Ft = ["disabled"], Wt = ["title"], Jt = ["disabled", "title"], Gt = ["disabled"], Qt = {
  key: 0,
  class: "mt-library__status"
}, Xt = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Zt = {
  key: 2,
  class: "mt-library__status"
}, en = {
  key: 0,
  class: "mt-doc__note"
}, vn = {
  __name: "DocumentView",
  props: { docId: { type: String, required: !0 } },
  emits: ["back"],
  setup(e, { emit: s }) {
    const o = Ue(() => import("./MarkdownEditorVMd-B_zVhYSN.js")), t = e, n = s, c = ge(), { hooks: r, options: h } = c, g = k(
      () => h.editor === "tiptap" ? gt : o
    ), i = $([]), v = $([]), _ = $(!0), A = $(""), w = $("view"), l = $(""), d = $(!1), b = $(""), T = $(null), S = $(!1), L = $(!1), B = k(() => st(h.hideHistoryBefore)), G = k(
      () => i.value.filter((a) => B.value(a.acceptedAt))
    ), q = k(
      () => v.value.filter((a) => B.value(a.savedAt))
    ), se = k(() => G.value[G.value.length - 1] || null), oe = k(() => q.value[q.value.length - 1] || null), O = k(() => {
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
      ], f = oe.value;
      return f && a.push({
        id: "all-changes",
        kind: "summary",
        at: f.savedAt,
        content: f.content,
        label: "All changes",
        author: f.author
      }), a;
    }), x = k(
      () => O.value.find((a) => a.id === T.value) || O.value[O.value.length - 1] || null
    ), Q = k(() => {
      var a;
      return ((a = x.value) == null ? void 0 : a.content) ?? "";
    }), ae = k(() => {
      var y;
      const a = O.value;
      return ((y = a.find((E) => E.kind === "summary") ?? a[a.length - 1]) == null ? void 0 : y.id) ?? null;
    }), X = k(
      () => !!x.value && x.value.id === ae.value
    ), we = k(() => {
      var y, E;
      const a = x.value;
      if (!a) return "";
      if (a.kind === "summary") return ((y = se.value) == null ? void 0 : y.content) ?? "";
      const f = O.value.findIndex((j) => j.id === a.id);
      return ((E = O.value[f - 1]) == null ? void 0 : E.content) ?? "";
    }), Ce = k(() => {
      var a;
      return he(((a = se.value) == null ? void 0 : a.content) || "") || t.docId;
    }), le = k(
      () => {
        var a, f;
        return ((a = v.value[v.value.length - 1]) == null ? void 0 : a.content) ?? ((f = i.value[i.value.length - 1]) == null ? void 0 : f.content) ?? "";
      }
    ), z = k(() => ({ id: t.docId, access: W(le.value) })), N = k(() => r.can("view", z.value)), $e = k(() => N.value && r.can("edit", z.value)), Ee = k(() => N.value && r.can("accept", z.value)), Z = k(() => q.value.length), ee = k(() => (t.docId || "document").replace(/\.md$/i, "")), ie = k(() => {
      const a = x.value;
      if ((a == null ? void 0 : a.kind) === "summary") return `${ee.value}.all-changes.md`;
      if ((a == null ? void 0 : a.kind) === "pending") {
        const f = String(a.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return `${ee.value}.${f}.md`;
      }
      return `${ee.value}.md`;
    });
    function Ae() {
      const a = new Blob([Q.value ?? ""], { type: "text/markdown;charset=utf-8" }), f = URL.createObjectURL(a), y = document.createElement("a");
      y.href = f, y.download = ie.value, document.body.appendChild(y), y.click(), y.remove(), URL.revokeObjectURL(f);
    }
    function re() {
      T.value = ae.value;
    }
    async function ce() {
      _.value = !0, A.value = "", w.value = "view", b.value = "", S.value = !1, L.value = !1;
      try {
        const [a, f] = await Promise.all([
          r.listAcceptedStates(t.docId),
          r.listPendingChanges(t.docId)
        ]);
        i.value = a, v.value = f, re();
      } catch (a) {
        A.value = (a == null ? void 0 : a.message) || String(a);
      } finally {
        _.value = !1;
      }
    }
    H(() => {
      P(c, U.SELECT_DOCUMENT, { docId: t.docId }), ce();
    }), F(() => t.docId, (a, f) => {
      f && P(c, U.LEAVE_DOCUMENT, { docId: f }), P(c, U.SELECT_DOCUMENT, { docId: a }), ce();
    }), J(() => {
      P(c, U.LEAVE_DOCUMENT, { docId: t.docId });
    }), F(T, () => {
      L.value = !1;
    });
    function Te() {
      var a;
      X.value && (l.value = ((a = x.value) == null ? void 0 : a.content) ?? "", b.value = "", S.value = !1, L.value = !1, w.value = "edit");
    }
    function Se() {
      w.value = "view";
    }
    async function xe() {
      d.value = !0, A.value = "";
      try {
        const a = r.can("set-access", z.value), { content: f, reverted: y } = rt(l.value, le.value, a), E = await r.savePendingChange(t.docId, { content: f });
        P(c, U.SAVE_DOCUMENT, { docId: t.docId }), v.value = await r.listPendingChanges(t.docId), re(), b.value = y ? "Saved. The access list can only be changed by an administrator, so that change was reverted." : `Saved pending change (seq ${E.seq}).`, w.value = "view";
      } catch (a) {
        A.value = (a == null ? void 0 : a.message) || String(a);
      } finally {
        d.value = !1;
      }
    }
    async function Me() {
      var y;
      const a = x.value;
      if (!a || a.kind !== "pending" && a.kind !== "summary") return;
      const f = a.kind === "summary" ? ((y = oe.value) == null ? void 0 : y.id) ?? null : a.id;
      d.value = !0, A.value = "";
      try {
        const E = await r.acceptChanges(t.docId, { upToChangeId: f }), [j, K] = await Promise.all([
          r.listAcceptedStates(t.docId),
          r.listPendingChanges(t.docId)
        ]);
        i.value = j, v.value = K, T.value = E.id, b.value = "Accepted — new baseline established.", L.value = !1;
      } catch (E) {
        A.value = (E == null ? void 0 : E.message) || String(E);
      } finally {
        d.value = !1;
      }
    }
    return (a, f) => {
      var y, E, j, K;
      return u(), m("div", Ht, [
        p("div", qt, [
          p("button", {
            type: "button",
            class: "mt-editor__btn",
            onClick: f[0] || (f[0] = (R) => n("back"))
          }, "← Library"),
          p("h2", zt, C(N.value ? Ce.value : e.docId), 1),
          f[6] || (f[6] = p("span", { class: "mt-doc__spacer" }, null, -1)),
          N.value && Z.value ? (u(), m("span", Kt, C(Z.value) + " pending", 1)) : M("", !0),
          w.value === "view" ? (u(), m(D, { key: 1 }, [
            L.value ? (u(), m(D, { key: 0 }, [
              p("span", Yt, "Accept “" + C((y = x.value) == null ? void 0 : y.label) + "” as the new baseline?", 1),
              p("button", {
                type: "button",
                class: "mt-editor__btn",
                onClick: f[1] || (f[1] = (R) => L.value = !1)
              }, "Cancel"),
              p("button", {
                type: "button",
                class: "mt-editor__btn is-active",
                disabled: d.value,
                onClick: Me
              }, C(d.value ? "Accepting…" : "Confirm"), 9, Ft)
            ], 64)) : (u(), m(D, { key: 1 }, [
              N.value ? (u(), m("button", {
                key: 0,
                type: "button",
                class: "mt-editor__btn",
                title: `Download ${ie.value}`,
                onClick: Ae
              }, "Download", 8, Wt)) : M("", !0),
              N.value && Z.value ? (u(), m("button", {
                key: 1,
                type: "button",
                class: I(["mt-editor__btn", { "is-active": S.value }]),
                onClick: f[2] || (f[2] = (R) => S.value = !S.value)
              }, C(S.value ? "Hide changes" : "Show changes"), 3)) : M("", !0),
              Ee.value && (((E = x.value) == null ? void 0 : E.kind) === "pending" || ((j = x.value) == null ? void 0 : j.kind) === "summary") ? (u(), m("button", {
                key: 2,
                type: "button",
                class: "mt-editor__btn",
                onClick: f[3] || (f[3] = (R) => L.value = !0)
              }, "Accept")) : M("", !0),
              $e.value ? (u(), m("button", {
                key: 3,
                type: "button",
                class: "mt-editor__btn",
                disabled: !X.value,
                title: X.value ? "Edit the current version" : "Editing builds on the current version — select the latest state (the diamond) to edit",
                onClick: Te
              }, "Edit", 8, Jt)) : M("", !0)
            ], 64))
          ], 64)) : (u(), m(D, { key: 2 }, [
            p("button", {
              type: "button",
              class: "mt-editor__btn",
              onClick: Se
            }, "Cancel"),
            p("button", {
              type: "button",
              class: "mt-editor__btn is-active",
              disabled: d.value,
              onClick: xe
            }, C(d.value ? "Saving…" : "Save"), 9, Gt)
          ], 64))
        ]),
        _.value ? (u(), m("p", Qt, "Loading…")) : A.value ? (u(), m("p", Xt, C(A.value), 1)) : N.value ? (u(), m(D, { key: 3 }, [
          b.value ? (u(), m("p", en, C(b.value), 1)) : M("", !0),
          w.value === "view" ? (u(), m(D, { key: 1 }, [
            O.value.length > 1 ? (u(), Y(Mt, {
              key: 0,
              points: O.value,
              "selected-id": (K = x.value) == null ? void 0 : K.id,
              onSelect: f[4] || (f[4] = (R) => T.value = R)
            }, null, 8, ["points", "selected-id"])) : M("", !0),
            S.value ? (u(), Y(jt, {
              key: 1,
              "old-text": we.value,
              "new-text": Q.value
            }, null, 8, ["old-text", "new-text"])) : (u(), Y(vt, {
              key: 2,
              content: Q.value
            }, null, 8, ["content"]))
          ], 64)) : (u(), Y(Pe(g.value), {
            key: 2,
            modelValue: l.value,
            "onUpdate:modelValue": f[5] || (f[5] = (R) => l.value = R)
          }, null, 8, ["modelValue"]))
        ], 64)) : (u(), m("p", Zt, " You don’t have access to this document. "))
      ]);
    };
  }
}, fe = Object.freeze([
  "getCurrentUser",
  "can",
  "listDocuments",
  "readAcceptedState",
  "listAcceptedStates",
  "listPendingChanges",
  "savePendingChange",
  "acceptChanges"
]), pe = Object.freeze(["onEvent"]);
function fn(e = {}) {
  const s = fe.filter(
    (n) => typeof e[n] != "function"
  );
  if (s.length > 0)
    throw new Error(
      `createMarkdownTrack: missing required hook(s): ${s.join(", ")}`
    );
  const o = pe.filter(
    (n) => e[n] != null && typeof e[n] != "function"
  );
  if (o.length > 0)
    throw new Error(
      `createMarkdownTrack: optional hook(s) must be functions: ${o.join(", ")}`
    );
  const t = {};
  for (const n of fe) t[n] = e[n];
  for (const n of pe)
    typeof e[n] == "function" && (t[n] = e[n]);
  return Object.freeze({
    hooks: Object.freeze(t),
    options: Object.freeze({ ...e.options || {} })
  });
}
function pn(e = {}) {
  const s = e.user || { id: "dev", email: "dev@example.com", name: "Dev User" }, o = e.can || (() => !0), t = () => e.clock ? e.clock() : (/* @__PURE__ */ new Date()).toISOString(), n = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  let h = 0, g = 0;
  const i = (l) => `${l}-${++g}`, v = (l) => JSON.parse(JSON.stringify(l));
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
    getCurrentUser: () => v(s),
    can: (l, d) => o(l, d, s),
    listDocuments: async () => [...n.values()].map((l) => {
      const d = w(l.id), b = W(d);
      return v({
        ...l,
        title: he(d) ?? void 0,
        access: b ?? void 0
      });
    }),
    readAcceptedState: async (l) => {
      const d = _(l);
      if (!d) throw new Error(`Unknown document: ${l}`);
      return v(d);
    },
    listAcceptedStates: async (l) => v(c.get(l) || []),
    listPendingChanges: async (l) => v(r.get(l) || []),
    savePendingChange: async (l, { content: d }) => {
      var T;
      if (!n.has(l)) throw new Error(`Unknown document: ${l}`);
      const b = {
        id: i("pend"),
        docId: l,
        content: d,
        author: v(s),
        savedAt: t(),
        seq: ++h,
        baseRef: (T = _(l)) == null ? void 0 : T.ref
      };
      return r.get(l).push(b), v(b);
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
        acceptedBy: v(s),
        acceptedAt: t(),
        ref: `mem-${T.seq}`
      };
      c.get(l).push(S);
      const L = b.indexOf(T);
      return r.set(
        l,
        b.slice(L + 1).map((B) => ({ ...B, baseRef: S.ref }))
      ), v(S);
    }
  };
}
export {
  Mt as ChangeTimeline,
  jt as DiffView,
  vn as DocumentView,
  gt as MarkdownEditor,
  mn as MarkdownLibrary,
  vt as MarkdownRenderer,
  pe as OPTIONAL_HOOKS,
  fe as REQUIRED_HOOKS,
  U as TRACK_EVENTS,
  pn as createInMemoryHooks,
  fn as createMarkdownTrack,
  P as emitTrackEvent,
  W as extractAccess,
  he as extractTitle,
  dn as provideMarkdownTrack,
  ge as useMarkdownTrack
};
