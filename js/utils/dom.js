import { toArray } from "./mixed.js";

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
	if (is) {
		element.setAttribute("is", is);
	}
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
		element.append(...children);
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
