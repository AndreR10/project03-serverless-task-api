data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../app/src"
  output_path = "${path.module}/build/task-api.zip"
}
