output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.task_api.function_name
}

output "invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.task_api.invoke_arn
}
