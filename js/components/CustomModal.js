import { $$, createTemplate, tag, templateContent } from "../utils/dom.js";

const attrs = {
	name: "data-custom-modal",
	opener: "data-custom-modal-opener",
	closer: "data-custom-modal-closer",
};
const cssVariables = {
	modalBackdropZIndex: "--custom-modal-backdrop-z-index",
	modalBackdropBackgroundColor: "--custom-modal-backdrop-background-color",
	modalBodyZIndex: "--custom-modal-body-z-index",
};
const defaultName = "custom-modal-default-name";
const template = createTemplate(`
<style>
	:host {
		display: none;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	:host(.is-open) {
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 1;
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: var(
			${cssVariables.modalBackdropZIndex},
			800
		);
		background-color: var(
			${cssVariables.modalBackdropBackgroundColor},
			rgba(0, 0, 0, .5)
		);
	}

	::slotted(*) {
		z-index: var(
			${cssVariables.modalBodyZIndex},
			900
		);
		overflow: auto;
	}
</style>
<div class="modal-backdrop" ${attrs.closer}="${defaultName}"></div>
<slot></slot>
`);

export class CustomModal extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		const name = this.name ?? defaultName;
		this.shadowRoot.appendChild(templateContent(template));
		for (const opener of this.openers(this.shadowRoot, defaultName)) {
			opener.setAttribute(attrs.opener, name);
		}
		for (const closer of this.closers(this.shadowRoot, defaultName)) {
			closer.setAttribute(attrs.closer, name);
		}
		this.setAttribute(attrs.name, name);
	}

	static get attrs() {
		return attrs;
	}

	static get cssVariables() {
		return cssVariables;
	}

	static get observedAttributes() {
		return Object.values(attrs);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === attrs.name && oldValue !== newValue) {
			this.name = newValue;
		}
	}

	get name() {
		return this.getAttribute(attrs.name);
	}

	set name(newName) {
		const openers = [...this.openers(), ...this.openers(this.shadowRoot)];
		const closers = [...this.closers(), ...this.closers(this.shadowRoot)];
		for (const opener of openers) {
			opener.setAttribute(attrs.opener, newName);
		}
		for (const closer of closers) {
			closer.setAttribute(attrs.closer, newName);
		}
		this.setAttribute(attrs.name, newName);
		this.listenOpeners();
		this.listenClosers();
	}

	open() {
		this.classList.add("is-open");
		this.dispatchEvent(new CustomEvent("modal-opened"));
	}

	close() {
		this.classList.remove("is-open");
		this.dispatchEvent(new CustomEvent("modal-closed"));
	}

	openers(target=document, name=this.name) {
		return $$(`[${attrs.opener}="${name}"]`, target);
	}

	closers(target=document, name=this.name) {
		return $$(`[${attrs.closer}="${name}"]`, target);
	}

	listenOpeners() {
		const openers = [...this.openers(), ...this.openers(this.shadowRoot)];
		const open = this.open.bind(this);
		for (const opener of openers) {
			opener.removeEventListener("click", open);
			opener.addEventListener("click", open);
		}
	}

	listenClosers() {
		const closers = [...this.closers(), ...this.closers(this.shadowRoot)];
		const close = this.close.bind(this);
		for (const closer of closers) {
			closer.removeEventListener("click", close);
			closer.addEventListener("click", close);
		}
	}

}

export function buildCustomModal(name, modalBody) {
	return tag({
		tagName: "custom-modal",
		attributes: {
			[attrs.name]: name,
		},
		children: modalBody,
	});
}

customElements.define("custom-modal", CustomModal);
