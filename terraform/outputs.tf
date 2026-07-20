output "dynamodb_table_name" {
  value = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
  value = module.dynamodb.table_arn
}

output "api_url" {
  value = "${module.api.stage_url}/v1/tasks"
}

output "api_base_url" {
  value = module.api.stage_url
}

output "lambda_name" {
  value = module.compute.function_name
}

output "sns_topic_arn" {
  description = "SNS Topic ARN"
  value       = module.monitoring.sns_topic_arn
}