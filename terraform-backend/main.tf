// Create this remote state bucket before initializing the main Terraform configuration.
provider "aws" {
  region = var.region
}

resource "aws_s3_bucket" "terraform_state" {
  // S3 bucket names are global; change the project prefix if this name is already taken.
  bucket = "${var.project}-terraform-state-bucket"

  tags = {
    Project   = var.project
    ManagedBy = "Terraform"
    Purpose   = "Terraform Remote State"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  // Versioning makes earlier state-file versions recoverable after accidental changes.
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  // Encrypt the Terraform state file while it is stored in S3.
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}