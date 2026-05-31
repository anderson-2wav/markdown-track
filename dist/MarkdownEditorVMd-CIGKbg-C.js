import { createBlock as m, openBlock as u, unref as i } from "vue";
import d from "@kangc/v-md-editor";
import "@kangc/v-md-editor/lib/style/base-editor.css";
import n from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";
import p from "highlight.js";
const s = (e, r) => {
  const o = e.__vccOpts || e;
  for (const [l, t] of r)
    o[l] = t;
  return o;
}, c = {
  __name: "MarkdownEditorVMd",
  props: { modelValue: { type: String, default: "" } },
  emits: ["update:modelValue"],
  setup(e, { emit: r }) {
    d.use(n, { Hljs: p });
    const o = r;
    return (l, t) => (u(), m(i(d), {
      class: "mt-vmd",
      "model-value": e.modelValue,
      "onUpdate:modelValue": t[0] || (t[0] = (a) => o("update:modelValue", a)),
      height: "440px",
      "left-toolbar": "undo redo clear | h bold italic strikethrough | ul ol table hr | link code | preview"
    }, null, 8, ["model-value"]));
  }
}, g = /* @__PURE__ */ s(c, [["__scopeId", "data-v-d3e15a6d"]]);
export {
  g as default
};
