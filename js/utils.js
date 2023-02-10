/**
 * @param {string} elementId
 * @returns {HTMLElement}
 */
export function byId(elementId) {
	return document.getElementById(elementId);
}

/**
 * @param {string} selectors
 * @param {Element} parent
 * @returns {Element}
 */
export function $(selectors, parent=document) {
	return parent.querySelector(selectors);
}

/**
 * @param {string} selectors
 * @param {Element} parent
 * @returns {Element[]}
 */
export function $$(selectors, parent=document) {
	return Array.from(parent.querySelectorAll(selectors));
}

/**
 * @param {HTMLFormElement} form
 * @returns {object}
 */
export function form2object(form) {
	const obj = {};
	const radios = new Set();
	for (const control of form.elements) {
		console.log(`type: ${control.type}`);
		const key = kebab2camel(control.id ?? control.name ?? "");
		switch (control.type) {
			case "radio":
				if (control.name?.length > 0) {
					radios.add(control.name);
				}
				break;
			case "checkbox":
				obj[key] = control.checked;
				break;
			case "select-multiple":
				obj[key] = $$("option", control)
					.filter((option) => option.selected)
					.map((option) => option.value);
				break;
			default:
				obj[key] = control.value;
				break;
		}
	}
	for (const name of radios.values()) {
		obj[kebab2camel(name)] = $$(
			`input[type="radio"][name="${name}"]`, form
		)
			.find((radio) => radio.checked)?.value;
	}
	return obj;
}

/**
 * @returns {HTMLElement}
 */
export function tag({
	tagName,
	is,
	id,
	className,
	attributes,
	listeners,
	cssText,
	textContent,
	children,
}={}) {
	const element = document.createElement(tagName, { is });
	if (id) {
		element.id = id;
	}
	if (className) {
		element.className = className;
	}
	if (attributes) {
		for (const [ name, value ] of Object.entries(attributes)) {
			element.setAttribute(name, value);
		}
	}
	if (listeners) {
		for (const { type, listener } of toArray(listeners)) {
			element.addEventListener(type, listener);
		}
	}
	if (cssText) {
		element.style.cssText = cssText;
	}
	if (textContent) {
		element.appendChild(document.createTextNode(textContent));
	}
	if (children) {
		for (const child of children) {
			element.appendChild(child);
		}
	}
	return element;
}

/**
 * @param {string} cssText
 * @returns {HTMLStyleElement}
 */
export function internalStyle(cssText) {
	return tag({ tagName: "style", textContent: cssText });
}

/**
 * @param {string} path
 * @returns {HTMLLinkElement}
 */
export function externalStyle(path) {
	return tag({
		tagName: "link",
		attributes: {
			"rel": "stylesheet",
			"href": path,
		},
	});
}

/**
 * @param {string} innerHtml
 * @returns {HTMLTemplateElement}
 */
export function createTemplate(innerHtml) {
	const template = document.createElement("template");
	template.innerHTML = innerHtml;
	return template;
}

/**
 * @param {HTMLTemplateElement} template
 * @returns {Node}
 */
export function templateContent(template) {
	return document.importNode(template.content, true);
}

export function toArray(value) {
	return Array.isArray(value) ? value : [value];
}

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

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
