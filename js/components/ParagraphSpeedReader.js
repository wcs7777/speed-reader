import { $$, createTemplate, removeAllChildren, tag, templateContent } from "../utils/dom.js";
import Walker from "../utils/Walker.js";
import { ChunkText } from "./ChunkText.js";

const attrs = {
	chunkTextIndex: "data-chunk-text-index",
};
const cssVariables = {
	margin: "--paragraph-speed-reader-margin",
};
const template = createTemplate(`
<style>
	:host {
		margin: var(${cssVariables.margin}, 10px 0);
	}
</style>
<slot></slot>
`);

export class ParagraphSpeedReader extends HTMLParagraphElement {

	constructor() {
		super();
		this.attachShadow({ mode: "open" }).appendChild(
			templateContent(template),
		);
		this._chunkTexts = Walker.fromWithIndexChangeCallback(
			this.chunkTextIndexChangeCallback.bind(this), []
		);
	}

	connectedCallback() {
		this.chunkTexts = $$("[is=chunk-text]", this);
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
		if (name === attrs.chunkTextIndex && oldValue != newValue) {
			this.chunkTextIndex = newValue;
		}
	}

	/**
	 * @param {{ index: number; value: ChunkText }} oldCurrent
	 * @param {{ index: number; value: ChunkText }} newCurrent
	 */
	chunkTextIndexChangeCallback(oldCurrent, newCurrent) {
		oldCurrent.value?.toggleIsHighlighted(false);
		newCurrent.value?.toggleIsHighlighted(true);
		this.setAttribute(
			attrs.chunkTextIndex, newCurrent.index
		);
	}

	assureIntoViewport() {
		this.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "nearest",
		});
	}

	/**
	 * @returns {ChunkText[]}
	 */
	get chunkTexts() {
		return this._chunkTexts;
	}

	/**
	 * @param {ChunkText[]} newChunkTexts
	 */
	set chunkTexts(newChunkTexts) {
		removeAllChildren(this);
		this._chunkTexts = Walker.fromWithIndexChangeCallback(
			this.chunkTextIndexChangeCallback.bind(this),
			newChunkTexts,
		);
		this.appendChild(tag({ tagName: "span", children: newChunkTexts }));
	}

	/**
	 * @returns {number}
	 */
	get chunkTextIndex() {
		return this._chunkTexts.index;
	}

	/**
	 * @param {number} index
	 */
	set chunkTextIndex(index) {
		this._chunkTexts.index = index;
	}

	/**
	 * @returns {ChunkText}
	 */
	get chunkText() {
		return this._chunkTexts.current;
	}

	/**
	 * @param {number} index
	 * @returns {ChunkText}
	 */
	toChunkTextIndex(index) {
		return this._chunkTexts.toIndex(index);
	}

	/**
	 * @return {ChunkText}
	 */
	toFirstChunkText() {
		return this._chunkTexts.toFirst();
	}

	/**
	 * @return {ChunkText}
	 */
	toLastChunkText() {
		return this._chunkTexts.toLast();
	}

	/**
	 * @return {ChunkText}
	 */
	nextChunkText() {
		return this._chunkTexts.next();
	}

	/**
	 * @return {ChunkText}
	 */
	previousChunkText() {
		return this._chunkTexts.previous();
	}

	rewindChunkTexts() {
		$$(`[${ChunkText.attrs.isHighlighted}="true"]`, this)
			.forEach((chunkText) => chunkText.isHighlighted = false);
		return this._chunkTexts.rewind();
	}

	/**
	 * @returns {Generator<ChunkText, void, undefined>}
	 */
	*traverseChunkTextsForward() {
		yield* this._chunkTexts.traverseForward();
	}

	/**
	 * @returns {Generator<ChunkText, void, undefined>}
	 */
	*traverseChunkTextsBackward() {
		yield* this._chunkTexts.traverseBackward();
	}

	isChunkTextBeforeFirst() {
		return this._chunkTexts.isBeforeFirst();
	}

	isChunkTextAfterLast() {
		return this._chunkTexts.isAfterLast();
	}

	isChunkTextInRange() {
		return this._chunkTexts.isInRange();
	}

	hasPreviousChunkText() {
		return this._chunkTexts.hasPrevious();
	}

	hasNextChunkText() {
		return this._chunkTexts.hasNext();
	}

}

/**
 * @param {ChunkText[]} chunkTexts
 * @returns {ParagraphSpeedReader}
 */
export function buildParagraphSpeedReader(chunkTexts) {
	return tag({
		tagName: "p",
		is: "paragraph-speed-reader",
		attributes: {
			[attrs.chunkTextIndex]: -1,
		},
		children: chunkTexts,
	});
}

customElements.define(
	"paragraph-speed-reader", ParagraphSpeedReader, { extends: "p" }
);
