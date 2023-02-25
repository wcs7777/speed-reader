import { toArray } from "./mixed.js";

export class EventsManager {

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

export function createOnKeydown({
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
			};
			listener(e);
		}
	};
}
