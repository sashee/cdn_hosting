provider "aws" {
	region = "eu-west-1"
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

