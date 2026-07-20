resource "aws_api_gateway_rest_api" "task_api" {
  name        = "${var.project}-${var.environment}-api"
  description = "Serverless Task Management API"
  tags        = var.tags
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

resource "aws_api_gateway_method" "collection" {
  for_each      = var.collection_methods
  rest_api_id   = aws_api_gateway_rest_api.task_api.id
  resource_id   = aws_api_gateway_resource.tasks.id
  http_method   = each.value
  authorization = var.api_authorization
}

resource "aws_api_gateway_method" "item" {
  for_each      = var.item_methods
  rest_api_id   = aws_api_gateway_rest_api.task_api.id
  resource_id   = aws_api_gateway_resource.task_id.id
  http_method   = each.value
  authorization = var.api_authorization
}

resource "aws_api_gateway_integration" "collection" {
  for_each                = aws_api_gateway_method.collection
  rest_api_id             = aws_api_gateway_rest_api.task_api.id
  resource_id             = aws_api_gateway_resource.tasks.id
  http_method             = each.value.http_method
  integration_http_method = var.api_integration_http_method
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn
}

resource "aws_api_gateway_integration" "item" {
  for_each                = aws_api_gateway_method.item
  rest_api_id             = aws_api_gateway_rest_api.task_api.id
  resource_id             = aws_api_gateway_resource.task_id.id
  http_method             = each.value.http_method
  integration_http_method = var.api_integration_http_method
  type                    = "AWS_PROXY"
  uri                     = var.lambda_invoke_arn
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.task_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "task_api" {
  rest_api_id = aws_api_gateway_rest_api.task_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_method.collection,
      aws_api_gateway_method.item,
      aws_api_gateway_integration.collection,
      aws_api_gateway_integration.item
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.collection,
    aws_api_gateway_integration.item
  ]
}

resource "aws_api_gateway_stage" "dev" {
  stage_name    = var.environment
  rest_api_id   = aws_api_gateway_rest_api.task_api.id
  deployment_id = aws_api_gateway_deployment.task_api.id
  tags          = var.tags
}

