variable "project" {
  description = "Project name used to name frontend resources."
  type        = string
}

variable "environment" {
  description = "Environment name used to name frontend resources."
  type        = string
}

variable "api_base_url" {
  description = "API Gateway stage URL injected into the static frontend."
  type        = string
}

variable "tags" {
  description = "Tags applied to frontend AWS resources."
  type        = map(string)
  default     = {}
}
