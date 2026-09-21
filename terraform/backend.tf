terraform {
  backend "s3" {
    bucket = "task-api-terraform-state-bucket"
    key    = "task-api/dev/terraform.tfstate"
    region = "eu-west-1"
  }
}