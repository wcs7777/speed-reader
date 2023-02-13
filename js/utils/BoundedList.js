import { threshold } from "./alphanumeric.js";

export default class BoundedList {

	/**
	 * @param {any[]} list
	 */
	constructor(list=[]) {
		this._list = list;
		this._index = -1;
	}

	/**
	 * @returns {any[]}
	 */
	get list() {
		return this._list;
	}

	/**
	 * @param {any[]} newList
	 */
	set list(newList) {
		this._index = -1;
		this._list = newList;
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
		this._index = threshold(-1, i, this._list.length - 1);
	}

	/**
	 * @returns {any}
	 */
	get current() {
		return this._list[this._index];
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
		return this._index < this._list.length - 1;
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
		return this._list.push(item);
	}

	clear() {
		this._list.length = 0;
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
