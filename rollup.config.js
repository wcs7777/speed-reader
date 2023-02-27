export default [
	{
		input: "js/app.js",
		output: {
			file: "bundle.js",
			format: "iife",
		},
	},
];

// https://rollupjs.org/guide/en/#configuration-files
// npx rollup --config --bundleConfigAsCjs rollup.config.js