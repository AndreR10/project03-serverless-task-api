variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "table_arn" {
  description = "ARN of the DynamoDB table"
  type        = string
}

variable "parameter_store_arns" {
  description = "ARNs of the SSM parameters the Lambda role can access"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to created resources"
  type        = map(string)
  default     = {}
}
