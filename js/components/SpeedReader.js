import { createTemplate, tag } from "../utils/dom.js";
import defaultSettings from "../utils/defaultSettings.js";
import { ChunkText } from "./ChunkText.js";

const attrs = {
	isOpened: "data-is-opened",
	isPaused: "data-is-paused",
};
const cssVariables = {
	highlightColor: ChunkText.cssVariables.highlightColor,
	backgroundColor: "--speed-reader-background-color",
	textColor: "--speed-reader-text-color",
	fontSize: "--speed-reader--font-size",
	lineHeight: "--speed-reader--line-height",
	fontFamily: "--speed-reader--font-family",
	textAlign: "--speed-reader--text-align",
};
const template = createTemplate(`
<style>
	:host {
		${cssVariables.highlightColor} = ${defaultSettings.highlightColor};
		${cssVariables.backgroundColor} = ${defaultSettings.backgroundColor};
		${cssVariables.textColor} = ${defaultSettings.textColor};
		${cssVariables.fontSize} = ${defaultSettings.fontSize};
		${cssVariables.lineHeight} = ${defaultSettings.lineHeight};
		${cssVariables.fontFamily} = ${defaultSettings.fontFamily};
		${cssVariables.textAlign} = ${defaultSettings.textAlign};

		background-color: var(${cssVariables.backgroundColor});
		text-color: var(${cssVariables.textColor});
		font-size: var(${cssVariables.fontSize});
		line-height: var(${cssVariables.lineHeight});
		font-family: var(${cssVariables.fontFamily});
		text-align: var(${cssVariables.textAlign});
	}
</style>
<slot></slot>
`);

export class SpeedReader extends HTMLElement {

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.shadowRoot.appendChild(templateContent(template));
	}

	static get attrs() {
		return attrs;
	}

	static get cssVariables() {
		return cssVariables;
	}

}

/**
 * @returns {SpeedReader}
 */
export function buildSpeedReader() {
	return tag({
		tagName: "speed-reader",
	});
}

customElements.define("speed-reader", SpeedReader);
