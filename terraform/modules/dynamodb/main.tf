// Store tasks in one table; each task's id is its unique partition key.
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
    // Terraform will not overwrite later edits to these two settings.
    ignore_changes = [
      billing_mode,
      tags
    ]
  }
}

