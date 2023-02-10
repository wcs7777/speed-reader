/**
 * @param {number} min
 * @param {number} value
 * @param {number} max
 * @returns {number}
 */
export function threshold(min, value, max) {
	return Math.max(min, Math.min(value, max));
}

/**
 * @param {string} kebab
 * @returns {string}
 */
export function kebab2camel(kebab) {
	return kebab.replaceAll(/-+(\w)/g, (_, p1) => p1.toUpperCase());
}

/**
 * @param {string} paragraph
 * @param {number} chunkLength
 * @returns {string[]}
 */
export function splitParagraphChunks(paragraph, chunkLength) {
	const chunks = [];
	const words = splitWords(paragraph);
	const totalWords = words.length;
	let i = 0;
	while (i < totalWords) {
		let chunk = '';
		while (i < totalWords && chunk.length < chunkLength) {
			chunk += words[i] + ' ';
			++i;
		}
		chunks.push(chunk);
	}
	return chunks;
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function splitParagraphs(text) {
	return text.split(/\n+/)
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph.length > 0);
}

/**
 * @param {string} paragraph
 * @returns {string[]}
 */
export function splitWords(paragraph) {
	return paragraph.split(/\s+/)
		.map((word) => word.trim())
		.filter((word) => word.length > 0);
}

/**
 * @param {number} chunkLength
 * @param {number} charactersPerSecond
 * @returns {number}
 */
export function chunkMilliseconds(chunkLength, charactersPerSecond) {
	return chunkLength / charactersPerSecond * 1000;
}
