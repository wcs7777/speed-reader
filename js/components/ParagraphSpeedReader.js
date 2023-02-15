import BoundedList from "../utils/BoundedList.js";
import { $$, createTemplate, tag, templateContent } from "../utils/dom.js";
import { ChunkText } from "./ChunkText.js";

const attrs = {
	currentChunkTextIndex: "data-current-chunk-text-index",
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
		this._chunkTexts = new BoundedList();
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
		if (name === attrs.currentChunkTextIndex && oldValue != newValue) {
			this.currentChunkTextIndex = newValue;
		}
	}

	/**
	 * @returns {ChunkText[]}
	 */
	get chunkTexts() {
		return this._chunkTexts.items;
	}

	/**
	 * @param {ChunkText[]} newChunkTexts
	 */
	set chunkTexts(newChunkTexts) {
		while (this.lastChild) {
			this.lastChild.remove();
		}
		this._chunkTexts.items = newChunkTexts;
		this.appendChild(tag({ tagName: "span", children: newChunkTexts }));
	}

	/**
	 * @returns {boolean}
	 */
	get isCurrentChunkTextHighlighted() {
		const ct = this.currentChunkText;
		return ct ? ct.isHighlighted : false;
	}

	/**
	 * @param {string|number} highlighted
	 */
	set isCurrentChunkTextHighlighted(highlighted) {
		if (!this._chunkTexts.isBeforeFirst()) {
			this.currentChunkText.isHighlighted = highlighted;
		}
	}

	/**
	 * @returns {ChunkText}
	 */
	get currentChunkText() {
		return this._chunkTexts.current;
	}

	/**
	 * @returns {number}
	 */
	get currentChunkTextIndex() {
		return this._chunkTexts.index;
	}

	/**
	 * @param {number} index
	 */
	set currentChunkTextIndex(index) {
		if (index != this.currentChunkTextIndex) {
			this.isCurrentChunkTextHighlighted = false;
			this._chunkTexts.index = index;
			this.setAttribute(
				attrs.currentChunkTextIndex, this.currentChunkTextIndex
			);
			this.isCurrentChunkTextHighlighted = true;
		}
	}

	/**
	 * @param {ChunkText} chunkText
	 */
	addChunkText(chunkText) {
		this._chunkTexts.add(chunkText);
		this.appendChild(chunkText);
	}

	/**
	 * @param {number} value
	 * @returns {ChunkText}
	 */
	addCurrentChunkTextIndex(value) {
		this.currentChunkTextIndex = this.currentChunkTextIndex + value;
		return this.currentChunkText;
	}

	rewindChunkTexts() {
		$$(`[${ChunkText.attrs.isHighlighted}="true"]`, this)
			.forEach((chunkText) => chunkText.isHighlighted = false);
		this._chunkTexts.rewind();
	}

	/**
	 * @returns {boolean}
	 */
	hasNextChunkText() {
		return this._chunkTexts.hasNext();
	}

	/**
	 * @returns {boolean}
	 */
	hasPreviousChunkText() {
		return this._chunkTexts.hasPrevious();
	}

	/**
	 * @returns {ChunkText}
	 */
	nextChunkText() {
		return this.addCurrentChunkTextIndex(1);
	}

	/**
	 * @returns {ChunkText}
	 */
	previousChunkText() {
		return this.addCurrentChunkTextIndex(-1);
	}

	assureIntoViewport() {
		this.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "nearest",
		});
	}

	currentChunkTextLength() {
		return this.currentChunkText?.text.length;
	}

	isChunkTextsBeforeFirst() {
		return this._chunkTexts.isBeforeFirst();
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
			[attrs.currentChunkTextIndex]: -1,
		},
		children: chunkTexts,
	});
}

customElements.define(
	"paragraph-speed-reader", ParagraphSpeedReader, { extends: "p" }
);
