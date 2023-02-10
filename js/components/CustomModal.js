import { $$, createTemplate, templateContent } from "../utils/dom.js";

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
			z-index: 800;
			background-color: rgba(0, 0, 0, .5);
		}

		::slotted(*) {
			z-index: 900;
			overflow: auto;
		}
	</style>
	<div class="modal-backdrop" data-modal-closer="modal"></div>
	<slot></slot>
`);

export default class CustomModal extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		const defaultName = "modal";
		const name = this.name ?? defaultName;
		this.shadowRoot.appendChild(templateContent(template));
		for (const opener of this.openers(this.shadowRoot, defaultName)) {
			opener.dataset.modalOpener = name;
		}
		for (const closer of this.closers(this.shadowRoot, defaultName)) {
			closer.dataset.modalCloser = name;
		}
		this.dataset.modal = name;
	}

	static get observedAttributes() {
		return ["data-modal"];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "data-modal") {
			if (oldValue !== newValue) {
				this.name = newValue;
			}
		}
	}

	get name() {
		return this.dataset.modal;
	}

	set name(newName) {
		const openers = [...this.openers(), ...this.openers(this.shadowRoot)];
		const closers = [...this.closers(), ...this.closers(this.shadowRoot)];
		for (const opener of openers) {
			opener.dataset.modalOpener = newName;
		}
		for (const closer of closers) {
			closer.dataset.modalCloser = newName;
		}
		this.dataset.modal = newName;
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
		return $$(`[data-modal-opener="${name}"]`, target);
	}

	closers(target=document, name=this.name) {
		return $$(`[data-modal-closer="${name}"]`, target);
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

customElements.define("custom-modal", CustomModal);
