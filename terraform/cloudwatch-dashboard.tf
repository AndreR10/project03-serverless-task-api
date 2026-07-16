resource "aws_cloudwatch_dashboard" "task_api" {

  dashboard_name = "${local.project}-${local.environment}"

  dashboard_body = jsonencode({

    widgets = concat(

      local.lambda_widgets,

      local.api_gateway_widgets,

      local.dynamodb_widgets

    )

  })

}