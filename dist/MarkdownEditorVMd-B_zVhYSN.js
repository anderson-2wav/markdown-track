import { openBlock as m, createElementBlock as i, Fragment as u, createElementVNode as d, createTextVNode as a, createVNode as p, unref as c } from "vue";
import n from "@kangc/v-md-editor";
import "@kangc/v-md-editor/lib/style/base-editor.css";
import f from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";
import V from "highlight.js";
const h = (t, r) => {
  const o = t.__vccOpts || t;
  for (const [l, e] of r)
    o[l] = e;
  return o;
}, _ = {
  __name: "MarkdownEditorVMd",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(t, { emit: r }) {
    n.use(f, { Hljs: V });
    const o = r;
    return (l, e) => (m(), i(u, null, [
      e[1] || (e[1] = d("span", null, [
        a("Please use the full-screen option for the best user experience. See "),
        d("span", { style: { display: "inline", border: "2px solid red" } }, "  "),
        a(".")
      ], -1)),
      p(c(n), {
        class: "mt-vmd",
        "model-value": t.modelValue,
        "onUpdate:modelValue": e[0] || (e[0] = (s) => o("update:modelValue", s)),
        height: "440px",
        "left-toolbar": "undo redo clear | h bold italic strikethrough | ul ol table hr | link code | preview"
      }, null, 8, ["model-value"])
    ], 64));
  }
}, M = /* @__PURE__ */ h(_, [["__scopeId", "data-v-3903dd61"]]);
export {
  M as default
};
