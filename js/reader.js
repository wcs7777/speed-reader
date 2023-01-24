import SpeedReader from "./SpeedReader.js";
import { $, $$, byId } from "./utils.js";

document.addEventListener("DOMContentLoaded", main);

function main() {
	const content = $(".content");
	const inputText = byId("input-text");
	const read = byId("read");
	inputText.value = inputText.value.trim();
	read.addEventListener("click", (e) => {
		e.preventDefault();
		$$(".speed-reader", content).forEach((speedReader) => {
			speedReader.remove();
		});
		buildSpeedReader(inputText.value, 300, 5)
			.catch(console.error);
		inputText.classList.add("hide");
	});
}

async function buildSpeedReader(text, wordsPerMinute=300, wordsPerChunk=5) {
	const speedReader = SpeedReader.build(text, wordsPerMinute, wordsPerChunk);
	$(".content").appendChild(speedReader);
	await speedReader.startSpeedReading();
}

/*
https://accelareader.com/
words per minute
words per chunk
font size
font family
line height
background color
highlight color
font color
alignment
slight pause
*/
