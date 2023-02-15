import { threshold } from "./alphanumeric.js";

export default class BoundedList {

	/**
	 * @param {any[]} items
	 */
	constructor(items=[]) {
		this._items = items;
		this._index = -1;
	}

	/**
	 * @returns {any[]}
	 */
	get items() {
		return this._items;
	}

	/**
	 * @param {any[]} newItems
	 */
	set items(newItems) {
		this._index = -1;
		this._items = newItems;
	}

	/**
	 * @returns {number}
	 */
	get index() {
		return this._index;
	}

	/**
	 * @param {number} i
	 */
	set index(i) {
		this._index = threshold(-1, i, this.length - 1);
	}

	/**
	 * @returns {any}
	 */
	get current() {
		return this._items[this._index];
	}

	/**
	 * @returns {number}
	 */
	get length() {
		return this._items.length;
	}

	/**
	 * @param {number} newLength
	 */
	set length(newLength) {
		this._items.length = newLength;
	}

	/**
	 * @returns {boolean}
	 */
	isBeforeFirst() {
		return this.index < 0;
	}

	/**
	 * @returns {boolean}
	 */
	hasNext() {
		return this._index < this.length - 1;
	}

	/**
	 * @returns {boolean}
	 */
	hasPrevious() {
		return this.index > 0;
	}

	/**
	 * @param {any} item
	 */
	add(item) {
		return this._items.push(item);
	}

	clear() {
		this.length = 0;
		this._index = -1;
	}

	/**
	 * @returns {any}
	 */
	next() {
		this.index = this.index + 1;
		return this.current;
	}

	/**
	 * @returns {any}
	 */
	previous() {
		this.index = this.index - 1;
		return this.current;
	}

	rewind() {
		this.index = -1;
	}
}
