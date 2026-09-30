##############################################
#
# Serverless Task Management API
#
# Terraform Root Module
#
##############################################

module "api" {
  source = "./modules/api"

  project                     = var.project_name
  environment                 = var.environment
  api_authorization           = var.api_authorization
  api_integration_http_method = var.api_integration_http_method
  collection_methods          = toset(var.tasks_methods)
  item_methods                = toset(var.task_id_methods)
  lambda_invoke_arn           = module.compute.invoke_arn
  lambda_function_name        = module.compute.function_name
  tags                        = local.tags
}

module "compute" {
  source = "./modules/compute"

  project                    = var.project_name
  environment                = var.environment
  lambda_runtime             = var.lambda_runtime
  lambda_handler             = var.lambda_handler
  lambda_memory_size         = var.lambda_memory_size
  lambda_timeout             = var.lambda_timeout
  lambda_architectures       = var.lambda_architectures
  lambda_log_level_parameter = module.parameter_store.parameter_store_log_level_name
  default_status_parameter   = module.parameter_store.parameter_store_default_status_name
  table_name                 = module.dynamodb.table_name
  iam_role_arn               = module.security.iam_role_arn
  lambda_artifact_path       = data.archive_file.lambda_zip.output_path
  lambda_artifact_hash       = data.archive_file.lambda_zip.output_base64sha256
  tags                       = local.tags
}

module "security" {
  source = "./modules/security"

  project              = var.project_name
  environment          = var.environment
  table_arn            = module.dynamodb.table_arn
  parameter_store_arns = module.parameter_store.parameter_store_arns
  tags                 = local.tags
}

module "s3" {
  source = "./modules/s3"

  project     = var.project_name
  environment = var.environment
  tags        = local.tags
}

module "dynamodb" {
  source = "./modules/dynamodb"

  project      = var.project_name
  environment  = var.environment
  billing_mode = var.dynamodb_billing_mode
  tags         = local.tags
}

module "monitoring" {
  source = "./modules/monitoring"

  project     = var.project_name
  environment = var.environment
  region      = var.region
  alert_email = var.alert_email
  api_name    = module.api.api_name
  lambda_name = module.compute.function_name
  table_name  = module.dynamodb.table_name
  tags        = local.tags
}

module "parameter_store" {
  source = "./modules/parameter-store"

  project          = var.project_name
  environment      = var.environment
  lambda_log_level = var.lambda_log_level

  tags = local.tags
}