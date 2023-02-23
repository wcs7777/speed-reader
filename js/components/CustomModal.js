import { $$, tag } from "../utils/dom.js";

const attrs = {
	name: "data-custom-modal",
	opener: "data-custom-modal-opener",
	closer: "data-custom-modal-closer",
};

export class CustomModal extends HTMLDialogElement {

	constructor() {
		super();
		this._isModalOpen = false;
		this.classList.add("modal");
	}

	connectedCallback() {
		this.setup();
	}

	setup() {
		const open = this.open.bind(this);
		const close = this.close.bind(this);
		for (const opener of $$(`[${attrs.opener}="${this.name}"]`)) {
			opener.addEventListener('click', open);
		}
		for (const closer of $$(`[${attrs.closer}="${this.name}"]`)) {
			closer.addEventListener('click', close);
		}
		this.addEventListener("click", (e) => {
			if (this.isModalOpen && e.target === e.currentTarget) {
				this.close();
			}
		});
	}

	static get attrs() {
		return attrs;
	}

	get name() {
		return this.getAttribute(attrs.name);
	}

	/**
	 * @returns {boolean}
	 */
	get isModalOpen() {
		return this._isModalOpen;
	}

	/**
	 * @param {boolean} open
	 */
	set isModalOpen(open) {
		if (open != this.isModalOpen) {
			open ? this.open() : this.close();
		}
	}

	open() {
		this.showModal();
		this._isModalOpen = true;
		this.dispatchEvent(new CustomEvent("modal-opened"));
	}

	close() {
		super.close();
		this._isModalOpen = false;
		this.dispatchEvent(new CustomEvent("modal-closed"));
	}

}

export function buildCustomModal(name, modalBody) {
	return tag({
		tagName: "dialog",
		is: "custom-modal",
		attributes: {
			[attrs.name]: name,
		},
		children: modalBody,
	});
}

customElements.define("custom-modal", CustomModal, { extends: "dialog" });
