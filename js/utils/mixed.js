export function toArray(value) {
	return Array.isArray(value) ? value : [value];
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function boolEqualsLoose(left, right) {
	const [a, b] = [left, right].map((x) => {
		return (
			x === "true" ? true :
			x === "false" ? false :
			x == true
		);
	});
	return a === b;
}
