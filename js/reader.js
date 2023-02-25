import { SpeedReader } from "./components/SpeedReader.js";
import {
	$$,
	byId,
	form2object,
	populateForm
} from "./utils/dom.js";
import { createOnKeydown, EventsManager } from "./utils/events.js";

const wpmChangeRate = 10;
const speedReader = getSpeedReader();
const read = byId("read");
const text = byId("text");
const settingsForm = byId("settings");
const openNewText = byId("open-new-text");
const openSettings = byId("open-settings");
const controls = byId("controls");
const totalWords = byId("total-words");
const currentWpm = byId("current-wpm");
const shortcutsManager = new EventsManager({
	target: document,
	type: "keydown",
	listeners: [
		createOnKeydown({
			keys: ["ArrowLeft", "h"],
			caseSensitive: false,
			listener: () => speedReader.toPreviousChunkText(),
		}),
		createOnKeydown({
			keys: ["ArrowRight", "l"],
			caseSensitive: false,
			listener: () => speedReader.toNextChunkText(),
		}),
		createOnKeydown({
			keys: [" ", "k"],
			caseSensitive: false,
			listener: () => speedReader.isPaused = !speedReader.isPaused,
		}),
		createOnKeydown({
			keys: ["ArrowUp", "="],
			listener: () => speedReader.wordsPerMinute += wpmChangeRate,
		}),
		createOnKeydown({
			keys: ["ArrowDown", "-"],
			listener: () => speedReader.wordsPerMinute -= wpmChangeRate,
		}),
		createOnKeydown({
			keys: "r",
			caseSensitive: false,
			listener: () => speedReader.rewindParagraphs(),
		}),
		createOnKeydown({
			keys: "n",
			caseSensitive: false,
			listener: () => openNewText.click(),
		}),
		createOnKeydown({
			keys: "s",
			caseSensitive: false,
			listener: () => openSettings.click(),
		}),
		createOnKeydown({
			keys: "c",
			caseSensitive: false,
			listener: () => {
				controls.classList.toggle("hide");
				console.log("toggle controls visibility");
			},
		}),
	],
	on: true,
});
totalWords.textContent = speedReader.totalWords ?? 0;
currentWpm.textContent = speedReader.wordsPerMinute;
read.addEventListener("click", () => {
	const toggle = !speedReader.isPaused;
	speedReader.isPaused = toggle;
	read.blur();
});
speedReader.addEventListener("speed-reader-paused", (e) => {
	read.textContent = e.detail.paused ? "Read" : "Pause";
});
speedReader.addEventListener("words-per-minute-changed", (e) => {
	currentWpm.textContent = e.detail.wordsPerMinute;
});
for (const modal of $$('[is=custom-modal]')) {
	let isPaused = true;
	modal.addEventListener("modal-opened", () => {
		isPaused = speedReader.isPaused;
		speedReader.isPaused = true;
		shortcutsManager.off();
	});
	modal.addEventListener("modal-closed", () => {
		speedReader.isPaused = isPaused;
		shortcutsManager.on();
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
	if (text.value.trim().length > 0) {
		speedReader.text = text.value;
		totalWords.textContent = speedReader.totalWords;
	}
});
openSettings.addEventListener("click", () => {
	populateForm(settingsForm, speedReader.settings);
});
settingsForm.addEventListener("submit", (e) => {
	e.preventDefault();
	speedReader.settings = form2object(e.target);
});

/**
 * @returns {SpeedReader}
 */
function getSpeedReader() {
	return byId("speed-reader");
}
