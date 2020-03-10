resource "aws_s3_bucket" "bucket" {
  force_destroy = true
}

resource "aws_s3_bucket_policy" "OAI_policy" {
  bucket = aws_s3_bucket.bucket.id
  policy = data.aws_iam_policy_document.s3_policy.json
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.OAI.iam_arn]
    }
  }
}

resource "aws_cloudfront_origin_access_identity" "OAI" {
}

resource "aws_cloudfront_distribution" "distribution" {
  origin {
    domain_name = aws_s3_bucket.bucket.bucket_regional_domain_name
    origin_id   = "s3"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.OAI.cloudfront_access_identity_path
    }
  }

  enabled             = true
	is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "https-only"
		compress = true
    min_ttl                = 31536000
    default_ttl            = 31536000
    max_ttl                = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

data "aws_iam_policy_document" "permissions" {
	statement {
		sid = "GetObject"
		actions = [
			"s3:GetObject"
		]
		resources = [
			"${aws_s3_bucket.bucket.arn}/*"
		]
	}
	statement {
		sid = "ListBucket"
		actions = [
			"s3:ListBucket"
		]
		resources = [
			aws_s3_bucket.bucket.arn
		]
	}
	statement {
		sid = "PutObject"
		actions = [
			"s3:PutObject"
		]
		resources = [
			"${aws_s3_bucket.bucket.arn}/*"
		]
	}
}

