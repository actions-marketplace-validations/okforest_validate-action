import { n as __name } from "./chunk-Y2CYZVJY-BvXnHY42.js";
import { p as select_default } from "./src-DLQViUbH.js";
//#region node_modules/.pnpm/mermaid@12.1.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-XXDRQBXY.mjs
var getDiagramElement = /* @__PURE__ */ __name((id, securityLevel) => {
	let sandboxElement;
	if (securityLevel === "sandbox") sandboxElement = select_default("#i" + id);
	return (securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body")).select(`[id="${id}"]`);
}, "getDiagramElement");
//#endregion
export { getDiagramElement as t };
