output "parameter_store_log_level_name" {
  description = "Name of the Lambda function"
  value       = aws_ssm_parameter.log_level.name
}

output "parameter_store_default_status_name" {
  description = "Name of the Lambda function"
  value       = aws_ssm_parameter.default_status.name
}

output "parameter_store_arns" {
  description = "ARNs of the SSM parameters used by the application"
  value = [
    aws_ssm_parameter.log_level.arn,
    aws_ssm_parameter.default_status.arn
  ]
}