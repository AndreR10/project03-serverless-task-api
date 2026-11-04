data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.project}-${var.environment}-${data.aws_caller_identity.current.account_id}-frontend"
  force_destroy = true
  tags          = var.tags
}

// Website hosting needs public object reads. Keep ACL-based public access blocked.
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

// Let visitors read website files, but do not grant listing or upload permissions.
data "aws_iam_policy_document" "frontend_bucket" {
  statement {
    sid    = "AllowPublicWebsiteReadOnly"
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket.json

  // S3 rejects a public-read policy until this bucket's BlockPublicPolicy flag is disabled.
  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

resource "aws_s3_object" "frontend_assets" {
  for_each = {
    "index.html" = "text/html"
    "app.js"     = "application/javascript"
  }

  bucket        = aws_s3_bucket.frontend.id
  key           = each.key
  source        = "${path.module}/../../../web/${each.key}"
  etag          = filemd5("${path.module}/../../../web/${each.key}")
  content_type  = each.value
  cache_control = "no-cache"
}

resource "aws_s3_object" "frontend_config" {
  bucket        = aws_s3_bucket.frontend.id
  key           = "config.js"
  content       = templatefile("${path.module}/../../../web/config.js.tftpl", { api_base_url = var.api_base_url })
  content_type  = "application/javascript"
  cache_control = "no-store"
}
