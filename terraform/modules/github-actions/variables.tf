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