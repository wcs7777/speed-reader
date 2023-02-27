(function () {
	'use strict';

	/**
	 * @param {number} min
	 * @param {number} value
	 * @param {number} max
	 * @returns {number}
	 */
	function threshold(min, value, max) {
		return Math.max(min, Math.min(value, max));
	}

	/**
	 * @param {string} kebab
	 * @returns {string}
	 */
	function kebab2camel(kebab) {
		return kebab.replaceAll(/-+(\w)/g, (_, p1) => p1.toUpperCase());
	}

	/**
	 * @param {string} camel
	 * @returns {string}
	 */
	function camel2kebab(camel) {
		return camel
			.replaceAll(/(?<!^)([A-Z])/g, (_, p1) => "-" + p1)
			.toLowerCase();
	}

	/**
	 * @param {string[]} words
	 * @param {number} chunkLength
	 * @returns {string[][]}
	 */
	function separateChunks(words, chunkLength) {
		const chunks = [];
		const totalWords = words.length;
		let i = 0;
		while (i < totalWords) {
			const currentChunk = [];
			let chunkText = '';
			while (i < totalWords && chunkText.length < chunkLength) {
				chunkText += words[i] + ' ';
				currentChunk.push(words[i]);
				++i;
			}
			chunks.push(currentChunk);
		}
		return chunks;
	}

	/**
	 * @param {string} text
	 * @returns {string[]}
	 */
	function splitParagraphs(text) {
		return text.split(/\n+/)
			.map((paragraph) => paragraph.trim())
			.filter((paragraph) => paragraph.length > 0);
	}

	/**
	 * @param {string} paragraph
	 * @returns {string[]}
	 */
	function splitWords(paragraph) {
		return paragraph.split(/\s+/)
			.map((word) => word.trim())
			.filter((word) => word.length > 0);
	}

	/**
	 * @param {number} chunkTextLength
	 * @param {number} charactersPerSecond
	 * @returns {number}
	 */
	function chunkTextMs(chunkTextLength, charactersPerSecond) {
		return chunkTextLength / charactersPerSecond * 1000;
	}

	/**
	 * @param {{ begin: number, end: number }[]} ranges
	 * @param {number} value
	 * @returns {number}
	 */
	function findIndexInRanges(ranges, value) {
		let begin = 0;
		let end = ranges.length - 1;
		while (begin <= end) {
			const middle = parseInt((begin + end) / 2);
			if (value > ranges[middle].end) {
				begin = middle + 1;
			} else if (value < ranges[middle].begin) {
				end = middle - 1;
			} else {
				return middle;
			}
		}
		return -1;
	}

	/**
	 * @param {any|any[]} value
	 * @returns {any[]}
	 */
	function toArray(value) {
		return Array.isArray(value) ? value : [value];
	}

	/**
	 * @param {number} ms
	 * @returns {Promise<void>}
	 */
	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * @param {any} left
	 * @param {any} right
	 * @returns {boolean}
	 */
	function boolEqualsLoose(left, right) {
		const [a, b] = [left, right].map((x) => {
			return (
				x === "true" ? true :
				x === "false" ? false :
				x == true
			);
		});
		return a === b;
	}

	/**
	 * @param {string} elementId
	 * @returns {HTMLElement}
	 */
	function byId(elementId) {
		return document.getElementById(elementId);
	}

	/**
	 * @param {string} selectors
	 * @param {Element} parent
	 * @returns {Element}
	 */
	function $(selectors, parent=document) {
		return parent.querySelector(selectors);
	}

	/**
	 * @param {string} selectors
	 * @param {Element} parent
	 * @returns {Element[]}
	 */
	function $$(selectors, parent=document) {
		return Array.from(parent.querySelectorAll(selectors));
	}

	/**
	 * @param {HTMLFormElement} form
	 * @returns {object}
	 */
	function form2object(form) {
		const obj = {};
		const radios = new Set();
		for (const control of form.elements) {
			const key = kebab2camel(control.id ?? control.name ?? "");
			switch (control.type) {
				case "radio":
					if (control.name?.length > 0) {
						radios.add(control.name);
					}
					break;
				case "checkbox":
					obj[key] = control.checked;
					break;
				case "select-multiple":
					obj[key] = $$("option", control)
						.filter((option) => option.selected)
						.map((option) => option.value);
					break;
				default:
					obj[key] = control.value;
					break;
			}
		}
		for (const name of radios.values()) {
			obj[kebab2camel(name)] = $$(
				`input[type="radio"][name="${name}"]`, form
			)
				.find((radio) => radio.checked)?.value;
		}
		return obj;
	}

	/**
	 * @param {HTMLFormElement} form
	 * @param {object} obj
	 * @returns {HTMLFormElement}
	 */
	function populateForm(form, obj) {
		for (const control of form.elements) {
			const key = kebab2camel(control.id ?? control.name ?? "");
			switch (control.type) {
				case "radio":
					if (control.value === obj[key]) {
						control.checked = true;
					}
					break;
				case "checkbox":
					control.checked = obj[key];
					break;
				case "select-multiple":
					for (const option of obj[key]) {
						$(`option[value="${option}"`, control).selected = true;
					}
					break;
				default:
					control.value = obj[key];
					break;
			}
		}
		return form;
	}

	/**
	 * @param {object} values
	 * @param {object} fallback
	 * @param {string[]} keys
	 * @param {string} property
	 * @returns {object}
	 */
	function validateCssProperties(values, fallback, keys, property) {
		const obj = {};
		const prop = property ?? camel2kebab(keys);
		for (const key of toArray(keys)) {
			obj[key] = (
				CSS.supports(prop, values[key]) ? values[key] : fallback[key]
			);
		}
		return obj;
	}

	/**
	 * @returns {HTMLElement}
	 */
	function tag({
		tagName,
		is,
		id,
		className,
		attributes,
		listeners,
		cssText,
		textContent,
		children,
	}={}) {
		const element = document.createElement(tagName, { is });
		if (is) {
			element.setAttribute("is", is);
		}
		if (id) {
			element.id = id;
		}
		if (className) {
			element.className = className;
		}
		if (attributes) {
			for (const [ name, value ] of Object.entries(attributes)) {
				element.setAttribute(name, value);
			}
		}
		if (listeners) {
			for (const { type, listener } of toArray(listeners)) {
				element.addEventListener(type, listener);
			}
		}
		if (cssText) {
			element.style.cssText = cssText;
		}
		if (textContent) {
			element.appendChild(document.createTextNode(textContent));
		}
		if (children) {
			element.append(...toArray(children));
		}
		return element;
	}

	/**
	 * @param {string} innerHtml
	 * @returns {HTMLTemplateElement}
	 */
	function createTemplate(innerHtml) {
		const template = document.createElement("template");
		template.innerHTML = innerHtml;
		return template;
	}

	/**
	 * @param {HTMLTemplateElement} template
	 * @returns {Node}
	 */
	function templateContent(template) {
		return document.importNode(template.content, true);
	}

	/**
	 * @param {Node} parent
	 */
	function removeAllChildren(parent) {
		while (parent.lastChild) {
			parent.lastChild.remove();
		}
	}

	let items = {};

	const memoryStorage = {

		clear() {
			items = {};
		},

		/**
		 * @param {string} keyName
		 * @returns {string?}
		 */
		getItem(keyName) {
			return items[keyName];
		},

		/**
		 * @param {number} index
		 * @returns {string?}
		 */
		key(index) {
			return Object.keys(items)[index];
		},

		/**
		 * @param {string} keyName
		 */
		removeItem(keyName) {
			delete items[keyName];
		},

		/**
		 * @param {string} keyName
		 * @param {string} keyValue
		 */
		setItem(keyName, keyValue) {
			items[keyName] = keyValue;
		},

		/**
		 * @returns {number}
		 */
		get length() {
			return Object.keys(items).length;
		},

	};

	const attrs$3 = {
		name: "data-custom-modal",
		opener: "data-custom-modal-opener",
		closer: "data-custom-modal-closer",
	};

	class CustomModal extends HTMLDialogElement {

		constructor() {
			super();
			this._isModalOpen = false;
			this.classList.add("modal");
		}

		connectedCallback() {
			this.setup();
		}

		setup() {
			const open = this.open.bind(this);
			const close = this.close.bind(this);
			for (const opener of $$(`[${attrs$3.opener}="${this.name}"]`)) {
				opener.addEventListener('click', open);
			}
			for (const closer of $$(`[${attrs$3.closer}="${this.name}"]`)) {
				closer.addEventListener('click', close);
			}
			this.addEventListener("click", (e) => {
				if (this.isModalOpen && e.target === e.currentTarget) {
					this.close();
				}
			});
		}

		static get attrs() {
			return attrs$3;
		}

		get name() {
			return this.getAttribute(attrs$3.name);
		}

		/**
		 * @returns {boolean}
		 */
		get isModalOpen() {
			return this._isModalOpen;
		}

		/**
		 * @param {boolean} open
		 */
		set isModalOpen(open) {
			if (open != this.isModalOpen) {
				open ? this.open() : this.close();
			}
		}

		open() {
			this.showModal();
			this._isModalOpen = true;
			this.dispatchEvent(new CustomEvent("modal-opened"));
		}

		close() {
			super.close();
			this._isModalOpen = false;
			this.dispatchEvent(new CustomEvent("modal-closed"));
		}

	}

	customElements.define("custom-modal", CustomModal, { extends: "dialog" });

	const defaultSettings = {
		wordsPerMinute: 300,
		wordsPerChunk: 6,
		slightPause: true,
		textBackgroundColor: "#FFFFFF",
		textColor: "#B3B3B3",
		highlightBackgroundColor: "#FFFFFF",
		highlightColor: "#000000",
		fontSize: "20px",
		lineHeight: 1.5,
		fontFamily: "sans-serif",
		textAlign: "left",
		uiBackgroundColor: "#F3F3F3",
		uiTextColor: "#000000",
	};

	class Walker extends Array {

		constructor(...args) {
			super(...args);
			this._index = -1;
			this.indexChangeCallback = null;
		}

		/**
		 * @param {(
		 * 	oldCurrent: { index: number; value: any; },
		 * 	newCurrent: { index: number; value: any; },
		 * ) => void} indexChangeCallback
		 * @returns {Walker}
		 */
		static fromWithIndexChangeCallback(
			indexChangeCallback, arrayLike, mapFn, thisArg
		) {
			const walker = Walker.from(arrayLike, mapFn, thisArg);
			walker.indexChangeCallback = indexChangeCallback;
			return walker;
		}

		/**
		 * @param {(
		 * 	oldCurrent: { index: number; value: any; },
		 * 	newCurrent: { index: number; value: any; },
		 * ) => void} indexChangeCallback
		 * @returns {Walker}
		 */
		static ofWithIndexChangeCallback(indexChangeCallback, ...items) {
			const walker = Walker.of(items);
			walker.indexChangeCallback = indexChangeCallback;
			return walker;
		}

		get index() {
			return this._index;
		}

		set index(index) {
			const i = parseInt(index);
			if (this.index !== i) {
				const oldIndex = this.index;
				const oldValue = this.current;
				this._index = threshold(-1, i, this.length);
				this.indexChangeCallback?.(
					{ index: oldIndex, value: oldValue },
					{ index: this.index, value: this.current },
				);
			}
		}

		get current() {
			return this[this.index];
		}

		/**
		 * @param {number} index
		 */
		toIndex(index) {
			this.index = index;
			return this.current;
		}

		toFirst() {
			return this.toIndex(0);
		}

		toLast() {
			return this.toIndex(this.length - 1);
		}

		next() {
			return this.toIndex(this.index + 1);
		}

		previous() {
			return this.toIndex(this.index - 1);
		}

		rewind() {
			this.index = -1;
		}

		*traverseForward() {
			for (
				let item = this.toFirst();
				!this.isAfterLast();
				item = this.next()
			) {
				yield item;
			}
			this.rewind();
		}

		*traverseBackward() {
			for (
				let item = this.toLast();
				!this.isBeforeFirst();
				item = this.previous()
			) {
				yield item;
			}
			this.rewind();
		}

		isBeforeFirst() {
			return this.index < 0;
		}

		isAfterLast() {
			return !(this.index < this.length);
		}

		isInRange() {
			return !this.isBeforeFirst() && !this.isAfterLast();
		}

		hasPrevious() {
			return this.index > 0;
		}

		hasNext() {
			return this.index + 1 < this.length;
		}

	}

	const attrs$2 = {
		isHighlighted: "data-is-highlighted",
	};
	const cssVariables$2 = {
		highlightBackgroundColor: "--chunk-text-highlight-background-color",
		highlightColor: "--chunk-text-highlight-color",
	};
	const template$2 = createTemplate(`
<style>
	:host(.is-highlighted) {
		background-color: var(
			${cssVariables$2.highlightBackgroundColor},
			${defaultSettings.highlightBackgroundColor}
		);
		color: var(
			${cssVariables$2.highlightColor},
			${defaultSettings.highlightColor}
		);
	}
</style>
<slot></slot>
`);

	class ChunkText extends HTMLSpanElement {

		constructor() {
			super();
			this.attachShadow({ mode: "open" }).appendChild(
				templateContent(template$2),
			);
			this.isHighlighted = this.isHighlighted ?? false;
		}

		connectedCallback() {
			this.text = this.text ?? "";
			this.toggleIsHighlighted(this.isHighlighted);
		}

		static get attrs() {
			return attrs$2;
		}

		static get cssVariables() {
			return cssVariables$2;
		}

		static get observedAttributes() {
			return Object.values(attrs$2);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (name === attrs$2.isHighlighted && oldValue != newValue) {
				this.isHighlighted = newValue;
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
			return boolEqualsLoose(true, this.getAttribute(attrs$2.isHighlighted));
		}

		/**
		 * @param {string|boolean} highlighted
		 */
		set isHighlighted(highlighted) {
			this.toggleIsHighlighted(highlighted);
		}

		toggleIsHighlighted(force) {
			const highlighted = force ?? !this.isHighlighted;
			if (!boolEqualsLoose(highlighted, this.isHighlighted)) {
				this.setAttribute(attrs$2.isHighlighted, highlighted);
			}
			this.classList.toggle("is-highlighted", highlighted);
		}

	}

	/**
	 * @param {string} text
	 * @param {boolean} isHighlighted
	 * @returns {ChunkText}
	 */
	function buildChunkText(text, isHighlighted) {
		return tag({
			tagName: "span",
			is: "chunk-text",
			textContent: text,
			attributes: {
				[attrs$2.isHighlighted]: isHighlighted,
			},
		});
	}

	customElements.define("chunk-text", ChunkText, { extends: "span" });

	const attrs$1 = {
		chunkTextIndex: "data-chunk-text-index",
	};
	const cssVariables$1 = {
		margin: "--paragraph-speed-reader-margin",
	};
	const template$1 = createTemplate(`
<style>
	:host {
		margin: var(${cssVariables$1.margin}, 10px 0);
	}
</style>
<slot></slot>
`);

	class ParagraphSpeedReader extends HTMLParagraphElement {

		constructor() {
			super();
			this.attachShadow({ mode: "open" }).appendChild(
				templateContent(template$1),
			);
			this._chunkTexts = Walker.fromWithIndexChangeCallback(
				this.chunkTextIndexChangeCallback.bind(this), []
			);
		}

		connectedCallback() {
			this.chunkTexts = $$("[is=chunk-text]", this);
		}

		static get attrs() {
			return attrs$1;
		}

		static get cssVariables() {
			return cssVariables$1;
		}

		static get observedAttributes() {
			return Object.values(attrs$1);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (name === attrs$1.chunkTextIndex && oldValue != newValue) {
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
				attrs$1.chunkTextIndex, newCurrent.index
			);
		}

		assureIntoViewport() {
			this.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "nearest",
			});
		}

		alignChunkTextToTop() {
			this.chunkText.scrollIntoView({
				behavior: "smooth",
				block: "start",
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
		 * @returns {number}
		 */
		get chunkTextLength() {
			return this.chunkText.text.length;
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
	function buildParagraphSpeedReader(chunkTexts) {
		return tag({
			tagName: "p",
			is: "paragraph-speed-reader",
			attributes: {
				[attrs$1.chunkTextIndex]: -1,
			},
			children: chunkTexts,
		});
	}

	customElements.define(
		"paragraph-speed-reader", ParagraphSpeedReader, { extends: "p" }
	);

	const averageWordSize = 5.7;
	const attrs = {
		isPaused: "data-is-paused",
		paragraphIndex: "data-paragraph-index",
	};
	const cssVariables = {
		highlightBackgroundColor: ChunkText.cssVariables.highlightBackgroundColor,
		highlightColor: ChunkText.cssVariables.highlightColor,
		textBackgroundColor: "--speed-reader-text-background-color",
		textColor: "--speed-reader-text-color",
		fontSize: "--speed-reader-font-size",
		lineHeight: "--speed-reader-line-height",
		fontFamily: "--speed-reader-font-family",
		textAlign: "--speed-reader-text-align",
	};
	const template = createTemplate(`
<style>
	:host {
		${cssVariables.highlightBackgroundColor}: ${defaultSettings.highlightBackgroundColor};
		${cssVariables.highlightColor}: ${defaultSettings.highlightColor};
		${cssVariables.textBackgroundColor}: ${defaultSettings.textBackgroundColor};
		${cssVariables.textColor}: ${defaultSettings.textColor};
		${cssVariables.fontSize}: ${defaultSettings.fontSize};
		${cssVariables.lineHeight}: ${defaultSettings.lineHeight};
		${cssVariables.fontFamily}: ${defaultSettings.fontFamily};
		${cssVariables.textAlign}: ${defaultSettings.textAlign};
		${ParagraphSpeedReader.cssVariables.margin}: 10px 0;

		box-shadow: -2px 1px 7px 2px rgba(0, 0, 0, 0.3);
		border-radius: var(--element-border-radius);
		width: 100%;
		height: fit-content;
	}
</style>
<slot></slot>
`);

	class SpeedReader extends HTMLDivElement {

		constructor() {
			super();
			this.attachShadow({ mode: "open" }).appendChild(
				templateContent(template),
			);
			this._paragraphs = Walker.fromWithIndexChangeCallback(
				this.attributeChangedCallback.bind(this), []
			);
			this.isPaused = this.isPaused ?? false;
			this.classList.add("speed-reader");
		}

		connectedCallback() {
			this.min = {
				wpm: byId("words-per-minute")?.min || 60,
				wpc: byId("words-per-chunk")?.min || 1,
			};
			this.max = {
				wpm: byId("words-per-minute")?.max || 6000,
				wpc: byId("words-per-chunk")?.max || 20,
			};
			this.settings = defaultSettings;
			this.text = this.textContent;
			if (!this.isPaused) {
				this.startReading().catch(console.error);
			}
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
			if (oldValue != newValue) {
				if (name === attrs.paragraphIndex) {
					this.currentParagraphIndex = newValue;
				} else if (name == attrs.isPaused) {
					this.isPaused = newValue;
				}
			}
		}

		/**
		 * @param {{ index: number; value: ParagraphSpeedReader }} oldCurrent
		 * @param {{ index: number; value: ParagraphSpeedReader }} newCurrent
		 */
		paragraphIndexChangeCallback(oldCurrent, newCurrent) {
			oldCurrent.value?.rewindChunkTexts();
			newCurrent.value?.assureIntoViewport();
			this.setAttribute(attrs.paragraphIndex, newCurrent.index);
		}

		async startReading() {
			try {
				let milliseconds;
				while ((milliseconds = this.nextMilliseconds()) > 0) {
					await sleep(milliseconds);
					while (this.isPaused) {
						await sleep(100);
					}
				}
				this.rewindParagraphs();
				this.isPaused = true;
			} catch (error) {
				console.error(error);
			}
		}

		/**
		 * @returns {number}
		 */
		nextMilliseconds() {
			let milliseconds = 0;
			if (!this.paragraph?.hasNextChunkText()) {
				this.nextParagraph();
				if (this.settings.slightPause) {
					milliseconds += 100;
				}
			}
			const length = this.paragraph?.nextChunkText()?.text.length;
			if (length !== undefined) {
				milliseconds += chunkTextMs(length, this.charactersPerSecond);
			} else {
				milliseconds = 0;
			}
			return milliseconds;
		}

		/**
		 * @returns {number}
		 */
		get wordsPerMinute() {
			return this.settings.wordsPerMinute;
		}

		/**
		 * @param {number} wpm
		 */
		set wordsPerMinute(wpm) {
			this.settings.wordsPerMinute = threshold(this.min.wpm, wpm, this.max.wpm);
			this.charactersPerSecond = (
				this.settings.wordsPerMinute / 60 * averageWordSize
			);
			this.dispatchEvent(
				new CustomEvent(
					"words-per-minute-changed",
					{ detail: { wordsPerMinute: this.wordsPerMinute } },
				),
			);
		}

		/**
		 * @returns {number}
		 */
		get totalWords() {
			return this.paragraphsRanges.at(-1)?.chunkTextsRanges.at(-1)?.end;
		}

		/**
		 * @returns {defaultSettings}
		 */
		get settings() {
			return this._settings;
		}

		/**
		 * @param {defaultSettings} newSettings
		 */
		set settings(newSettings) {
			this._settings = this.validateSettings(newSettings);
			this.wordsPerMinute = newSettings.wordsPerMinute || this.wordsPerMinute;
			for (const [key, property] of Object.entries(cssVariables)) {
				this.style.setProperty(property, this.settings[key]);
			}
			const oldChunkTextLength = this.chunkTextLength;
			this.chunkTextLength = this.settings.wordsPerChunk * averageWordSize;
			if (oldChunkTextLength !== this.chunkTextLength && this.text) {
				const isPaused = this.isPaused;
				this.isPaused = true;
				const oldWordOffset = this.wordOffset;
				// rebuild paragraphs and chunkTexts
				this.text = this.text;
				this.wordOffset = oldWordOffset;
				this.isPaused = isPaused;
			}
		}

		/**
		 * @returns {string}
		 */
		get text() {
			return this._text;
		}

		/**
		 * @param {string} newText
		 */
		set text(newText) {
			let offset = 0;
			this.paragraphsRanges = [];
			this.textContent = "";
			this._text = newText;
			this.paragraphs = splitParagraphs(this.text)
				.map((paragraphText) => {
					const chunkTextsRanges = [];
					const paragraph = buildParagraphSpeedReader(
						separateChunks(splitWords(paragraphText), this.chunkTextLength)
							.map((chunk) => {
								++offset;
								const begin = offset;
								offset += chunk.length - 1;
								chunkTextsRanges.push({ begin, end: offset });
								return buildChunkText(chunk.join(" "), false);
							}),
					);
					this.paragraphsRanges.push({
						begin: chunkTextsRanges.at(0)?.begin,
						end: chunkTextsRanges.at(-1)?.end,
						chunkTextsRanges,
					});
					return paragraph;
				});
		}

		/**
		 * @returns {boolean}
		 */
		get isPaused() {
			return boolEqualsLoose(true, this.getAttribute(attrs.isPaused));
		}

		/**
		 * @param {boolean} paused
		 */
		set isPaused(paused) {
			if (!boolEqualsLoose(this._isPaused, paused)) {
				this._isPaused = paused;
				this.setAttribute(attrs.isPaused, paused);
				if (!this.isPaused && !this.isParagraphInRange()) {
					this.startReading().catch(console.error);
				}
				this.dispatchEvent(
					new CustomEvent(
						"speed-reader-paused",
						{ detail: { paused: this.isPaused } },
					),
				);
			}
		}

		/**
		 * @returns {number}
		 */
		get wordOffset() {
			const defaultOffset = 1;
			if (!this.isParagraphInRange()) {
				return defaultOffset;
			}
			const chunkText = (
				this.paragraph.isChunkTextInRange() ?
				this.paragraph.chunkTextIndex : 0
			);
			return this.paragraphsRanges
				.at(this.currentParagraphIndex)
				.chunkTextsRanges.at(chunkText).begin ?? defaultOffset;
		}

		/**
		 * @param {number} offset
		 */
		set wordOffset(offset) {
			const paragraph = findIndexInRanges(this.paragraphsRanges, offset);
			if (paragraph > -1) {
				const chunkText = findIndexInRanges(
					this.paragraphsRanges.at(paragraph).chunkTextsRanges, offset
				);
				this.paragraphIndex = paragraph;
				this.paragraph.chunkTextIndex = chunkText;
			}
		}

		/**
		 * @returns {ParagraphSpeedReader[]}
		 */
		get paragraphs() {
			return this._paragraphs;
		}

		/**
		 * @param {ParagraphSpeedReader[]} newParagraphs
		 */
		set paragraphs(newParagraphs) {
			removeAllChildren(this);
			this._paragraphs = Walker.fromWithIndexChangeCallback(
				this.paragraphIndexChangeCallback.bind(this),
				newParagraphs,
			);
			this.appendChild(tag({ tagName: "span", children: newParagraphs }));
		}

		get paragraphIndex() {
			return this._paragraphs.index;
		}

		set paragraphIndex(index) {
			this._paragraphs.index = index;
		}

		/**
		 * @returns {ParagraphSpeedReader}
		 */
		get paragraph() {
			return this._paragraphs.current;
		}

		/**
		 * @param {number} index
		 * @returns {ParagraphSpeedReader}
		 */
		toParagraphIndex(index) {
			this._paragraphs.toIndex(index);
		}

		/**
		 * @returns {ParagraphSpeedReader}
		 */
		toFirstParagraph() {
			return this._paragraphs.toFirst();
		}

		/**
		 * @returns {ParagraphSpeedReader}
		 */
		toLastParagraph() {
			return this._paragraphs.toLast();
		}

		/**
		 * @returns {ParagraphSpeedReader}
		 */
		nextParagraph() {
			return this._paragraphs.next();
		}

		/**
		 * @returns {ParagraphSpeedReader}
		 */
		previousParagraph() {
			return this._paragraphs.previous();
		}

		rewindParagraphs() {
			for (const paragraph of this.paragraphs) {
				paragraph.rewindChunkTexts();
			}
			this._paragraphs.rewind();
		}

		/**
		 * @returns {ChunkText}
		 */
		toNextChunkText() {
			if (!this.paragraph?.hasNextChunkText()) {
				return this.nextParagraph()?.toFirstChunkText();
			} else {
				return this.paragraph?.nextChunkText();
			}
		}

		/**
		 * @returns {ChunkText}
		 */
		toPreviousChunkText() {
			if (!this.paragraph?.hasPreviousChunkText()) {
				return this.previousParagraph()?.toLastChunkText();
			} else {
				return this.paragraph?.previousChunkText();
			}
		}

		/**
		 * @returns {Generator<ParagraphSpeedReader, void, undefined>}
		 */
		*traverseParagraphsForward() {
			yield* this._paragraphs.traverseForward();
		}

		/**
		 * @returns {Generator<ParagraphSpeedReader, void, undefined>}
		 */
		*traverseParagraphsBackward() {
			yield* this._paragraphs.traverseForward();
		}

		isParagraphBeforeFirst() {
			return this._paragraphs.isBeforeFirst();
		}

		isParagraphAfterLast() {
			return this._paragraphs.isAfterLast();
		}

		isParagraphInRange() {
			return this._paragraphs.isInRange();
		}

		hasPreviousParagraph() {
			return this._paragraphs.hasPrevious();
		}

		hasNextParagraph() {
			return this._paragraphs.hasNext();
		}

		validateSettings(settings) {
			const currentSettings = this.settings;
			return {
				...currentSettings,
				...settings,
				wordsPerChunk: threshold(
					this.min.wpc,
					settings.wordsPerChunk || currentSettings.wordsPerChunk,
					this.max.wpc,
				),
				...validateCssProperties(
					settings,
					currentSettings,
					["textBackgroundColor", "highlightBackgroundColor"],
					"background-color",
				),
				...validateCssProperties(
					settings,
					currentSettings,
					["textColor", "highlightColor"],
					"color",
				),
				...validateCssProperties(settings, currentSettings, "fontSize"),
				...validateCssProperties(settings, currentSettings, "lineHeight"),
				...validateCssProperties(settings, currentSettings, "fontFamily"),
				...validateCssProperties(settings, currentSettings, "textAlign"),
			};
		}

	}

	customElements.define("speed-reader", SpeedReader, { extends: "div" });

	/**
	 * @returns {SpeedReader}
	 */
	function getSpeedReader() {
		return byId("speed-reader");
	}

	/**
	 * @returns {CustomModal[]}
	 */
	function getCustomModals() {
		return $$('[is=custom-modal]');
	}

	/**
	 * @param {SpeedReader} speedReader
	 * @param {HTMLElement} ui
	 * @param {localStorage|memoryStorage} storage
	 * @param {defaultSettings} defaultSettings
	 */
	function initializeSettings(
		speedReader, ui, storage, defaultSettings
	) {
		const settings = (
			JSON.parse(storage.getItem("settings")) ?? defaultSettings
		);
		speedReader.settings = settings;
		setUiStyles(ui, settings);
	}

	/**
	 * @param {HTMLElement} ui
	 * @returns {{uiBackgroundColor: string; uiTextColor: string}}
	 */
	function getUiStyles(ui) {
		const style = getComputedStyle(ui);
		return {
			uiBackgroundColor: style.getPropertyValue("--ui-background-color"),
			uiTextColor: style.getPropertyValue("--ui-text-color"),
		};
	}

	/**
	 * @param {HTMLElement} ui
	 * @param {{uiBackgroundColor: string; uiTextColor: string}} settings
	 */
	function setUiStyles(ui, settings) {
		for (const property of ["ui-background-color", "ui-text-color"]) {
			ui.style.setProperty(`--${property}`, settings[kebab2camel(property)]);
		}
	}

	class EventsManager {

		constructor({ target, type, listeners, on }) {
			this.target = target;
			this.type = type;
			this._state = false;
			this.listeners = toArray(listeners);
			if (on) {
				this.on();
			}
		}

		/**
		 * @returns {boolean}
		 */
		get state() {
			return this._state;
		}

		/**
		 * @param {boolean} newState
		 */
		set state(newState) {
			if (typeof newState === "boolean" && newState !== this.state) {
				if (newState) {
					for (const listener of this.listeners) {
						this.target.addEventListener(this.type, listener);
					}
				} else {
					for (const listener of this.listeners) {
						this.target.removeEventListener(this.type, listener);
					}
				}
				this._state = newState;
			}
		}

		add(listeners) {
			for (const listener of toArray(listeners)) {
				if (!this.listeners.includes(listener)) {
					this.listeners.push(listener);
					if (this.state) {
						this.target.addEventListener(this.type, listener);
					}
				}
			}
		}

		remove(listeners) {
			const arr = toArray(listeners);
			this.listeners = this.listeners.filter((listener) => {
				const includes = arr.includes(listener);
				if (includes && this.state) {
					this.target.removeEventListener(this.type, listener);
				}
				return !includes;
			});
		}

		toggle() {
			this.state ? this.off() : this.on();
		}

		on() {
			this.state = true;
		}

		off() {
			this.state = false;
		}

	}

	function createOnKeydown({
		keys,
		caseSensitive=true,
		ctrlKey=false,
		altKey=false,
		shiftKey=false,
		preventDefault=true,
		listener,
	}={}) {
		const onKeys = (
			caseSensitive ?
			toArray(keys) :
			toArray(keys).map((key) => key.toLowerCase())
		);
		return (e) => {
			if (
				onKeys.includes(caseSensitive ? e.key : e.key.toLowerCase()) &&
				e.ctrlKey === ctrlKey &&
				e.altKey === altKey &&
				e.shiftKey === shiftKey &&
				true
			) {
				if (preventDefault) {
					e.preventDefault();
				}			listener(e);
			}
		};
	}

	const wpmChangeRate = 10;

	/**
	 * @param {SpeedReader} speedReader
	 * @param {HTMLButtonElement} openNewText
	 * @param {HTMLButtonElement} openSettings
	 * @param {HTMLButtonElement} toggleControls
	 * @returns {EventsManager}
	 */
	function createshortcutsEventsManager(
		speedReader, openNewText, openSettings, toggleControls
	) {
		return new EventsManager({
			target: document,
			type: "keydown",
			listeners: [
				createOnKeydown({
					keys: ["ArrowLeft", "h"],
					caseSensitive: false,
					listener: () => speedReader.toPreviousChunkText(),
				}),
				createOnKeydown({
					keys: ["ArrowRight", "l"],
					caseSensitive: false,
					listener: () => speedReader.toNextChunkText(),
				}),
				createOnKeydown({
					keys: [" ", "k"],
					caseSensitive: false,
					listener: () => speedReader.isPaused = !speedReader.isPaused,
				}),
				createOnKeydown({
					keys: ["ArrowUp", "="],
					listener: () => speedReader.wordsPerMinute += wpmChangeRate,
				}),
				createOnKeydown({
					keys: ["ArrowDown", "-"],
					listener: () => speedReader.wordsPerMinute -= wpmChangeRate,
				}),
				createOnKeydown({
					keys: "r",
					caseSensitive: false,
					listener: () => speedReader.rewindParagraphs(),
				}),
				createOnKeydown({
					keys: "t",
					caseSensitive: false,
					listener: () => speedReader.paragraph.alignChunkTextToTop(),
				}),
				createOnKeydown({
					keys: "n",
					caseSensitive: false,
					listener: () => openNewText.click(),
				}),
				createOnKeydown({
					keys: "s",
					caseSensitive: false,
					listener: () => openSettings.click(),
				}),
				createOnKeydown({
					keys: "c",
					caseSensitive: false,
					listener: () => toggleControls.click(),
				}),
			],
			on: true,
		});
	}

	function storageAvailable(type) {
		let storage;
		try {
			storage = window[type];
			const x = "__storage_test__";
			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		} catch (e) {
			return e instanceof DOMException && (
				e.code === 22 ||
				e.code === 1014 ||
				e.name === "QuotaExceededError" ||
				e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
				storage?.length !== 0
		}
	}

	const storage = (
		storageAvailable("localStorage") ? localStorage : memoryStorage
	);
	const ui = $(".content");
	const speedReader = getSpeedReader();
	const read = byId("read");
	const text = byId("text");
	const settingsForm = byId("settings");
	const openNewText = byId("open-new-text");
	const openSettings = byId("open-settings");
	const toggleControls = byId("toggle-controls");
	const totalWords = byId("total-words");
	const currentWpm = byId("current-wpm");
	const shortcuts = createshortcutsEventsManager(
		speedReader, openNewText, openSettings, toggleControls
	);
	initializeSettings(speedReader, ui, storage, defaultSettings);
	totalWords.textContent = speedReader.totalWords ?? 0;
	currentWpm.textContent = speedReader.wordsPerMinute;
	read.addEventListener("click", () => {
		const toggle = !speedReader.isPaused;
		speedReader.isPaused = toggle;
		read.blur();
	});
	speedReader.addEventListener("speed-reader-paused", (e) => {
		read.textContent = e.detail.paused ? "Read" : "Pause";
	});
	speedReader.addEventListener("words-per-minute-changed", (e) => {
		currentWpm.textContent = e.detail.wordsPerMinute;
	});
	for (const modal of getCustomModals()) {
		let isPaused = true;
		modal.addEventListener("modal-opened", () => {
			isPaused = speedReader.isPaused;
			speedReader.isPaused = true;
			shortcuts.off();
		});
		modal.addEventListener("modal-closed", () => {
			speedReader.isPaused = isPaused;
			shortcuts.on();
		});
	}
	byId("clear-text").addEventListener("click", (e) => {
		e.preventDefault();
		text.value = "";
		text.focus();
	});
	byId("paste-text").addEventListener("click", async (e) => {
		try {
			e.preventDefault();
			if (navigator?.clipboard?.readText) {
				text.value = await navigator.clipboard.readText();
				text.focus();
			}
		} catch (error) {
			console.error(error);
		}
	});
	byId("new-text").addEventListener("submit", (e) => {
		e.preventDefault();
		if (text.value.trim().length > 0) {
			speedReader.text = text.value;
			totalWords.textContent = speedReader.totalWords;
		}
	});
	byId("reset").addEventListener("click", (e) => {
		e.preventDefault();
		speedReader.rewindParagraphs();
	});
	openSettings.addEventListener("click", () => {
		populateForm(
			settingsForm,
			{
				...speedReader.settings,
				...getUiStyles(ui),
			},
		);
	});
	settingsForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const settings = form2object(e.target);
		speedReader.settings = settings;
		setUiStyles(ui, settings);
		storage.setItem("settings", JSON.stringify(settings));
	});

})();
