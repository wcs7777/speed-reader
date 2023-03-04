import { SpeedReader } from "../components/SpeedReader.js";
import { createOnKeydown, EventsManager } from "./events.js";

const wpmChangeRate = 10;

/**
 * @param {SpeedReader} speedReader
 * @param {HTMLButtonElement} openNewText
 * @param {HTMLButtonElement} openSettings
 * @param {HTMLButtonElement} toggleControls
 * @returns {EventsManager}
 */
export default function createshortcutsEventsManager(
	speedReader, openNewText, openSettings, toggleControls
) {
	return new EventsManager({
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
				keys: [" ", "k", "Enter"],
				caseSensitive: false,
				listener: () => speedReader.isPaused = !speedReader.isPaused,
			}),
			createOnKeydown({
				keys: ["ArrowUp", "=", "["],
				listener: () => speedReader.wordsPerMinute += wpmChangeRate,
			}),
			createOnKeydown({
				keys: ["ArrowDown", "-", "]"],
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
				listener: () => speedReader.paragraph?.alignChunkTextToTop(),
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
}
