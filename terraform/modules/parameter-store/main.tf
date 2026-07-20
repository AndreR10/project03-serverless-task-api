resource "aws_ssm_parameter" "log_level" {

  name  = "/${var.project}/${var.environment}/log-level"
  type  = "String"
  value = var.lambda_log_level
  tags  = var.tags
}

resource "aws_ssm_parameter" "default_status" {
  name  = "/${var.project}/${var.environment}/default-status"
  type  = "String"
  value = "PENDING"

  tags = var.tags
}