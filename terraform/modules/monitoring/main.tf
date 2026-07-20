resource "aws_sns_topic" "alerts" {
  name = "${var.project}-${var.environment}-alerts"
  tags = var.tags
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project}-${var.environment}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Lambda function has errors."
  treat_missing_data  = "notBreaching"
  dimensions = {
    FunctionName = var.lambda_name
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
  tags          = var.tags
}

resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project}-${var.environment}-api-5xx-errors"
  alarm_description   = "API Gateway is returning server errors."
  namespace           = "AWS/ApiGateway"
  metric_name         = "5XXError"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  dimensions = {
    ApiName = var.api_name
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
  tags          = var.tags
}

resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${var.project}-${var.environment}-api-latency"
  alarm_description   = "API latency exceeds 2 seconds."
  namespace           = "AWS/ApiGateway"
  metric_name         = "Latency"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 1
  threshold           = 2000
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions = {
    ApiName = var.api_name
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
  tags          = var.tags
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "${var.project}-${var.environment}-dynamodb-throttles"
  alarm_description   = "DynamoDB is experiencing throttling."
  namespace           = "AWS/DynamoDB"
  metric_name         = "ThrottledRequests"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions = {
    TableName = var.table_name
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
  tags          = var.tags
}

resource "aws_cloudwatch_dashboard" "task_api" {
  dashboard_name = "${var.project}-${var.environment}"
  dashboard_body = jsonencode({
    widgets = concat(
      local.lambda_widgets,
      local.api_gateway_widgets,
      local.dynamodb_widgets
    )
  })
}

locals {
  lambda_widgets = [
    {
      type   = "metric"
      x      = 0
      y      = 0
      width  = 12
      height = 6
      properties = {
        title   = "Lambda Invocations"
        view    = "timeSeries"
        region  = var.region
        stat    = "Sum"
        period  = 300
        metrics = [["AWS/Lambda", "Invocations", "FunctionName", var.lambda_name]]
      }
    }
  ]

  api_gateway_widgets = [
    {
      type   = "metric"
      x      = 0
      y      = 12
      width  = 12
      height = 6
      properties = {
        title   = "API Requests"
        view    = "timeSeries"
        stat    = "Sum"
        period  = 300
        region  = var.region
        metrics = [["AWS/ApiGateway", "Count", "ApiName", var.api_name]]
      }
    }
  ]

  dynamodb_widgets = [
    {
      type   = "metric"
      x      = 0
      y      = 18
      width  = 12
      height = 6
      properties = {
        title   = "DynamoDB Throttled Requests"
        view    = "timeSeries"
        stat    = "Sum"
        period  = 300
        region  = var.region
        metrics = [["AWS/DynamoDB", "ThrottledRequests", "TableName", var.table_name]]
      }
    }
  ]
}

