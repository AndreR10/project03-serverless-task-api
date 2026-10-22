// Shared Terraform state is stored in S3; this bucket must exist before terraform init.
terraform {
  backend "s3" {
    bucket = "task-api-terraform-state-bucket"
    key    = "task-api/dev/terraform.tfstate"
    region = "eu-west-1"
  }
}