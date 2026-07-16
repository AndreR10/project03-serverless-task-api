locals {

  lambda_widgets = [

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
            local.lambda_name
          ]
        ]
      }
    },

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
            local.lambda_name
          ]
        ]
      }
    },

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
            local.lambda_name
          ]
        ]
      }
    },

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
            local.lambda_name
          ]
        ]
      }
    }

  ]

}