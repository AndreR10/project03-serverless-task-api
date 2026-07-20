variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "lambda_runtime" {
  description = "Runtime for the Lambda function"
  type        = string
  default     = "nodejs24.x"
}

variable "lambda_handler" {
  description = "Handler entry point"
  type        = string
  default     = "src/handlers/taskHandler.handler"
}

variable "lambda_memory_size" {
  description = "Lambda memory size"
  type        = number
  default     = 128
}

variable "lambda_timeout" {
  description = "Lambda timeout"
  type        = number
  default     = 10
}

variable "lambda_architectures" {
  description = "Lambda architectures"
  type        = list(string)
  default     = ["x86_64"]
}

variable "lambda_log_level_parameter" {
  description = "Parameter name for the Lambda log level"
  type        = string
  default     = "log_level"
}

variable "default_status_parameter" {
  description = "Parameter name for the default task status"
  type        = string
  default     = "default_status"
}

variable "table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "iam_role_arn" {
  description = "IAM role ARN for the Lambda function"
  type        = string
}

variable "lambda_artifact_path" {
  description = "Path to the Lambda deployment artifact"
  type        = string
}

variable "lambda_artifact_hash" {
  description = "Base64 SHA256 hash of the Lambda artifact"
  type        = string
}

variable "tags" {
  description = "Tags to apply to created resources"
  type        = map(string)
  default     = {}
}

variable "manage_log_group" {
  description = "Whether to manage the Lambda CloudWatch log group explicitly"
  type        = bool
  default     = false
}
