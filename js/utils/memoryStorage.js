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

export default memoryStorage;
