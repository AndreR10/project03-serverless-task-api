variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "alert_email" {
  description = "Email address for SNS notifications"
  type        = string
}

variable "api_name" {
  description = "API Gateway name"
  type        = string
}

variable "lambda_name" {
  description = "Lambda function name"
  type        = string
}

variable "table_name" {
  description = "DynamoDB table name"
  type        = string
}

variable "tags" {
  description = "Tags to apply to created resources"
  type        = map(string)
  default     = {}
}
