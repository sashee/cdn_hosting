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

* terraform init, terraform apply
* process the htmls (must be executed from the same directory as the terraform state file):

```
npx github:sashee/cdn_hosting --src input --dest dist
```

* the processed HTML files in the dist directory
