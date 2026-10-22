

// The AWS provider uses the active local profile or the short-lived GitHub OIDC credentials.
provider "aws" {
  region = var.region
  default_tags {
    tags = local.tags
  }

}