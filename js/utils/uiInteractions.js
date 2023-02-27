import { CustomModal } from "../components/CustomModal.js";
import { SpeedReader } from "../components/SpeedReader.js";
import { kebab2camel } from "./alphanumeric.js";
import defaultSettings from "./defaultSettings.js";
import { $$, byId } from "./dom.js";
import memoryStorage from "./memoryStorage.js";

/**
 * @returns {SpeedReader}
 */
export function getSpeedReader() {
	return byId("speed-reader");
}

/**
 * @returns {CustomModal[]}
 */
export function getCustomModals() {
	return $$('[is=custom-modal]');
}

/**
 * @param {SpeedReader} speedReader
 * @param {HTMLElement} ui
 * @param {localStorage|memoryStorage} storage
 * @param {defaultSettings} defaultSettings
 */
export function initializeSettings(
	speedReader, ui, storage, defaultSettings
) {
	const settings = (
		JSON.parse(storage.getItem("settings")) ?? defaultSettings
	);
	speedReader.settings = settings;
	setUiStyles(ui, settings);
}

/**
 * @param {HTMLElement} ui
 * @returns {{uiBackgroundColor: string; uiTextColor: string}}
 */
export function getUiStyles(ui) {
	const style = getComputedStyle(ui);
	return {
		uiBackgroundColor: style.getPropertyValue("--ui-background-color"),
		uiTextColor: style.getPropertyValue("--ui-text-color"),
	};
}

/**
 * @param {HTMLElement} ui
 * @param {{uiBackgroundColor: string; uiTextColor: string}} settings
 */
export function setUiStyles(ui, settings) {
	for (const property of ["ui-background-color", "ui-text-color"]) {
		ui.style.setProperty(`--${property}`, settings[kebab2camel(property)]);
	}
}
