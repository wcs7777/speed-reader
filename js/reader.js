import {
	$$,
	byId,
	form2object,
	populateForm
} from "./utils/dom.js";

const reader = byId("speed-reader");
const read = byId("read");
const text = byId("text");
const settingsForm = byId("settings");
read.addEventListener("click", () => {
	const toggle = !reader.isPaused;
	reader.isPaused = toggle;
	read.blur();
});
reader.addEventListener("speed-reader-paused", (e) => {
	read.textContent = e.detail.paused ? "Read" : "Pause";
});
for (const modal of $$('[is=custom-modal]')) {
	let isPaused = true;
	modal.addEventListener("modal-opened", () => {
		isPaused = reader.isPaused;
		reader.isPaused = true;
	});
	modal.addEventListener("modal-closed", () => {
		reader.isPaused = isPaused;
	});
}
byId("clear-text").addEventListener("click", (e) => {
	e.preventDefault();
	text.value = "";
	text.focus();
});
byId("paste-text").addEventListener("click", async (e) => {
	try {
		e.preventDefault();
		text.value = await navigator.clipboard.readText();
		text.focus();
	} catch (error) {
		console.error(error);
	}
});
byId("new-text").addEventListener("submit", (e) => {
	e.preventDefault();
	reader.text = form2object(e.target).text;
});
byId("open-settings").addEventListener("click", () => {
	populateForm(settingsForm, reader.settings);
});
settingsForm.addEventListener("submit", (e) => {
	e.preventDefault();
	reader.settings = form2object(e.target);
});
