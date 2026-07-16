resource "aws_cloudwatch_dashboard" "task_api" {
  dashboard_name = "${local.project}-${local.environment}"

  dashboard_body = jsonencode({
    widgets = [

      # Lambda Invocations

      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          title  = "Lambda Invocations"
          view   = "timeSeries"
          region = var.region
          stat   = "Sum"
          period = 300

          metrics = [
            [
              "AWS/Lambda",
              "Invocations",
              "FunctionName",
              aws_lambda_function.task_handler.function_name
            ]
          ]
        }
      },

      # Lambda Errors

      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          title  = "Lambda Errors"
          view   = "timeSeries"
          region = var.region
          stat   = "Sum"
          period = 300

          metrics = [
            [
              "AWS/Lambda",
              "Errors",
              "FunctionName",
              aws_lambda_function.task_handler.function_name
            ]
          ]
        }
      },

      # Lambda Duration

      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          title  = "Lambda Duration"
          view   = "timeSeries"
          region = var.region
          stat   = "Average"
          period = 300

          metrics = [
            [
              "AWS/Lambda",
              "Duration",
              "FunctionName",
              aws_lambda_function.task_handler.function_name
            ]
          ]
        }
      },

      # Lambda Throttles

      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          title  = "Lambda Throttles"
          view   = "timeSeries"
          region = var.region
          stat   = "Sum"
          period = 300

          metrics = [
            [
              "AWS/Lambda",
              "Throttles",
              "FunctionName",
              aws_lambda_function.task_handler.function_name
            ]
          ]
        }
      }

    ]
  })
}