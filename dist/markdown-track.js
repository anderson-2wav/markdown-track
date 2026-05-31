import { provide as ve, inject as fe, ref as $, onMounted as B, createElementBlock as d, openBlock as l, createElementVNode as f, toDisplayString as w, Fragment as E, renderList as z, createCommentVNode as T, watch as R, nextTick as pe, shallowRef as _e, onBeforeUnmount as ee, withDirectives as Y, normalizeClass as M, createVNode as ge, unref as ye, vShow as G, computed as C, createTextVNode as ke, defineAsyncComponent as he, createBlock as N, resolveDynamicComponent as be } from "vue";
import { marked as te } from "marked";
import { gfmHeadingId as we } from "marked-gfm-heading-id";
import { Editor as $e, EditorContent as Ce } from "@tiptap/vue-3";
import xe from "@tiptap/starter-kit";
import Se from "@tiptap/extension-link";
import { Markdown as Ae } from "tiptap-markdown";
import { scalePoint as Me } from "d3-scale";
import { diffLines as Te } from "diff";
const ne = Symbol("markdown-track");
function Ot(t) {
  return ve(ne, t), t;
}
function se() {
  const t = fe(ne, null);
  if (!t)
    throw new Error(
      "useMarkdownTrack(): no markdown-track provider found. Call provideMarkdownTrack(createMarkdownTrack(...)) in a parent component."
    );
  return t;
}
const Ie = { class: "mt-library" }, Ee = {
  key: 0,
  class: "mt-library__status"
}, Le = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, De = {
  key: 2,
  class: "mt-library__status"
}, Ve = {
  key: 3,
  class: "mt-library__list"
}, Pe = ["onClick"], Oe = { class: "mt-library__title" }, Be = {
  key: 0,
  class: "mt-library__filename"
}, Bt = {
  __name: "MarkdownLibrary",
  emits: ["select"],
  setup(t, { emit: u }) {
    const n = u, { hooks: e } = se(), i = $([]), r = $(!0), c = $("");
    B(async () => {
      try {
        const m = await e.listDocuments();
        i.value = m.filter((s) => e.can("view", s));
      } catch (m) {
        c.value = (m == null ? void 0 : m.message) || String(m);
      } finally {
        r.value = !1;
      }
    });
    const h = (m) => m.title || m.filename;
    return (m, s) => (l(), d("div", Ie, [
      s[0] || (s[0] = f("h2", { class: "mt-library__heading" }, "Documents", -1)),
      r.value ? (l(), d("p", Ee, "Loading…")) : c.value ? (l(), d("p", Le, w(c.value), 1)) : i.value.length ? (l(), d("ul", Ve, [
        (l(!0), d(E, null, z(i.value, (v) => (l(), d("li", {
          key: v.id,
          class: "mt-library__item"
        }, [
          f("button", {
            type: "button",
            class: "mt-library__link",
            onClick: (g) => n("select", v.id)
          }, [
            f("span", Oe, w(h(v)), 1),
            v.title && v.title !== v.filename ? (l(), d("span", Be, w(v.filename), 1)) : T("", !0)
          ], 8, Pe)
        ]))), 128))
      ])) : (l(), d("p", De, "No documents available."))
    ]));
  }
};
function ae(t) {
  if (typeof t != "string") return null;
  const u = [];
  let n = null;
  for (const e of t.split(`
`)) {
    const i = e.replace(/\r$/, ""), r = i.match(/^\s*(`{3,}|~{3,})/);
    if (r) {
      const h = r[1][0];
      n === null ? n = h : n === h && (n = null);
      continue;
    }
    if (n !== null) continue;
    const c = i.match(/^#\s+(.+?)\s*#*\s*$/);
    c && c[1].trim() && u.push(c[1].trim());
  }
  return u.length === 1 ? u[0] : null;
}
te.use(we());
function He(t) {
  return typeof t != "string" || t.length === 0 ? "" : te.parse(t, { gfm: !0, breaks: !1 });
}
let Q = !1;
function Ne(t) {
  return typeof t == "string" && /(^|\n)\s*```mermaid\b/.test(t);
}
async function Re(t) {
  if (!t) return;
  const u = t.querySelectorAll("pre code.language-mermaid");
  if (!u.length) return;
  let n;
  try {
    n = (await import("mermaid")).default;
  } catch (e) {
    console.warn("markdown-track: 'mermaid' is not installed; leaving diagrams as code.", e);
    return;
  }
  Q || (n.initialize({ startOnLoad: !1, securityLevel: "strict" }), Q = !0);
  for (const e of u) {
    const i = e.closest("pre");
    if (!i) continue;
    const r = document.createElement("div");
    r.className = "mermaid", r.textContent = e.textContent, i.replaceWith(r);
  }
  try {
    await n.run({ nodes: t.querySelectorAll(".mermaid") });
  } catch (e) {
    console.warn("markdown-track: mermaid render error", e);
  }
}
const qe = ["innerHTML"], Ue = {
  __name: "MarkdownRenderer",
  props: { content: { type: String, default: "" } },
  setup(t) {
    const u = t, n = $(null), e = $("");
    async function i() {
      e.value = He(u.content), await pe(), n.value && Ne(u.content) && await Re(n.value);
    }
    return B(i), R(() => u.content, i), (r, c) => (l(), d("div", {
      ref_key: "root",
      ref: n,
      class: "mt-markdown",
      innerHTML: e.value
    }, null, 8, qe));
  }
};
function ze() {
  return [
    xe,
    Se.configure({ openOnClick: !1 }),
    Ae.configure({
      html: !1,
      tightLists: !0,
      breaks: !1,
      transformPastedText: !0,
      transformCopiedText: !0
    })
  ];
}
function X(t) {
  var u, n, e;
  return ((e = (n = (u = t == null ? void 0 : t.storage) == null ? void 0 : u.markdown) == null ? void 0 : n.getMarkdown) == null ? void 0 : e.call(n)) ?? "";
}
const je = { class: "mt-editor" }, Ke = {
  key: 0,
  class: "mt-editor__toolbar"
}, We = ["value"], Fe = {
  __name: "MarkdownEditor",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(t, { emit: u }) {
    const n = t, e = u, i = _e(null), r = $(!1);
    B(() => {
      i.value = new $e({
        extensions: ze(),
        content: n.modelValue,
        // tiptap-markdown parses the markdown string
        onUpdate: ({ editor: m }) => e("update:modelValue", X(m))
      });
    }), ee(() => {
      var m;
      return (m = i.value) == null ? void 0 : m.destroy();
    }), R(
      () => n.modelValue,
      (m) => {
        i.value && m !== X(i.value) && i.value.commands.setContent(m, !1);
      }
    );
    const c = (m) => i.value && m(i.value.chain().focus()), h = (m, s) => {
      var v;
      return ((v = i.value) == null ? void 0 : v.isActive(m, s)) ?? !1;
    };
    return (m, s) => (l(), d("div", je, [
      i.value ? (l(), d("div", Ke, [
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("heading", { level: 1 }) }]),
          onClick: s[0] || (s[0] = (v) => c((g) => g.toggleHeading({ level: 1 }).run()))
        }, "H1", 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("heading", { level: 2 }) }]),
          onClick: s[1] || (s[1] = (v) => c((g) => g.toggleHeading({ level: 2 }).run()))
        }, "H2", 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("bold") }]),
          onClick: s[2] || (s[2] = (v) => c((g) => g.toggleBold().run()))
        }, s[7] || (s[7] = [
          f("b", null, "B", -1)
        ]), 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("italic") }]),
          onClick: s[3] || (s[3] = (v) => c((g) => g.toggleItalic().run()))
        }, s[8] || (s[8] = [
          f("i", null, "I", -1)
        ]), 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("bulletList") }]),
          onClick: s[4] || (s[4] = (v) => c((g) => g.toggleBulletList().run()))
        }, "• List", 2),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": h("codeBlock") }]),
          onClick: s[5] || (s[5] = (v) => c((g) => g.toggleCodeBlock().run()))
        }, "Code", 2),
        s[9] || (s[9] = f("span", { class: "mt-editor__spacer" }, null, -1)),
        f("button", {
          type: "button",
          class: M(["mt-editor__btn", { "is-active": r.value }]),
          onClick: s[6] || (s[6] = (v) => r.value = !r.value)
        }, "Source", 2)
      ])) : T("", !0),
      Y(ge(ye(Ce), {
        editor: i.value,
        class: "mt-editor__content"
      }, null, 8, ["editor"]), [
        [G, !r.value]
      ]),
      Y(f("textarea", {
        class: "mt-editor__source",
        value: t.modelValue,
        readonly: "",
        spellcheck: "false"
      }, null, 8, We), [
        [G, r.value]
      ])
    ]));
  }
}, Je = ["width"], Ye = ["x2"], Ge = ["transform", "onClick"], Qe = {
  key: 0,
  class: "mt-timeline__dot",
  x: "-6.5",
  y: "-6.5",
  width: "13",
  height: "13",
  transform: "rotate(45)"
}, Xe = ["r"], Ze = {
  key: 0,
  class: "mt-timeline__caption"
}, et = ["disabled"], tt = ["disabled"], nt = { class: "mt-timeline__label" }, st = { key: 0 }, P = 24, at = 44, U = 22, ot = {
  __name: "ChangeTimeline",
  props: {
    // [{ id, kind: 'accepted'|'pending', at, label, author? }]
    points: { type: Array, default: () => [] },
    selectedId: { type: String, default: null }
  },
  emits: ["select"],
  setup(t, { emit: u }) {
    const n = t, e = u, i = $(null), r = $(600);
    let c = null;
    B(() => {
      i.value && (r.value = i.value.clientWidth || 600, c = new ResizeObserver(() => {
        r.value = i.value.clientWidth || 600;
      }), c.observe(i.value));
    }), ee(() => c == null ? void 0 : c.disconnect());
    const h = C(
      () => Me().domain(n.points.map((p) => p.id)).range([P, Math.max(P + 1, r.value - P)]).padding(0.5)
    ), m = C(
      () => n.points.map((p) => ({ ...p, x: h.value(p.id) ?? P }))
    ), s = C(() => n.points.findIndex((p) => p.id === n.selectedId)), v = C(() => n.points[s.value] || null);
    function g(p) {
      const _ = s.value + p;
      _ >= 0 && _ < n.points.length && e("select", n.points[_].id);
    }
    const a = (p) => {
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
        height: at,
        class: "mt-timeline__svg",
        role: "group",
        "aria-label": "Change timeline"
      }, [
        f("line", {
          class: "mt-timeline__track",
          x1: P,
          y1: U,
          x2: Math.max(P, r.value - P),
          y2: U
        }, null, 8, Ye),
        (l(!0), d(E, null, z(m.value, (y) => (l(), d("g", {
          key: y.id,
          class: M(["mt-timeline__point", [`mt-timeline__point--${y.kind}`, { "is-selected": y.id === t.selectedId }]]),
          transform: `translate(${y.x},${U})`,
          onClick: (A) => e("select", y.id)
        }, [
          _[2] || (_[2] = f("circle", {
            r: "11",
            class: "mt-timeline__hit"
          }, null, -1)),
          y.kind === "summary" ? (l(), d("rect", Qe)) : (l(), d("circle", {
            key: 1,
            r: y.kind === "accepted" ? 7 : 4.5,
            class: "mt-timeline__dot"
          }, null, 8, Xe)),
          f("title", null, w(y.label) + " — " + w(a(y.at)), 1)
        ], 10, Ge))), 128))
      ], 8, Je)),
      v.value ? (l(), d("div", Ze, [
        f("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: s.value <= 0,
          onClick: _[0] || (_[0] = (y) => g(-1))
        }, "‹", 8, et),
        f("button", {
          type: "button",
          class: "mt-editor__btn",
          disabled: s.value >= t.points.length - 1,
          onClick: _[1] || (_[1] = (y) => g(1))
        }, "›", 8, tt),
        f("span", nt, [
          f("strong", null, w(v.value.label), 1),
          f("span", null, " · " + w(a(v.value.at)), 1),
          v.value.author ? (l(), d("span", st, " · " + w(v.value.author.email), 1)) : T("", !0)
        ])
      ])) : T("", !0)
    ], 512));
  }
};
function lt(t, u) {
  const n = Te(t ?? "", u ?? ""), e = [];
  for (const i of n) {
    const r = i.added ? "added" : i.removed ? "removed" : "context", c = i.value.split(`
`);
    c.length && c[c.length - 1] === "" && c.pop();
    for (const h of c) e.push({ type: r, text: h });
  }
  return e;
}
function it(t) {
  let u = 0, n = 0;
  for (const e of t)
    e.type === "added" ? u += 1 : e.type === "removed" && (n += 1);
  return { added: u, removed: n };
}
const rt = { class: "mt-diff" }, ct = { class: "mt-diff__stats" }, ut = { class: "mt-diff__stat mt-diff__stat--added" }, dt = { class: "mt-diff__stat mt-diff__stat--removed" }, mt = {
  key: 0,
  class: "mt-library__status"
}, vt = {
  key: 1,
  class: "mt-diff__body"
}, ft = { class: "mt-diff__gutter" }, pt = { class: "mt-diff__text" }, _t = {
  __name: "DiffView",
  props: {
    oldText: { type: String, default: "" },
    newText: { type: String, default: "" }
  },
  setup(t) {
    const u = t, n = C(() => lt(u.oldText, u.newText)), e = C(() => it(n.value)), i = C(() => e.value.added > 0 || e.value.removed > 0), r = (c) => c === "added" ? "+" : c === "removed" ? "−" : " ";
    return (c, h) => (l(), d("div", rt, [
      f("div", ct, [
        f("span", ut, "+" + w(e.value.added), 1),
        f("span", dt, "−" + w(e.value.removed), 1)
      ]),
      i.value ? (l(), d("pre", vt, [
        (l(!0), d(E, null, z(n.value, (m, s) => (l(), d("span", {
          key: s,
          class: M(["mt-diff__line", `mt-diff__line--${m.type}`])
        }, [
          f("span", ft, w(r(m.type)), 1),
          f("span", pt, w(m.text), 1),
          h[0] || (h[0] = ke(`
`))
        ], 2))), 128))
      ])) : (l(), d("p", mt, "No changes from the accepted version."))
    ]));
  }
}, gt = { class: "mt-doc" }, yt = { class: "mt-doc__bar" }, kt = { class: "mt-doc__title" }, ht = {
  key: 0,
  class: "mt-doc__pending"
}, bt = { class: "mt-doc__confirm" }, wt = ["disabled"], $t = ["disabled"], Ct = {
  key: 0,
  class: "mt-library__status"
}, xt = {
  key: 1,
  class: "mt-library__status mt-library__status--error"
}, St = {
  key: 0,
  class: "mt-doc__note"
}, Ht = {
  __name: "DocumentView",
  props: { docId: { type: String, required: !0 } },
  emits: ["back"],
  setup(t, { emit: u }) {
    const n = he(() => import("./MarkdownEditorVMd-CIGKbg-C.js")), e = t, i = u, { hooks: r, options: c } = se(), h = C(
      () => c.editor === "tiptap" ? Fe : n
    ), m = $([]), s = $([]), v = $(!0), g = $(""), a = $("view"), p = $(""), _ = $(!1), y = $(""), A = $(null), I = $(!1), S = $(!1), j = C(() => m.value[m.value.length - 1] || null), K = C(() => s.value[s.value.length - 1] || null), L = C(() => {
      const o = [
        ...m.value.map((b) => ({
          id: b.id,
          kind: "accepted",
          at: b.acceptedAt,
          content: b.content,
          label: "Accepted",
          author: b.acceptedBy
        })),
        ...s.value.map((b) => ({
          id: b.id,
          kind: "pending",
          at: b.savedAt,
          content: b.content,
          label: `Pending #${b.seq}`,
          author: b.author
        }))
      ], k = K.value;
      return k && o.push({
        id: "all-changes",
        kind: "summary",
        at: k.savedAt,
        content: k.content,
        label: "All changes",
        author: k.author
      }), o;
    }), D = C(
      () => L.value.find((o) => o.id === A.value) || L.value[L.value.length - 1] || null
    ), W = C(() => {
      var o;
      return ((o = D.value) == null ? void 0 : o.content) ?? "";
    }), oe = C(() => {
      var b, x;
      const o = D.value;
      if (!o) return "";
      if (o.kind === "summary") return ((b = j.value) == null ? void 0 : b.content) ?? "";
      const k = L.value.findIndex((O) => O.id === o.id);
      return ((x = L.value[k - 1]) == null ? void 0 : x.content) ?? "";
    }), le = C(() => {
      var o;
      return ae(((o = j.value) == null ? void 0 : o.content) || "") || e.docId;
    }), ie = C(() => r.can("edit", { id: e.docId })), re = C(() => r.can("accept", { id: e.docId })), q = C(() => s.value.length);
    function F() {
      var b;
      const o = L.value, k = o.find((x) => x.kind === "summary");
      A.value = ((b = k ?? o[o.length - 1]) == null ? void 0 : b.id) ?? null;
    }
    async function J() {
      v.value = !0, g.value = "", a.value = "view", y.value = "", I.value = !1, S.value = !1;
      try {
        const [o, k] = await Promise.all([
          r.listAcceptedStates(e.docId),
          r.listPendingChanges(e.docId)
        ]);
        m.value = o, s.value = k, F();
      } catch (o) {
        g.value = (o == null ? void 0 : o.message) || String(o);
      } finally {
        v.value = !1;
      }
    }
    B(J), R(() => e.docId, J), R(A, () => {
      S.value = !1;
    });
    function ce() {
      var o;
      p.value = ((o = D.value) == null ? void 0 : o.content) ?? "", y.value = "", I.value = !1, S.value = !1, a.value = "edit";
    }
    function ue() {
      a.value = "view";
    }
    async function de() {
      _.value = !0, g.value = "";
      try {
        const o = await r.savePendingChange(e.docId, { content: p.value });
        s.value = await r.listPendingChanges(e.docId), F(), y.value = `Saved pending change (seq ${o.seq}).`, a.value = "view";
      } catch (o) {
        g.value = (o == null ? void 0 : o.message) || String(o);
      } finally {
        _.value = !1;
      }
    }
    async function me() {
      var b;
      const o = D.value;
      if (!o || o.kind !== "pending" && o.kind !== "summary") return;
      const k = o.kind === "summary" ? ((b = K.value) == null ? void 0 : b.id) ?? null : o.id;
      _.value = !0, g.value = "";
      try {
        const x = await r.acceptChanges(e.docId, { upToChangeId: k }), [O, H] = await Promise.all([
          r.listAcceptedStates(e.docId),
          r.listPendingChanges(e.docId)
        ]);
        m.value = O, s.value = H, A.value = x.id, y.value = "Accepted — new baseline established.", S.value = !1;
      } catch (x) {
        g.value = (x == null ? void 0 : x.message) || String(x);
      } finally {
        _.value = !1;
      }
    }
    return (o, k) => {
      var b, x, O, H;
      return l(), d("div", gt, [
        f("div", yt, [
          f("button", {
            type: "button",
            class: "mt-editor__btn",
            onClick: k[0] || (k[0] = (V) => i("back"))
          }, "← Library"),
          f("h2", kt, w(le.value), 1),
          k[6] || (k[6] = f("span", { class: "mt-doc__spacer" }, null, -1)),
          q.value ? (l(), d("span", ht, w(q.value) + " pending", 1)) : T("", !0),
          a.value === "view" ? (l(), d(E, { key: 1 }, [
            S.value ? (l(), d(E, { key: 0 }, [
              f("span", bt, "Accept “" + w((b = D.value) == null ? void 0 : b.label) + "” as the new baseline?", 1),
              f("button", {
                type: "button",
                class: "mt-editor__btn",
                onClick: k[1] || (k[1] = (V) => S.value = !1)
              }, "Cancel"),
              f("button", {
                type: "button",
                class: "mt-editor__btn is-active",
                disabled: _.value,
                onClick: me
              }, w(_.value ? "Accepting…" : "Confirm"), 9, wt)
            ], 64)) : (l(), d(E, { key: 1 }, [
              q.value ? (l(), d("button", {
                key: 0,
                type: "button",
                class: M(["mt-editor__btn", { "is-active": I.value }]),
                onClick: k[2] || (k[2] = (V) => I.value = !I.value)
              }, w(I.value ? "Hide changes" : "Show changes"), 3)) : T("", !0),
              re.value && (((x = D.value) == null ? void 0 : x.kind) === "pending" || ((O = D.value) == null ? void 0 : O.kind) === "summary") ? (l(), d("button", {
                key: 1,
                type: "button",
                class: "mt-editor__btn",
                onClick: k[3] || (k[3] = (V) => S.value = !0)
              }, "Accept")) : T("", !0),
              ie.value ? (l(), d("button", {
                key: 2,
                type: "button",
                class: "mt-editor__btn",
                onClick: ce
              }, "Edit")) : T("", !0)
            ], 64))
          ], 64)) : (l(), d(E, { key: 2 }, [
            f("button", {
              type: "button",
              class: "mt-editor__btn",
              onClick: ue
            }, "Cancel"),
            f("button", {
              type: "button",
              class: "mt-editor__btn is-active",
              disabled: _.value,
              onClick: de
            }, w(_.value ? "Saving…" : "Save"), 9, $t)
          ], 64))
        ]),
        v.value ? (l(), d("p", Ct, "Loading…")) : g.value ? (l(), d("p", xt, w(g.value), 1)) : (l(), d(E, { key: 2 }, [
          y.value ? (l(), d("p", St, w(y.value), 1)) : T("", !0),
          a.value === "view" ? (l(), d(E, { key: 1 }, [
            L.value.length > 1 ? (l(), N(ot, {
              key: 0,
              points: L.value,
              "selected-id": (H = D.value) == null ? void 0 : H.id,
              onSelect: k[4] || (k[4] = (V) => A.value = V)
            }, null, 8, ["points", "selected-id"])) : T("", !0),
            I.value ? (l(), N(_t, {
              key: 1,
              "old-text": oe.value,
              "new-text": W.value
            }, null, 8, ["old-text", "new-text"])) : (l(), N(Ue, {
              key: 2,
              content: W.value
            }, null, 8, ["content"]))
          ], 64)) : (l(), N(be(h.value), {
            key: 2,
            modelValue: p.value,
            "onUpdate:modelValue": k[5] || (k[5] = (V) => p.value = V)
          }, null, 8, ["modelValue"]))
        ], 64))
      ]);
    };
  }
}, Z = Object.freeze([
  "getCurrentUser",
  "can",
  "listDocuments",
  "readAcceptedState",
  "listAcceptedStates",
  "listPendingChanges",
  "savePendingChange",
  "acceptChanges"
]);
function Nt(t = {}) {
  const u = Z.filter(
    (e) => typeof t[e] != "function"
  );
  if (u.length > 0)
    throw new Error(
      `createMarkdownTrack: missing required hook(s): ${u.join(", ")}`
    );
  const n = {};
  for (const e of Z) n[e] = t[e];
  return Object.freeze({
    hooks: Object.freeze(n),
    options: Object.freeze({ ...t.options || {} })
  });
}
function Rt(t = {}) {
  const u = t.user || { id: "dev", email: "dev@example.com", name: "Dev User" }, n = t.can || (() => !0), e = () => t.clock ? t.clock() : (/* @__PURE__ */ new Date()).toISOString(), i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
  let h = 0, m = 0;
  const s = (a) => `${a}-${++m}`, v = (a) => JSON.parse(JSON.stringify(a));
  for (const a of t.documents || [])
    i.set(a.id, { id: a.id, filename: a.filename }), r.set(a.id, [
      {
        id: s("acc"),
        docId: a.id,
        content: a.content ?? "",
        acceptedBy: u,
        acceptedAt: e(),
        ref: "seed"
      }
    ]), c.set(a.id, []);
  const g = (a) => {
    const p = r.get(a) || [];
    return p[p.length - 1];
  };
  return {
    getCurrentUser: () => v(u),
    can: (a, p) => n(a, p, u),
    listDocuments: async () => [...i.values()].map((a) => {
      var _;
      const p = ((_ = g(a.id)) == null ? void 0 : _.content) ?? "";
      return v({ ...a, title: ae(p) ?? void 0 });
    }),
    readAcceptedState: async (a) => {
      const p = g(a);
      if (!p) throw new Error(`Unknown document: ${a}`);
      return v(p);
    },
    listAcceptedStates: async (a) => v(r.get(a) || []),
    listPendingChanges: async (a) => v(c.get(a) || []),
    savePendingChange: async (a, { content: p }) => {
      var y;
      if (!i.has(a)) throw new Error(`Unknown document: ${a}`);
      const _ = {
        id: s("pend"),
        docId: a,
        content: p,
        author: v(u),
        savedAt: e(),
        seq: ++h,
        baseRef: (y = g(a)) == null ? void 0 : y.ref
      };
      return c.get(a).push(_), v(_);
    },
    acceptChanges: async (a, p = {}) => {
      const _ = c.get(a) || [];
      if (_.length === 0) throw new Error("No pending changes to accept");
      let y = _[_.length - 1];
      p.upToChangeId && (y = _.find((S) => S.id === p.upToChangeId) || y);
      const A = {
        id: s("acc"),
        docId: a,
        content: y.content,
        acceptedBy: v(u),
        acceptedAt: e(),
        ref: `mem-${y.seq}`
      };
      r.get(a).push(A);
      const I = _.indexOf(y);
      return c.set(
        a,
        _.slice(I + 1).map((S) => ({ ...S, baseRef: A.ref }))
      ), v(A);
    }
  };
}
export {
  ot as ChangeTimeline,
  _t as DiffView,
  Ht as DocumentView,
  Fe as MarkdownEditor,
  Bt as MarkdownLibrary,
  Ue as MarkdownRenderer,
  Z as REQUIRED_HOOKS,
  Rt as createInMemoryHooks,
  Nt as createMarkdownTrack,
  ae as extractTitle,
  Ot as provideMarkdownTrack,
  se as useMarkdownTrack
};
