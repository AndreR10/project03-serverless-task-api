output "dynamodb_table_name" {
  value = aws_dynamodb_table.tasks.name
}


output "dynamodb_table_arn" {
  value = aws_dynamodb_table.tasks.arn
}

output "api_url" {
  value = "${aws_api_gateway_stage.dev.invoke_url}/v1/tasks"
}

output "api_base_url" {
  value = aws_api_gateway_stage.dev.invoke_url
}

output "lambda_name" {
  value = aws_lambda_function.task_handler.function_name
}