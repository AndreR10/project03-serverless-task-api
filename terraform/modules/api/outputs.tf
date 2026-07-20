output "rest_api_id" {
  description = "ID of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.task_api.id
}

output "api_name" {
  description = "Name of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.task_api.name
}

output "execution_arn" {
  description = "Execution ARN of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.task_api.execution_arn
}

output "stage_url" {
  description = "Invoke URL of the API Gateway stage"
  value       = aws_api_gateway_stage.dev.invoke_url
}
