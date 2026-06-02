import { provide as be, inject as he, ref as $, onMounted as B, onBeforeUnmount as q, createElementBlock as m, openBlock as c, createElementVNode as v, toDisplayString as C, Fragment as I, renderList as J, createCommentVNode as A, watch as z, nextTick as we, shallowRef as Ce, withDirectives as te, normalizeClass as T, createVNode as $e, unref as Ee, vShow as ne, computed as w, createTextVNode as Se, defineAsyncComponent as xe, createBlock as j, resolveDynamicComponent as Te } from "vue";
import { marked as ie } from "marked";
import { gfmHeadingId as Ae } from "marked-gfm-heading-id";
import { Editor as Me, EditorContent as Ie } from "@tiptap/vue-3";
import Le from "@tiptap/starter-kit";
import Oe from "@tiptap/extension-link";
import { Markdown as De } from "tiptap-markdown";
import { scalePoint as Ne } from "d3-scale";
import { diffLines as Re } from "diff";
const re = Symbol("markdown-track");
function qt(e) {
  return be(re, e), e;
}
function ce() {
  const e = he(re, null);
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
function U(e, d, i = {}) {
  var a, b, h, s;
  const t = (a = e == null ? void 0 : e.hooks) == null ? void 0 : a.onEvent;
  if (typeof t != "function") return;
  let n = null;
  try {
    n = ((h = (b = e.hooks).getCurrentUser) == null ? void 0 : h.call(b)) ?? null;
  } catch {
    n = null;
  }
  const r = {
    action: d,
    currentUser: n,
    library: ((s = e == null ? void 0 : e.options) == null ? void 0 : s.library) ?? null,
    docId: i.docId ?? null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    t(r);
  } catch {
  }
  return r;
}
const Ve = { class: "mt-library" }, Ue = {
  key: 0,
  class: "mt-library__status"
}, Pe = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Be = {
  key: 2,
  class: "mt-library__status"
}, He = {
  key: 3,
  class: "mt-library__list"
}, je = ["onClick"], ze = { class: "mt-library__title" }, qe = {
  key: 0,
  class: "mt-library__filename"
}, Kt = {
  __name: "MarkdownLibrary",
  emits: ["select"],
  setup(e, { emit: d }) {
    const i = d, t = ce(), { hooks: n } = t, r = $([]), a = $(!0), b = $("");
    B(async () => {
      U(t, V.ENTER_LIBRARY);
      try {
        const s = await n.listDocuments();
        r.value = s.filter((u) => n.can("view", u));
      } catch (s) {
        b.value = (s == null ? void 0 : s.message) || String(s);
      } finally {
        a.value = !1;
      }
    }), q(() => {
      U(t, V.LEAVE_LIBRARY);
    });
    const h = (s) => s.title || s.filename;
    return (s, u) => (c(), m("div", Ve, [
      u[0] || (u[0] = v("h2", { class: "mt-library__heading" }, "Documents", -1)),
      a.value ? (c(), m("p", Ue, "Loading…")) : b.value ? (c(), m("p", Pe, C(b.value), 1)) : r.value.length ? (c(), m("ul", He, [
        (c(!0), m(I, null, J(r.value, (_) => (c(), m("li", {
          key: _.id,
          class: "mt-library__item"
        }, [
          v("button", {
            type: "button",
            class: "mt-library__link",
            onClick: (l) => i("select", _.id)
          }, [
            v("span", ze, C(h(_)), 1),
            _.title && _.title !== _.filename ? (c(), m("span", qe, C(_.filename), 1)) : A("", !0)
          ], 8, je)
        ]))), 128))
      ])) : (c(), m("p", Be, "No documents available."))
    ]));
  }
};
function de(e) {
  if (typeof e != "string") return null;
  const d = [];
  let i = null;
  for (const t of e.split(`
`)) {
    const n = t.replace(/\r$/, ""), r = n.match(/^\s*(`{3,}|~{3,})/);
    if (r) {
      const b = r[1][0];
      i === null ? i = b : i === b && (i = null);
      continue;
    }
    if (i !== null) continue;
    const a = n.match(/^#\s+(.+?)\s*#*\s*$/);
    a && a[1].trim() && d.push(a[1].trim());
  }
  return d.length === 1 ? d[0] : null;
}
ie.use(Ae());
function Ke(e) {
  return typeof e != "string" || e.length === 0 ? "" : ie.parse(e, { gfm: !0, breaks: !1 });
}
let oe = !1;
function Ye(e) {
  return typeof e == "string" && /(^|\n)\s*```mermaid\b/.test(e);
}
async function We(e) {
  if (!e) return;
  const d = e.querySelectorAll("pre code.language-mermaid");
  if (!d.length) return;
  let i;
  try {
    i = (await import("mermaid")).default;
  } catch (t) {
    console.warn("markdown-track: 'mermaid' is not installed; leaving diagrams as code.", t);
    return;
  }
  oe || (i.initialize({ startOnLoad: !1, securityLevel: "strict" }), oe = !0);
  for (const t of d) {
    const n = t.closest("pre");
    if (!n) continue;
    const r = document.createElement("div");
    r.className = "mermaid", r.textContent = t.textContent, n.replaceWith(r);
  }
  try {
    await i.run({ nodes: e.querySelectorAll(".mermaid") });
  } catch (t) {
    console.warn("markdown-track: mermaid render error", t);
  }
}
const Fe = ["innerHTML"], Je = {
  __name: "MarkdownRenderer",
  props: { content: { type: String, default: "" } },
  setup(e) {
    const d = e, i = $(null), t = $("");
    async function n() {
      t.value = Ke(d.content), await we(), i.value && Ye(d.content) && await We(i.value);
    }
    return B(n), z(() => d.content, n), (r, a) => (c(), m("div", {
      ref_key: "root",
      ref: i,
      class: "mt-markdown",
      innerHTML: t.value
    }, null, 8, Fe));
  }
};
function Ge() {
  return [
    Le,
    Oe.configure({ openOnClick: !1 }),
    De.configure({
      html: !1,
      tightLists: !0,
      breaks: !1,
      transformPastedText: !0,
      transformCopiedText: !0
    })
  ];
}
function se(e) {
  var d, i, t;
  return ((t = (i = (d = e == null ? void 0 : e.storage) == null ? void 0 : d.markdown) == null ? void 0 : i.getMarkdown) == null ? void 0 : t.call(i)) ?? "";
}
const Qe = { class: "mt-editor" }, Xe = {
  key: 0,
  class: "mt-editor__toolbar"
}, Ze = ["value"], et = {
  __name: "MarkdownEditor",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(e, { emit: d }) {
    const i = e, t = d, n = Ce(null), r = $(!1);
    B(() => {
      n.value = new Me({
        extensions: Ge(),
        content: i.modelValue,
        // tiptap-markdown parses the markdown string
        onUpdate: ({ editor: h }) => t("update:modelValue", se(h))
      });
    }), q(() => {
      var h;
      return (h = n.value) == null ? void 0 : h.destroy();
    }), z(
      () => i.modelValue,
      (h) => {
        n.value && h !== se(n.value) && n.value.commands.setContent(h, !1);
      }
    );
    const a = (h) => n.value && h(n.value.chain().focus()), b = (h, s) => {
      var u;
      return ((u = n.value) == null ? void 0 : u.isActive(h, s)) ?? !1;
    };
    return (h, s) => (c(), m("div", Qe, [
      n.value ? (c(), m("div", Xe, [
        v("button", {
          type: "button",
          class: T(["mt-editor__btn", { "is-active": b("heading", { level: 1 }) }]),
          onClick: s[0] || (s[0] = (u) => a((_) => _.toggleHeading({ level: 1 }).run()))
        }, "H1", 2),
        v("button", {
          type: "button",
          class: T(["mt-editor__btn", { "is-active": b("heading", { level: 2 }) }]),
          onClick: s[1] || (s[1] = (u) => a((_) => _.toggleHeading({ level: 2 }).run()))
        }, "H2", 2),
        v("button", {
          type: "button",
          class: T(["mt-editor__btn", { "is-active": b("bold") }]),
          onClick: s[2] || (s[2] = (u) => a((_) => _.toggleBold().run()))
        }, s[7] || (s[7] = [
          v("b", null, "B", -1)
        ]), 2),
        v("button", {
          type: "button",
          class: T(["mt-editor__btn", { "is-active": b("italic") }]),
          onClick: s[3] || (s[3] = (u) => a((_) => _.toggleItalic().run()))
        }, s[8] || (s[8] = [
          v("i", null, "I", -1)
        ]), 2),
        v("button", {
          type: "button",
          class: T(["mt-editor__btn", { "is-active": b("bulletList") }]),
          onClick: s[4] || (s[4] = (u) => a((_) => _.toggleBulletList().run()))
        }, "• List", 2),
        v("button", {
          type: "button",
          class: T(["mt-editor__btn", { "is-active": b("codeBlock") }]),
          onClick: s[5] || (s[5] = (u) => a((_) => _.toggleCodeBlock().run()))
        }, "Code", 2),
        s[9] || (s[9] = v("span", { class: "mt-editor__spacer" }, null, -1)),
        v("button", {
          type: "button",
          class: T(["mt-editor__btn", { "is-active": r.value }]),
          onClick: s[6] || (s[6] = (u) => r.value = !r.value)
        }, "Source", 2)
      ])) : A("", !0),
      te($e(Ee(Ie), {
        editor: n.value,
        class: "mt-editor__content"
      }, null, 8, ["editor"]), [
        [ne, !r.value]
      ]),
      te(v("textarea", {
        class: "mt-editor__source",
        value: e.modelValue,
        readonly: "",
        spellcheck: "false"
      }, null, 8, Ze), [
        [ne, r.value]
      ])
    ]));
  }
}, tt = ["width"], nt = ["x2"], ot = ["transform", "onClick"], st = {
  key: 0,
  class: "mt-timeline__dot",
  x: "-6.5",
  y: "-6.5",
  width: "13",
  height: "13",
  transform: "rotate(45)"
}, at = ["r"], lt = {
  key: 0,
  class: "mt-timeline__caption"
}, it = ["disabled"], rt = ["disabled"], ct = { class: "mt-timeline__label" }, dt = { key: 0 }, R = 24, ut = 44, F = 22, mt = {
  __name: "ChangeTimeline",
  props: {
    // [{ id, kind: 'accepted'|'pending', at, label, author? }]
    points: { type: Array, default: () => [] },
    selectedId: { type: String, default: null }
  },
  emits: ["select"],
  setup(e, { emit: d }) {
    const i = e, t = d, n = $(null), r = $(600);
    let a = null;
    B(() => {
      n.value && (r.value = n.value.clientWidth || 600, a = new ResizeObserver(() => {
        r.value = n.value.clientWidth || 600;
      }), a.observe(n.value));
    }), q(() => a == null ? void 0 : a.disconnect());
    const b = w(
      () => Ne().domain(i.points.map((p) => p.id)).range([R, Math.max(R + 1, r.value - R)]).padding(0.5)
    ), h = w(
      () => i.points.map((p) => ({ ...p, x: b.value(p.id) ?? R }))
    ), s = w(() => i.points.findIndex((p) => p.id === i.selectedId)), u = w(() => i.points[s.value] || null);
    function _(p) {
      const g = s.value + p;
      g >= 0 && g < i.points.length && t("select", i.points[g].id);
    }
    const l = (p) => {
      try {
        return new Date(p).toLocaleString();
      } catch {
        return String(p);
      }
    };
    return (p, g) => (c(), m("div", {
      ref_key: "root",
      ref: n,
      class: "mt-timeline"
    }, [
      (c(), m("svg", {
        width: r.value,
        height: ut,
        class: "mt-timeline__svg",
        role: "group",
        "aria-label": "Change timeline"
      }, [
        v("line", {
          class: "mt-timeline__track",
          x1: R,
          y1: F,
          x2: Math.max(R, r.value - R),
          y2: F
        }, null, 8, nt),
        (c(!0), m(I, null, J(h.value, (y) => (c(), m("g", {
          key: y.id,
          class: T(["mt-timeline__point", [`mt-timeline__point--${y.kind}`, { "is-selected": y.id === e.selectedId }]]),
          transform: `translate(${y.x},${F})`,
          onClick: (S) => t("select", y.id)
        }, [
          g[2] || (g[2] = v("circle", {
            r: "11",
            class: "mt-timeline__hit"
          }, null, -1)),
          y.kind === "summary" ? (c(), m("rect", st)) : (c(), m("circle", {
            key: 1,
            r: y.kind === "accepted" ? 7 : 4.5,
            class: "mt-timeline__dot"
          }, null, 8, at)),
          v("title", null, C(y.label) + " — " + C(l(y.at)), 1)
        ], 10, ot))), 128))
      ], 8, tt)),
      u.value ? (c(), m("div", lt, [
        v("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: s.value <= 0,
          onClick: g[0] || (g[0] = (y) => _(-1))
        }, "‹", 8, it),
        v("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: s.value >= e.points.length - 1,
          onClick: g[1] || (g[1] = (y) => _(1))
        }, "›", 8, rt),
        v("span", ct, [
          v("strong", null, C(u.value.label), 1),
          v("span", null, " · " + C(l(u.value.at)), 1),
          u.value.author ? (c(), m("span", dt, " · " + C(u.value.author.email), 1)) : A("", !0)
        ])
      ])) : A("", !0)
    ], 512));
  }
};
function vt(e, d) {
  const i = Re(e ?? "", d ?? ""), t = [];
  for (const n of i) {
    const r = n.added ? "added" : n.removed ? "removed" : "context", a = n.value.split(`
`);
    a.length && a[a.length - 1] === "" && a.pop();
    for (const b of a) t.push({ type: r, text: b });
  }
  return t;
}
function ft(e) {
  let d = 0, i = 0;
  for (const t of e)
    t.type === "added" ? d += 1 : t.type === "removed" && (i += 1);
  return { added: d, removed: i };
}
const pt = { class: "mt-diff" }, _t = { class: "mt-diff__stats" }, yt = { class: "mt-diff__stat mt-diff__stat--added" }, gt = { class: "mt-diff__stat mt-diff__stat--removed" }, kt = {
  key: 0,
  class: "mt-library__status"
}, bt = {
  key: 1,
  class: "mt-diff__body"
}, ht = { class: "mt-diff__gutter" }, wt = { class: "mt-diff__text" }, Ct = {
  __name: "DiffView",
  props: {
    oldText: { type: String, default: "" },
    newText: { type: String, default: "" }
  },
  setup(e) {
    const d = e, i = w(() => vt(d.oldText, d.newText)), t = w(() => ft(i.value)), n = w(() => t.value.added > 0 || t.value.removed > 0), r = (a) => a === "added" ? "+" : a === "removed" ? "−" : " ";
    return (a, b) => (c(), m("div", pt, [
      v("div", _t, [
        v("span", yt, "+" + C(t.value.added), 1),
        v("span", gt, "−" + C(t.value.removed), 1)
      ]),
      n.value ? (c(), m("pre", bt, [
        (c(!0), m(I, null, J(i.value, (h, s) => (c(), m("span", {
          key: s,
          class: T(["mt-diff__line", `mt-diff__line--${h.type}`])
        }, [
          v("span", ht, C(r(h.type)), 1),
          v("span", wt, C(h.text), 1),
          b[0] || (b[0] = Se(`
`))
        ], 2))), 128))
      ])) : (c(), m("p", kt, "No changes from the accepted version."))
    ]));
  }
}, $t = { class: "mt-doc" }, Et = { class: "mt-doc__bar" }, St = { class: "mt-doc__title" }, xt = {
  key: 0,
  class: "mt-doc__pending"
}, Tt = { class: "mt-doc__confirm" }, At = ["disabled"], Mt = ["title"], It = ["disabled"], Lt = {
  key: 0,
  class: "mt-library__status"
}, Ot = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Dt = {
  key: 0,
  class: "mt-doc__note"
}, Yt = {
  __name: "DocumentView",
  props: { docId: { type: String, required: !0 } },
  emits: ["back"],
  setup(e, { emit: d }) {
    const i = xe(() => import("./MarkdownEditorVMd-CIGKbg-C.js")), t = e, n = d, r = ce(), { hooks: a, options: b } = r, h = w(
      () => b.editor === "tiptap" ? et : i
    ), s = $([]), u = $([]), _ = $(!0), l = $(""), p = $("view"), g = $(""), y = $(!1), S = $(""), O = $(null), x = $(!1), D = $(!1), G = w(() => s.value[s.value.length - 1] || null), Q = w(() => u.value[u.value.length - 1] || null), L = w(() => {
      const o = [
        ...s.value.map((k) => ({
          id: k.id,
          kind: "accepted",
          at: k.acceptedAt,
          content: k.content,
          label: "Accepted",
          author: k.acceptedBy
        })),
        ...u.value.map((k) => ({
          id: k.id,
          kind: "pending",
          at: k.savedAt,
          content: k.content,
          label: `Pending #${k.seq}`,
          author: k.author
        }))
      ], f = Q.value;
      return f && o.push({
        id: "all-changes",
        kind: "summary",
        at: f.savedAt,
        content: f.content,
        label: "All changes",
        author: f.author
      }), o;
    }), M = w(
      () => L.value.find((o) => o.id === O.value) || L.value[L.value.length - 1] || null
    ), K = w(() => {
      var o;
      return ((o = M.value) == null ? void 0 : o.content) ?? "";
    }), ue = w(() => {
      var k, E;
      const o = M.value;
      if (!o) return "";
      if (o.kind === "summary") return ((k = G.value) == null ? void 0 : k.content) ?? "";
      const f = L.value.findIndex((P) => P.id === o.id);
      return ((E = L.value[f - 1]) == null ? void 0 : E.content) ?? "";
    }), me = w(() => {
      var o;
      return de(((o = G.value) == null ? void 0 : o.content) || "") || t.docId;
    }), ve = w(() => a.can("edit", { id: t.docId })), fe = w(() => a.can("accept", { id: t.docId })), Y = w(() => u.value.length), W = w(() => (t.docId || "document").replace(/\.md$/i, "")), X = w(() => {
      const o = M.value;
      if ((o == null ? void 0 : o.kind) === "summary") return `${W.value}.all-changes.md`;
      if ((o == null ? void 0 : o.kind) === "pending") {
        const f = String(o.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return `${W.value}.${f}.md`;
      }
      return `${W.value}.md`;
    });
    function pe() {
      const o = new Blob([K.value ?? ""], { type: "text/markdown;charset=utf-8" }), f = URL.createObjectURL(o), k = document.createElement("a");
      k.href = f, k.download = X.value, document.body.appendChild(k), k.click(), k.remove(), URL.revokeObjectURL(f);
    }
    function Z() {
      var k;
      const o = L.value, f = o.find((E) => E.kind === "summary");
      O.value = ((k = f ?? o[o.length - 1]) == null ? void 0 : k.id) ?? null;
    }
    async function ee() {
      _.value = !0, l.value = "", p.value = "view", S.value = "", x.value = !1, D.value = !1;
      try {
        const [o, f] = await Promise.all([
          a.listAcceptedStates(t.docId),
          a.listPendingChanges(t.docId)
        ]);
        s.value = o, u.value = f, Z();
      } catch (o) {
        l.value = (o == null ? void 0 : o.message) || String(o);
      } finally {
        _.value = !1;
      }
    }
    B(() => {
      U(r, V.SELECT_DOCUMENT, { docId: t.docId }), ee();
    }), z(() => t.docId, (o, f) => {
      f && U(r, V.LEAVE_DOCUMENT, { docId: f }), U(r, V.SELECT_DOCUMENT, { docId: o }), ee();
    }), q(() => {
      U(r, V.LEAVE_DOCUMENT, { docId: t.docId });
    }), z(O, () => {
      D.value = !1;
    });
    function _e() {
      var o;
      g.value = ((o = M.value) == null ? void 0 : o.content) ?? "", S.value = "", x.value = !1, D.value = !1, p.value = "edit";
    }
    function ye() {
      p.value = "view";
    }
    async function ge() {
      y.value = !0, l.value = "";
      try {
        const o = await a.savePendingChange(t.docId, { content: g.value });
        U(r, V.SAVE_DOCUMENT, { docId: t.docId }), u.value = await a.listPendingChanges(t.docId), Z(), S.value = `Saved pending change (seq ${o.seq}).`, p.value = "view";
      } catch (o) {
        l.value = (o == null ? void 0 : o.message) || String(o);
      } finally {
        y.value = !1;
      }
    }
    async function ke() {
      var k;
      const o = M.value;
      if (!o || o.kind !== "pending" && o.kind !== "summary") return;
      const f = o.kind === "summary" ? ((k = Q.value) == null ? void 0 : k.id) ?? null : o.id;
      y.value = !0, l.value = "";
      try {
        const E = await a.acceptChanges(t.docId, { upToChangeId: f }), [P, H] = await Promise.all([
          a.listAcceptedStates(t.docId),
          a.listPendingChanges(t.docId)
        ]);
        s.value = P, u.value = H, O.value = E.id, S.value = "Accepted — new baseline established.", D.value = !1;
      } catch (E) {
        l.value = (E == null ? void 0 : E.message) || String(E);
      } finally {
        y.value = !1;
      }
    }
    return (o, f) => {
      var k, E, P, H;
      return c(), m("div", $t, [
        v("div", Et, [
          v("button", {
            type: "button",
            class: "mt-editor__btn",
            onClick: f[0] || (f[0] = (N) => n("back"))
          }, "← Library"),
          v("h2", St, C(me.value), 1),
          f[6] || (f[6] = v("span", { class: "mt-doc__spacer" }, null, -1)),
          Y.value ? (c(), m("span", xt, C(Y.value) + " pending", 1)) : A("", !0),
          p.value === "view" ? (c(), m(I, { key: 1 }, [
            D.value ? (c(), m(I, { key: 0 }, [
              v("span", Tt, "Accept “" + C((k = M.value) == null ? void 0 : k.label) + "” as the new baseline?", 1),
              v("button", {
                type: "button",
                class: "mt-editor__btn",
                onClick: f[1] || (f[1] = (N) => D.value = !1)
              }, "Cancel"),
              v("button", {
                type: "button",
                class: "mt-editor__btn is-active",
                disabled: y.value,
                onClick: ke
              }, C(y.value ? "Accepting…" : "Confirm"), 9, At)
            ], 64)) : (c(), m(I, { key: 1 }, [
              v("button", {
                type: "button",
                class: "mt-editor__btn",
                title: `Download ${X.value}`,
                onClick: pe
              }, "Download", 8, Mt),
              Y.value ? (c(), m("button", {
                key: 0,
                type: "button",
                class: T(["mt-editor__btn", { "is-active": x.value }]),
                onClick: f[2] || (f[2] = (N) => x.value = !x.value)
              }, C(x.value ? "Hide changes" : "Show changes"), 3)) : A("", !0),
              fe.value && (((E = M.value) == null ? void 0 : E.kind) === "pending" || ((P = M.value) == null ? void 0 : P.kind) === "summary") ? (c(), m("button", {
                key: 1,
                type: "button",
                class: "mt-editor__btn",
                onClick: f[3] || (f[3] = (N) => D.value = !0)
              }, "Accept")) : A("", !0),
              ve.value ? (c(), m("button", {
                key: 2,
                type: "button",
                class: "mt-editor__btn",
                onClick: _e
              }, "Edit")) : A("", !0)
            ], 64))
          ], 64)) : (c(), m(I, { key: 2 }, [
            v("button", {
              type: "button",
              class: "mt-editor__btn",
              onClick: ye
            }, "Cancel"),
            v("button", {
              type: "button",
              class: "mt-editor__btn is-active",
              disabled: y.value,
              onClick: ge
            }, C(y.value ? "Saving…" : "Save"), 9, It)
          ], 64))
        ]),
        _.value ? (c(), m("p", Lt, "Loading…")) : l.value ? (c(), m("p", Ot, C(l.value), 1)) : (c(), m(I, { key: 2 }, [
          S.value ? (c(), m("p", Dt, C(S.value), 1)) : A("", !0),
          p.value === "view" ? (c(), m(I, { key: 1 }, [
            L.value.length > 1 ? (c(), j(mt, {
              key: 0,
              points: L.value,
              "selected-id": (H = M.value) == null ? void 0 : H.id,
              onSelect: f[4] || (f[4] = (N) => O.value = N)
            }, null, 8, ["points", "selected-id"])) : A("", !0),
            x.value ? (c(), j(Ct, {
              key: 1,
              "old-text": ue.value,
              "new-text": K.value
            }, null, 8, ["old-text", "new-text"])) : (c(), j(Je, {
              key: 2,
              content: K.value
            }, null, 8, ["content"]))
          ], 64)) : (c(), j(Te(h.value), {
            key: 2,
            modelValue: g.value,
            "onUpdate:modelValue": f[5] || (f[5] = (N) => g.value = N)
          }, null, 8, ["modelValue"]))
        ], 64))
      ]);
    };
  }
}, ae = Object.freeze([
  "getCurrentUser",
  "can",
  "listDocuments",
  "readAcceptedState",
  "listAcceptedStates",
  "listPendingChanges",
  "savePendingChange",
  "acceptChanges"
]), le = Object.freeze(["onEvent"]);
function Wt(e = {}) {
  const d = ae.filter(
    (n) => typeof e[n] != "function"
  );
  if (d.length > 0)
    throw new Error(
      `createMarkdownTrack: missing required hook(s): ${d.join(", ")}`
    );
  const i = le.filter(
    (n) => e[n] != null && typeof e[n] != "function"
  );
  if (i.length > 0)
    throw new Error(
      `createMarkdownTrack: optional hook(s) must be functions: ${i.join(", ")}`
    );
  const t = {};
  for (const n of ae) t[n] = e[n];
  for (const n of le)
    typeof e[n] == "function" && (t[n] = e[n]);
  return Object.freeze({
    hooks: Object.freeze(t),
    options: Object.freeze({ ...e.options || {} })
  });
}
function Ft(e = {}) {
  const d = e.user || { id: "dev", email: "dev@example.com", name: "Dev User" }, i = e.can || (() => !0), t = () => e.clock ? e.clock() : (/* @__PURE__ */ new Date()).toISOString(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  let b = 0, h = 0;
  const s = (l) => `${l}-${++h}`, u = (l) => JSON.parse(JSON.stringify(l));
  for (const l of e.documents || [])
    n.set(l.id, { id: l.id, filename: l.filename }), r.set(l.id, [
      {
        id: s("acc"),
        docId: l.id,
        content: l.content ?? "",
        acceptedBy: d,
        acceptedAt: t(),
        ref: "seed"
      }
    ]), a.set(l.id, []);
  const _ = (l) => {
    const p = r.get(l) || [];
    return p[p.length - 1];
  };
  return {
    getCurrentUser: () => u(d),
    can: (l, p) => i(l, p, d),
    listDocuments: async () => [...n.values()].map((l) => {
      var g;
      const p = ((g = _(l.id)) == null ? void 0 : g.content) ?? "";
      return u({ ...l, title: de(p) ?? void 0 });
    }),
    readAcceptedState: async (l) => {
      const p = _(l);
      if (!p) throw new Error(`Unknown document: ${l}`);
      return u(p);
    },
    listAcceptedStates: async (l) => u(r.get(l) || []),
    listPendingChanges: async (l) => u(a.get(l) || []),
    savePendingChange: async (l, { content: p }) => {
      var y;
      if (!n.has(l)) throw new Error(`Unknown document: ${l}`);
      const g = {
        id: s("pend"),
        docId: l,
        content: p,
        author: u(d),
        savedAt: t(),
        seq: ++b,
        baseRef: (y = _(l)) == null ? void 0 : y.ref
      };
      return a.get(l).push(g), u(g);
    },
    acceptChanges: async (l, p = {}) => {
      const g = a.get(l) || [];
      if (g.length === 0) throw new Error("No pending changes to accept");
      let y = g[g.length - 1];
      p.upToChangeId && (y = g.find((x) => x.id === p.upToChangeId) || y);
      const S = {
        id: s("acc"),
        docId: l,
        content: y.content,
        acceptedBy: u(d),
        acceptedAt: t(),
        ref: `mem-${y.seq}`
      };
      r.get(l).push(S);
      const O = g.indexOf(y);
      return a.set(
        l,
        g.slice(O + 1).map((x) => ({ ...x, baseRef: S.ref }))
      ), u(S);
    }
  };
}
export {
  mt as ChangeTimeline,
  Ct as DiffView,
  Yt as DocumentView,
  et as MarkdownEditor,
  Kt as MarkdownLibrary,
  Je as MarkdownRenderer,
  le as OPTIONAL_HOOKS,
  ae as REQUIRED_HOOKS,
  V as TRACK_EVENTS,
  Ft as createInMemoryHooks,
  Wt as createMarkdownTrack,
  U as emitTrackEvent,
  de as extractTitle,
  qt as provideMarkdownTrack,
  ce as useMarkdownTrack
};
