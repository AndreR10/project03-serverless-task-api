locals {

  project = "task-api"

  environment = "dev"

  lambda_name = aws_lambda_function.task_handler.function_name

  api_name = aws_api_gateway_rest_api.task_api.name

  table_name = aws_dynamodb_table.tasks.name


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