import { threshold } from "./alphanumeric.js";

export default class BoundedList {

	constructor(list=[]) {
		this._list = list;
		this._index = -1;
	}

	get list() {
		return this._list;
	}

	set list(newList) {
		this._index = -1;
		this._list = newList;
	}

	get index() {
		return this._index;
	}

	set index(i) {
		this._index = threshold(0, i, this._list.length);
	}

	get hasNext() {
		return this._index < this._list.length - 1;
	}

	get hasPrevious() {
		return this.index > 0;
	}

	get current() {
		return this._list[this._index];
	}

	add(item) {
		return this._list.push(item);
	}

	clear() {
		this._list.length = 0;
		this._index = -1;
	}

	next() {
		this.index = this.index + 1;
		return this.current;
	}

	previous() {
		this.index = this.index - 1;
		return this.current;
	}
}
