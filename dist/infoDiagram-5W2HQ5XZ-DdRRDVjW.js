import { n as __name } from "./chunk-Y2CYZVJY-BvXnHY42.js";
import { m as log } from "./src-DLQViUbH.js";
import { c as configureSvgSize } from "./chunk-VPRB5NB3-CtrWo5U6.js";
import { t as selectSvgElement } from "./chunk-Z6ETV63D-DOOCUzOM.js";
import { n as parse } from "./mermaid-parser.core-BoKeG9d6.js";
//#region node_modules/.pnpm/mermaid@12.1.0/node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-5W2HQ5XZ.mjs
var parser = { parse: /* @__PURE__ */ __name(async (input) => {
	const ast = await parse("info", input);
	log.debug(ast);
}, "parse") };
var DEFAULT_INFO_DB = { version: "12.1.0" };
var diagram = {
	parser,
	db: { getVersion: /* @__PURE__ */ __name(() => DEFAULT_INFO_DB.version, "getVersion") },
	renderer: { draw: /* @__PURE__ */ __name((text, id, version) => {
		log.debug("rendering info diagram\n" + text);
		const svg = selectSvgElement(id);
		configureSvgSize(svg, 100, 400, true);
		svg.append("g").append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
	}, "draw") }
};
//#endregion
export { diagram };
