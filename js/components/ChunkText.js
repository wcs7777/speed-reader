import defaultSettings from "../utils/defaultSettings.js";
import { createTemplate, tag, templateContent } from "../utils/dom.js";
import { boolEqualsLoose } from "../utils/mixed.js";

const attrs = {
	isHighlighted: "data-is-highlighted",
};
const cssVariables = {
	highlightBackgroundColor: "--chunk-text-highlight-background-color",
	highlightColor: "--chunk-text-highlight-color",
};
const template = createTemplate(`
<style>
	:host(.is-highlighted) {
		background-color: var(
			${cssVariables.highlightBackgroundColor},
			${defaultSettings.highlightBackgroundColor}
		);
		color: var(
			${cssVariables.highlightColor},
			${defaultSettings.highlightColor}
		);
	}
</style>
<slot></slot>
`);

export class ChunkText extends HTMLSpanElement {

	constructor() {
		super();
		this.attachShadow({ mode: "open" }).appendChild(
			templateContent(template),
		);
		this.isHighlighted = this.isHighlighted ?? false;
	}

	connectedCallback() {
		this.text = this.text ?? "";
		this.updateColor();
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
		if (name === attrs.isHighlighted && oldValue != newValue) {
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
	 * @returns {boolean}
	 */
	get isHighlighted() {
		return boolEqualsLoose(true, this.getAttribute(attrs.isHighlighted));
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
		this.classList.toggle("is-highlighted", this.isHighlighted);
	}

}

/**
 * @param {string} text
 * @param {boolean} isHighlighted
 * @returns {ChunkText}
 */
export function buildChunkText(text, isHighlighted) {
	return tag({
		tagName: "span",
		is: "chunk-text",
		textContent: text,
		attributes: {
			[attrs.isHighlighted]: isHighlighted,
		},
	});
}

customElements.define("chunk-text", ChunkText, { extends: "span" });
