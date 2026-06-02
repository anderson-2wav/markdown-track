import { provide as _e, inject as ge, ref as C, onMounted as R, createElementBlock as d, openBlock as l, createElementVNode as f, toDisplayString as $, Fragment as E, renderList as K, createCommentVNode as T, watch as U, nextTick as ye, shallowRef as ke, onBeforeUnmount as ne, withDirectives as Q, normalizeClass as M, createVNode as he, unref as be, vShow as X, computed as w, createTextVNode as we, defineAsyncComponent as $e, createBlock as B, resolveDynamicComponent as Ce } from "vue";
import { marked as se } from "marked";
import { gfmHeadingId as xe } from "marked-gfm-heading-id";
import { Editor as Se, EditorContent as Ae } from "@tiptap/vue-3";
import Me from "@tiptap/starter-kit";
import Te from "@tiptap/extension-link";
import { Markdown as Le } from "tiptap-markdown";
import { scalePoint as Ie } from "d3-scale";
import { diffLines as Ee } from "diff";
const ae = Symbol("markdown-track");
function Ut(n) {
  return _e(ae, n), n;
}
function oe() {
  const n = ge(ae, null);
  if (!n)
    throw new Error(
      "useMarkdownTrack(): no markdown-track provider found. Call provideMarkdownTrack(createMarkdownTrack(...)) in a parent component."
    );
  return n;
}
const De = { class: "mt-library" }, Oe = {
  key: 0,
  class: "mt-library__status"
}, Ve = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Pe = {
  key: 2,
  class: "mt-library__status"
}, Re = {
  key: 3,
  class: "mt-library__list"
}, Ne = ["onClick"], Be = { class: "mt-library__title" }, Ue = {
  key: 0,
  class: "mt-library__filename"
}, Ht = {
  __name: "MarkdownLibrary",
  emits: ["select"],
  setup(n, { emit: u }) {
    const s = u, { hooks: e } = oe(), i = C([]), r = C(!0), c = C("");
    R(async () => {
      try {
        const m = await e.listDocuments();
        i.value = m.filter((a) => e.can("view", a));
      } catch (m) {
        c.value = (m == null ? void 0 : m.message) || String(m);
      } finally {
        r.value = !1;
      }
    });
    const b = (m) => m.title || m.filename;
    return (m, a) => (l(), d("div", De, [
      a[0] || (a[0] = f("h2", { class: "mt-library__heading" }, "Documents", -1)),
      r.value ? (l(), d("p", Oe, "Loading…")) : c.value ? (l(), d("p", Ve, $(c.value), 1)) : i.value.length ? (l(), d("ul", Re, [
        (l(!0), d(E, null, K(i.value, (v) => (l(), d("li", {
          key: v.id,
          class: "mt-library__item"
        }, [
          f("button", {
            type: "button",
            class: "mt-library__link",
            onClick: (y) => s("select", v.id)
          }, [
            f("span", Be, $(b(v)), 1),
            v.title && v.title !== v.filename ? (l(), d("span", Ue, $(v.filename), 1)) : T("", !0)
          ], 8, Ne)
        ]))), 128))
      ])) : (l(), d("p", Pe, "No documents available."))
    ]));
  }
};
function le(n) {
  if (typeof n != "string") return null;
  const u = [];
  let s = null;
  for (const e of n.split(`
`)) {
    const i = e.replace(/\r$/, ""), r = i.match(/^\s*(`{3,}|~{3,})/);
    if (r) {
      const b = r[1][0];
      s === null ? s = b : s === b && (s = null);
      continue;
    }
    if (s !== null) continue;
    const c = i.match(/^#\s+(.+?)\s*#*\s*$/);
    c && c[1].trim() && u.push(c[1].trim());
  }
  return u.length === 1 ? u[0] : null;
}
se.use(xe());
function He(n) {
  return typeof n != "string" || n.length === 0 ? "" : se.parse(n, { gfm: !0, breaks: !1 });
}
let Z = !1;
function qe(n) {
  return typeof n == "string" && /(^|\n)\s*```mermaid\b/.test(n);
}
async function ze(n) {
  if (!n) return;
  const u = n.querySelectorAll("pre code.language-mermaid");
  if (!u.length) return;
  let s;
  try {
    s = (await import("mermaid")).default;
  } catch (e) {
    console.warn("markdown-track: 'mermaid' is not installed; leaving diagrams as code.", e);
    return;
  }
  Z || (s.initialize({ startOnLoad: !1, securityLevel: "strict" }), Z = !0);
  for (const e of u) {
    const i = e.closest("pre");
    if (!i) continue;
    const r = document.createElement("div");
    r.className = "mermaid", r.textContent = e.textContent, i.replaceWith(r);
  }
  try {
    await s.run({ nodes: n.querySelectorAll(".mermaid") });
  } catch (e) {
    console.warn("markdown-track: mermaid render error", e);
  }
}
const je = ["innerHTML"], Ke = {
  __name: "MarkdownRenderer",
  props: { content: { type: String, default: "" } },
  setup(n) {
    const u = n, s = C(null), e = C("");
    async function i() {
      e.value = He(u.content), await ye(), s.value && qe(u.content) && await ze(s.value);
    }
    return R(i), U(() => u.content, i), (r, c) => (l(), d("div", {
      ref_key: "root",
      ref: s,
      class: "mt-markdown",
      innerHTML: e.value
    }, null, 8, je));
  }
};
function We() {
  return [
    Me,
    Te.configure({ openOnClick: !1 }),
    Le.configure({
      html: !1,
      tightLists: !0,
      breaks: !1,
      transformPastedText: !0,
      transformCopiedText: !0
    })
  ];
}
function ee(n) {
  var u, s, e;
  return ((e = (s = (u = n == null ? void 0 : n.storage) == null ? void 0 : u.markdown) == null ? void 0 : s.getMarkdown) == null ? void 0 : e.call(s)) ?? "";
}
const Fe = { class: "mt-editor" }, Je = {
  key: 0,
  class: "mt-editor__toolbar"
}, Ye = ["value"], Ge = {
  __name: "MarkdownEditor",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(n, { emit: u }) {
    const s = n, e = u, i = ke(null), r = C(!1);
    R(() => {
      i.value = new Se({
        extensions: We(),
        content: s.modelValue,
        // tiptap-markdown parses the markdown string
        onUpdate: ({ editor: m }) => e("update:modelValue", ee(m))
      });
    }), ne(() => {
      var m;
      return (m = i.value) == null ? void 0 : m.destroy();
    }), U(
      () => s.modelValue,
      (m) => {
        i.value && m !== ee(i.value) && i.value.commands.setContent(m, !1);
      }
    );
    const c = (m) => i.value && m(i.value.chain().focus()), b = (m, a) => {
      var v;
      return ((v = i.value) == null ? void 0 : v.isActive(m, a)) ?? !1;
    };
    return (m, a) => (l(), d("div", Fe, [
      i.value ? (l(), d("div", Je, [
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": b("heading", { level: 1 }) }]),
          onClick: a[0] || (a[0] = (v) => c((y) => y.toggleHeading({ level: 1 }).run()))
        }, "H1", 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": b("heading", { level: 2 }) }]),
          onClick: a[1] || (a[1] = (v) => c((y) => y.toggleHeading({ level: 2 }).run()))
        }, "H2", 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": b("bold") }]),
          onClick: a[2] || (a[2] = (v) => c((y) => y.toggleBold().run()))
        }, a[7] || (a[7] = [
          f("b", null, "B", -1)
        ]), 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": b("italic") }]),
          onClick: a[3] || (a[3] = (v) => c((y) => y.toggleItalic().run()))
        }, a[8] || (a[8] = [
          f("i", null, "I", -1)
        ]), 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": b("bulletList") }]),
          onClick: a[4] || (a[4] = (v) => c((y) => y.toggleBulletList().run()))
        }, "• List", 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": b("codeBlock") }]),
          onClick: a[5] || (a[5] = (v) => c((y) => y.toggleCodeBlock().run()))
        }, "Code", 2),
        a[9] || (a[9] = f("span", { class: "mt-editor__spacer" }, null, -1)),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": r.value }]),
          onClick: a[6] || (a[6] = (v) => r.value = !r.value)
        }, "Source", 2)
      ])) : T("", !0),
      Q(he(be(Ae), {
        editor: i.value,
        class: "mt-editor__content"
      }, null, 8, ["editor"]), [
        [X, !r.value]
      ]),
      Q(f("textarea", {
        class: "mt-editor__source",
        value: n.modelValue,
        readonly: "",
        spellcheck: "false"
      }, null, 8, Ye), [
        [X, r.value]
      ])
    ]));
  }
}, Qe = ["width"], Xe = ["x2"], Ze = ["transform", "onClick"], et = {
  key: 0,
  class: "mt-timeline__dot",
  x: "-6.5",
  y: "-6.5",
  width: "13",
  height: "13",
  transform: "rotate(45)"
}, tt = ["r"], nt = {
  key: 0,
  class: "mt-timeline__caption"
}, st = ["disabled"], at = ["disabled"], ot = { class: "mt-timeline__label" }, lt = { key: 0 }, V = 24, it = 44, j = 22, rt = {
  __name: "ChangeTimeline",
  props: {
    // [{ id, kind: 'accepted'|'pending', at, label, author? }]
    points: { type: Array, default: () => [] },
    selectedId: { type: String, default: null }
  },
  emits: ["select"],
  setup(n, { emit: u }) {
    const s = n, e = u, i = C(null), r = C(600);
    let c = null;
    R(() => {
      i.value && (r.value = i.value.clientWidth || 600, c = new ResizeObserver(() => {
        r.value = i.value.clientWidth || 600;
      }), c.observe(i.value));
    }), ne(() => c == null ? void 0 : c.disconnect());
    const b = w(
      () => Ie().domain(s.points.map((p) => p.id)).range([V, Math.max(V + 1, r.value - V)]).padding(0.5)
    ), m = w(
      () => s.points.map((p) => ({ ...p, x: b.value(p.id) ?? V }))
    ), a = w(() => s.points.findIndex((p) => p.id === s.selectedId)), v = w(() => s.points[a.value] || null);
    function y(p) {
      const _ = a.value + p;
      _ >= 0 && _ < s.points.length && e("select", s.points[_].id);
    }
    const o = (p) => {
      try {
        return new Date(p).toLocaleString();
      } catch {
        return String(p);
      }
    };
    return (p, _) => (l(), d("div", {
      ref_key: "root",
      ref: i,
      class: "mt-timeline"
    }, [
      (l(), d("svg", {
        width: r.value,
        height: it,
        class: "mt-timeline__svg",
        role: "group",
        "aria-label": "Change timeline"
      }, [
        f("line", {
          class: "mt-timeline__track",
          x1: V,
          y1: j,
          x2: Math.max(V, r.value - V),
          y2: j
        }, null, 8, Xe),
        (l(!0), d(E, null, K(m.value, (h) => (l(), d("g", {
          key: h.id,
          class: M(["mt-timeline__point", [`mt-timeline__point--${h.kind}`, { "is-selected": h.id === n.selectedId }]]),
          transform: `translate(${h.x},${j})`,
          onClick: (A) => e("select", h.id)
        }, [
          _[2] || (_[2] = f("circle", {
            r: "11",
            class: "mt-timeline__hit"
          }, null, -1)),
          h.kind === "summary" ? (l(), d("rect", et)) : (l(), d("circle", {
            key: 1,
            r: h.kind === "accepted" ? 7 : 4.5,
            class: "mt-timeline__dot"
          }, null, 8, tt)),
          f("title", null, $(h.label) + " — " + $(o(h.at)), 1)
        ], 10, Ze))), 128))
      ], 8, Qe)),
      v.value ? (l(), d("div", nt, [
        f("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: a.value <= 0,
          onClick: _[0] || (_[0] = (h) => y(-1))
        }, "‹", 8, st),
        f("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: a.value >= n.points.length - 1,
          onClick: _[1] || (_[1] = (h) => y(1))
        }, "›", 8, at),
        f("span", ot, [
          f("strong", null, $(v.value.label), 1),
          f("span", null, " · " + $(o(v.value.at)), 1),
          v.value.author ? (l(), d("span", lt, " · " + $(v.value.author.email), 1)) : T("", !0)
        ])
      ])) : T("", !0)
    ], 512));
  }
};
function ct(n, u) {
  const s = Ee(n ?? "", u ?? ""), e = [];
  for (const i of s) {
    const r = i.added ? "added" : i.removed ? "removed" : "context", c = i.value.split(`
`);
    c.length && c[c.length - 1] === "" && c.pop();
    for (const b of c) e.push({ type: r, text: b });
  }
  return e;
}
function ut(n) {
  let u = 0, s = 0;
  for (const e of n)
    e.type === "added" ? u += 1 : e.type === "removed" && (s += 1);
  return { added: u, removed: s };
}
const dt = { class: "mt-diff" }, mt = { class: "mt-diff__stats" }, vt = { class: "mt-diff__stat mt-diff__stat--added" }, ft = { class: "mt-diff__stat mt-diff__stat--removed" }, pt = {
  key: 0,
  class: "mt-library__status"
}, _t = {
  key: 1,
  class: "mt-diff__body"
}, gt = { class: "mt-diff__gutter" }, yt = { class: "mt-diff__text" }, kt = {
  __name: "DiffView",
  props: {
    oldText: { type: String, default: "" },
    newText: { type: String, default: "" }
  },
  setup(n) {
    const u = n, s = w(() => ct(u.oldText, u.newText)), e = w(() => ut(s.value)), i = w(() => e.value.added > 0 || e.value.removed > 0), r = (c) => c === "added" ? "+" : c === "removed" ? "−" : " ";
    return (c, b) => (l(), d("div", dt, [
      f("div", mt, [
        f("span", vt, "+" + $(e.value.added), 1),
        f("span", ft, "−" + $(e.value.removed), 1)
      ]),
      i.value ? (l(), d("pre", _t, [
        (l(!0), d(E, null, K(s.value, (m, a) => (l(), d("span", {
          key: a,
          class: M(["mt-diff__line", `mt-diff__line--${m.type}`])
        }, [
          f("span", gt, $(r(m.type)), 1),
          f("span", yt, $(m.text), 1),
          b[0] || (b[0] = we(`
`))
        ], 2))), 128))
      ])) : (l(), d("p", pt, "No changes from the accepted version."))
    ]));
  }
}, ht = { class: "mt-doc" }, bt = { class: "mt-doc__bar" }, wt = { class: "mt-doc__title" }, $t = {
  key: 0,
  class: "mt-doc__pending"
}, Ct = { class: "mt-doc__confirm" }, xt = ["disabled"], St = ["title"], At = ["disabled"], Mt = {
  key: 0,
  class: "mt-library__status"
}, Tt = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, Lt = {
  key: 0,
  class: "mt-doc__note"
}, qt = {
  __name: "DocumentView",
  props: { docId: { type: String, required: !0 } },
  emits: ["back"],
  setup(n, { emit: u }) {
    const s = $e(() => import("./MarkdownEditorVMd-CIGKbg-C.js")), e = n, i = u, { hooks: r, options: c } = oe(), b = w(
      () => c.editor === "tiptap" ? Ge : s
    ), m = C([]), a = C([]), v = C(!0), y = C(""), o = C("view"), p = C(""), _ = C(!1), h = C(""), A = C(null), L = C(!1), S = C(!1), W = w(() => m.value[m.value.length - 1] || null), F = w(() => a.value[a.value.length - 1] || null), D = w(() => {
      const t = [
        ...m.value.map((k) => ({
          id: k.id,
          kind: "accepted",
          at: k.acceptedAt,
          content: k.content,
          label: "Accepted",
          author: k.acceptedBy
        })),
        ...a.value.map((k) => ({
          id: k.id,
          kind: "pending",
          at: k.savedAt,
          content: k.content,
          label: `Pending #${k.seq}`,
          author: k.author
        }))
      ], g = F.value;
      return g && t.push({
        id: "all-changes",
        kind: "summary",
        at: g.savedAt,
        content: g.content,
        label: "All changes",
        author: g.author
      }), t;
    }), I = w(
      () => D.value.find((t) => t.id === A.value) || D.value[D.value.length - 1] || null
    ), H = w(() => {
      var t;
      return ((t = I.value) == null ? void 0 : t.content) ?? "";
    }), ie = w(() => {
      var k, x;
      const t = I.value;
      if (!t) return "";
      if (t.kind === "summary") return ((k = W.value) == null ? void 0 : k.content) ?? "";
      const g = D.value.findIndex((P) => P.id === t.id);
      return ((x = D.value[g - 1]) == null ? void 0 : x.content) ?? "";
    }), re = w(() => {
      var t;
      return le(((t = W.value) == null ? void 0 : t.content) || "") || e.docId;
    }), ce = w(() => r.can("edit", { id: e.docId })), ue = w(() => r.can("accept", { id: e.docId })), q = w(() => a.value.length), z = w(() => (e.docId || "document").replace(/\.md$/i, "")), J = w(() => {
      const t = I.value;
      if ((t == null ? void 0 : t.kind) === "summary") return `${z.value}.all-changes.md`;
      if ((t == null ? void 0 : t.kind) === "pending") {
        const g = String(t.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return `${z.value}.${g}.md`;
      }
      return `${z.value}.md`;
    });
    function de() {
      const t = new Blob([H.value ?? ""], { type: "text/markdown;charset=utf-8" }), g = URL.createObjectURL(t), k = document.createElement("a");
      k.href = g, k.download = J.value, document.body.appendChild(k), k.click(), k.remove(), URL.revokeObjectURL(g);
    }
    function Y() {
      var k;
      const t = D.value, g = t.find((x) => x.kind === "summary");
      A.value = ((k = g ?? t[t.length - 1]) == null ? void 0 : k.id) ?? null;
    }
    async function G() {
      v.value = !0, y.value = "", o.value = "view", h.value = "", L.value = !1, S.value = !1;
      try {
        const [t, g] = await Promise.all([
          r.listAcceptedStates(e.docId),
          r.listPendingChanges(e.docId)
        ]);
        m.value = t, a.value = g, Y();
      } catch (t) {
        y.value = (t == null ? void 0 : t.message) || String(t);
      } finally {
        v.value = !1;
      }
    }
    R(G), U(() => e.docId, G), U(A, () => {
      S.value = !1;
    });
    function me() {
      var t;
      p.value = ((t = I.value) == null ? void 0 : t.content) ?? "", h.value = "", L.value = !1, S.value = !1, o.value = "edit";
    }
    function ve() {
      o.value = "view";
    }
    async function fe() {
      _.value = !0, y.value = "";
      try {
        const t = await r.savePendingChange(e.docId, { content: p.value });
        a.value = await r.listPendingChanges(e.docId), Y(), h.value = `Saved pending change (seq ${t.seq}).`, o.value = "view";
      } catch (t) {
        y.value = (t == null ? void 0 : t.message) || String(t);
      } finally {
        _.value = !1;
      }
    }
    async function pe() {
      var k;
      const t = I.value;
      if (!t || t.kind !== "pending" && t.kind !== "summary") return;
      const g = t.kind === "summary" ? ((k = F.value) == null ? void 0 : k.id) ?? null : t.id;
      _.value = !0, y.value = "";
      try {
        const x = await r.acceptChanges(e.docId, { upToChangeId: g }), [P, N] = await Promise.all([
          r.listAcceptedStates(e.docId),
          r.listPendingChanges(e.docId)
        ]);
        m.value = P, a.value = N, A.value = x.id, h.value = "Accepted — new baseline established.", S.value = !1;
      } catch (x) {
        y.value = (x == null ? void 0 : x.message) || String(x);
      } finally {
        _.value = !1;
      }
    }
    return (t, g) => {
      var k, x, P, N;
      return l(), d("div", ht, [
        f("div", bt, [
          f("button", {
            type: "button",
            class: "mt-editor__btn",
            onClick: g[0] || (g[0] = (O) => i("back"))
          }, "← Library"),
          f("h2", wt, $(re.value), 1),
          g[6] || (g[6] = f("span", { class: "mt-doc__spacer" }, null, -1)),
          q.value ? (l(), d("span", $t, $(q.value) + " pending", 1)) : T("", !0),
          o.value === "view" ? (l(), d(E, { key: 1 }, [
            S.value ? (l(), d(E, { key: 0 }, [
              f("span", Ct, "Accept “" + $((k = I.value) == null ? void 0 : k.label) + "” as the new baseline?", 1),
              f("button", {
                type: "button",
                class: "mt-editor__btn",
                onClick: g[1] || (g[1] = (O) => S.value = !1)
              }, "Cancel"),
              f("button", {
                type: "button",
                class: "mt-editor__btn is-active",
                disabled: _.value,
                onClick: pe
              }, $(_.value ? "Accepting…" : "Confirm"), 9, xt)
            ], 64)) : (l(), d(E, { key: 1 }, [
              f("button", {
                type: "button",
                class: "mt-editor__btn",
                title: `Download ${J.value}`,
                onClick: de
              }, "Download", 8, St),
              q.value ? (l(), d("button", {
                key: 0,
                type: "button",
                class: M(["mt-editor__btn", { "is-active": L.value }]),
                onClick: g[2] || (g[2] = (O) => L.value = !L.value)
              }, $(L.value ? "Hide changes" : "Show changes"), 3)) : T("", !0),
              ue.value && (((x = I.value) == null ? void 0 : x.kind) === "pending" || ((P = I.value) == null ? void 0 : P.kind) === "summary") ? (l(), d("button", {
                key: 1,
                type: "button",
                class: "mt-editor__btn",
                onClick: g[3] || (g[3] = (O) => S.value = !0)
              }, "Accept")) : T("", !0),
              ce.value ? (l(), d("button", {
                key: 2,
                type: "button",
                class: "mt-editor__btn",
                onClick: me
              }, "Edit")) : T("", !0)
            ], 64))
          ], 64)) : (l(), d(E, { key: 2 }, [
            f("button", {
              type: "button",
              class: "mt-editor__btn",
              onClick: ve
            }, "Cancel"),
            f("button", {
              type: "button",
              class: "mt-editor__btn is-active",
              disabled: _.value,
              onClick: fe
            }, $(_.value ? "Saving…" : "Save"), 9, At)
          ], 64))
        ]),
        v.value ? (l(), d("p", Mt, "Loading…")) : y.value ? (l(), d("p", Tt, $(y.value), 1)) : (l(), d(E, { key: 2 }, [
          h.value ? (l(), d("p", Lt, $(h.value), 1)) : T("", !0),
          o.value === "view" ? (l(), d(E, { key: 1 }, [
            D.value.length > 1 ? (l(), B(rt, {
              key: 0,
              points: D.value,
              "selected-id": (N = I.value) == null ? void 0 : N.id,
              onSelect: g[4] || (g[4] = (O) => A.value = O)
            }, null, 8, ["points", "selected-id"])) : T("", !0),
            L.value ? (l(), B(kt, {
              key: 1,
              "old-text": ie.value,
              "new-text": H.value
            }, null, 8, ["old-text", "new-text"])) : (l(), B(Ke, {
              key: 2,
              content: H.value
            }, null, 8, ["content"]))
          ], 64)) : (l(), B(Ce(b.value), {
            key: 2,
            modelValue: p.value,
            "onUpdate:modelValue": g[5] || (g[5] = (O) => p.value = O)
          }, null, 8, ["modelValue"]))
        ], 64))
      ]);
    };
  }
}, te = Object.freeze([
  "getCurrentUser",
  "can",
  "listDocuments",
  "readAcceptedState",
  "listAcceptedStates",
  "listPendingChanges",
  "savePendingChange",
  "acceptChanges"
]);
function zt(n = {}) {
  const u = te.filter(
    (e) => typeof n[e] != "function"
  );
  if (u.length > 0)
    throw new Error(
      `createMarkdownTrack: missing required hook(s): ${u.join(", ")}`
    );
  const s = {};
  for (const e of te) s[e] = n[e];
  return Object.freeze({
    hooks: Object.freeze(s),
    options: Object.freeze({ ...n.options || {} })
  });
}
function jt(n = {}) {
  const u = n.user || { id: "dev", email: "dev@example.com", name: "Dev User" }, s = n.can || (() => !0), e = () => n.clock ? n.clock() : (/* @__PURE__ */ new Date()).toISOString(), i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
  let b = 0, m = 0;
  const a = (o) => `${o}-${++m}`, v = (o) => JSON.parse(JSON.stringify(o));
  for (const o of n.documents || [])
    i.set(o.id, { id: o.id, filename: o.filename }), r.set(o.id, [
      {
        id: a("acc"),
        docId: o.id,
        content: o.content ?? "",
        acceptedBy: u,
        acceptedAt: e(),
        ref: "seed"
      }
    ]), c.set(o.id, []);
  const y = (o) => {
    const p = r.get(o) || [];
    return p[p.length - 1];
  };
  return {
    getCurrentUser: () => v(u),
    can: (o, p) => s(o, p, u),
    listDocuments: async () => [...i.values()].map((o) => {
      var _;
      const p = ((_ = y(o.id)) == null ? void 0 : _.content) ?? "";
      return v({ ...o, title: le(p) ?? void 0 });
    }),
    readAcceptedState: async (o) => {
      const p = y(o);
      if (!p) throw new Error(`Unknown document: ${o}`);
      return v(p);
    },
    listAcceptedStates: async (o) => v(r.get(o) || []),
    listPendingChanges: async (o) => v(c.get(o) || []),
    savePendingChange: async (o, { content: p }) => {
      var h;
      if (!i.has(o)) throw new Error(`Unknown document: ${o}`);
      const _ = {
        id: a("pend"),
        docId: o,
        content: p,
        author: v(u),
        savedAt: e(),
        seq: ++b,
        baseRef: (h = y(o)) == null ? void 0 : h.ref
      };
      return c.get(o).push(_), v(_);
    },
    acceptChanges: async (o, p = {}) => {
      const _ = c.get(o) || [];
      if (_.length === 0) throw new Error("No pending changes to accept");
      let h = _[_.length - 1];
      p.upToChangeId && (h = _.find((S) => S.id === p.upToChangeId) || h);
      const A = {
        id: a("acc"),
        docId: o,
        content: h.content,
        acceptedBy: v(u),
        acceptedAt: e(),
        ref: `mem-${h.seq}`
      };
      r.get(o).push(A);
      const L = _.indexOf(h);
      return c.set(
        o,
        _.slice(L + 1).map((S) => ({ ...S, baseRef: A.ref }))
      ), v(A);
    }
  };
}
export {
  rt as ChangeTimeline,
  kt as DiffView,
  qt as DocumentView,
  Ge as MarkdownEditor,
  Ht as MarkdownLibrary,
  Ke as MarkdownRenderer,
  te as REQUIRED_HOOKS,
  jt as createInMemoryHooks,
  zt as createMarkdownTrack,
  le as extractTitle,
  Ut as provideMarkdownTrack,
  oe as useMarkdownTrack
};
