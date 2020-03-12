## usage

* create main.tf using the module:

```
provider "aws" {
}

module "cdn_hosting" {
	source = "github.com/sashee/cdn_hosting"
}

output "bucket" {
	value = module.cdn_hosting.bucket
}

output "url" {
	value = module.cdn_hosting.url
}
```

* ```terraform init```, ```terraform apply```
* process the htmls (```tfDir <dir>``` if the terraform.tfstate is in a different directory):

```
npx github:sashee/cdn_hosting --src input --dest dist
```

* the processed HTML files in the dist directory

### Use programmatically

* ```npm i github:sashee/cdn_hosting```

```
const {processHtml} = require("cdn_hosting");

const tfDir = process.cwd();
const html = "...";
const baseDir = "..."; // where relative images are

const withImagesOnCdn = await (await processHtml(tfDir))(html, baseDir);
```

### Supported image replace places

* img > src
* img > srcset
* picture > img
* picture > source

supports:

* relative URL
* data URI
