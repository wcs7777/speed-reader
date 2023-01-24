export function byId(elementId) {
	return document.getElementById(elementId);
}

export function $(selectors, parent=document) {
	return parent.querySelector(selectors);
}

export function $$(selectors, parent=document) {
	return Array.from(parent.querySelectorAll(selectors));
}

export function appendChildren(parent, children) {
	for (const child of toArray(children)) {
		parent.appendChild(child);
	}
}

export function toArray(value) {
	return Array.isArray(value) ? value : [value];
}

export function threshold(min, value, max) {
	return Math.max(min, Math.min(value, max));
}

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

export function splitParagraphs(text) {
	return text.split(/\n+/)
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph.length > 0);
}

export function splitWords(paragraph) {
	return paragraph.split(/\s+/)
		.map((word) => word.trim())
		.filter((word) => word.length > 0);
}

export function chunkMilliseconds(chunkLength, charactersPerSecond) {
	console.log("chunkLength", chunkLength);
	console.log("charactersPerSecond", charactersPerSecond);
	return chunkLength / charactersPerSecond * 1000;
}

export function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
