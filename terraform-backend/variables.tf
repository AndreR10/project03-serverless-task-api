// Bootstrap inputs for choosing the state bucket's name prefix and AWS region.
variable "region" {
  description = "AWS Region"
  type        = string
  default     = "eu-west-1"
}

variable "project" {
  description = "Name of the project"
  type        = string
  default     = "task-api"
}