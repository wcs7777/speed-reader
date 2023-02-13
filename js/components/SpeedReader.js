import {
	separateChunks,
	splitParagraphs,
	splitWords
} from "../utils/alphanumeric.js";
import BoundedList from "../utils/BoundedList.js";
import defaultSettings from "../utils/defaultSettings.js";
import { byId, createTemplate, tag, templateContent } from "../utils/dom.js";
import { buildChunkText } from "./ChunkText.js";
import { buildParagraphSpeedReader } from "./ParagraphSpeedReader.js";

const averageWordSize = 5.7;
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
		this.paragraphsId = "paragraphs";
		this.charactersPerSeconds = 1;
		this.chunkLength = averageWordSize;
		this._paragraphs = new BoundedList();
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
			this.style.setProperty(property, this.settings[key]);
		}
		this.charactersPerSecond = (
			this.settings.wordsPerMinute / 60 * averageWordSize
		);
		this.chunkLength = this.settings.wordsPerChunk * averageWordSize;
	}

	get paragraphs() {
		return this._paragraphs;
	}

	set paragraphs(newParagraphs) {
		this._paragraphs.list = newParagraphs;
		byId(this.paragraphsId)?.remove();
		this.appendChild(
			tag({
				tagName: "div",
				id: this.paragraphsId,
				children: newParagraphs,
			}),
		);
	}

	get text() {
		return this._text;
	}

	set text(newText) {
		this._text = newText;
		this.paragraphs = splitParagraphs(this.text)
			.map((paragraph) => {
				return buildParagraphSpeedReader(
					separateChunks(splitWords(paragraph), this.chunkLength)
						.map((chunk) => {
							return buildChunkText(chunk.join(" "), false);
						}),
				);
			});
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
