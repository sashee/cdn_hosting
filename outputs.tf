output "url" {
  value = aws_cloudfront_distribution.distribution.domain_name
}

output "bucket" {
	value = aws_s3_bucket.bucket.id
}

output "permissions" {
	value = data.aws_iam_policy_document.permissions
}

