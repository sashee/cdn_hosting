const fs = require("fs").promises;
const cheerio = require("cheerio");
const parseDataURL = require("data-urls");
const mime = require("mime-types");
const crypto = require("crypto");
const https = require("https");
const url = require("url");
const path = require("path");
const parseSrcset = require("parse-srcset");
const aws = require("aws-sdk");

const s3 = new aws.S3();

const hash = (x) => crypto.createHash("sha256").update(x).digest("hex");

const s3FileExists = (bucket) => async (filename) => {
	try {
		await s3.headObject({Bucket: bucket, Key: filename}).promise();
		return true;
	}catch(e) {
		if (e.code === "NotFound") {
			return false;
		}else {
			throw e;
		}
	}
};

const uploadToS3 = (bucket) => async (filename, file) => {
	const upload = new aws.S3.ManagedUpload({
		params: {
			Bucket: bucket,
			Key: filename,
			Body: file,
			ContentType: mime.lookup(filename),
		}
	});

	await upload.promise();
};

const processImg = (cfUrl, bucket) => async (filename, img) => {
	if (!await s3FileExists(bucket)(filename)) {
		await uploadToS3(bucket)(filename, img);
	}

	return `https://${cfUrl}/${filename}`;
};

const processSrc = (cfUrl, bucket) => (file) => async (src) => {
	if (src.startsWith("data:")) {
		const dataURL = parseDataURL(src);
		const extension = "." + mime.extension(dataURL.mimeType.toString());
		const filename = `${hash(dataURL.body)}${extension}`;
		return await processImg(cfUrl, bucket)(filename, dataURL.body);
	}else if (url.parse(src).host === null) {
		const imgFile = await fs.readFile(`${path.dirname(file)}${path.sep}${src}`);
		const extension = path.extname(src);
		const filename = `${hash(imgFile)}${extension}`;
		return await processImg(cfUrl, bucket)(filename, imgFile);
	}else {
		return src;
	}
};

exports.process = async (cwd, files, dest) => {
	console.log(cwd);
	console.log(files);
	console.log(dest);
	const {outputs: {bucket: {value: bucket}, url: {value: cfUrl}}} = JSON.parse(await fs.readFile(`${cwd}/terraform.tfstate`, "utf8"));
	console.log(bucket);
	console.log(cfUrl);

	await Promise.all(files.map(async (file) => {
		const processSrcForFile = processSrc(cfUrl, bucket)(file);
		const $ = cheerio.load(await fs.readFile(file, "utf8"));
		await Promise.all($("img").toArray().map(async (e) => {
			const img = $(e);
			if (img.attr("src") !== undefined) {
				const src = img.attr("src");
				const imgUrl = await processSrcForFile(src);
				img.attr("src", imgUrl);
			}
			if (img.attr("srcset") !== undefined) {
				const parsed = parseSrcset(img.attr("srcset"));
				const newsrcset = (await Promise.all(parsed.map(async ({url, d, w, h}) => {
					const imgUrl = await processSrcForFile(url);
					return [imgUrl, d !== undefined ? `${d}x` : undefined, w !== undefined ? `${w}w` : undefined, h !== undefined ? `${h}h` : undefined].filter((e) => e !== undefined).join(" ");
				}))).join(",");
				img.attr("srcset", newsrcset);
			}
		}));
		await Promise.all($("picture > source").toArray().map(async (e) => {
			const source = $(e);
			if (source.attr("srcset") !== undefined) {
				const parsed = parseSrcset(source.attr("srcset"));
				const newsrcset = (await Promise.all(parsed.map(async ({url, d, w, h}) => {
					const imgUrl = await processSrcForFile(url);
					return [imgUrl, d !== undefined ? `${d}x` : undefined, w !== undefined ? `${w}w` : undefined, h !== undefined ? `${h}h` : undefined].filter((e) => e !== undefined).join(" ");
				}))).join(",");
				source.attr("srcset", newsrcset);
			}

		}));
		console.log($.html());
	}));
};