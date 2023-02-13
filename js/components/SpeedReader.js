import {
	chunkMilliseconds,
	separateChunks,
	splitParagraphs,
	splitWords
} from "../utils/alphanumeric.js";
import BoundedList from "../utils/BoundedList.js";
import defaultSettings from "../utils/defaultSettings.js";
import { createTemplate, tag, templateContent } from "../utils/dom.js";
import { boolEqualsLoose, sleep } from "../utils/mixed.js";
import { buildChunkText, ChunkText } from "./ChunkText.js";
import {
	buildParagraphSpeedReader,
	ParagraphSpeedReader
} from "./ParagraphSpeedReader.js";

const averageWordSize = 5.7;
const paragraphMargin = 10;
const attrs = {
	isPaused: "data-is-paused",
	currentParagraphIndex: "data-current-paragraph-index",
};
const cssVariables = {
	highlightBackgroundColor: ChunkText.cssVariables.highlightBackgroundColor,
	highlightColor: ChunkText.cssVariables.highlightColor,
	textBackgroundColor: "--speed-reader-text-background-color",
	textColor: "--speed-reader-text-color",
	fontSize: "--speed-reader-font-size",
	lineHeight: "--speed-reader-line-height",
	fontFamily: "--speed-reader-font-family",
	textAlign: "--speed-reader-text-align",
};
const template = createTemplate(`
<style>
	:host {
		${cssVariables.highlightBackgroundColor}: ${defaultSettings.highlightBackgroundColor};
		${cssVariables.highlightColor}: ${defaultSettings.highlightColor};
		${cssVariables.textBackgroundColor}: ${defaultSettings.textBackgroundColor};
		${cssVariables.textColor}: ${defaultSettings.textColor};
		${cssVariables.fontSize}: ${defaultSettings.fontSize};
		${cssVariables.lineHeight}: ${defaultSettings.lineHeight};
		${cssVariables.fontFamily}: ${defaultSettings.fontFamily};
		${cssVariables.textAlign}: ${defaultSettings.textAlign};
		${ParagraphSpeedReader.cssVariables.margin}: ${paragraphMargin}px 0;

		display: block;
		margin: 0;
		background-color: var(${cssVariables.backgroundColor});
		padding: ${paragraphMargin}px ${paragraphMargin * 2.5}px;
		min-width: 50px;
		min-height: 50px;
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
		this.attachShadow({ mode: "open" }).appendChild(
			templateContent(template),
		);
		this._paragraphs = new BoundedList();
		this.isPaused = this.isPaused ?? false;
		this.settings = defaultSettings;
	}

	connectedCallback() {
		this.text = this.textContent.trim?.() ?? "";
		if (!this.isPaused) {
			this.startReading().catch(console.error);
		}
	}

	static get attrs() {
		return attrs;
	}

	static get cssVariables() {
		return cssVariables;
	}

	static get observedAttributes() {
		return Object.values(attrs);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue != newValue) {
			if (name === attrs.currentParagraphIndex) {
				this.currentParagraphIndex = newValue;
			} else if (name == attrs.isPaused) {
				this.isPaused = newValue;
			}
		}
	}

	async startReading() {
		while (this.hasNextParagraph()) {
			this.nextParagraph();
			while (this.currentParagraph.hasNextChunkText()) {
				this.currentParagraph.nextChunkText();
				this.currentParagraph.assureCurrentChunkTextInView();
				await sleep(
					chunkMilliseconds(
						this.currentParagraph.currentChunkTextLength(),
						this.charactersPerSecond,
					)
				);
				while (this.isPaused) {
					await sleep(300);
				}
			}
			if (this.settings.slightPause) {
				await sleep(300);
			}
			this.currentParagraph.isCurrentChunkTextHighlighted = false;
			this.currentParagraph.rewindChunkTexts();
		}
		this.rewindParagraphs();
	}

	/**
	 * @returns {boolean}
	 */
	get isPaused() {
		return boolEqualsLoose(true, this.getAttribute(attrs.isPaused));
	}

	/**
	 * @param {boolean} paused
	 */
	set isPaused(paused) {
		if (!boolEqualsLoose(this._isPaused, paused)) {
			this._isPaused = paused;
			this.setAttribute(attrs.isPaused, paused);
		}
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

	get text() {
		return this._text;
	}

	set text(newText) {
		this.textContent = "";
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

	get paragraphs() {
		return this._paragraphs;
	}

	set paragraphs(newParagraphs) {
		while (this.lastChild) {
			this.lastChild.remove();
		}
		this._paragraphs.list = newParagraphs;
		this.appendChild(tag({ tagName: "span", children: newParagraphs }));
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	get currentParagraph() {
		return this._paragraphs.current;
	}

	/**
	 * @returns {number}
	 */
	get currentParagraphIndex() {
		return this._paragraphs.index;
	}

	set currentParagraphIndex(index) {
		if (index != this.currentParagraphIndex) {
			this._paragraphs.index = index;
			this.setAttribute(
				attrs.currentParagraphIndex, this.currentParagraphIndex
			);
		}
	}

	/**
	 * @param {number} value
	 * @returns {ParagraphSpeedReader}
	 */
	addCurrentParagraphIndex(value) {
		this.currentParagraphIndex = this.currentParagraphIndex + value;
		return this.currentParagraph;
	}

	rewindParagraphs() {
		this._paragraphs.rewind();
	}

	/**
	 * @returns {boolean}
	 */
	hasNextParagraph() {
		return this._paragraphs.hasNext();
	}

	/**
	 * @returns {boolean}
	 */
	hasPreviousParagraph() {
		return this._paragraphs.hasPrevious();
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	nextParagraph() {
		return this.addCurrentParagraphIndex(1);
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	previousParagraph() {
		return this.addCurrentParagraphIndex(-1);
	}

}

/**
 * @returns {SpeedReader}
 */
export function buildSpeedReader(
	text, isPaused=true, settings=defaultSettings
) {
	const speedReader = tag({
		tagName: "speed-reader",
		attributes: {
			[attrs.currentParagraphIndex]: -1,
			[attrs.isPaused]: isPaused,
		},
		textContent: text,
	});
	speedReader.settings = settings;
	return speedReader;
}

customElements.define("speed-reader", SpeedReader);
