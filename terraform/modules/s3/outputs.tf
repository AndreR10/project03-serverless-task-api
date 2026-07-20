output "bucket_name" {
  description = "Name of the S3 bucket used for Lambda artifacts"
  value       = aws_s3_bucket.lambda_artifacts.bucket
}
