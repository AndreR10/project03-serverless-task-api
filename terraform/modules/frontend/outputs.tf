output "url" {
  description = "HTTP website endpoint for the static frontend."
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "bucket_arn" {
  description = "ARN of the public-read frontend bucket."
  value       = aws_s3_bucket.frontend.arn
}

output "objects_arn" {
  description = "ARN pattern for files in the frontend bucket."
  value       = "${aws_s3_bucket.frontend.arn}/*"
}
