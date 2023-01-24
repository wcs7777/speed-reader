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

	static build(text, wordsPerMinute, wordsPerChunk) {
		return document.createElement(
			SpeedReader.extendingTagName,
			{ is: SpeedReader.customTagName },
		)
			.newText(text, wordsPerMinute, wordsPerChunk);
	}

	constructor() {
		super();
		this._paragraphs = new BoundedList();
		this._wordsPerMinute = 300;
		this._charactersPerSecond = 1;
		this._slightPauseEndPhrase = false;
		this._paused = false;
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

	get slightPauseEndPhrase() {
		return this._slightPauseEndPhrase;
	}

	set slightPauseEndPhrase(enabled) {
		this._slightPauseEndPhrase = enabled;
	}

	get paused() {
		return this._paused;
	}

	set paused(is) {
		this._paused = is;
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

	newText(text, wordsPerMinute, wordsPerChunk) {
		const chunkLength = wordsPerChunk * SpeedReader.averageWordSize;
		this.wordsPerMinute = wordsPerMinute;
		this.paragraphs = splitParagraphs(text)
			.map((paragraph) => {
				return ParagraphSpeedReader.build(
					splitParagraphChunks(paragraph, chunkLength).map(ChunkText.build),
				);
			});
		return this;
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
			if (this.slightPauseEndPhrase) {
				await sleep(300);
			}
			while (this.paused) {
				await sleep(100);
			}
		}
	}
}

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
