import { tag } from "../utils/dom.js";
import { boolEqualsLoose } from "../utils/mixed.js";

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

	static get attrs() {
		return {
			highlightColor: "highlight-color",
			isHighlighted: "is-highlighted",
		};
	}

	static get observedAttributes() {
		return Object.values(ChunkText.attrs);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this.updateColor();
		}
	}

	get text() {
		return this.textContent;
	}

	set text(newText) {
		this.textContent = newText.trim();
	}

	get highlightColor() {
		return this.getAttribute(ChunkText.attrs.highlightColor);
	}

	set highlightColor(color) {
		if (color !== this.highlightColor) {
			this.setAttribute(ChunkText.attrs.highlightColor, color);
		}
	}

	get isHighlighted() {
		return boolEqualsLoose(
			true, this.getAttribute(ChunkText.attrs.isHighlighted)
		);
	}

	set isHighlighted(highlighted) {
		if (!boolEqualsLoose(highlighted, this.isHighlighted)) {
			this.setAttribute(ChunkText.attrs.isHighlighted, highlighted);
		}
	}

	updateColor() {
		this.style.color = this.isHighlighted ? this.highlightColor : "inherit";
	}

}

export function buildChunkText(text, highlightColor, isHighlighted) {
	return tag({
		tagName: "span",
		is: "chunk-text",
		textContent: text,
		attributes: {
			[ChunkText.attrs.highlightColor]: highlightColor,
			[ChunkText.attrs.isHighlighted]: isHighlighted,
		},
	});
}

customElements.define("chunk-text", ChunkText, { extends: "span" });
