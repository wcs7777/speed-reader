export default [
	{
		input: "js/reader.js",
		output: {
			file: "bundle.js",
			format: "iife",
		},
	},
];

// https://rollupjs.org/guide/en/#configuration-files
// npx rollup --config --bundleConfigAsCjs rollup.config.js