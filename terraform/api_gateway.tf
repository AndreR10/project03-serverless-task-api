resource "aws_api_gateway_rest_api" "task_api" {

  name        = "${local.project}-${local.environment}-api"
  description = "Serverless Task Management API"
  tags        = local.tags

}

resource "aws_api_gateway_resource" "v1" {
  rest_api_id = aws_api_gateway_rest_api.task_api.id
  parent_id   = aws_api_gateway_rest_api.task_api.root_resource_id
  path_part   = "v1"

}

resource "aws_api_gateway_resource" "tasks" {

  rest_api_id = aws_api_gateway_rest_api.task_api.id
  parent_id   = aws_api_gateway_resource.v1.id
  path_part   = "tasks"

}

resource "aws_api_gateway_resource" "task_id" {

  rest_api_id = aws_api_gateway_rest_api.task_api.id
  parent_id   = aws_api_gateway_resource.tasks.id
  path_part   = "{id}"

}


resource "aws_api_gateway_method" "tasks" {

  for_each      = local.tasks_methods
  rest_api_id   = aws_api_gateway_rest_api.task_api.id
  resource_id   = aws_api_gateway_resource.tasks.id
  http_method   = each.value
  authorization = "NONE"

}

resource "aws_api_gateway_method" "task_id" {

  for_each      = local.task_id_methods
  rest_api_id   = aws_api_gateway_rest_api.task_api.id
  resource_id   = aws_api_gateway_resource.task_id.id
  http_method   = each.value
  authorization = "NONE"

}

resource "aws_api_gateway_integration" "tasks" {

  for_each                = aws_api_gateway_method.tasks
  rest_api_id             = aws_api_gateway_rest_api.task_api.id
  resource_id             = aws_api_gateway_resource.tasks.id
  http_method             = each.value.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.task_handler.invoke_arn

}


resource "aws_api_gateway_integration" "task_id" {

  for_each                = aws_api_gateway_method.task_id
  rest_api_id             = aws_api_gateway_rest_api.task_api.id
  resource_id             = aws_api_gateway_resource.task_id.id
  http_method             = each.value.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.task_handler.invoke_arn

}

resource "aws_lambda_permission" "api_gateway" {

  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.task_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.task_api.execution_arn}/*/*"

}

resource "aws_api_gateway_deployment" "task_api" {

  rest_api_id = aws_api_gateway_rest_api.task_api.id
  depends_on = [
    aws_api_gateway_integration.tasks,
    aws_api_gateway_integration.task_id
  ]

}

resource "aws_api_gateway_stage" "dev" {

  stage_name    = local.environment
  rest_api_id   = aws_api_gateway_rest_api.task_api.id
  deployment_id = aws_api_gateway_deployment.task_api.id
  tags          = local.tags

}