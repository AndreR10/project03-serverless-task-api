resource "aws_dynamodb_table" "tasks" {
  name         = "${var.project}-${var.environment}-table"
  billing_mode = var.billing_mode
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [
      billing_mode,
      tags
    ]
  }
}

