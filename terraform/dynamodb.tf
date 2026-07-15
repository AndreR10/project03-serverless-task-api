resource "aws_dynamodb_table" "tasks" {

  name         = "${local.project}-${local.environment}-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"


  attribute {
    name = "id"
    type = "S"
  }


  tags = local.tags

}