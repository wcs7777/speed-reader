import { threshold } from "./utils.js";
import BoundedList from "./BoundedList.js";

export default class ParagraphSpeedReader extends HTMLParagraphElement {
	static get customTagName() {
		return "paragraph-speed-reader";
	}

	static get extendingTagName() {
		return "p";
	}

	static selfDefine() {
		const isDefined = (
			customElements.get(ParagraphSpeedReader.customTagName) !== undefined
		);
		if (!isDefined) {
			customElements.define(
				ParagraphSpeedReader.customTagName,
				ParagraphSpeedReader,
				{ extends: ParagraphSpeedReader.extendingTagName },
			);
		}
	}

	static get currentChunkIndexAttribute() {
		return "data-current-chunk-index";
	}

	static build(chunks) {
		const paragraph = document.createElement(
			ParagraphSpeedReader.extendingTagName,
			{ is: ParagraphSpeedReader.customTagName },
		);
		paragraph.chunks = chunks;
		return paragraph;
	}

	static get observedAttributes() {
		return [ParagraphSpeedReader.currentChunkIndexAttribute];
	}

	constructor() {
		super();
		this._chunks = new BoundedList();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === ParagraphSpeedReader.currentChunkIndexAttribute) {
			const oldChunkIndex = threshold(0, oldValue, this.chunks.length);
			const newChunkIndex = threshold(0, newValue, this.chunks.length);
			if (!isNaN(oldChunkIndex)) {
				this.chunks[oldChunkIndex].isHighlighted = false;
			}
			if (!isNaN(newChunkIndex)) {
				this.chunks[newChunkIndex].isHighlighted = true;
			}
		}
	}

	get chunks() {
		return this._chunks.list;
	}

	set chunks(list) {
		this.chunks.forEach((chunk) => chunk.remove());
		this._chunks.clear();
		list.forEach((chunk) => this.addChunk(chunk));
	}

	get currentChunkIndex() {
		return this._chunks.index;
	}

	set currentChunkIndex(index) {
		this._chunks.index = index;
		this.setAttribute(
			ParagraphSpeedReader.currentChunkIndexAttribute,
			this.currentChunkIndex,
		);
	}

	get currentChunk() {
		return this._chunks.current;
	}

	get currentChunkLength() {
		return this.currentChunk.length;
	}

	get hasNextChunk() {
		return this._chunks.hasNext;
	}

	get hasPreviousChunk() {
		return this._chunks.hasPrevious;
	}

	addChunk(chunk) {
		this._chunks.add(chunk);
		this.appendChild(chunk);
	}

	nextChunk() {
		this.currentChunkIndex = this.currentChunkIndex + 1;
		return this.currentChunk;
	}

	previousChunk() {
		this.currentChunkIndex = this.currentChunkIndex - 1;
		return this.currentChunk;
	}

	unhighlightCurrentChunk() {
		return this.currentChunk.isHighlighted = false;
	}
}
