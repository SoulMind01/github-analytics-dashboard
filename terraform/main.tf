provider "aws" {
  region = "us-west-1"
}

resource "aws_s3_bucket_public_access_block" "allow_public_access" {
  bucket = "githubanalyticsdashboard"

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_object" "index" {
  bucket       = "githubanalyticsdashboard"
  key          = "index.html"
  source       = "${path.module}/../index.html"
  content_type = "text/html"
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = "githubanalyticsdashboard"

  depends_on = [
    aws_s3_bucket_public_access_block.allow_public_access
  ]

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid       = "PublicReadGetObject",
      Effect    = "Allow",
      Principal = "*",
      Action    = "s3:GetObject",
      Resource  = "${aws_s3_bucket.website_bucket.arn}/*"
    }]
  })
}


