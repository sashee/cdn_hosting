#!/usr/bin/env node

const yargs = require("yargs")
	.option("dest", {
		type: "string",
		description: "Target directory",
		demandOption: true,
	})
	.argv;

const lib = require("../index");

const cwd = process.cwd();

(async () => {
	await lib.process(cwd, yargs._, yargs.dest);
})();

