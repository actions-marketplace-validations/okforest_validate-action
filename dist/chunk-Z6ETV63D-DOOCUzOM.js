import { n as __name } from "./chunk-Y2CYZVJY-BvXnHY42.js";
import { p as select_default } from "./src-DLQViUbH.js";
import { b as getConfig2 } from "./chunk-VPRB5NB3-CtrWo5U6.js";
//#region node_modules/.pnpm/mermaid@12.1.0/node_modules/mermaid/dist/chunks/mermaid.core/chunk-Z6ETV63D.mjs
var selectSvgElement = /* @__PURE__ */ __name((id) => {
	const { securityLevel } = getConfig2();
	let root = select_default("body");
	if (securityLevel === "sandbox") {
		const doc = select_default(`#i${id}`).node()?.contentDocument ?? document;
		root = select_default(doc.body);
	}
	return root.select(`#${id}`);
}, "selectSvgElement");
//#endregion
export { selectSvgElement as t };
