provider "aws" {
	region = "eu-west-1"
}

module "cdn_hosting" {
	source = "github.com/sashee/cdn_hosting"
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "trust_current_account" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = [data.aws_caller_identity.current.account_id]
    }
  }
}

resource "aws_iam_role" "role" {
  assume_role_policy = data.aws_iam_policy_document.trust_current_account.json
}

resource "aws_iam_role_policy" "add_permissions" {
  role = aws_iam_role.role.id

  policy = module.cdn_hosting.permissions.json
}

output "bucket" {
	value = module.cdn_hosting.bucket
}

output "url" {
	value = module.cdn_hosting.url
}

output "role" {
	value = aws_iam_role.role.arn
}
