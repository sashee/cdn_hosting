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
	.option("tfDir", {
		type: "string",
		description: "Terraform state directory",
		default: process.cwd(),
	})
	.argv;

const lib = require("../index");

(async () => {
	try {
		await lib.processDir(yargs.src, yargs.dest, yargs.tfDir);
	}catch(e) {
		console.error(e);
	}
})();

