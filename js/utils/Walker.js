import { threshold } from "./alphanumeric.js";

export default class Walker extends Array {

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

	hasPrevious() {
		return this.index > 0;
	}

	hasNext() {
		return this.index + 1 < this.length;
	}

}
