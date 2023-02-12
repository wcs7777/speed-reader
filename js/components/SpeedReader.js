import { createTemplate, tag, templateContent } from "../utils/dom.js";
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
	fontSize: "--speed-reader-font-size",
	lineHeight: "--speed-reader-line-height",
	fontFamily: "--speed-reader-font-family",
	textAlign: "--speed-reader-text-align",
};
const template = createTemplate(`
<style>
	:host {
		${cssVariables.highlightColor}: ${defaultSettings.highlightColor};
		${cssVariables.backgroundColor}: ${defaultSettings.backgroundColor};
		${cssVariables.textColor}: ${defaultSettings.textColor};
		${cssVariables.fontSize}: ${defaultSettings.fontSize};
		${cssVariables.lineHeight}: ${defaultSettings.lineHeight};
		${cssVariables.fontFamily}: ${defaultSettings.fontFamily};
		${cssVariables.textAlign}: ${defaultSettings.textAlign};

		background-color: var(${cssVariables.backgroundColor});
		color: var(${cssVariables.textColor});
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
		this._settings = defaultSettings;
		this._text = this.textContent.trim?.() || "";
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

	get settings() {
		return this._settings;
	}

	set settings(newSettings) {
		this._settings = newSettings;
		for (const [ key, property ] of Object.entries(cssVariables)) {
			this.style.setProperty(property, newSettings[key]);
		}
	}

	get text() {
		return this._text;
	}

	set text(newText) {
		this._text = newText;
	}

}

/**
 * @returns {SpeedReader}
 */
export function buildSpeedReader(text, settings=defaultSettings) {
	const speedReader = tag({
		tagName: "speed-reader",
	});
	speedReader.settings = settings;
	speedReader.text = text;
}

customElements.define("speed-reader", SpeedReader);
