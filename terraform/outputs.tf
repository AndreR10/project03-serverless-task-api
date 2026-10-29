// Deployment results, such as the API URL and role ARN, can be read with terraform output.
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

output "frontend_url" {
  description = "URL of the task dashboard served by API Gateway and Lambda."
  value       = "${module.api.stage_url}/ui/index.html"
}

output "lambda_name" {
  value = module.compute.function_name
}

output "sns_topic_arn" {
  description = "SNS Topic ARN"
  value       = module.monitoring.sns_topic_arn
}

output "github_actions_role_arn" {
  description = "ARN of the IAM role assumed by GitHub Actions through OIDC."
  value       = module.github_actions.role_arn
}

output "github_actions_role_name" {
  description = "Name of the IAM role assumed by GitHub Actions through OIDC."
  value       = module.github_actions.role_name
}

output "github_actions_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider registered in AWS IAM."
  value       = module.github_actions.oidc_provider_arn
}