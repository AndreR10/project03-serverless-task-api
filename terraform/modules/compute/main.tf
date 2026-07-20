resource "aws_cloudwatch_log_group" "lambda" {
  count             = var.manage_log_group ? 1 : 0
  name              = "/aws/lambda/${var.project}-${var.environment}-handler"
  retention_in_days = 14
  tags              = var.tags
}

resource "aws_lambda_function" "task_api" {
  function_name    = "${var.project}-${var.environment}-handler"
  role             = var.iam_role_arn
  runtime          = var.lambda_runtime
  handler          = var.lambda_handler
  filename         = var.lambda_artifact_path
  source_code_hash = var.lambda_artifact_hash
  memory_size      = var.lambda_memory_size
  timeout          = var.lambda_timeout
  architectures    = var.lambda_architectures

  environment {
    variables = {
      TABLE_NAME               = var.table_name
      LOG_LEVEL_PARAMETER      = var.lambda_log_level_parameter
      DEFAULT_STATUS_PARAMETER = var.default_status_parameter
      ENVIRONMENT              = var.environment
    }
  }

  tags = var.tags
}

