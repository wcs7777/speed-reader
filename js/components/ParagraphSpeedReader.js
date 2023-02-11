import BoundedList from "../utils/BoundedList.js";
import { $$, tag } from "../utils/dom.js";
import { boolEqualsLoose } from "../utils/mixed.js";
import { ChunkText } from "./ChunkText.js";

const attrs = {
	currentChunkTextIndex: "data-current-chunk-text-index",
};

export class ParagraphSpeedReader extends HTMLParagraphElement {

	constructor() {
		super();
		this._chunkTexts = new BoundedList($$("[is=chunk-text]", this));
	}

	static get observedAttributes() {
		return Object.values(attrs);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === attrs.currentChunkTextIndex && oldValue !== newValue) {
			this.currentChunkTextIndex = newValue;
		}
	}

	/**
	 * @returns {ChunkText[]}
	 */
	get chunkTexts() {
		return this._chunkTexts.list;
	}

	/**
	 * @param {ChunkText[]} list
	 */
	set chunkTexts(list) {
		for (const chunkText of this.chunkTexts) {
			chunkText.remove();
		}
		this._chunkTexts.clear();
		for (const item of list) {
			this.addChunkText(item);
		}
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
		const ct = this.currentChunkText;
		if (ct && !boolEqualsLoose(ct.isHighlighted, highlighted)) {
			ct.isHighlighted = highlighted;
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
		if (index !== this.currentChunkTextIndex) {
			this.isCurrentChunkTextHighlighted = false;
			this._chunkTexts.index = index;
			this.setAttribute(
				attrs.currentChunkTextIndex, this._chunkTexts.index
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

	nextChunkText() {
		return this.addCurrentChunkTextIndex(1);
	}

	previousChunkText() {
		return this.addCurrentChunkTextIndex(-1);
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
