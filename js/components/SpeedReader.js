import {
	chunkTextMs,
	findIndexInRanges,
	separateChunks,
	splitParagraphs,
	splitWords,
	threshold
} from "../utils/alphanumeric.js";
import defaultSettings from "../utils/defaultSettings.js";
import {
	byId,
	createTemplate,
	removeAllChildren,
	tag,
	templateContent,
	validateCssProperties
} from "../utils/dom.js";
import { boolEqualsLoose, sleep } from "../utils/mixed.js";
import Walker from "../utils/Walker.js";
import { buildChunkText, ChunkText } from "./ChunkText.js";
import {
	buildParagraphSpeedReader,
	ParagraphSpeedReader
} from "./ParagraphSpeedReader.js";

const averageWordSize = 5.7;
const attrs = {
	isPaused: "data-is-paused",
	paragraphIndex: "data-paragraph-index",
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
		${ParagraphSpeedReader.cssVariables.margin}: 10px 0;

		box-shadow: -2px 1px 7px 2px rgba(0, 0, 0, 0.3);
		border-radius: var(--element-border-radius);
		width: 100%;
		height: fit-content;
	}
</style>
<slot></slot>
`);

export class SpeedReader extends HTMLDivElement {

	constructor() {
		super();
		this.attachShadow({ mode: "open" }).appendChild(
			templateContent(template),
		);
		this._paragraphs = Walker.fromWithIndexChangeCallback(
			this.attributeChangedCallback.bind(this), []
		);
		this.isPaused = this.isPaused ?? false;
		this.classList.add("speed-reader");
	}

	connectedCallback() {
		this.min = {
			wpm: byId("words-per-minute")?.min || 60,
			wpc: byId("words-per-chunk")?.min || 1,
		};
		this.max = {
			wpm: byId("words-per-minute")?.max || 6000,
			wpc: byId("words-per-chunk")?.max || 20,
		};
		this.settings = defaultSettings;
		this.text = this.textContent;
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
			if (name === attrs.paragraphIndex) {
				this.currentParagraphIndex = newValue;
			} else if (name == attrs.isPaused) {
				this.isPaused = newValue;
			}
		}
	}

	/**
	 * @param {{ index: number; value: ParagraphSpeedReader }} oldCurrent
	 * @param {{ index: number; value: ParagraphSpeedReader }} newCurrent
	 */
	paragraphIndexChangeCallback(oldCurrent, newCurrent) {
		oldCurrent.value?.rewindChunkTexts();
		newCurrent.value?.assureIntoViewport();
		this.setAttribute(attrs.paragraphIndex, newCurrent.index);
	}

	async startReading() {
		try {
			let milliseconds;
			while ((milliseconds = this.nextMilliseconds()) > 0) {
				await sleep(milliseconds);
				while (this.isPaused) {
					await sleep(100);
				}
			}
			this.rewindParagraphs();
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * @returns {number}
	 */
	nextMilliseconds() {
		let milliseconds = 0;
		if (!this.currentParagraph?.hasNextChunkText()) {
			this.nextParagraph();
			if (this.settings.slightPause) {
				milliseconds += 100;
			}
		}
		const length = this.currentParagraph?.nextChunkText()?.text.length;
		if (length !== undefined) {
			milliseconds += chunkTextMs(length, this.charactersPerSecond);
		} else {
			milliseconds = 0;
		}
		return milliseconds;
	}

	/**
	 * @returns {defaultSettings}
	 */
	get settings() {
		return this._settings;
	}

	/**
	 * @param {defaultSettings} newSettings
	 */
	set settings(newSettings) {
		this._settings = this.validateSettings(newSettings);
		for (const [key, property] of Object.entries(cssVariables)) {
			this.style.setProperty(property, this.settings[key]);
		}
		this.charactersPerSecond = (
			this.settings.wordsPerMinute / 60 * averageWordSize
		);
		const oldChunkTextLength = this.chunkTextLength;
		this.chunkTextLength = this.settings.wordsPerChunk * averageWordSize;
		if (oldChunkTextLength !== this.chunkTextLength && this.text) {
			const isPaused = this.isPaused;
			this.isPaused = true;
			const oldWordOffset = this.wordOffset;
			// rebuild paragraphs and chunkTexts
			this.text = this.text;
			this.wordOffset = oldWordOffset;
			this.isPaused = isPaused;
		}
	}

	/**
	 * @returns {string}
	 */
	get text() {
		return this._text;
	}

	/**
	 * @param {string} newText
	 */
	set text(newText) {
		let offset = 0;
		this.paragraphsRanges = [];
		this.textContent = "";
		this._text = newText;
		this.paragraphs = splitParagraphs(this.text)
			.map((paragraphText) => {
				const chunkTextsRanges = [];
				const paragraph = buildParagraphSpeedReader(
					separateChunks(splitWords(paragraphText), this.chunkTextLength)
						.map((chunk) => {
							++offset;
							const begin = offset;
							offset += chunk.length - 1;
							chunkTextsRanges.push({ begin, end: offset });
							return buildChunkText(chunk.join(" "), false);
						}),
				);
				this.paragraphsRanges.push({
					begin: chunkTextsRanges.at(0)?.begin,
					end: chunkTextsRanges.at(-1)?.end,
					chunkTextsRanges,
				});
				return paragraph;
			});
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
			if (!this.isPaused && !this.isParagraphInRange()) {
				this.startReading().catch(console.error);
			}
			this.dispatchEvent(
				new CustomEvent(
					"speed-reader-paused",
					{ detail: { paused: this.isPaused } },
				),
			);
		}
	}

	/**
	 * @returns {number}
	 */
	get wordOffset() {
		const defaultOffset = 1;
		if (!this.isParagraphInRange()) {
			return defaultOffset;
		}
		const chunkText = (
			this.currentParagraph.isChunkTextInRange() ?
			this.currentParagraph.chunkTextIndex : 0
		);
		return this.paragraphsRanges
			.at(this.currentParagraphIndex)
			.chunkTextsRanges.at(chunkText).begin ?? defaultOffset;
	}

	/**
	 * @param {number} offset
	 */
	set wordOffset(offset) {
		const paragraph = findIndexInRanges(this.paragraphsRanges, offset);
		if (paragraph > -1) {
			const chunkText = findIndexInRanges(
				this.paragraphsRanges.at(paragraph).chunkTextsRanges, offset
			);
			this.paragraphIndex = paragraph;
			this.currentParagraph.chunkTextIndex = chunkText;
		}
	}

	/**
	 * @returns {ParagraphSpeedReader[]}
	 */
	get paragraphs() {
		return this._paragraphs;
	}

	/**
	 * @param {ParagraphSpeedReader[]} newParagraphs
	 */
	set paragraphs(newParagraphs) {
		removeAllChildren(this);
		this._paragraphs = Walker.fromWithIndexChangeCallback(
			this.paragraphIndexChangeCallback.bind(this),
			newParagraphs,
		);
		this.appendChild(tag({ tagName: "span", children: newParagraphs }));
	}

	get paragraphIndex() {
		return this._paragraphs.index;
	}

	set paragraphIndex(index) {
		this._paragraphs.index = index;
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	get currentParagraph() {
		return this._paragraphs.current;
	}

	/**
	 * @param {number} index
	 * @returns {ParagraphSpeedReader}
	 */
	toParagraphIndex(index) {
		this._paragraphs.toIndex(index);
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	toFirstParagraph() {
		return this._paragraphs.toFirst();
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	toLastParagraph() {
		return this._paragraphs.toLast();
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	nextParagraph() {
		return this._paragraphs.next();
	}

	/**
	 * @returns {ParagraphSpeedReader}
	 */
	previousParagraph() {
		return this._paragraphs.previous();
	}

	rewindParagraphs() {
		for (const paragraph of this.paragraphs) {
			paragraph.rewindChunkTexts();
		}
		this._paragraphs.rewind();
	}

	/**
	 * @returns {ChunkText}
	 */
	toNextChunkText() {
		if (
			!this.currentParagraph?.hasNextChunkText() &&
			this.hasNextParagraph() &&
			true
		) {
			this.nextParagraph();
		}
		return (
			this.currentParagraph.nextChunkText() ??
			this.currentParagraph.toLastChunkText()
		);
	}

	/**
	 * @returns {ChunkText}
	 */
	toPreviousChunkText() {
		if (!this.currentParagraph?.hasPreviousChunkText()) {
			return this.previousParagraph().toLastChunkText();
		} else {
			return this.currentParagraph?.previousChunkText();
		}
	}

	/**
	 * @returns {Generator<ParagraphSpeedReader, void, undefined>}
	 */
	*traverseParagraphsForward() {
		yield* this._paragraphs.traverseForward();
	}

	/**
	 * @returns {Generator<ParagraphSpeedReader, void, undefined>}
	 */
	*traverseParagraphsBackward() {
		yield* this._paragraphs.traverseForward();
	}

	isParagraphBeforeFirst() {
		return this._paragraphs.isBeforeFirst();
	}

	isParagraphAfterLast() {
		return this._paragraphs.isAfterLast();
	}

	isParagraphInRange() {
		return this._paragraphs.isInRange();
	}

	hasPreviousParagraph() {
		return this._paragraphs.hasPrevious();
	}

	hasNextParagraph() {
		return this._paragraphs.hasNext();
	}

	validateSettings(settings) {
		const currentSettings = this.settings;
		return {
			...settings,
			wordsPerMinute: threshold(
				this.min.wpm,
				settings.wordsPerMinute || currentSettings.wordsPerMinute,
				this.max.wpm,
			),
			wordsPerChunk: threshold(
				this.min.wpc,
				settings.wordsPerChunk || currentSettings.wordsPerChunk,
				this.max.wpc,
			),
			...validateCssProperties(
				settings,
				currentSettings,
				["textBackgroundColor", "highlightBackgroundColor"],
				"background-color",
			),
			...validateCssProperties(
				settings,
				currentSettings,
				["textColor", "highlightColor"],
				"color",
			),
			...validateCssProperties(settings, currentSettings, "fontSize"),
			...validateCssProperties(settings, currentSettings, "lineHeight"),
			...validateCssProperties(settings, currentSettings, "fontFamily"),
			...validateCssProperties(settings, currentSettings, "textAlign"),
		};
	}

}

/**
 * @returns {SpeedReader}
 */
export function buildSpeedReader(
	text, isPaused=true, settings=defaultSettings
) {
	const speedReader = tag({
		tagName: "div",
		is: "speed-reader",
		attributes: {
			[attrs.paragraphIndex]: -1,
			[attrs.isPaused]: isPaused,
		},
		textContent: text,
	});
	speedReader.settings = settings;
	return speedReader;
}

customElements.define("speed-reader", SpeedReader, { extends: "div" });
