variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "api_authorization" {
  description = "Authorization type for API Gateway methods"
  type        = string
  default     = "NONE"
}

variable "api_integration_http_method" {
  description = "HTTP method used for API Gateway integrations"
  type        = string
  default     = "POST"
}

variable "collection_methods" {
  description = "HTTP methods for the collection resource"
  type        = set(string)
  default     = ["GET", "POST"]
}

variable "item_methods" {
  description = "HTTP methods for the item resource"
  type        = set(string)
  default     = ["GET", "PUT", "DELETE"]
}

variable "lambda_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  type        = string
}

variable "lambda_function_name" {
  description = "Name of the Lambda function to allow API Gateway to invoke"
  type        = string
}

variable "tags" {
  description = "Tags to apply to created resources"
  type        = map(string)
  default     = {}
}
