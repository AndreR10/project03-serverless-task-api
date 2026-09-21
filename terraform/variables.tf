
variable "region" {
  description = "AWS Region"
  type        = string
  default     = "eu-west-1"
}

variable "alert_email" {
  description = "Email address for CloudWatch alarms"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "task-api"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "tasks_methods" {
  description = "HTTP methods allowed for the tasks resource"
  type        = list(string)
  default     = ["GET", "POST"]
}

variable "task_id_methods" {
  description = "HTTP methods allowed for the task-id resource"
  type        = list(string)
  default     = ["GET", "PUT", "DELETE"]
}

variable "api_authorization" {
  description = "Authorization type for API Gateway methods"
  type        = string
  default     = "NONE"
}

variable "api_integration_http_method" {
  description = "HTTP method used by API Gateway integrations"
  type        = string
  default     = "POST"
}

variable "lambda_runtime" {
  description = "Runtime for the Lambda function"
  type        = string
  default     = "nodejs24.x"
}

variable "lambda_handler" {
  description = "Handler entry point for the Lambda function"
  type        = string
  default     = "src/handlers/taskHandler.handler"
}

variable "lambda_memory_size" {
  description = "Memory size for the Lambda function in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Timeout for the Lambda function in seconds"
  type        = number
  default     = 10
}

variable "lambda_architectures" {
  description = "Architectures supported by the Lambda function"
  type        = list(string)
  default     = ["x86_64"]
}

variable "lambda_log_level" {
  description = "Log level for the Lambda function"
  type        = string
}

variable "dynamodb_billing_mode" {
  description = "Billing mode for the DynamoDB table"
  type        = string
  default     = "PAY_PER_REQUEST"
}