resource "aws_iam_role" "lambda_role" {

  name = "${local.project}-${local.environment}-lambda-role"


  assume_role_policy = jsonencode({

    Version = "2012-10-17"

    Statement = [

      {

        Effect = "Allow"

        Principal = {

          Service = "lambda.amazonaws.com"

        }

        Action = "sts:AssumeRole"

      }

    ]

  })


  tags = local.tags

}


resource "aws_iam_policy" "dynamodb_policy" {

  name = "${local.project}-${local.environment}-dynamodb-policy"
  policy = jsonencode({

    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan"
        ]
        Resource = "*"
      }

    ]

  })

}


resource "aws_iam_role_policy_attachment" "dynamodb_attach" {

  role = aws_iam_role.lambda_role.name

  policy_arn = aws_iam_policy.dynamodb_policy.arn

}

resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {

  role = aws_iam_role.lambda_role.name


  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

}