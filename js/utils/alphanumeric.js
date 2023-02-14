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
 * @param {string[]} words
 * @param {number} chunkLength
 * @returns {string[][]}
 */
export function separateChunks(words, chunkLength) {
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
 * @param {number} chunkTextLength
 * @param {number} charactersPerSecond
 * @returns {number}
 */
export function chunkTextMs(chunkTextLength, charactersPerSecond) {
	return chunkTextLength / charactersPerSecond * 1000;
}

/**
 * @param {{ begin: number, end: number }[]} ranges
 * @param {number} value
 * @returns {number}
 */
export function findIndexInRanges(ranges, value) {
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
