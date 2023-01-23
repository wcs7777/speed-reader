export default class ChunkText extends HTMLSpanElement {
	static get customTagName() {
		return "chunk-text";
	}

	static get extendingTagName() {
		return "span";
	}

	static selfDefine() {
		const isDefined = (
			customElements.get(ChunkText.customTagName) !== undefined
		);
		if (!isDefined) {
			customElements.define(
				ChunkText.customTagName,
				ChunkText,
				{ extends: ChunkText.extendingTagName },
			);
		}
	}

	static get isHighlightedAttribute() {
		return "data-is-highlighted";
	}

	static build(text) {
		const chunkText = document.createElement(
			ChunkText.extendingTagName,
			{ is: ChunkText.customTagName },
		);
		chunkText.text = text;
		return chunkText;
	}

	static get observedAttributes() {
		return [ChunkText.isHighlightedAttribute];
	}

	constructor() {
		super();
		this.isHighlighted = false;
		this._text = "";
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === ChunkText.isHighlightedAttribute) {
			this.classList.toggle(
				"highlight",
				newValue !== "false" && newValue !== false,
			);
		}
	}

	get text() {
		return this.textContent;
	}

	set text(value) {
		return this.textContent = value;
	}

	get length() {
		return this.textContent.length;
	}

	get isHighlighted() {
		return this.getAttribute(
			ChunkText.isHighlightedAttribute,
		);
	}

	set isHighlighted(value) {
		return this.setAttribute(
			ChunkText.isHighlightedAttribute,
			value,
		);
	}
}
