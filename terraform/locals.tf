locals {

  project = "task-api"

  environment = "dev"

  tags = {

    Project     = local.project
    Environment = local.environment
    ManagedBy   = "Terraform"

  }

  tasks_methods = toset([
    "GET",
    "POST"
  ])

  task_id_methods = toset([
    "GET",
    "PUT",
    "DELETE"
  ])

}