import { CustomModal } from "./components/CustomModal.js";
import { SpeedReader } from "./components/SpeedReader.js";
import { kebab2camel } from "./utils/alphanumeric.js";
import defaultSettings from "./utils/defaultSettings.js";
import {
	$,
	$$,
	byId,
	form2object,
	populateForm
} from "./utils/dom.js";
import { createOnKeydown, EventsManager } from "./utils/events.js";
import memoryStorage from "./utils/memoryStorage.js";
import storageAvailable from "./utils/storageAvailable.js";

const storage = (
	storageAvailable("localStorage") ? localStorage : memoryStorage
);
const wpmChangeRate = 10;
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
			keys: "t",
			caseSensitive: false,
			listener: () => speedReader.paragraph.alignChunkTextToTop(),
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
			listener: () => toggleControls.click(),
		}),
	],
	on: true,
});
initializeSettings(speedReader, ui);
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

/**
 * @returns {SpeedReader}
 */
function getSpeedReader() {
	return byId("speed-reader");
}

/**
 * @returns {CustomModal[]}
 */
function getCustomModals() {
	return $$('[is=custom-modal]');
}

function initializeSettings(speedReader, ui) {
	const settings = (
		JSON.parse(storage.getItem("settings")) ?? defaultSettings
	);
	speedReader.settings = settings;
	setUiStyles(ui, settings);
}

function getUiStyles(ui) {
	const style = getComputedStyle(ui);
	return {
		uiBackgroundColor: style.getPropertyValue("--ui-background-color"),
		uiTextColor: style.getPropertyValue("--ui-text-color"),
	};
}

function setUiStyles(ui, settings) {
	for (const property of ["ui-background-color", "ui-text-color"]) {
		ui.style.setProperty(`--${property}`, settings[kebab2camel(property)]);
	}
}
