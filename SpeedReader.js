import BoundedList from "./BoundedList.js";
import ChunkText from "./ChunkText.js";
import ParagraphSpeedReader from "./ParagraphSpeedReader.js";
import {
	chunkMilliseconds,
	sleep,
	splitParagraphChunks,
	splitParagraphs,
} from "./utils.js";

export default class SpeedReader extends HTMLDivElement {
	static get customTagName() {
		return "speed-reader";
	}

	static get extendingTagName() {
		return "div";
	}

	static get averageWordSize() {
		return 5.7;
	}

	static selfDefine() {
		const isDefined = (
			customElements.get(SpeedReader.customTagName) !== undefined
		);
		if (!isDefined) {
			customElements.define(
				SpeedReader.customTagName,
				SpeedReader,
				{ extends: SpeedReader.extendingTagName },
			);
		}
	}

	static build(text, wordsPerMinute, wordsPerChunk) {
		const chunkLength = wordsPerChunk * SpeedReader.averageWordSize;
		const speedReader = document.createElement(
			SpeedReader.extendingTagName,
			{ is: SpeedReader.customTagName },
		);
		speedReader.wordsPerMinute = wordsPerMinute;
		speedReader.paragraphs = splitParagraphs(text)
			.map((paragraph) => {
				return ParagraphSpeedReader.build(
					splitParagraphChunks(paragraph, chunkLength).map(ChunkText.build),
				);
			});
		return speedReader;
	}

	constructor() {
		super();
		this._paragraphs = new BoundedList();
		this._wordsPerMinute = 300;
		this.updateCharactersPerSecond();
		this.classList.add("speed-reader");
	}

	get wordsPerMinute() {
		return this._wordsPerMinute;
	}

	set wordsPerMinute(wmp) {
		this._wordsPerMinute = wmp;
		this.updateCharactersPerSecond();
	}

	get charactersPerSecond() {
		return this._charactersPerSecond;
	}

	get paragraphs() {
		return this._paragraphs.list;
	}

	set paragraphs(list) {
		this.paragraphs.forEach((paragraph) => paragraph.remove());
		this._paragraphs.clear();
		list.forEach((paragraph) => this.addParagraph(paragraph));
	}

	get currentParagraphIndex() {
		return this._paragraphs.index;
	}

	set currentParagraphIndex(index) {
		this._paragraphs.index = index;
	}

	get hasNextParagraph() {
		return this._paragraphs.hasNext;
	}

	get hasPreviousParagraph() {
		return this._paragraphs.hasPrevious;
	}

	updateCharactersPerSecond() {
		return this._charactersPerSecond = (
			this.wordsPerMinute / 60 * SpeedReader.averageWordSize
		);
	}

	addParagraph(chunk) {
		this.appendChild(chunk);
		this._paragraphs.add(chunk);
	}

	nextParagraph() {
		return this._paragraphs.next();
	}

	previousParagraph() {
		return this._paragraphs.previous();
	}

	async startSpeedReading() {
		while (this.hasNextParagraph) {
			const paragraph = this.nextParagraph();
			while (paragraph.hasNextChunk) {
				paragraph.nextChunk();
				await sleep(
					chunkMilliseconds(
						paragraph.currentChunkLength,
						this.charactersPerSecond,
					),
				);
			}
			paragraph.unhighlightCurrentChunk();
		}
	}
}
