#!/usr/bin/env node

const yargs = require("yargs")
	.option("dest", {
		type: "string",
		description: "Target directory",
		demandOption: true,
	})
	.option("src", {
		type: "string",
		description: "Source directory",
		demandOption: true,
	})
	.argv;

const lib = require("../index");

(async () => {
	try {
		await lib.process(yargs.src, yargs.dest);
	}catch(e) {
		console.error(e);
	}
})();

