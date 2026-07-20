locals {
  project     = var.project_name
  environment = var.environment

  lambda_name = module.compute.function_name
  api_name    = module.api.api_name
  table_name  = module.dynamodb.table_name

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Andre Ramos"
  }

  tasks_methods   = toset(var.tasks_methods)
  task_id_methods = toset(var.task_id_methods)

  collection_methods = toset([
    "GET",
    "POST"
  ])

  item_methods = toset([
    "GET",
    "PUT",
    "DELETE"
  ])
}