import { CustomModal } from "./components/CustomModal.js";
import { SpeedReader } from "./components/SpeedReader.js";
import { $$, byId } from "./utils/dom.js";

const reader = byId("speed-reader");
const read = byId("read");

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
