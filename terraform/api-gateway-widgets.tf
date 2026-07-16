locals {

  api_gateway_widgets = [

    {
      type   = "metric"
      x      = 0
      y      = 12
      width  = 12
      height = 6

      properties = {
        title  = "API Requests"
        view   = "timeSeries"
        stat   = "Sum"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/ApiGateway",
            "Count",
            "ApiName",
            local.api_name
          ]
        ]
      }
    },

    {
      type   = "metric"
      x      = 12
      y      = 12
      width  = 12
      height = 6

      properties = {
        title  = "API 4XX / 5XX Errors"
        view   = "timeSeries"
        stat   = "Sum"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/ApiGateway",
            "4XXError",
            "ApiName",
            local.api_name
          ],
          [
            ".",
            "5XXError",
            ".",
            "."
          ]
        ]
      }
    },

    {
      type   = "metric"
      x      = 0
      y      = 18
      width  = 12
      height = 6

      properties = {
        title  = "API Latency"
        view   = "timeSeries"
        stat   = "Average"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/ApiGateway",
            "Latency",
            "ApiName",
            local.api_name
          ]
        ]
      }
    },

    {
      type   = "metric"
      x      = 12
      y      = 18
      width  = 12
      height = 6

      properties = {
        title  = "API Integration Latency"
        view   = "timeSeries"
        stat   = "Average"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/ApiGateway",
            "IntegrationLatency",
            "ApiName",
            local.api_name
          ]
        ]
      }
    }

  ]

}