// Terraform zips this prepared folder; its paths must match the Lambda handler setting.
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../build"
  output_path = "${path.module}/build/task-api.zip"
}
