// The compute and deployment modules use this name to locate the bucket.
output "bucket_name" {
  description = "Name of the S3 bucket used for Lambda artifacts"
  value       = aws_s3_bucket.lambda_artifacts.bucket
}
