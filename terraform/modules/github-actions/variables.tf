variable "project" {
  description = "Project name used for resource naming."
  type        = string
}

variable "environment" {
  description = "Environment name used for resource naming."
  type        = string
}

variable "aws_region" {
  description = "AWS region used for resource ARN construction."
  type        = string
  default     = "eu-west-1"
}

variable "tags" {
  description = "Tags applied to the GitHub OIDC provider and deployment role."
  type        = map(string)
  default     = {}
}

variable "github_owner" {
  description = "GitHub repository owner name."
  type        = string
}

variable "github_owner_id" {
  description = "Immutable GitHub owner ID."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository name."
  type        = string
}

variable "github_repository_id" {
  description = "Immutable GitHub repository ID."
  type        = string
}

variable "github_branch" {
  description = "Git branch allowed to assume the deployment role."
  type        = string
  default     = "main"
}

variable "role_name" {
  description = "Name of the IAM role used by GitHub Actions."
  type        = string
  default     = "github-actions-task-api-deploy"
}

variable "terraform_state_bucket" {
  description = "Terraform remote state bucket name."
  type        = string
  default     = "task-api-terraform-state-bucket"
}

variable "lambda_artifacts_bucket_name" {
  description = "Bucket used to store Lambda deployment artifacts."
  type        = string
  default     = "task-api-dev-lambda-artifacts"
}

variable "lambda_function_name" {
  description = "Name of the Lambda function created by the Terraform deployment."
  type        = string
  default     = "task-api-dev-handler"
}

variable "lambda_log_group_name" {
  description = "CloudWatch log group name used by the Lambda function."
  type        = string
  default     = "/aws/lambda/task-api-dev-handler"
}

variable "api_gateway_execution_arn" {
  description = "API Gateway execution ARN used for Lambda permissions."
  type        = string
  default     = ""
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table managed by Terraform."
  type        = string
  default     = ""
}

variable "ssm_parameter_arns" {
  description = "ARNs of the SSM parameters used by the application."
  type        = list(string)
  default     = []
}