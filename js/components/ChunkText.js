import { tag } from "../utils/dom.js";
import { boolEqualsLoose } from "../utils/mixed.js";

const attrs = {
	highlightColor: "highlight-color",
	isHighlighted: "is-highlighted",
};

export class ChunkText extends HTMLSpanElement {

	constructor() {
		super();
		this.text = this.text ?? "";
		this.highlightColor = this.highlightColor ?? "black";
		this.isHighlighted = this.isHighlighted ?? false;
	}

	connectedCallback() {
		this.updateColor();
	}

	static get observedAttributes() {
		return Object.values(attrs);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this.updateColor();
		}
	}

	/**
	 * @return {string}
	 */
	get text() {
		return this.textContent;
	}

	/**
	 * @param {string} newText
	 */
	set text(newText) {
		this.textContent = newText.trim();
	}

	/**
	 * @returns {string}
	 */
	get highlightColor() {
		return this.getAttribute(attrs.highlightColor);
	}

	/**
	 * @param {string} color
	 */
	set highlightColor(color) {
		if (color !== this.highlightColor) {
			this.setAttribute(attrs.highlightColor, color);
		}
	}

	/**
	 * @returns {boolean}
	 */
	get isHighlighted() {
		return boolEqualsLoose(
			true, this.getAttribute(attrs.isHighlighted)
		);
	}

	/**
	 * @param {string|boolean} highlighted
	 */
	set isHighlighted(highlighted) {
		if (!boolEqualsLoose(highlighted, this.isHighlighted)) {
			this.setAttribute(attrs.isHighlighted, highlighted);
		}
	}

	updateColor() {
		this.style.color = this.isHighlighted ? this.highlightColor : "inherit";
	}

}

/**
 * @param {string} text
 * @param {string} highlightColor
 * @param {boolean} isHighlighted
 * @returns {ChunkText}
 */
export function buildChunkText(text, highlightColor, isHighlighted) {
	return tag({
		tagName: "span",
		is: "chunk-text",
		textContent: text,
		attributes: {
			[attrs.highlightColor]: highlightColor,
			[attrs.isHighlighted]: isHighlighted,
		},
	});
}

customElements.define("chunk-text", ChunkText, { extends: "span" });
