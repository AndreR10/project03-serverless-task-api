/* resource "null_resource" "build_lambda" {

  triggers = {
    package_json = filemd5("${path.module}/../app/package.json")
    handler      = filemd5("${path.module}/../app/src/handlers/taskHandler.js")
  }

  provisioner "local-exec" {
    command = "bash ${path.module}/../scripts/build.sh"
  }

} */


data "archive_file" "lambda_zip" {

  type        = "zip"
  source_dir  = "${path.module}/../build"
  output_path = "${path.module}/task-api.zip"
  /*  depends_on = [
    null_resource.build_lambda
  ] */

}

resource "aws_lambda_function" "task_handler" {

  function_name    = "${local.project}-${local.environment}-handler"
  role             = aws_iam_role.lambda_role.arn
  runtime          = "nodejs24.x"
  handler          = "src/handlers/taskHandler.handler"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  memory_size      = 128
  timeout          = 10

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.tasks.name
    }
  }

  /*   depends_on = [
    null_resource.build_lambda
  ] */

  tags = local.tags

}

