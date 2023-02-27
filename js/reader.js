import {
	$,
	byId,
	form2object,
	populateForm
} from "./utils/dom.js";
import memoryStorage from "./utils/memoryStorage.js";
import {
	getCustomModals,
	getSpeedReader,
	getUiStyles,
	initializeSettings,
	setUiStyles
} from "./utils/uiInteractions.js";
import createshortcutsEventsManager from "./utils/shortcutsEventsManager.js";
import storageAvailable from "./utils/storageAvailable.js";
import defaultSettings from "./utils/defaultSettings.js";

const storage = (
	storageAvailable("localStorage") ? localStorage : memoryStorage
);
const ui = $(".content");
const speedReader = getSpeedReader();
const read = byId("read");
const text = byId("text");
const settingsForm = byId("settings");
const openNewText = byId("open-new-text");
const openSettings = byId("open-settings");
const toggleControls = byId("toggle-controls");
const totalWords = byId("total-words");
const currentWpm = byId("current-wpm");
const shortcuts = createshortcutsEventsManager(
	speedReader, openNewText, openSettings, toggleControls
);
initializeSettings(speedReader, ui, storage, defaultSettings);
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
for (const modal of getCustomModals()) {
	let isPaused = true;
	modal.addEventListener("modal-opened", () => {
		isPaused = speedReader.isPaused;
		speedReader.isPaused = true;
		shortcuts.off();
	});
	modal.addEventListener("modal-closed", () => {
		speedReader.isPaused = isPaused;
		shortcuts.on();
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
		if (navigator?.clipboard?.readText) {
			text.value = await navigator.clipboard.readText();
			text.focus();
		}
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
byId("reset").addEventListener("click", (e) => {
	e.preventDefault();
	speedReader.rewindParagraphs();
});
openSettings.addEventListener("click", () => {
	populateForm(
		settingsForm,
		{
			...speedReader.settings,
			...getUiStyles(ui),
		},
	);
});
settingsForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const settings = form2object(e.target);
	speedReader.settings = settings;
	setUiStyles(ui, settings);
	storage.setItem("settings", JSON.stringify(settings));
});
