locals {

  dynamodb_widgets = [

    {
      type   = "metric"
      x      = 0
      y      = 24
      width  = 12
      height = 6

      properties = {
        title  = "DynamoDB Read Capacity"
        view   = "timeSeries"
        stat   = "Sum"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/DynamoDB",
            "ConsumedReadCapacityUnits",
            "TableName",
            local.table_name
          ]
        ]
      }
    },

    {
      type   = "metric"
      x      = 12
      y      = 24
      width  = 12
      height = 6

      properties = {
        title  = "DynamoDB Write Capacity"
        view   = "timeSeries"
        stat   = "Sum"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/DynamoDB",
            "ConsumedWriteCapacityUnits",
            "TableName",
            local.table_name
          ]
        ]
      }
    },

    {
      type   = "metric"
      x      = 0
      y      = 30
      width  = 12
      height = 6

      properties = {
        title  = "DynamoDB Successful Request Latency"
        view   = "timeSeries"
        stat   = "Average"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/DynamoDB",
            "SuccessfulRequestLatency",
            "TableName",
            local.table_name
          ]
        ]
      }
    },

    {
      type   = "metric"
      x      = 12
      y      = 30
      width  = 12
      height = 6

      properties = {
        title  = "DynamoDB Throttled Requests"
        view   = "timeSeries"
        stat   = "Sum"
        period = 300
        region = var.region

        metrics = [
          [
            "AWS/DynamoDB",
            "ThrottledRequests",
            "TableName",
            local.table_name
          ]
        ]
      }
    }

  ]

}